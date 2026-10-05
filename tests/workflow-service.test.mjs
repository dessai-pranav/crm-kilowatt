import test from "node:test";
import assert from "node:assert";
import {
  evaluateCondition,
  triggerWorkflowsForEvent,
  getWorkflowsWithExecutions,
} from "../src/lib/services/workflow-service.ts";
import { prisma } from "../src/lib/prisma.ts";

test("evaluateCondition accurately evaluates operators", () => {
  const context = {
    customer: { totalSpend: 1200, segment: "VIP" },
    order: { total: 150 },
  };

  assert.strictEqual(
    evaluateCondition({ field: "customer.totalSpend", operator: "gt", value: 1000 }, context),
    true
  );
  assert.strictEqual(
    evaluateCondition({ field: "customer.totalSpend", operator: "lt", value: 500 }, context),
    false
  );
  assert.strictEqual(
    evaluateCondition({ field: "customer.segment", operator: "eq", value: "VIP" }, context),
    true
  );
});

test("triggerWorkflowsForEvent runs order delivery workflow with delay and approval queuing", async () => {
  const customer = await prisma.customer.findFirst();
  const order = await prisma.order.findFirst();
  assert.ok(customer);
  assert.ok(order);

  // Trigger order.completed workflow
  const results = await triggerWorkflowsForEvent("order.completed", {
    customerId: customer.id,
    orderId: order.id,
  });

  assert.ok(Array.isArray(results));
  if (results.length > 0) {
    const execution = results[0];
    assert.ok(execution.id);
    assert.strictEqual(execution.status, "waiting_approval");
    assert.ok(execution.stepHistory);

    // Verify step history captured
    const history = JSON.parse(execution.stepHistory);
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
  }

  // Verify workflow executions query
  const workflows = await getWorkflowsWithExecutions();
  assert.ok(workflows.length > 0);
  assert.ok(Array.isArray(workflows[0].executions));
});
