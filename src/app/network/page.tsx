import type { Metadata } from "next";
import { NetworkView } from "@/components/views/NetworkView";

export const metadata: Metadata = { title: "The Intelligence Network", description: "Six AI agents collaborate on a task in separate calls; one verifies the others before an answer is shown." };

export default function Page() {
  return <NetworkView />;
}
