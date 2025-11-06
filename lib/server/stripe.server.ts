// A server-only module that creates and exports your Stripe Node SDK instance
// using the secret key from env. Only Next.js API routes (or other server code) should import this.
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error('STRIPE_SECRET_KEY is not set');


export const stripe = new Stripe(key, { apiVersion: '2024-06-20' });