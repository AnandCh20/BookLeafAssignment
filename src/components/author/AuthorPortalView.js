"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { BookList } from "./BookList";
import { TicketForm } from "./TicketForm";
import { AuthorTickets } from "./AuthorTickets";
import { Book, Send, MessageSquare, User, Calendar, MapPin, Phone } from "lucide-react";

export function AuthorPortalView({ initialUser, initialAuthorsList = [] }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState(initialUser ? initialUser.books || [] : []);
  const [allAuthors, setAllAuthors] = useState(initialAuthorsList);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, authorsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/authors?demo=true")
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          setBooks(meData.user.books || []);
        }

        if (authorsRes.ok) {
          const authData = await authorsRes.json();
          setAllAuthors(authData.authors || []);
        }
      } catch {}
    }

    loadData();
  }, []);

  async function handleAuthorSwitch(selectedEmail) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail, password: "password123", role: "author" })
      });

      if (res.ok) {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          setBooks(meData.user.books || []);
        }
      }
    } catch {}
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <Header user={currentUser} currentPortal="author" />

      <main className="container" style={{ padding: "1.5rem 1.25rem 3rem" }}>
        {allAuthors && allAuthors.length > 0 && (
          <div className="author-quick-switcher">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <User size={16} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Examiner Switcher:</span>
              <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                Testing as <strong>{currentUser ? currentUser.name : "Author"}</strong>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Switch Author:</label>
              <select
                className="filter-select"
                value={currentUser ? currentUser.email : ""}
                onChange={(e) => handleAuthorSwitch(e.target.value)}
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
              >
                {allAuthors.map((a) => (
                  <option key={a.author_id} value={a.email}>
                    {a.name} ({a.city}) — {a.books_count} title(s)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>
                Author Account #{currentUser ? currentUser.id : "AUTH"}
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.2rem", letterSpacing: "-0.02em" }}>
                {currentUser ? currentUser.name : "Author Dashboard"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "0.5rem", flexWrap: "wrap", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={14} />
                  <span>{currentUser ? currentUser.city : "India"}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Phone size={14} />
                  <span>{currentUser ? currentUser.phone : "—"}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Calendar size={14} />
                  <span>Partner since {currentUser ? currentUser.joined_date : "2023"}</span>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("new-ticket")}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
                <span>Raise Support Ticket</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="tab-nav">
          <button
            onClick={() => setActiveTab("books")}
            className={`tab-btn ${activeTab === "books" ? "active" : ""}`}
          >
            <Book size={16} />
            <span>My Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`tab-btn ${activeTab === "tickets" ? "active" : ""}`}
          >
            <MessageSquare size={16} />
            <span>My Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab("new-ticket")}
            className={`tab-btn ${activeTab === "new-ticket" ? "active" : ""}`}
          >
            <Send size={16} />
            <span>Submit a Support Query</span>
          </button>
        </nav>

        <div>
          {activeTab === "books" && <BookList books={books} />}
          {activeTab === "new-ticket" && (
            <TicketForm
              books={books}
              onTicketCreated={() => {
                setActiveTab("tickets");
              }}
            />
          )}
          {activeTab === "tickets" && (
            <AuthorTickets
              currentUser={currentUser}
              onRaiseTicketClick={() => setActiveTab("new-ticket")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
