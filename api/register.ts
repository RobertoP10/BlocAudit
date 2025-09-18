export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, password, full_name, company_name, address, phone } =
      await req.json();

    const supabaseRes = await fetch(
      "https://zjguegunedvuogqoiwzg.supabase.co/functions/v1/create-company-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email,
          password,
          full_name,
          company_name,
          address,
          phone,
        }),
      }
    );

    const data = await supabaseRes.json();

    return new Response(JSON.stringify(data), {
      status: supabaseRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
