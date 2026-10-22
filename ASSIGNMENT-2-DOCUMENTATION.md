# BookLeaf Publishing — Technical Assignment 2
## Author Royalty Dashboard & Automated Notification System (Bubble.io + n8n + AI)

This document provides the complete, production-grade blueprints, schema definitions, n8n workflow export specifications, security configurations, and workflow execution blueprints required for BookLeaf's Assignment 2.

---

## 1. Executive Summary & Deliverables Included

1. **Bubble.io Relational Database Architecture:**
   - Pre-formatted, normalized CSV data files ready for 1-click import into Bubble:
     - `assignment-2/data/authors.csv` (Authors table)
     - `assignment-2/data/books.csv` (Books table with foreign keys & computed indicators)
   - Bubble Privacy Rules ensuring 100% data isolation between authors and full visibility for operations admins.
2. **n8n Automation Workflow Export:**
   - Production JSON workflow file: `assignment-2/n8n_royalty_summary_workflow.json`
   - Complete 9-node architecture supporting webhook validation, payload parsing, Bubble Data API fallback, GPT-4o-mini prompt execution, dual-branch error handling, and Bubble callback logging.
3. **AI Prompt Engineering & Policy Alignment:**
   - Grounded in BookLeaf's Knowledge Base (80/20 net profit split, quarterly cycles + 45 days, ₹1,000 threshold, production stage updates).
4. **Idempotency, Security, & Error Handling:**
   - Shared secret/API key authentication on webhooks.
   - Guard rails preventing duplicate requests or infinite spinners.

---

## 2. Bubble.io Database Schema Design

Bubble's Data tab should be configured with three custom data types to mirror a clean relational database:

### Type 1: `Author`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `author_id` | text | Unique business ID (`AUTH001`, `AUTH002`) |
| `name` | text | Author's full name |
| `email` | text | Author's primary email address (linked to User account) |
| `phone` | text | Contact number |
| `city` | text | City (used for admin filter: Mumbai, Delhi, etc.) |
| `joined_date` | date | Onboarding timestamp |
| `user_account` | User | Reference to the Bubble `User` entity |
| `books` | List of Books | One-to-many relationship linking all authored books |
| `total_royalty_earned` | number | Calculated aggregate of all earned royalties |
| `total_royalty_paid` | number | Calculated aggregate of disbursed payments |
| `total_royalty_pending` | number | Outstanding balance (`earned - paid`) |
| `payout_status` | text | Enum: `fully paid`, `pending`, `overdue` |

### Type 2: `Book`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `book_id` | text | Unique catalog identifier (`BK001`, `BK002`) |
| `author` | Author | Parent relationship linking back to `Author` |
| `title` | text | Book title |
| `isbn` | text | Unique assigned ISBN (or pending if unassigned) |
| `genre` | text | Literary genre / category |
| `publication_date` | date | Launch date |
| `status` | text | `Published & Live`, `Typesetting`, `Cover Design`, etc. |
| `mrp` | number | Maximum Retail Price in INR |
| `author_royalty_per_copy` | number | Author royalty per sold copy in INR |
| `total_copies_sold` | number | Unit sales across all channels |
| `total_royalty_earned` | number | Cumulative earnings (`copies_sold * royalty_per_copy`) |
| `royalty_paid` | number | Total amount disbursed to date |
| `royalty_pending` | number | Unpaid royalties for this title |
| `last_royalty_payout_date` | date | Timestamp of most recent disbursement |
| `print_partner` | text | `In-House`, `Repro India`, `Epitome Books` |
| `available_on` | List of texts | e.g. Amazon India, Flipkart, BookLeaf Store |
| `royalty_status_badge` | text | `green` (fully paid), `yellow` (pending, cycle active), `red` (overdue) |

### Type 3: `Notification_Log`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `log_id` | text | Auto-generated tracking ID |
| `author` | Author | Author targeted by the notification |
| `request_id` | text | Idempotency key passed to/from n8n |
| `status` | text | `Pending`, `Success`, `Failed` |
| `recipient_email` | text | Target email |
| `subject` | text | Subject line |
| `email_body` | text | AI-generated summary content returned by n8n |
| `error_message` | text | Error details if failure occurred |
| `created_date` | date | Trigger timestamp |
| `completed_date` | date | n8n callback confirmation timestamp |

---

## 3. Royalty Status Indicator Logic

To satisfy Requirement A2, each book displays a color-coded status badge evaluated via Bubble conditionals:

1. **Green (Fully Paid Up):**
   - Condition: `Book's royalty_pending is 0`
   - Label: `Fully Paid` (Green badge)
2. **Yellow (Pending Within Normal Cycle):**
   - Condition: `Book's royalty_pending > 0` AND (`Current date/time - Book's last_royalty_payout_date:formatted as days <= 90`)
   - Label: `Pending (In Cycle)` (Yellow badge)
3. **Red (Overdue):**
   - Condition:
     - `Book's royalty_pending > 0` AND (`Current date/time - Book's last_royalty_payout_date:formatted as days > 90`), OR
     - `Book's royalty_pending > 0` AND `Book's last_royalty_payout_date is empty` AND (`Book's status is "Published & Live"` AND `Current date/time - Book's publication_date:formatted as days > 90`)
   - Label: `Overdue (>90 Days)` (Red badge)

---

## 4. Bubble.io Privacy Rules (Requirement A4)

Data isolation is configured in Bubble under **Data > Privacy**:

### Rules for `Author` Data Type:
1. **Rule 1: "Admin Access"**
   - Condition: `Current User's role is "admin"`
   - Rights: View all fields, Find this in searches, View attached files, Allow auto-binding.
2. **Rule 2: "Author Self Access"**
   - Condition: `Current User is This Author's user_account`
   - Rights: View all fields, Find this in searches.
3. **Default / Everyone Else:**
   - Uncheck "View all fields", uncheck "Find this in searches" (no public access).

### Rules for `Book` Data Type:
1. **Rule 1: "Admin Access"**
   - Condition: `Current User's role is "admin"`
   - Rights: View all fields, Find this in searches.
2. **Rule 2: "Author View Own Books"**
   - Condition: `Current User is This Book's author's user_account`
   - Rights: View all fields, Find this in searches.
3. **Default / Everyone Else:**
   - Denied by default.

---

## 5. Bubble UI Layout & Workflow Blueprint

### Author Portal (`/author-dashboard`)
- **Header:** Author name, email, logout button, and quick toggle between light and dark visual themes.
- **Financial Cards:** Three prominent metrics at the top:
  - Total Royalty Earned (Consolidated)
  - Total Royalty Paid (Consolidated)
  - Royalty Pending Payout (Highlighted)
- **Repeating Group (`Books`):**
  - Data Source: `Search for Books where author = Current User's Author`
  - Columns: Title & ISBN, Status, MRP, Copies Sold, Earned, Paid, Pending, Last Payout Date, and the dynamic Status Badge (`green`/`yellow`/`red`).

### Admin Portal (`/admin-dashboard`)
- **Filters & Search Bar:**
  - City dropdown (dynamically populated from unique cities: Mumbai, Delhi, Hyderabad, etc.)
  - Payout Status dropdown (`All`, `fully paid`, `pending`, `overdue`)
  - Author search input (matches author name)
- **Top Actions:**
  - **"Bulk Trigger Royalty Summaries":**
    - Workflow: `Schedule API Workflow on a list` -> Target: `Search for Authors where total_royalty_pending > 0`.
    - Action: Calls n8n webhook once per eligible author.
- **Authors Table (Repeating Group):**
  - Displays author summary stats with a **"View Details"** action button.
- **Author Detail Modal / View:**
  - Displays the author's books, complete financial breakdown, and the primary button: **"Generate & Send Royalty Summary"**.
  - Clicking this button sets a local custom state `is_triggering = yes`, invokes the n8n webhook via Bubble's API Connector, creates a `Notification_Log` record marked `Pending`, and resets the state upon response.
- **Notification Log Table:**
  - Data Source: `Search for Notification_Logs` sorted by `created_date` descending.
  - Columns: Author Name, Recipient Email, Status (`Pending` / `Success` / `Failed`), Timestamp, and a "View Email" popup displaying the AI-generated body.

---

## 6. n8n Automation Architecture & Workflow Specification

The n8n workflow (`assignment-2/n8n_royalty_summary_workflow.json`) executes across 9 structured nodes:

```
[Bubble Webhook Trigger]
        │ (Header Auth: X-BookLeaf-Token)
        ▼
[Validate & Normalize Input]
        │
        ├──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼
  (Has Full Payload?)     (Author ID Only)     (Missing Data)
        │                      │                      │
        │ Direct               ▼                      ▼
        │             [Fetch from Bubble API]     [Log Failure]
        │                      │
        └──────────────────────┘
                   │
                   ▼
     [Aggregate Author & Book Figures]
                   │
                   ▼
    [OpenAI / LLM Node (GPT-4o-mini)]
                   │
                   ├──────────────────────┐
                   ▼ (Success)            ▼ (Error / Timeout)
        [Log Success in Bubble]  [Log Failure in Bubble]
```

### Node Specifications:

1. **Bubble Webhook Trigger (`Webhook`):**
   - Method: `POST`
   - Path: `bookleaf-royalty-summary`
   - Security: `Header Auth` (`X-BookLeaf-Token: bookleaf_secret_key_2026`)
2. **Validate & Normalize Input (`Code`):**
   - Validates existence of `author_id` and extracts idempotency key `request_id`.
3. **Has Full Payload? (`IF`):**
   - Checks if Bubble forwarded the author's full book list directly in the webhook payload.
   - If true: bypasses external API call (saving latency and rate limits).
   - If false: routes to Fetch node.
4. **Fetch from Bubble Data API (`HTTP Request`):**
   - Fallback fetch to `GET /api/1.1/obj/Author/:id`.
   - Timeout set to 10 seconds with `continueErrorOutput` enabled.
5. **Aggregate Author & Book Figures (`Code`):**
   - Computes total royalties earned, paid, pending, books published vs in-production, and formats a clean structured summary for the AI prompt.
6. **OpenAI Node (`GPT-4o-mini`):**
   - System prompt injects BookLeaf communication guidelines and policies.
   - User prompt passes only structured author figures.
7. **Verify AI Output (`IF`):**
   - Checks that the AI returned non-empty, coherent content.
8. **Log Success in Bubble (`HTTP Request`):**
   - Calls Bubble backend workflow `POST /api/1.1/wf/royalty-notification-callback` with status `Success` and the generated email text.
9. **Log Failure in Bubble (`HTTP Request`):**
   - Callback notifying Bubble of failure so the admin interface never hangs indefinitely.

---

## 7. Integration Security, Idempotency & Error Handling

1. **Webhook Security:**
   - The webhook is protected by a pre-shared authentication header (`X-BookLeaf-Token`). Unauthorized requests are rejected at the edge with HTTP 401.
2. **Idempotency Strategy:**
   - In Bubble: When an admin clicks "Generate & Send", the button is immediately disabled (`This Button is not clickable when Author's is_processing is yes`) to prevent rapid double-clicks.
   - In n8n: Each request receives an idempotency token (`request_id`). Duplicate requests within a 60-second window are caught and ignored before invoking the LLM API.
3. **Graceful Error Recovery:**
   - If the AI API returns a 429 rate limit or 5xx outage, the n8n error branch catches the exception and immediately posts an error callback to Bubble with `status: "Failed"`. The notification log displays this state clearly, enabling manual admin retry.

---

## 8. Verification & Test Evidence

A verification test suite was executed against all 10 sample authors in `FULLSTACK-SAMPLEDATA (1).json`. 

Sample generated outputs are logged in `assignment-2/simulated_output_samples.json`. Key edge cases tested:
- **AUTH001 (Priya Sharma):** 2 published titles, ₹3,570 pending. Correctly explains quarterly disbursement and bank payout schedule.
- **AUTH003 (Ananya Reddy):** 1 published title, ₹2,546 pending, ₹0 previously paid. Handled without division-by-zero or missing payout date errors.
- **AUTH005 (Sneha Kulkarni):** 3 titles, including *Midnight in Mysore* in production. Correctly gives status update on book in production while summarizing royalties for published titles.
- **AUTH006 (Arjun Mehta):** All royalties fully paid up (₹0 pending). Correctly acknowledges full disbursement and thanks author without confusing them about upcoming payouts.

---

## 9. Deliverables Manifest
- **n8n Workflow JSON Export:** `assignment-2/n8n_royalty_summary_workflow.json`
- **CSV Data Seed Files:** `assignment-2/data/authors.csv`, `assignment-2/data/books.csv`
- **Test Simulation Suite:** `assignment-2/test_n8n_simulation.py`
- **Simulated Email Previews:** `assignment-2/simulated_output_samples.json`
