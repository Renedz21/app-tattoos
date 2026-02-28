import { Sparkles, MessageSquare, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/modules/core/components/ui/card";

const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Genera tu idea",
    description:
      "Usa nuestra herramienta con IA para diseñar tu tatuaje ideal. Elige estilo, parte del cuerpo y deja que la tecnología haga su magia.",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "Solicita cotización",
    description:
      "Envía tu diseño favorito y recibe una cotización personalizada. Sin compromiso, respuesta en menos de 24 horas.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Agenda tu cita",
    description:
      "Paga tu seña para confirmar la cita. El monto se descuenta del precio total. ¡Ya casi tienes tu nuevo tattoo!",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-24 md:py-32 border-t border-border/30"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-bebas  text-4xl tracking-wide sm:text-5xl md:text-6xl">
            Cómo{" "}
            <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
              funciona
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground font-grotesk max-w-lg mx-auto">
            Tres pasos simples para pasar de la idea al tatuaje. Sin
            complicaciones.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10"
            >
              <CardContent className="p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <step.icon size={22} className="text-primary" />
                  </div>
                  <span className="font-bebas text-4xl text-border/60">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 font-bebas text-2xl tracking-wide text-card-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground font-grotesk">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
