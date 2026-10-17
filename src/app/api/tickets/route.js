import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getAllTickets, createTicket, getBookById, getAuthors, getAdmins } from "@/lib/db";
import { classifyAndPrioritizeTicket, generateAIDraftResponse } from "@/lib/ai";

export async function GET(req) {
  try {
    const user = extractAuthUser(req);

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get("status") || "All",
      category: searchParams.get("category") || "All",
      priority: searchParams.get("priority") || "All",
      sort: searchParams.get("sort") || "most_urgent",
      search: searchParams.get("search") || ""
    };

    if (user && user.role === "author") {
      filters.author_id = user.id;
    } else if (searchParams.get("author_id")) {
      filters.author_id = searchParams.get("author_id");
    } else if (!user) {
      const referer = req.headers.get("referer") || "";
      if (referer.includes("/author")) {
        const defaultAuthor = getAuthors()[0];
        filters.author_id = defaultAuthor ? defaultAuthor.author_id : "AUTH001";
      }
    }

    const tickets = getAllTickets(filters);
    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve support tickets." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    let user = extractAuthUser(req);
    if (!user) {
      const defaultAuthor = getAuthors()[0];
      user = {
        id: defaultAuthor.author_id,
        name: defaultAuthor.name,
        email: defaultAuthor.email,
        role: "author"
      };
    }

    const body = await req.json();
    const { subject, description, book_id, attachments } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Ticket subject is mandatory." },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Ticket description is mandatory." },
        { status: 400 }
      );
    }

    let bookTitle = "General / Account Level";
    if (book_id && book_id !== "general") {
      const foundBook = getBookById(book_id);
      if (foundBook) {
        bookTitle = foundBook.title;
      }
    }

    let aiClassification = { category: "General Inquiry", priority: "Medium" };
    try {
      aiClassification = await classifyAndPrioritizeTicket({
        subject: subject.trim(),
        description: description.trim()
      });
    } catch {}

    let initialDraft = null;
    try {
      initialDraft = await generateAIDraftResponse({
        author_name: user.name,
        book_title: bookTitle,
        subject: subject.trim(),
        description: description.trim(),
        category: aiClassification.category,
        priority: aiClassification.priority
      });
    } catch {}

    const newTicket = createTicket({
      author_id: user.id,
      author_name: user.name,
      author_email: user.email,
      book_id: book_id || "general",
      book_title: bookTitle,
      subject: subject.trim(),
      description: description.trim(),
      category: aiClassification.category,
      priority: aiClassification.priority,
      attachments: attachments || [],
      ai_draft: initialDraft
    });

    return NextResponse.json(
      {
        success: true,
        ticket: newTicket,
        meta: {
          auto_classified: true,
          category: aiClassification.category,
          priority: aiClassification.priority
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Ticket creation failed. Please verify input data." },
      { status: 500 }
    );
  }
}
