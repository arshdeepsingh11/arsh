import { z } from "zod";
import { AGENT_IDS } from "@/lib/content/agents";

/** Request schemas shared by the API routes (validation) and the client (types). */

const message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) });

export const chatSchema = z.object({
  agent: z.enum(AGENT_IDS),
  messages: z.array(message).min(1).max(20),
  intent: z.string().max(80).optional(),
});
export type ChatBody = z.infer<typeof chatSchema>;

export const networkSchema = z.object({
  task: z.string().trim().min(8).max(500),
  include: z.array(z.enum(["pixel", "nova"])).max(2).default([]),
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(120),
  email: z.string().trim().max(200).regex(EMAIL, "That email address does not look complete."),
  type: z.string().trim().min(1).max(80),
  problem: z.string().trim().min(15, "A sentence or two helps a lot.").max(3000),
  features: z.string().trim().min(5, "List at least one thing it must do.").max(3000),
  integrations: z.array(z.string().max(60)).max(12).default([]),
  timeline: z.string().trim().max(120).optional().default(""),
  brief: z.string().trim().max(5000).optional(),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(0).optional().default(""),
});
export type Inquiry = z.infer<typeof inquirySchema>;

export function firstIssue(e: z.ZodError): string {
  const i = e.issues[0];
  return i ? i.message : "Invalid request.";
}
