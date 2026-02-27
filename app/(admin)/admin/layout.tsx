import type { PropsWithChildren } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin-allowlist";

/**
 * Admin layout — Server Component.
 *
 * Performs the authoritative auth + allowlist check on every /admin request
 * that passes the middleware's optimistic cookie check.
 *
 * Decision tree:
 *  1. Route is /admin/login  → skip checks (login page must be publicly accessible)
 *  2. No session             → redirect to /admin/login
 *  3. Email not in allowlist → redirect to / (silent 403 — don't reveal the list)
 *  4. Authorised             → render children
 *
 * Note: The middleware already does an optimistic cookie check and redirects
 * to /admin/login when the cookie is absent. This layout adds the authoritative
 * DB-backed session check + allowlist enforcement that middleware cannot do
 * (middleware runs on Edge; session validation needs Node / DB access).
 */
export default async function AdminLayout({ children }: PropsWithChildren) {
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ?? headersList.get("next-url") ?? "";

  // 1. Skip auth checks for the login page itself to prevent redirect loops.
  //    The middleware config already allows /admin/login through; this is a
  //    belt-and-suspenders guard in case the layout is re-rendered after a
  //    navigation within the admin group.
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const session = await getServerSession();

  // 2. Not authenticated at all.
  if (!session?.user) {
    redirect("/admin/login");
  }

  // 3. Authenticated but not in the admin allowlist.
  if (!isAdminEmail(session.user.email)) {
    redirect("/?error=unauthorized");
  }

  // 4. Authorised — render the admin shell.
  return (
    <section className="min-h-screen">
      <div>{children}</div>
    </section>
  );
}
