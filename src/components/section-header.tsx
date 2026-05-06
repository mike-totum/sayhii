export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "max-w-3xl mx-auto text-center"
          : "max-w-3xl"
      }
    >
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-4xl lg:text-5xl tracking-tight font-semibold leading-tight">
        {title}
      </h2>
      {sub && (
        <p className="mt-5 text-lg text-muted leading-relaxed">{sub}</p>
      )}
    </div>
  );
}
