import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getTicketById, updateTicket } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const user = extractAuthUser(req);
    const { id } = await params;
    const ticket = getTicketById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    if (user && user.role === "author") {
      if (ticket.author_id !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: You cannot access tickets belonging to another author." },
          { status: 403 }
        );
      }
      const sanitized = { ...ticket };
      delete sanitized.internal_notes;
      delete sanitized.ai_draft;
      return NextResponse.json({ ticket: sanitized });
    }

    const referer = req.headers.get("referer") || "";
    if (!user && referer.includes("/author")) {
      const sanitized = { ...ticket };
      delete sanitized.internal_notes;
      delete sanitized.ai_draft;
      return NextResponse.json({ ticket: sanitized });
    }

    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve ticket record." },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = extractAuthUser(req);
    const { id } = await params;
    const existing = getTicketById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (user && user.role === "author") {
      if (existing.author_id !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify tickets of other authors." },
          { status: 403 }
        );
      }
      if (body.status === "Closed") {
        const updated = updateTicket(id, { status: "Closed" });
        return NextResponse.json({ success: true, ticket: updated });
      }
      return NextResponse.json(
        { error: "Authors can only mark tickets as Closed." },
        { status: 403 }
      );
    }

    const updated = updateTicket(id, {
      status: body.status,
      priority: body.priority,
      category: body.category,
      assigned_to: body.assigned_to,
      ai_draft: body.ai_draft
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update ticket record." },
      { status: 500 }
    );
  }
}
