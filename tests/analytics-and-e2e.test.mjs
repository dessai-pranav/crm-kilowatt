import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.ts";
import { executeFullSync } from "../src/lib/services/sync-service.ts";
import { getCustomer360Profile } from "../src/lib/services/customer-service.ts";
import { generateExplainableCustomerInsights } from "../src/lib/services/ai-insight-service.ts";
import {
  logCommunication,
  getPendingApprovals,
  approveCommunication,
} from "../src/lib/services/communication-service.ts";
import { triggerWorkflowsForEvent } from "../src/lib/services/workflow-service.ts";
import { getDashboardAnalytics } from "../src/lib/services/analytics-service.ts";

test("9.1 & 9.4: Complete End-to-End Flow & Executive Analytics Verification", async () => {
  // Step 1 & 2: WooCommerce/Mock Store -> Sync -> Database
  const syncResult = await executeFullSync();
  assert.equal(syncResult.success, true);
  assert.ok(syncResult.customersSynced > 0, "Should sync mock customers");
  assert.ok(syncResult.ordersSynced > 0, "Should sync mock orders");

  // Verify sync log was recorded
  const syncLog = await prisma.syncLog.findFirst({
    orderBy: { createdAt: "desc" },
  });
  assert.ok(syncLog, "SyncLog entry should exist");
  assert.equal(syncLog.status, "success");

  // Step 3 & 4: Database -> Customer 360
  const customers = await prisma.customer.findMany({
    take: 5,
    orderBy: { totalSpend: "desc" },
  });
  assert.ok(customers.length > 0, "Customers must be in database");

  const targetCustomer = customers[0];
  const profile360 = await getCustomer360Profile(targetCustomer.id);
  assert.ok(profile360, "Customer 360 profile must be retrieved");
  assert.equal(profile360.id, targetCustomer.id);
  assert.ok(profile360.orders.length > 0, "Customer should have order history");
  assert.ok(profile360.totalSpend > 0, "LTV metrics should be aggregated");

  // Step 5: RFM/Churn/Segments
  assert.ok(profile360.segment, "Customer should have a deterministic segment");
  assert.ok(
    ["VIP", "Loyal", "Promising", "At-Risk", "Dormant", "New"].includes(profile360.segment),
    "Segment must be one of standard deterministic RFM segments"
  );
  assert.ok(
    ["low", "medium", "high"].includes(profile360.churnRisk),
    "Churn risk must be low, medium, or high"
  );

  // Step 6 & 7: AI Insight -> Explainable Recommendation
  const insight = await generateExplainableCustomerInsights(targetCustomer.id);
  assert.ok(insight, "AI insight should be generated");
  assert.ok(insight.summary.length > 0, "Summary must be present");
  assert.ok(insight.nextBestAction.length > 0, "Next-best-action must be recommended");
  assert.ok(insight.actionRationale.length > 0, "Action rationale must be grounded");
  assert.ok(Array.isArray(insight.churnEvidence), "Insight must expose churn evidence");
  assert.ok(
    insight.confidenceScore >= 0.5 && insight.confidenceScore <= 1.0,
    "Confidence must be bounded and grounded"
  );

  // Step 8: AI-generated Communication Draft
  const queuedComm = await logCommunication(targetCustomer.id, {
    channel: "email",
    subject: `Personalized Special Offer for ${targetCustomer.firstName}`,
    content: `Hi ${targetCustomer.firstName}, as a valued customer, here is an exclusive 15% discount code: VIP15.`,
    status: "pending_approval",
    actor: "AI Copilot Engine",
  });
  assert.equal(queuedComm.status, "pending_approval");

  const pendingList = await getPendingApprovals();
  assert.ok(pendingList.some((p) => p.id === queuedComm.id), "Queued message should be in pending approvals");

  // Step 9: Human Approval
  const approvalResult = await approveCommunication(
    queuedComm.id,
    "E2E Test Operator",
    `Hi ${targetCustomer.firstName}, as a valued customer, here is an approved 15% discount: VIP15.`
  );
  assert.equal(approvalResult.status, "completed");

  // Verify approval audit log
  const approvalAudit = await prisma.auditLog.findFirst({
    where: {
      action: "communication_approved",
      entityId: queuedComm.id,
    },
  });
  assert.ok(approvalAudit, "Approval must be recorded in AuditLog");
  assert.equal(approvalAudit.actor, "E2E Test Operator");

  // Step 10: Workflow Automation Trigger & Execution
  // Ensure an active workflow exists
  let workflow = await prisma.workflow.findFirst({
    where: { triggerEvent: "order.completed", isActive: true },
  });
  if (!workflow) {
    workflow = await prisma.workflow.create({
      data: {
        name: "E2E Order Follow-up",
        triggerEvent: "order.completed",
        isActive: true,
        steps: JSON.stringify([
          {
            type: "action",
            action: "ai_draft_message",
            config: { template: "Thank you for order {{orderId}}!" },
          },
          {
            type: "action",
            action: "require_human_approval",
          },
        ]),
      },
    });
  }

  const workflowExecutions = await triggerWorkflowsForEvent("order.completed", {
    orderId: profile360.orders[0]?.id || "mock-order-id",
    customerId: targetCustomer.id,
    total: 150,
  });
  assert.ok(workflowExecutions.length > 0, "Workflow should execute for trigger event");
  assert.equal(workflowExecutions[0].status, "waiting_approval");

  // Step 11: Audit Log Verification
  const auditLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  assert.ok(auditLogs.length > 0, "Audit log trail should contain system actions");

  // Step 12: Executive Analytics Service
  const analytics = await getDashboardAnalytics();
  assert.ok(analytics.kpis.totalRevenue >= 0, "Analytics totalRevenue computed");
  assert.ok(analytics.kpis.totalOrders >= 1, "Analytics totalOrders >= 1");
  assert.ok(analytics.kpis.totalCustomers >= 1, "Analytics totalCustomers >= 1");
  assert.ok(analytics.kpis.averageOrderValue >= 0, "Analytics AOV computed");
  assert.ok(Array.isArray(analytics.segments), "Analytics segments array returned");
  assert.ok(Array.isArray(analytics.dailyTrends), "Analytics daily trends returned");
  assert.equal(analytics.dailyTrends.length, 7, "Daily trends covers 7 days");
});
