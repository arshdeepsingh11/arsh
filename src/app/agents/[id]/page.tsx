import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentConsole } from "@/components/agents/AgentConsole";
import { AGENT_IDS, AGENTS, isAgentId } from "@/lib/content/agents";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return AGENT_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return isAgentId(id) ? { title: `${AGENTS[id].name} · ${AGENTS[id].role}`, description: AGENTS[id].greet } : { title: "Agent" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!isAgentId(id)) notFound();
  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">Intelligence interface</p>
        <h1>{AGENTS[id].name}</h1>
        <p className="lede">{AGENTS[id].role}. {AGENTS[id].handoff}</p>
      </header>
      <AgentConsole key={id} id={id} layout="page" />
    </>
  );
}
