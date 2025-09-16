// supabase/functions/send-notification/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();

    const to = body.to as string;
    const subject = body.subject as string;
    const message = body.message as string;

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
      throw new Error(`SendGrid error: ${errText}`);
    }

    return new Response("Email sent successfully", { status: 200 });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

Deno.serve(handler);
