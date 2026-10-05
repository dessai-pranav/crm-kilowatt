# Spec Delta

## Purpose

Provides centralized order tracking, filtering, line-item details, financial totals, and lifecycle management for WooCommerce e-commerce orders.

## ADDED Requirements

### Requirement: Centralized Order Listing and Filtering
The system SHALL display all synchronized orders with pagination, order ID search, customer lookup, date range filtering, and status filtering (such as pending, processing, completed, on-hold, refunded, cancelled).

#### Scenario: Filtering orders by status
- **WHEN** an operator filters the order view by "completed"
- **THEN** the system SHALL display only orders with completed status

#### Scenario: Searching orders by customer name or order number
- **WHEN** an operator enters an order number or customer name in the search bar
- **THEN** the system SHALL return matching order records

### Requirement: Order Details and Line Item Inspection
The system SHALL present a detailed view for each order containing line item names, SKU, quantity, unit price, subtotal, tax amount, shipping fee, discount breakdown, and associated customer details.

#### Scenario: Viewing order detail breakdown
- **WHEN** an operator selects an order from the list
- **THEN** the system SHALL display the itemized line items, pricing calculations, billing address, shipping address, and payment method

#### Scenario: Navigating from order to customer
- **WHEN** an operator clicks the customer link in an order detail view
- **THEN** the system SHALL navigate directly to that customer's 360 profile

### Requirement: Order Lifecycle Timeline
The system SHALL display an order lifecycle timeline showing order creation timestamp, status changes, payment confirmation, and sync events.

#### Scenario: Inspecting status transitions
- **WHEN** an operator inspects the history timeline of an order
- **THEN** the system SHALL render all historical status changes with corresponding timestamps
