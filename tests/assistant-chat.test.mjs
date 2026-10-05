import test from "node:test";
import assert from "node:assert";
import {
  toolSearchCustomers,
  toolGetOrderStats,
  toolGetChurnRisks,
  toolGetStoreKPIs,
} from "../src/lib/ai/assistant-tools.ts";
import { POST as chatAssistant } from "../src/app/api/assistant/chat/route.ts";

test("toolSearchCustomers returns ranked customers with profile links", async () => {
  const result = await toolSearchCustomers({ limit: 3 });
  assert.ok(result.customers.length > 0);
  assert.ok(result.customers[0].name);
  assert.ok(result.customers[0].profileUrl.startsWith("/customers/"));
});

test("toolGetOrderStats computes revenue and lists recent orders", async () => {
  const result = await toolGetOrderStats({ limit: 3 });
  assert.ok(result.totalOrders > 0);
  assert.ok(result.totalRevenue);
  assert.ok(result.sampleOrders.length > 0);
});

test("toolGetChurnRisks returns customers with elevated churn factors", async () => {
  const result = await toolGetChurnRisks({ limit: 5 });
  assert.ok(result.customers.length > 0);
  assert.ok(result.customers[0].daysInactive !== undefined);
});

test("toolGetStoreKPIs aggregates totals and segment distribution", async () => {
  const kpis = await toolGetStoreKPIs();
  assert.ok(kpis.totalRevenue);
  assert.ok(kpis.totalOrders > 0);
  assert.ok(kpis.totalCustomers > 0);
  assert.ok(Array.isArray(kpis.segments));
});

test("Assistant API: handles top customers query and returns grounded links", async () => {
  const req = new Request("http://localhost:3000/api/assistant/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Who are our top customers by total spend?" }),
  });

  const res = await chatAssistant(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.toolUsed, "search_customers");
  assert.ok(data.reply.includes("Customer Records Found"));
  assert.ok(data.reply.includes("/customers/"));
});

test("Assistant API: enforces AI guardrail on destructive requests", async () => {
  const req = new Request("http://localhost:3000/api/assistant/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Please delete customer Elena and refund her order" }),
  });

  const res = await chatAssistant(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.reply.includes("Guardrail Active"));
  assert.ok(data.reply.includes("read-only"));
});
