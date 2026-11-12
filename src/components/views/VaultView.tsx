"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { certificates as C } from "@/lib/content";
import { vars } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

const LEADS_TO: Record<string, string> = {
  c_basic: "The starting point: computer fundamentals.",
  c_web: "HTML and CSS, the base of every website he has shipped since.",
  c_cpp: "C and C++ remain on his résumé's language list.",
  c_java: "Java is on his résumé; SAIT and Spring (basic) built on it.",
};

/**
 * The Credential Vault. Images arrive through short-lived signed URLs from /api/certificates and are painted onto a
 * canvas, so there is no image element to save or drag. None of this stops a screenshot; the page says so.
 */
export function VaultView({ urls }: { urls: Record<string, string> }) {
  const app = useApp();
  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [failed, setFailed] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const cache = useRef<Record<string, HTMLImageElement>>({});
  const c = C[cur];

  useEffect(() => {
    const id = C[cur].id;
    const paint = (img: HTMLImageElement) => {
      const cv = canvas.current, f = frame.current;
      if (!cv || !f) return;
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      cv.getContext("2d")!.drawImage(img, 0, 0);
      f.classList.remove("in");
      void f.offsetWidth;
      f.classList.add("in");
    };
    setFailed(false);
    if (cache.current[id]) return paint(cache.current[id]);
    const img = new Image();
    img.onload = () => { cache.current[id] = img; paint(img); };
    img.onerror = () => setFailed(true);
    img.src = urls[id];
    app.blip(700, 0.12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, urls]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      if (e.key === "ArrowRight") setCur((x) => (x + 1) % C.length);
      if (e.key === "ArrowLeft") setCur((x) => (x - 1 + C.length) % C.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (app.reduced || !frame.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    frame.current.style.setProperty("--ry", `${x * 22}deg`);
    frame.current.style.setProperty("--rx", `${-y * 14}deg`);
    frame.current.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
  };
  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">The Credential Vault</p>
        <h1>Certificates, on display</h1>
        <p className="lede">Each one is shown as a watermarked presentation copy. The original files are not part of this site.</p>
      </header>

      <section className="vault" style={vars({ t1: c.tone[0], t2: c.tone[1] })}>
        <div className={`v-stage ${zoom ? "zoom" : ""}`} onPointerMove={tilt} onPointerLeave={() => { frame.current?.style.setProperty("--ry", "0deg"); frame.current?.style.setProperty("--rx", "0deg"); }} onContextMenu={block} onDragStart={block}>
          <div className="frame" ref={frame}>
            <canvas ref={canvas} role="img" aria-label={`${c.title} certificate issued by ${c.issuer} on ${c.issued}`} />
            <div className="wm" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i}>ARSHDEEP SINGH — VERIFIED PRESENTATION COPY</span>)}</div>
            <div className="glare" aria-hidden="true" />
          </div>
          {failed && <p className="banner">This certificate image could not be loaded. Refresh the page to get a new signed link.</p>}
        </div>

        <div className="v-info" aria-live="polite">
          <p className="mono dim">Artifact 0{cur + 1} of 0{C.length}</p>
          <h2>{c.title}</h2>
          <dl><dt>Issuer</dt><dd>{c.issuer}</dd><dt>Issued</dt><dd>{c.issued}</dd><dt>Course</dt><dd>{c.detail}</dd><dt>Reference</dt><dd className="mono">{c.ref}</dd></dl>
          <p className="dim sm">Details read from the certificate itself.{c.redacted ? " Personal details on this certificate are blurred." : ""}</p>
          <div className="ctl">
            <button className="btn ghost sm" onClick={() => setCur((cur - 1 + C.length) % C.length)} aria-label="Previous certificate">←</button>
            <button className="btn ghost sm" onClick={() => setCur((cur + 1) % C.length)} aria-label="Next certificate">→</button>
            <button className="btn sm" onClick={() => setZoom(!zoom)} aria-pressed={zoom}>{zoom ? "Step back" : "Inspect"}</button>
          </div>
        </div>

        <div className="v-rail" role="tablist" aria-label="Certificates">
          {C.map((x, i) => <button key={x.id} role="tab" aria-selected={cur === i} onClick={() => setCur(i)}><span className="mono">0{i + 1}</span><b>{x.title}</b><i>{x.issuer}</i></button>)}
          <div className="v-slot"><span className="mono">0{C.length + 1}</span><b>SAIT Diploma</b><i>Document not uploaded yet. This slot is reserved, not filled in.</i></div>
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Learning path</p><h2>Each certificate, and what it became</h2></div></div>
        <ol className="journey">
          {[...C].sort((a, b) => Date.parse(a.issued) - Date.parse(b.issued)).map((x, i) => (
            <li key={x.id} style={vars({ i })}><button className="journey-btn" onClick={() => { setCur(C.indexOf(x)); window.scrollTo({ top: 0, behavior: app.reduced ? "auto" : "smooth" }); }}>
              <span className="mono">{x.issued}</span><b>{x.title}</b><span>{x.issuer}</span><i>{LEADS_TO[x.id]}</i>
            </button></li>
          ))}
          <li style={vars({ i: C.length })}><Link className="journey-btn" href="/foundation"><span className="mono">August 2025</span><b>Software Development Diploma</b><span>SAIT, Calgary</span><i>The foundation for everything since.</i></Link></li>
        </ol>
      </section>

      <details className="v-sec">
        <summary>How these documents are protected, and what that does not guarantee</summary>
        <ul>
          <li>The server holds only reduced-resolution presentation copies with the ownership watermark baked into the pixels. The original scans never enter the repository or the deployment.</li>
          <li>Images are served from a private folder through a signed link that expires after 15 minutes, and refuse requests from other sites.</li>
          <li>Dates of birth and family names printed on two certificates are blurred in the copies.</li>
          <li>The viewer paints onto a canvas, offers no download, print or open-in-new-tab control, and disables the context menu inside the frame.</li>
          <li>None of this can stop a screenshot, a screen recording or a camera. No public web page can. These measures protect the originals and discourage casual reuse.</li>
        </ul>
      </details>
    </>
  );
}
