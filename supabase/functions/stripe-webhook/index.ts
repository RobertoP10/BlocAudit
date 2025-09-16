// supabase/functions/stripe-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

export const handler = async (req: Request): Promise<Response> => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig!, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return new Response(
      `Webhook signature verification failed: ${err.message}`,
      { status: 400 }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subId = session.subscription as string;
        const plan = (session.metadata?.plan || "basic").toLowerCase();

        let companyId: string;
        const { data: company } = await sb
          .from("companies")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!company) {
          const { data: newCompany, error } = await sb
            .from("companies")
            .insert({
              name: session.metadata?.company_name || "Companie nouă",
              stripe_customer_id: customerId,
              stripe_subscription_id: subId,
              subscription_plan: plan,
            })
            .select()
            .single();
          if (error) throw error;
          companyId = newCompany.id;

          const adminUserId = session.metadata?.supabase_user_id;
          if (adminUserId) {
            await sb.from("app_users").insert({
              id: adminUserId,
              company_id: companyId,
              role: "admin",
              full_name: session.customer_details?.name || null,
            });
          }
        } else {
          companyId = company.id;
          await sb
            .from("companies")
            .update({
              stripe_subscription_id: subId,
              subscription_plan: plan,
            })
            .eq("id", companyId);
        }

        await sb.from("subscription_logs").insert({
          company_id: companyId,
          event_type: "checkout.session.completed",
          details: event as any,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const plan = (sub.items.data[0]?.price?.nickname || "basic").toLowerCase();

        const { data: company } = await sb
          .from("companies")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (company) {
          await sb
            .from("companies")
            .update({
              subscription_plan: plan,
              stripe_subscription_id: sub.id,
            })
            .eq("id", company.id);

          await sb.from("subscription_logs").insert({
            company_id: company.id,
            event_type: event.type,
            details: event as any,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: company } = await sb
          .from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (company) {
          await sb.from("subscription_logs").insert({
            company_id: company.id,
            event_type: "invoice.payment_failed",
            details: event as any,
          });
        }
        break;
      }

      default: {
        // 🔹 logăm evenimente necunoscute
        await sb.from("subscription_logs").insert({
          company_id: null,
          event_type: `unhandled:${event.type}`,
          details: event as any,
        });
        break;
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    // 🔹 logăm erorile
    await sb.from("subscription_logs").insert({
      company_id: null,
      event_type: "stripe-webhook-error",
      details: { message: e.message, stack: e.stack, event },
    });

    return new Response(`error: ${e.message}`, { status: 500 });
  }
};

Deno.serve(handler);
