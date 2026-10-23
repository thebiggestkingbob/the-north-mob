import { revalidatePath } from "next/cache";
import { studioOwner } from "@/lib/studio/server";
import { photoSchema,videoSchema } from "@/lib/studio/media";
import { allowRequest,boundedText,privateJson,sameOrigin } from "@/lib/studio/http";
export async function POST(request:Request){
 if(!sameOrigin(request))return privateJson({message:"Request origin not allowed."},403);
 const owner=await studioOwner();if(!owner)return privateJson({message:"Owner access required."},401);
 if(!request.headers.get("content-type")?.includes("application/json"))return privateJson({message:"Expected JSON."},415);
 if(!allowRequest(`visualz:${owner.user.id}`,60))return privateJson({message:"Please wait before saving again."},429);
 let body:unknown;try{body=JSON.parse(await boundedText(request,16384));}catch{return privateJson({message:"Invalid record."},400);}
 const kind=new URL(request.url).searchParams.get("kind");if(kind!=="videos"&&kind!=="photos")return privateJson({message:"Unknown media type."},400);
 const parsed=(kind==="videos"?videoSchema:photoSchema).safeParse(body);if(!parsed.success)return privateJson({message:"Check the fields.",errors:parsed.error.flatten().fieldErrors},400);
 if("media_id" in parsed.data&&parsed.data.media_id&&parsed.data.status==="published"){
 const {data,error}=await owner.client.from("media_assets").select("id").eq("id",parsed.data.media_id).eq("status","published").maybeSingle();if(error||!data)return privateJson({message:"Publish the selected image in Media Library first."},400);
 }
 const {id,version,...fields}=parsed.data;const values:Record<string,unknown>=fields;const table=kind==="videos"?"visualz_videos":"visualz_photos";
 const query=id?owner.client.from(table).update(values).eq("id",id).eq("version",version!):owner.client.from(table).insert(values);
 const {data,error}=await query.select("id,version").maybeSingle();
 if(error)return privateJson({message:"Could not save. Check for a duplicate YouTube ID or another featured video."},502);
 if(!data)return privateJson({message:"This record changed. Reload it before saving."},409);
 revalidatePath("/visuals");revalidatePath("/studio/visualz");return privateJson({saved:true,...data});
}
