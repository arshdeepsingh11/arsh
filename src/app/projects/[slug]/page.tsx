import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/views/ProjectView";
import { projectBySlug, projects } from "@/lib/content";
import { getProjectLive } from "@/lib/server/github";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 3600;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: p.name, description: p.tag } : { title: "Project not found" };
}

export default async function Page({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const { live, reason } = await getProjectLive(p);
  return <ProjectView project={p} live={live} liveReason={reason} />;
}
