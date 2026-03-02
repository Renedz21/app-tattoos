import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

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

  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Tu enlace de acceso",
    html: `<p>Haz clic <a href="${url}">aquí</a> para ingresar al panel.</p>`,
  });
  throw new Error(
    "[auth] sendMagicLinkEmail: no email provider configured for production.",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [
    magicLink({
      expiresIn: 600,
      disableSignUp: false,
      sendMagicLink: sendMagicLinkEmail,
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
