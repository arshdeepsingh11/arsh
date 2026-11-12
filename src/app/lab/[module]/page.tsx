import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabView } from "@/components/views/LabView";
import { LAB_MODULES } from "@/lib/lab";

type Props = { params: Promise<{ module: string }> };
const mountable = LAB_MODULES.filter((m) => m.mount);

export function generateStaticParams() {
  return mountable.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  const m = mountable.find((x) => x.id === module);
  return m ? { title: m.name, description: m.d } : { title: "Lab" };
}

export default async function Page({ params }: Props) {
  const { module } = await params;
  if (!mountable.some((m) => m.id === module)) notFound();
  return <LabView moduleId={module} />;
}
