"use client";

export function PriorityBadge({ priority }) {
  const p = priority || "Medium";
  let className = "badge badge-medium";
  let showDot = false;

  if (p === "Critical") {
    className = "badge badge-critical";
    showDot = true;
  } else if (p === "High") {
    className = "badge badge-high";
  } else if (p === "Low") {
    className = "badge badge-low";
  }

  return (
    <span className={className}>
      {showDot && <span className="pulse-dot" />}
      {p}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = status || "Open";
  let className = "badge badge-status-open";

  if (s === "In Progress") {
    className = "badge badge-status-inprogress";
  } else if (s === "Resolved") {
    className = "badge badge-status-resolved";
  } else if (s === "Closed") {
    className = "badge badge-status-closed";
  }

  return <span className={className}>{s}</span>;
}

export function CategoryBadge({ category }) {
  return (
    <span className="pill-tag">
      {category || "General"}
    </span>
  );
}
