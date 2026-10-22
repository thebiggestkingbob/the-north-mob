import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { events } from "@/config/content";
export const metadata: Metadata = { title: "Live" };
// Allow date labels to refresh hourly instead of freezing them at deployment time.
export const revalidate = 3600;
export default function Live() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
  const chronologicalEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return <main id="main" className="page live-page"><section className="live-hero"><Image src="/assets/group_wide.jpeg" alt="THE NORTH MOB photographed together in Pretoria" fill priority sizes="100vw" /><div className="live-heading" data-reveal><div><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>LIVE</h1></div><p className="eyebrow">Real places.<br />Real people.<br />Real energy.</p></div></section><section className="live-dates" data-reveal><div className="section-label"><h2 className="eyebrow">October 2026 gigs</h2><span className="eyebrow">More dates to be added.</span></div>{events.length ? <ul className="event-list">{chronologicalEvents.map((event) => <li key={`${event.date}-${event.name}`}><time dateTime={event.date}>{new Date(event.date).toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg", day: "2-digit", month: "short", year: "numeric" })}</time><span>{event.name}</span><span>{event.venue}</span><span>{event.date < today ? "Past event" : "Upcoming gig"}{event.ticketUrl && <> · <a href={event.ticketUrl} target="_blank" rel="noreferrer">Tickets ↗</a></>}</span></li>)}</ul> : <div className="no-shows"><h2>No upcoming dates announced.</h2><p>The next chapter is coming. Follow the collective for announcements.</p><Link href="/business" className="button">Book the Mob <span>→</span></Link></div>}</section></main>;
}
