import { NextRequest, NextResponse } from "next/server";
import { getECommerceConnector } from "@/lib/woocommerce";

export async function POST(req: NextRequest) {
  try {
    let overrideConfig: any = undefined;
    try {
      const body = await req.json();
      if (body && Object.keys(body).length > 0) {
        overrideConfig = body;
      }
    } catch {
      // no body, use stored config
    }

    const connector = await getECommerceConnector(overrideConfig);
    const result = await connector.testConnection();

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to test store connection",
      },
      { status: 500 }
    );
  }
}
