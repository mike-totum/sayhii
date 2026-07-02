"use client";

import { useRef, useState } from "react";
import type { Person } from "@/lib/team";
import { PersonAvatar } from "./person-chip";

// Click-to-upload avatar. Resizes client-side to a small square JPEG and
// stores it as a data URL in the existing photoUrl column — no storage
// service needed at 5-people scale. An upload overrides the auto-synced
// Google photo (the sync never clobbers data: URLs).

const SIZE = 256;

async function fileToAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read image"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    // cover-crop to a centered square
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function AvatarUpload({
  person,
  size = 52,
  canEdit,
  onChange,
}: {
  person: Person;
  size?: number;
  canEdit: boolean;
  onChange: (photoUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const uploaded = person.photoUrl?.startsWith("data:") ?? false;

  if (!canEdit) return <PersonAvatar person={person} size={size} />;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Change photo"
        className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        disabled={busy}
      >
        <PersonAvatar person={person} size={size} />
        <span
          className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/45 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h2.6l1.6-2.4h7.6L17.4 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.4" />
          </svg>
        </span>
      </button>
      {uploaded && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[10px] text-muted hover:text-foreground transition-colors"
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await fileToAvatar(file));
          } catch (err) {
            console.error("avatar upload failed", err);
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
