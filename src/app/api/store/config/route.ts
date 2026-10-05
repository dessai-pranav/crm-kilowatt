import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.storeConfig.findFirst();
    if (!config) {
      config = await prisma.storeConfig.create({
        data: {
          storeUrl: "https://demo-woocommerce-store.local",
          consumerKey: "ck_demo_key_kilowatt",
          consumerSecret: "cs_demo_secret_kilowatt",
          webhookSecret: "whsec_demo_secret_kilowatt",
          isMockMode: true,
        },
      });
    }

    return NextResponse.json({
      id: config.id,
      storeUrl: config.storeUrl,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret ? "••••••••••••••••" : "",
      webhookSecret: config.webhookSecret ? "••••••••••••••••" : "",
      isMockMode: config.isMockMode,
      lastSyncAt: config.lastSyncAt,
      syncStatus: config.syncStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let config = await prisma.storeConfig.findFirst();

    const updateData: any = {};
    if (body.storeUrl !== undefined) updateData.storeUrl = body.storeUrl;
    if (body.consumerKey !== undefined) updateData.consumerKey = body.consumerKey;
    if (body.consumerSecret !== undefined && !body.consumerSecret.includes("••••")) {
      updateData.consumerSecret = body.consumerSecret;
    }
    if (body.webhookSecret !== undefined && !body.webhookSecret.includes("••••")) {
      updateData.webhookSecret = body.webhookSecret;
    }
    if (body.isMockMode !== undefined) updateData.isMockMode = Boolean(body.isMockMode);

    if (config) {
      config = await prisma.storeConfig.update({
        where: { id: config.id },
        data: updateData,
      });
    } else {
      config = await prisma.storeConfig.create({
        data: {
          storeUrl: updateData.storeUrl || "https://demo.local",
          consumerKey: updateData.consumerKey || "",
          consumerSecret: updateData.consumerSecret || "",
          webhookSecret: updateData.webhookSecret || "",
          isMockMode: updateData.isMockMode ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        storeUrl: config.storeUrl,
        isMockMode: config.isMockMode,
        lastSyncAt: config.lastSyncAt,
        syncStatus: config.syncStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
