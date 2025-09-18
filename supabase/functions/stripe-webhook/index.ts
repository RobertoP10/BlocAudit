import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const handler = async (req: Request) => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig!, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = session.customer as string;
        const subId = session.subscription as string;
        const email = session.customer_details?.email!;
        const fullName = session.customer_details?.name || "Admin User";

        // Plan fallback
        let plan = (session.metadata?.plan || "basic").toLowerCase();

        // Limite pe plan
        const limits: Record<string, { requests: number; users: number }> = {
          basic: { requests: 1000, users: 50 },
          premium: { requests: 5000, users: 200 },
          enterprise: { requests: 10000, users: 500 },
          "enterprise+": { requests: 20000, users: 1000 },
        };
        const { requests, users } = limits[plan] || limits["basic"];

        // Creează compania
        const { data: newCompany, error: companyError } = await sb
          .from("companies")
          .insert({
            name: session.metadata?.company_name || "Companie nouă",
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            subscription_plan: plan,
            request_limit: requests,
            user_limit: users,
          })
          .select()
          .single();

        if (companyError) throw companyError;
        const companyId = newCompany.id;

        // Creează user în Auth
        const { data: authUser, error: authError } = await sb.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { full_name: fullName },
        });
        if (authError || !authUser.user) throw authError;

        // Creează Admin în app_users
        const { error: userError } = await sb.from("app_users").insert({
          id: authUser.user.id,
          company_id: companyId,
          role: "admin",
          full_name: fullName,
        });
        if (userError) throw userError;

        // Log
        await sb.from("subscription_logs").insert({
          company_id: companyId,
          event_type: "checkout.session.completed",
          details: JSON.stringify(event), // 🔑 stringify
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const plan = (sub.items.data[0]?.price?.nickname || "basic").toLowerCase();

        const { data: company } = await sb.from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (company) {
          await sb.from("companies").update({
            subscription_plan: plan,
            stripe_subscription_id: sub.id,
          }).eq("id", company.id);

          await sb.from("subscription_logs").insert({
            company_id: company.id,
            event_type: event.type,
            details: JSON.stringify(event),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: company } = await sb.from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (company) {
          await sb.from("subscription_logs").insert({
            company_id: company.id,
            event_type: "invoice.payment_failed",
            details: JSON.stringify(event),
          });
        }
        break;
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(`error: ${e.message}`, { status: 500 });
  }
};

Deno.serve(handler);
