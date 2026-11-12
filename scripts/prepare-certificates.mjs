#!/usr/bin/env node
/**
 * Generates certificate presentation copies from original scans.
 *
 *   certificates-originals/<id>.png|jpg   (git-ignored; never committed or deployed)
 *        → private/certificates/<id>.jpg  (760 px wide, personal details blurred, ownership watermark baked in)
 *
 * Usage: npm run certificates
 * Scanned PDFs: export each page to PNG first, e.g. `pdftoppm -r 150 -png scan.pdf certificates-originals/c_java`
 * and rename the result to c_java.png. Ids must match src/lib/content/index.ts.
 */
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "certificates-originals";
const OUT = "private/certificates";
const WIDTH = 760;
const MARK = "ARSHDEEP SINGH — VERIFIED PRESENTATION COPY";

/** Regions to blur, as fractions of image height (x spans 8%–93% of width). Dates of birth and parents' names. */
const REDACT = {
  c_java: [[0.535, 0.57], [0.6, 0.674]],
  c_cpp: [[0.513, 0.547], [0.575, 0.65]],
  c_web: [],
  c_basic: [],
};

function watermarkSvg(w, h) {
  const rows = [];
  for (let y = -h; y < h * 2; y += 150) for (let x = -w; x < w * 2; x += 470) rows.push(`<text x="${x + ((y / 150) % 2 ? 230 : 0)}" y="${y}">${MARK}</text>`);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g transform="rotate(-28 ${w / 2} ${h / 2})" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="15" fill="rgba(40,50,70,0.18)">${rows.join("")}</g></svg>`);
}
function labelSvg(w, h) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="50%" y="55%" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="15" fill="#78808c">PERSONAL DETAILS HIDDEN</text></svg>`);
}

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC).catch(() => [])).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
if (!files.length) {
  console.error(`No images in ${SRC}/. See the comment at the top of this script.`);
  process.exit(1);
}
for (const f of files) {
  const id = path.parse(f).name;
  if (!(id in REDACT)) { console.warn(`skip ${f}: unknown id (add it to REDACT and to the content file)`); continue; }
  const base = sharp(path.join(SRC, f)).rotate().resize({ width: WIDTH });
  const { data, info } = await base.clone().jpeg().toBuffer({ resolveWithObject: true });
  const composites = [];
  for (const [a, z] of REDACT[id]) {
    const left = Math.round(info.width * 0.08), top = Math.round(info.height * a);
    const width = Math.round(info.width * 0.85), height = Math.round(info.height * (z - a));
    const blurred = await sharp(data).extract({ left, top, width, height }).blur(14).toBuffer();
    composites.push({ input: blurred, left, top }, { input: labelSvg(width, height), left, top });
  }
  composites.push({ input: watermarkSvg(info.width, info.height), left: 0, top: 0 });
  const out = path.join(OUT, `${id}.jpg`);
  await sharp(data).composite(composites).jpeg({ quality: 72, mozjpeg: true }).toFile(out);
  console.log(`✓ ${out} (${info.width}×${info.height}${REDACT[id].length ? `, ${REDACT[id].length} region(s) blurred` : ""})`);
}
