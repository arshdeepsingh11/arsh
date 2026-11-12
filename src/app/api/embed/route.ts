import { projects } from "@/lib/content";
import { liveSites } from "@/lib/content/extra";
import { framingVerdict, type EmbedCheck } from "@/lib/server/embed";

// Reads the query string, so it must run per request; the fetch itself is cached for a day.
export const dynamic = "force-dynamic";

const ALLOWED = new Set([...liveSites.map((s) => s.url), ...projects.flatMap((p) => (p.live ? [p.live] : []))].map((u) => new URL(u).origin));

export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url") ?? "";
  let origin: string;
  try {
    origin = new URL(target).origin;
  } catch {
    return Response.json({ error: "bad_url" }, { status: 400 });
  }
  if (!ALLOWED.has(origin)) return Response.json({ error: "not_allowed" }, { status: 400 });
  const ours = req.headers.get("origin") ?? (req.headers.get("host") ? `https://${req.headers.get("host")}` : null);
  try {
    const res = await fetch(target, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (ARSH/OS embed check)" }, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } } as RequestInit);
    const v = framingVerdict(res.headers.get("x-frame-options"), res.headers.get("content-security-policy"), ours);
    return Response.json({ url: res.url || target, ...v } satisfies EmbedCheck, { headers: { "cache-control": "public, s-maxage=86400" } });
  } catch {
    return Response.json({ url: target, embeddable: null, reason: "The site could not be reached from the server to check it." } satisfies EmbedCheck);
  }
}
