import test from "node:test";
import assert from "node:assert";
import { getCustomers, getCustomer360Profile } from "../src/lib/services/customer-service.ts";

test("getCustomers searches by name keyword", async () => {
  const result = await getCustomers({ search: "Sophia" });
  assert.ok(result.customers.length >= 1);
  assert.strictEqual(result.customers[0].firstName, "Sophia");
});

test("getCustomers filters by segment", async () => {
  const result = await getCustomers({ segment: "VIP" });
  assert.ok(result.customers.length >= 1);
  for (const c of result.customers) {
    assert.strictEqual(c.segment, "VIP");
  }
});

test("getCustomers filters by minSpend threshold", async () => {
  const result = await getCustomers({ minSpend: 1000 });
  assert.ok(result.customers.length >= 1);
  for (const c of result.customers) {
    assert.ok(c.totalSpend >= 1000);
  }
});

test("getCustomer360Profile aggregates orders, notes, and AI insights", async () => {
  const list = await getCustomers({ limit: 1 });
  assert.ok(list.customers.length > 0);

  const customerId = list.customers[0].id;
  const profile = await getCustomer360Profile(customerId);

  assert.ok(profile);
  assert.ok(Array.isArray(profile.orders));
  assert.ok(Array.isArray(profile.notes));
  assert.ok(Array.isArray(profile.communications));
  assert.ok(Array.isArray(profile.aiInsights));
});
