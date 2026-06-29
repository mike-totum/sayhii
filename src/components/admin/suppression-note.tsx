// Shown when a company/department aggregate is hidden because the group is
// smaller than the anonymity minimum.
export function SuppressionNote({ roster }: { roster: number }) {
  return (
    <p className="mt-4 text-xs text-muted leading-relaxed">
      ⓘ Aggregates hidden — only {roster}{" "}
      {roster === 1 ? "person" : "people"}, below the minimum group size for
      anonymity.
    </p>
  );
}
