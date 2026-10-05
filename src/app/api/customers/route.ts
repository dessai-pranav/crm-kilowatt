import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/lib/services/customer-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const segment = searchParams.get("segment") || undefined;
    const churnRisk = searchParams.get("churnRisk") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const minSpend = searchParams.get("minSpend") ? parseFloat(searchParams.get("minSpend")!) : undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "totalSpend";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await getCustomers({
      search,
      segment,
      churnRisk,
      tag,
      minSpend,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
