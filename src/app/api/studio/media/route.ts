import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { studioOwner } from "@/lib/studio/server";
import { mediaDetails, mediaUpdate, imageMime } from "@/lib/studio/media";
import { allowRequest, boundedText, privateJson, sameOrigin } from "@/lib/studio/http";
export const runtime="nodejs";
const maximum=8*1024*1024;
export async function POST(request:Request){
 if(!sameOrigin(request))return privateJson({message:"Request origin not allowed."},403);
 const owner=await studioOwner();if(!owner)return privateJson({message:"Owner access required."},401);
 if(!allowRequest(`media-upload:${owner.user.id}`,10))return privateJson({message:"Please wait before uploading again."},429);
 if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))return privateJson({message:"Expected an image upload."},415);
 let form:FormData;
 try {const raw=await boundedTextBytes(request,maximum+16384);form=await new Request("http://upload.local",{method:"POST",headers:{"content-type":request.headers.get("content-type")!},body:raw}).formData();}catch{return privateJson({message:"Upload exceeds 8 MB or is invalid."},413);}
 const details=mediaDetails.safeParse({title:form.get("title"),alt:form.get("alt"),rights:form.get("rights")});
 const file=form.get("file");if(!details.success||!(file instanceof File)||!file.size||file.size>maximum)return privateJson({message:"Choose a JPEG, PNG or WebP under 8 MB and complete the rights and description fields."},400);
 const bytes=Buffer.from(await file.arrayBuffer());const mime=imageMime(bytes);
 if(!mime||mime!==file.type)return privateJson({message:"The file contents must match a JPEG, PNG or WebP image."},400);
 let output:Buffer,width:number,height:number;
 try {const image=sharp(bytes,{limitInputPixels:40000000,animated:false});const meta=await image.metadata();if((meta.pages??1)>1)throw new Error("Animated images are not supported");const result=await image.rotate().resize({width:2400,height:2400,fit:"inside",withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});output=result.data;width=result.info.width;height=result.info.height;if(output.length>maximum)throw new Error("Image too large");}catch{return privateJson({message:"This image cannot be processed. Use a still JPEG, PNG or WebP under 40 megapixels."},400);}
 const id=crypto.randomUUID(),original_path=`${id}/original`,derivative_path=`${id}/image.webp`;
 const original=owner.client.storage.from("studio-originals"),images=owner.client.storage.from("studio-images");
 const first=await original.upload(original_path,bytes,{contentType:mime,upsert:false});if(first.error)return privateJson({message:"Original upload failed. Please retry."},502);
 const second=await images.upload(derivative_path,output,{contentType:"image/webp",upsert:false});
 if(second.error){await original.remove([original_path]);return privateJson({message:"Image upload failed. Please retry."},502);}
 const saved=await owner.client.from("media_assets").insert({id,...details.data,original_path,derivative_path,width,height,byte_size:file.size,status:"draft"});
 if(saved.error){await Promise.all([original.remove([original_path]),images.remove([derivative_path])]);return privateJson({message:"Upload could not be recorded. Please retry."},502);}
 revalidatePath("/studio/media");return privateJson({saved:true,id},201);
}
async function boundedTextBytes(request:Request,max:number){
 if(Number(request.headers.get("content-length")??0)>max)throw new Error("Too large");
 const reader=request.body?.getReader();if(!reader)throw new Error("Missing body");let length=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new Error("Too large");}chunks.push(value);}return Buffer.concat(chunks);
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return privateJson({message:"Request origin not allowed."},403);
 const owner=await studioOwner();if(!owner)return privateJson({message:"Owner access required."},401);
 if(!allowRequest(`media-edit:${owner.user.id}`,60))return privateJson({message:"Please wait before saving again."},429);
 let raw:unknown;try{raw=JSON.parse(await boundedText(request,8192));}catch{return privateJson({message:"Invalid image details."},400);}
 const parsed=mediaUpdate.safeParse(raw);if(!parsed.success)return privateJson({message:"Check the image details."},400);
 const {id,version,...fields}=parsed.data;
 const {data,error}=await owner.client.from("media_assets").update(fields).eq("id",id).eq("version",version).select("id,version").maybeSingle();
 if(error)return privateJson({message:"The image could not be updated."},502);if(!data)return privateJson({message:"This image changed. Reload before saving."},409);
 revalidatePath("/studio/media");revalidatePath("/visuals");return privateJson({saved:true,...data});
}
