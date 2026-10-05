import { NextRequest, NextResponse } from "next/server";
import {
  toolSearchCustomers,
  toolGetOrderStats,
  toolGetChurnRisks,
  toolGetStoreKPIs,
} from "@/lib/ai/assistant-tools";
import { defaultLLMProvider } from "@/lib/ai/llm-provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const m = message.toLowerCase();

    // 1. Guardrail check against destructive/financial requests
    if (
      m.includes("delete") ||
      m.includes("drop table") ||
      m.includes("remove customer") ||
      m.includes("refund order") ||
      m.includes("change price")
    ) {
      return NextResponse.json({
        reply:
          "🛡️ **AI Operational Guardrail Active**: As an AI Copilot, I have read-only access to customer, order, and store analytics data. Destructive actions, record deletion, and financial adjustments must be executed directly by authorized operators.",
        sources: [],
      });
    }

    let toolData: any = null;
    let toolName = "";

    // 2. Intent Dispatch & Tool Execution
    if (m.includes("top") || m.includes("best customer") || m.includes("highest spend") || m.includes("vip")) {
      toolName = "search_customers";
      toolData = await toolSearchCustomers({ limit: 5 });
    } else if (m.includes("churn") || m.includes("at-risk") || m.includes("at risk") || m.includes("dormant") || m.includes("inactive") || m.includes("lose")) {
      toolName = "get_churn_risks";
      toolData = await toolGetChurnRisks({ limit: 5 });
    } else if (m.includes("revenue") || m.includes("sales") || m.includes("kpi") || m.includes("how is store") || m.includes("stats") || m.includes("overview")) {
      toolName = "get_store_kpis";
      toolData = await toolGetStoreKPIs();
    } else if (m.includes("order") || m.includes("processing") || m.includes("delivered") || m.includes("pending")) {
      toolName = "get_order_stats";
      toolData = await toolGetOrderStats({ limit: 5 });
    } else {
      // General customer query
      toolName = "search_customers";
      toolData = await toolSearchCustomers({ query: message, limit: 5 });
    }

    // 3. Format conversational response grounded in database data
    let responseText = "";

    if (toolName === "search_customers" && toolData.customers?.length > 0) {
      responseText = `### 👥 Customer Records Found\n\nHere are the relevant customer records matching your query:\n\n`;
      toolData.customers.forEach((c: any, idx: number) => {
        responseText += `${idx + 1}. **[${c.name}](${c.profileUrl})** (${c.email})\n`;
        responseText += `   - **Segment**: \`${c.segment}\` | **Total Spend**: **${c.spend}** (${c.orders} orders)\n`;
        responseText += `   - **Churn Risk**: ${c.churnRisk.toUpperCase()} | **RFM Score**: \`${c.rfm || "N/A"}\`\n\n`;
      });
    } else if (toolName === "get_churn_risks" && toolData.customers?.length > 0) {
      responseText = `### ⚠️ At-Risk Customer Analysis\n\nIdentified **${toolData.customers.length}** customers with elevated churn indicators based on purchase intervals:\n\n`;
      toolData.customers.forEach((c: any, idx: number) => {
        responseText += `${idx + 1}. **[${c.name}](${c.profileUrl})** (${c.email})\n`;
        responseText += `   - **Inactivity**: **${c.daysInactive} days** since last order | **LTV**: ${c.lifetimeSpend}\n`;
        responseText += `   - **Reason**: ${c.reason}\n\n`;
      });
      responseText += `> **Recommended Action**: Review automated winback workflows or draft a re-engagement offer in the [Approval Queue](/communications).`;
    } else if (toolName === "get_store_kpis") {
      responseText = `### 📊 Kilowatt Store Executive Metrics\n\n`;
      responseText += `- **Total Revenue**: **${toolData.totalRevenue}**\n`;
      responseText += `- **Total Synchronized Orders**: **${toolData.totalOrders}**\n`;
      responseText += `- **Customer Base**: **${toolData.totalCustomers}** customers\n`;
      responseText += `- **Active Automation Workflows**: **${toolData.activeWorkflows}**\n`;
      responseText += `- **Communications Pending Approval**: **${toolData.pendingApprovals}**\n\n`;
      responseText += `**Customer Segmentation Breakdown**:\n`;
      toolData.segments.forEach((s: any) => {
        responseText += `- **${s.segment}**: ${s.count} customer(s)\n`;
      });
    } else if (toolName === "get_order_stats") {
      responseText = `### 📦 Order Analytics & Recent Activity\n\n`;
      responseText += `- **Total Orders**: **${toolData.totalOrders}**\n`;
      responseText += `- **Cumulative Sales Volume**: **${toolData.totalRevenue}**\n`;
      responseText += `- **Average Order Value (AOV)**: **${toolData.averageOrderValue}**\n\n`;
      responseText += `**Recent Orders**:\n`;
      toolData.sampleOrders.forEach((o: any) => {
        responseText += `- **[${o.orderNumber}](${o.url})** • ${o.total} (${o.status}) by ${o.customer} on ${o.date}\n`;
      });
    } else {
      responseText = `I searched your CRM database but didn't find specific matching records for "${message}". You can ask about top spenders, at-risk customers, store revenue, or recent orders!`;
    }

    return NextResponse.json({
      reply: responseText,
      toolUsed: toolName,
      data: toolData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
