export function SectionHeader({
  no,
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  no?: string;
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center" ? "max-w-3xl mx-auto text-center" : "max-w-3xl"
      }
    >
      {eyebrow && (
        <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
          {no && <span className="mr-2">{no} ·</span>}
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-serif font-normal text-4xl lg:text-5xl tracking-tight leading-[1.08]">
        {title}
      </h2>
      {sub && <p className="mt-5 text-lg text-muted leading-relaxed">{sub}</p>}
    </div>
  );
}
