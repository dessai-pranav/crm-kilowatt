import { NextRequest, NextResponse } from "next/server";
import { addCustomerNote, deleteCustomerNote } from "@/lib/services/customer-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
    }

    const note = await addCustomerNote(id, body.content.trim(), body.author || "Operator");
    return NextResponse.json(note, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    if (!noteId) {
      return NextResponse.json({ error: "noteId query param required" }, { status: 400 });
    }

    const result = await deleteCustomerNote(noteId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
