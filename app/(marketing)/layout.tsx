import type { PropsWithChildren } from "react";
import LandingNavbar from "@/modules/core/components/shared/navbar/landing-navbar";
import Footer from "@/modules/landing/footer";

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-dvh grid grid-rows-[auto_1fr_auto] scroll-smooth">
      <LandingNavbar />
      <main className="container mx-auto px-4 lg:px-6 pt-20">{children}</main>
      <Footer />
    </section>
  );
}
