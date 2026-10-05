import test from "node:test";
import assert from "node:assert";
import { computeRFM } from "../src/lib/services/segmentation-service.ts";

test("computeRFM classifies high spend repeat customer as VIP", () => {
  const now = new Date();
  const result = computeRFM({
    totalSpend: 2500,
    ordersCount: 6,
    lastOrderDate: new Date(now.getTime() - 10 * 86400000), // 10 days ago
    createdAt: new Date(now.getTime() - 180 * 86400000),
  }, now);

  assert.strictEqual(result.segment, "VIP");
  assert.strictEqual(result.churnRisk, "low");
  assert.strictEqual(result.rfmScore, "R5-F5-M5");
  assert.strictEqual(result.rfmRecencyDays, 10);
});

test("computeRFM classifies customer with >90 days inactivity as At-Risk", () => {
  const now = new Date();
  const result = computeRFM({
    totalSpend: 600,
    ordersCount: 3,
    lastOrderDate: new Date(now.getTime() - 110 * 86400000), // 110 days ago
    createdAt: new Date(now.getTime() - 250 * 86400000),
  }, now);

  assert.strictEqual(result.segment, "At-Risk");
  assert.strictEqual(result.churnRisk, "high");
  assert.ok(result.churnReason.includes("110 days"));
});

test("computeRFM classifies customer with >180 days inactivity as Dormant", () => {
  const now = new Date();
  const result = computeRFM({
    totalSpend: 300,
    ordersCount: 2,
    lastOrderDate: new Date(now.getTime() - 210 * 86400000), // 210 days ago
    createdAt: new Date(now.getTime() - 365 * 86400000),
  }, now);

  assert.strictEqual(result.segment, "Dormant");
  assert.strictEqual(result.churnRisk, "high");
});

test("computeRFM classifies 1-order recent customer as New", () => {
  const now = new Date();
  const result = computeRFM({
    totalSpend: 120,
    ordersCount: 1,
    lastOrderDate: new Date(now.getTime() - 5 * 86400000),
    createdAt: new Date(now.getTime() - 5 * 86400000),
  }, now);

  assert.strictEqual(result.segment, "New");
  assert.strictEqual(result.churnRisk, "low");
});
