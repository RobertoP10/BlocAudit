// supabase/functions/send-notification/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export const handler = async (req: Request) => {
  try {
    const body = await req.json();
    const { to, subject, message, company_id } = body;

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing to/subject/message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Config SMTP (din .env)
    const smtpClient = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST")!,      // ex: mail.hubdevnest.com
        port: Number(Deno.env.get("SMTP_PORT")!), // ex: 465
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER")!,   // ex: contact@hubdevnest.com
          password: Deno.env.get("SMTP_PASS")!,   // parola reală
        },
      },
    });

    // 🔹 Trimitem emailul
    await smtpClient.send({
      from: `${Deno.env.get("SMTP_FROM_NAME") || "HubDevNest"} <${Deno.env.get("SMTP_FROM_EMAIL")}>`,
      to,
      subject,
      content: message,
    });

    await smtpClient.close();

    // 🔹 Logăm în Supabase
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

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SMTP error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

Deno.serve(handler);
