import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logCommunication } from "@/lib/services/communication-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const communications = await prisma.communication.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(communications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const communication = await logCommunication(id, {
      channel: body.channel || "email",
      direction: body.direction || "outbound",
      subject: body.subject || undefined,
      content: body.content.trim(),
      status: body.requiresApproval ? "pending_approval" : (body.status || "completed"),
      metadata: body.metadata,
      actor: body.actor || "Operator",
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
