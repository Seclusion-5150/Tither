import { getStripe } from '@/lib/server/stripe.server';

export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8081',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

type Body = {
  customerId: string;
  paymentMethodId: string;
};

export async function PUT(req: Request) {
  try {
    const { customerId, paymentMethodId } = (await req.json()) as Body;
    const stripe = getStripe();

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Set default payment method error:', err);
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
