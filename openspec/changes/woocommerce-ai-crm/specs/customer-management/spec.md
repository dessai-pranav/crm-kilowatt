# Spec Delta

## Purpose

Enables centralized customer management, advanced filtering, and rich 360-degree customer profiles combining order history, lifetime value metrics, notes, and activity timelines.

## ADDED Requirements

### Requirement: Customer Directory Search and Filtering
The system SHALL provide a paginated list of customers with search by name, email, or phone, along with sorting and filtering by customer segment, order count, total spend, and date added.

#### Scenario: Searching customers by keyword
- **WHEN** an operator enters a search query matching a customer's name or email
- **THEN** the system SHALL return matching customer records ranked by relevance

#### Scenario: Filtering by spending threshold
- **WHEN** an operator filters the customer directory by a minimum total spend value
- **THEN** the system SHALL display only customers whose cumulative order total meets or exceeds that value

### Requirement: Customer 360 Profile Aggregation
The system SHALL display a unified Customer 360 profile view displaying customer contact information, lifetime order count, cumulative spend, average order value, full order history, and chronological timeline.

#### Scenario: Viewing a customer 360 profile
- **WHEN** an operator selects a customer from the directory
- **THEN** the system SHALL present the full 360 view including biographical info, lifetime metrics, past orders, interaction history, and associated AI insights

#### Scenario: Customer without order history
- **WHEN** an operator views a customer profile who has zero recorded orders
- **THEN** the system SHALL display zeroed lifetime metrics and an empty state indicator for order history

### Requirement: Customer Notes and Tagging
The system SHALL allow operators to create, view, update, and delete internal notes and assign tags to customer profiles for team collaboration.

#### Scenario: Adding an internal note
- **WHEN** an operator submits an internal note on a customer's profile
- **THEN** the system SHALL save the note with author identity and timestamp, immediately rendering it in the customer's activity timeline

#### Scenario: Tagging a customer
- **WHEN** an operator assigns one or more custom tags to a customer profile
- **THEN** the system SHALL persist the tags and allow filtering by those tags in the customer directory
