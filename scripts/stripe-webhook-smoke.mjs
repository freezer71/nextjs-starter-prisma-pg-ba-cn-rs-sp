// Test de fumée du webhook Stripe : envoie des événements signés au serveur local
// sans appel à l'API Stripe. Usage : npm run stripe:smoke (serveur dev démarré,
// STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET renseignés, même factices).
import Stripe from "stripe";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")];
  }),
);
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const base = env.NEXT_PUBLIC_APP_URL;

async function send(payload) {
  const body = JSON.stringify(payload);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret: env.STRIPE_WEBHOOK_SECRET });
  const res = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST", body, headers: { "content-type": "application/json", "stripe-signature": signature },
  });
  return { status: res.status, body: await res.text() };
}

const subscription = {
  id: "sub_test_1", object: "subscription", customer: "cus_test_unknown", status: "active",
  cancel_at_period_end: false, metadata: {},
  items: { object: "list", data: [{ id: "si_1", object: "subscription_item", current_period_end: 1800000000, price: { id: "price_test", object: "price" } }] },
};
const evt = (id, type, object) => ({ id, object: "event", type, data: { object }, created: Math.floor(Date.now() / 1000), livemode: false, api_version: "2026-08-26.dahlia" });

console.log("1. signature invalide  →", await (async () => { const r = await fetch(`${base}/api/stripe/webhook`, { method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=bad" } }); return r.status; })());
console.log("2. sub.created (user inconnu, ignoré) →", await send(evt("evt_test_1", "customer.subscription.created", subscription)));
console.log("3. même événement rejoué (idempotence) →", await send(evt("evt_test_1", "customer.subscription.created", subscription)));
console.log("4. type non géré →", await send(evt("evt_test_2", "payment_intent.succeeded", { id: "pi_1" })));
