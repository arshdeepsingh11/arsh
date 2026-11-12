import { getAi } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Tells the interface whether agents are live or in demo mode. It never names the AI vendor or model to visitors.
 *
 * Health checks:
 *   /api/agents/status?probe=1   one real call through the normal model chain
 *   /api/agents/status?probe=all one call to every model in the chain, to see which are busy or unavailable
 * Details (model names, error messages) are shown on localhost, or in production with &token=<AI_DEBUG_TOKEN>.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ai = getAi();
  const headers = { "cache-control": "no-store" };
  const base = ai.mode === "live" ? { mode: "live" as const } : { mode: "demo" as const, reason: ai.reason };
  const probe = url.searchParams.get("probe");
  if (ai.mode !== "live" || !probe) return Response.json(base, { headers });

  const token = process.env.AI_DEBUG_TOKEN;
  const details = process.env.NODE_ENV !== "production" || (Boolean(token) && url.searchParams.get("token") === token);
  const ping = async (only?: string) => {
    const t0 = Date.now();
    try {
      const r = await ai.provider.chat({ system: "You are a health check. Reply with exactly: ready", messages: [{ role: "user", content: "ping" }], maxTokens: 50, only });
      return { ok: true, ms: Date.now() - t0, ...(details ? { model: r.model, reply: r.text.slice(0, 40) } : {}) };
    } catch (e) {
      return { ok: false, ms: Date.now() - t0, ...(details ? { error: e instanceof Error ? e.message.slice(0, 300) : "failed" } : {}) };
    }
  };

  if (probe === "all" && details && ai.provider.models?.length) {
    const results = await Promise.all(ai.provider.models.map(async (m) => ({ model: m, ...(await ping(m)) })));
    return Response.json({ ...base, provider: ai.provider.label, models: results }, { status: results.some((r) => r.ok) ? 200 : 502, headers });
  }
  const r = await ping();
  return Response.json({ ...base, probe: r }, { status: r.ok ? 200 : 502, headers });
}
