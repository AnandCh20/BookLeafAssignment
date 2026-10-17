"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/common/Badge";
import { AuthorTicketDetail } from "./AuthorTicketDetail";

export function AuthorTickets({ currentUser, onRaiseTicketClick }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  async function fetchLatestTickets() {
    try {
      const url = currentUser ? `/api/tickets?author_id=${currentUser.id}` : "/api/tickets";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setLastRefreshed(Date.now());
      }
    } catch {}
  }

  useEffect(() => {
    fetchLatestTickets();
    const interval = setInterval(() => {
      fetchLatestTickets();
    }, 3500);

    return () => clearInterval(interval);
  }, [currentUser]);

  const activeTicket = tickets.find((t) => t.ticket_id === selectedTicketId);

  if (activeTicket) {
    return (
      <AuthorTicketDetail
        ticket={activeTicket}
        onBack={() => setSelectedTicketId(null)}
        onTicketUpdated={(updated) => {
          setTickets((prev) =>
            prev.map((t) => (t.ticket_id === updated.ticket_id ? updated : t))
          );
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            My Support Tickets ({tickets.length})
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2px" }}>
            Live status updates and communications with the BookLeaf team.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span className="pulse-dot" style={{ width: "6px", height: "6px", background: "#10b981" }} />
            <span>Live Auto-Sync Active</span>
          </span>

          <button
            onClick={fetchLatestTickets}
            className="btn btn-outline btn-sm"
            title="Refresh now"
            style={{ padding: "0.35rem 0.5rem" }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <MessageSquare size={36} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Support Queries Yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: "1.25rem" }}>
            Have a question about your royalties, print orders, or distribution?
          </p>
          <button onClick={onRaiseTicketClick} className="btn btn-primary btn-sm">
            Raise a Support Query
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {tickets.map((ticket) => {
            const hasAdminReply = ticket.messages && ticket.messages.some((m) => m.sender_type === "admin");

            return (
              <div
                key={ticket.ticket_id}
                className="card"
                onClick={() => setSelectedTicketId(ticket.ticket_id)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {ticket.ticket_id}
                    </span>
                    <CategoryBadge category={ticket.category} />
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />

                    {hasAdminReply && (
                      <span className="pill-tag" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
                        Admin Replied
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>{ticket.subject}</h4>
                  <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    Book: <strong>{ticket.book_title}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticket.description}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.6rem", marginTop: "0.2rem", fontSize: "0.775rem", color: "var(--text-muted)" }}>
                  <span>{ticket.messages ? ticket.messages.length : 1} message(s)</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#000", fontWeight: 600 }}>
                    <span>Open Thread</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
