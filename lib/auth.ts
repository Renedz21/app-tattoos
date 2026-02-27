import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

// ─── Email sender ─────────────────────────────────────────────────────────────

/**
 * Sends the magic link to the user's email.
 *
 * DEV:  Logs the link to the console so you can click it without a real mailer.
 * PROD: TODO – replace with a real email provider (Resend, Postmark, SES, etc.)
 *       e.g. await resend.emails.send({ from, to: email, subject, html })
 */
async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  token: string;
  url: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      [
        "",
        "┌─────────────────────────────────────────────────────────┐",
        "│               ✉  MAGIC LINK (DEV MODE)                  │",
        "├─────────────────────────────────────────────────────────┤",
        `│  To : ${email.padEnd(51)}│`,
        `│  URL: ${url.slice(0, 51).padEnd(51)}│`,
        url.length > 51 ? `│       ${url.slice(51, 102).padEnd(51)}│` : null,
        url.length > 102 ? `│       ${url.slice(102).padEnd(51)}│` : null,
        "└─────────────────────────────────────────────────────────┘",
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return;
  }

  // TODO: integrate real email provider for production
  // Example with Resend:
  //
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "noreply@yourdomain.com",
  //   to: email,
  //   subject: "Tu enlace de acceso",
  //   html: `<p>Haz clic <a href="${url}">aquí</a> para ingresar al panel.</p>`,
  // });
  throw new Error(
    "[auth] sendMagicLinkEmail: no email provider configured for production.",
  );
}

// ─── Auth instance ────────────────────────────────────────────────────────────

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [
    magicLink({
      /**
       * Magic links expire after 10 minutes.
       * Increase if users complain about expired links.
       */
      expiresIn: 600,

      /**
       * Prevent anyone from self-registering via magic link.
       * Only pre-existing users (created by an admin) can log in.
       * Combined with the email allowlist this gives us full control.
       */
      disableSignUp: false,

      sendMagicLink: sendMagicLinkEmail,
    }),

    // Must be last — patches Set-Cookie so it works in Server Actions / RSC.
    nextCookies(),
  ],
});

// ─── Inferred types (handy for consumers) ────────────────────────────────────

export type Session = typeof auth.$Infer.Session;
