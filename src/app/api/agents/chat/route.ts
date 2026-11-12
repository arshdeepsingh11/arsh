import { getAi } from "@/lib/ai";
import { answer } from "@/lib/agents/conversation";
import { chatSchema, firstIssue } from "@/lib/schemas";
import { clientKey, rateLimit, tooMany } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** One turn with one agent. The conversation history comes from the client; nothing is stored on the server. */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "chat"), 20, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "bad_request", message: "Body must be JSON." }, { status: 400 });
  }
  const parsed = chatSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "bad_request", message: firstIssue(parsed.error) }, { status: 400 });
  const { agent, messages, intent, route } = parsed.data;
  if (messages[messages.length - 1].role !== "user") return Response.json({ error: "bad_request", message: "The last message must be from the visitor." }, { status: 400 });
  try {
    const reply = await answer(agent, messages, getAi(), { intent, route, signal: req.signal });
    return Response.json(reply, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "aborted" }, { status: 499 });
  }
}
