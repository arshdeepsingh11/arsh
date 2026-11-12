"use client";

import Link from "next/link";
import { useState } from "react";
import { clientSites, otherRepos, projects, SNAPSHOT_DATE, type Project, type ProjectCategory } from "@/lib/content";
import { liveSites } from "@/lib/content/extra";
import type { Inventory, RepoLive } from "@/lib/server/github";
import { vars } from "@/components/agents/Avatar";
import { LiveWindow } from "@/components/demos/LiveWindow";

const CATS: [ProjectCategory | "All", string][] = [["All", "All"], ["AI", "AI-related"], ["Web", "Web applications"], ["Mobile", "Mobile apps"], ["Experiments", "Experiments"], ["Other", "Other software"]];
const FEATURED = ["neyu", "haru", "le-sac-dore"];
const mode = (p: Project) => (p.live ? "Live site" : p.demo ? "Try it here" : "Architecture walk");

/** The Multiverse: live sites you can use in place, then every repository as an organised world. */
export function ProjectsView({ inventory }: { inventory: Inventory }) {
  const [cat, setCat] = useState<ProjectCategory | "All">("All");
  const [q, setQ] = useState("");
  const [site, setSite] = useState(liveSites[0].id);
  const live = inventory.source === "live";
  const cur = liveSites.find((s) => s.id === site)!;
  const list = projects.filter((p) => (cat === "All" || p.cat === cat) && (!q || `${p.name} ${p.kind} ${p.stack.join(" ")} ${p.tag}`.toLowerCase().includes(q)));
  const featured = cat === "All" && !q ? list.filter((p) => FEATURED.includes(p.slug)) : [];
  const rest = list.filter((p) => !featured.includes(p));
  const demos = projects.filter((p) => p.demo).length;

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">
          GitHub · arshdeepsingh11 · {live ? `live data, refreshed ${new Date(inventory.fetchedAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Edmonton" })}` : `snapshot ${SNAPSHOT_DATE}`}
        </p>
        <h1>Project Multiverse</h1>
        <p className="lede">Don&apos;t just read about the work. Use it. Live sites open right here, and {demos} projects run as working demos in your browser.</p>
        {!live && inventory.reason && <p className="note">Showing the verified snapshot because live GitHub data is unavailable right now ({inventory.reason}).</p>}
      </header>

      <div className="mini-stats">
        <div><b>{projects.length}</b><span>project worlds</span></div>
        <div><b>{demos}</b><span>working demos</span></div>
        <div><b>{liveSites.length}</b><span>live sites to try</span></div>
        <div><b>{new Set(projects.flatMap((p) => p.stack.map((s) => s.replace(/ \d+(\.\d+)?$/, "")))).size}</b><span>technologies</span></div>
      </div>

      <section className="live-now">
        <div className="sec-head"><div><p className="eyebrow mono">Live right now</p><h2>Use a real site without leaving this page</h2></div></div>
        <LiveWindow
          url={cur.url}
          title={cur.name}
          height={560}
          tabs={
            <div className="win-tabs" role="tablist" aria-label="Live sites">
              {liveSites.map((s) => (
                <button key={s.id} role="tab" aria-selected={site === s.id} className={site === s.id ? "on" : ""} onClick={() => setSite(s.id)}>
                  <b>{s.name}</b><span>{s.kind} · {s.src}</span>
                </button>
              ))}
            </div>
          }
        />
      </section>

      <section>
        <div className="sec-head">
          <div><p className="eyebrow mono">Every repository</p><h2>Choose a world</h2></div>
          <input type="search" className="search" value={q} onChange={(e) => setQ(e.target.value.toLowerCase().trim())} placeholder="Search projects and technologies" aria-label="Search projects" />
        </div>
        <div className="ctl wrap filters">
          {CATS.map(([k, l]) => (
            <button key={k} className={`chip ${cat === k ? "on" : ""}`} aria-pressed={cat === k} onClick={() => setCat(k)}>
              {l} <i>{k === "All" ? projects.length : projects.filter((p) => p.cat === k).length}</i>
            </button>
          ))}
        </div>

        {featured.length > 0 && (
          <div className="feat-grid">
            {featured.map((p) => <Card key={p.slug} p={p} live={inventory.live[p.slug]} big />)}
          </div>
        )}
        <div className="card-grid">
          {rest.length ? rest.map((p) => <Card key={p.slug} p={p} live={inventory.live[p.slug]} />) : !featured.length && <p className="empty">No project matches that search.</p>}
        </div>
      </section>

      <section className="inv">
        <div className="sec-head"><div><p className="eyebrow mono">Client work</p><h2>Shipped client websites</h2></div></div>
        <div className="sites">
          {clientSites.map((c) => (
            <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer"><b>{c.name} ↗</b><span>{c.d}</span><i className="mono">Resume · BioAro</i></a>
          ))}
        </div>
        <details>
          <summary>Full repository inventory and audit notes</summary>
          <ul>
            {projects.map((p) => <li key={p.slug}><b>{p.repo}</b> — {p.kind}. Last commit {inventory.live[p.slug]?.pushedAt.slice(0, 10) ?? p.updated}.</li>)}
            {otherRepos.map((r) => <li key={r.repo}><b>{r.repo}</b> — {r.note}</li>)}
            {inventory.otherPublic.filter((r) => !otherRepos.some((o) => o.repo.toLowerCase() === r.name.toLowerCase())).map((r) => (
              <li key={r.name}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a> — public, not yet documented here{r.description ? `: ${r.description}` : "."}</li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}

function Card({ p, live, big }: { p: Project; live?: RepoLive; big?: boolean }) {
  return (
    <Link href={`/projects/${p.slug}`} className={`pcard ${big ? "big" : ""}`} style={vars({ h: p.hue })}>
      <div className="pcard-top">
        <span className="planet sm"><i /><em /></span>
        <span className={`badge ${p.live ? "live" : p.demo ? "demo" : ""}`}>{mode(p)}</span>
      </div>
      <b>{p.name}</b>
      <span className="pcard-kind">{p.kind}</span>
      <p>{p.tag}</p>
      <div className="tags">{p.stack.slice(0, big ? 5 : 3).map((s) => <span key={s}>{s}</span>)}</div>
      <div className="pcard-foot mono">
        <span>{p.cat === "AI" ? "AI" : p.cat}</span>
        <span>{live && live.stars > 0 ? `★ ${live.stars} · ` : ""}{(live?.pushedAt ?? p.updated).slice(0, 7)}</span>
      </div>
    </Link>
  );
}
