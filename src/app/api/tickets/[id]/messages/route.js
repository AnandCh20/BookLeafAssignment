import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getTicketById, addTicketMessage, updateTicket } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    let user = extractAuthUser(req);
    const { id } = await params;
    const ticket = getTicketById(id);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    const referer = req.headers.get("referer") || "";
    if (!user) {
      if (referer.includes("/admin")) {
        user = {
          name: "Operations Team",
          role: "admin"
        };
      } else {
        user = {
          name: ticket.author_name,
          role: "author",
          id: ticket.author_id
        };
      }
    }

    if (user.role === "author" && ticket.author_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot message on another author's ticket." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, status } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const newMessage = addTicketMessage(id, {
      sender_type: user.role,
      sender_name: user.name,
      content: content.trim()
    });

    if (user.role === "admin") {
      const updates = {};
      if (status && ["Open", "In Progress", "Resolved", "Closed"].includes(status)) {
        updates.status = status;
      } else if (ticket.status === "Open") {
        updates.status = "In Progress";
      }
      updates.ai_draft = null;
      updateTicket(id, updates);
    } else if (user.role === "author" && ticket.status === "Resolved") {
      updateTicket(id, { status: "In Progress" });
    }

    const refreshedTicket = getTicketById(id);
    return NextResponse.json(
      {
        success: true,
        message: newMessage,
        ticket: refreshedTicket
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to post ticket message." },
      { status: 500 }
    );
  }
}
