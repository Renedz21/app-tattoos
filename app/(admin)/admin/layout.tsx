import type { PropsWithChildren } from "react";
export default async function AdminLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-screen w-full">
      <div className="container mx-auto">{children}</div>
    </section>
  );
}
