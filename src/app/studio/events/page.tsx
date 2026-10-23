import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { studioOwner } from "@/lib/studio/server";
import { StudioEventEditor } from "@/components/studio-event-editor";
import { StudioSignout } from "@/components/studio-signout";
import type { StudioEvent } from "@/lib/studio/events";
export default async function StudioEvents({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const owner = await studioOwner();
  if (!owner) redirect("/studio/login");
  const { id } = await searchParams;
  if (id && !/^[a-f0-9-]{36}$/i.test(id)) notFound();
  const { data, error } = await owner.client.from("events").select("id,name,date,venue,ticket_url,status,version").order("date", { ascending: false }).order("id");
  if (error) return <main id="main" className="page studio-page"><h1 tabIndex={-1}>EVENTS</h1><p role="alert">Events could not be loaded. Please retry before editing.</p></main>;
  const selected = id ? data.find(event => event.id === id) : undefined;
  if (id && !selected) notFound();
  const history = id ? await owner.client.from("studio_audit_events").select("id,action,occurred_at").eq("event_id", id).order("occurred_at", { ascending: false }).limit(20) : null;
  return <main id="main" className="page studio-page"><div className="section-label"><Link href="/studio" className="text-link">← Studio</Link><StudioSignout /></div><h1 tabIndex={-1}>EVENTS</h1><div className="studio-events-grid"><section><div className="section-label"><h2 className="eyebrow">All listings</h2><Link href="/studio/events" className="text-link">New event +</Link></div>{data.length ? <ul className="studio-event-list">{data.map(event => <li key={event.id}><Link href={`/studio/events?id=${event.id}`} aria-current={id === event.id ? "page" : undefined}><time dateTime={event.date}>{event.date}</time><strong>{event.name}</strong><span>{event.venue}</span><small>{event.status}</small></Link></li>)}</ul> : <p>No events recorded yet.</p>}</section><section><StudioEventEditor key={id ?? "new"} event={selected ? { ...selected, ticket_url: selected.ticket_url ?? "" } as StudioEvent : undefined} />{id && <section className="studio-history"><h2 className="eyebrow">Change history</h2>{history?.error ? <p>History could not be loaded.</p> : <ul>{history?.data?.map(entry => <li key={entry.id}>{entry.action} · <time dateTime={entry.occurred_at}>{new Date(entry.occurred_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })} SAST</time></li>)}</ul>}</section>}</section></div></main>;
}
