import { AuthorPortalView } from "@/components/author/AuthorPortalView";
import { getAuthors } from "@/lib/db";

export const metadata = {
  title: "Author Portal — BookLeaf Publishing",
  description: "View published titles, sales royalties, and manage support tickets."
};

export default function AuthorPage() {
  const allAuthors = getAuthors();
  const defaultAuthor = allAuthors[0] ? {
    id: allAuthors[0].author_id,
    name: allAuthors[0].name,
    email: allAuthors[0].email,
    phone: allAuthors[0].phone,
    city: allAuthors[0].city,
    joined_date: allAuthors[0].joined_date,
    role: "author",
    books: allAuthors[0].books
  } : null;

  const publicList = allAuthors.map((a) => ({
    author_id: a.author_id,
    name: a.name,
    email: a.email,
    city: a.city,
    books_count: a.books.length
  }));

  return <AuthorPortalView initialUser={defaultAuthor} initialAuthorsList={publicList} />;
}
