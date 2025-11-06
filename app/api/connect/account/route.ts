// app/api/connect/account/route.ts
// import 'server-only';
export const runtime = 'nodejs';

import { stripe } from '@/lib/server/stripe.server';


// Permissive CORS for dev
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8081', // or 'http://localhost:8081' if you prefer
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}


type Body = {
  accountId?: string;   // optional: reuse an existing account
  refreshUrl?: string;  // optional override
  returnUrl?: string;   // optional override
};

export async function POST(req: Request) {
  try {
    const { accountId: maybeAccountId, refreshUrl, returnUrl } = (await req.json()) as Body;

    // 1) Create or reuse account
    const accountId =
      maybeAccountId ??
      (await stripe.accounts.create({ type: 'express' })).id;

    // 2) Build required redirect URLs
    // In web: these can be full HTTPS URLs to your site.
    // In mobile (Expo), use a deep link (e.g., exp:// or yourapp://) or a web fallback.
    const BASE_RETURN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const refresh_url = refreshUrl ?? `${BASE_RETURN}/onboarding/refresh?account=${accountId}`;
    const return_url  = returnUrl  ?? `${BASE_RETURN}/onboarding/return?account=${accountId}`;

    // 3) Create onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url,
      return_url,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({ accountId, url: link.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('Stripe onboarding error:', err);
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
}
