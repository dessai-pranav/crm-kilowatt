# Spec Delta

## Purpose

Provides an interactive natural-language CRM assistant capable of answering user queries about customers, orders, and sales trends through database tool calling and conversational reasoning.

## ADDED Requirements

### Requirement: Natural-Language Data Querying
The system SHALL interpret natural-language questions regarding customers, orders, and store metrics, translating them into structured CRM queries and returning concise, accurate conversational answers.

#### Scenario: Querying top customers
- **WHEN** an operator asks "Who are our top 5 customers by total spend this year?"
- **THEN** the system SHALL execute the customer spend query and present the ranked list with customer names, spend amounts, and order counts

#### Scenario: Querying pending or delayed orders
- **WHEN** an operator asks "Which processing orders have been waiting for more than 48 hours?"
- **THEN** the system SHALL return the matching orders with order IDs, customer names, creation dates, and current statuses

### Requirement: Tool-Assisted CRM Context Retrieval
The assistant SHALL execute specialized read-only query tools (customer search, order stats, churn lists, and revenue summaries) to ground responses in actual CRM database records.

#### Scenario: Grounding response with tool execution
- **WHEN** a user prompt requires specific CRM statistics
- **THEN** the assistant SHALL invoke the appropriate CRM data tool, parse the result, and ground its answer in the returned database records without fabricating data

### Requirement: Conversational Session and Follow-ups
The assistant SHALL preserve the conversation context across multiple turns within a session to support contextual follow-ups and refinements.

#### Scenario: Asking a contextual follow-up question
- **WHEN** an operator asks a follow-up such as "Draft an email to the second one" after a list of at-risk customers is returned
- **THEN** the assistant SHALL resolve "the second one" to the respective customer record from the preceding message and generate the draft

### Requirement: Interactive Entity Links and Quick Suggestions
The assistant SHALL format mentions of customers and orders as interactive navigation links and provide contextual suggested query prompts.

#### Scenario: Linking to customer profiles in answers
- **WHEN** the assistant references a specific customer or order in its response
- **THEN** the system SHALL render clickable links navigating directly to the corresponding CRM record detail view
