import { type NextResponse } from "next/server";
import { requireAdmin, AdminGuardError } from "@/lib/admin-guard";

type RouteHandler<TParams = Record<string, string>> = (
  req: Request,
  context: { params: Promise<TParams> },
  admin: { userId: string },
) => Promise<ReturnType<typeof NextResponse.json>>;

/**
 * withAdmin
 *
 * Higher-order wrapper that centralises the requireAdmin() guard pattern.
 * Instead of repeating the try/catch block in every admin route handler,
 * wrap the handler once:
 *
 *   export const POST = withAdmin(async (req, { params }, admin) => {
 *     const { id } = await params;
 *     // admin.userId is available if needed
 *     ...
 *   });
 *
 * Returns 401 / 403 automatically when the guard fails, exactly as the
 * previous inline try/catch did.
 */
export function withAdmin<TParams = Record<string, string>>(
  handler: RouteHandler<TParams>,
) {
  return async (
    req: Request,
    context: { params: Promise<TParams> },
  ): Promise<ReturnType<typeof NextResponse.json>> => {
    let admin: { userId: string };

    try {
      admin = await requireAdmin();
    } catch (err) {
      if (err instanceof AdminGuardError) {
        const { NextResponse } = await import("next/server");
        return NextResponse.json({ error: err.code }, { status: err.status });
      }
      throw err;
    }

    return handler(req, context, admin);
  };
}
