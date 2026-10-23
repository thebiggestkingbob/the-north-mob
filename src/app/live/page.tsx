import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { type LiveEvent } from "@/config/content";
import { publishedEvents } from "@/lib/studio/public-events";
export const metadata: Metadata = { title: "Live" };
// Allow date labels to refresh hourly instead of freezing them at deployment time.
export const revalidate = 3600;
function EventList({ items, past }: { items: LiveEvent[]; past: boolean }) {
  return <ul className="event-list">{items.map(event => <li key={`${event.date}-${event.name}`} data-event-status={past ? "past" : "upcoming"}>
    <time dateTime={event.date}><span className="event-day">{event.date.slice(8)}</span><span>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg", month: "short", year: "numeric" })}</span></time>
    <div className="event-copy"><h3>{event.name}</h3><p>{event.venue}</p></div><div className="event-meta"><span>{past ? "Past event" : "Upcoming gig"}</span>{event.ticketUrl && <a href={event.ticketUrl} target="_blank" rel="noreferrer">{past ? "Event link" : "Tickets"}</a>}</div>
  </li>)}</ul>;
}
export default async function Live() {
  const { events, unavailable } = await publishedEvents();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
  const chronologicalEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = chronologicalEvents.filter(event => event.date >= today);
  const past = chronologicalEvents.filter(event => event.date < today);
  return <main id="main" className="page live-page">
    <section className="live-hero"><Image src="/assets/group_wide.jpeg" alt="THE NORTH MOB photographed together in Pretoria" fill priority sizes="100vw" /><div className="live-heading" data-reveal><div><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>LIVE</h1></div><p className="eyebrow">Real places.<br />Real people.<br />Real energy.</p></div></section>
    <section className="live-dates" aria-labelledby="upcoming-gigs" data-reveal><div className="section-label"><h2 className="eyebrow" id="upcoming-gigs">Upcoming gigs</h2><span className="eyebrow">More dates to be added.</span></div>
      {unavailable ? <div className="no-shows" role="status"><h2>Show listings are temporarily unavailable.</h2><p>Please try again shortly, or contact the team for booking enquiries.</p><Link href="/business" className="button">Book the Mob </Link></div> : upcoming.length ? <EventList items={upcoming} past={false} /> : <div className="no-shows"><h2>No upcoming dates announced.</h2><p>The next chapter is coming. Follow the collective for announcements.</p><Link href="/business" className="button">Book the Mob </Link></div>}
    </section>
    {past.length > 0 && <section className="live-dates" aria-labelledby="past-gigs" data-reveal><div className="section-label"><h2 className="eyebrow" id="past-gigs">Past shows</h2><span className="eyebrow">Archive</span></div><EventList items={past} past /></section>}
  </main>;
}
