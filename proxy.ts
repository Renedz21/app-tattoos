import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// ─── Route matchers ───────────────────────────────────────────────────────────

/**
 * Paths that the middleware should run on.
 * Excludes static files, images, and Next internals for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public folder files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_ROOT = "/admin";

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Middleware responsibilities:
 *
 * 1. Inject `x-pathname` header on every request so that Server Components
 *    (like the admin layout) can read the current pathname without needing
 *    a client-side hook.
 *
 * 2. Optimistic (Edge-compatible) auth guard for /admin routes.
 *
 * Auth strategy:
 *  - Uses `getSessionCookie` from better-auth/cookies — reads the session
 *    cookie WITHOUT hitting the DB. Fast, works on Edge runtime.
 *  - If the cookie is absent → redirect to /admin/login.
 *  - If the cookie is present → let the request through.
 *    The actual allowlist check (isAdminEmail) is done server-side in
 *    app/(admin)/admin/layout.tsx where we have full DB/Node access.
 *
 * Why not check the allowlist here?
 *  - The session cookie only contains a token, not the email.
 *  - Decoding / verifying the email requires a DB call which is incompatible
 *    with the Edge runtime and would slow down every request.
 *  - The layout is a Server Component that runs on Node, making it the right
 *    place for the authoritative allowlist check.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always inject x-pathname so layouts can read the current route.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Base response that forwards the injected headers.
  const next = NextResponse.next({ request: { headers: requestHeaders } });

  // Only guard /admin/* routes.
  // Everything else (marketing, tracking, API) passes through untouched.
  if (!pathname.startsWith(ADMIN_ROOT)) {
    return next;
  }

  // The login page itself must stay accessible (otherwise we'd redirect loop).
  if (pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return next;
  }

  // ── Optimistic cookie check ──────────────────────────────────────────────
  // getSessionCookie reads the cookie WITHOUT validating the token against the
  // DB. It just checks that the cookie exists. The full validation happens in
  // the admin layout (Server Component).
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    // Preserve the original destination so we can redirect back after login.
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie is present — let the request continue to the layout/page which
  // will perform the authoritative session + allowlist check.
  return next;
}
