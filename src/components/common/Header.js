"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, FileText, ArrowRightLeft, Sun, Moon, Menu, X, User } from "lucide-react";

export function Header({ user, currentPortal }) {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookleaf_theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        setTheme(current);
      }
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("bookleaf_theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
  }

  async function handleLogout() {
    setMobileOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  function handleSwitchPortal() {
    setMobileOpen(false);
    if (currentPortal === "author") {
      router.push("/admin");
    } else {
      router.push("/author");
    }
  }

  const portalLabel = currentPortal === "admin" 
    ? "Operations Desk" 
    : currentPortal === "docs" 
    ? "API Reference" 
    : "Author Support";

  const switchLabel = currentPortal === "author" 
    ? "Switch to Admin" 
    : "Switch to Author";

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
          <div className="brand" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <span style={{ display: "inline-flex", padding: "6px", background: "var(--accent)", color: "var(--text-inverse)", borderRadius: "6px" }}>
              <BookOpen size={18} />
            </span>
            <span>BookLeaf</span>
          </div>

          <span className="brand-badge">
            {portalLabel}
          </span>
        </div>

        <nav className="desktop-nav">
          <button
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            style={{ padding: "0.4rem 0.55rem" }}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

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
            title={switchLabel}
          >
            <ArrowRightLeft size={14} />
            <span>{switchLabel}</span>
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
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </nav>

        <div className="mobile-nav-toggle">
          <button
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            style={{ padding: "0.45rem 0.6rem" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.45rem 0.6rem" }}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-drawer container">
          {user && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", color: "var(--text-inverse)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                </div>
              </div>
              <span className="brand-badge" style={{ textTransform: "uppercase", fontSize: "0.65rem" }}>
                {user.role}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              onClick={handleSwitchPortal}
              className="btn btn-primary btn-sm"
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
            >
              <ArrowRightLeft size={15} />
              <span>{switchLabel}</span>
            </button>

            <button
              onClick={() => {
                setMobileOpen(false);
                router.push("/api-docs");
              }}
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
            >
              <FileText size={15} />
              <span>API Documentation</span>
            </button>

            <button
              onClick={toggleTheme}
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem", borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
