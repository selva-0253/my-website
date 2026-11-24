// Post registry. Every Markdown file in ./posts is picked up automatically —
// add a new post by dropping in a .md file (plus an HTML shell in /blog).

export interface Post {
  slug: string; // stable id, also used as the likes/comments key
  path: string; // public URL
  title: string;
  summary: string;
  date: string; // YYYY-MM or YYYY-MM-DD
  tags: string[];
  featured: boolean;
  body: string; // Markdown
  words: number;
  readingMinutes: number;
}

const files = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: match[2] };
}

function parseList(value = ""): string[] {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPost(file: string, raw: string): Post {
  const { data, body } = parseFrontmatter(raw);
  const required = ["title", "slug", "path", "date", "summary"] as const;
  for (const key of required) {
    if (!data[key]) throw new Error(`${file}: missing frontmatter field "${key}"`);
  }
  // Prose words only — code and diagrams don't count toward reading time.
  const prose = body.replace(/```[\s\S]*?```/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return {
    slug: data.slug,
    path: data.path,
    title: data.title,
    summary: data.summary,
    date: data.date,
    tags: parseList(data.tags),
    featured: data.featured === "true",
    body,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

/** All posts, newest first. */
export const posts: Post[] = Object.entries(files)
  .map(([file, raw]) => toPost(file, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export const allTags: string[] = [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) =>
  a.localeCompare(b),
);

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function featuredPosts(limit = 3): Post[] {
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

/** Posts sharing the most tags with `post`. */
export function relatedPosts(post: Post, limit = 2): Post[] {
  return posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map((x) => x.p);
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const value = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    ...(d ? { day: "numeric" } : {}),
    timeZone: "UTC",
  });
}
