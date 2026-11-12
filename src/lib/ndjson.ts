/** Newline-delimited JSON streaming, used by the agent endpoints so the interface can show each stage as it happens. */

export function ndjsonStream<E>(run: (emit: (e: E) => void, signal: AbortSignal) => Promise<void>, signal: AbortSignal): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: E) => {
        try {
          controller.enqueue(enc.encode(`${JSON.stringify(e)}\n`));
        } catch {}
      };
      try {
        await run(emit, signal);
      } catch (e) {
        if (!signal.aborted) emit({ type: "fatal", message: e instanceof Error ? e.message.slice(0, 160) : "error" } as E);
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });
  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}

/** Client side: read an NDJSON response and call onEvent for each line. */
export async function readNdjson<E>(res: Response, onEvent: (e: E) => void): Promise<void> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) onEvent(JSON.parse(line) as E);
    }
  }
  if (buf.trim()) onEvent(JSON.parse(buf) as E);
}
