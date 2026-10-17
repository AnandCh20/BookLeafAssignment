import { AdminPortalView } from "@/components/admin/AdminPortalView";
import { getAdmins } from "@/lib/db";

export const metadata = {
  title: "Operations Admin — BookLeaf Publishing",
  description: "Manage author support tickets with AI triage and response generation."
};

export default function AdminPage() {
  const admins = getAdmins();
  const defaultAdmin = admins[0] ? {
    id: admins[0].admin_id,
    name: admins[0].name,
    email: admins[0].email,
    role: "admin",
    title: admins[0].title
  } : null;

  return <AdminPortalView initialAdmin={defaultAdmin} />;
}
