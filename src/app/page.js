import Link from "next/link";
import { BookOpen, User, Shield, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Header } from "@/components/common/Header";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)", display: "flex", flexDirection: "column" }}>
      <Header currentPortal="landing" />

      <main className="container" style={{ flex: 1, padding: "4rem 1.25rem 5rem", maxWidth: "980px" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", borderRadius: "9999px", background: "var(--accent)", color: "var(--text-inverse)", fontSize: "0.775rem", fontWeight: 600, marginBottom: "1.25rem" }}>
            <Sparkles size={13} />
            <span>AI-Assisted Operations & Support Portal</span>
          </div>

          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--text-main)" }}>
            Empowering Authors. Streamlining Publishing.
          </h1>

          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginTop: "1rem", maxWidth: "680px", margin: "1rem auto 0", lineHeight: 1.5 }}>
            Unified communication hub connecting 22,000+ BookLeaf titles with our Delhi printing presses, distribution channels, and intelligence desk.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <Link href="/author" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
              <User size={16} />
              <span>Enter Author Portal</span>
              <ArrowRight size={15} />
            </Link>

            <Link href="/admin" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
              <Shield size={16} />
              <span>Enter Operations Desk</span>
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3.5rem" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent)", color: "var(--text-inverse)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Author Dashboard</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Check published books, ISBN status, quarterly 80/20 royalty reports, pending payouts, and raise support queries with instant AI triage.
            </p>
            <Link href="/author" style={{ marginTop: "auto", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-main)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <span>Launch Author Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--border-strong)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Operations Queue</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Prioritized ticket triage across all authors. Auto-classification, urgency scoring, internal private notes, and Knowledge-Base grounded drafts.
            </p>
            <Link href="/admin" style={{ marginTop: "auto", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-main)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <span>Launch Operations Queue</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Real-Time & AI Core</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Real-time message updates without page refreshes. Graceful LLM degradation ensures uninterrupted operations even when APIs rate-limit.
            </p>
            <Link href="/api-docs" style={{ marginTop: "auto", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-main)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <span>Explore REST Architecture</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="card" style={{ background: "var(--bg)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              Pre-Seeded Evaluation Dataset
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.2rem" }}>
              10 Authors • 18 Book Catalog Records • Edge Cases Included
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/login" className="btn btn-primary btn-sm">
              Test With Sample Accounts
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 0", background: "var(--bg)", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <div className="container">
          BookLeaf Publishing Technical Assignment • Full-Stack Developer Position
        </div>
      </footer>
    </div>
  );
}
