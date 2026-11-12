import type { Inquiry } from "@/lib/schemas";

/** The inquiry, assembled word for word from the visitor's answers. */
export function plainBrief(d: Inquiry): string {
  return [
    "Project inquiry for Arshdeep Singh",
    "",
    `From: ${d.name} <${d.email}>`,
    `Type: ${d.type}`,
    `Timeline: ${d.timeline || "Not stated"}`,
    "",
    "Problem",
    d.problem,
    "",
    "Must do on day one",
    d.features,
    "",
    "Integrations",
    d.integrations.join(", ") || "None stated",
  ].join("\n");
}
