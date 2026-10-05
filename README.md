# ⚡ Kilowatt AI CRM for WooCommerce

> An intelligent, full-stack CRM built specifically for WooCommerce store owners and operators. Centralizes e-commerce store data, generates 360° customer profiles, calculates deterministic RFM segments, produces explainable AI-backed insights, executes automated workflows, and provides an embedded natural-language AI copilot.

---

## 🌟 Key Features

* **Dual-Mode WooCommerce Integration**:
  * **Live WooCommerce REST API**: Synchronizes customers, orders, and products on demand.
  * **Near-Real-Time Webhooks**: Ingests customer, order, and product lifecycle events at `/api/webhooks/woocommerce` with HMAC-SHA256 signature verification.
  * **Idempotent Upsert Engine**: Maps external IDs (`wooCustomerId`, `wooOrderId`, `wooProductId`) to prevent duplicates across multiple syncs or repeated webhook events.
  * **Built-in Mock Sandbox**: Complete mock store connector for offline testing and instant demonstration without needing an active WooCommerce deployment.
* **Customer 360° Profiles**:
  * Unified customer timeline displaying biographical details, lifetime order history, internal staff notes, and tags.
  * Real-time metrics: Lifetime Value (LTV), Average Order Value (AOV), total order frequency, and days since last purchase.
* **Deterministic RFM & Churn Segmentation**:
  * Evaluates **Recency**, **Frequency**, and **Monetary** metrics using concrete, transparent mathematical rules (not ungrounded AI guesses).
  * Automatically assigns customers into actionable cohorts: **VIP**, **Loyal**, **At-Risk**, and **Dormant**.
* **Explainable AI Engine & Guardrails**:
  * **Evidence-Backed Recommendations**: Suggests personalized next-best actions and churn risk flags backed by verifiable metrics (e.g. *"Inactive for 114 days with $1,420 lifetime spend"*).
  * **Personalized Message Drafting**: AI generates personalized retention emails and offers reflecting purchase history and tone.
  * **Operational Guardrails**: AI operates under strict read-only access to CRM records, is prohibited from modifying financial records or performing destructive operations, and logs all generated outputs to an immutable audit trail.
  * **Google Gemini Adapter with Heuristic Fallback**: Seamlessly runs with Google Gemini or degrades gracefully into an offline deterministic mode if no API key is supplied.
* **Event-Driven Workflow Automation & Human Approval Queue**:
  * Automates multi-step sequences triggered by events (e.g. `order.completed` or `churn_risk_high`) with delays and AI-assisted drafting.
  * **Human-in-the-Loop Gate**: Outbound messages pause in an approval queue (`/communications`) requiring explicit operator sign-off before dispatch.
* **Natural-Language CRM Assistant (Copilot)**:
  * Conversational AI assistant at `/assistant` equipped with read-only tool-calling (`search_customers`, `get_order_stats`, `get_churn_risks`, `get_customer_360`).
  * Direct answers grounded in database records, with clickable navigation links to customer profiles and orders.
* **Modern Executive Dashboard**:
  * High-level KPI summaries (revenue totals, order count, AOV, active buyers).
  * Visual RFM segment distribution charts, recent activity feeds, and prioritized AI action cards.
  * Built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **shadcn/ui** design system with full dark-mode styling.

---

## 🔄 End-to-End System Workflow

```mermaid
flowchart TD
    subgraph DataIngestion ["1. Data Ingestion & Sync"]
        W1[WooCommerce Store REST API] -->|Manual / Scheduled Sync| SYNC[Idempotent Sync Service]
        W2[WooCommerce Webhooks] -->|HMAC-SHA256 Verified| WEBHOOK[/api/webhooks/woocommerce]
        MOCK[Mock Store Sandbox] -->|Offline Demo Mode| SYNC
        WEBHOOK --> SYNC
    end

    subgraph Storage ["2. Persistence & Segmentation"]
        SYNC -->|Idempotent Upsert| DB[(Prisma ORM / SQLite)]
        DB --> RFM[Deterministic RFM & Churn Engine]
        RFM --> SEG[(Customer Segments & 360 View)]
    end

    subgraph Intelligence ["3. Explainable AI & Workflows"]
        SEG --> AI_ENG[Explainable AI Engine]
        AI_ENG -->|Evidence-backed Insights| AI_REC[Next-Best-Action & Churn Risks]
        AI_ENG -->|Contextual Drafting| DRAFT[Message Drafts]
        
        DB --> WF_RUN[Workflow Automation Runner]
        WF_RUN -->|Trigger on Order/Customer Event| DRAFT
    end

    subgraph HumanLoop ["4. Guardrails & Human-in-the-Loop"]
        DRAFT --> QUEUE[Human Approval Queue]
        QUEUE -->|Operator Approves| DISPATCH[Communication Dispatch]
        QUEUE -->|Operator Rejects/Edits| DISPATCH
        DISPATCH --> AUDIT[(Audit Log & Timeline)]
    end

    subgraph Copilot ["5. CRM Copilot & Operator UI"]
        DB --> TOOLS[Read-Only Database Tools]
        TOOLS --> ASSISTANT[CRM AI Assistant /assistant]
        DB --> DASHBOARD[Executive Dashboard & Customer 360 UI]
    end
```

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router, Server & Client Components)
* **Language**: TypeScript
* **Database & ORM**: SQLite with Prisma ORM
* **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide React icons, shadcn/ui components
* **AI Provider**: Google Gemini API (`@google/genai`) with offline deterministic fallback adapter
* **Testing**: Node.js test runner via `tsx`

---

## 📂 Project Structure

```text
crm-kilowatt/
├── openspec/                     # OpenSpec specifications, proposal, and tasks
│   └── changes/woocommerce-ai-crm/
│       ├── proposal.md           # Business case and capability scope
│       ├── design.md             # Technical architecture and guardrail definitions
│       └── tasks.md              # 9-phase execution checklist
├── prisma/
│   ├── schema.prisma             # Relational data schema (Customer, Order, Segment, etc.)
│   ├── dev.db                    # SQLite database file
│   └── seed.js                   # Demo store seed script with realistic records
├── src/
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── api/                  # REST API endpoints (sync, webhooks, AI, assistant, etc.)
│   │   ├── assistant/            # Conversational CRM AI Copilot
│   │   ├── communications/       # Communication timeline & human approval queue
│   │   ├── customers/            # Customer directory & Customer 360 profile views
│   │   ├── orders/               # Order tracking & itemized order detail views
│   │   ├── settings/             # Store configuration, credentials & manual sync
│   │   ├── workflows/            # Event-driven workflow automation manager
│   │   ├── page.tsx              # Executive analytics dashboard
│   │   └── layout.tsx            # Global layout shell with navigation
│   ├── components/               # Reusable UI components & shadcn design system
│   │   ├── ui/                   # Button, Card, Badge, Tabs, Dialog, Input, Select
│   │   └── Navigation.tsx        # Responsive navigation bar
│   └── lib/                      # Core business logic, services & connectors
│       ├── ai/                   # Gemini adapter, prompt builders, operational guardrails
│       ├── crm/                  # Customer 360 aggregator, RFM scoring, search services
│       ├── db/                   # Prisma database client singleton
│       ├── woocommerce/          # Live REST API connector & Mock store sandbox
│       └── workflows/            # Event-driven workflow runner & trigger handlers
└── tests/                        # Automated unit and integration test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18.18+ or v20+ recommended
* **npm**: v9+

### 2. Installation
Clone the repository and install dependencies:
```bash
cd crm-kilowatt
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` template into `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your settings:
```env
# Google Gemini API key from https://aistudio.google.com/
# (Optional: Leave blank to use offline deterministic fallback mode)
GEMINI_API_KEY=your_gemini_api_key_here

# Runtime
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Live WooCommerce Store (Optional: Leave blank to use built-in Mock Store)
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_key
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret
WOOCOMMERCE_WEBHOOK_SECRET=whsec_your_secret
```

### 4. Database Setup & Seeding
Initialize the SQLite database with Prisma and populate it with realistic demo store data:
```bash
# Push schema to SQLite
npm run db:push

# Generate Prisma Client
npm run db:generate

# Populate with realistic demo customers, orders, segments, and communications
npm run db:seed
```

### 5. Run the Application
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The application includes an extensive suite of automated tests covering database synchronization, RFM scoring, AI guardrails, webhooks, and the conversational assistant:

```bash
npm test
```

### Test Suites Included:
* `tests/idempotent-sync.test.mjs`: Validates upsert deduplication and external ID mapping.
* `tests/webhook-verification.test.mjs`: Tests HMAC-SHA256 signature verification and payload handling.
* `tests/rfm-segmentation.test.mjs`: Verifies deterministic RFM mathematical scoring.
* `tests/ai-insights-guardrails.test.mjs`: Enforces explainability, evidence requirements, and read-only AI safety guardrails.
* `tests/assistant-chat.test.mjs`: Tests CRM copilot tool-calling execution and grounded answers.
* `tests/workflow-service.test.mjs`: Tests event triggers, delays, and approval queue routing.
* `tests/analytics-and-e2e.test.mjs`: End-to-end verification of customer 360, orders, and dashboard metrics.

---

## 🔒 Security & AI Guardrails

1. **Read-Only Data Access**: The natural language AI copilot only receives read-only tool functions (`search_customers`, `get_order_stats`, etc.). It has no database mutation or deletion permissions.
2. **Financial Data Immutability**: AI models cannot modify financial records, order amounts, or payment statuses under any circumstances.
3. **Mandatory Human-in-the-Loop for Communications**: AI drafts messages for customer recovery and retention, but messages are placed in the human approval queue (`/communications`) and cannot be dispatched autonomously.
4. **Comprehensive Audit Trail**: Every AI recommendation, generated draft, operator approval, and workflow execution is timestamped and recorded in the `AuditLog` table.
5. **HMAC Webhook Security**: All incoming WooCommerce webhook notifications are validated against the shared secret before processing.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
