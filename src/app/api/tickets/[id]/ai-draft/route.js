import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getTicketById, updateTicket } from "@/lib/db";
import { generateAIDraftResponse } from "@/lib/ai";

export async function POST(req, { params }) {
  try {
    const user = extractAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Only administrators can generate AI drafts." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const ticket = getTicketById(id);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    const draft = await generateAIDraftResponse({
      author_name: ticket.author_name,
      book_title: ticket.book_title,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority
    });

    updateTicket(id, { ai_draft: draft });

    return NextResponse.json({
      success: true,
      ai_draft: draft
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate AI response draft." },
      { status: 500 }
    );
  }
}
