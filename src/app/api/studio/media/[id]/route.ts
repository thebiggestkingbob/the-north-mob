import { z } from "zod";
import { studioOwner } from "@/lib/studio/server";
import { privateJson } from "@/lib/studio/http";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const owner=await studioOwner();if(!owner)return privateJson({message:"Owner access required."},401);
 const {id}=await params;if(!z.uuid().safeParse(id).success)return privateJson({message:"Image not found."},404);
 const {data:asset,error}=await owner.client.from("media_assets").select("derivative_path").eq("id",id).maybeSingle();
 if(error)return privateJson({message:"Image unavailable."},503);if(!asset)return privateJson({message:"Image not found."},404);
 const {data,error:downloadError}=await owner.client.storage.from("studio-images").download(asset.derivative_path);
 if(downloadError||!data)return privateJson({message:"Image unavailable."},503);
 return new Response(data,{headers:{"Content-Type":"image/webp","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
}
