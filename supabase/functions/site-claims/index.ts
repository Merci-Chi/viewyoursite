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

    const cleanSites = body.sites.map((site: any) => ({
      path: String(site?.path || "").trim(),
      name: String(site?.name || "").trim(),
      hostingType: String(site?.hostingType || "standard").trim(),
    }));
    if (cleanSites.some((site: any) => !site.path || !site.name || !/^[a-zA-Z0-9_-]+$/.test(site.path))) {
      return json({ message: "One or more selected sites are invalid." }, 400);
    }
    if (new Set(cleanSites.map((site: any) => site.path)).size !== cleanSites.length) {
      return json({ message: "The same site cannot be claimed twice." }, 400);
    }

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const claimId = crypto.randomUUID();
    const { error: reservationError } = await db.from("claimed_site_keys").insert(
      cleanSites.map((site: any) => ({ site_key: site.path, user_id: auth.user.id, claim_id: claimId }))
    );
    if (reservationError?.code === "23505") return json({ message: "One of these sites has already been claimed. Refresh and choose another site." }, 409);
    if (reservationError) throw reservationError;

    const { error: claimError } = await db.from("site_claims").insert({
      id: claimId,
      user_id: auth.user.id,
      sites: cleanSites,
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
    });
    if (claimError) {
      await db.from("claimed_site_keys").delete().eq("claim_id", claimId);
      throw claimError;
    }

    const siteBaseUrl = (Deno.env.get("SITE_BASE_URL") || "https://viewyoursite.today").replace(/\/$/, "");
    const { error: sitesError } = await db.from("client_sites").insert(
      cleanSites.map((site: any) => ({
        user_id: auth.user.id,
        site_name: site.name,
        site_key: site.path,
        public_url: `${siteBaseUrl}/${site.path}/`,
        status: "pending",
      }))
    );
    if (sitesError) {
      await db.from("site_claims").delete().eq("id", claimId);
      await db.from("claimed_site_keys").delete().eq("claim_id", claimId);
      throw sitesError;
    }
    return json({ success: true, claimId, sites: cleanSites });
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
