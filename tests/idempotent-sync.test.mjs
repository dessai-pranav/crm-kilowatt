import test from "node:test";
import assert from "node:assert";
import { prisma } from "../src/lib/prisma.ts";
import { executeFullSync } from "../src/lib/services/sync-service.ts";

test("executeFullSync performs idempotent customer and order synchronization", async () => {
  // Ensure store config exists
  const store = await prisma.storeConfig.findFirst();
  if (!store) {
    await prisma.storeConfig.create({
      data: {
        storeUrl: "https://demo.local",
        consumerKey: "ck_test",
        consumerSecret: "cs_test",
        isMockMode: true,
      },
    });
  }

  // First sync execution
  const firstSync = await executeFullSync("test_runner");
  assert.strictEqual(firstSync.success, true);
  assert.ok(firstSync.customersSynced > 0);
  assert.ok(firstSync.ordersSynced > 0);

  const customerCountAfterFirst = await prisma.customer.count();
  const orderCountAfterFirst = await prisma.order.count();
  const lineItemCountAfterFirst = await prisma.orderItem.count();

  // Second sync execution (idempotency check)
  const secondSync = await executeFullSync("test_runner_repeat");
  assert.strictEqual(secondSync.success, true);

  const customerCountAfterSecond = await prisma.customer.count();
  const orderCountAfterSecond = await prisma.order.count();
  const lineItemCountAfterSecond = await prisma.orderItem.count();

  // Counts must remain identical — zero duplicates created
  assert.strictEqual(customerCountAfterSecond, customerCountAfterFirst, "Customer count must not duplicate on repeated sync");
  assert.strictEqual(orderCountAfterSecond, orderCountAfterFirst, "Order count must not duplicate on repeated sync");
  assert.strictEqual(lineItemCountAfterSecond, lineItemCountAfterFirst, "Line item count must not duplicate on repeated sync");

  // Verify sync log entry
  const lastSyncLog = await prisma.syncLog.findFirst({
    orderBy: { createdAt: "desc" },
  });
  assert.ok(lastSyncLog);
  assert.strictEqual(lastSyncLog.status, "success");
});
