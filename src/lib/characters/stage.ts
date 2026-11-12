import * as THREE from "three";
import type { AgentId, CharacterState } from "@/lib/content/agents";
import { ORDER } from "./order";

export { ORDER };

/**
 * ARSH/OS character system: six original procedural beings with distinct geometry, one shared state animator.
 * One WebGL context renders the whole roster; animation pauses when off screen or when the tab is hidden.
 */
const T = THREE;
type Obj = THREE.Object3D;
type Axis = "x" | "y" | "z";
type Glow = THREE.MeshBasicMaterial | THREE.LineBasicMaterial;
export type Params = Record<(typeof KEYS)[number], number>;
type Rig = {
  g: THREE.Group; head: Obj; eyes: Obj[]; mouth: Obj; mouthAxis: "x" | "y" | "all"; mouthAmp: number; armL: Obj; armR: Obj;
  glow: Glow[]; spin: [Obj, Axis, number][]; accent: string; h: number; hover: [number, number]; headY: number;
  headLook?: number; hoverPart?: Obj; waveAmt?: number; custom?: (t: number, p: Params) => void;
};
export type Character = Rig & {
  id: AgentId; state: CharacterState; p: Params; phase: number; blinkAt: number; lookX: number; lookY: number;
  mouthBase: THREE.Vector3; hoverPart: Obj; hoverBase: number; baseX: number; shadow?: THREE.Mesh; hit?: THREE.Mesh; dais?: THREE.Mesh;
};

const C = (h: string) => new T.Color(h);
const RED = C('#ff5a4d');

function phys(color: string, o: THREE.MeshPhysicalMaterialParameters = {}) {
  return new T.MeshPhysicalMaterial(Object.assign({ color, metalness: 0.1, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.6 }, o));
}
function glowMat(color: string, o: THREE.MeshBasicMaterialParameters = {}) {
  const m = new T.MeshBasicMaterial(Object.assign({ color, toneMapped: false }, o));
  m.userData.base = C(color); return m;
}
function mesh<M extends THREE.Material>(geo: THREE.BufferGeometry, mat: M, x = 0, y = 0, z = 0, parent?: Obj): THREE.Mesh<THREE.BufferGeometry, M> { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
function grp(x = 0, y = 0, z = 0, parent?: Obj) { const g = new T.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; }
function lathe(pts: number[][], seg = 48) { return new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg); }
const sph = (r: number, w = 32, h = 24) => new T.SphereGeometry(r, w, h);
const cyl = (a: number, b: number, h: number, s = 24) => new T.CylinderGeometry(a, b, h, s);
const box = (x: number, y: number, z: number) => new T.BoxGeometry(x, y, z);
const tor = (r: number, t: number, s = 64, a = Math.PI * 2) => new T.TorusGeometry(r, t, 10, s, a);
const cap = (r: number, l: number) => new T.CapsuleGeometry(r, l, 8, 16);

/* ---------- ARIA: elegant holographic android ---------- */
function buildAria(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const pearl = phys('#f7f9fc', { roughness: 0.22, clearcoat: 1, iridescence: 0.7, iridescenceIOR: 1.5 });
  const ice = glowMat('#3fb8ff'); glow.push(ice);
  const veil = phys('#cfeaff', { transparent: true, opacity: 0.42, roughness: 0.1, side: T.DoubleSide, iridescence: 1 });
  const silver = phys('#c9d2de', { metalness: 0.9, roughness: 0.2 });
  mesh(lathe([[0.02, 0.32], [0.56, 0.36], [0.5, 0.52], [0.36, 0.85], [0.24, 1.12], [0.19, 1.26]]), pearl, 0, 0, 0, g);
  mesh(lathe([[0.6, 0.3], [0.66, 0.34], [0.5, 0.75], [0.3, 1.1]], 48), veil, 0, 0, 0, g);
  mesh(lathe([[0.19, 1.26], [0.2, 1.3], [0.27, 1.42], [0.31, 1.56], [0.25, 1.68], [0.1, 1.74], [0.07, 1.8]]), pearl, 0, 0, 0, g);
  mesh(tor(0.2, 0.018), silver, 0, 1.27, 0, g).rotation.x = Math.PI / 2;
  [[0.5, 0.52], [0.36, 0.85]].forEach(([r, y]) => { mesh(tor(r + 0.004, 0.006), ice, 0, y, 0, g).rotation.x = Math.PI / 2; });
  const graph = phys('#3a4352', { metalness: 0.7, roughness: 0.3 }); mesh(lathe([[0.2, 1.28], [0.255, 1.4], [0.2, 1.47]], 48), graph, 0, 0, 0, g); mesh(cyl(0.06, 0.07, 0.1, 16), graph, 0, 1.8, 0, g);
  const core = mesh(new T.OctahedronGeometry(0.06), ice, 0, 1.55, 0.27, g); spin.push([core, 'y', 1.2]);
  const head = grp(0, 1.84, 0, g); head.scale.setScalar(1.14);
  mesh(sph(0.225), pearl, 0, 0.17, 0, head).scale.set(0.92, 1.12, 1);
  const hair = mesh(new T.SphereGeometry(0.245, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), silver, 0, 0.2, -0.03, head); hair.scale.set(0.97, 1.1, 1.06); hair.rotation.x = -0.62;
  [-1, 1].forEach(s => { const r = mesh(cap(0.03, 0.75), veil, s * 0.2, -0.22, -0.2, head); r.rotation.set(0.35, 0, s * 0.12); r.scale.set(1.6, 1, 0.5); });
  const halo = mesh(tor(0.3, 0.008), ice, 0, 0.3, -0.12, head); halo.rotation.x = 1.15; spin.push([halo, 'z', 0.5]);
  const eyes = [-1, 1].map(s => { const e = mesh(sph(0.04, 16, 12), ice, s * 0.085, 0.19, 0.19, head); e.scale.set(1.45, 0.7, 0.3); e.userData.sy = 0.7; e.rotation.z = s * -0.18; return e; });
  const mouth = mesh(box(0.06, 0.008, 0.01), glowMat('#b9ddf3'), 0, 0.075, 0.2, head); glow.push(mouth.material);
  mesh(new T.OctahedronGeometry(0.022), ice, 0, 0.33, 0.21, head);
  const arm = (s: number) => { const a = grp(s * 0.33, 1.6, 0, g); mesh(sph(0.075), pearl, 0, 0, 0, a); const u = mesh(cyl(0.045, 0.032, 0.62, 16), pearl, 0, -0.33, 0, a); mesh(sph(0.045, 16, 12), silver, 0, -0.67, 0, a); mesh(tor(0.05, 0.008, 24), ice, 0, -0.5, 0, a).rotation.x = Math.PI / 2; a.rotation.z = s * 0.2; a.userData.rest = s * 0.2; return a; };
  const armL = arm(-1), armR = arm(1);
  [0.66, 0.8].forEach((r, i) => { const ring = mesh(tor(r, 0.006), glowMat('#7fd0ff', { transparent: true, opacity: 0.55 }), 0, 0.16 + i * 0.07, 0, g); ring.rotation.x = Math.PI / 2; glow.push(ring.material); spin.push([ring, 'z', i ? -0.4 : 0.6]); });
  return { g, head, eyes, mouth, mouthAxis: 'y', mouthAmp: 5, armL, armR, glow, spin, accent: '#7fd0ff', h: 2.35, hover: [0.045, 1.1], headY: 2.03 };
}

/* ---------- NEX: compact tracked engineer ---------- */
function buildNex(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const ti = phys('#cfd6e0', { metalness: 0.6, roughness: 0.3, clearcoat: 0.3, envMapIntensity: 0.9 });
  const dark = phys('#2a303b', { metalness: 0.6, roughness: 0.45 });
  const blue = glowMat('#2f8bff'); glow.push(blue);
  [-1, 1].forEach(s => { const tr = mesh(cap(0.14, 0.5), dark, s * 0.42, 0.15, 0, g); tr.rotation.x = Math.PI / 2; [-0.25, 0, 0.25].forEach(z => { const w = mesh(cyl(0.085, 0.085, 0.05, 12), ti, s * 0.5, 0.15, z, g); w.rotation.z = Math.PI / 2; spin.push([w, 'x', 2]); }); });
  mesh(box(0.74, 0.14, 0.62), dark, 0, 0.3, 0, g);
  mesh(box(0.7, 0.52, 0.52), ti, 0, 0.62, 0, g);
  mesh(box(0.46, 0.3, 0.02), dark, 0, 0.64, 0.265, g);
  const bars = [0, 1, 2, 3].map(i => mesh(box(0.07, 0.04 + i * 0.045, 0.02), blue, -0.15 + i * 0.1, 0.56 + i * 0.022, 0.28, g));
  const gear = mesh(new T.TorusGeometry(0.16, 0.045, 6, 10), ti, 0, 0.66, -0.3, g); spin.push([gear, 'z', 1.5]);
  mesh(cyl(0.07, 0.09, 0.14, 12), dark, 0, 0.94, 0, g);
  const head = grp(0, 1.0, 0, g);
  mesh(box(0.78, 0.4, 0.46), ti, 0, 0.22, 0, head);
  mesh(box(0.66, 0.26, 0.04), dark, 0, 0.23, 0.225, head);
  [-1, 1].forEach(s => { const b = mesh(cyl(0.07, 0.07, 0.08, 8), dark, s * 0.42, 0.22, 0, head); b.rotation.z = Math.PI / 2; });
  const eyes = [[-0.16, 0.085], [0.17, 0.052]].map(([x, r]) => { const e = grp(x, 0.25, 0.25, head); const ring = mesh(cyl(r + 0.022, r + 0.022, 0.05, 20), ti, 0, 0, 0, e); ring.rotation.x = Math.PI / 2; const l = mesh(cyl(r, r, 0.06, 20), blue, 0, 0, 0.005, e); l.rotation.x = Math.PI / 2; const p = mesh(cyl(r * 0.4, r * 0.4, 0.065, 12), dark, 0, 0, 0.007, e); p.rotation.x = Math.PI / 2; e.userData.sy = 1; return e; });
  const mouth = mesh(box(0.2, 0.02, 0.02), blue, 0.02, 0.1, 0.25, head);
  const ant = grp(0.26, 0.42, -0.08, head); mesh(cyl(0.008, 0.008, 0.3, 6), dark, 0, 0.15, 0, ant); const tip = mesh(sph(0.03, 12, 8), blue, 0, 0.32, 0, ant);
  const arm = (s: number) => { const a = grp(s * 0.42, 0.78, 0, g); mesh(sph(0.09, 16, 12), dark, 0, 0, 0, a); mesh(cyl(0.045, 0.045, 0.3, 10), ti, s * 0.1, -0.15, 0, a).rotation.z = s * 0.6; const f = grp(s * 0.19, -0.3, 0, a); mesh(sph(0.06, 12, 10), dark, 0, 0, 0, f); mesh(cyl(0.04, 0.05, 0.26, 10), ti, 0, -0.15, 0.04, f).rotation.x = -0.3; [-1, 1].forEach(k => mesh(box(0.025, 0.11, 0.04), dark, k * 0.04, -0.33, 0.08, f)); mesh(box(0.11, 0.03, 0.05), blue, 0, -0.27, 0.08, f); a.userData.rest = 0; a.userData.fore = f; return a; };
  const armL = arm(-1), armR = arm(1);
  return { g, head, eyes, mouth, mouthAxis: 'x', mouthAmp: -0.7, armL, armR, glow, spin, accent: '#2f8bff', h: 1.6, hover: [0.012, 9], headY: 1.25, custom(t, p) { bars.forEach((b, i) => b.scale.y = 1 + (p.talk + p.spin * 0.15) * Math.abs(Math.sin(t * 9 + i * 1.3)) * 0.9); tip.scale.setScalar(1 + 0.4 * Math.sin(t * 5)); ant.rotation.z = Math.sin(t * 2.3) * 0.08; } };
}

/* ---------- PIXEL: anime-inspired digital creative ---------- */
function buildPixel(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const skin = phys('#fbe6dc', { roughness: 0.45, clearcoat: 0.4 });
  const hairM = phys('#9577f0', { roughness: 0.38, clearcoat: 0.6, envMapIntensity: 0.35 });
  const coral = phys('#ff6f5a', { roughness: 0.4, clearcoat: 0.6, envMapIntensity: 0.35 });
  const pearl = phys('#f8fafd', { roughness: 0.25, clearcoat: 1 });
  const lav = glowMat('#a78bfa'); glow.push(lav);
  const body = grp(0, 0, 0, g);
  [-1, 1].forEach(s => { mesh(cap(0.045, 0.3), pearl, s * 0.09, 0.3, 0, body); mesh(cap(0.065, 0.08), coral, s * 0.09, 0.08, 0.03, body).rotation.x = Math.PI / 2; });
  mesh(cyl(0.11, 0.33, 0.42, 32), hairM, 0, 0.62, 0, body);
  mesh(cyl(0.34, 0.36, 0.03, 32), pearl, 0, 0.41, 0, body);
  mesh(tor(0.115, 0.03, 32), pearl, 0, 0.84, 0, body).rotation.x = Math.PI / 2;
  mesh(new T.OctahedronGeometry(0.04), lav, 0, 0.72, 0.19, body);
  const head = grp(0, 0.88, 0, g);
  mesh(sph(0.4, 40, 32), skin, 0, 0.36, 0, head).scale.set(1, 0.94, 0.95);
  const hair = mesh(new T.SphereGeometry(0.425, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.38, -0.03, head); hair.rotation.x = -0.28;
  [-0.3, -0.15, 0, 0.15, 0.3].forEach((x, i) => { const b = mesh(new T.ConeGeometry(0.09, 0.26, 12), hairM, x, 0.6 - Math.abs(x) * 0.25, 0.32 - Math.abs(x) * 0.25, head); b.rotation.set(Math.PI + 0.55, 0, x * 1.1); b.scale.z = 0.5; });
  const tails = [-1, 1].map(s => { const tg = grp(s * 0.42, 0.55, -0.05, head); mesh(tor(0.075, 0.03, 20), coral, 0, 0, 0, tg).rotation.y = Math.PI / 2; let y = -0.12; [0.11, 0.1, 0.085, 0.065, 0.04].forEach((r, i) => { mesh(sph(r, 16, 12), hairM, s * (0.06 + i * 0.035), y, -i * 0.01, tg); y -= r * 1.5; }); return tg; });
  const band = mesh(tor(0.43, 0.028, 40, Math.PI), coral, 0, 0.38, 0, head);
  [-1, 1].forEach(s => { const ear = mesh(new T.ConeGeometry(0.1, 0.2, 4), coral, s * 0.24, 0.8, 0, head); ear.rotation.set(0, Math.PI / 4, s * -0.3); mesh(new T.ConeGeometry(0.05, 0.1, 4), lav, s * 0.24, 0.79, 0.03, head).rotation.set(0, Math.PI / 4, s * -0.3); mesh(cyl(0.09, 0.09, 0.05, 20), pearl, s * 0.42, 0.38, 0, head).rotation.z = Math.PI / 2; });
  const eyeDark = new T.MeshBasicMaterial({ color: '#3b2a66' });
  const eyes = [-1, 1].map(s => { const e = grp(s * 0.15, 0.33, 0.345, head); e.rotation.y = s * 0.3; mesh(sph(0.075, 20, 16), eyeDark, 0, 0, 0, e).scale.set(0.85, 1.3, 0.25); mesh(sph(0.045, 16, 12), lav, 0, -0.025, 0.013, e).scale.set(0.9, 1.1, 0.2); mesh(sph(0.024, 10, 8), new T.MeshBasicMaterial({ color: '#fff' }), 0.022, 0.045, 0.022, e); mesh(sph(0.011, 8, 6), new T.MeshBasicMaterial({ color: '#fff' }), -0.025, -0.045, 0.022, e); e.userData.sy = 1; return e; });
  [-1, 1].forEach(s => { const b = mesh(sph(0.06, 12, 8), new T.MeshBasicMaterial({ color: '#ff9f9f', transparent: true, opacity: 0.45 }), s * 0.26, 0.2, 0.3, head); b.scale.set(1.2, 0.6, 0.2); b.rotation.y = s * 0.6; });
  const mouth = mesh(sph(0.022, 12, 8), new T.MeshBasicMaterial({ color: '#e56b6b' }), 0, 0.17, 0.375, head); mouth.scale.set(1.5, 0.5, 0.4);
  const arm = (s: number) => { const a = grp(s * 0.14, 0.8, 0, g); mesh(cap(0.035, 0.28), skin, 0, -0.17, 0, a); mesh(sph(0.055, 12, 10), pearl, 0, -0.36, 0, a); a.rotation.z = s * 0.55; a.userData.rest = s * 0.55; return a; };
  const armL = arm(-1), armR = arm(1);
  const orb = grp(0, 1.2, 0, g); ([['#ff8f7e', 0], ['#a78bfa', 2.1], ['#ffd9a0', 4.2]] as [string, number][]).forEach(([c, a], i) => { const m = glowMat(c); const q = mesh(box(0.07, 0.07, 0.07), m, Math.cos(a) * 0.72, Math.sin(a * 2) * 0.15 + i * 0.1 - 0.1, Math.sin(a) * 0.72, orb); spin.push([q, 'x', 2]); spin.push([q, 'y', 1.4]); }); spin.push([orb, 'y', 0.7]);
  return { g, head, eyes, mouth, mouthAxis: 'y', mouthAmp: 2.6, armL, armR, glow, spin, accent: '#a78bfa', h: 1.85, hover: [0.03, 2.2], headY: 1.25, custom(t, p) { tails.forEach((tg, i) => { tg.rotation.z = Math.sin(t * 2.2 + i) * 0.12 * (1 + p.hop * 2); tg.rotation.x = Math.sin(t * 1.7 + i * 2) * 0.1; }); g.rotation.z += Math.sin(t * 1.3) * 0.02; } };
}

/* ---------- ATLAS: tall faceted statesman ---------- */
function buildAtlas(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const champ = phys('#e6c98f', { metalness: 0.5, roughness: 0.36, envMapIntensity: 0.9, flatShading: true });
  const plat = phys('#e1e5ec', { metalness: 0.55, roughness: 0.3, envMapIntensity: 0.9, flatShading: true });
  const dark = phys('#3a3630', { metalness: 0.5, roughness: 0.5, flatShading: true });
  const gold = glowMat('#ffc861'); glow.push(gold);
  [-1, 1].forEach(s => { mesh(cyl(0.085, 0.06, 0.58, 6), plat, s * 0.15, 0.36, 0, g); mesh(cyl(0.1, 0.085, 0.58, 6), champ, s * 0.15, 0.95, 0, g); mesh(sph(0.075, 8, 6), dark, s * 0.15, 0.66, 0, g); mesh(box(0.15, 0.07, 0.3), champ, s * 0.15, 0.035, 0.05, g); });
  mesh(cyl(0.26, 0.2, 0.2, 6), dark, 0, 1.33, 0, g);
  mesh(cyl(0.2, 0.24, 0.3, 6), plat, 0, 1.56, 0, g);
  const chest = mesh(cyl(0.5, 0.22, 0.62, 6), champ, 0, 2.0, 0, g); chest.scale.z = 0.62;
  mesh(box(0.035, 0.42, 0.02), gold, 0, 2.02, 0.235, g);
  [-1, 1].forEach(s => mesh(box(0.14, 0.02, 0.02), gold, s * 0.17, 2.18, 0.26, g));
  mesh(cyl(0.09, 0.11, 0.12, 6), dark, 0, 2.36, 0, g);
  mesh(tor(0.15, 0.018, 6), gold, 0, 2.33, 0, g).rotation.x = Math.PI / 2;
  const head = grp(0, 2.42, 0, g);
  mesh(cyl(0.13, 0.17, 0.3, 6), plat, 0, 0.17, 0, head).scale.z = 0.9;
  mesh(new T.ConeGeometry(0.13, 0.12, 6), champ, 0, 0.38, 0, head).scale.z = 0.9;
  mesh(box(0.3, 0.07, 0.03), dark, 0, 0.2, 0.125, head);
  const visor = mesh(box(0.24, 0.022, 0.02), gold, 0, 0.2, 0.142, head); visor.userData.sy = 1;
  const mouth = mesh(box(0.012, 0.03, 0.02), gold, 0, 0.08, 0.15, head);
  [-1, 1].forEach(s => mesh(box(0.012, 0.03, 0.02), gold, s * 0.03, 0.08, 0.148, head));
  const arm = (s: number) => { const a = grp(s * 0.5, 2.24, 0, g); mesh(new T.OctahedronGeometry(0.15), champ, 0, 0, 0, a); mesh(cyl(0.07, 0.055, 0.56, 6), plat, 0, -0.36, 0, a); mesh(sph(0.06, 8, 6), dark, 0, -0.66, 0, a); mesh(cyl(0.055, 0.045, 0.5, 6), champ, 0, -0.93, 0, a); mesh(box(0.07, 0.14, 0.09), dark, 0, -1.25, 0, a); a.rotation.z = s * 0.07; a.userData.rest = s * 0.07; return a; };
  const armL = arm(-1), armR = arm(1);
  return { g, head, eyes: [visor], mouth, mouthAxis: 'y', mouthAmp: 1.8, armL, armR, glow, spin, accent: '#ffc861', h: 2.95, hover: [0.012, 0.9], headY: 2.63, waveAmt: 0.55, custom(t, p) { chest.scale.x = 1 + Math.sin(t * 0.9) * 0.012; } };
}

/* ---------- ORACLE: layered non-human intelligence ---------- */
function buildOracle(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const teal = glowMat('#22d3c5'); glow.push(teal);
  const shellM = (o: number) => phys('#bff3ee', { transparent: true, opacity: o, roughness: 0.05, metalness: 0.2, flatShading: true, side: T.DoubleSide, depthWrite: false, iridescence: 1 });
  const edge = (geo: THREE.BufferGeometry, c: string, o: number) => new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: c, transparent: true, opacity: o }));
  const body = grp(0, 1.35, 0, g);
  const core = mesh(new T.IcosahedronGeometry(0.15, 1), teal, 0, 0, 0, body);
  const g1 = new T.IcosahedronGeometry(0.42, 0), s1 = mesh(g1, shellM(0.32), 0, 0, 0, body); s1.add(edge(g1, '#0fb5a8', 0.9)); spin.push([s1, 'y', 0.5], [s1, 'x', 0.3]);
  const g2 = new T.OctahedronGeometry(0.66, 0), s2 = mesh(g2, shellM(0.14), 0, 0, 0, body); s2.add(edge(g2, '#7fd0ff', 0.7)); spin.push([s2, 'y', -0.35], [s2, 'z', 0.2]);
  const g3 = new T.DodecahedronGeometry(0.26, 0), s3 = mesh(g3, shellM(0.4), 0, 0, 0, body); s3.add(edge(g3, '#22d3c5', 1)); spin.push([s3, 'x', -0.9], [s3, 'z', 0.6]);
  [[0.86, 1.2, 0.2, 0.5], [0.96, -0.5, 0.9, -0.35], [1.06, 0.3, -1.2, 0.25]].forEach(([r, rx, ry, sp]) => { const pv = grp(0, 0, 0, body); pv.rotation.set(rx, ry, 0); const ring = mesh(tor(r, 0.007, 96), glowMat('#7fd0ff', { transparent: true, opacity: 0.75 }), 0, 0, 0, pv); glow.push(ring.material); const bead = mesh(sph(0.035, 10, 8), teal, r, 0, 0, ring); spin.push([ring, 'z', sp]); });
  const shards = grp(0, 0, 0, body); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const s = mesh(new T.TetrahedronGeometry(0.05 + (i % 3) * 0.015), shellM(0.7), Math.cos(a) * 0.82, Math.sin(a * 3) * 0.3, Math.sin(a) * 0.82, shards); spin.push([s, 'x', 1 + i * 0.2]); } spin.push([shards, 'y', -0.25]);
  const head = grp(0, 0, 0, body);
  const iris = grp(0, 0, 0.44, head); [0.11, 0.075, 0.04].forEach((r, i) => mesh(new T.RingGeometry(r - 0.012, r, 40), glowMat(i === 1 ? '#ffffff' : '#22d3c5', { side: T.DoubleSide, transparent: true, opacity: 0.95 }), 0, 0, i * 0.012, iris)); iris.userData.sy = 1;
  const stem = mesh(lathe([[0.001, 0], [0.16, 0.02], [0.05, 0.1], [0.012, 0.42]], 24), phys('#dfe6ee', { metalness: 0.9, roughness: 0.2 }), 0, 0.02, 0, g);
  const beam = mesh(cyl(0.008, 0.008, 0.45, 6), glowMat('#22d3c5', { transparent: true, opacity: 0.5 }), 0, 0.62, 0, g); glow.push(beam.material);
  const dummy = new T.Object3D();
  return { g, head, eyes: [iris], mouth: core, mouthAxis: 'all', mouthAmp: 0.55, armL: dummy, armR: dummy, glow, spin, accent: '#22d3c5', h: 2.3, hover: [0.06, 0.8], headY: 1.35, headLook: 0.35, hoverPart: body, custom(t, p) { core.scale.multiplyScalar(1 + Math.sin(t * 2) * 0.06); iris.children.forEach((r, i) => r.scale.setScalar(1 + (p.look * 0.35 + p.lean * 0.5) * (i === 0 ? 1 : -0.3) + Math.sin(t * 1.5 + i) * 0.04)); s3.scale.setScalar(1 + p.hop * 0.3 * Math.abs(Math.sin(t * 6))); } };
}

/* ---------- NOVA: round friendly companion ---------- */
function buildNova(): Rig {
  const g = new T.Group(), glow: Glow[] = [], spin: [Obj, Axis, number][] = [];
  const shell = phys('#ff8659', { roughness: 0.42, clearcoat: 0.5, envMapIntensity: 0.3 });
  const cream = phys('#f1dcb8', { roughness: 0.35, clearcoat: 0.8 });
  const screen = phys('#1e2430', { roughness: 0.08, metalness: 0.4, clearcoat: 1 });
  const warm = glowMat('#ffd27a'); glow.push(warm);
  const body = grp(0, 0.72, 0, g);
  mesh(sph(0.5, 48, 36), shell, 0, 0, 0, body).scale.set(1, 0.93, 1);
  mesh(new T.SphereGeometry(0.505, 40, 20, 0, Math.PI * 2, Math.PI * 0.76, Math.PI * 0.24), cream, 0, 0, 0, body).scale.set(1, 0.93, 1);
  const head = grp(0, 0, 0, body);
  const face = mesh(new T.SphereGeometry(0.508, 40, 24, Math.PI * 0.5 - 0.92, 1.84, Math.PI * 0.5 - 0.5, 0.8), screen, 0, 0.03, 0, head); face.scale.set(1.012, 0.94, 1.012);
  const eyes = [-1, 1].map(s => { const e = mesh(cap(0.058, 0.09), warm, s * 0.17, 0.1, 0.475, head); e.rotation.y = s * 0.33; e.scale.z = 0.3; e.userData.sy = 1; mesh(sph(0.02, 8, 6), new T.MeshBasicMaterial({ color: '#fff' }), 0.015, 0.06, 0.05, e); return e; });
  const mouth = mesh(tor(0.055, 0.012, 20, Math.PI), warm, 0, -0.07, 0.5, head); mouth.rotation.z = Math.PI; mouth.scale.z = 0.4;
  [-1, 1].forEach(s => { const c = mesh(sph(0.035, 10, 8), glowMat('#ff8f7e', { transparent: true, opacity: 0.7 }), s * 0.3, -0.03, 0.43, head); c.scale.set(1.3, 0.7, 0.3); });
  const ears = [-1, 1].map(s => { const e = grp(s * 0.3, 0.4, 0, body); e.rotation.z = s * -0.5; mesh(cap(0.06, 0.12), cream, 0, 0.08, 0, e); mesh(sph(0.045, 12, 10), warm, 0, 0.2, 0, e); return e; });
  const arm = (s: number) => { const a = grp(s * 0.56, 0.7, 0.05, g); const f = mesh(cap(0.075, 0.14), cream, 0, -0.1, 0, a); f.scale.z = 0.7; a.rotation.z = s * 0.5; a.userData.rest = s * 0.5; return a; };
  const armL = arm(-1), armR = arm(1);
  const ring = mesh(tor(0.26, 0.022, 40), warm, 0, 0.17, 0, g); ring.rotation.x = Math.PI / 2;
  const ring2 = mesh(tor(0.16, 0.012, 32), glowMat('#ff8f7e', { transparent: true, opacity: 0.7 }), 0, 0.08, 0, g); ring2.rotation.x = Math.PI / 2; glow.push(ring2.material);
  return { g, head, eyes, mouth, mouthAxis: 'y', mouthAmp: 1.6, armL, armR, glow, spin, accent: '#ff9a6b', h: 1.45, hover: [0.07, 2.6], headY: 0.75, headLook: 0.5, hoverPart: body, waveAmt: 1.3, custom(t, p) { ears.forEach((e, i) => e.rotation.x = Math.sin(t * 3 + i) * 0.15 * (1 + p.hop * 2)); ring.scale.setScalar(1 + Math.sin(t * 5) * 0.06 + p.hop * 0.2); ring2.scale.setScalar(1 + Math.cos(t * 5) * 0.1); body.rotation.z = Math.sin(t * 1.6) * 0.05 + p.hop * Math.sin(t * 9) * 0.12; [armL, armR].forEach((a, i) => a.position.y = 0.7 + Math.sin(t * 2.6 + i * 2) * 0.04); } };
}

const BUILDERS: Record<AgentId, () => Rig> = { aria: buildAria, nex: buildNex, pixel: buildPixel, atlas: buildAtlas, oracle: buildOracle, nova: buildNova };
const STATE: Record<CharacterState, Partial<Params>> = {
  idle: {}, greeting: { wave: 1, tilt: 0.1 }, listening: { lean: 1, glow: 1.35 }, thinking: { look: 1, spin: 2.2, pulse: 0.5 },
  speaking: { talk: 1, glow: 1.25 }, excited: { hop: 1, wave: 1, wave2: 1, spin: 2 }, processing: { spin: 5, pulse: 1 },
  error: { shake: 1, err: 1 }, sleeping: { sleep: 1, glow: 0.3 }
};
const KEYS = ['wave', 'wave2', 'tilt', 'lean', 'glow', 'look', 'spin', 'pulse', 'talk', 'hop', 'shake', 'err', 'sleep'] as const;

export function makeChar(id: AgentId): Character {
  const r = BUILDERS[id]();
  const p = Object.fromEntries(KEYS.map((k) => [k, k === 'glow' ? 1 : 0])) as Params;
  const hoverPart = r.hoverPart || r.g;
  return { ...r, id, state: 'idle', p, phase: Math.random() * 6, blinkAt: 2 + Math.random() * 3, lookX: 0, lookY: 0, mouthBase: r.mouth.scale.clone(), hoverPart, hoverBase: hoverPart.position.y, baseX: 0 };
}
export function tickChar(c: Character, t: number, dt: number, look: { x: number; y: number } | null) {
  const tgt = STATE[c.state] || {}, p = c.p, k = Math.min(1, dt * 6);
  KEYS.forEach(n => { const v = tgt[n] ?? (n === 'glow' ? 1 : 0); p[n] += (v - p[n]) * k; });
  const tt = t + c.phase;
  c.hoverPart.position.y = c.hoverBase + Math.sin(tt * c.hover[1]) * c.hover[0] * (1 - p.sleep * 0.6) + p.hop * Math.abs(Math.sin(t * 7)) * 0.2 - p.sleep * 0.05;
  c.g.rotation.z = p.shake * Math.sin(t * 42) * 0.045; c.g.rotation.x = p.lean * 0.1;
  c.g.position.x = c.baseX + p.shake * Math.sin(t * 37) * 0.02;
  const hl = c.headLook || 1;
  c.lookX += ((look ? look.x : 0) - c.lookX) * k * 0.6; c.lookY += ((look ? look.y : 0) - c.lookY) * k * 0.6;
  c.head.rotation.y = (c.lookX * 0.55 * (1 - p.sleep) + p.look * Math.sin(t * 0.9) * 0.35) * hl;
  c.head.rotation.x = (-c.lookY * 0.3 * (1 - p.sleep) + p.sleep * 0.4 - p.look * 0.22 + p.lean * 0.08 + p.talk * Math.sin(t * 5) * 0.03) * hl;
  c.head.rotation.z = (p.tilt * Math.sin(t * 3) + p.look * 0.12) * hl;
  c.blinkAt -= dt; let blink = 1; if (c.blinkAt < 0.13) blink = 0.1; if (c.blinkAt < 0) c.blinkAt = 2.2 + Math.random() * 3.5;
  const open = Math.max(0.08, Math.min(blink, 1 - p.sleep * 0.92)) * (1 + p.hop * 0.15 + p.err * 0.0);
  c.eyes.forEach(e => e.scale.y = (e.userData.sy || 1) * open);
  const talk = p.talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 11 + Math.sin(t * 3.1) * 2)));
  const m = c.mouth, b = c.mouthBase;
  if (c.mouthAxis === 'y') m.scale.y = b.y * (1 + talk * c.mouthAmp); else if (c.mouthAxis === 'x') m.scale.x = b.x * (1 + talk * c.mouthAmp); else m.scale.setScalar(b.x * (1 + talk * c.mouthAmp));
  const wa = c.waveAmt || 1;
  c.armR.rotation.z = (c.armR.userData.rest || 0) + p.wave * wa * (2.0 + Math.sin(t * 9) * 0.3);
  c.armL.rotation.z = (c.armL.userData.rest || 0) - p.wave2 * wa * (2.0 + Math.sin(t * 9 + 1) * 0.3) - p.talk * 0.12 * Math.sin(t * 2.5);
  c.armR.rotation.x = p.talk * Math.sin(t * 2.1) * 0.18 - p.look * 0.5; c.armL.rotation.x = p.lean * -0.2;
  c.spin.forEach(([o, ax, sp]) => o.rotation[ax] += dt * sp * (1 + p.spin));
  const gl = p.glow * (1 + p.pulse * Math.sin(t * 7) * 0.35);
  c.glow.forEach(mt => { mt.color.copy(mt.userData.base).lerp(RED, p.err).multiplyScalar(gl); });
  if (c.custom) c.custom(t, p);
}

function envTex(renderer: THREE.WebGLRenderer) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d')!;
  const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(0.42, '#c9d6e6'); gr.addColorStop(0.56, '#7f90a8'); gr.addColorStop(1, '#d9c9a8'); x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
  ([[90, 60, 70, '#ffffff'], [330, 40, 55, '#fff7e6'], [440, 110, 40, '#d2c8f4'], [210, 120, 30, '#a8e6e8']] as [number, number, number, string][]).forEach(([cx, cy, r, c]) => { const g2 = x.createRadialGradient(cx, cy, 0, cx, cy, r); g2.addColorStop(0, c); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.fillRect(cx - r, cy - r, r * 2, r * 2); });
  x.fillStyle = '#6f7d92'; x.fillRect(0, 150, 512, 4);
  const tex = new T.CanvasTexture(cv); tex.mapping = T.EquirectangularReflectionMapping; tex.colorSpace = T.SRGBColorSpace;
  const pm = new T.PMREMGenerator(renderer); const rt = pm.fromEquirectangular(tex); pm.dispose(); tex.dispose(); return rt.texture;
}
function shadowTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d')!; const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(60,80,110,.34)'); g.addColorStop(1, 'rgba(60,80,110,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(cv); }

export function webglOK(): boolean { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }

export type StageOptions = { reduced?: boolean; maxDpr?: number; onPick?: (id: AgentId) => void; onHover?: (id: AgentId | null) => void; onFrame?: (s: Stage) => void };

export class Stage {
  canvas: HTMLCanvasElement; opts: StageOptions; ids: AgentId[]; chars = {} as Record<AgentId, Character>; look = { x: 0, y: 0 }; hoverId: AgentId | null = null; running = false; reduced: boolean;
  r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; ray: THREE.Raycaster; timer: THREE.Timer; visible = true; enabled = true;
  camBase = new T.Vector3(); camLook = new T.Vector3();
  private _move: (e: PointerEvent) => void; private _click: (e: MouseEvent) => void; private _ro: ResizeObserver; private _io: IntersectionObserver; private _vis: () => void;
  constructor(canvas: HTMLCanvasElement, ids: AgentId[], opts: StageOptions = {}) {
    this.canvas = canvas; this.opts = opts; this.ids = ids; this.reduced = !!opts.reduced;
    const r = this.r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || (window.innerWidth < 760 ? 1.5 : 2)));
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.8;
    const s = this.scene = new T.Scene(); s.environment = envTex(r);
    s.add(new T.HemisphereLight('#ffffff', '#b8c4d6', 0.42 * Math.PI));
    const key = new T.DirectionalLight('#fff6e8', 1.15 * Math.PI); key.position.set(3, 6, 5); s.add(key);
    const rim = new T.DirectionalLight('#b9ddf3', 1.1 * Math.PI); rim.position.set(-5, 3, -4); s.add(rim);
    this.cam = new T.PerspectiveCamera(28, 1, 0.1, 100);
    const st = shadowTex();
    ids.forEach(id => { const c = makeChar(id); this.chars[id] = c; s.add(c.g); const sh = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.005; const w = id === 'atlas' ? 1.3 : id === 'nova' || id === 'nex' ? 1.7 : 1.5; sh.scale.set(w, w, 1); c.shadow = sh; s.add(sh); c.hit = new T.Mesh(new T.BoxGeometry(1.25, c.h, 1), new T.MeshBasicMaterial({ visible: false })); c.hit.position.y = c.h / 2; c.hit.userData.id = id; c.g.add(c.hit); c.dais = new T.Mesh(new T.CylinderGeometry(0.62, 0.56, 0.05, 48), phys('#ffffff', { transparent: true, opacity: 0.55, roughness: 0.1 })); c.dais.visible = false; s.add(c.dais); });
    this.ray = new T.Raycaster(); this.timer = new T.Timer();
    this._move = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); const x = ((e.clientX - b.left) / b.width) * 2 - 1, y = -(((e.clientY - b.top) / b.height) * 2 - 1); this.look.x = Math.max(-1.4, Math.min(1.4, x)); this.look.y = Math.max(-1.2, Math.min(1.2, y)); if (opts.onPick && Math.abs(x) <= 1 && Math.abs(y) <= 1) this._hover(x, y); };
    window.addEventListener('pointermove', this._move, { passive: true });
    this._click = (e: MouseEvent) => { const b = canvas.getBoundingClientRect(); const id = this._pick(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1)); if (id && opts.onPick) opts.onPick(id); };
    if (opts.onPick) canvas.addEventListener('click', this._click);
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(canvas.parentElement!);
    this._io = new IntersectionObserver((en) => { this.visible = en[0].isIntersecting; this._sync(); }); this._io.observe(canvas);
    this._vis = () => this._sync(); document.addEventListener('visibilitychange', this._vis);
    this.visible = true; this.enabled = true; this.resize(); this._sync();
  }
  _pick(x: number, y: number): AgentId | null { this.ray.setFromCamera(new T.Vector2(x, y), this.cam); const hits = this.ray.intersectObjects(this.ids.map(i => this.chars[i].hit!)); return hits.length ? (hits[0].object.userData.id as AgentId) : null; }
  _hover(x: number, y: number) { const id = this._pick(x, y); if (id === this.hoverId) return; if (this.hoverId && this.chars[this.hoverId].state === 'greeting') this.chars[this.hoverId].state = 'idle'; this.hoverId = id; if (id && this.chars[id].state === 'idle') this.chars[id].state = 'greeting'; this.canvas.style.cursor = id ? 'pointer' : ''; if (this.opts.onHover) this.opts.onHover(id); }
  setState(id: AgentId, st: CharacterState) { if (this.chars[id]) this.chars[id].state = st; }
  setEnabled(v: boolean) { this.enabled = v; this._sync(); }
  _sync() { const run = this.enabled && this.visible && !document.hidden; if (run && !this.running) { this.running = true; this.timer.update(); this._loop(); } else if (!run) this.running = false; }
  resize() {
    const p = this.canvas.parentElement!, w = p.clientWidth, h = p.clientHeight; if (!w || !h) return; this.r.setSize(w, h, false); const a = w / h; this.cam.aspect = a;
    const n = this.ids.length; let pos: number[][], cy: number, dist: number;
    if (n === 1) { const c = this.chars[this.ids[0]]; pos = [[0, 0]]; cy = c.h * 0.52; dist = (c.h * 0.62) / Math.tan(14 * Math.PI / 180) * Math.max(1, 0.72 / a); }
    else if (a > 1.45) { const sp = 1.5; pos = this.ids.map((_, i) => [(i - (n - 1) / 2) * sp, -Math.abs(i - (n - 1) / 2) * 0.12]); cy = 1.3; const half = (n * sp) / 2 + 0.3; dist = Math.max(half / (Math.tan(14 * Math.PI / 180) * a), 1.75 / Math.tan(14 * Math.PI / 180)); }
    else if (a > 0.85) { const back = ['atlas', 'aria', 'oracle'], front = ['nex', 'pixel', 'nova']; pos = this.ids.map(id => back.includes(id) ? [(back.indexOf(id) - 1) * 1.75, -0.5, 2.05] : [(front.indexOf(id) - 1) * 1.6, 0.3, 0]); cy = 2.5; dist = Math.max(2.85 / Math.tan(14 * Math.PI / 180), 2.75 / (Math.tan(14 * Math.PI / 180) * a)); }
    else { const grid = { atlas: [-0.95, 4.0], aria: [0.95, 4.0], oracle: [-0.95, 1.95], pixel: [0.95, 2.0], nex: [-0.95, 0], nova: [0.95, 0] }; pos = this.ids.map(id => [grid[id][0], 0, grid[id][1]]); cy = 3.45; dist = Math.max(3.85 / Math.tan(14 * Math.PI / 180), 2.0 / (Math.tan(14 * Math.PI / 180) * a)); }
    this.ids.forEach((id, i) => { const c = this.chars[id]; const py = pos[i][2] || 0; c.baseX = pos[i][0]; c.g.position.set(pos[i][0], py, pos[i][1]); if (c.hoverPart === c.g) c.hoverBase = py; c.shadow!.position.set(pos[i][0], py + 0.005, pos[i][1]); c.dais!.visible = py > 0; c.dais!.position.set(pos[i][0], py - 0.03, pos[i][1]); });
    this.camBase = new T.Vector3(0, cy + 0.25, dist); this.camLook = new T.Vector3(0, cy, 0); this.cam.updateProjectionMatrix(); this.frame(0);
  }
  frame(dt: number) {
    const t = this.timer.getElapsed(); this.ids.forEach(id => tickChar(this.chars[id], this.reduced ? 0 : t, this.reduced ? 0.016 : dt, this.look));
    const px = this.reduced ? 0 : this.look.x, py = this.reduced ? 0 : this.look.y;
    this.cam.position.x += (this.camBase.x + px * 0.35 - this.cam.position.x) * 0.06; this.cam.position.y += (this.camBase.y + py * 0.15 - this.cam.position.y) * 0.06; this.cam.position.z = this.camBase.z; this.cam.lookAt(this.camLook);
    this.r.render(this.scene, this.cam); if (this.opts.onFrame) this.opts.onFrame(this);
  }
  project(id: AgentId) { const c = this.chars[id]; const v = new T.Vector3(c.g.position.x, c.g.position.y + c.h + 0.12, c.g.position.z).project(this.cam); return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 }; }
  _loop(ts?: number) { if (!this.running) return; requestAnimationFrame((n) => this._loop(n)); this.timer.update(ts); this.frame(Math.min(0.05, this.timer.getDelta())); }
  dispose() { this.running = false; window.removeEventListener('pointermove', this._move); this.canvas.removeEventListener('click', this._click); document.removeEventListener('visibilitychange', this._vis); this._ro.disconnect(); this._io.disconnect(); this.timer.dispose(); disposeTree(this.scene); if (this.scene.environment) this.scene.environment.dispose(); this.r.dispose(); try { this.r.forceContextLoss(); } catch (e) { } }
}

/* Portrait snapshots: one short-lived context renders every character once, then is released. */
export function portraits(size = 160): Partial<Record<AgentId, string>> {
  const out: Partial<Record<AgentId, string>> = {}; if (!webglOK()) return out;
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(size, size, false); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.8;
  const s = new T.Scene(); s.environment = envTex(r); s.add(new T.HemisphereLight('#fff', '#b8c4d6', 0.42 * Math.PI)); const k = new T.DirectionalLight('#fff6e8', 1.15 * Math.PI); k.position.set(3, 6, 5); s.add(k);
  const cam = new T.PerspectiveCamera(26, 1, 0.1, 50);
  ORDER.forEach(id => { const c = makeChar(id); c.baseX = 0; s.add(c.g); tickChar(c, 1, 0.5, { x: 0.25, y: 0 }); tickChar(c, 1, 0.5, { x: 0.25, y: 0 }); const span = id === 'oracle' ? 1.25 : id === 'nova' ? 1.25 : id === 'nex' ? 1.15 : id === 'pixel' ? 1.15 : 0.8; const cy = id === 'oracle' ? 1.35 : c.headY; cam.position.set(0.5, cy + 0.1, span / Math.tan(13 * Math.PI / 180) / 2 + 0.6); cam.lookAt(0, cy, 0); r.render(s, cam); out[id] = cv.toDataURL('image/png'); s.remove(c.g); disposeTree(c.g); });
  s.environment.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) { }
  return out;
}

function disposeTree(root: Obj) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
    mats.forEach((mt) => { const map = (mt as THREE.MeshBasicMaterial).map; if (map) map.dispose(); mt.dispose(); });
  });
}
