import Link from "next/link";
import { redirect } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioSignout } from "@/components/studio-signout";
export default async function Studio() {
  const owner = await studioOwner();
  if (!owner) redirect("/studio/login");
  const { data, error } = await owner.client.from("events").select("id,status");
  return <main id="main" className="page studio-page"><div className="section-label"><p className="eyebrow">Owner workspace</p><StudioSignout /></div><h1 tabIndex={-1}>STUDIO</h1><section className="studio-overview"><h2>Events</h2>{error ? <p role="alert">Event data could not be loaded. Please retry.</p> : <p>{data.filter(event => event.status === "published").length} published · {data.filter(event => event.status === "draft").length} drafts · {data.filter(event => event.status === "archived").length} archived</p>}<Link className="button" href="/studio/events">Manage events</Link></section><section className="studio-overview"><h2>Artists</h2><p>Manage verified profiles, approved portraits, drafts and publication history.</p><Link className="button" href="/studio/artists">Manage artists</Link></section><section className="studio-overview"><h2>Media Library</h2><p>Upload approved images, record rights and publish optimized web images.</p><Link className="button" href="/studio/media">Manage media</Link></section><section className="studio-overview"><h2>Visualz</h2><p>Manage videos, featured selection and photo albums.</p><Link className="button" href="/studio/visualz">Manage Visualz</Link></section><section className="studio-overview"><h2>Music</h2><p>Manage verified releases, artwork, track order and publication.</p><Link className="button" href="/studio/music">Manage music</Link></section><p className="source-note">Enquiries, fans, campaigns and custom commerce are still being implemented. Payment processing will remain disconnected until the merchant account is ready.</p></main>;
}
