// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  try {
    const { plan, company_name } = await req.json();
    const chosenPlan = (plan || "basic").toLowerCase(); // fallback dacă nu a ales nimic

    // ID-ul de preț din Stripe (setează-le în .env)
    const priceId = Deno.env.get(`STRIPE_PRICE_${chosenPlan.toUpperCase()}`);
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Creează sesiunea de checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${Deno.env.get("FRONTEND_URL")}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("FRONTEND_URL")}/pricing`,

      // 🔑 Metadata care ajunge în webhook
      metadata: {
        plan: chosenPlan,
        company_name: company_name || "Companie nouă",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
