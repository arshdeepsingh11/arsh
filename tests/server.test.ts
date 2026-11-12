import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET as certGET } from "@/app/api/certificates/[id]/route";
import { POST as chatPOST } from "@/app/api/agents/chat/route";
import { POST as contactPOST } from "@/app/api/contact/route";
import { POST as networkPOST } from "@/app/api/agents/network/route";
import { signCertificate, verifyCertificate } from "@/lib/server/cert-token";
import { getInventory } from "@/lib/server/github";
import { readNdjson } from "@/lib/ndjson";
import { rateLimit } from "@/lib/server/rate-limit";

const realFetch = globalThis.fetch;
const env = { ...process.env };
afterEach(() => { globalThis.fetch = realFetch; process.env = { ...env }; });

let ip = 0;
const post = (url: string, body: unknown) => new Request(`http://localhost${url}`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip}` }, body: JSON.stringify(body) });

test("certificate tokens: valid, tampered, wrong id, expired", () => {
  const t = signCertificate("c_java");
  assert.equal(verifyCertificate("c_java", t), true);
  assert.equal(verifyCertificate("c_cpp", t), false);
  assert.equal(verifyCertificate("c_java", t.replace(/.$/, (c) => (c === "A" ? "B" : "A"))), false);
  assert.equal(verifyCertificate("c_java", null), false);
  assert.equal(verifyCertificate("c_java", signCertificate("c_java", Date.now() - 60 * 60 * 1000)), false);
});

test("certificate route refuses unsigned and cross-site requests, serves signed ones", async () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  assert.equal((await certGET(new Request("http://localhost/api/certificates/c_java"), ctx("c_java"))).status, 404);
  const ok = await certGET(new Request(`http://localhost/api/certificates/c_java?t=${signCertificate("c_java")}`), ctx("c_java"));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("content-type"), "image/jpeg");
  assert.equal(ok.headers.get("cache-control"), "private, no-store");
  assert.ok((await ok.arrayBuffer()).byteLength > 10_000);
  const cross = await certGET(new Request(`http://localhost/api/certificates/c_java?t=${signCertificate("c_java")}`, { headers: { "sec-fetch-site": "cross-site" } }), ctx("c_java"));
  assert.equal(cross.status, 404);
  assert.equal((await certGET(new Request(`http://localhost/api/certificates/nope?t=${signCertificate("nope")}`), ctx("nope"))).status, 404);
});

test("chat route validates input and answers in demo mode", async () => {
  process.env.AI_PROVIDER = "demo";
  assert.equal((await chatPOST(post("/api/agents/chat", { agent: "nobody", messages: [] }))).status, 400);
  const res = await chatPOST(post("/api/agents/chat", { agent: "atlas", messages: [{ role: "user", content: "Where does he work now?" }] }));
  assert.equal(res.status, 200);
  const j = (await res.json()) as { mode: string; text: string };
  assert.equal(j.mode, "demo");
  assert.match(j.text, /BioAro/);
});

test("network route streams NDJSON events ending in a result", async () => {
  process.env.AI_PROVIDER = "demo";
  const res = await networkPOST(post("/api/agents/network", { task: "Best project for a mobile developer role", include: [] }));
  assert.equal(res.headers.get("content-type"), "application/x-ndjson; charset=utf-8");
  const types: string[] = [];
  await readNdjson<{ type: string }>(res, (e) => types.push(e.type));
  assert.equal(types[0], "plan");
  assert.equal(types.at(-1), "result");
});

test("contact route never claims to send when email is not configured", async () => {
  delete process.env.RESEND_API_KEY;
  const body = { name: "Dana", email: "dana@example.com", type: "Web application", problem: "We need a booking site for a clinic.", features: "Online booking", integrations: [] };
  const j = (await (await contactPOST(post("/api/contact", body))).json()) as { sent: boolean; reason: string };
  assert.deepEqual(j, { sent: false, reason: "not_configured" });
  assert.equal((await contactPOST(post("/api/contact", { ...body, email: "nope" }))).status, 400);
  assert.equal((await contactPOST(post("/api/contact", { ...body, website: "spam.example" }))).status, 400);
});

test("contact route sends through Resend when configured", async () => {
  Object.assign(process.env, { RESEND_API_KEY: "re_test", CONTACT_TO: "arsh@example.com", CONTACT_FROM: "site@example.com" });
  let sent: Record<string, unknown> | null = null;
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    sent = JSON.parse(String(init!.body));
    return new Response(JSON.stringify({ id: "1" }), { status: 200 });
  }) as typeof fetch;
  const body = { name: "Dana", email: "dana@example.com", type: "Web application", problem: "We need a booking site for a clinic.", features: "Online booking", integrations: [], brief: "Hello <b>there</b>" };
  const j = (await (await contactPOST(post("/api/contact", body))).json()) as { sent: boolean };
  assert.equal(j.sent, true);
  assert.equal(sent!.reply_to, "dana@example.com");
  assert.match(String(sent!.html), /&lt;b&gt;there/);
});

test("GitHub pipeline merges live data and falls back on rate limits", async () => {
  globalThis.fetch = (async () => new Response("{}", { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1900000000" } })) as typeof fetch;
  const limited = await getInventory();
  assert.equal(limited.source, "snapshot");
  assert.match(limited.reason!, /rate limit/);

  globalThis.fetch = (async () => Response.json([
    { name: "Haru", description: "x", html_url: "https://github.com/a/Haru", homepage: "", stargazers_count: 3, forks_count: 1, language: "TypeScript", topics: ["ai"], pushed_at: "2026-11-01T00:00:00Z", fork: false, archived: false },
    { name: "NewThing", description: "new", html_url: "https://github.com/a/NewThing", homepage: null, stargazers_count: 0, forks_count: 0, language: null, pushed_at: "2026-11-02T00:00:00Z", fork: false, archived: false },
  ])) as typeof fetch;
  const inv = await getInventory();
  assert.equal(inv.source, "live");
  assert.equal(inv.live.haru.stars, 3);
  assert.deepEqual(inv.live.haru.topics, ["ai"]);
  assert.deepEqual(inv.otherPublic.map((r) => r.name), ["NewThing"]);
});

test("rate limiter blocks after the limit and recovers after the window", () => {
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimit("t", 3, 1000, now).ok, true);
  assert.equal(rateLimit("t", 3, 1000, now + 10).ok, false);
  assert.equal(rateLimit("t", 3, 1000, now + 1001).ok, true);
});
