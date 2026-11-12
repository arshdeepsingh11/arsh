export type EmbedCheck = { url: string; embeddable: boolean | null; reason: string };

/** Reads a site's framing rules (X-Frame-Options, CSP frame-ancestors) so the live window can say honestly whether it can show the site. */
export function framingVerdict(xfo: string | null, csp: string | null, ourOrigin: string | null): { embeddable: boolean; reason: string } {
  const x = (xfo ?? "").trim().toUpperCase();
  if (x === "DENY") return { embeddable: false, reason: "The site sends X-Frame-Options: DENY, which forbids showing it inside other pages." };
  if (x === "SAMEORIGIN" || x.startsWith("ALLOW-FROM")) return { embeddable: false, reason: "The site sends X-Frame-Options: SAMEORIGIN, so only its own pages may frame it." };
  const fa = (csp ?? "").split(";").map((d) => d.trim()).find((d) => d.toLowerCase().startsWith("frame-ancestors"));
  if (fa) {
    const sources = fa.split(/\s+/).slice(1).map((s) => s.toLowerCase());
    if (sources.includes("*")) return { embeddable: true, reason: "The site allows framing from anywhere." };
    if (ourOrigin && sources.some((s) => s === ourOrigin.toLowerCase())) return { embeddable: true, reason: "The site allows framing from this portfolio." };
    return { embeddable: false, reason: "The site's Content-Security-Policy (frame-ancestors) only allows specific sites to frame it." };
  }
  return { embeddable: true, reason: "The site does not restrict framing." };
}
