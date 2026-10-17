"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Shield, User, ArrowRight, CheckCircle2, Sun, Moon } from "lucide-react";

const SAMPLE_AUTHORS = [
  { id: "AUTH001", name: "Priya Sharma", email: "priya.sharma@email.com", note: "2 books, active royalty" },
  { id: "AUTH003", name: "Ananya Reddy", email: "ananya.reddy@email.com", note: "1 book, ₹2,546 pending royalty" },
  { id: "AUTH007", name: "Sneha Kulkarni", email: "sneha.kulkarni@email.com", note: "3 books, 1 in production (Midnight in Mysore)" },
  { id: "AUTH009", name: "Kavita Deshmukh", email: "kavita.deshmukh@email.com", note: "2 books, 1 in typesetting (Raising Roots)" },
  { id: "AUTH002", name: "Rohit Kapoor", email: "rohit.kapoor@email.com", note: "2 books, high volume sales" },
  { id: "AUTH004", name: "Vikram Joshi", email: "vikram.joshi@email.com", note: "2 books, stock resolved ticket" }
];

const SAMPLE_ADMINS = [
  { id: "ADM001", name: "Aakash Mehta", email: "admin@bookleaf.com", role: "Senior Operations Lead" },
  { id: "ADM002", name: "Rhea Sen", email: "ops@bookleaf.com", role: "Author Support Specialist" }
];

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState("author");
  const [email, setEmail] = useState("priya.sharma@email.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

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

  function switchRole(newRole) {
    setRole(newRole);
    setError("");
    if (newRole === "admin") {
      setEmail("admin@bookleaf.com");
      setPassword("admin123");
    } else {
      setEmail("priya.sharma@email.com");
      setPassword("password123");
    }
  }

  function selectAuthorPreset(selectedEmail) {
    setEmail(selectedEmail);
    setPassword("password123");
    setError("");
  }

  function selectAdminPreset(selectedEmail) {
    setEmail(selectedEmail);
    setPassword("admin123");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/author");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "480px", margin: "2.5rem auto", padding: "0 1rem", position: "relative" }}>
      <div style={{ position: "absolute", top: "-1.5rem", right: "1rem" }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-outline btn-sm"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
          style={{ padding: "0.4rem 0.55rem" }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", padding: "12px", background: "var(--accent)", color: "var(--text-inverse)", borderRadius: "12px", marginBottom: "1rem" }}>
          <BookOpen size={28} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
          BookLeaf Publishing
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.4rem", fontSize: "0.925rem" }}>
          Author Support & Operational Intelligence Portal
        </p>
      </div>

      <div className="card">
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => switchRole("author")}
            style={{
              flex: 1,
              padding: "0.75rem 0",
              background: "none",
              border: "none",
              borderBottom: role === "author" ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: role === "author" ? 600 : 500,
              color: role === "author" ? "var(--text-main)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.9rem"
            }}
          >
            <User size={16} />
            <span>Author Portal</span>
          </button>

          <button
            type="button"
            onClick={() => switchRole("admin")}
            style={{
              flex: 1,
              padding: "0.75rem 0",
              background: "none",
              border: "none",
              borderBottom: role === "admin" ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: role === "admin" ? 600 : 500,
              color: role === "admin" ? "var(--text-main)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.9rem"
            }}
          >
            <Shield size={16} />
            <span>Operations Admin</span>
          </button>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", marginBottom: "1rem", borderRadius: "var(--radius)", background: "rgba(239, 68, 68, 0.12)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={role === "admin" ? "admin@bookleaf.com" : "author@email.com"}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Demo: {role === "admin" ? "admin123" : "password123"}
              </span>
            </div>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
            disabled={loading}
          >
            <span>{loading ? "Authenticating..." : `Sign In to ${role === "admin" ? "Operations Desk" : "Author Dashboard"}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            One-Click Test Accounts (Evaluation Presets)
          </div>

          {role === "author" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {SAMPLE_AUTHORS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectAuthorPreset(item.email)}
                  style={{
                    textAlign: "left",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius)",
                    border: email === item.email ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: email === item.email ? "var(--bg-subtle)" : "var(--card-bg)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.4rem" }}>({item.email})</span>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {item.note}
                    </div>
                  </div>
                  {email === item.email && <CheckCircle2 size={16} color="var(--accent)" />}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {SAMPLE_ADMINS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectAdminPreset(item.email)}
                  style={{
                    textAlign: "left",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius)",
                    border: email === item.email ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: email === item.email ? "var(--bg-subtle)" : "var(--card-bg)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.4rem" }}>({item.email})</span>
                    <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {item.role}
                    </div>
                  </div>
                  {email === item.email && <CheckCircle2 size={16} color="var(--accent)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
