# BookLeaf Publishing — Author Support & Communication Portal

A full-stack web application designed for **BookLeaf Publishing** to streamline author communications at scale. The platform connects authors with BookLeaf's operations and printing desks, powered by an AI-assisted classification, priority routing, and knowledge-grounded response generation engine.

Built with **Next.js (App Router, Node.js Fullstack Engine)**, **Vanilla CSS Design System**, **JWT Authentication & Role-Based Access Control**, and a **Resilient Domain Knowledge Engine**.

---

## Live Demo & Deployment

- **Live Demo URL:** Deployable directly to Vercel with zero external database configuration required.
- **Evaluation Accounts:** Pre-configured with the sample dataset (10 authors, 18 book titles, and initial support queries).

### Test Credentials

| Role | Name | Email | Password | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Aakash Mehta | `admin@bookleaf.com` | `admin123` | Senior Operations Lead |
| **Admin** | Rhea Sen | `ops@bookleaf.com` | `admin123` | Author Support Specialist |
| **Author** | Priya Sharma | `priya.sharma@email.com` | `password123` | 2 titles; ₹3,570 pending royalty |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` | `password123` | 3 titles; 1 in production (*Midnight in Mysore*) |
| **Author** | Ananya Reddy | `ananya.reddy@email.com` | `password123` | 1 title; ₹2,546 pending royalty, ₹0 paid |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` | `password123` | 2 titles; 1 in typesetting (*Raising Roots*) |
| **Author** | Rohit Kapoor | `rohit.kapoor@email.com` | `password123` | 2 titles; 2,079 total copies sold |
| **Author** | Vikram Joshi | `vikram.joshi@email.com` | `password123` | 2 titles; resolved marketplace ticket |

*Note: The UI includes an **Examiner Quick Switcher** and **One-Click Test Accounts** panel to test any author or admin state instantly without typing.*

---

## Key Features

### A. Author Portal (Author-Facing)
- **Email-Based Authentication & Session Isolation:** Role-based access ensures authors only access their own catalog records, royalties, and tickets.
- **My Books:** High-density catalog dashboard showing title, ISBN, genre, release status, publication date, MRP, copies sold, royalty split, paid amounts, pending amounts, print partners, and live distribution channels.
- **Production Edge Cases:** Handles edge cases gracefully (titles in Cover Design or Typesetting with null MRP or publication dates, zero payout states, and rollover thresholds).
- **Submit a Support Query:** Interactive form with dynamic book context selection (or "General / Account Level"), subject line, structured description, and verification file attachment upload interface.
- **My Tickets with Real-Time Auto-Sync:** Live polling loop (3.5s interval) updates tickets and admin responses without requiring manual page refresh. Authors can post follow-ups or close tickets upon satisfaction.

### B. Operations Portal (Admin-Facing)
- **Prioritized Ticket Queue:** Centralized inbox across all authors with multi-parameter filtering:
  - Status (*All, Open, In Progress, Resolved, Closed*)
  - Category (*Royalty & Payments, ISBN & Metadata Issues, Printing & Quality, Distribution & Availability, Book Status & Production Updates, General Inquiry*)
  - Priority (*Critical, High, Medium, Low*)
  - Sorting (*Most Urgent First, Oldest Unresolved First, Newest, Oldest*)
- **Urgent & Overdue Highlighting:** Visual flags for critical severity (pulsing alert indicators) and tickets open for more than 24-48 hours.
- **AI-Powered Auto-Classification:** Incoming queries are automatically classified into one of the 6 standard categories with full admin override capability.
- **AI-Generated Priority Score:** Automatic triage based on query semantics (e.g. unpaid royalties over threshold or Amazon ISBN mismatch are scored Critical/High, while bio updates are scored Low). Admins can override priority with one click.
- **Knowledge-Grounded AI Response Generation:** One-click AI response drafter grounded strictly in the BookLeaf Knowledge Base (80/20 royalty formula, 45-day quarterly payout cycle, ₹1,000 threshold, 5-7 business day print turnaround, 24-48h stock sync).
- **Interactive Response Workbench:** Admins can regenerate, edit, and fine-tune AI drafts before dispatching. Sent replies update ticket state and appear immediately on the author's screen.
- **Private Internal Notes:** Team-only collaboration notes hidden from authors.
- **Ticket Assignment & State Management:** Assign tickets to specific operators and track resolution lifecycles.
- **Sample Database Reseed:** Built-in "Reset Sample DB" button restores the initial evaluation dataset at any point.

---

## Architecture & Technology Decisions

### 1. Framework: Next.js (App Router, Node.js Runtime)
- **Why Next.js?** Combines server-side rendering for lightning-fast page loads with full-stack Node.js REST API route handlers.
- **Zero Client Component Leaks in Routes:** All route endpoints in `src/app/**/page.js` are pure Server Components. Interactive stateful logic is isolated in client components under `src/components/`, strictly respecting modern Next.js boundaries.
- **Fast Page Speed:** No heavy third-party UI component libraries; zero CSS bloat; builds in under 500ms and loads instantaneously.

### 2. Styling: Vanilla CSS Monochrome Design System
- Built with a curated black and white palette (`#000000`, `#09090b`, `#27272a`, `#e4e4e7`, `#ffffff`).
- Fully responsive across mobile, tablet, and desktop viewports using CSS Grid, Flexbox, and standardized CSS variables.

### 3. Data Layer: Resilient Hybrid Persistence
- **Zero Configuration Required for Evaluation:** Ships with an in-memory & file-cached repository pre-populated with the entire 10-author, 18-book dataset from `bookleaf_sample_data.json`.
- **Database Extensibility:** Ready for MongoDB Atlas connection via `MONGODB_URI` environment variable if desired.

### 4. Real-Time Updates
- Implemented via a lightweight polling synchronization mechanism (3.5s interval) and optimistic UI updates. This delivers the real-time experience required without the connection dropouts and websocket overhead typical of serverless server environments like Vercel.

---

## AI Integration Details

### 1. Prompt Engineering & Domain Knowledge Grounding
The AI system uses structured system prompts enriched with BookLeaf's operational policies:
- **Empathetic & Professional Tone:** Acknowledges author concerns first before providing operational solutions.
- **Ownership:** Acknowledges operational issues (e.g. inventory sync delays, print defects) without defensive deflection.
- **Concrete Timelines:** Provides 24-to-48-hour resolution commitments instead of open-ended assurances.
- **Clear Actionable Next Steps:** Instructs the author on required items (e.g. photos for reprint verification) or specifies internal escalation steps.

### 2. Graceful Degradation & Error Resilience
A key requirement of the assignment is handling cases where an LLM API is offline, down, or rate-limited:
- The system includes a dual-layer architecture:
  1. Primary: Calls OpenAI (`gpt-4o-mini`) when `OPENAI_API_KEY` is provided.
  2. Fallback: An intelligent heuristic domain rule engine grounded in the BookLeaf knowledge base.
- If the AI API fails, times out, or no API key is configured, **tickets are still created, accurately classified, scored for priority, and draft responses are generated without returning generic 500 errors.** Admins can always edit and compose responses manually.

### 3. Cost Awareness & Token Optimization
- Instead of dumping the entire author history and company documents into every prompt, the backend performs **selective context retrieval**:
  - Payout inquiries only receive the Royalty Policy section.
  - Print defect queries only receive the Printing & Quality section.
  - Catalog discrepancies only receive the ISBN Policy section.
- Output tokens are constrained, and temperature is kept low (`0.1` for classification, `0.3` for response generation) to minimize variance and hallucinations.

### 4. Model Choice Justification
- **Selected Model:** OpenAI `gpt-4o-mini` (with seamless support for Claude 3.5 Haiku / Google Gemini Flash).
- **Justification:** High instruction-following accuracy for structured JSON classification, rapid latency (<1 second), and extremely cost-effective token pricing (~$0.15 per million tokens), making it the ideal choice for high-volume support triage at BookLeaf scale.

---

## REST API Specification

### Authentication Endpoints
- `POST /api/auth/login`: Authenticates an author or admin, returns a JWT token, and sets an `httpOnly` session cookie.
- `GET /api/auth/me`: Retrieves current authenticated profile and books.
- `POST /api/auth/logout`: Clears authentication session cookies.

### Authors & Books Endpoints
- `GET /api/authors`: Retrieves author profiles. Supports `?demo=true` for evaluator switching.
- `GET /api/books`: Retrieves books belonging to the active author, or all catalog titles for administrators.

### Tickets Endpoints
- `GET /api/tickets`: Returns tickets filtered by `status`, `category`, `priority`, `sort`, `search`, or `author_id`.
- `POST /api/tickets`: Submits a support query. Triggers AI classification, priority calculation, and initial response drafting.
- `GET /api/tickets/:id`: Retrieves full ticket record and message thread. Omits internal notes when accessed by authors.
- `PATCH /api/tickets/:id`: Updates ticket status, category override, priority override, or assigned owner.
- `POST /api/tickets/:id/messages`: Posts a reply to the ticket thread. Admin replies update ticket status and are visible to the author immediately.
- `POST /api/tickets/:id/notes`: Adds a private internal note (Admin only).
- `POST /api/tickets/:id/ai-draft`: Generates or regenerates an AI response draft grounded in BookLeaf policies (Admin only).

### Utilities & Documentation Endpoints
- `POST /api/seed`: Resets the database to the 10-author, 18-book seed dataset.
- `GET /api/seed`: Returns current dataset summary metrics.
- `GET /api/docs`: Returns the full OpenAPI 3.0 JSON specification.

Interactive API documentation is also available directly at the `/api-docs` web route.

---

## Local Development Setup

### Prerequisites
- Node.js version 18 or higher (v20+ recommended)
- npm version 9 or higher

### Installation & Run

1. Clone or extract the project files into your working directory:
```bash
cd Assignment
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure environment variables:
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your `OPENAI_API_KEY` if you wish to use live LLM calls. If omitted, the built-in intelligent knowledge base engine activates automatically.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

6. To create a production build:
```bash
npm run build
npm start
```

---

## Encrypted Project Packaging

As requested, the project includes an automated script to generate a password-protected zip archive of the submission:

```bash
chmod +x scripts/encrypt_zip.sh
./scripts/encrypt_zip.sh
```

- Default encryption password: `BookLeaf2026Secure!`
- Output archive: `bookleaf-submission-encrypted.zip`

---

## Known Limitations & Production Roadmap

1. **Persistent Relational Database:** In production, transition from in-memory/file caching to PostgreSQL with Prisma/Drizzle ORM for transactional consistency across concurrent database writes.
2. **WebSockets / Server-Sent Events (SSE):** While 3.5s polling provides near-instant synchronization on serverless platforms, a managed WebSocket gateway (e.g. AWS API Gateway WebSocket or Pusher) would support instantaneous push notifications at scale.
3. **Multi-File Cloud Storage:** File attachments are currently handled via a simulated upload preview. In production, integrate AWS S3 or Google Cloud Storage signed upload URLs for photo verification.
4. **Vector Knowledge Retrieval (RAG):** As BookLeaf's knowledge base expands to hundreds of edge-case documents, replace keyword extraction with pgvector semantic similarity search.
