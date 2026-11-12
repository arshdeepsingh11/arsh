import { getAi } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * Tells the interface whether agents are live or in demo mode, without revealing keys.
 * Add ?probe=1 to make one tiny real model call and report whether the key and model work:
 *   http://localhost:3000/api/agents/status?probe=1
 */
export async function GET(req: Request) {
  const ai = getAi();
  const base = ai.mode === "live" ? { mode: "live", provider: ai.provider.label, model: ai.provider.model } : { mode: "demo", reason: ai.reason };
  if (ai.mode !== "live" || !new URL(req.url).searchParams.has("probe")) return Response.json(base, { headers: { "cache-control": "no-store" } });
  const t0 = Date.now();
  try {
    const r = await ai.provider.chat({ system: "You are a health check. Reply with exactly: ready", messages: [{ role: "user", content: "ping" }], maxTokens: 50 });
    return Response.json({ ...base, probe: { ok: true, answeredBy: r.model, reply: r.text.slice(0, 40), ms: Date.now() - t0 } }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json({ ...base, probe: { ok: false, error: e instanceof Error ? e.message.slice(0, 300) : "failed", ms: Date.now() - t0 } }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
