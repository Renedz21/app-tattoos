"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/modules/core/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
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
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Cerrar sesión
    </Button>
  );
}
