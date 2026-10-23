import Link from "next/link";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioVisualzEditor } from "@/components/studio-visualz-editor";
import { photoSchema,videoSchema } from "@/lib/studio/media";
export default async function Visualz({searchParams}:{searchParams:Promise<{id?:string;kind?:string}>}){
 const owner=await studioOwner();if(!owner)redirect("/studio/login");const params=await searchParams,kind=params.kind==="photos"?"photos":"videos";
 const {data,error}=await owner.client.from(kind==="videos"?"visualz_videos":"visualz_photos").select("*").order("sort_order").order("id").limit(200);
 const {data:images,error:imageError}=await owner.client.from("media_assets").select("id,title,status").order("title").limit(200);
 const selected=data?.find(item=>item.id===params.id),parsed=selected?(kind==="videos"?videoSchema:photoSchema).safeParse(Object.fromEntries(Object.entries(selected).filter(([key])=>!["created_at","updated_at","published_at"].includes(key)))):null;
 const {data:history}=selected?await owner.client.from("studio_content_audit").select("id,occurred_at,after_record").eq("module",kind==="videos"?"visualz_videos":"visualz_photos").eq("record_id",selected.id).order("occurred_at",{ascending:false}).limit(10):{data:null};
 return <main id="main" className="page studio-page"><Link href="/studio">Studio</Link><h1 tabIndex={-1}>VISUALZ</h1><nav aria-label="Visualz sections"><Link href="/studio/visualz?kind=videos">Videos</Link>{" · "}<Link href="/studio/visualz?kind=photos">Photo albums</Link></nav>{error||imageError?<p role="alert">Visualz records could not be loaded.</p>:<><nav aria-label="Visualz records"><p><Link href={`/studio/visualz?kind=${kind}`}>New {kind==="videos"?"video":"photograph"}</Link></p>{data?.map(item=><p key={item.id}><Link href={`/studio/visualz?kind=${kind}&id=${item.id}`}>{item.title||item.youtube_id} · {item.status}</Link></p>)}</nav><p className="source-note">Showing up to 200 records.</p>{params.id&&!selected?<p role="alert">Record not found.</p>:selected&&!parsed?.success?<p role="alert">This record has invalid fields. It has not been changed.</p>:<StudioVisualzEditor key={selected?`${selected.id}-${selected.version}`:kind} kind={kind} record={parsed?.success?parsed.data:undefined} images={images??[]}/>}</>}{history&&<section><h2>Recent changes</h2>{history.map(row=><p key={row.id}>{new Date(row.occurred_at).toISOString()} · {String(row.after_record.status)} · version {String(row.after_record.version)}</p>)}</section>}</main>;
}
