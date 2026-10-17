import { initialAuthors, initialAdmins, initialTickets } from "./sampleData.js";
import { hashPassword } from "./auth.js";

const DEFAULT_AUTHOR_HASH = hashPassword("password123");
const DEFAULT_ADMIN_HASH = hashPassword("admin123");

let globalStore = globalThis.__bookleafStore;

if (!globalStore) {
  const seededAuthors = initialAuthors.map((author) => ({
    ...author,
    password_hash: DEFAULT_AUTHOR_HASH,
    role: "author"
  }));

  const seededAdmins = initialAdmins.map((admin) => ({
    ...admin,
    password_hash: DEFAULT_ADMIN_HASH
  }));

  globalStore = {
    authors: JSON.parse(JSON.stringify(seededAuthors)),
    admins: JSON.parse(JSON.stringify(seededAdmins)),
    tickets: JSON.parse(JSON.stringify(initialTickets))
  };

  globalThis.__bookleafStore = globalStore;
}

export function resetDatabase() {
  const seededAuthors = initialAuthors.map((author) => ({
    ...author,
    password_hash: DEFAULT_AUTHOR_HASH,
    role: "author"
  }));

  const seededAdmins = initialAdmins.map((admin) => ({
    ...admin,
    password_hash: DEFAULT_ADMIN_HASH
  }));

  globalStore.authors = JSON.parse(JSON.stringify(seededAuthors));
  globalStore.admins = JSON.parse(JSON.stringify(seededAdmins));
  globalStore.tickets = JSON.parse(JSON.stringify(initialTickets));
  return true;
}

export function getAuthors() {
  return globalStore.authors;
}

export function getAuthorById(id) {
  return globalStore.authors.find((a) => a.author_id === id) || null;
}

export function getAuthorByEmail(email) {
  if (!email) return null;
  return (
    globalStore.authors.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    ) || null
  );
}

export function getAdmins() {
  return globalStore.admins;
}

export function getAdminByEmail(email) {
  if (!email) return null;
  return (
    globalStore.admins.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    ) || null
  );
}

export function getAllBooks() {
  const all = [];
  for (const author of globalStore.authors) {
    for (const book of author.books) {
      all.push({
        ...book,
        author_id: author.author_id,
        author_name: author.name
      });
    }
  }
  return all;
}

export function getBookById(bookId) {
  for (const author of globalStore.authors) {
    const found = author.books.find((b) => b.book_id === bookId);
    if (found) {
      return {
        ...found,
        author_id: author.author_id,
        author_name: author.name
      };
    }
  }
  return null;
}

export function getBooksByAuthorId(authorId) {
  const author = getAuthorById(authorId);
  return author ? author.books : [];
}

export function getAllTickets(filters = {}) {
  let list = [...globalStore.tickets];

  if (filters.author_id) {
    list = list.filter((t) => t.author_id === filters.author_id);
  }

  if (filters.status && filters.status !== "All") {
    list = list.filter((t) => t.status === filters.status);
  }

  if (filters.category && filters.category !== "All") {
    list = list.filter((t) => t.category === filters.category);
  }

  if (filters.priority && filters.priority !== "All") {
    list = list.filter((t) => t.priority === filters.priority);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.ticket_id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q) ||
        (t.book_title && t.book_title.toLowerCase().includes(q))
    );
  }

  if (filters.sort === "oldest_unresolved") {
    const unresolved = list.filter((t) => t.status !== "Resolved" && t.status !== "Closed");
    const resolved = list.filter((t) => t.status === "Resolved" || t.status === "Closed");
    unresolved.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    resolved.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    list = [...unresolved, ...resolved];
  } else if (filters.sort === "most_urgent") {
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    list.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(a.created_at) - new Date(b.created_at);
    });
  } else if (filters.sort === "oldest") {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return list;
}

export function getTicketById(ticketId) {
  return globalStore.tickets.find((t) => t.ticket_id === ticketId) || null;
}

export function createTicket(ticketData) {
  const nextNumber = 1000 + globalStore.tickets.length + 1;
  const newTicket = {
    ticket_id: `TCK-${nextNumber}`,
    author_id: ticketData.author_id,
    author_name: ticketData.author_name,
    author_email: ticketData.author_email,
    book_id: ticketData.book_id || null,
    book_title: ticketData.book_title || "General / Account Level",
    subject: ticketData.subject,
    description: ticketData.description,
    category: ticketData.category || "General Inquiry",
    priority: ticketData.priority || "Medium",
    status: "Open",
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attachments: ticketData.attachments || [],
    messages: [
      {
        message_id: `MSG-${Date.now()}-1`,
        sender_type: "author",
        sender_name: ticketData.author_name,
        content: ticketData.description,
        created_at: new Date().toISOString()
      }
    ],
    internal_notes: [],
    ai_draft: ticketData.ai_draft || null
  };

  globalStore.tickets.unshift(newTicket);
  return newTicket;
}

export function updateTicket(ticketId, updates) {
  const ticket = getTicketById(ticketId);
  if (!ticket) return null;

  if (updates.status) ticket.status = updates.status;
  if (updates.priority) ticket.priority = updates.priority;
  if (updates.category) ticket.category = updates.category;
  if (updates.assigned_to !== undefined) ticket.assigned_to = updates.assigned_to;
  if (updates.ai_draft !== undefined) ticket.ai_draft = updates.ai_draft;

  ticket.updated_at = new Date().toISOString();
  return ticket;
}

export function addTicketMessage(ticketId, { sender_type, sender_name, content }) {
  const ticket = getTicketById(ticketId);
  if (!ticket) return null;

  const msg = {
    message_id: `MSG-${Date.now()}`,
    sender_type,
    sender_name,
    content,
    created_at: new Date().toISOString()
  };

  ticket.messages.push(msg);
  ticket.updated_at = new Date().toISOString();

  if (sender_type === "admin" && ticket.status === "Open") {
    ticket.status = "In Progress";
  }

  return msg;
}

export function addTicketInternalNote(ticketId, { author_name, content }) {
  const ticket = getTicketById(ticketId);
  if (!ticket) return null;

  const note = {
    note_id: `NOTE-${Date.now()}`,
    author_name,
    content,
    created_at: new Date().toISOString()
  };

  ticket.internal_notes.push(note);
  ticket.updated_at = new Date().toISOString();
  return note;
}
