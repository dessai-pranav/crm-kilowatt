# Design

## Context

The repository is currently a greenfield workspace. Store teams need a responsive, unified CRM tailored to WooCommerce store data that brings intelligence directly to merchant workflows without external SaaS subscription lock-in. For project motivation and capability breakdown, see [proposal.md](proposal.md) and the respective capability specifications in `specs/`.

## Goals / Non-Goals

**Goals:**
- Provide a responsive full-stack web application with dashboard, customer directory, customer 360 profile, order explorer, communication logger, workflow automation engine, and conversational AI assistant.
- Provide resilient WooCommerce integration combining verified near-real-time webhooks with on-demand REST API synchronization.
- Guarantee idempotent synchronization using stable external WooCommerce entity IDs to prevent duplicates across replayed events.
- Implement deterministic RFM customer segmentation and churn indicator calculation, exposing segment cohorts to AI tools and workflow triggers.
- Support configurable event-driven workflows with conditions, delays, AI-assisted actions, and mandatory human approval gates.
- Deliver explainable AI recommendations backed by exposed customer metrics (LTV, recency, frequency, inactivity) and supported confidence indicators.
- Enforce strict AI guardrails: strictly read-only data access, prohibition of destructive actions or financial modifications, and comprehensive audit trail logging.
- Retain offline mock/demo WooCommerce store mode for instant development and evaluation.

**Non-Goals:**
- Introducing complex distributed infrastructure: no microservices, no vector databases, no LangChain, no external queue brokers (Kafka/RabbitMQ/Redis), and no Kubernetes.
- Direct payment processing or checkout execution within the CRM (financial transactions remain managed by WooCommerce and payment gateways).
- Multi-tenant enterprise organization billing or arbitrary multi-store partitioning (the initial system focuses on a dedicated store instance, easily expandable to multi-store).
- Real-time telephony integration (calls are logged manually; VoIP SIP dialing is out of scope).

## Decisions

### 1. Application Framework: Next.js (App Router) with TypeScript & Tailwind CSS
- **Decision**: Build the application using Next.js 15 (React 19, App Router, TypeScript, Tailwind CSS, Lucide React).
- **Rationale**: Next.js App Router provides cohesive server-side data fetching, secure API route handlers for background syncing, webhook ingestion, and LLM streaming, while Tailwind CSS enables a polished, modern dashboard UI.
- **Alternatives Considered**:
  - Separate React SPA + FastAPI backend: Adds deployment friction, dual-runtime management, and cross-origin authentication complexity.
  - Pure Express + SSR: Slower UI iteration and lacks modern component ecosystems like Tailwind/Radix.

### 2. Persistence Layer: SQLite via Prisma ORM
- **Decision**: Use SQLite managed by Prisma ORM for default data storage, with schema compatibility for PostgreSQL/MySQL.
- **Rationale**: Zero external daemon configuration required; works instantly in containerized codespaces, local developer machines, or single-node deployments. Prisma provides full type-safety, relational modeling, and seamless migrations to hosted PostgreSQL by changing a single provider string.
- **Alternatives Considered**:
  - PostgreSQL required as dependency: Requires running Docker containers or external cloud databases during initial setup, increasing developer onboarding friction.
  - In-memory mock store: Lacks persistence across restarts and cannot demonstrate realistic volume or query indexing.

### 3. Dual Integration Pattern: Verified Webhooks + REST Sync with Idempotent Upserts
- **Decision**: Support both verified webhooks (`/api/webhooks/woocommerce`) for near-real-time updates and REST API sync for initial/manual backfills. Store stable external WooCommerce IDs (`wooCustomerId`, `wooOrderId`, `wooProductId`) with unique database constraints, performing idempotent upserts (`upsertCustomer`, `upsertOrder`).
- **Rationale**: Webhooks provide immediate updates when orders or customers change, while REST sync ensures bulk historical backfills. Idempotency guarantees that duplicate webhook deliveries or repeated manual syncs never create duplicate records. Webhook payloads are verified using HMAC-SHA256 signatures against the configured store secret.
- **Alternatives Considered**:
  - Polling REST API only: Causes delays and high API rate consumption.
  - Webhooks without external ID upserts: Risk of duplicate orders or customers upon network retries.

### 4. Deterministic Segmentation & Explainable AI Architecture
- **Decision**: Decouple deterministic metrics computation from generative AI capabilities:
  1. *Deterministic Engine*: Computes mathematical RFM scores (Recency in days, Frequency in order count, Monetary in total spend), customer lifetime value (CLV), and churn risk factors. Assigns queryable segment tags (VIP, Loyal, Promising, At-Risk, Dormant, New) used by AI and workflow conditions.
  2. *Explainable AI Engine*: Generates customer summaries, next-best-actions, and outreach drafts using direct LLM prompts (Google Gemini / OpenAI compatible with offline fallback). Every recommendation includes explicit evidence, underlying quantitative metrics, and supported confidence ratings. AI is prohibited from stating unsupported facts.
- **Rationale**: Grounding recommendations in concrete, exposed metrics eliminates hallucinated customer totals and ensures merchant trust.
- **Alternatives Considered**:
  - Unstructured LLM recommendations: Operators cannot verify why an action was suggested, leading to distrust.

### 5. In-Process Event-Driven Workflow Automation & Human Approval Gates
- **Decision**: Implement a lightweight, database-backed workflow engine within the Next.js service layer. Workflows subscribe to domain events (`order.completed`, `customer.churn_risk_high`, etc.), evaluate conditions (e.g. `spend > 100`, `segment == 'VIP'`), handle delays via scheduled check timestamps, trigger AI drafting actions, and pause at human approval gates before dispatch.
- **Rationale**: Eliminates the need for heavy external orchestration systems (Celery, Temporal, Redis) while fully satisfying the required workflow lifecycle, error handling, and human-in-the-loop safeguards.
- **Alternatives Considered**:
  - External job queues (Redis/BullMQ): Adds infrastructure dependencies contrary to the zero-dependency goal.

### 6. AI Guardrails and Centralized Audit Trail
- **Decision**: AI assistant tools are strictly read-only. Destructive operations (record deletion) and financial modifications (changing order totals or issuing refunds) cannot be performed by AI. All high-impact communications require human approval. All AI recommendations, generated drafts, approval decisions, and workflow steps are logged in an immutable `AuditLog` table.
- **Rationale**: Prevents accidental data corruption or unauthorized customer messaging while maintaining compliance and full traceability.

## Risks / Trade-offs

- **[Risk]** WooCommerce REST API rate limiting or network latency during large initial syncs.
  → **Mitigation**: Implement batch pagination (50-100 records per page), sync status tracking with resumable offsets, and asynchronous background sync execution with `SyncLog` audit records.
- **[Risk]** Webhook delivery failures or out-of-order events from WooCommerce.
  → **Mitigation**: HMAC-SHA256 signature verification, idempotent upsert logic on stable WooCommerce IDs, and timestamp checks preventing stale overwrites.
- **[Risk]** Customers without external LLM API keys cannot test the AI features.
  → **Mitigation**: Provide intelligent built-in heuristic/template generation fallbacks when `GEMINI_API_KEY` or `OPENAI_API_KEY` is omitted, while seamlessly activating full LLM reasoning when credentials are provided.
- **[Risk]** Workflow delays without an external message broker.
  → **Mitigation**: Implement database-driven execution scheduling where pending delayed steps are evaluated during background intervals or on-demand checks.

## Migration Plan

1. Initialize Next.js 15 project structure with TypeScript, Tailwind CSS, and Prisma.
2. Define Prisma schema for `StoreConfig`, `Customer`, `Order`, `OrderItem`, `CustomerSegment`, `Communication`, `CustomerNote`, `Workflow`, `WorkflowExecution`, `AIInsight`, `SyncLog`, and `AuditLog`.
3. Apply database schema via `prisma db push` / `prisma migrate`.
4. Implement integration connector layer with WooCommerce REST client, webhook endpoint with HMAC validation, idempotent upsert services, and mock demo data generator.
5. Implement CRM core services: Customer Service, Customer Segmentation (RFM engine), Order Service, Analytics Service.
6. Implement Workflow Automation engine supporting triggers, conditions, delays, AI actions, human approval queues, and execution logs.
7. Implement AI services: Explainable insight generator (metrics + evidence), personalized outreach generator, guardrail validators, audit logger, and conversational tool-calling assistant.
8. Build responsive UI: Executive Dashboard, Customer Directory & 360 Profile, Orders Explorer, Communication & Approval Queue, Workflow Manager, and AI Assistant drawer.
9. Seed sample store data for immediate out-of-the-box exploration.
