import test from "node:test";
import assert from "node:assert";
import { MockWooCommerceConnector } from "../src/lib/woocommerce/mock-connector.ts";
import { WooCommerceConnector } from "../src/lib/woocommerce/connector.ts";

test("MockWooCommerceConnector testConnection succeeds with store info", async () => {
  const connector = new MockWooCommerceConnector();
  const result = await connector.testConnection();

  assert.strictEqual(result.success, true);
  assert.ok(result.storeInfo);
  assert.strictEqual(result.storeInfo.name, "Kilowatt Solar & Energy Gear (Demo Sandbox)");
});

test("MockWooCommerceConnector returns mock customers, orders, and products", async () => {
  const connector = new MockWooCommerceConnector();
  const customers = await connector.getCustomers();
  const orders = await connector.getOrders();
  const products = await connector.getProducts();

  assert.ok(customers.length >= 5);
  assert.strictEqual(customers[0].email, "sophia.vance@example.com");
  assert.strictEqual(customers[0].id, 101);

  assert.ok(orders.length >= 5);
  assert.strictEqual(orders[0].id, 5001);
  assert.ok(orders[0].line_items.length >= 1);

  assert.ok(products.length >= 5);
  assert.strictEqual(products[0].sku, "KW-GEN-1000");
});

test("WooCommerceConnector builds correct auth and handles invalid connection gracefully", async () => {
  const connector = new WooCommerceConnector({
    storeUrl: "https://invalid-non-existent-store.local",
    consumerKey: "ck_test",
    consumerSecret: "cs_test",
  });

  const result = await connector.testConnection();
  assert.strictEqual(result.success, false);
  assert.ok(result.message.length > 0);
});
