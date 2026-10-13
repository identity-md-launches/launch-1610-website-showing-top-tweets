import type { PepeVariant } from "./components/Pepe";

export type Post = {
  id: string;
  url: string;
  author: { name: string; handle: string; pepe: PepeVariant };
  text: string;
  date: string;
  likes: number;
  reposts: number;
  replies: number;
  topics: string[];
};

export type SortKey = "top" | "newest";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en");
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatCount = (n: number) => compact.format(n);
export const formatFull = (n: number) => full.format(n);
export const formatDate = (iso: string) => day.format(new Date(iso));

/** "Top" ranks by likes plus reposts; a repost carries the post further than a like, so it counts double. */
export const score = (p: Post) => p.likes + p.reposts * 2;

export function rank(posts: Post[], sort: SortKey): Post[] {
  const copy = [...posts];
  if (sort === "newest") {
    copy.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  } else {
    copy.sort((a, b) => score(b) - score(a));
  }
  return copy;
}

export function matches(p: Post, topic: string | null, query: string): boolean {
  if (topic && !p.topics.includes(topic)) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    p.text.toLowerCase().includes(q) ||
    p.author.name.toLowerCase().includes(q) ||
    p.author.handle.toLowerCase().includes(q)
  );
}
