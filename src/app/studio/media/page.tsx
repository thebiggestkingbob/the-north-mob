import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioMediaEditor, type MediaRecord } from "@/components/studio-media-editor";
export default async function Media({searchParams}:{searchParams:Promise<{id?:string}>}){
 const owner=await studioOwner();if(!owner)redirect("/studio/login");const {id}=await searchParams;
 const {data,error}=await owner.client.from("media_assets").select("id,title,alt,rights,status,version,width,height,derivative_path").order("created_at",{ascending:false}).limit(100);
 const selected=data?.find(item=>item.id===id) as (MediaRecord&{derivative_path:string})|undefined;

 const {data:history}=selected?await owner.client.from("studio_content_audit").select("id,occurred_at,after_record").eq("module","media_assets").eq("record_id",selected.id).order("occurred_at",{ascending:false}).limit(10):{data:null};
 return <main id="main" className="page studio-page"><Link href="/studio">Studio</Link><h1 tabIndex={-1}>MEDIA LIBRARY</h1>{error?<p role="alert">Media could not be loaded. Check the migration and storage configuration.</p>:<><nav aria-label="Image records"><Link href="/studio/media">Upload image</Link>{data?.map(item=><p key={item.id}><Link href={`/studio/media?id=${item.id}`}>{item.title} · {item.status}</Link></p>)}</nav><p className="source-note">Showing the latest 100 images.</p>{id&&!selected?<p role="alert">Image not found in the latest records.</p>:<>{selected&&<figure><Image unoptimized width={selected.width} height={selected.height} src={`/api/studio/media/${selected.id}`} alt={selected!.alt} style={{maxWidth:"100%",maxHeight:360,objectFit:"contain"}}/><figcaption>{selected!.width} × {selected!.height}</figcaption></figure>}<StudioMediaEditor key={selected?`${selected.id}-${selected.version}`:"new"} asset={selected}/></>}</>}{history&&<section><h2>Recent changes</h2>{history.map(row=><p key={row.id}>{new Date(row.occurred_at).toISOString()} · {String(row.after_record.status)} · version {String(row.after_record.version)}</p>)}</section>}</main>;
}
