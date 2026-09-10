import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

const squareBase = Deno.env.get("SQUARE_ENVIRONMENT") === "sandbox"
  ? "https://connect.squareupsandbox.com"
  : "https://connect.squareup.com";
const squareVersion = "2026-08-19";

async function square(path: string, init: RequestInit = {}) {
  const token = Deno.env.get("SQUARE_ACCESS_TOKEN");
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not configured.");
  const response = await fetch(`${squareBase}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Square-Version": squareVersion,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.errors?.[0]?.detail || `Square returned ${response.status}.`);
  return data;
}

async function currentUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Please log in again.");
  return data.user;
}

function admin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

const plans = () => ({
  "website-development": { label: "$100 — Website Development · one-time payment", amount: 10000, cadence: "ONE_TIME", variationId: null },
  "standard-monthly": { label: "$20/month — Standard Website Hosting · billed monthly", amount: 2000, cadence: "MONTHLY", variationId: Deno.env.get("SQUARE_STANDARD_PLAN_VARIATION_ID") },
  "backend-monthly": { label: "$30/month — Backend Website Hosting · billed monthly", amount: 3000, cadence: "MONTHLY", variationId: Deno.env.get("SQUARE_BACKEND_PLAN_VARIATION_ID") },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ message: "Method not allowed." }, 405);

  try {
    const user = await currentUser(req);
    const body = await req.json();
    const db = admin();

    if (body.action === "validate-discount-code") {
      return json({ valid: false, message: "Invalid discount code." });
    }

    if (body.action === "create-checkout") {
      const plan = plans()[body.planKey as keyof ReturnType<typeof plans>];
      if (!plan) return json({ message: "Unknown payment plan." }, 400);
      if (plan.cadence === "MONTHLY" && !plan.variationId) return json({ message: "The Square subscription plan is not configured." }, 500);
      const locationId = Deno.env.get("SQUARE_LOCATION_ID");
      if (!locationId) return json({ message: "SQUARE_LOCATION_ID is not configured." }, 500);
      const redirect = new URL(String(body.returnUrl));
      if (redirect.protocol !== "https:") return json({ message: "Checkout return URL must use HTTPS." }, 400);

      const checkoutOptions: Record<string, unknown> = {
        redirect_url: redirect.toString(),
        ask_for_shipping_address: false,
      };
      if (plan.variationId) checkoutOptions.subscription_plan_id = plan.variationId;

      const result = await square("/v2/online-checkout/payment-links", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          description: plan.label,
          quick_pay: {
            name: plan.label,
            price_money: { amount: plan.amount, currency: "USD" },
            location_id: locationId,
          },
          checkout_options: checkoutOptions,
          pre_populated_data: { buyer_email: user.email },
        }),
      });

      const link = result.payment_link;
      if (!link?.url || !link?.order_id) return json({ message: "Square did not return a checkout link." }, 502);
      const { data: session, error } = await db.from("square_checkout_sessions").insert({
        user_id: user.id,
        agreement_id: body.agreementId || null,
        plan_key: body.planKey,
        plan_label: plan.label,
        amount_cents: plan.amount,
        billing_cadence: plan.cadence,
        square_order_id: link.order_id,
        square_payment_link_id: link.id,
        status: "PENDING",
      }).select("id").single();
      if (error) throw error;
      return json({ checkoutUrl: link.url, checkoutId: session.id });
    }

    if (body.action === "verify-checkout") {
      const { data: session, error } = await db.from("square_checkout_sessions")
        .select("*").eq("id", body.checkoutId).eq("user_id", user.id).single();
      if (error || !session) return json({ message: "Checkout was not found." }, 404);
      if (session.status === "COMPLETED") return json({ verified: true });
      const result = await square(`/v2/orders/${session.square_order_id}`);
      const order = result.order;
      if (order?.state !== "COMPLETED") return json({ verified: false, status: order?.state || "PENDING" });

      let squareSubscriptionId: string | null = null;
      if (session.billing_cadence === "MONTHLY" && order.customer_id) {
        const subscriptions = await square("/v2/subscriptions/search", {
          method: "POST",
          body: JSON.stringify({ query: { filter: { customer_ids: [order.customer_id], location_ids: [Deno.env.get("SQUARE_LOCATION_ID")] } } }),
        });
        const expectedVariation = plans()[session.plan_key as keyof ReturnType<typeof plans>]?.variationId;
        const match = (subscriptions.subscriptions || []).find((item: any) =>
          item.plan_variation_id === expectedVariation && !["CANCELED", "DEACTIVATED"].includes(item.status)
        );
        squareSubscriptionId = match?.id || null;
      }

      await db.from("square_checkout_sessions").update({ status: "COMPLETED", verified_at: new Date().toISOString() }).eq("id", session.id);
      if (session.billing_cadence === "MONTHLY") {
        const { error: subscriptionError } = await db.from("hosting_subscriptions").upsert({
          user_id: user.id,
          agreement_id: session.agreement_id,
          checkout_session_id: session.id,
          square_subscription_id: squareSubscriptionId,
          plan_key: session.plan_key,
          plan_name: session.plan_label,
          amount_cents: session.amount_cents,
          billing_cadence: "MONTHLY",
          status: "ACTIVE",
          last_payment_at: new Date().toISOString(),
        }, { onConflict: "checkout_session_id" });
        if (subscriptionError) throw subscriptionError;
      }
      return json({ verified: true });
    }

    if (body.action === "cancel") {
      const { data: subscription, error } = await db.from("hosting_subscriptions")
        .select("*").eq("id", body.subscriptionId).eq("user_id", user.id).single();
      if (error || !subscription) return json({ message: "Subscription was not found." }, 404);
      if (!subscription.square_subscription_id) return json({ message: "Square is still syncing this subscription. Contact support before cancelling." }, 409);
      const result = await square(`/v2/subscriptions/${subscription.square_subscription_id}/cancel`, { method: "POST", body: "{}" });
      const accessUntil = result.subscription?.charged_through_date || null;
      await db.from("hosting_subscriptions").update({ status: "CANCELED", charged_through_date: accessUntil }).eq("id", subscription.id);
      return json({ success: true, accessUntil });
    }

    return json({ message: "Unknown action." }, 400);
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
