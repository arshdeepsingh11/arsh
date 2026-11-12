import type { AgentId } from "@/lib/content/agents";

/** Left-to-right order of the roster. Kept separate from the 3D module so pages can import it without loading three.js. */
export const ORDER: AgentId[] = ["nex", "pixel", "aria", "atlas", "oracle", "nova"];
