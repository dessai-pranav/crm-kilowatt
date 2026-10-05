import test from "node:test";
import assert from "node:assert";
import {
  generateExplainableCustomerInsights,
  validateAIOperationGuardrail,
} from "../src/lib/services/ai-insight-service.ts";
import { defaultLLMProvider } from "../src/lib/ai/llm-provider.ts";
import { prisma } from "../src/lib/prisma.ts";

test("LLM Provider handles requests and returns non-empty response", async () => {
  const response = await defaultLLMProvider.generateText({
    prompt: "Provide an executive CRM summary for a customer with 5 orders.",
  });
  assert.ok(response);
  assert.ok(response.length > 10);
});

test("Explainable AI Insights returns grounded evidence and bounded confidence", async () => {
  const customer = await prisma.customer.findFirst();
  assert.ok(customer);

  const insight = await generateExplainableCustomerInsights(customer.id);

  assert.ok(insight.summary);
  assert.ok(insight.churnRisk);
  assert.ok(insight.churnScore >= 0 && insight.churnScore <= 1);
  assert.ok(insight.confidenceScore >= 0 && insight.confidenceScore <= 1);

  // Evidence check
  assert.ok(Array.isArray(insight.churnEvidence));
  assert.ok(insight.churnEvidence.length >= 3);
  for (const item of insight.churnEvidence) {
    assert.ok(item.metric);
    assert.ok(item.value);
    assert.ok(item.benchmark);
  }

  // Next-best-action check
  assert.ok(insight.nextBestAction);
  assert.ok(insight.actionRationale);
  assert.ok(insight.suggestedCommunication);

  // AuditLog check
  const audit = await prisma.auditLog.findFirst({
    where: {
      action: "ai_insight_generated",
      customerId: customer.id,
    },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(audit);
  assert.strictEqual(audit.actor, "ai");
});

test("AI Guardrail validator strictly blocks destructive operations and financial edits", () => {
  // Prohibited actions
  const deleteCheck = validateAIOperationGuardrail({
    action: "delete_customer",
    targetEntity: "customer",
  });
  assert.strictEqual(deleteCheck.allowed, false);
  assert.ok(deleteCheck.reason.includes("prohibited"));

  const refundCheck = validateAIOperationGuardrail({
    action: "refund_order",
    targetEntity: "order",
  });
  assert.strictEqual(refundCheck.allowed, false);

  const modifyTotalCheck = validateAIOperationGuardrail({
    action: "modify_order_total",
    targetEntity: "order",
  });
  assert.strictEqual(modifyTotalCheck.allowed, false);

  // Destructive flag
  const genericDestructiveCheck = validateAIOperationGuardrail({
    action: "purge_old_records",
    targetEntity: "database",
    isDestructive: true,
  });
  assert.strictEqual(genericDestructiveCheck.allowed, false);

  // Safe read-only action
  const safeCheck = validateAIOperationGuardrail({
    action: "get_customer_metrics",
    targetEntity: "customer",
  });
  assert.strictEqual(safeCheck.allowed, true);
});
