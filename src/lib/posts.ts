import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Blog posts now live on this site as markdown in src/content/blog. Each file
// is a real sayhii essay with frontmatter; the body renders through the
// editorial Markdown component. Migrated from the original Squarespace blog.

export type Post = {
  slug: string;
  title: string;
  author: string;
  date: string; // ISO YYYY-MM-DD
  excerpt: string;
  body: string;
  readingMinutes: number;
};

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function readAll(): Post[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const all = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const body = content.trim();
    const words = body.split(/\s+/).filter(Boolean).length;
    const excerpt =
      (data.excerpt as string | undefined)?.trim() ||
      firstParagraph(body).slice(0, 180);
    return {
      slug: (data.slug as string) || file.replace(/\.md$/, ""),
      title: (data.title as string) || file,
      author: (data.author as string) || "sayhii",
      date: normalizeDate(data.date),
      excerpt,
      body,
      readingMinutes: Math.max(1, Math.round(words / 200)),
    } satisfies Post;
  });

  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function firstParagraph(body: string): string {
  for (const block of body.split(/\n{2,}/)) {
    const line = block.trim();
    if (line && !line.startsWith("#") && !line.startsWith(">")) {
      return line.replace(/[*_>#`[\]]/g, "").replace(/\s+/g, " ");
    }
  }
  return "";
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export const posts: Post[] = readAll();

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function postUrl(slug: string) {
  return `https://sayhii.io/blog/${slug}`;
}
