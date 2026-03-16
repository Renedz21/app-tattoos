export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Hero from "@/modules/landing/hero";
import Portfolio from "@/modules/landing/portfolio";
import HowItWorks from "@/modules/landing/how-it-works";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Suspense>
        <Portfolio />
      </Suspense>
      <HowItWorks />
    </>
  );
}
