# Spec Delta

## Purpose

Provides deterministic rules and RFM-based customer segmentation and churn indicator scoring to group customers into queryable cohorts for marketing, analytics, and workflow automation.

## ADDED Requirements

### Requirement: Deterministic RFM Scoring and Segment Classification
The system SHALL compute Recency (days since last purchase), Frequency (total lifetime orders), and Monetary value (cumulative spend) for each customer, mapping them deterministically into segments including VIP, Loyal, Promising, At-Risk, Dormant, and New.

#### Scenario: Classifying VIP customer
- **WHEN** a customer's cumulative spend and order frequency meet or exceed the top percentile store thresholds
- **THEN** the system SHALL assign the customer to the VIP segment and update the segment timestamp

#### Scenario: Classifying Dormant customer
- **WHEN** a customer has placed past orders but has no orders within the store's dormancy timeframe
- **THEN** the system SHALL assign the customer to the Dormant segment

### Requirement: Customer Churn Indicator Evaluation
The system SHALL evaluate deterministic churn indicators based on purchase cycle intervals, elapsed days since last order, and order frequency changes, assigning a churn risk rating of Low, Medium, or High with explicit contributing reasons.

#### Scenario: Flagging high churn risk for overdue repeat buyer
- **WHEN** an established customer with multiple historical orders exceeds 2.5 times their average re-order window without an order
- **THEN** the system SHALL designate the customer as High Churn Risk and record the elapsed days as contributing evidence

#### Scenario: Low churn risk for recently active buyer
- **WHEN** a customer placed an order within the recent activity window
- **THEN** the system SHALL evaluate the customer as Low Churn Risk

### Requirement: Segment Availability for AI and Workflows
The system SHALL expose computed customer segments and churn risk attributes as queryable properties within customer directory filters, tool-calling queries for the AI assistant, and condition checks in automated workflows.

#### Scenario: Filtering customer directory by segment
- **WHEN** an operator filters the customer directory by "At-Risk"
- **THEN** the system SHALL return all customers currently classified in the At-Risk segment

#### Scenario: Workflow evaluating customer segment condition
- **WHEN** an automated workflow checks whether a customer belongs to the "VIP" segment
- **THEN** the workflow engine SHALL evaluate the customer's deterministic segment tag to branch execution
