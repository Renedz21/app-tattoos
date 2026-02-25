import { Sparkles, ImagePlus, Palette } from "lucide-react";

const steps = [
  { label: "Preferencias", icon: Palette },
  { label: "Referencias", icon: ImagePlus },
  { label: "Resultados", icon: Sparkles },
];

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((step, i) => {
      const Icon = step.icon;
      const isActive = i === currentStep;
      const isCompleted = i < currentStep;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isActive
                  ? "border-primary bg-primary/20 text-primary"
                  : isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Icon size={18} />
            </div>
            <span
              className={`text-xs font-body font-medium ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-3 h-0.5 w-12 sm:w-20 mb-6 transition-colors ${isCompleted ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
