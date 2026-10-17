"use client";

import { useState } from "react";
import { Sparkles, Send, Lock, UserCheck, RefreshCw, CheckCircle, AlertTriangle, Paperclip, Clock } from "lucide-react";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/common/Badge";

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry"
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const ASSIGNEES = ["Aakash Mehta", "Rhea Sen", "Operations Desk", "Production Lead"];

export function AdminTicketDetail({ ticket, currentAdmin, onTicketUpdated, onCloseDetail }) {
  const [activeTab, setActiveTab] = useState("response");
  const [draftResponse, setDraftResponse] = useState(ticket.ai_draft || "");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [responseStatus, setResponseStatus] = useState("Resolved");
  const [internalNoteText, setInternalNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState("");

  async function handleGenerateAIDraft() {
    setGeneratingDraft(true);
    setOverrideMsg("");
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}/ai-draft`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.ai_draft) {
        setDraftResponse(data.ai_draft);
        setOverrideMsg("AI draft regenerated based on latest BookLeaf Knowledge Base.");
      }
    } catch {} finally {
      setGeneratingDraft(false);
    }
  }

  async function handleSendResponse(e) {
    e.preventDefault();
    if (!draftResponse.trim()) return;

    setSendingResponse(true);
    setOverrideMsg("");

    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draftResponse.trim(),
          status: responseStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setDraftResponse("");
        setOverrideMsg(`Official response delivered to ${ticket.author_name}. Status marked as ${responseStatus}.`);
        if (onTicketUpdated) {
          onTicketUpdated(data.ticket);
        }
      }
    } catch {} finally {
      setSendingResponse(false);
    }
  }

  async function handleUpdateField(field, value) {
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (res.ok) {
        setOverrideMsg(`Updated ${field} to ${value}.`);
        if (onTicketUpdated) {
          onTicketUpdated(data.ticket);
        }
      }
    } catch {}
  }

  async function handleAddInternalNote(e) {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: internalNoteText.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setInternalNoteText("");
        setOverrideMsg("Internal team note added.");
        if (onTicketUpdated) {
          onTicketUpdated(data.ticket);
        }
      }
    } catch {} finally {
      setAddingNote(false);
    }
  }

  const hoursOpen = Math.round((Date.now() - new Date(ticket.created_at).getTime()) / (3600 * 1000));
  const isOldUnresolved = (ticket.status === "Open" || ticket.status === "In Progress") && hoursOpen >= 24;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{ticket.ticket_id}</span>
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />

            {isOldUnresolved && (
              <span className="pill-tag" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
                Unresolved for {hoursOpen}h
              </span>
            )}
          </div>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.4rem" }}>
            {ticket.subject}
          </h2>

          <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Author: <strong>{ticket.author_name}</strong> ({ticket.author_email}) • Book: <strong>{ticket.book_title}</strong>
          </div>
        </div>

        {onCloseDetail && (
          <button onClick={onCloseDetail} className="btn btn-outline btn-sm">
            Close Panel
          </button>
        )}
      </div>

      <div style={{ padding: "0.85rem 1rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <div>
          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            AI Category Override
          </label>
          <select
            className="form-select"
            value={ticket.category}
            onChange={(e) => handleUpdateField("category", e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.5rem", marginTop: "0.2rem" }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            AI Priority Override
          </label>
          <select
            className="form-select"
            value={ticket.priority}
            onChange={(e) => handleUpdateField("priority", e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.5rem", marginTop: "0.2rem" }}
          >
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Ticket Status
          </label>
          <select
            className="form-select"
            value={ticket.status}
            onChange={(e) => handleUpdateField("status", e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.5rem", marginTop: "0.2rem" }}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Assigned Owner
          </label>
          <select
            className="form-select"
            value={ticket.assigned_to || ""}
            onChange={(e) => handleUpdateField("assigned_to", e.target.value || null)}
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.5rem", marginTop: "0.2rem" }}
          >
            <option value="">Unassigned</option>
            {ASSIGNEES.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>
      </div>

      {overrideMsg && (
        <div style={{ padding: "0.5rem 0.75rem", background: "#f4f4f5", border: "1px solid #27272a", borderRadius: "var(--radius)", fontSize: "0.8rem" }}>
          {overrideMsg}
        </div>
      )}

      <div style={{ padding: "0.85rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.3rem" }}>
          Author Query
        </div>
        <div style={{ fontSize: "0.9rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {ticket.description}
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", fontSize: "0.8rem" }}>
            <Paperclip size={14} />
            <span style={{ fontWeight: 600 }}>Attachments:</span>
            {ticket.attachments.map((att, idx) => (
              <span key={idx} className="pill-tag">
                {att.name} ({att.size})
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "1rem" }}>
        <button
          onClick={() => setActiveTab("response")}
          className={`tab-btn ${activeTab === "response" ? "active" : ""}`}
        >
          <Sparkles size={14} />
          <span>AI Response Desk</span>
        </button>

        <button
          onClick={() => setActiveTab("thread")}
          className={`tab-btn ${activeTab === "thread" ? "active" : ""}`}
        >
          <span>Message Thread ({ticket.messages ? ticket.messages.length : 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
        >
          <Lock size={14} />
          <span>Internal Notes ({ticket.internal_notes ? ticket.internal_notes.length : 0})</span>
        </button>
      </div>

      {activeTab === "response" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                AI-Drafted Response (BookLeaf Knowledge Base Powered)
              </span>
            </div>

            <button
              onClick={handleGenerateAIDraft}
              className="btn btn-secondary btn-sm"
              disabled={generatingDraft}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <RefreshCw size={13} className={generatingDraft ? "spin" : ""} />
              <span>{generatingDraft ? "Generating Draft..." : "Regenerate AI Draft"}</span>
            </button>
          </div>

          <form onSubmit={handleSendResponse}>
            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={10}
                value={draftResponse}
                onChange={(e) => setDraftResponse(e.target.value)}
                placeholder="Click Regenerate AI Draft to populate from BookLeaf knowledge base, or compose manually..."
                style={{ fontSize: "0.875rem", lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Update Status Upon Sending:</label>
                <select
                  className="form-select"
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  style={{ width: "auto", fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                >
                  <option value="Resolved">Resolved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Open">Keep Open</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendingResponse || !draftResponse.trim()}
              >
                <Send size={15} />
                <span>{sendingResponse ? "Delivering..." : "Approve & Send to Author"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "thread" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {ticket.messages && ticket.messages.map((m) => (
            <div
              key={m.message_id}
              style={{
                padding: "0.85rem",
                borderRadius: "var(--radius)",
                background: m.sender_type === "admin" ? "var(--bg-subtle)" : "var(--bg)",
                border: "1px solid var(--border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.8rem" }}>
                <span style={{ fontWeight: 600 }}>
                  {m.sender_name} ({m.sender_type === "admin" ? "BookLeaf Operations" : "Author"})
                </span>
                <span style={{ color: "var(--text-muted)" }}>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.875rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          <div style={{ padding: "0.6rem 0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <Lock size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Internal notes are strictly restricted to the operations team and are never exposed to authors.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {ticket.internal_notes && ticket.internal_notes.length > 0 ? (
              ticket.internal_notes.map((note) => (
                <div
                  key={note.note_id}
                  style={{
                    padding: "0.75rem",
                    borderLeft: "3px solid #000",
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.775rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{note.author_name}</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{note.content}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No internal notes recorded yet for this ticket.
              </div>
            )}
          </div>

          <form onSubmit={handleAddInternalNote}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Add Private Note:</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Log internal updates, print press confirmation, or accounts verification..."
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={addingNote || !internalNoteText.trim()}
              >
                <span>{addingNote ? "Saving Note..." : "Save Internal Note"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
