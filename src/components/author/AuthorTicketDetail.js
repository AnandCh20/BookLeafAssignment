"use client";

import { useState } from "react";
import { ArrowLeft, Send, CheckCircle, ShieldCheck, User, Paperclip } from "lucide-react";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/common/Badge";

export function AuthorTicketDetail({ ticket, onBack, onTicketUpdated }) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post message.");
      }

      setReplyText("");
      if (onTicketUpdated) {
        onTicketUpdated(data.ticket);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseTicket() {
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Closed" })
      });
      const data = await res.json();
      if (res.ok && onTicketUpdated) {
        onTicketUpdated(data.ticket);
      }
    } catch {}
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <button
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{ marginBottom: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={14} />
            <span>Back to All Tickets</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
              {ticket.ticket_id}
            </span>
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.5rem", letterSpacing: "-0.02em" }}>
            {ticket.subject}
          </h2>

          <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Book Reference: <strong>{ticket.book_title}</strong> • Created {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>

        {ticket.status !== "Closed" && (
          <button
            onClick={handleCloseTicket}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <CheckCircle size={14} />
            <span>Mark Resolved & Close</span>
          </button>
        )}
      </div>

      {ticket.attachments && ticket.attachments.length > 0 && (
        <div style={{ padding: "0.75rem 1rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Paperclip size={13} />
            <span>Attached Verification Files</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ticket.attachments.map((att, i) => (
              <span key={i} className="pill-tag" style={{ fontSize: "0.775rem" }}>
                {att.name} ({att.size})
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
          Conversation Thread ({ticket.messages ? ticket.messages.length : 0})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {ticket.messages && ticket.messages.map((msg) => {
            const isAdmin = msg.sender_type === "admin";

            return (
              <div
                key={msg.message_id}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  border: isAdmin ? "1px solid #18181b" : "1px solid var(--border)",
                  backgroundColor: isAdmin ? "var(--bg-subtle)" : "var(--bg)",
                  marginLeft: isAdmin ? "1.5rem" : "0",
                  marginRight: isAdmin ? "0" : "1.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                    {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
                    <span>{msg.sender_name}</span>
                    {isAdmin && (
                      <span className="pill-tag" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
                        BookLeaf Operations
                      </span>
                    )}
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div style={{ fontSize: "0.9rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ padding: "0.6rem 0.85rem", marginBottom: "0.75rem", background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", borderRadius: "var(--radius)", fontSize: "0.825rem" }}>
            {error}
          </div>
        )}

        {ticket.status !== "Closed" ? (
          <form onSubmit={handleSendReply} style={{ marginTop: "1rem" }}>
            <div className="form-group" style={{ marginBottom: "0.75rem" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>
                Reply or provide follow-up information:
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Type your reply to BookLeaf support..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={sending || !replyText.trim()}
              >
                <Send size={14} />
                <span>{sending ? "Sending..." : "Send Reply"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius)", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            This ticket is closed. If you have new questions, please raise a new support ticket.
          </div>
        )}
      </div>
    </div>
  );
}
