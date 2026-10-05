# Proposal

## Why

WooCommerce store owners and sales/support teams often lack a dedicated, centralized CRM to understand customer behavior, track order histories, and proactively engage high-value or churn-risk buyers. Existing standalone CRM solutions require complex external sync configurations, lack deep WooCommerce-specific order context, and provide little to no automated intelligence. Building a dedicated, AI-powered CRM integrated directly with WooCommerce solves this by providing real-time data centralization, 360-degree customer intelligence, automated AI insights, personalized communications, and a natural-language CRM assistant within a single, modular dashboard.

## What Changes

This change introduces a full-stack, AI-powered WooCommerce CRM application:
- **WooCommerce Data Sync & Webhooks**: Resilient synchronization services combining REST API synchronization for bulk/initial ingestion with verified WooCommerce webhooks for near-real-time updates of customer, order, and product events. All synchronization operations use idempotent upserts based on external WooCommerce IDs to prevent duplicates and log failures.
- **Customer Directory & 360 Profiles**: A centralized customer management interface featuring filtering, search, internal notes, tags, and rich Customer 360 profiles aggregating lifetime metrics, full order history, interaction timelines, and AI insights.
- **Deterministic Customer Segmentation**: A rules- and RFM-based segmentation engine calculating recency, frequency, monetary value, and churn indicators to categorize customers into cohorts consumable by AI and workflows.
- **Order Management & Tracking**: An order management system displaying order statuses, itemized line items, customer links, revenue metrics, and lifecycle timelines.
- **Communication Workflows**: Multi-channel interaction logging, reusable message templates, outreach drafting, and human review queues for outbound messaging.
- **Workflow Automation**: An event-driven workflow engine supporting triggers on customer/order events, conditional rules, configurable delays, AI-assisted task execution, human approval gates, execution histories, and failure logging.
- **Explainable AI Insights & Guardrails**: AI intelligence providing customer summaries, evidence-backed next-best-action recommendations, and personalized communication drafts. Every recommendation exposes underlying customer metrics (LTV, recency, frequency, inactivity) and supported confidence indicators. Strictly enforces guardrails prohibiting destructive data operations or financial modifications, requiring human approval for outbound communication, and logging all AI events to an audit trail.
- **Natural-Language CRM Assistant**: An embedded AI chat assistant equipped with read-only CRM data tools to answer questions about customers, revenue, and orders using grounded database records.
- **Executive CRM Dashboard**: A responsive dashboard providing revenue trends, customer growth metrics, churn alerts, recent activity feeds, and prioritized AI action queues.
- **Extensible Integration Architecture**: Modular service design with standardized provider interfaces, supporting both live WooCommerce APIs and offline demo/mock store modes.

## Capabilities

### New Capabilities
- `woocommerce-sync`: Store connection configuration, credential management, REST API synchronization, verified WooCommerce webhook event ingestion, idempotent upsertion using external entity IDs, and sync audit logging.
- `customer-management`: Centralized customer repository, advanced search/filter, internal notes, tagging, and unified Customer 360 profile views.
- `customer-segmentation`: Deterministic RFM scoring (Recency, Frequency, Monetary) and rule-based churn indicator evaluation creating queryable customer cohorts for AI and workflows.
- `order-management`: Centralized order tracking, status lifecycle management, line items, financial totals, and order-to-customer associations.
- `communication-workflows`: Multi-channel interaction history logging, contact records, communication templates, message drafting, and human approval queues.
- `workflow-automation`: Configurable event-driven workflow automation supporting triggers, conditional logic, timed delays, AI actions, human approval checkpoints, execution tracking, and failure logging.
- `ai-insights`: Explainable AI recommendations backed by evidence and customer metrics, automated customer profile summaries, personalized communication generation, AI operational guardrails, and audit trail logging.
- `crm-assistant`: Conversational natural-language interface allowing operators to query customer and order records, filter cohorts, and extract store insights through read-only tools.
- `crm-dashboard`: Modern analytics dashboard displaying high-level store metrics, sales velocity, customer health distribution, and prioritized action queues.

### Modified Capabilities
None (greenfield project).

## Impact
- **Architecture & Tech Stack**: Full-stack Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide React, SQLite with Prisma ORM, and unified LLM client supporting Google Gemini and OpenAI-compatible endpoints with graceful offline fallbacks).
- **APIs**: Exposes REST API routes for WooCommerce sync triggers, verified webhook reception (`/api/webhooks/woocommerce`), customer CRUD, segmentation queries, workflow management, order queries, communication logs, AI insight generation, and assistant chat streaming/tool execution.
- **Dependencies**: Adds Next.js, React, Tailwind CSS, Lucide React, Prisma, `@woocommerce/woocommerce-rest-api` (or custom robust WooCommerce client), and `@google/genai` or AI SDK. No microservices, vector databases, or external queue infrastructure.
- **Deployment**: Standalone containerizable web application capable of running locally or deployed on cloud environments.
