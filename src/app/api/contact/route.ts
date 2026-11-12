import { firstIssue, inquirySchema } from "@/lib/schemas";
import { clientKey, rateLimit, tooMany } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Sends an inquiry by email through Resend when RESEND_API_KEY, CONTACT_TO and CONTACT_FROM are set.
 * Otherwise it answers { sent: false, reason: "not_configured" } and the interface offers the visitor's own email app.
 * It never reports a message as sent unless the provider accepted it.
 */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "contact"), 3, 10 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ sent: false, reason: "invalid", message: firstIssue(parsed.error) }, { status: 400 });
  const d = parsed.data;
  if (d.website) return Response.json({ sent: false, reason: "invalid", message: "Rejected." }, { status: 400 });

  const { RESEND_API_KEY: key, CONTACT_TO: to, CONTACT_FROM: from } = process.env;
  if (!key || !to || !from) return Response.json({ sent: false, reason: "not_configured" });

  const text = d.brief || `${d.problem}\n\n${d.features}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: d.email,
        subject: `Project inquiry: ${d.type} — ${d.name}`.slice(0, 160),
        text: `${text}\n\n— Sent from the ARSH/OS collaboration center.`,
        html: `<pre style="font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap">${esc(text)}</pre><p style="color:#778191">Sent from the ARSH/OS collaboration center.</p>`,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return Response.json({ sent: false, reason: "provider_error" }, { status: 502 });
    return Response.json({ sent: true });
  } catch {
    return Response.json({ sent: false, reason: "provider_error" }, { status: 502 });
  }
}
