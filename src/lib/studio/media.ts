import { z } from "zod";
export const mediaDetails = z.object({ title: z.string().trim().min(2).max(200), alt: z.string().trim().min(2).max(500), rights: z.string().trim().min(5).max(1000) }).strict();
export const mediaUpdate = mediaDetails.extend({ id: z.uuid(), version: z.number().int().positive(), status: z.enum(["draft", "published", "archived"]) }).strict();
export function imageMime(bytes: Uint8Array): string | null {
 if(bytes.length<12)return null;
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return "image/jpeg";
 if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return "image/png";
 if(Buffer.from(bytes.slice(0,4)).toString()==="RIFF"&&Buffer.from(bytes.slice(8,12)).toString()==="WEBP")return "image/webp";
 return null;
}
export const videoSchema = z.object({id:z.uuid().optional(),version:z.number().int().positive().optional(),youtube_id:z.string().regex(/^[A-Za-z0-9_-]{11}$/),title:z.string().trim().max(300),category:z.enum(["music-video","behind-the-scenes","live","interview","studio"]),sort_order:z.number().int().min(0).max(1000),featured:z.boolean(),status:z.enum(["draft","published","archived"])}).strict().refine(v=>!v.id||!!v.version,{path:["version"],message:"Reload this record before saving."});
export const photoSchema = z.object({id:z.uuid().optional(),version:z.number().int().positive().optional(),media_id:z.uuid().nullable(),local_path:z.string().regex(/^\/assets\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$/).refine(v=>!v.includes("..")).nullable(),title:z.string().trim().min(2).max(200),album:z.string().trim().min(1).max(200),sort_order:z.number().int().min(0).max(1000),status:z.enum(["draft","published","archived"])}).strict().refine(v=>!!v.media_id!==!!v.local_path,{message:"Choose one uploaded image or approved local path."}).refine(v=>!v.id||!!v.version,{path:["version"],message:"Reload this record before saving."});
