import { getStripe } from '@/lib/server/stripe.server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  
  try {
    const body = await request.json();
    
    const { userId, paymentMethodId, setAsDefault } = body;
    
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser) {
      throw new Error('User not found');
    }

    // Check if user has stripe_customer_id in metadata or user_metadata
    let stripeCustomerId = authUser.user_metadata?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...authUser.user_metadata,
          stripe_customer_id: stripeCustomerId
        }
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (setAsDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    const insertData = {
      user_id: userId,
      stripe_payment_method_id: paymentMethodId,
      stripe_customer_id: stripeCustomerId,
      card_brand: paymentMethod.card?.brand,
      card_last4: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year,
      is_default: setAsDefault,
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('payment_methods')
      .insert(insertData);

    if (insertError) {
      throw insertError;
    }

    return Response.json({ success: true });
    
  } catch (err: any) {
    return Response.json({ 
      success: false, 
      error: err?.message ?? 'Unknown error' 
    }, { status: 400 });
  }
}
