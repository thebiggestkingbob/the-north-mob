import "server-only";
import { createClient } from "@supabase/supabase-js";
import { events, type LiveEvent } from "@/config/content";
import { studioConfig } from "./config";
export async function publishedEvents(): Promise<{ events: LiveEvent[]; unavailable: boolean }> {
  const config = studioConfig();
  if (!config) return { events, unavailable: false };
  try {
    const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(5000) }) } });
    const { data, error } = await client.from("events").select("name,date,venue,ticket_url").eq("status", "published").order("date").order("id");
    if (error || !data) return { events: [], unavailable: true };
    // An intentionally empty published catalogue must remain empty.
    return { events: data.map(event => ({ name: event.name, date: event.date, venue: event.venue, ...(event.ticket_url ? { ticketUrl: event.ticket_url } : {}) })), unavailable: false };
  } catch { return { events: [], unavailable: true }; }
}
