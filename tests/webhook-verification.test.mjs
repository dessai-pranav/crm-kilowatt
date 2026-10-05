import test from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { POST } from "../src/app/api/webhooks/woocommerce/route.ts";
import { prisma } from "../src/lib/prisma.ts";

test("WooCommerce webhook handler rejects invalid signature with 401", async () => {
  const storeConfig = await prisma.storeConfig.findFirst();
  const secret = storeConfig?.webhookSecret || "test_secret";

  const payload = JSON.stringify({
    id: 9999,
    email: "test.webhook@example.com",
    first_name: "Test",
    last_name: "User",
  });

  // Invalid signature
  const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-wc-webhook-topic": "customer.created",
      "x-wc-webhook-signature": "invalid_base64_signature_here==",
    },
    body: payload,
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.error, "Invalid webhook signature");
});

test("WooCommerce webhook handler accepts valid HMAC-SHA256 signature and processes payload", async () => {
  const storeConfig = await prisma.storeConfig.findFirst();
  const secret = storeConfig?.webhookSecret || "whsec_demo_live_secret";

  const payloadObj = {
    id: 8888,
    email: "webhook.customer@example.com",
    first_name: "Webhook",
    last_name: "Tester",
    total_spent: "450.00",
    orders_count: 2,
  };
  const payloadStr = JSON.stringify(payloadObj);

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64");

  const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-wc-webhook-topic": "customer.created",
      "x-wc-webhook-signature": validSignature,
    },
    body: payloadStr,
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);

  // Check customer was created in database
  const created = await prisma.customer.findUnique({
    where: { email: "webhook.customer@example.com" },
  });
  assert.ok(created);
  assert.strictEqual(created.firstName, "Webhook");
});
