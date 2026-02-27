"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/modules/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AdminDashboardProps {
  user: AdminUser;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-bebas text-4xl tracking-wide">Panel Admin</h1>
            <p className="font-grotesk text-sm text-muted-foreground mt-1">
              Bienvenido al panel de administración.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Cerrar sesión
          </Button>
        </div>

        {/* ── Session info ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bebas text-xl tracking-wide">
              Sesión activa
            </CardTitle>
            <CardDescription>
              Información de tu cuenta de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </dt>
                <dd className="font-grotesk text-sm text-foreground mt-0.5">
                  {user.name}
                </dd>
              </div>
              <div>
                <dt className="font-grotesk text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="font-grotesk text-sm text-foreground mt-0.5">
                  {user.email}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* ── Placeholder for future admin sections ────────────────────── */}
        <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
          <p className="font-grotesk text-sm text-muted-foreground">
            Próximamente: gestión de solicitudes, cotizaciones y pagos.
          </p>
        </div>
      </div>
    </div>
  );
}
