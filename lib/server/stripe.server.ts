// A server-only module that creates and exports your Stripe Node SDK instance
// using the secret key from env. Only Next.js API routes (or other server code) should import this.
import Stripe from 'stripe';

// Lazily initialize Stripe to avoid throwing at module import time.
// This prevents bundlers or tooling that scan/import files from failing
// when the env var is not available (for example when running Expo dev).
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
	if (stripeInstance) return stripeInstance;
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
		// cast options to any to avoid strict literal type mismatch from stripe types
		stripeInstance = new Stripe(key, { apiVersion: '2024-06-20' } as any);
	return stripeInstance;
}