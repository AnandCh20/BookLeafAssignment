import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getBooksByAuthorId, getAllBooks } from "@/lib/db";

export async function GET(req) {
  try {
    const user = extractAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please authenticate." },
        { status: 401 }
      );
    }

    if (user.role === "admin") {
      const books = getAllBooks();
      return NextResponse.json({ books });
    }

    const books = getBooksByAuthorId(user.id);
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve book catalog." },
      { status: 500 }
    );
  }
}
