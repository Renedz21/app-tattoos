import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin-allowlist";
import AdminDashboard from "@/modules/admin/components/admin-dashboard";

/**
 * /admin — Server Component (root dashboard).
 *
 * Auth is already enforced by the layout, but we re-fetch the session here
 * to pass the user data down to the client dashboard component.
 */
export default async function AdminPage() {
  const session = await getServerSession();

  // Double-check: layout should have already redirected, but be defensive.
  if (!session?.user || !isAdminEmail(session.user.email)) {
    redirect("/admin/login");
  }

  return <AdminDashboard user={session.user} />;
}
