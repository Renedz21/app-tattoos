"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/modules/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Input } from "@/modules/core/components/ui/input";
import { cn } from "@/lib/utils";

type FormState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

interface MagicLinkFormProps {
  callbackUrl?: string;
}

export default function MagicLinkForm({
  callbackUrl = "/admin",
}: MagicLinkFormProps) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<FormState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setState({ status: "error", message: "Ingresa un email válido." });
      return;
    }

    setState({ status: "loading" });

    const { error } = await authClient.signIn.magicLink({
      email: trimmed,
      callbackURL: callbackUrl,
    });

    if (error) {
      setState({
        status: "error",
        message:
          error.status === 403
            ? "No estás autorizado para acceder al panel."
            : "Ocurrió un error al enviar el enlace. Intenta de nuevo.",
      });
      return;
    }

    setState({ status: "sent", email: trimmed });
  }

  if (state.status === "sent") {
    return (
      <section className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-bebas text-2xl tracking-wide">
              Revisa tu correo
            </CardTitle>
            <CardDescription>
              Te enviamos un enlace de acceso a{" "}
              <strong className="text-foreground">{state.email}</strong>. Haz
              clic en el enlace para ingresar al panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-grotesk text-sm text-muted-foreground">
              El enlace expira en 10 minutos. Si no lo ves, revisa tu carpeta de
              spam.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => {
                setEmail("");
                setState({ status: "idle" });
              }}
            >
              Usar otro email
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }
  const isLoading = state.status === "loading";

  return (
    <section className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="font-bebas text-2xl tracking-wide">
            Acceso al panel
          </CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace de acceso.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing again.
                    if (state.status === "error") {
                      setState({ status: "idle" });
                    }
                  }}
                  aria-invalid={state.status === "error" ? "true" : undefined}
                  aria-describedby={
                    state.status === "error" ? "email-error" : undefined
                  }
                />
                {state.status === "error" && (
                  <FieldError id="email-error">{state.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || email.trim() === ""}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin",
                        )}
                        aria-hidden="true"
                      />
                      Enviando…
                    </span>
                  ) : (
                    "Enviar enlace de acceso"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
