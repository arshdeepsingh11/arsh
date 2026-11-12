import type { Metadata } from "next";
import { ProjectsView } from "@/components/views/ProjectsView";
import { getInventory } from "@/lib/server/github";

export const metadata: Metadata = { title: "Project Multiverse", description: "Every public repository as a world: interactive demos, architecture walkthroughs and code." };
export const revalidate = 3600;

export default async function Page() {
  return <ProjectsView inventory={await getInventory()} />;
}
