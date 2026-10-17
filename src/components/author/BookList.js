"use client";

import { Book, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function BookList({ books }) {
  if (!books || books.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <Book size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>No Books Registered</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          There are currently no books associated with your author account.
        </p>
      </div>
    );
  }

  const totalCopiesSold = books.reduce((acc, b) => acc + (b.total_copies_sold || 0), 0);
  const totalEarned = books.reduce((acc, b) => acc + (b.total_royalty_earned || 0), 0);
  const totalPaid = books.reduce((acc, b) => acc + (b.royalty_paid || 0), 0);
  const totalPending = books.reduce((acc, b) => acc + (b.royalty_pending || 0), 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-title">Published & In Production</div>
          <div className="stat-value">{books.length}</div>
          <div className="stat-subtext">Registered catalog titles</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Copies Sold</div>
          <div className="stat-value">{totalCopiesSold.toLocaleString("en-IN")}</div>
          <div className="stat-subtext">Across Amazon, Flipkart & Store</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Royalty Earned</div>
          <div className="stat-value">₹{totalEarned.toLocaleString("en-IN")}</div>
          <div className="stat-subtext">80% author profit split</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Royalty Pending Payout</div>
          <div className="stat-value" style={{ color: totalPending > 0 ? "#000" : "var(--text-muted)" }}>
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <div className="stat-subtext">Disbursed on quarterly cycle</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Book Title & ISBN</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Publication Date</th>
              <th>MRP</th>
              <th>Copies Sold</th>
              <th>Royalty Earned</th>
              <th>Paid / Pending</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const isProduction = book.status && book.status.includes("In Production");

              return (
                <tr key={book.book_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{book.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      ISBN: {book.isbn || "Pending Assignment"}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.825rem" }}>{book.genre || "N/A"}</span>
                  </td>

                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "9999px",
                        background: isProduction ? "var(--bg-subtle)" : "#000",
                        color: isProduction ? "var(--text-main)" : "#fff",
                        border: isProduction ? "1px solid var(--border)" : "none"
                      }}
                    >
                      {isProduction ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {book.status}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.825rem", color: book.publication_date ? "inherit" : "var(--text-muted)" }}>
                      {book.publication_date || "Pending Release"}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {book.mrp !== null && book.mrp !== undefined ? `₹${book.mrp}` : "—"}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {(book.total_copies_sold || 0).toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>
                      ₹{(book.total_royalty_earned || 0).toLocaleString("en-IN")}
                    </div>
                    {book.author_royalty_per_copy && (
                      <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                        ₹{book.author_royalty_per_copy} / copy
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ fontSize: "0.825rem" }}>
                      <div>Paid: <strong style={{ color: "var(--text-main)" }}>₹{(book.royalty_paid || 0).toLocaleString("en-IN")}</strong></div>
                      <div style={{ color: book.royalty_pending > 0 ? "var(--text-main)" : "var(--text-muted)", marginTop: "2px" }}>
                        Pending: <strong>₹{(book.royalty_pending || 0).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  </td>

                  <td>
                    {book.available_on && book.available_on.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", maxWidth: "220px" }}>
                        {book.available_on.map((platform) => (
                          <span key={platform} className="pill-tag">
                            {platform}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Production Queue
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
