import { revalidatePath } from "next/cache";
import { studioOwner } from "@/lib/studio/server";
import { releaseSchema,trackSchema } from "@/lib/studio/music";
import { allowRequest,boundedText,privateJson,sameOrigin } from "@/lib/studio/http";
export async function POST(request:Request){
 if(!sameOrigin(request))return privateJson({message:"Request origin not allowed."},403);
 const owner=await studioOwner();if(!owner)return privateJson({message:"Owner access required."},401);
 if(!request.headers.get("content-type")?.includes("application/json"))return privateJson({message:"Expected JSON."},415);
 if(!allowRequest(`music:${owner.user.id}`,60))return privateJson({message:"Please wait before saving again."},429);
 const kind=new URL(request.url).searchParams.get("kind");if(kind!=="releases"&&kind!=="tracks")return privateJson({message:"Unknown music type."},400);
 let raw:unknown;try{raw=JSON.parse(await boundedText(request,16384));}catch{return privateJson({message:"Invalid music record."},400);}
 const parsed=(kind==="releases"?releaseSchema:trackSchema).safeParse(raw);if(!parsed.success)return privateJson({message:"Check the music fields.",errors:parsed.error.flatten().fieldErrors},400);
 if("cover" in parsed.data&&parsed.data.cover?.startsWith("/api/media/")&&parsed.data.status==="published"){
 const {data,error}=await owner.client.from("media_assets").select("id").eq("id",parsed.data.cover.slice(11)).eq("status","published").maybeSingle();if(error||!data)return privateJson({message:"Publish the artwork in Media Library first."},400);
 }
 const {id,version,...fields}=parsed.data;const values:Record<string,unknown>=fields;const table=kind==="releases"?"music_releases":"music_tracks";
 if(id){delete values.slug;delete values.catalogue_id;}
 const query=id?owner.client.from(table).update(values).eq("id",id).eq("version",version!):owner.client.from(table).insert(values);
 const {data,error}=await query.select("id,version").maybeSingle();if(error)return privateJson({message:"Could not save. Check the release and unique URL identifiers."},502);if(!data)return privateJson({message:"This record changed. Reload before saving."},409);
 revalidatePath("/music");revalidatePath("/studio/music");revalidatePath("/","layout");return privateJson({saved:true,...data});
}
