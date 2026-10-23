import Link from "next/link";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioMusicEditor } from "@/components/studio-music-editor";
import { releaseSchema,trackSchema } from "@/lib/studio/music";
export default async function Music({searchParams}:{searchParams:Promise<{id?:string;kind?:string}>}){
 const owner=await studioOwner();if(!owner)redirect("/studio/login");const params=await searchParams,kind=params.kind==="tracks"?"tracks":"releases";
 const {data,error}=await owner.client.from(kind==="releases"?"music_releases":"music_tracks").select("*").order("created_at").limit(200);
 const {data:releases,error:releaseError}=await owner.client.from("music_releases").select("slug,title,status").order("title");
 const selected=data?.find(item=>item.id===params.id),parsed=selected?(kind==="releases"?releaseSchema:trackSchema).safeParse(Object.fromEntries(Object.entries(selected).filter(([key])=>!["created_at","updated_at","published_at"].includes(key)))):null;
 const {data:history}=selected?await owner.client.from("studio_content_audit").select("id,occurred_at,after_record").eq("module",kind==="releases"?"music_releases":"music_tracks").eq("record_id",selected.id).order("occurred_at",{ascending:false}).limit(10):{data:null};
 return <main id="main" className="page studio-page"><Link href="/studio">Studio</Link><h1 tabIndex={-1}>MUSIC</h1><nav aria-label="Music sections"><Link href="/studio/music?kind=releases">Releases</Link>{" · "}<Link href="/studio/music?kind=tracks">Tracks</Link></nav>{error||releaseError?<p role="alert">Music records could not be loaded.</p>:<><nav aria-label="Music records"><p><Link href={`/studio/music?kind=${kind}`}>New {kind==="releases"?"release":"track"}</Link></p>{data?.map(item=><p key={item.id}><Link href={`/studio/music?kind=${kind}&id=${item.id}`}>{item.title} · {item.status}</Link></p>)}</nav><p className="source-note">Showing up to 200 records.</p>{params.id&&!selected?<p role="alert">Record not found.</p>:selected&&!parsed?.success?<p role="alert">Invalid record. No changes have been made.</p>:<StudioMusicEditor key={selected?`${selected.id}-${selected.version}`:kind} kind={kind} record={parsed?.success?parsed.data:undefined} releases={releases??[]}/>}</>}{history&&<section><h2>Recent changes</h2>{history.map(row=><p key={row.id}>{new Date(row.occurred_at).toISOString()} · {String(row.after_record.status)} · version {String(row.after_record.version)}</p>)}</section>}</main>;
}
