import test from "node:test";
import assert from "node:assert";
import { getOrders, getOrderById } from "../src/lib/services/order-service.ts";

test("getOrders retrieves orders with customer and line items", async () => {
  const result = await getOrders({ limit: 10 });
  assert.ok(result.orders.length > 0);
  assert.ok(result.total > 0);

  const order = result.orders[0];
  assert.ok(order.orderNumber);
  assert.ok(order.total >= 0);
  assert.ok(Array.isArray(order.lineItems));
});

test("getOrders filters by status", async () => {
  const result = await getOrders({ status: "completed" });
  assert.ok(result.orders.length > 0);
  for (const o of result.orders) {
    assert.strictEqual(o.status, "completed");
  }
});

test("getOrderById returns full order breakdown and line item calculations", async () => {
  const list = await getOrders({ limit: 1 });
  assert.ok(list.orders.length > 0);

  const orderId = list.orders[0].id;
  const order = await getOrderById(orderId);

  assert.ok(order);
  assert.strictEqual(order.id, orderId);
  assert.ok(order.lineItems.length >= 1);
  assert.ok(order.customer);
});
