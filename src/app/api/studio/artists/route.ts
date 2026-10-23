import { revalidatePath } from "next/cache";
import { studioOwner } from "@/lib/studio/server";
import { artistSchema } from "@/lib/studio/artists";
import { allowRequest, boundedText, privateJson, sameOrigin } from "@/lib/studio/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Request origin not allowed." }, 403);
  const owner = await studioOwner();
  if (!owner) return privateJson({ message: "Owner access required." }, 401);
  if (!allowRequest(`studio-artists:${owner.user.id}`, 60)) return privateJson({ message: "Please wait before saving again." }, 429);
  if (!request.headers.get("content-type")?.includes("application/json")) return privateJson({ message: "Expected JSON." }, 415);
  let body: unknown;
  try { body = JSON.parse(await boundedText(request, 32768)); } catch { return privateJson({ message: "Invalid artist data." }, 400); }
  const parsed = artistSchema.safeParse(body);
  if (!parsed.success) return privateJson({ message: "Check the artist fields.", errors: parsed.error.flatten().fieldErrors }, 400);
  const { id, version, ...fields } = parsed.data;
  const values = fields;
  const query = id ? owner.client.from("artist_profiles").update(values).eq("id", id).eq("version", version!) : owner.client.from("artist_profiles").insert(values);
  const { data, error } = await query.select("id,version").maybeSingle();
  if (error) return privateJson({ message: "The artist could not be saved. Your edits have been kept." }, 502);
  if (!data) return privateJson({ message: "This artist changed in another session. Reload it before saving." }, 409);
  revalidatePath("/the-mob"); revalidatePath("/studio"); revalidatePath("/studio/artists");
  return privateJson({ saved: true, ...data });
}
