import { NextRequest, NextResponse } from "next/server";
import {
  getPendingApprovals,
  approveCommunication,
  rejectCommunication,
} from "@/lib/services/communication-service";

export async function GET() {
  try {
    const list = await getPendingApprovals();
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, operator, editedContent, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "id and action ('approve' | 'reject') are required" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const result = await approveCommunication(id, operator || "Operator", editedContent);
      return NextResponse.json({ success: true, communication: result });
    } else if (action === "reject") {
      const result = await rejectCommunication(id, operator || "Operator", reason);
      return NextResponse.json({ success: true, communication: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
