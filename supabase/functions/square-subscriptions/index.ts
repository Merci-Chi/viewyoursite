import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const squareBase =
  Deno.env.get("SQUARE_ENVIRONMENT") === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";

const squareVersion = "2026-08-19";

async function squareApi(path: string, init: RequestInit = {}) {
  const token = Deno.env.get("SQUARE_ACCESS_TOKEN");
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not configured.");

  const response = await fetch(`${squareBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": squareVersion,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.detail || `Square returned ${response.status}.`);
  }
  return data;
}

function authClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } },
  );
}

async function currentUser(req: Request) {
  const client = authClient(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Please log in again.");
  return { user: data.user, client };
}

const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

const plans = () => ({
  "website-development": {
    label: "$100 — Website Development · one-time payment",
    amount: 10000,
    cadence: "ONE_TIME",
    variationId: null,
  },
  "standard-monthly": {
    label: "$20/month — Standard Website Hosting · billed monthly",
    amount: 2000,
    cadence: "MONTHLY",
    variationId: Deno.env.get("SQUARE_STANDARD_PLAN_VARIATION_ID"),
  },
  "backend-monthly": {
    label: "$30/month — Backend Website Hosting · billed monthly",
    amount: 3000,
    cadence: "MONTHLY",
    variationId: Deno.env.get("SQUARE_BACKEND_PLAN_VARIATION_ID"),
  },
  "standard-local-monthly": {
    label: "$10/month — Standard Website Hosting · local price",
    amount: 1000,
    cadence: "MONTHLY",
    variationId: Deno.env.get("SQUARE_STANDARD_LOCAL_PLAN_VARIATION_ID"),
  },
  "backend-local-monthly": {
    label: "$20/month — Backend Website Hosting · local price",
    amount: 2000,
    cadence: "MONTHLY",
    variationId: Deno.env.get("SQUARE_BACKEND_LOCAL_PLAN_VARIATION_ID"),
  },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ message: "Method not allowed." }, 405);

  try {
    const { user, client } = await currentUser(req);
    const body = await req.json();
    const db = admin();

    if (body.action === "validate-discount-code") {
      const { data, error } = await client.rpc("validate_portal_code", {
        p_code: String(body.code || "").toUpperCase(),
        p_purpose: "local_hosting",
      });
      return json({ valid: !error && data === true });
    }

    if (body.action === "create-checkout") {
      let requestedPlanKey = String(body.planKey || "");
      let portalProject: { id: string } | null = null;
      let portalAgreement: { id: string } | null = null;
      if (body.projectId) {
        if (!["website-development", "standard-monthly", "backend-monthly"].includes(requestedPlanKey)) {
          return json({ message: "Unknown project payment plan." }, 400);
        }
        const projectResult = await db.from("portal_website_projects")
          .select("id,status").eq("id", body.projectId).eq("user_id", user.id).maybeSingle();
        if (projectResult.error) throw projectResult.error;
        if (!projectResult.data || projectResult.data.status !== "awaiting_payment") {
          return json({ message: "This website is not available for payment." }, 403);
        }
        const agreementResult = await db.from("portal_project_agreements")
          .select("id").eq("id", body.agreementId).eq("project_id", body.projectId)
          .eq("user_id", user.id).eq("acknowledged", true)
          .eq("agreement_version", "2026-10-14-project-v1").maybeSingle();
        if (agreementResult.error) throw agreementResult.error;
        if (!agreementResult.data) {
          return json({ message: "Sign the current agreement for this website before payment." }, 403);
        }
        portalProject = projectResult.data;
        portalAgreement = agreementResult.data;
      }

      if (!portalProject && body.discountCode && ["standard-monthly", "backend-monthly"].includes(requestedPlanKey)) {
        const { data: localAccepted, error: localError } = await client.rpc("validate_portal_code", {
          p_code: String(body.discountCode).toUpperCase(),
          p_purpose: "local_hosting",
        });

        if (!localError && localAccepted === true) {
          requestedPlanKey = requestedPlanKey === "backend-monthly"
            ? "backend-local-monthly"
            : "standard-local-monthly";
        }
      }

      const planMap = plans();
      const plan = planMap[requestedPlanKey as keyof typeof planMap];
      if (!plan) return json({ message: "Unknown payment plan." }, 400);
      if (plan.cadence === "MONTHLY" && !plan.variationId) {
        return json({ message: "The Square subscription plan is not configured." }, 500);
      }

      const locationId = Deno.env.get("SQUARE_LOCATION_ID");
      if (!locationId) return json({ message: "SQUARE_LOCATION_ID is not configured." }, 500);

      const redirect = new URL(String(body.returnUrl));
      if (redirect.protocol !== "https:") {
        return json({ message: "Checkout return URL must use HTTPS." }, 400);
      }

      const options: Record<string, unknown> = {
        redirect_url: redirect.toString(),
        ask_for_shipping_address: false,
      };
      if (plan.variationId) options.subscription_plan_id = plan.variationId;

      const result = await squareApi("/v2/online-checkout/payment-links", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          description: plan.label,
          quick_pay: {
            name: plan.label,
            price_money: { amount: plan.amount, currency: "USD" },
            location_id: locationId,
          },
          checkout_options: options,
          pre_populated_data: { buyer_email: user.email },
        }),
      });

      const link = result.payment_link;
      if (!link?.url || !link?.order_id) {
        return json({ message: "Square did not return a checkout link." }, 502);
      }

      const sourceid = crypto.randomUUID();
      const { data: person } = await db
        .from("crm")
        .select("id,name,company,phone")
        .eq("userid", user.id)
        .order("updated", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: session, error } = await db
        .from("square")
        .insert({
          crmid: person?.id || null,
          userid: user.id,
          // Legacy agreements and portal project agreements have different FK targets.
          agreementid: portalProject ? null : body.agreementId || null,
          ...(portalProject ? {
            portal_project_id: portalProject.id,
            portal_agreement_id: portalAgreement!.id,
          } : {}),
          source: "checkout",
          sourceid,
          checkoutid: link.id,
          name: person?.name || "",
          company: person?.company || "",
          email: user.email || "",
          phone: person?.phone || "",
          plan: plan.label,
          amount: plan.amount,
          currency: "USD",
          cadence: plan.cadence,
          status: "PENDING",
          original: {
            plankey: requestedPlanKey,
            orderid: link.order_id,
            paymentlinkid: link.id,
            localpricing: requestedPlanKey.includes("-local-"),
          },
        })
        .select("id")
        .single();

      if (error) throw error;
      return json({
        checkoutUrl: link.url, checkoutId: session.id,
        ...(portalProject ? {
          projectId: portalProject.id, agreementId: portalAgreement!.id,
          purpose: requestedPlanKey === "website-development" ? "development"
            : requestedPlanKey === "backend-monthly" ? "backend" : "standard",
        } : {}),
      });
    }

    if (body.action === "verify-checkout") {
      const { data: session, error } = await db
        .from("square")
        .select("*")
        .eq("id", body.checkoutId)
        .eq("userid", user.id)
        .single();

      if (error || !session) return json({ message: "Checkout was not found." }, 404);
      const scope = session.portal_project_id ? {
        projectId: session.portal_project_id,
        purpose: session.original?.plankey === "website-development" ? "development" : "hosting",
      } : {};
      if (body.projectId && (session.portal_project_id !== body.projectId ||
          scope.purpose !== body.purpose)) {
        return json({ message: "Checkout is not linked to this website and payment purpose." }, 403);
      }
      if (session.portal_project_id && (!body.projectId || !body.purpose)) {
        return json({ message: "Project and payment purpose are required for this checkout." }, 400);
      }
      if (session.status === "COMPLETED" || session.status === "ACTIVE") {
        return json({ verified: true, ...scope });
      }

      const result = await squareApi(`/v2/orders/${session.original?.orderid}`);
      const order = result.order;
      if (order?.state !== "COMPLETED") {
        return json({ verified: false, status: order?.state || "PENDING", ...scope });
      }

      let subscriptionid = null;
      if (session.cadence === "MONTHLY" && order.customer_id) {
        const found = await squareApi("/v2/subscriptions/search", {
          method: "POST",
          body: JSON.stringify({
            query: {
              filter: {
                customer_ids: [order.customer_id],
                location_ids: [Deno.env.get("SQUARE_LOCATION_ID")],
              },
            },
          }),
        });

        const planMap = plans();
        const expected = planMap[session.original?.plankey as keyof typeof planMap]?.variationId;
        subscriptionid = (found.subscriptions || []).find(
          (x: any) =>
            x.plan_variation_id === expected &&
            (session.portal_project_id ? x.status === "ACTIVE"
              : !["CANCELED", "DEACTIVATED"].includes(x.status)),
        )?.id || null;
      }

      if (session.portal_project_id && session.cadence === "MONTHLY" && !subscriptionid) {
        return json({ verified: false, status: "SUBSCRIPTION_PENDING", ...scope });
      }

      const { error: updateError } = await db
        .from("square")
        .update({
          customerid: order.customer_id || session.customerid,
          subscriptionid,
          status: session.cadence === "MONTHLY" ? "ACTIVE" : "COMPLETED",
          lastpayment: new Date().toISOString(),
          updated: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (updateError) throw updateError;
      return json({ verified: true, ...scope });
    }

    if (body.action === "cancel") {
      const { data: s, error } = await db
        .from("square")
        .select("*")
        .eq("id", body.subscriptionId)
        .eq("userid", user.id)
        .single();

      if (error || !s) return json({ message: "Subscription was not found." }, 404);
      if (!s.subscriptionid) {
        return json({ message: "Square is still syncing this subscription. Contact support before cancelling." }, 409);
      }

      const result = await squareApi(`/v2/subscriptions/${s.subscriptionid}/cancel`, {
        method: "POST",
        body: "{}",
      });
      const until = result.subscription?.charged_through_date || null;

      await db
        .from("square")
        .update({ status: "CANCELED", chargedthrough: until, updated: new Date().toISOString() })
        .eq("id", s.id);

      return json({ success: true, accessUntil: until });
    }

    return json({ message: "Unknown action." }, 400);
  } catch (error) {
    console.error(error);
    const failure = error as { code?: string; message?: string };
    const message = failure?.code === "23503"
      ? "Checkout could not be saved because its agreement reference is invalid. Apply the portal checkout migration and deploy the updated function."
      : typeof failure?.message === "string" ? failure.message : "Unexpected server error.";
    return json({ message }, 500);
  }
});
