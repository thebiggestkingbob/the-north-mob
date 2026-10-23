import { revalidatePath } from "next/cache";
import { studioOwner } from "@/lib/studio/server";
import { eventSchema } from "@/lib/studio/events";
import { allowRequest, boundedText, privateJson, sameOrigin } from "@/lib/studio/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Request origin not allowed." }, 403);
  const owner = await studioOwner();
  if (!owner) return privateJson({ message: "Owner access required." }, 401);
  if (!allowRequest(`studio-events:${owner.user.id}`, 60)) return privateJson({ message: "Please wait before saving again." }, 429);
  if (!request.headers.get("content-type")?.includes("application/json")) return privateJson({ message: "Expected JSON." }, 415);
  let body: unknown;
  try { body = JSON.parse(await boundedText(request, 8192)); } catch { return privateJson({ message: "Invalid event data." }, 400); }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return privateJson({ message: "Check the event fields.", errors: parsed.error.flatten().fieldErrors }, 400);
  const { id, version, ...fields } = parsed.data;
  const values = { ...fields, ticket_url: fields.ticket_url || null };
  const query = id ? owner.client.from("events").update(values).eq("id", id).eq("version", version!) : owner.client.from("events").insert(values);
  const { data, error } = await query.select("id,version").maybeSingle();
  if (error) return privateJson({ message: "The event could not be saved. Your edits have been kept." }, 502);
  if (!data) return privateJson({ message: "This event changed in another session. Reload it before saving." }, 409);
  revalidatePath("/live"); revalidatePath("/studio"); revalidatePath("/studio/events");
  return privateJson({ saved: true, ...data });
}
