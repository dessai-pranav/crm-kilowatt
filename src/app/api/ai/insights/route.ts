import { NextRequest, NextResponse } from "next/server";
import { generateExplainableCustomerInsights } from "@/lib/services/ai-insight-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, model } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const insight = await generateExplainableCustomerInsights(customerId, model);
    return NextResponse.json(insight);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
