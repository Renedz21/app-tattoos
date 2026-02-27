import { getServerSession } from "./session";
import { isAdminEmail } from "./admin-allowlist";

export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await getServerSession();

  if (!session?.user) {
    throw new AdminGuardError(401, "not_authenticated");
  }

  if (!isAdminEmail(session.user.email)) {
    throw new AdminGuardError(403, "not_authorized");
  }

  return { userId: session.user.id };
}

export class AdminGuardError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "AdminGuardError";
  }
}
