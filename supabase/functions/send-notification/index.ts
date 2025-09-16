// supabase/functions/send-notification/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export const handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();

    const to = body.to as string;
    const subject = body.subject as string;
    const message = body.message as string;
    const company_id = body.company_id as string | undefined;

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL");

    if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
      return new Response("Missing SendGrid config", { status: 500 });
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_FROM_EMAIL },
        subject,
        content: [{ type: "text/plain", value: message }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();

      // 🔹 logăm eșecul
      if (company_id) {
        await supabase.from("subscription_logs").insert({
          company_id,
          event_type: "notification-error",
          details: { to, subject, error: errText },
        });

        await supabase.from("notifications").insert({
          company_id,
          message: `Email failed to ${to}: ${subject}`,
          type: "email",
          severity: "error",
          created_at: new Date().toISOString(),
        });
      }

      throw new Error(`SendGrid error: ${errText}`);
    }

    // 🔹 logăm succesul
    if (company_id) {
      await supabase.from("subscription_logs").insert({
        company_id,
        event_type: "notification-sent",
        details: { to, subject, message },
      });

      await supabase.from("notifications").insert({
        company_id,
        message: `Email sent to ${to}: ${subject}`,
        type: "email",
        severity: "info",
        created_at: new Date().toISOString(),
      });
    }

    return new Response("Email sent successfully", { status: 200 });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

Deno.serve(handler);
