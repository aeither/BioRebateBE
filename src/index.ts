import { Hono } from 'hono';
import Stripe from 'stripe';
import { cors } from 'hono/cors';

interface Env {
  STRIPE_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*', // Allow all origins in development. In production, specify your frontend domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.post('/create-checkout-session', async (c) => {
  const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const { items, success_url, cancel_url } = await c.req.json();

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
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url, // Use provided URLs
      cancel_url,  // Use provided URLs
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['FR', 'MC']
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return c.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default app;
