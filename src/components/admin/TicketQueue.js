"use client";

import { useState } from "react";
import { Search, Filter, AlertTriangle, Clock, ArrowUpDown, RefreshCw, User, BookOpen } from "lucide-react";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/common/Badge";

const CATEGORIES = [
  "All",
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry"
];

const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES = ["All", "Open", "In Progress", "Resolved", "Closed"];
const SORTS = [
  { label: "Most Urgent First", value: "most_urgent" },
  { label: "Oldest Unresolved First", value: "oldest_unresolved" },
  { label: "Newest Submitted", value: "newest" },
  { label: "Oldest Submitted", value: "oldest" }
];

export function TicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onRefresh,
  loading,
  filters,
  onFilterChange
}) {
  return (
    <div>
      <div className="filter-bar">
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: "32px", width: "100%" }}
            placeholder="Search tickets by ID, author, book, issue..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              Status: {st}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value)}
        >
          {PRIORITIES.map((pri) => (
            <option key={pri} value={pri}>
              {pri === "All" ? "All Priorities" : `Priority: ${pri}`}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.sort}
          onChange={(e) => onFilterChange("sort", e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh Queue"
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {tickets.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <Filter size={32} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>No tickets matching filter criteria</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", marginTop: "0.25rem" }}>
              Adjust or reset your filters above to see more tickets.
            </p>
          </div>
        ) : (
          tickets.map((t) => {
            const isSelected = t.ticket_id === selectedTicketId;
            const hoursOpen = Math.round((Date.now() - new Date(t.created_at).getTime()) / (3600 * 1000));
            const isOldUnresolved = (t.status === "Open" || t.status === "In Progress") && hoursOpen >= 24;
            const isCritical = t.priority === "Critical";

            return (
              <div
                key={t.ticket_id}
                onClick={() => onSelectTicket(t)}
                className="card"
                style={{
                  cursor: "pointer",
                  borderLeft: isCritical ? "4px solid #000" : isSelected ? "3px solid #52525b" : "1px solid var(--border)",
                  backgroundColor: isSelected ? "var(--bg-subtle)" : "var(--bg)",
                  transition: "all 0.15s ease",
                  padding: "1rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.825rem", color: "var(--text-muted)" }}>
                      {t.ticket_id}
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <CategoryBadge category={t.category} />

                    {isOldUnresolved && (
                      <span className="pill-tag" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
                        Oldest Unresolved ({hoursOpen}h)
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{t.subject}</h4>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                    <strong>{t.author_name}</strong> • <em>{t.book_title}</em>
                  </div>
                </div>

                <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.description}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span>
                    Owner: {t.assigned_to ? <strong>{t.assigned_to}</strong> : <em>Unassigned</em>}
                  </span>
                  <span>{t.messages ? t.messages.length : 1} message(s)</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
