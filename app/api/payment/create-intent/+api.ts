import { getStripe } from '@/lib/server/stripe.server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  console.log('💰 Creating payment intent...');
  
  try {
    const body = await request.json();
    const { amount, userId, churchId, paymentMethodId, notes } = body;
    
    console.log('📦 Request:', { amount, userId, churchId, paymentMethodId });
    
    const stripe = getStripe();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user's stripe customer ID
    console.log('👤 Fetching user...');
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
    
    if (!authUser) {
      throw new Error('User not found');
    }

    const stripeCustomerId = authUser.user_metadata?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      throw new Error('No Stripe customer ID found. Please add a payment method first.');
    }

    // Create payment intent
    console.log('💳 Creating payment intent for $', amount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirm the payment
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        userId,
        churchId: churchId || '',
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);
    console.log('💾 Saving to tithes table...');

    // Record the tithe in your database
    const { data: insertData, error: insertError } = await supabase
      .from('tithes')
      .insert({
        user_id: userId,
        church_id: churchId,
        amount: amount,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error saving tithe:', insertError);
      throw insertError;
    }

    console.log('✅ Tithe saved:', insertData);
    console.log('🎉 Payment successful!');
    
    return Response.json({ 
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      tithe: insertData
    });
    
  } catch (err: any) {
    console.error('💥 Payment error:', err);
    return Response.json({ 
      success: false, 
      error: err?.message ?? 'Unknown error' 
    }, { status: 400 });
  }
}
