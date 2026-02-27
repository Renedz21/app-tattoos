import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin-allowlist";
import MagicLinkForm from "@/modules/login/components/magic-link-form";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

/**
 * /admin/login — Server Component.
 *
 * If the user is already authenticated AND is in the allowlist,
 * skip the login page and send them straight to /admin (or callbackUrl).
 *
 * This prevents an already-logged-in admin from seeing the login form.
 */
export default async function AdminLoginPage({ searchParams }: PageProps) {
  const [session, { callbackUrl }] = await Promise.all([
    getServerSession(),
    searchParams,
  ]);

  if (session?.user && isAdminEmail(session.user.email)) {
    redirect(callbackUrl ?? "/admin");
  }

  const safeCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin";

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <MagicLinkForm callbackUrl={safeCallbackUrl} />
    </section>
  );
}
