import Link from "next/link";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioArtistEditor } from "@/components/studio-artist-editor";
import { artistSchema } from "@/lib/studio/artists";
export default async function Artists({searchParams}:{searchParams:Promise<{id?:string}>}){
 const owner=await studioOwner();if(!owner)redirect("/studio/login");
 const {id}=await searchParams;
 const {data,error}=await owner.client.from("artist_profiles").select("id,version,slug,name,tagline,bio,portrait,position,sort_order,status").order("sort_order").order("id");
 const selected=data?.find(item=>item.id===id);const parsed=selected?artistSchema.safeParse(selected):null;
 const {data:history}=id?await owner.client.from("studio_content_audit").select("id,occurred_at,after_record").eq("module","artists").eq("record_id",id).order("occurred_at",{ascending:false}).limit(10):{data:null};
 return <main id="main" className="page studio-page"><Link href="/studio"> Studio</Link><h1 tabIndex={-1}>ARTISTS</h1>{error?<p role="alert">Artists could not be loaded. Check the database migration and retry.</p>:<><nav aria-label="Artist records"><Link className="text-link" href="/studio/artists">New artist +</Link>{data.map(item=><p key={item.id}><Link href={`/studio/artists?id=${item.id}`}>{item.name} · {item.status}</Link></p>)}</nav>{id&&!selected?<p role="alert">Artist not found. Choose a record above.</p>:<StudioArtistEditor key={selected?.id??"new"} artist={parsed?.success?parsed.data:undefined}/>}</>}{history&&history.length>0&&<section><h2>Recent changes</h2>{history.map(item=><p key={item.id}>{new Date(item.occurred_at).toISOString()} · {String(item.after_record.status)} · version {String(item.after_record.version)}</p>)}</section>}</main>;
}
