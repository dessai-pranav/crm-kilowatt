import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkflowsWithExecutions } from "@/lib/services/workflow-service";

export async function GET() {
  try {
    const workflows = await getWorkflowsWithExecutions();
    return NextResponse.json(workflows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, triggerEvent, conditions, actionSteps, isActive } = body;

    if (!name || !triggerEvent || !actionSteps) {
      return NextResponse.json(
        { error: "name, triggerEvent, and actionSteps are required" },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || null,
        triggerEvent,
        conditions: conditions ? JSON.stringify(conditions) : null,
        actionSteps: typeof actionSteps === "string" ? actionSteps : JSON.stringify(actionSteps),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "workflow_created",
        entityType: "workflow",
        entityId: workflow.id,
        actor: "Operator",
        details: JSON.stringify({ name: workflow.name, triggerEvent: workflow.triggerEvent }),
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
