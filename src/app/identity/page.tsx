import type { Metadata } from "next";
import { IdentityView } from "@/components/views/IdentityView";

export const metadata: Metadata = { title: "Identity", description: "Professional record, how he works, technologies mapped to real projects, and the résumé." };

type Props = { searchParams: Promise<{ tech?: string }> };

export default async function Page({ searchParams }: Props) {
  const { tech } = await searchParams;
  return <IdentityView initialTech={typeof tech === "string" ? tech.slice(0, 60) : undefined} />;
}
