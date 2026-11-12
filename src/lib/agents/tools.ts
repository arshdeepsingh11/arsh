import { projects, projectBySlug } from "@/lib/content";
import type { AgentId } from "@/lib/content/agents";
import type { ToolDef } from "@/lib/ai";
import { retrieve } from "./retrieval";
import { scoreProjects } from "./scoring";

/** Navigation targets ARIA may send the visitor to. The client executes these after showing the answer. */
export const VIEWS = ["/", "/network", "/projects", "/ai", "/identity", "/foundation", "/vault", "/lab", "/collab"] as const;
export type AgentAction = { type: "navigate"; href: string; label: string };

/** Tool registry. Each agent gets the tools that fit its job; all are read-only over verified data. */
export function toolsFor(agent: AgentId, actions: AgentAction[]): ToolDef[] {
  const lookup: ToolDef = {
    name: "lookup",
    description: "Search Arshdeep's verified knowledge base for passages on a topic. Use when the provided knowledge does not cover the question.",
    parameters: { type: "object", properties: { query: { type: "string", description: "What to search for" } }, required: ["query"] },
    execute: ({ query }) => retrieve(String(query ?? ""), agent, 5).map((p) => `[${p.title} | ${p.src}] ${p.text}`).join("\n") || "No passages found.",
  };
  const tools: ToolDef[] = [lookup];

  if (agent === "aria") {
    tools.push({
      name: "open_view",
      description: "Take the visitor to a part of the portfolio. Use when they ask to see, open or go somewhere.",
      parameters: {
        type: "object",
        properties: {
          view: { type: "string", enum: [...VIEWS], description: "Page path" },
          project: { type: "string", description: `Optional project slug instead of a page: ${projects.map((p) => p.slug).join(", ")}` },
        },
        required: ["view"],
      },
      execute: ({ view, project }) => {
        const p = typeof project === "string" ? projectBySlug(project) : undefined;
        const href = p ? `/projects/${p.slug}` : VIEWS.includes(view as (typeof VIEWS)[number]) ? String(view) : "/";
        actions.push({ type: "navigate", href, label: p ? p.name : href });
        return `Navigation to ${href} queued; it happens after your answer is shown.`;
      },
    });
  }

  if (agent === "nex" || agent === "pixel" || agent === "oracle") {
    tools.push(
      {
        name: "find_projects",
        description: "List projects that use a technology or match a keyword, with their stacks.",
        parameters: { type: "object", properties: { keyword: { type: "string" } }, required: ["keyword"] },
        execute: ({ keyword }) => {
          const k = String(keyword ?? "").toLowerCase();
          const hits = projects.filter((p) => [p.name, p.kind, p.tag, p.stack.join(" "), p.facts.join(" ")].join(" ").toLowerCase().includes(k));
          return hits.length ? hits.map((p) => `${p.name} (${p.slug}): ${p.stack.join(", ")}`).join("\n") : "No project matches.";
        },
      },
      {
        name: "get_project",
        description: "Get the full verified record for one project: stack, documented features, architecture and files.",
        parameters: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
        execute: ({ slug }) => {
          const p = projectBySlug(String(slug ?? ""));
          if (!p) return "Unknown project slug.";
          return [
            `${p.name}: ${p.kind}. ${p.tag}`,
            `Stack: ${p.stack.join(", ")}`,
            `Documented: ${p.facts.join("; ")}`,
            `Architecture: ${p.arch.nodes.map((n) => n[1]).join(" | ")}`,
            `Files: ${p.tree.join(", ")}`,
            p.contribution ? `Contribution: ${p.contribution}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        },
      },
    );
  }

  if (agent === "nex" || agent === "atlas" || agent === "nova") {
    tools.push({
      name: "rank_projects",
      description: "Rank projects against a role or problem description with a transparent keyword-and-depth score.",
      parameters: { type: "object", properties: { description: { type: "string" } }, required: ["description"] },
      execute: ({ description }) =>
        scoreProjects(String(description ?? ""))
          .slice(0, 4)
          .map((s) => `${s.project.name} (score ${s.score}: ${s.why.join(", ")})`)
          .join("\n"),
    });
  }
  return tools;
}
