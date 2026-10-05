import { NextRequest, NextResponse } from "next/server";
import { triggerWorkflowsForEvent } from "@/lib/services/workflow-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { triggerEvent, customerId, orderId, payload } = body;

    if (!triggerEvent || !customerId) {
      return NextResponse.json(
        { error: "triggerEvent and customerId are required" },
        { status: 400 }
      );
    }

    const results = await triggerWorkflowsForEvent(triggerEvent, {
      customerId,
      orderId,
      payload,
    });

    return NextResponse.json({
      success: true,
      executionsTriggered: results.length,
      executions: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
