import HeaderText from "@/modules/core/components/shared/header-text";
import GeneratorClient from "@/modules/core/generator/client";

export default function GeneratorPage() {
  return (
    <div className="min-h-dvh py-8 pt-20">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <HeaderText
            title="Generador"
            highlightedText="IA"
            description="Describe tu idea y la IA generará diseños únicos para ti"
          />
        </div>

        <GeneratorClient />
      </div>
    </div>
  );
}
