"use client";

import { useRouter } from "next/navigation";
import { BookOpen, ShieldCheck, LogOut, FileText, ArrowRightLeft } from "lucide-react";

export function Header({ user, currentPortal }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  function handleSwitchPortal() {
    if (currentPortal === "author") {
      router.push("/admin");
    } else {
      router.push("/author");
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="brand" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <span style={{ display: "inline-flex", padding: "6px", background: "#000", color: "#fff", borderRadius: "6px" }}>
              <BookOpen size={18} />
            </span>
            <span>BookLeaf</span>
          </div>

          <span className="brand-badge">
            {currentPortal === "admin" ? "Operations Desk" : "Author Support"}
          </span>
        </div>

        <nav className="nav-links">
          <button
            onClick={() => router.push("/api-docs")}
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <FileText size={14} />
            <span>API Docs</span>
          </button>

          <button
            onClick={handleSwitchPortal}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            title={currentPortal === "author" ? "Go to Admin Queue" : "Go to Author View"}
          >
            <ArrowRightLeft size={14} />
            <span>{currentPortal === "author" ? "Switch to Admin" : "Switch to Author"}</span>
          </button>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: "0.35rem 0.5rem" }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
