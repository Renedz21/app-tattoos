import type { PropsWithChildren } from "react";
import LogoutButton from "@/modules/admin/components/logout-button";
import HeaderText from "@/modules/core/components/shared/header-text";

export default async function AdminLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-screen w-full">
      <div className="container mx-auto">
        <div className="p-6 md:p-10">
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <HeaderText
                title="Panel"
                highlightedText="Admin"
                description="Gestiona leads y portafolio"
                className="mb-0"
              />
              <LogoutButton />
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
