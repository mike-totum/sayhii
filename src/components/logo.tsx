type Props = { className?: string };

export function Logo({ className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-baseline gap-0 text-2xl font-semibold tracking-tight ${className}`}
      aria-label="sayhii"
    >
      <span>say</span>
      <span className="font-serif italic text-primary">hii</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block size-1.5 rounded-full bg-primary translate-y-[-2px] animate-pulse-soft"
      />
    </span>
  );
}
