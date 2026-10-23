import { z } from "zod";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "Enter a valid date.");
export const eventSchema = z.object({
  id: z.uuid().optional(),
  version: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(200),
  date,
  venue: z.string().trim().min(2).max(300),
  ticket_url: z.union([z.literal(""), z.url().max(2048).refine(value => value.startsWith("https://"), "Use an HTTPS ticket URL.")]).default(""),
  status: z.enum(["draft", "published", "archived"]),
}).strict().refine(value => !value.id || !!value.version, { message: "Reload this event before saving.", path: ["version"] });
export type StudioEvent = z.infer<typeof eventSchema> & { id: string; version: number };
