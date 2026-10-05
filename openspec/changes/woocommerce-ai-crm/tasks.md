# Tasks

## 1. Project Scaffolding and Database Foundation

- [x] 1.1 Initialize Next.js 15 project with TypeScript, Tailwind CSS, Lucide React, and essential UI utilities; verify project builds with `npm run build`
- [x] 1.2 Configure Prisma ORM with SQLite database and define schemas for `StoreConfig`, `Customer`, `Order`, `OrderItem`, `CustomerSegment`, `Communication`, `CustomerNote`, `Workflow`, `WorkflowExecution`, `AIInsight`, `SyncLog`, and `AuditLog`; verify schema generation with `npx prisma generate` and `npx prisma db push`
- [x] 1.3 Create seed script with realistic e-commerce store demo data (customers, multi-item orders, communication history, segments, and audit events); verify database populates properly via `npm run db:seed`

## 2. WooCommerce Integration, Webhooks, and Idempotent Sync

- [x] 2.1 Implement `ECommerceConnector` interface and `WooCommerceConnector` with authentication, connection verification, and paginated REST API fetchers for customers, orders, and products; verify unit tests pass with mocked responses
- [x] 2.2 Implement `MockWooCommerceConnector` for sandbox testing and offline demo modes; verify connection tests and data ingestion return expected mock datasets
- [x] 2.3 Implement idempotent synchronization service with stable WooCommerce entity ID mapping (`wooCustomerId`, `wooOrderId`, `wooProductId`) and upsert logic; verify repeated sync executions do not create duplicate records
- [x] 2.4 Implement WooCommerce webhook endpoint (`/api/webhooks/woocommerce`) with HMAC-SHA256 signature verification and idempotent event processing for customer, order, and product events; verify valid signatures process and invalid signatures return HTTP 401
- [x] 2.5 Create API endpoints for store configuration (`/api/store/config`), connection testing (`/api/store/test`), and sync execution with failure audit recording in `SyncLog`; verify endpoints respond with appropriate HTTP status and payloads

## 3. Customer Management and Deterministic Segmentation

- [x] 3.1 Implement deterministic RFM scoring algorithm and churn indicator calculator (Recency, Frequency, Monetary, and dormancy intervals); verify unit tests classify customers into VIP, Loyal, At-Risk, and Dormant cohorts accurately based on test cohorts
- [x] 3.2 Implement customer data access layer supporting keyword search, tag filtering, segment filtering, spending thresholds, and pagination; verify query tests return accurate subsets
- [x] 3.3 Build customer directory UI with search bar, segment filters, sorting controls, and customer table with spend and order counts; verify table renders and filtering updates rows
- [x] 3.4 Implement Customer 360 profile aggregation service and profile page rendering biographical info, lifetime metrics (LTV, AOV, order frequency), segment badges, complete order history, and notes; verify navigating to `/customers/[id]` displays accurate aggregations
- [x] 3.5 Implement customer internal notes and tagging APIs and UI components; verify creating, editing, and deleting notes persist in the database and display on the customer timeline

## 4. Order Management and Lifecycle Tracking

- [x] 4.1 Implement order data access layer with status filters, date range filters, and customer associations; verify order query filtering returns expected records
- [x] 4.2 Build orders list UI displaying order numbers, dates, customer links, payment methods, order statuses, and totals; verify order table pagination and status filtering
- [x] 4.3 Build order detail view showing line item breakdown, quantities, taxes, discounts, shipping address, and status timeline; verify line-item calculations and status transitions match recorded data

## 5. Communication Workflows and Human Approval Queue

- [x] 5.1 Implement communication logging service and API (`/api/customers/[id]/communications`) for email, call, SMS, and notes with direction indicators; verify logging interactions persists to database
- [x] 5.2 Implement reusable communication templates manager with placeholder variable substitution (e.g. `{{firstName}}`, `{{lastOrderDate}}`, `{{totalSpend}}`); verify template rendering tests substitute variables correctly
- [x] 5.3 Implement human review and approval queue service and UI (`/api/communications/approvals`) for high-impact outbound communications and AI drafts; verify pending messages require operator approval before dispatch
- [x] 5.4 Build communication timeline UI on customer profile and message composer modal allowing drafting, template loading, and dispatch logging to customer activity feed and audit trail; verify approved dispatch updates timeline

## 6. Explainable AI Engine and Operational Guardrails

- [x] 6.1 Implement LLM provider adapter supporting Google Gemini and OpenAI-compatible endpoints with graceful heuristic fallbacks; verify provider handles both valid API key and offline fallback responses
- [x] 6.2 Implement explainable AI recommendation service generating churn risks and next-best actions with explicit evidence, exposed metrics (LTV, recency, frequency, inactivity), and supported confidence indicators; verify AI response includes quantitative evidence and no unsupported facts
- [x] 6.3 Implement automated customer profile summary and personalized message generation service formatting drafts for human review; verify generated drafts reflect customer purchase history and tone
- [x] 6.4 Implement AI operational guardrails and centralized `AuditLog` service blocking destructive operations and financial modifications; verify guardrail tests reject unauthorized actions and log AI events to audit trail

## 7. Event-Driven Workflow Automation Engine

- [x] 7.1 Implement workflow rule configuration data layer supporting event triggers (`order.completed`, `customer.churn_risk_high`), conditions (spend, segment), and sequential action steps; verify workflow rule creation and validation tests
- [x] 7.2 Implement in-process workflow runner executing delays, AI drafting actions, and routing to human approval queue (e.g. order delivered → wait 3 days → generate feedback message → human approval → dispatch → log result); verify workflow runs through states sequentially
- [x] 7.3 Implement workflow execution history and failure logging (`WorkflowExecution`); verify step history and failure logs are persisted and viewable
- [x] 7.4 Build workflow management UI allowing operators to view active workflows, trigger manual test runs, and inspect execution history; verify UI displays workflow status and history

## 8. Natural-Language CRM Assistant

- [x] 8.1 Implement CRM database read-only tool-calling functions (`search_customers`, `get_order_stats`, `get_churn_risks`, `get_customer_360`); verify tool functions return correct database records without side effects
- [x] 8.2 Implement conversational assistant API route (`/api/assistant/chat`) with session memory, tool calling execution, and structured answers; verify query tests return accurate answers to questions like "Who are top 5 customers?"
- [x] 8.3 Build interactive CRM Assistant chat drawer/dialog with suggested prompt chips, message history, and clickable entity links navigating to customer profiles and orders; verify chat interaction in the browser

## 9. Executive Dashboard and End-to-End Verification

- [x] 9.1 Implement dashboard metrics aggregation service computing revenue totals, order counts, active customer counts, AOV, and customer segment distributions; verify aggregate calculations match database records
- [x] 9.2 Build executive dashboard page with KPI summary cards, revenue/orders trend charts, customer health segment distribution, pending human approval counter badge, and prioritized AI alert cards; verify responsive layout on desktop and mobile
- [x] 9.3 Integrate global navigation shell with links to Dashboard, Customers, Orders, Communications & Approvals, Workflows, Assistant, and Settings/Sync; verify active tab states and routing
- [x] 9.4 Perform end-to-end verification of WooCommerce sync, customer 360 views, AI insights generation, communication logging, and assistant querying; verify build passes cleanly with `npm run build` and all tests pass
