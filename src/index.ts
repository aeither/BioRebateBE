// server.ts
import { Hono } from 'hono';
import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/create-checkout-session', async (c) => {
  const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const { items } = await c.req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: [item.image]
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${new URL(c.req.url).origin}/success`,
      cancel_url: `${new URL(c.req.url).origin}/cancel`,
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['FR', 'MC']
      }
    });

    return c.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Cloudflare Workers export
export default app;
