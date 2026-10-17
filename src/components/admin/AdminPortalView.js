"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { TicketQueue } from "./TicketQueue";
import { AdminTicketDetail } from "./AdminTicketDetail";
import { ShieldCheck, RotateCcw, AlertTriangle, CheckCircle, Clock, Inbox } from "lucide-react";

export function AdminPortalView({ initialAdmin }) {
  const [currentAdmin, setCurrentAdmin] = useState(initialAdmin);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const [filters, setFilters] = useState({
    status: "All",
    category: "All",
    priority: "All",
    sort: "most_urgent",
    search: ""
  });

  async function fetchTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "All") params.set("status", filters.status);
      if (filters.category !== "All") params.set("category", filters.category);
      if (filters.priority !== "All") params.set("priority", filters.priority);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);

        if (!selectedTicketId && data.tickets && data.tickets.length > 0) {
          setSelectedTicketId(data.tickets[0].ticket_id);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 4000);
    return () => clearInterval(interval);
  }, [filters]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleResetDatabase() {
    if (!confirm("Reset database to the initial 10 authors, 18 books, and initial tickets?")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResetMessage("Database reset to initial sample dataset.");
        fetchTickets();
        setTimeout(() => setResetMessage(""), 4000);
      }
    } catch {} finally {
      setResetting(false);
    }
  }

  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const criticalCount = tickets.filter((t) => t.priority === "Critical" && t.status !== "Resolved" && t.status !== "Closed").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  const selectedTicket = tickets.find((t) => t.ticket_id === selectedTicketId) || null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header user={currentAdmin} currentPortal="admin" />

      <main className="container" style={{ padding: "1.5rem 1.25rem 3rem" }}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>
                Operations Intelligence Console
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.2rem", letterSpacing: "-0.02em" }}>
                Incoming Support Queue
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                AI-assisted classification, priority routing, and knowledge-grounded response generation.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                onClick={handleResetDatabase}
                className="btn btn-outline btn-sm"
                disabled={resetting}
                title="Reset back to initial dataset"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <RotateCcw size={13} />
                <span>{resetting ? "Resetting..." : "Reset Sample DB"}</span>
              </button>
            </div>
          </div>
        </div>

        {resetMessage && (
          <div style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem", borderRadius: "var(--radius)", background: "#f4f4f5", border: "1px solid #18181b", fontSize: "0.85rem" }}>
            {resetMessage}
          </div>
        )}

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-title">Active Queue</div>
            <div className="stat-value">{openCount}</div>
            <div className="stat-subtext">Open & in progress tickets</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Critical Attention</div>
            <div className="stat-value" style={{ color: criticalCount > 0 ? "#000" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {criticalCount > 0 && <span className="pulse-dot" />}
              <span>{criticalCount}</span>
            </div>
            <div className="stat-subtext">Immediate escalation required</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Resolved / Closed</div>
            <div className="stat-value">{resolvedCount}</div>
            <div className="stat-subtext">Total successfully addressed</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Total Tickets</div>
            <div className="stat-value">{totalTickets}</div>
            <div className="stat-subtext">Across all registered authors</div>
          </div>
        </div>

        <div className="split-layout">
          <div>
            <TicketQueue
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={(t) => setSelectedTicketId(t.ticket_id)}
              onRefresh={fetchTickets}
              loading={loading}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div>
            {selectedTicket ? (
              <AdminTicketDetail
                ticket={selectedTicket}
                currentAdmin={currentAdmin}
                onTicketUpdated={(updated) => {
                  setTickets((prev) =>
                    prev.map((t) => (t.ticket_id === updated.ticket_id ? updated : t))
                  );
                }}
                onCloseDetail={() => setSelectedTicketId(null)}
              />
            ) : (
              <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
                <Inbox size={48} style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Ticket Selected</h3>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Select an author ticket from the queue to view details and launch the AI response desk.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
