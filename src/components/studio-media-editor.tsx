"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export type MediaRecord={id:string;title:string;alt:string;rights:string;status:string;version:number;width:number;height:number};
export function StudioMediaEditor({asset}:{asset?:MediaRecord}){
 const router=useRouter();const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 return <form className="contact-form studio-event-form" onSubmit={async event=>{
 event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);setBusy(true);setMessage(asset?"Saving…":"Processing image…");
 try{const response=await fetch("/api/studio/media",asset?{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:asset.id,version:asset.version,...Object.fromEntries(form)})}:{method:"POST",body:form});const data=await response.json();if(!response.ok){setMessage(data.message??"Could not save.");return;}setMessage(asset?"Image updated.":"Image uploaded as a private draft.");router.push(`/studio/media?id=${data.id}`);router.refresh();}catch{setMessage("Connection interrupted. Please retry.");}finally{setBusy(false);}
 }}><h2>{asset?"Image details":"Upload an image"}</h2>
 {!asset&&<label>Still image · JPEG, PNG or WebP · maximum 8 MB<input type="file" name="file" accept="image/jpeg,image/png,image/webp" required/></label>}
 <label>Title<input name="title" required minLength={2} maxLength={200} defaultValue={asset?.title}/></label>
 <label>Image description for accessibility<textarea name="alt" required minLength={2} maxLength={500} defaultValue={asset?.alt}/></label>
 <label>Rights holder and permission to publish<textarea name="rights" required minLength={5} maxLength={1000} defaultValue={asset?.rights}/></label>
 {asset&&<label>Publication status<select name="status" defaultValue={asset.status}><option value="draft">Draft — private</option><option value="published">Published — web image accessible</option><option value="archived">Archived — web image hidden</option></select></label>}
 <p className="source-note">Upload only approved North Mob images you have permission to use. Originals stay private. Metadata is stripped from the optimized web image. Publishing an image makes that derivative publicly accessible; add it to Visualz separately.</p>
 <button className="button" disabled={busy} aria-busy={busy}>{busy?"Please wait…":asset?"Save image":"Upload private draft"}</button><p role="status" aria-live="polite">{message}</p></form>;
}
