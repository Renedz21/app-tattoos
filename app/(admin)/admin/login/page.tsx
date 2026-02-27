import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin-allowlist";
import MagicLinkForm from "@/modules/login/components/magic-link-form";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

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
