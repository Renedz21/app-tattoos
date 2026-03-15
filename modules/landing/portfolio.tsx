import prisma from "@/lib/prisma";
import PortfolioClient from "./portfolio-client";

export default async function Portfolio() {
  const items = await prisma.portfolioItem.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (items.length === 0) return null;

  return (
    <section
      id="portafolio"
      className="py-24 md:py-32 border-t border-border/30"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-bebas text-4xl tracking-wide sm:text-5xl md:text-6xl">
            Trabajos{" "}
            <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
              Reales
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground font-grotesk max-w-lg mx-auto">
            Cada pieza cuenta una historia. Explora nuestro portafolio de
            tatuajes terminados.
          </p>
        </div>

        <PortfolioClient items={items} />
      </div>
    </section>
  );
}
