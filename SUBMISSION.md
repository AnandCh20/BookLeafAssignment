# BookLeaf Publishing — Technical Assignment Submission

**Candidate Name:** Anand Chaurasia  
**Email:** anandchaurasia99@gmail.com  
**GitHub Profile / Repository:** [https://github.com/AnandCh20/BookLeafAssignment](https://github.com/AnandCh20/BookLeafAssignment)  
**Deliverables:** Encrypted ZIP Archive (`bookleaf-submission-encrypted.zip`), Private GitHub Repository, and Live Demo  

---

## 1. Project Overview & Deliverables

This submission delivers a complete full-stack **Author Support & Communication Portal** for BookLeaf Publishing, featuring:
- **Author Portal (`/author`):** Published titles catalog, royalty earnings/payout tracking (including edge cases like books in typesetting/cover design), support ticket submission with verification attachments, and real-time conversation updates without page refresh.
- **Operations Admin Portal (`/admin`):** Centralized ticket queue with multi-filter sorting, urgent/critical badges, 24h+ overdue flags, AI auto-classification into 6 standard categories, AI priority scoring, Knowledge-Base-grounded AI draft response generation, private internal notes, and team ticket assignment.
- **RESTful API & Interactive Docs (`/api-docs` & `/api/docs`):** Documented REST endpoints with JWT authentication and role-based access control, plus an OpenAPI 3.0 specification.
- **Encrypted Archive:** `bookleaf-submission-encrypted.zip` (Password: `BookLeaf2026Secure!`).

---

## 2. Setup Instructions to Run the Project Locally

### Prerequisites
- Node.js version 18.0 or higher
- npm (bundled with Node.js)

### Step 1: Unzip or Clone
If using the encrypted ZIP file:
```bash
unzip -P "BookLeaf2026Secure!" bookleaf-submission-encrypted.zip -d bookleaf-portal
cd bookleaf-portal
```
Or if cloning from GitHub:
```bash
git clone https://github.com/AnandCh20/BookLeafAssignment.git
cd BookLeafAssignment
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Application
```bash
npm run dev
```
Open your browser and navigate to:  
👉 **`http://localhost:3000`**

*(To run the production build instead: `npm run build && npm start`)*

---

## 3. Test Login Credentials & Evaluator Guide

The application comes pre-loaded with the entire sample dataset (10 authors, 18 books, and initial tickets).

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Aakash Mehta | `admin@bookleaf.com` | `admin123` | Senior Operations Lead |
| **Admin** | Rhea Sen | `ops@bookleaf.com` | `admin123` | Author Support Specialist |
| **Author** | Priya Sharma | `priya.sharma@email.com` | `password123` | 2 published titles; ₹3,570 pending payout |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` | `password123` | 3 titles; 1 in production (*Midnight in Mysore*) |
| **Author** | Ananya Reddy | `ananya.reddy@email.com` | `password123` | 1 title; ₹2,546 pending royalty, ₹0 paid |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` | `password123` | 2 titles; 1 in typesetting (*Raising Roots*) |

*Quick Evaluation Feature:* The author dashboard includes an **Examiner Switcher** dropdown at the top, allowing you to switch between all 10 authors with a single click without logging out.

---

## 4. Key Notes & Architectural Assumptions

### 1. Database Architecture & Zero-Friction Evaluation
- **Assumption:** Evaluators should not have to configure external MongoDB Atlas clusters, manage IP whitelists, or resolve connection timeouts to evaluate the assignment.
- **Implementation:** The app includes a built-in document repository pre-seeded with all 10 authors, 18 books, and tickets. A "Reset Sample DB" button is available on the admin console to restore clean test data at any time.
- **Production Readiness:** `mongoose` is installed and configured to connect to `MONGODB_URI` whenever an external cluster is provided.

### 2. AI Integration & Graceful Degradation
- **Assumption:** In a production publishing system processing 1,200+ monthly books, external LLM APIs may experience network timeouts or rate limits (HTTP 429). The system must never crash or block ticket creation.
- **Dual-Layer Architecture:**
  1. *Primary:* Calls OpenAI `gpt-4o-mini` if `OPENAI_API_KEY` is provided in environment variables.
  2. *Graceful Fallback:* If no API key is supplied, an intelligent domain knowledge base engine automatically classifies the ticket into the 6 standard categories, scores priority, and generates an empathetic draft grounded in BookLeaf policies (80/20 royalty split, quarterly 45-day cycle, ₹1,000 threshold, Delhi warehouse 5-7 day print turnaround, 24-48h stock sync).
- **Cost Consciousness:** Instead of dumping full document histories into prompts, the system performs selective context injection based on inquiry intent to minimize token usage.

### 3. Real-Time Communication on Serverless (Vercel)
- **Trade-off:** Stateful WebSockets often experience dropouts on serverless platforms like Vercel unless routed through external persistent socket servers.
- **Solution:** A 3.5-second polling loop paired with optimistic UI updates ensures author screens update in near real-time when an admin responds, without requiring manual page refreshes.

### 4. Code Standards & Separation of Concerns
- **Zero Comments:** All code strictly omits inline and block comments per project guidelines.
- **Server Component Boundary:** App Router page routes (`src/app/**/page.js`) are pure Server Components; interactive UI logic is cleanly encapsulated in Client Components under `src/components/`.
- **Monochrome Theme:** Implemented in Vanilla CSS with high-contrast black and white styling, responsive across mobile, tablet, and desktop viewports.
