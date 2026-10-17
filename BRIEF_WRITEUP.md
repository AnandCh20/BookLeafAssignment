# Engineering Approach & Architecture Write-Up

**Candidate:** Full-Stack Developer Position  
**Project:** BookLeaf Author Support & Communication Portal  

---

### 1. What I Prioritised

BookLeaf's core challenge is operational scale: handling communication across thousands of authors and 22,000+ catalog titles without compromising empathy, speed, or accuracy. In designing this system, I prioritised three pillars:

1. **A Reliable, Knowledge-Grounded AI Core:**
   Instead of viewing AI as a superficial autocomplete feature, I treated it as an operational decision-support tool. The prompt architecture embeds BookLeaf's exact operating policies (80/20 royalty split, quarterly disbursement schedules, 5–7 day print turnaround, ₹1,000 thresholds, and stock sync latency rules). It enforces an empathetic tone where authors are treated as partners, issues are acknowledged upfront, and concrete 24-to-48-hour resolution windows are committed to.

2. **Zero-Failure Graceful Degradation:**
   In real production environments, external LLM APIs experience rate limits, transient network outages, and billing interruptions. The application is built with a dual-layer AI strategy: an active LLM provider (`gpt-4o-mini`) backed by an in-engine heuristic knowledge base engine. If an API key is missing or fails, ticket ingestion, priority assignment, category classification, and draft generation continue uninterrupted without producing generic 500 errors.

3. **Thoughtful Product Experience (Both Sides of the Counter):**
   - **For Authors:** Clear visibility into their books and royalties (including edge cases like titles in typesetting or cover design), frictionless query submission, and real-time updates when an admin replies.
   - **For Operations:** An actionable queue that surfaces critical severity and oldest unresolved tickets first, with single-click classification overrides, priority overrides, private internal notes, and AI response drafting.

---

### 2. Trade-Offs Made

- **Polling vs. WebSockets on Serverless:**
  I opted for a 3.5-second polling loop over persistent WebSockets. On serverless platforms like Vercel, stateful WebSocket connections require separate long-running infrastructure (e.g. standalone Node server or managed push service). Polling provided robust, near-instantaneous synchronization that functions reliably on any host without additional connection management overhead.
- **In-Memory & Persistent Hybrid Store vs. External Database Mandatory Setup:**
  To guarantee that the evaluator and examiners can run `npm run dev` or deploy to Vercel without debugging database connection strings or IP whitelists, I implemented a robust in-memory store initialized with the full 10-author, 18-book dataset, while maintaining standard schema interfaces ready for MongoDB/PostgreSQL connection.
- **Client Components Scoped to Component Files:**
  I adhered strictly to Next.js best practices by keeping route files (`src/app/**/page.js`) as Server Components, isolating interactive client state inside `src/components/`. This ensures optimal server-side rendering performance, fast initial load times, and clean architectural separation.

---

### 3. How I'd Evolve This into a Production System

If deployed to serve BookLeaf's catalog of 22,000+ titles and 1,200 monthly new releases, I would implement:

1. **Semantic RAG with Vector Search (pgvector):** Replace category-matched knowledge retrieval with chunked vector embeddings over BookLeaf's full SOPs, print partner contracts, and distributor SLAs.
2. **Event-Driven Background Queues (BullMQ / Redis):** Move AI classification, draft generation, and email dispatch into asynchronous worker queues to ensure ticket submission latency remains under 50ms.
3. **Omnichannel Author Ingestion:** Connect incoming email threads (SendGrid Inbound Parse) and WhatsApp Business API into this unified ticket desk so authors can message from their preferred channels.
4. **Automated Analytics & SLA Monitoring:** Introduce dashboard reporting for Average First Response Time (FRT), AI draft acceptance rate, recurring printer defect patterns, and distributor stock sync latency alerts.
