import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ message: "Method not allowed." }, 405);
  try {
    const authorization = req.headers.get("Authorization") || "";
    const authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await authClient.auth.getUser();
    if (authError || !auth.user) return json({ message: "Please log in again." }, 401);
    const body = await req.json();
    if (!Array.isArray(body.sites) || !body.sites.length) return json({ message: "Select at least one site." }, 400);
    if (!body.agreementAccepted || !body.agreementSignature) return json({ message: "A signed agreement is required." }, 400);
    if (!body.websiteDevelopmentPurchaseConfirmed) return json({ message: "Website-development payment is required." }, 400);
    if (!Array.isArray(body.hostingSelections) || body.hostingSelections.some((item: any) => !item.purchaseConfirmed)) return json({ message: "A confirmed hosting subscription is required." }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db.from("site_claims").insert({
      user_id: auth.user.id,
      sites: body.sites,
      hosting_selections: body.hostingSelections,
      agreement_ids: body.agreementIds || {},
      agreement_signer: body.agreementSigner,
      agreement_business: body.agreementBusiness,
      agreement_email: body.agreementEmail,
      agreement_signature: body.agreementSignature,
      agreement_signed_at: body.agreementSignedAt,
      agreement_plan: body.agreementPlan,
      agreement_version: body.agreementVersion,
      development_purchase_confirmed: true,
      discount_code: body.discountCode || null,
      message: body.message || "",
      status: "PENDING",
    }).select("id").single();
    if (error) throw error;
    return json({ success: true, claimId: data.id });
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
