import { NextResponse } from "next/server";
import { resetDatabase, getAuthors, getAllBooks, getAllTickets } from "@/lib/db";

export async function POST() {
  try {
    resetDatabase();
    return NextResponse.json({
      success: true,
      message: "Database successfully reseeded with initial sample dataset.",
      stats: {
        authors: getAuthors().length,
        books: getAllBooks().length,
        tickets: getAllTickets().length
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset sample database." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    stats: {
      authors: getAuthors().length,
      books: getAllBooks().length,
      tickets: getAllTickets().length
    }
  });
}
