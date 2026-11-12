import type { Metadata } from "next";
import { CollabView } from "@/components/views/CollabView";

export const metadata: Metadata = { title: "Collaborate", description: "Describe a project and NOVA will turn it into a brief for Arshdeep." };

export default function Page() {
  return <CollabView />;
}
