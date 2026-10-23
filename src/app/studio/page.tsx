import Link from "next/link";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioSignout } from "@/components/studio-signout";
export default async function Studio() {
  const owner = await studioOwner();
  if (!owner) redirect("/studio/login");
  const { data, error } = await owner.client.from("events").select("id,status");
  return <main id="main" className="page studio-page"><div className="section-label"><p className="eyebrow">Owner workspace</p><StudioSignout /></div><h1 tabIndex={-1}>STUDIO</h1><section className="studio-overview"><h2>Events</h2>{error ? <p role="alert">Event data could not be loaded. Please retry.</p> : <p>{data.filter(event => event.status === "published").length} published · {data.filter(event => event.status === "draft").length} drafts · {data.filter(event => event.status === "archived").length} archived</p>}<Link className="button" href="/studio/events">Manage events<span>→</span></Link></section><section className="studio-overview"><h2>Artists</h2><p>Manage verified profiles, approved portraits, drafts and publication history.</p><Link className="button" href="/studio/artists">Manage artists →</Link></section><p className="source-note">Media, music, enquiries, fans, campaigns and custom commerce are still being implemented. Payment processing will remain disconnected until the merchant account is ready.</p></main>;
}
