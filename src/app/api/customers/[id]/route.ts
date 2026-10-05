import { NextRequest, NextResponse } from "next/server";
import { getCustomer360Profile, updateCustomerTags } from "@/lib/services/customer-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCustomer360Profile(id);
    if (!profile) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.tags && Array.isArray(body.tags)) {
      const updated = await updateCustomerTags(id, body.tags);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
