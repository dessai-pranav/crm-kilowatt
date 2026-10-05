import test from "node:test";
import assert from "node:assert";
import {
  PREDEFINED_TEMPLATES,
  renderTemplate,
  logCommunication,
  getPendingApprovals,
  approveCommunication,
  rejectCommunication,
} from "../src/lib/services/communication-service.ts";
import { prisma } from "../src/lib/prisma.ts";

test("renderTemplate replaces customer variables accurately", () => {
  const template = PREDEFINED_TEMPLATES[0]; // VIP template
  const rendered = renderTemplate(template, {
    customer: {
      firstName: "Sophia",
      lastName: "Vance",
      email: "sophia@example.com",
      totalSpend: 2840,
      ordersCount: 7,
      segment: "VIP",
    },
  });

  assert.ok(rendered.subject.includes("Sophia"));
  assert.ok(rendered.body.includes("Sophia"));
  assert.ok(rendered.body.includes("7 completed orders"));
});

test("Human approval queue workflow: queue, approve, and audit log", async () => {
  const customer = await prisma.customer.findFirst();
  assert.ok(customer);

  // 1. Queue message requiring approval
  const queued = await logCommunication(customer.id, {
    channel: "email",
    subject: "Test Winback Offer",
    content: "Hi there, please accept this 15% discount.",
    status: "pending_approval",
    actor: "AI Workflow",
  });
  assert.strictEqual(queued.status, "pending_approval");

  // 2. Fetch pending approvals
  const pending = await getPendingApprovals();
  const found = pending.find((p) => p.id === queued.id);
  assert.ok(found);

  // 3. Approve communication
  const approved = await approveCommunication(queued.id, "Lead Manager", "Hi Sophia, please accept this exclusive 15% discount.");
  assert.strictEqual(approved.status, "completed");
  assert.ok(approved.content.includes("exclusive"));

  // 4. Verify audit log entry
  const audit = await prisma.auditLog.findFirst({
    where: { entityId: queued.id, action: "communication_approved" },
  });
  assert.ok(audit);
  assert.strictEqual(audit.actor, "Lead Manager");
});
