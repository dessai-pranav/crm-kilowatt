const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CRM database with realistic WooCommerce demo data...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.workflowExecution.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.customerSegment.deleteMany();
  await prisma.storeConfig.deleteMany();

  // 1. Store Config
  const store = await prisma.storeConfig.create({
    data: {
      storeUrl: "https://kilowatt-gear.demo",
      consumerKey: "ck_demo_live_kilowatt_key",
      consumerSecret: "cs_demo_live_kilowatt_secret",
      webhookSecret: "whsec_demo_live_secret",
      isMockMode: true,
      lastSyncAt: new Date(),
      syncStatus: "success",
    },
  });

  // 2. Customer Segments
  const segments = await Promise.all([
    prisma.customerSegment.create({
      data: {
        name: "VIP",
        description: "High lifetime value customers (> $1,000 spend) with consistent purchase frequency",
        ruleCriteria: JSON.stringify({ minSpend: 1000, minOrders: 3 }),
        customerCount: 1,
        color: "purple",
      },
    }),
    prisma.customerSegment.create({
      data: {
        name: "Loyal",
        description: "Repeat buyers with purchases in the last 60 days",
        ruleCriteria: JSON.stringify({ minOrders: 3, maxDaysSinceLastOrder: 60 }),
        customerCount: 1,
        color: "blue",
      },
    }),
    prisma.customerSegment.create({
      data: {
        name: "Promising",
        description: "Recent multi-buyers showing growing engagement",
        ruleCriteria: JSON.stringify({ minOrders: 2, maxDaysSinceLastOrder: 45 }),
        customerCount: 1,
        color: "green",
      },
    }),
    prisma.customerSegment.create({
      data: {
        name: "At-Risk",
        description: "Previously high or regular spenders with no orders past expected re-order window (> 90 days)",
        ruleCriteria: JSON.stringify({ minOrders: 2, minDaysSinceLastOrder: 90 }),
        customerCount: 1,
        color: "amber",
      },
    }),
    prisma.customerSegment.create({
      data: {
        name: "Dormant",
        description: "Inactive customers with no purchase in over 180 days",
        ruleCriteria: JSON.stringify({ minDaysSinceLastOrder: 180 }),
        customerCount: 1,
        color: "rose",
      },
    }),
    prisma.customerSegment.create({
      data: {
        name: "New",
        description: "First-time buyers awaiting onboarding and follow-up",
        ruleCriteria: JSON.stringify({ maxOrders: 1 }),
        customerCount: 1,
        color: "slate",
      },
    }),
  ]);

  // 3. Customers
  const customer1 = await prisma.customer.create({
    data: {
      wooCustomerId: 101,
      email: "sophia.vance@example.com",
      firstName: "Sophia",
      lastName: "Vance",
      phone: "+1 (555) 234-8901",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      totalSpend: 2840.0,
      ordersCount: 7,
      averageOrderValue: 405.71,
      firstOrderDate: new Date("2024-03-12T10:00:00Z"),
      lastOrderDate: new Date(Date.now() - 14 * 86400000), // 14 days ago
      rfmRecencyDays: 14,
      rfmScore: "R5-F5-M5",
      churnRisk: "low",
      churnReason: "Consistent high-value recurring orders with recent activity inside 14 days.",
      segment: "VIP",
      tags: JSON.stringify(["VIP", "Solar Gear", "B2B Buyer", "Eco-friendly"]),
      billingAddress: JSON.stringify({
        first_name: "Sophia",
        last_name: "Vance",
        address_1: "742 Evergreen Terrace",
        city: "Portland",
        state: "OR",
        postcode: "97201",
        country: "US",
      }),
      shippingAddress: JSON.stringify({
        first_name: "Sophia",
        last_name: "Vance",
        address_1: "742 Evergreen Terrace",
        city: "Portland",
        state: "OR",
        postcode: "97201",
        country: "US",
      }),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      wooCustomerId: 102,
      email: "elena.rostova@example.com",
      firstName: "Elena",
      lastName: "Rostova",
      phone: "+1 (555) 876-5432",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      totalSpend: 1490.5,
      ordersCount: 4,
      averageOrderValue: 372.62,
      firstOrderDate: new Date("2024-01-15T09:00:00Z"),
      lastOrderDate: new Date(Date.now() - 110 * 86400000), // 110 days ago (At-Risk!)
      rfmRecencyDays: 110,
      rfmScore: "R2-F4-M4",
      churnRisk: "high",
      churnReason: "Exceeded typical 45-day re-order window by 2.4x with zero activity in 110 days.",
      segment: "At-Risk",
      tags: JSON.stringify(["At-Risk", "High Value", "Re-engagement Priority"]),
      billingAddress: JSON.stringify({
        first_name: "Elena",
        last_name: "Rostova",
        address_1: "124 Baker Street",
        city: "Seattle",
        state: "WA",
        postcode: "98101",
        country: "US",
      }),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      wooCustomerId: 103,
      email: "liam.chen@example.com",
      firstName: "Liam",
      lastName: "Chen",
      phone: "+1 (555) 432-1098",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      totalSpend: 820.0,
      ordersCount: 3,
      averageOrderValue: 273.33,
      firstOrderDate: new Date("2024-06-20T14:30:00Z"),
      lastOrderDate: new Date(Date.now() - 25 * 86400000), // 25 days ago
      rfmRecencyDays: 25,
      rfmScore: "R4-F3-M3",
      churnRisk: "low",
      churnReason: "Active re-order cadence with steady order value.",
      segment: "Loyal",
      tags: JSON.stringify(["Loyal", "Smart Home"]),
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      wooCustomerId: 104,
      email: "marcus.brody@example.com",
      firstName: "Marcus",
      lastName: "Brody",
      phone: "+1 (555) 321-9876",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      totalSpend: 310.0,
      ordersCount: 2,
      averageOrderValue: 155.0,
      firstOrderDate: new Date("2023-10-05T12:00:00Z"),
      lastOrderDate: new Date(Date.now() - 210 * 86400000), // 210 days ago (Dormant!)
      rfmRecencyDays: 210,
      rfmScore: "R1-F2-M2",
      churnRisk: "high",
      churnReason: "Zero purchases in 7 months.",
      segment: "Dormant",
      tags: JSON.stringify(["Dormant"]),
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      wooCustomerId: 105,
      email: "ava.patel@example.com",
      firstName: "Ava",
      lastName: "Patel",
      phone: "+1 (555) 654-3210",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      totalSpend: 189.0,
      ordersCount: 1,
      averageOrderValue: 189.0,
      firstOrderDate: new Date(Date.now() - 2 * 86400000), // 2 days ago
      lastOrderDate: new Date(Date.now() - 2 * 86400000),
      rfmRecencyDays: 2,
      rfmScore: "R5-F1-M2",
      churnRisk: "low",
      churnReason: "Brand new customer in initial onboarding phase.",
      segment: "New",
      tags: JSON.stringify(["New Customer", "First Order"]),
    },
  });

  // 4. Orders with Line Items
  const order1 = await prisma.order.create({
    data: {
      wooOrderId: 5001,
      orderNumber: "#5001",
      customerId: customer1.id,
      status: "completed",
      currency: "USD",
      total: 840.0,
      subtotal: 800.0,
      totalTax: 40.0,
      paymentMethod: "stripe",
      paymentMethodTitle: "Credit Card (Stripe)",
      dateCreated: new Date(Date.now() - 14 * 86400000),
      dateCompleted: new Date(Date.now() - 13 * 86400000),
      lineItems: {
        create: [
          {
            wooItemId: 1,
            wooProductId: 201,
            name: "Kilowatt Max Solar Generator 1000W",
            sku: "KW-GEN-1000",
            quantity: 1,
            price: 650.0,
            subtotal: 650.0,
            total: 650.0,
          },
          {
            wooItemId: 2,
            wooProductId: 202,
            name: "Foldable Solar Panel Array 200W",
            sku: "KW-SOLAR-200",
            quantity: 1,
            price: 150.0,
            subtotal: 150.0,
            total: 150.0,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      wooOrderId: 5002,
      orderNumber: "#5002",
      customerId: customer1.id,
      status: "completed",
      currency: "USD",
      total: 1200.0,
      subtotal: 1150.0,
      totalTax: 50.0,
      paymentMethod: "stripe",
      paymentMethodTitle: "Credit Card",
      dateCreated: new Date(Date.now() - 60 * 86400000),
      dateCompleted: new Date(Date.now() - 59 * 86400000),
      lineItems: {
        create: [
          {
            wooItemId: 3,
            wooProductId: 203,
            name: "Industrial Battery Expansion Pack 2kWh",
            sku: "KW-BATT-2K",
            quantity: 1,
            price: 1150.0,
            subtotal: 1150.0,
            total: 1150.0,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      wooOrderId: 5003,
      orderNumber: "#5003",
      customerId: customer2.id,
      status: "completed",
      currency: "USD",
      total: 620.0,
      subtotal: 600.0,
      totalTax: 20.0,
      paymentMethod: "paypal",
      paymentMethodTitle: "PayPal",
      dateCreated: new Date(Date.now() - 110 * 86400000),
      dateCompleted: new Date(Date.now() - 108 * 86400000),
      lineItems: {
        create: [
          {
            wooItemId: 4,
            wooProductId: 204,
            name: "Smart Energy Storage Monitor Hub",
            sku: "KW-HUB-01",
            quantity: 2,
            price: 300.0,
            subtotal: 600.0,
            total: 600.0,
          },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      wooOrderId: 5004,
      orderNumber: "#5004",
      customerId: customer3.id,
      status: "processing",
      currency: "USD",
      total: 350.0,
      subtotal: 330.0,
      totalTax: 20.0,
      paymentMethod: "stripe",
      paymentMethodTitle: "Apple Pay",
      dateCreated: new Date(Date.now() - 25 * 86400000),
      lineItems: {
        create: [
          {
            wooItemId: 5,
            wooProductId: 205,
            name: "High-Efficiency Inverter 1200W",
            sku: "KW-INV-1200",
            quantity: 1,
            price: 330.0,
            subtotal: 330.0,
            total: 330.0,
          },
        ],
      },
    },
  });

  const order5 = await prisma.order.create({
    data: {
      wooOrderId: 5005,
      orderNumber: "#5005",
      customerId: customer5.id,
      status: "completed",
      currency: "USD",
      total: 189.0,
      subtotal: 175.0,
      totalTax: 14.0,
      paymentMethod: "stripe",
      paymentMethodTitle: "Credit Card",
      dateCreated: new Date(Date.now() - 2 * 86400000),
      dateCompleted: new Date(Date.now() - 1 * 86400000),
      lineItems: {
        create: [
          {
            wooItemId: 6,
            wooProductId: 206,
            name: "Portable Power Station 300Wh",
            sku: "KW-PPS-300",
            quantity: 1,
            price: 175.0,
            subtotal: 175.0,
            total: 175.0,
          },
        ],
      },
    },
  });

  // 5. Customer Notes & Communications
  await prisma.customerNote.create({
    data: {
      customerId: customer1.id,
      author: "Alex Morgan (VIP Success Lead)",
      content: "Sophia mentioned expanding her residential solar storage to 6kWh this spring. Follow up when new high-capacity cells arrive.",
    },
  });

  await prisma.communication.create({
    data: {
      customerId: customer1.id,
      channel: "email",
      direction: "outbound",
      subject: "VIP Exclusive Preview: Next-Gen Solar Panels",
      content: "Hi Sophia, as one of our premier Kilowatt solar partners, we wanted to share an advance look at our new ultra-efficient bifacial arrays...",
      status: "completed",
    },
  });

  await prisma.communication.create({
    data: {
      customerId: customer2.id,
      channel: "email",
      direction: "outbound",
      subject: "We Miss You at Kilowatt + 15% VIP Return Voucher",
      content: "Hi Elena, it has been a while since your last upgrade with us. We have reserved an exclusive 15% loyalty credit code for your next order...",
      status: "pending_approval",
    },
  });

  // 6. Explainable AI Insights
  await prisma.aIInsight.create({
    data: {
      customerId: customer1.id,
      summary: "Tier-1 VIP client with rapid order frequency, exceptional $2,840 lifetime spend, and zero recorded support tickets. Strong preference for commercial-grade solar generator accessories.",
      churnRisk: "low",
      churnScore: 0.08,
      churnEvidence: JSON.stringify([
        { metric: "Recency", value: "14 days", benchmark: "< 45 days", status: "Healthy" },
        { metric: "Lifetime Orders", value: "7 orders", benchmark: "> 3 orders", status: "High Loyalty" },
        { metric: "AOV", value: "$405.71", benchmark: "Store Avg $280", status: "High Value" },
      ]),
      nextBestAction: "Offer Priority Beta Access to 6kWh Modular Units",
      actionRationale: "Customer has purchased battery expansion packs and solar generators; matches early-adopter commercial profile.",
      suggestedCommunication: "Subject: Sophia, early access invitation for 6kWh expansion\n\nHi Sophia,\n\nGiven your setup with the Kilowatt Max and 2kWh battery expansion, our engineering team is launching a private preview of the 6kWh modular stack next week...",
      confidenceScore: 0.94,
      modelUsed: "gemini-1.5-flash",
    },
  });

  await prisma.aIInsight.create({
    data: {
      customerId: customer2.id,
      summary: "High-value customer who previously ordered 4 times but has not placed an order in 110 days (over 2.4x her historical average cadence). Significant churn danger.",
      churnRisk: "high",
      churnScore: 0.82,
      churnEvidence: JSON.stringify([
        { metric: "Inactivity Duration", value: "110 days", benchmark: "Expected cadence 45 days", status: "Critical" },
        { metric: "Order Deceleration", value: "-100% in Q3", benchmark: "Consistent past frequency", status: "High Risk" },
        { metric: "LTV at Risk", value: "$1,490.50", benchmark: "Top 15% of customer base", status: "Priority Winback" },
      ]),
      nextBestAction: "Dispatch 15% Reactivation Voucher with Personalized Smart Hub Upgrades",
      actionRationale: "Elena's last purchase was smart energy monitoring; highlighting updated companion accessories with a 15% discount has an 82% predicted winback correlation.",
      suggestedCommunication: "Subject: Elena, exclusive 15% off your next Kilowatt energy upgrade\n\nHi Elena,\n\nIt has been a few months since you set up your Smart Energy Storage Monitor Hubs! We have just released firmware 2.4 and new compact sensor relays...",
      confidenceScore: 0.88,
      modelUsed: "gemini-1.5-flash",
    },
  });

  // 7. Workflows
  const workflow1 = await prisma.workflow.create({
    data: {
      name: "Post-Delivery Feedback Automation",
      description: "Triggered 3 days after order delivery to request a product review with human approval prior to dispatch.",
      triggerEvent: "order.completed",
      conditions: JSON.stringify([
        { field: "order.total", operator: "gt", value: 50 },
      ]),
      actionSteps: JSON.stringify([
        { type: "delay", days: 3 },
        { type: "ai_action", action: "generate_feedback_request" },
        { type: "human_approval", requiredRole: "operator" },
        { type: "send_communication", channel: "email" },
      ]),
      isActive: true,
      executionCount: 12,
    },
  });

  const workflow2 = await prisma.workflow.create({
    data: {
      name: "At-Risk VIP Winback Protocol",
      description: "Triggered when a customer with spend > $1,000 enters high churn risk (> 90 days inactive).",
      triggerEvent: "customer.churn_risk_high",
      conditions: JSON.stringify([
        { field: "customer.totalSpend", operator: "gte", value: 1000 },
      ]),
      actionSteps: JSON.stringify([
        { type: "ai_action", action: "generate_personalized_winback_offer" },
        { type: "human_approval", requiredRole: "sales_lead" },
        { type: "send_communication", channel: "email" },
      ]),
      isActive: true,
      executionCount: 4,
    },
  });

  // Workflow Execution
  await prisma.workflowExecution.create({
    data: {
      workflowId: workflow1.id,
      customerId: customer5.id,
      entityId: order5.id,
      currentStepIndex: 2,
      status: "waiting_approval",
      stepHistory: JSON.stringify([
        { step: 1, type: "delay", status: "completed", message: "Waited 3 days after delivery" },
        { step: 2, type: "ai_action", status: "completed", output: "Drafted personalized onboarding feedback email" },
      ]),
    },
  });

  // 8. Audit Logs & Sync Logs
  await prisma.syncLog.create({
    data: {
      source: "rest_api",
      status: "success",
      recordsProcessed: 12,
      durationMs: 340,
      details: JSON.stringify({ customers: 5, orders: 5, products: 6 }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "ai_insight_generated",
      entityType: "customer",
      entityId: customer1.id,
      customerId: customer1.id,
      actor: "ai",
      details: JSON.stringify({
        model: "gemini-1.5-flash",
        churnScore: 0.08,
        recommendation: "Offer Priority Beta Access to 6kWh Modular Units",
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "sync_executed",
      entityType: "store",
      actor: "system",
      details: JSON.stringify({
        method: "manual_rest_sync",
        records: 12,
        status: "success",
      }),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
