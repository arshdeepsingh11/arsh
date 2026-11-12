import type { Metadata } from "next";
import { AiView } from "@/components/views/AiView";

export const metadata: Metadata = { title: "AI Explained", description: "LLMs, tokens, embeddings, RAG, agents, guardrails and more, explained simply with interactive visuals, and where Arshdeep uses each one." };

export default function Page() {
  return <AiView />;
}
