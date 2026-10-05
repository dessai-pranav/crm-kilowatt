import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { upsertCustomerRecord, upsertOrderRecord } from "@/lib/services/sync-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature");
    const topic = req.headers.get("x-wc-webhook-topic") || "unknown";

    // Load store config for webhook secret
    const storeConfig = await prisma.storeConfig.findFirst();
    const webhookSecret = storeConfig?.webhookSecret;

    // Verify signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: "Missing x-wc-webhook-signature header" },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("base64");

      const signatureBuffer = Buffer.from(signature, "utf8");
      const expectedBuffer = Buffer.from(expectedSignature, "utf8");

      if (
        signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
      ) {
        // Record failed security attempt
        await prisma.syncLog.create({
          data: {
            source: "webhook",
            status: "failed",
            recordsProcessed: 0,
            errorMessage: `Invalid HMAC signature for topic: ${topic}`,
          },
        });

        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    let processedEntity = "unknown";

    if (topic.startsWith("customer.") || payload.email) {
      const customer = await upsertCustomerRecord(payload);
      processedEntity = `customer:${customer.id}`;
    } else if (topic.startsWith("order.") || payload.line_items) {
      const order = await upsertOrderRecord(payload);
      processedEntity = `order:${order.id}`;
    }

    // Log success in sync log
    await prisma.syncLog.create({
      data: {
        source: "webhook",
        status: "success",
        recordsProcessed: 1,
        details: JSON.stringify({ topic, entity: processedEntity }),
      },
    });

    return NextResponse.json({
      success: true,
      topic,
      processedEntity,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
