"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { artistSchema, type ArtistRecord } from "@/lib/studio/artists";
export function StudioArtistEditor({ artist }: { artist?: ArtistRecord }) {
 const router = useRouter(); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
 return <form className="contact-form studio-event-form" onSubmit={async event=>{
 event.preventDefault(); if(saving)return;
 const values=Object.fromEntries(new FormData(event.currentTarget));
 const parsed=artistSchema.safeParse({...values,sort_order:Number(values.sort_order),...(artist?{id:artist.id,version:artist.version}:{})});
 if(!parsed.success){setMessage(parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).join(" "));return;}
 setSaving(true);setMessage("Saving…");
 try{const response=await fetch("/api/studio/artists",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});const result=await response.json();if(!response.ok){setMessage(result.message??"Could not save.");return;}setMessage("Artist saved.");router.push(`/studio/artists?id=${result.id}`);router.refresh();}catch{setMessage("Connection interrupted. Your edits are still here.");}finally{setSaving(false);}
 }}><h2>{artist?"Edit artist":"New artist"}</h2>
 <label>Stable URL name<input name="slug" required defaultValue={artist?.slug} readOnly={!!artist} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100}/></label>
 <label>Artist name<input name="name" required defaultValue={artist?.name} minLength={2} maxLength={120}/></label>
 <label>Verified tagline<input name="tagline" defaultValue={artist?.tagline} maxLength={300}/></label>
 <label>Approved biography<textarea name="bio" defaultValue={artist?.bio} maxLength={5000}/></label>
 <label>Approved portrait path<input name="portrait" required defaultValue={artist?.portrait} placeholder="/assets/artists/trophy.webp"/></label>
 <label>Portrait position<input name="position" required defaultValue={artist?.position??"50% 50%"}/></label>
 <label>Display order<input type="number" name="sort_order" min={0} max={1000} required defaultValue={artist?.sort_order??0}/></label>
 <label>Publication status<select name="status" defaultValue={artist?.status??"draft"}><option value="draft">Draft — private</option><option value="published">Published — visible on The Mob</option><option value="archived">Archived — hidden</option></select></label>
 <p className="source-note">Use verified artist identities and approved local portraits only. Saving as Published updates this environment.</p>
 <button className="button button-light" disabled={saving} aria-busy={saving}>{saving?"Saving…":"Save artist"}</button><p role="status" aria-live="polite">{message}</p></form>;
}
