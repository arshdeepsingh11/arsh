"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { EmbedCheck } from "@/lib/server/embed";

type Device = "desktop" | "tablet" | "phone";
const WIDTHS: Record<Device, number> = { desktop: 1280, tablet: 820, phone: 390 };

/**
 * A working browser window inside the page. Visitors can scroll, click and use the real live site.
 * Before loading, the server checks the site's framing headers; sites that forbid framing get an honest notice.
 */
export function LiveWindow({ url, title, height = 560, tabs }: { url: string; title: string; height?: number; tabs?: ReactNode }) {
  const [check, setCheck] = useState<EmbedCheck | null>(null);
  const [force, setForce] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [nonce, setNonce] = useState(0);
  const [box, setBox] = useState(0);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let on = true;
    setCheck(null); setLoaded(false); setForce(false);
    fetch(`/api/embed?url=${encodeURIComponent(url)}`).then((r) => r.json()).then((j: EmbedCheck) => on && setCheck(j)).catch(() => on && setCheck({ url, embeddable: null, reason: "The check could not run." }));
    return () => { on = false; };
  }, [url]);

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = WIDTHS[device];
  const scale = box ? Math.min(1, box / w) : 1;
  const show = check && (check.embeddable === true || force);
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="win">
      <div className="win-bar">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <div className="win-url" title={url}><span aria-hidden="true">🔒</span> {host}</div>
        <div className="win-tools" role="group" aria-label="Device size">
          {(Object.keys(WIDTHS) as Device[]).map((d) => (
            <button key={d} className={device === d ? "on" : ""} aria-pressed={device === d} onClick={() => setDevice(d)}>{d}</button>
          ))}
          <button onClick={() => { setLoaded(false); setNonce((n) => n + 1); }} aria-label="Reload">↻</button>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} in a new tab`}>↗</a>
        </div>
      </div>
      {tabs}
      <div className="win-body" ref={body} style={{ height }}>
        {!check && <div className="win-msg"><span className="spin" aria-hidden="true" /> Checking whether {host} can be shown here…</div>}
        {check && !show && (
          <div className="win-msg">
            <b>{check.embeddable === false ? `${title} can't be shown inside another site` : `${title} could not be checked`}</b>
            <p>{check.reason} This is a security setting on that site, which is a good thing.</p>
            <div className="ctl wrap" style={{ justifyContent: "center" }}>
              <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open {host} ↗</a>
              {check.embeddable === null && <button className="btn ghost" onClick={() => setForce(true)}>Try loading it here</button>}
            </div>
          </div>
        )}
        {show && (
          <div className="win-stage" style={{ width: w, height: height / scale, transform: `scale(${scale})` }}>
            {!loaded && <div className="win-msg abs"><span className="spin" aria-hidden="true" /> Loading {host}…</div>}
            <iframe
              key={nonce}
              src={url}
              title={`${title}, live`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => setLoaded(true)}
              style={{ width: w, height: height / scale }}
            />
          </div>
        )}
      </div>
      <p className="win-foot dim xs">The real site, running live. Anything you do happens on {host} itself.</p>
    </div>
  );
}

/** Window chrome for the self-contained demos, so every project opens like a small app. */
export function AppWindow({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="win">
      <div className="win-bar">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <div className="win-url">{title}</div>
        <span className="pill demo-pill">interactive</span>
      </div>
      <div className="win-app">{children}</div>
      <p className="win-foot dim xs">{note}</p>
    </div>
  );
}
