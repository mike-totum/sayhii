import { Fragment, type ReactNode } from "react";

/* A small, controlled markdown renderer for migrated blog prose. Supports
   the subset our content uses — h2/h3, paragraphs, ordered/unordered lists,
   blockquotes, horizontal rules, and inline **bold**, _italic_, and links —
   rendered into the editorial brand's typography. It does not execute JSX,
   so migrated content is rendered as text, never code. */

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "hr" };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isUl = (l: string) => /^\s*[-*]\s+/.test(l);
  const isOl = (l: string) => /^\s*\d+\.\s+/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: h[1].length === 2 ? "h2" : "h3", text: h[2].trim() });
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ").trim() });
      continue;
    }

    if (isUl(line)) {
      const items: string[] = [];
      while (i < lines.length && isUl(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (isOl(line)) {
      const items: string[] = [];
      while (i < lines.length && isOl(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // paragraph: gather consecutive non-empty, non-special lines
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{2,3})\s/.test(lines[i]) &&
      !lines[i].startsWith(">") &&
      !isUl(lines[i]) &&
      !isOl(lines[i]) &&
      !/^\s*(---|\*\*\*|___)\s*$/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: buf.join(" ") });
  }

  return blocks;
}

// Inline: **bold**, _italic_ / *italic*, [text](href). Single left-to-right
// pass so markers never overlap ambiguously.
function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /\*\*([^*]+)\*\*|__([^_]+)__|\[([^\]]+)\]\(([^)\s]+)\)|(?<![A-Za-z0-9])[_*]([^_*\n]+)[_*](?![A-Za-z0-9])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${n++}`;
    if (m[1] || m[2]) {
      out.push(
        <strong key={key} className="font-medium text-foreground">
          {m[1] ?? m[2]}
        </strong>,
      );
    } else if (m[3] && m[4]) {
      const external = /^https?:/.test(m[4]);
      out.push(
        <a
          key={key}
          href={m[4]}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
        >
          {m[3]}
        </a>,
      );
    } else if (m[5]) {
      out.push(
        <em key={key} className="font-serif italic">
          {m[5]}
        </em>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={k}
                className="font-serif text-3xl lg:text-4xl tracking-tight leading-tight pt-6"
              >
                {renderInline(b.text, k)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={k}
                className="font-serif text-2xl tracking-tight leading-snug pt-4"
              >
                {renderInline(b.text, k)}
              </h3>
            );
          case "p":
            return (
              <p key={k} className="text-lg leading-relaxed text-foreground/85">
                {renderInline(b.text, k)}
              </p>
            );
          case "ul":
            return (
              <ul key={k} className="space-y-2.5 pl-1">
                {b.items.map((it, j) => (
                  <li
                    key={`${k}-${j}`}
                    className="flex gap-3 text-lg leading-relaxed text-foreground/85"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={k} className="space-y-3">
                {b.items.map((it, j) => (
                  <li
                    key={`${k}-${j}`}
                    className="flex gap-4 text-lg leading-relaxed text-foreground/85"
                  >
                    <span
                      aria-hidden
                      className="font-serif text-xl text-primary tabular-nums leading-tight"
                    >
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <span>{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={k}
                className="border-l-2 border-primary pl-6 font-serif text-2xl italic leading-snug text-foreground"
              >
                {renderInline(b.text, k)}
              </blockquote>
            );
          case "hr":
            return <hr key={k} className="border-border" />;
          default:
            return <Fragment key={k} />;
        }
      })}
    </div>
  );
}
