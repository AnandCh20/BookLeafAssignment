import { NextResponse } from "next/server";
import { extractAuthUser } from "@/lib/auth";
import { getAuthorById, getAdminByEmail } from "@/lib/db";

export async function GET(req) {
  try {
    const user = extractAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role === "admin") {
      const admin = getAdminByEmail(user.email);
      return NextResponse.json({
        user: {
          id: user.id,
          name: admin ? admin.name : user.name,
          email: user.email,
          role: "admin",
          title: admin ? admin.title : "Operations"
        }
      });
    }

    const author = getAuthorById(user.id);
    if (!author) {
      return NextResponse.json(
        { error: "Author profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: author.author_id,
        name: author.name,
        email: author.email,
        phone: author.phone,
        city: author.city,
        joined_date: author.joined_date,
        role: "author",
        books: author.books
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve session profile." },
      { status: 500 }
    );
  }
}
