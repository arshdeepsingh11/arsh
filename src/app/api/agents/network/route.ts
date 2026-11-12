import { getAi } from "@/lib/ai";
import { runNetwork, type NetworkEvent } from "@/lib/agents/orchestrator";
import { ndjsonStream } from "@/lib/ndjson";
import { firstIssue, networkSchema } from "@/lib/schemas";
import { clientKey, rateLimit, tooMany } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Runs the Intelligence Network and streams each stage as newline-delimited JSON. */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "network"), 4, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "bad_request", message: "Body must be JSON." }, { status: 400 });
  }
  const parsed = networkSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "bad_request", message: firstIssue(parsed.error) }, { status: 400 });
  const { task, include } = parsed.data;
  const ai = getAi();
  return ndjsonStream<NetworkEvent>((emit, signal) => runNetwork(task, include, ai, emit, signal), req.signal);
}
