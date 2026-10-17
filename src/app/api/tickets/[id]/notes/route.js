import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getTicketById, addTicketInternalNote } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const user = extractAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Only administrators can add internal notes." },
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

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Internal note content cannot be empty." },
        { status: 400 }
      );
    }

    const note = addTicketInternalNote(id, {
      author_name: user.name,
      content: content.trim()
    });

    const refreshedTicket = getTicketById(id);
    return NextResponse.json(
      {
        success: true,
        note,
        ticket: refreshedTicket
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to add internal note." },
      { status: 500 }
    );
  }
}
