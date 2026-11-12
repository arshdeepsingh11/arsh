import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived signed access to certificate presentation images.
 * The vault page signs one URL per certificate at render time; the image route refuses anything unsigned or expired,
 * so the images cannot be hot-linked or enumerated from the outside.
 */
const TTL_SECONDS = 15 * 60;

let warned = false;
/**
 * The signing key. Prefers CERT_SIGNING_SECRET. Without it, derives a stable key from another server-only secret
 * (so every server instance agrees), and only as a last resort uses a fixed development key. It never throws:
 * a missing setting must not take the Vault down. The images are watermarked copies either way.
 */
function secret(): string {
  const s = process.env.CERT_SIGNING_SECRET;
  if (s && s.length >= 16) return s;
  const other = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.RESEND_API_KEY;
  if (!warned && process.env.NODE_ENV === "production") {
    warned = true;
    console.warn("[vault] CERT_SIGNING_SECRET is not set; using a derived key. Set it in your environment (see README).");
  }
  return other ? createHash("sha256").update(`arsh-os-certificates:${other}`).digest("hex") : "dev-only-certificate-secret";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function signCertificate(id: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + TTL_SECONDS;
  return `${exp}.${sign(`${id}.${exp}`)}`;
}

export function verifyCertificate(id: string, token: string | null, now = Date.now()): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || !sig || exp < Math.floor(now / 1000)) return false;
  const want = Buffer.from(sign(`${id}.${exp}`));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got);
}
