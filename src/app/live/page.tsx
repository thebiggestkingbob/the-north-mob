import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { events } from "@/config/content";
export const metadata: Metadata = { title: "Live" };
export default function Live() {
  return <main id="main" className="page live-page"><section className="live-hero"><Image src="/assets/group_wide.jpeg" alt="THE NORTH MOB photographed together in Pretoria" fill priority sizes="100vw" /><div className="live-heading" data-reveal><div><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>LIVE</h1></div><p className="eyebrow">Real places.<br />Real people.<br />Real energy.</p></div></section><section className="live-dates" data-reveal><div className="section-label"><h2 className="eyebrow">Upcoming shows</h2><span className="eyebrow">THE NORTH MOB / LIVE</span></div>{events.length ? <ul className="event-list">{events.map((event) => <li key={`${event.date}-${event.venue}`}><time dateTime={event.date}>{new Date(event.date).toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg", day: "2-digit", month: "short", year: "numeric" })}</time><span>{event.city}</span><span>{event.venue}</span>{event.ticketUrl && <a href={event.ticketUrl} target="_blank" rel="noreferrer">Tickets ↗</a>}</li>)}</ul> : <div className="no-shows"><h2>No upcoming dates announced.</h2><p>The next chapter is coming. Follow the collective for announcements.</p><Link href="/business" className="button">Book the Mob <span>→</span></Link></div>}</section></main>;
}
