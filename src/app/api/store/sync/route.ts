import { NextRequest, NextResponse } from "next/server";
import { executeFullSync } from "@/lib/services/sync-service";

export async function POST(req: NextRequest) {
  try {
    let source = "manual_rest_sync";
    try {
      const body = await req.json();
      if (body?.source) source = body.source;
    } catch {
      // default source
    }

    const result = await executeFullSync(source);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to trigger sync",
      },
      { status: 500 }
    );
  }
}
