# Spec Delta

## Purpose

Provides secure credential management, connection testing, REST API synchronization, verified webhook ingestion, and idempotent data persistence for WooCommerce stores.

## ADDED Requirements

### Requirement: WooCommerce Connection Configuration
The system SHALL store WooCommerce connection settings (store URL, Consumer Key, Consumer Secret, and Webhook Secret) securely and validate API connectivity against the WooCommerce REST API.

#### Scenario: Valid credentials verification
- **WHEN** an operator submits valid WooCommerce API credentials and requests a connection test
- **THEN** the system SHALL return a successful connection status with store metadata

#### Scenario: Invalid credentials verification
- **WHEN** an operator submits invalid WooCommerce API credentials
- **THEN** the system SHALL return an authentication error and highlight the invalid configuration

### Requirement: Idempotent Customer Synchronization
The system SHALL ingest and update WooCommerce customer records into the CRM customer database, storing WooCommerce customer IDs as stable external identifiers and executing upsert operations to prevent duplicate records upon repeated sync or webhook deliveries.

#### Scenario: Ingest new customers with external identifier
- **WHEN** a customer sync operation runs and detects customers not present in the CRM
- **THEN** the system SHALL create CRM customer records mapped to their WooCommerce customer IDs and record the import count

#### Scenario: Idempotent update on existing customer
- **WHEN** a customer sync or webhook event delivers customer data already existing in the CRM
- **THEN** the system SHALL update the existing customer record without creating a duplicate record

### Requirement: Idempotent Order Synchronization
The system SHALL ingest WooCommerce orders into the CRM using the WooCommerce order ID as the unique external key, capturing order statuses, line items, monetary amounts, taxes, payment methods, and timestamps via upsert logic.

#### Scenario: Ingest new orders
- **WHEN** an order sync or webhook runs and receives new orders from WooCommerce
- **THEN** the system SHALL upsert each order, link it to the corresponding CRM customer record, and persist itemized line items

#### Scenario: Idempotent update on order status
- **WHEN** an existing order's status changes in WooCommerce (e.g. from Processing to Completed) and is received via sync or webhook
- **THEN** the system SHALL update the order status in the CRM and record an update event without duplicating line items or order entities

### Requirement: WooCommerce Webhook Ingestion and Verification
The system SHALL expose an HTTP webhook endpoint to receive near-real-time customer, order, and product event payloads from WooCommerce, validating each payload using HMAC-SHA256 signature verification against the configured webhook secret.

#### Scenario: Valid webhook payload processing
- **WHEN** a webhook request arrives with a valid HMAC-SHA256 signature header for an order or customer event
- **THEN** the system SHALL verify the signature, process the event payload idempotently, and return an HTTP 200 response

#### Scenario: Invalid webhook signature rejection
- **WHEN** a webhook request arrives with an invalid or missing signature header
- **THEN** the system SHALL reject the request with HTTP 401 Unauthorized, abort payload processing, and log the security failure

### Requirement: Synchronization and Webhook Failure Audit Logging
The system SHALL record audit logs in `SyncLog` for every synchronization run and webhook delivery, capturing source, timestamp, execution duration, processed record counts, status (SUCCESS or FAILED), and failure details.

#### Scenario: Recording successful sync execution
- **WHEN** a REST sync or webhook batch completes without error
- **THEN** the system SHALL persist an audit entry with status SUCCESS and the count of processed records

#### Scenario: Recording sync or webhook failures
- **WHEN** a sync run or webhook payload fails due to network, validation, or database errors
- **THEN** the system SHALL persist an audit entry with status FAILED, the error description, and error context for troubleshooting
