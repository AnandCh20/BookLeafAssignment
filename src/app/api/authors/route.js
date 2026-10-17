import { NextResponse } from "next/server";
import { getAuthors } from "@/lib/db";
import { extractAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const demoMode = searchParams.get("demo") === "true";

    const authors = getAuthors();

    if (demoMode) {
      const publicList = authors.map((a) => ({
        author_id: a.author_id,
        name: a.name,
        email: a.email,
        city: a.city,
        books_count: a.books.length
      }));
      return NextResponse.json({ authors: publicList });
    }

    const user = extractAuthUser(req);
    if (!user) {
      const publicList = authors.map((a) => ({
        author_id: a.author_id,
        name: a.name,
        email: a.email,
        city: a.city,
        books_count: a.books.length
      }));
      return NextResponse.json({ authors: publicList });
    }

    if (user.role === "author") {
      const single = authors.find((a) => a.author_id === user.id);
      return NextResponse.json({ authors: single ? [single] : [] });
    }

    return NextResponse.json({ authors });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve authors list." },
      { status: 500 }
    );
  }
}
