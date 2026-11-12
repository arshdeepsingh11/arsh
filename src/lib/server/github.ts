import { projects, type Project } from "@/lib/content";

/**
 * GitHub data pipeline. Pulls live public metadata for the documented projects and merges it over the verified snapshot.
 * - Cached for an hour per request URL (Next fetch cache), so a busy site makes a handful of API calls per hour.
 * - Uses GITHUB_TOKEN when present (5,000 req/h); otherwise the anonymous 60 req/h limit.
 * - On rate limiting or any failure it returns the snapshot and says why. Metrics are never fabricated.
 */

export type LiveRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};
export type RepoLive = { stars: number; forks: number; pushedAt: string; topics: string[]; language: string | null; homepage: string | null; languages?: Record<string, number> };
export type Inventory = { source: "live" | "snapshot"; reason?: string; fetchedAt: string; live: Record<string, RepoLive>; otherPublic: { name: string; description: string | null; url: string }[] };

const API = "https://api.github.com";
const user = () => process.env.GITHUB_USER || "arshdeepsingh11";

function headers(): HeadersInit {
  const h: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "arsh-os-portfolio" };
  if (process.env.GITHUB_TOKEN) h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

type Fetcher = typeof fetch;

async function gh<T>(path: string, f: Fetcher): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  try {
    const res = await f(`${API}${path}`, { headers: headers(), next: { revalidate: 3600 } } as RequestInit);
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get("x-ratelimit-reset"));
      const when = Number.isFinite(reset) && reset > 0 ? ` until ${new Date(reset * 1000).toISOString()}` : "";
      return { ok: false, reason: res.headers.get("x-ratelimit-remaining") === "0" ? `GitHub rate limit reached${when}` : `GitHub refused the request (${res.status})` };
    }
    if (!res.ok) return { ok: false, reason: `GitHub returned ${res.status}` };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, reason: "GitHub could not be reached" };
  }
}

export async function getInventory(f: Fetcher = fetch): Promise<Inventory> {
  const fetchedAt = new Date().toISOString();
  const r = await gh<LiveRepo[]>(`/users/${user()}/repos?per_page=100&sort=pushed&type=owner`, f);
  if (!r.ok) return { source: "snapshot", reason: r.reason, fetchedAt, live: {}, otherPublic: [] };
  const byName = new Map(r.data.map((x) => [x.name.toLowerCase(), x]));
  const live: Record<string, RepoLive> = {};
  for (const p of projects) {
    const x = byName.get(p.repo.toLowerCase());
    if (x) live[p.slug] = { stars: x.stargazers_count, forks: x.forks_count, pushedAt: x.pushed_at, topics: x.topics ?? [], language: x.language, homepage: x.homepage || null };
  }
  const documented = new Set(projects.map((p) => p.repo.toLowerCase()));
  const otherPublic = r.data
    .filter((x) => !x.fork && !documented.has(x.name.toLowerCase()))
    .map((x) => ({ name: x.name, description: x.description, url: x.html_url }));
  return { source: "live", fetchedAt, live, otherPublic };
}

/** Live data for a single project page, including the language breakdown. */
export async function getProjectLive(p: Project, f: Fetcher = fetch): Promise<{ live: RepoLive | null; reason?: string }> {
  const repo = await gh<LiveRepo>(`/repos/${user()}/${p.repo}`, f);
  if (!repo.ok) return { live: null, reason: repo.reason };
  const langs = await gh<Record<string, number>>(`/repos/${user()}/${p.repo}/languages`, f);
  const x = repo.data;
  return {
    live: {
      stars: x.stargazers_count,
      forks: x.forks_count,
      pushedAt: x.pushed_at,
      topics: x.topics ?? [],
      language: x.language,
      homepage: x.homepage || null,
      languages: langs.ok ? langs.data : undefined,
    },
  };
}
