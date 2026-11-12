import type { Metadata } from "next";
import { VaultView } from "@/components/views/VaultView";
import { certificates } from "@/lib/content";
import { signCertificate } from "@/lib/server/cert-token";

export const metadata: Metadata = { title: "Credential Vault", description: "Certificates shown as watermarked presentation copies.", robots: { index: true, follow: true, noimageindex: true } };
// Signed links expire, so this page is rendered per request.
export const dynamic = "force-dynamic";

export default function Page() {
  const urls = Object.fromEntries(certificates.map((c) => [c.id, `/api/certificates/${c.id}?t=${encodeURIComponent(signCertificate(c.id))}`]));
  return <VaultView urls={urls} />;
}
