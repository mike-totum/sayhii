"use client";

import type { Person } from "@/lib/team";

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Small colored avatar (initials on the person's color). The workhorse for
// owners/tags on cards and in pickers.
export function PersonAvatar({
  person,
  size = 20,
  ring = false,
  title,
}: {
  person: Person;
  size?: number;
  ring?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title ?? person.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        ring ? "ring-2 ring-surface" : ""
      }`}
      style={{
        backgroundColor: person.color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initialsOf(person.name)}
    </span>
  );
}

// A row of overlapping owner avatars (the colored owners on a card).
export function AvatarStack({
  people,
  size = 20,
  max = 4,
}: {
  people: Person[];
  size?: number;
  max?: number;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <span key={p.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
          <PersonAvatar person={p} size={size} ring />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-muted text-white font-semibold ring-2 ring-surface"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.4), marginLeft: -size * 0.3 }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}

// A labeled pill (avatar + name), optionally removable. Used in the card detail.
export function PersonPill({
  person,
  onRemove,
  faint = false,
}: {
  person: Person;
  onRemove?: () => void;
  faint?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 text-xs"
      style={{
        borderColor: person.color + (faint ? "55" : "99"),
        backgroundColor: person.color + (faint ? "14" : "22"),
      }}
    >
      <PersonAvatar person={person} size={16} />
      <span className="font-medium">{person.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted hover:text-foreground"
          aria-label={`Remove ${person.name}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
