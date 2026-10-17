"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { FileCode, ArrowLeft, Check, Copy } from "lucide-react";
import Link from "next/link";

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/auth/login",
    auth: "Public",
    description: "Authenticates an author or administrator and sets an httpOnly session cookie and returns a JWT token.",
    body: JSON.stringify({ email: "priya.sharma@email.com", password: "password123", role: "author" }, null, 2),
    response: JSON.stringify({ success: true, user: { id: "AUTH001", name: "Priya Sharma", email: "priya.sharma@email.com", role: "author" }, token: "eyJhbGciOi..." }, null, 2)
  },
  {
    method: "GET",
    path: "/api/auth/me",
    auth: "Cookie / Bearer Token",
    description: "Returns the authenticated user's profile and published books catalog.",
    body: null,
    response: JSON.stringify({ user: { id: "AUTH001", name: "Priya Sharma", email: "priya.sharma@email.com", role: "author", books: [] } }, null, 2)
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    auth: "Session",
    description: "Clears authentication cookies and invalidates client session.",
    body: null,
    response: JSON.stringify({ success: true, message: "Logged out successfully." }, null, 2)
  },
  {
    method: "GET",
    path: "/api/authors",
    auth: "Role-based (author sees self; admin sees all)",
    description: "Retrieves list of authors. Supports ?demo=true for quick author switching.",
    body: null,
    response: JSON.stringify({ authors: [{ author_id: "AUTH001", name: "Priya Sharma", email: "priya.sharma@email.com", books_count: 2 }] }, null, 2)
  },
  {
    method: "GET",
    path: "/api/books",
    auth: "Role-based",
    description: "Retrieves books belonging to current author, or all 18 catalog books if administrator.",
    body: null,
    response: JSON.stringify({ books: [{ book_id: "BK001", title: "Whispers of the Ganges", isbn: "978-93-5XXXX-01-1", total_royalty_earned: 11970 }] }, null, 2)
  },
  {
    method: "GET",
    path: "/api/tickets",
    auth: "Role-based",
    description: "Retrieves tickets list. Supports query filters: status, category, priority, sort, search.",
    body: null,
    response: JSON.stringify({ tickets: [{ ticket_id: "TCK-1001", subject: "Pending royalty payout question for Q3", category: "Royalty & Payments", priority: "High", status: "In Progress" }] }, null, 2)
  },
  {
    method: "POST",
    path: "/api/tickets",
    auth: "Author / Admin",
    description: "Creates a support ticket. Automatically classifies category and assigns priority using AI, and pre-generates an AI draft reply.",
    body: JSON.stringify({ book_id: "BK001", subject: "Royalty delay inquiry", description: "I have not received my quarterly payment.", attachments: [] }, null, 2),
    response: JSON.stringify({ success: true, ticket: { ticket_id: "TCK-1006", category: "Royalty & Payments", priority: "High", status: "Open" } }, null, 2)
  },
  {
    method: "GET",
    path: "/api/tickets/{id}",
    auth: "Role-based (author can only access own ticket)",
    description: "Retrieves ticket details and message thread. Internal notes and drafts are hidden from authors.",
    body: null,
    response: JSON.stringify({ ticket: { ticket_id: "TCK-1001", subject: "...", messages: [] } }, null, 2)
  },
  {
    method: "PATCH",
    path: "/api/tickets/{id}",
    auth: "Admin (or author closing ticket)",
    description: "Updates ticket metadata such as status, category override, priority override, or assigned owner.",
    body: JSON.stringify({ status: "Resolved", priority: "High", category: "Royalty & Payments", assigned_to: "Aakash Mehta" }, null, 2),
    response: JSON.stringify({ success: true, ticket: { ticket_id: "TCK-1001", status: "Resolved" } }, null, 2)
  },
  {
    method: "POST",
    path: "/api/tickets/{id}/messages",
    auth: "Ticket Author / Admin",
    description: "Appends a message to the ticket conversation. Admin responses update ticket status and are immediately reflected on author screen.",
    body: JSON.stringify({ content: "Official BookLeaf response...", status: "Resolved" }, null, 2),
    response: JSON.stringify({ success: true, message: { message_id: "MSG-172915...", sender_name: "Aakash Mehta", content: "..." } }, null, 2)
  },
  {
    method: "POST",
    path: "/api/tickets/{id}/notes",
    auth: "Admin Only",
    description: "Adds an internal note restricted to the operations team.",
    body: JSON.stringify({ content: "Finance department verified bank transaction." }, null, 2),
    response: JSON.stringify({ success: true, note: { note_id: "NOTE-172915...", author_name: "Aakash Mehta", content: "..." } }, null, 2)
  },
  {
    method: "POST",
    path: "/api/tickets/{id}/ai-draft",
    auth: "Admin Only",
    description: "Generates or regenerates an AI draft response based on the BookLeaf Knowledge Base and author query context.",
    body: null,
    response: JSON.stringify({ success: true, ai_draft: "Dear Author,\n\nThank you for reaching out..." }, null, 2)
  },
  {
    method: "POST",
    path: "/api/seed",
    auth: "Public / Evaluation",
    description: "Resets the database back to initial seed dataset (10 authors, 18 books, initial tickets).",
    body: null,
    response: JSON.stringify({ success: true, message: "Database successfully reseeded.", stats: { authors: 10, books: 18, tickets: 5 } }, null, 2)
  },
  {
    method: "GET",
    path: "/api/docs",
    auth: "Public",
    description: "Returns the raw OpenAPI 3.0 JSON specification.",
    body: null,
    response: JSON.stringify({ openapi: "3.0.0", info: { title: "BookLeaf API" } }, null, 2)
  }
];

export function ApiDocsView() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  function copyToClipboard(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header currentPortal="docs" />

      <main className="container" style={{ padding: "2rem 1.25rem 4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.75rem" }}>
            <ArrowLeft size={14} />
            <span>Back to Portal</span>
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                RESTful API Specification
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Full technical documentation for all BookLeaf Author Support & Operations endpoints.
              </p>
            </div>

            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <FileCode size={14} />
              <span>View OpenAPI JSON</span>
            </a>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {API_ENDPOINTS.map((endpoint, idx) => (
            <div key={idx} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: endpoint.method === "POST" ? "#000" : endpoint.method === "PATCH" ? "#27272a" : "#52525b",
                    color: "#fff"
                  }}
                >
                  {endpoint.method}
                </span>

                <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.95rem" }}>
                  {endpoint.path}
                </span>

                <span className="pill-tag" style={{ marginLeft: "auto" }}>
                  Auth: {endpoint.auth}
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                {endpoint.description}
              </p>

              {endpoint.body && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Request Payload Example
                  </div>
                  <pre
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "0.75rem",
                      fontSize: "0.8rem",
                      overflowX: "auto",
                      fontFamily: "monospace"
                    }}
                  >
                    {endpoint.body}
                  </pre>
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Response Payload Example (200 OK / 201 Created)
                  </span>

                  <button
                    onClick={() => copyToClipboard(endpoint.response, idx)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: "0.15rem 0.45rem", fontSize: "0.7rem", height: "auto" }}
                  >
                    {copiedIndex === idx ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <pre
                  style={{
                    background: "#000",
                    color: "#f4f4f5",
                    borderRadius: "var(--radius)",
                    padding: "0.75rem",
                    fontSize: "0.8rem",
                    overflowX: "auto",
                    fontFamily: "monospace"
                  }}
                >
                  {endpoint.response}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
