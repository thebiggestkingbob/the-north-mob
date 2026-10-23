import { z } from "zod";
const asset = z.string().regex(/^\/assets\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$/).refine(value => !value.includes(".."), "Use an approved local image path.");
export const artistSchema = z.object({
 id: z.uuid().optional(), version: z.number().int().positive().optional(),
 slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
 name: z.string().trim().min(2).max(120), tagline: z.string().trim().max(300),
 bio: z.string().trim().max(5000), portrait: asset,
 position: z.string().regex(/^\d{1,3}% \d{1,3}%$/),
 sort_order: z.number().int().min(0).max(1000),
 status: z.enum(["draft", "published", "archived"]),
}).strict().refine(value => !value.id || !!value.version, { path: ["version"], message: "Reload before saving." });
export type ArtistRecord = z.infer<typeof artistSchema>;
export type PublicArtist = Pick<ArtistRecord, "slug" | "name" | "tagline" | "bio" | "portrait" | "position">;
