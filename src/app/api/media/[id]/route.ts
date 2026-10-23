import { z } from "zod";
import { publicStudioClient } from "@/lib/studio/public-client";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!z.uuid().safeParse(id).success)return new Response(null,{status:404});
 const client=publicStudioClient();if(!client)return new Response(null,{status:503});
 const {data:asset,error}=await client.from("media_assets").select("derivative_path").eq("id",id).eq("status","published").maybeSingle();
 if(error)return new Response(null,{status:503});if(!asset)return new Response(null,{status:404});
 const {data,error:downloadError}=await client.storage.from("studio-images").download(asset.derivative_path);
 if(downloadError||!data)return new Response(null,{status:503});
 return new Response(data,{headers:{"Content-Type":"image/webp","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
}
