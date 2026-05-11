"use client";

// ============================================================
//  IPadFrame — realistic iPad device shell wrapping a live iframe
//  Renders any URL inside a tablet-style frame, fully interactive
// ============================================================

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  domain: string;
  title?: string;
};

export default function IPadFrame({ url, domain, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setErrored(false);
  }, [url]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, [loading, url]);

  function reload() {
    if (iframeRef.current) {
      setLoading(true);
      setErrored(false);
      const src = iframeRef.current.src;
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 rounded-[28px] p-3 sm:p-4 shadow-2xl border border-white/10"
        style={{
          boxShadow:
            "0 30px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 2px 0 rgba(255,255,255,0.08) inset",
          width: "100%",
          maxWidth: "920px",
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-[10px] sm:top-[14px] w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-700/50" />

        <div
          className="relative bg-black rounded-[16px] overflow-hidden border border-black/40"
          style={{ aspectRatio: "4 / 3" }}
        >
          <div className="flex items-center gap-2 px-3 sm:px-4 h-8 sm:h-9 bg-zinc-900/95 border-b border-white/5 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-2 sm:mx-3 px-2.5 py-0.5 bg-zinc-800/80 rounded-md text-zinc-400 font-mono truncate">
              🔒 {domain}
            </div>
            <button
              onClick={reload}
              aria-label="Reload site"
              className="text-zinc-400 hover:text-zinc-200 transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
              title="Reload"
            >
              ⟳
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              ↗
            </a>
          </div>

          {loading && !errored && (
            <div className="absolute inset-0 top-8 sm:top-9 flex flex-col items-center justify-center bg-zinc-950 z-10 pointer-events-none">
              <div className="w-10 h-10 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mb-3" />
              <div className="text-xs font-mono text-zinc-500">Loading {domain}…</div>
            </div>
          )}

          {errored && (
            <div className="absolute inset-0 top-8 sm:top-9 flex flex-col items-center justify-center bg-zinc-950 z-10 px-6 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm text-zinc-300 mb-1">
                Couldn&apos;t load this site in the frame
              </div>
              <div className="text-xs text-zinc-500 mb-4 font-mono">
                Some sites block embedded previews
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition"
              >
                Open {domain} in new tab ↗
              </a>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={url}
            title={title || `Live preview of ${domain}`}
            className="w-full h-[calc(100%-2rem)] sm:h-[calc(100%-2.25rem)] block bg-white screen-fade-in"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setErrored(true);
            }}
            loading="lazy"
          />
        </div>

        <div className="flex justify-center mt-2 sm:mt-3 mb-1">
          <div className="w-24 h-1 rounded-full bg-white/15" />
        </div>
      </div>

      <div className="mt-4 text-[11px] font-mono text-muted/70 text-center px-4">
        ↑ This is the real, live website — scroll, click, and explore inside the iPad
      </div>
    </div>
  );
}