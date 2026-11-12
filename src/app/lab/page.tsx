import type { Metadata } from "next";
import { LabView } from "@/components/views/LabView";

export const metadata: Metadata = { title: "The Intelligence Lab", description: "Working simulations: a neural network you can train, an architecture simulator, an evaluation arena, a Monte Carlo model and an automation studio." };

export default function Page() {
  return <LabView moduleId="neural" />;
}
