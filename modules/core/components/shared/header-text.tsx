type Props = {
  title: string;
  highlightedText: string;
  description?: string;
};

export default function HeaderText({
  highlightedText,
  title,
  description,
}: Props) {
  return (
    <div className="text-center mb-8">
      <h1 className="font-bebas text-4xl sm:text-5xl tracking-wide">
        {title}{" "}
        <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
          {highlightedText}
        </span>
      </h1>
      {description ? (
        <p className="mt-2 text-muted-foreground font-grotesk text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}
