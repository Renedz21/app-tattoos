import { cn } from "@/lib/utils";

type Props = {
  title: string;
  highlightedText: string;
  description?: string;
  className?: string;
};

export default function HeaderText({
  highlightedText,
  title,
  description,
  className,
}: Props) {
  return (
    <div className={cn("text-center mb-8", className)}>
      <h1 className="text-left font-bebas text-4xl sm:text-5xl tracking-wide">
        {title}{" "}
        <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
          {highlightedText}
        </span>
      </h1>
      {description ? (
        <p className="mt-2 text-muted-foreground font-grotesk text-sm text-left">
          {description}
        </p>
      ) : null}
    </div>
  );
}
