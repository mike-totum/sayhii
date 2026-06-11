// Line icons in the brand stroke style (round caps, 2px, like the hero
// stick figure). One per signal, plus the three "uniquely sayhii" pillars.

type IconProps = { className?: string };

function Base({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* Trust — two interlocking rings */
export function TrustIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="9" cy="12" r="4.6" />
      <circle cx="15" cy="12" r="4.6" />
    </Base>
  );
}

/* Workload strain — a barbell bowing under weight */
export function WorkloadIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4.5 12.2q7.5 4.4 15 0" />
      <circle cx="4.5" cy="11.8" r="2" />
      <circle cx="19.5" cy="11.8" r="2" />
    </Base>
  );
}

/* Psychological safety — an umbrella */
export function SafetyIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4.5 12.5a7.5 7.5 0 0 1 15 0" />
      <path d="M12 5V3.5" />
      <path d="M12 12.5v5.2a2.1 2.1 0 0 1-4.2 0" />
    </Base>
  );
}

/* Clarity — a target */
export function ClarityIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="0.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

/* Belonging — a heart */
export function BelongingIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 18.8C7.4 15.5 4.5 13 4.5 9.9A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7.5 1.6c0 3.1-2.9 5.6-7.5 8.9Z" />
    </Base>
  );
}

/* Time back — a clock */
export function TimeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </Base>
  );
}

/* Science-backed — a flask */
export function FlaskIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9.8 3.5h4.4" />
      <path d="M10.8 3.5v4.9L5.6 17a2.2 2.2 0 0 0 2 3.2h8.8a2.2 2.2 0 0 0 2-3.2l-5.2-8.6V3.5" />
      <circle cx="10.4" cy="16.2" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="14" r="0.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

/* Every employee unique — a fingerprint */
export function FingerprintIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6.5 17.5C5.5 16 5 14.3 5 12a7 7 0 0 1 14 0c0 1.5-.2 3-.6 4.5" />
      <path d="M9.5 18.5c-.6-1.6-1-3.4-1-5A3.5 3.5 0 0 1 12 10a3.5 3.5 0 0 1 3.5 3.5c0 1.5-.2 3-.5 4.5" />
      <path d="M12 13.5c0 2-.2 4-.7 5.5" />
    </Base>
  );
}
