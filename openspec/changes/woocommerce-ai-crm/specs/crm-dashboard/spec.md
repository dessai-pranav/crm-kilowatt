# Spec Delta

## Purpose

Provides an executive CRM dashboard displaying core revenue KPIs, sales velocity trends, customer health distributions, real-time activity feeds, and prioritized AI action alerts.

## ADDED Requirements

### Requirement: Executive KPI Cards
The system SHALL display real-time KPI overview cards including Total Revenue, Total Orders, Total Customers, Average Order Value (AOV), and WooCommerce sync status with period-over-period comparison trends.

#### Scenario: Viewing dashboard metrics
- **WHEN** an operator accesses the CRM dashboard
- **THEN** the system SHALL compute and display current totals for revenue, orders, customers, and AOV alongside recent growth indicators

#### Scenario: Sync status indicator
- **WHEN** WooCommerce sync status is active or recently completed
- **THEN** the dashboard SHALL display the timestamp of the last successful sync and health status indicator

### Requirement: Revenue and Order Trend Visualization
The system SHALL present interactive charts illustrating daily and monthly sales revenue and order volume over selectable time windows (e.g. 7 days, 30 days, 90 days).

#### Scenario: Switching time periods
- **WHEN** an operator switches the trend chart time range from 7 days to 30 days
- **THEN** the system SHALL update the visualization to display aggregated daily metrics for the past 30 days

### Requirement: Customer Health Distribution
The system SHALL render a customer segmentation distribution visualizing the breakdown of customers across segments (VIP, Loyal, Promising, At-Risk, Dormant, New).

#### Scenario: Inspecting customer segment counts
- **WHEN** viewing the customer health panel
- **THEN** the system SHALL display the count and percentage of total customer base within each RFM segment

### Requirement: Prioritized Action Alerts and Activity Feed
The system SHALL display a prioritized list of high-value AI recommendations, pending human communication approvals, and workflow/sync alerts alongside an event feed of recent orders and customer interactions.

#### Scenario: Clicking an AI alert
- **WHEN** an operator clicks on a high-priority action card in the dashboard
- **THEN** the system SHALL navigate directly to the affected customer 360 profile with the recommended action highlighted

#### Scenario: Reviewing pending human approval badge
- **WHEN** there are workflow actions waiting for operator approval
- **THEN** the dashboard SHALL display a prominent pending approval counter linking directly to the approval queue
