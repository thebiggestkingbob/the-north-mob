"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { photoSchema,videoSchema } from "@/lib/studio/media";
export type VideoRecord=z.infer<typeof videoSchema>;
export type PhotoRecord=z.infer<typeof photoSchema>;
export function StudioVisualzEditor({kind,record,images}:{kind:"videos"|"photos";record?:VideoRecord|PhotoRecord;images:{id:string;title:string;status:string}[]}){
 const router=useRouter();const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const video=record&&"youtube_id" in record?record:undefined,photo=record&&"album" in record?record:undefined;
 return <form className="contact-form studio-event-form" onSubmit={async event=>{
 event.preventDefault();if(busy)return;const fields=Object.fromEntries(new FormData(event.currentTarget));
 const raw={...fields,sort_order:Number(fields.sort_order),...(kind==="videos"?{featured:fields.featured==="on"}:{media_id:fields.media_id||null,local_path:fields.local_path||null}),...(record?{id:record.id,version:record.version}:{})};
 const parsed=(kind==="videos"?videoSchema:photoSchema).safeParse(raw);if(!parsed.success){setMessage(parsed.error.issues.map(x=>x.message).join(" "));return;}
 setBusy(true);setMessage("Saving…");try{const response=await fetch(`/api/studio/visualz?kind=${kind}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});const result=await response.json();if(!response.ok){setMessage(result.message??"Could not save.");return;}setMessage("Saved.");router.push(`/studio/visualz?kind=${kind}&id=${result.id}`);router.refresh();}catch{setMessage("Connection interrupted. Your edits are still here.");}finally{setBusy(false);}
 }}><h2>{record?"Edit":"New"} {kind==="videos"?"video":"photograph"}</h2>
 {kind==="videos"?<><label>YouTube video ID<input name="youtube_id" required pattern="[A-Za-z0-9_\-]{11}" maxLength={11} defaultValue={video?.youtube_id}/></label><label>Category<select name="category" defaultValue={video?.category??"music-video"}>{["music-video","behind-the-scenes","live","interview","studio"].map(x=><option key={x}>{x}</option>)}</select></label><label><input type="checkbox" name="featured" defaultChecked={video?.featured}/>Feature this video first (only one published feature)</label></>:<><label>Uploaded image<select name="media_id" defaultValue={photo?.media_id??""}><option value="">Use an approved local image instead</option>{images.map(image=><option key={image.id} value={image.id}>{image.title} · {image.status}</option>)}</select></label><label>Approved local image path (leave empty when using an upload)<input name="local_path" defaultValue={photo?.local_path??""} placeholder="/assets/mob-ties/mob-ties-05.webp"/></label><label>Album<input name="album" required maxLength={200} defaultValue={photo?.album??"Mob Ties"}/></label></>}
 <label>{kind==="videos"?"Verified title (optional; YouTube metadata is used when empty)":"Title / image description"}<input name="title" required={kind==="photos"} maxLength={kind==="videos"?300:200} defaultValue={record?.title}/></label>
 <label>Display order<input name="sort_order" type="number" required min={0} max={1000} defaultValue={record?.sort_order??0}/></label>
 <label>Publication status<select name="status" defaultValue={record?.status??"draft"}><option value="draft">Draft — private</option><option value="published">Published — visible on Visualz</option><option value="archived">Archived — hidden</option></select></label>
 <p className="source-note">Use verified titles and approved media only. Publishing updates Visualz in this environment. An uploaded image must be published in Media Library first.</p>
 <button className="button" disabled={busy} aria-busy={busy}>{busy?"Saving…":"Save record"}</button><p role="status" aria-live="polite">{message}</p></form>;
}
