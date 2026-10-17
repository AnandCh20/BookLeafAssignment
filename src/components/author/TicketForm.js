"use client";

import { useState } from "react";
import { Send, Upload, FileText, X, Sparkles, CheckCircle2 } from "lucide-react";

export function TicketForm({ books, onTicketCreated }) {
  const [bookId, setBookId] = useState("general");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  function handleFileAdd(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function handleRemoveAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessInfo(null);

    if (!subject.trim()) {
      setError("Please provide a subject line for your query.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a detailed description so our team can assist you.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: bookId,
          subject: subject.trim(),
          description: description.trim(),
          attachments
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket.");
      }

      setSuccessInfo(data.ticket);
      setSubject("");
      setDescription("");
      setBookId("general");
      setAttachments([]);

      if (onTicketCreated) {
        onTicketCreated(data.ticket);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "780px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Submit a Support Query
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Our operational team and AI assistants will prioritize and route your request to the right department.
        </p>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem", borderRadius: "var(--radius)", background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {successInfo && (
        <div style={{ padding: "1rem", marginBottom: "1.25rem", borderRadius: "var(--radius)", background: "#f4f4f5", border: "1px solid #18181b", fontSize: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#000" />
            <span>Ticket Submitted Successfully ({successInfo.ticket_id})</span>
          </div>
          <div style={{ marginTop: "0.5rem", color: "var(--text-secondary)", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={14} />
            <span>
              Auto-classified by AI as <strong>{successInfo.category}</strong> with <strong>{successInfo.priority} Priority</strong>.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Related Book or Query Context</label>
          <select
            className="form-select"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          >
            <option value="general">General / Account Level (Payouts, Contract, Account)</option>
            {books &&
              books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} (ISBN: {b.isbn || "Pending"}) — {b.status}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Royalty disbursement inquiry for Q3, or Amazon listing sync issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description</label>
          <textarea
            className="form-textarea"
            rows={5}
            placeholder="Describe your question or issue in detail. If referencing a specific royalty amount, ISBN number, or defect, please specify."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Optional File Attachments (Screenshots, Statements, Photos)</label>
          <div
            style={{
              border: "1px dashed var(--border-strong)",
              borderRadius: "var(--radius)",
              padding: "1.25rem",
              textAlign: "center",
              backgroundColor: "var(--bg-secondary)"
            }}
          >
            <Upload size={24} color="var(--text-muted)" style={{ margin: "0 auto 0.5rem" }} />
            <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Click to choose files or drop images here
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Supports PNG, JPG, PDF up to 10MB
            </div>

            <input
              type="file"
              multiple
              onChange={handleFileAdd}
              style={{
                display: "none"
              }}
              id="file-upload"
            />

            <label
              htmlFor="file-upload"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.75rem", display: "inline-flex" }}
            >
              Browse Files
            </label>
          </div>

          {attachments.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.65rem",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "0.8rem"
                  }}
                >
                  <FileText size={14} />
                  <span>{file.name}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.725rem" }}>({file.size})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ minWidth: "160px" }}
            disabled={submitting}
          >
            <Send size={15} />
            <span>{submitting ? "Submitting Ticket..." : "Submit Support Query"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
