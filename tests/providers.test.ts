import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getAi, type ToolDef } from "@/lib/ai";
import { anthropicProvider } from "@/lib/ai/anthropic";
import { geminiProvider } from "@/lib/ai/gemini";
import { openaiProvider } from "@/lib/ai/openai";

/* Wire-format tests: each provider is driven by a scripted fetch that checks the request and returns vendor-shaped JSON. */

type Call = { url: string; init: RequestInit; body: Record<string, unknown> };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function script(responses: unknown[]): Call[] {
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init: init!, body: JSON.parse(String(init!.body)) });
    const r = responses.shift();
    return new Response(JSON.stringify(r), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return calls;
}

const lookup: ToolDef = {
  name: "lookup",
  description: "search",
  parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  execute: ({ query }) => `found: ${query}`,
};

test("getAi falls back to demo with a reason", () => {
  assert.equal(getAi({ AI_PROVIDER: "demo" }).mode, "demo");
  const m = getAi({ AI_PROVIDER: "anthropic" });
  assert.equal(m.mode, "demo");
  if (m.mode === "demo") assert.match(m.reason, /key is not set/);
  const live = getAi({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "k", AI_MODEL: "gemini-x" });
  assert.equal(live.mode, "live");
  if (live.mode === "live") assert.equal(live.provider.model, "gemini-x");
});

test("Anthropic: tool_use round trip", async () => {
  const calls = script([
    { content: [{ type: "text", text: "Let me check." }, { type: "tool_use", id: "tu_1", name: "lookup", input: { query: "neyu" } }], stop_reason: "tool_use" },
    { content: [{ type: "text", text: "NEYU has 22 AI features." }], stop_reason: "end_turn" },
  ]);
  const p = anthropicProvider("sk-test", "claude-sonnet-5-5", "claude-haiku-5-5");
  const r = await p.chat({ system: "sys", messages: [{ role: "user", content: "hi" }], tools: [lookup] });
  assert.equal(r.text, "NEYU has 22 AI features.");
  assert.deepEqual(r.toolCalls, [{ name: "lookup", input: { query: "neyu" }, result: "found: neyu" }]);
  assert.equal(calls[0].url, "https://api.anthropic.com/v1/messages");
  const h = calls[0].init.headers as Record<string, string>;
  assert.equal(h["x-api-key"], "sk-test");
  assert.equal(h["anthropic-version"], "2023-06-01");
  assert.equal(calls[0].body.system, "sys");
  assert.deepEqual((calls[0].body.tools as { input_schema: unknown }[])[0].input_schema, lookup.parameters);
  const second = calls[1].body.messages as { role: string; content: { type: string; tool_use_id?: string; content?: string }[] }[];
  assert.equal(second[1].role, "assistant");
  assert.deepEqual(second[2].content[0], { type: "tool_result", tool_use_id: "tu_1", content: "found: neyu" });
});

test("Anthropic: fast flag selects the fast model", async () => {
  const calls = script([{ content: [{ type: "text", text: "ok" }], stop_reason: "end_turn" }]);
  await anthropicProvider("k", "big", "small").chat({ system: "s", messages: [{ role: "user", content: "x" }], fast: true });
  assert.equal(calls[0].body.model, "small");
});

test("OpenAI: tool_calls round trip", async () => {
  const calls = script([
    { choices: [{ message: { content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "lookup", arguments: '{"query":"haru"}' } }] } }] },
    { choices: [{ message: { content: "HARU uses Supabase." } }] },
  ]);
  const r = await openaiProvider("sk-o", "gpt-4.1", "gpt-4.1-mini").chat({ system: "sys", messages: [{ role: "user", content: "hi" }], tools: [lookup] });
  assert.equal(r.text, "HARU uses Supabase.");
  assert.equal((calls[0].init.headers as Record<string, string>).authorization, "Bearer sk-o");
  const m0 = calls[0].body.messages as { role: string; content: string }[];
  assert.deepEqual(m0[0], { role: "system", content: "sys" });
  assert.equal((calls[0].body.tools as { function: { name: string } }[])[0].function.name, "lookup");
  const m1 = calls[1].body.messages as { role: string; tool_call_id?: string; content: string }[];
  assert.deepEqual(m1.at(-1), { role: "tool", tool_call_id: "call_1", content: "found: haru" });
});

test("Gemini: functionCall round trip echoes thought signatures", async () => {
  const calls = script([
    { candidates: [{ content: { parts: [{ functionCall: { name: "lookup", args: { query: "sait" } }, thoughtSignature: "sig-123" }] } }] },
    { candidates: [{ content: { parts: [{ text: "thinking", thought: true }, { text: "He studied at SAIT." }] } }] },
  ]);
  const r = await geminiProvider("g-key", "gemini-2.5-flash", "gemini-2.5-flash").chat({ system: "sys", messages: [{ role: "user", content: "hi" }], tools: [lookup] });
  assert.equal(r.text, "He studied at SAIT.");
  assert.match(calls[0].url, /models\/gemini-2\.5-flash:generateContent$/);
  assert.equal((calls[0].init.headers as Record<string, string>)["x-goog-api-key"], "g-key");
  assert.deepEqual(calls[0].body.systemInstruction, { parts: [{ text: "sys" }] });
  const c1 = calls[1].body.contents as { role: string; parts: Record<string, unknown>[] }[];
  assert.equal(c1[1].role, "model");
  assert.equal(c1[1].parts[0].thoughtSignature, "sig-123");
  assert.deepEqual(c1[2].parts[0], { functionResponse: { name: "lookup", response: { result: "found: sait" } } });
});

test("HTTP errors become ProviderError with retryable status", async () => {
  globalThis.fetch = (async () => new Response("overloaded", { status: 529 })) as typeof fetch;
  await assert.rejects(anthropicProvider("k", "m", "m").chat({ system: "s", messages: [{ role: "user", content: "x" }] }), (e: Error & { retryable?: boolean }) => e.name === "ProviderError" && e.retryable === true);
});

test("Gemini: falls back to the next model on quota or a missing model, and sends a thinking config", async () => {
  const seen: string[] = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    seen.push(u.split("/models/")[1].split(":")[0]);
    const body = JSON.parse(String(init!.body));
    if (u.includes("gemini-3.8-flash")) return new Response("quota", { status: 429 });
    if (u.includes("gemini-3.6-flash")) return new Response("not found", { status: 404 });
    assert.deepEqual(body.generationConfig.thinkingConfig, { thinkingBudget: 512 });
    return Response.json({ candidates: [{ content: { parts: [{ text: "ready" }] } }] });
  }) as typeof fetch;
  const r = await geminiProvider("k", "gemini-3.8-flash", "gemini-3.8-flash", ["gemini-3.6-flash", "gemini-2.5-flash"]).chat({ system: "s", messages: [{ role: "user", content: "x" }] });
  assert.equal(r.text, "ready");
  assert.equal(r.model, "gemini-2.5-flash");
  assert.deepEqual(seen, ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"]);
});

test("Gemini: a bad key stops immediately instead of trying other models", async () => {
  let n = 0;
  globalThis.fetch = (async () => { n++; return new Response("API key not valid", { status: 400 }); }) as typeof fetch;
  await assert.rejects(geminiProvider("bad", "gemini-3.8-flash", "gemini-3.8-flash", ["gemini-2.5-flash"]).chat({ system: "s", messages: [{ role: "user", content: "x" }] }));
  assert.equal(n, 1);
});
