"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventSchema, type StudioEvent } from "@/lib/studio/events";
export function StudioEventEditor({ event }: { event?: StudioEvent }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  return <form className="contact-form studio-event-form" onSubmit={async action => {
    action.preventDefault();
    if (saving) return;
    const form = action.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const parsed = eventSchema.safeParse({ ...fields, ...(event ? { id: event.id, version: event.version } : {}) });
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors); setStatus("Please check the highlighted fields."); return; }
    setErrors({}); setSaving(true); setStatus("Saving…");
    try {
      const response = await fetch("/api/studio/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok || !result.saved) { setErrors(result.errors ?? {}); setStatus(result.message ?? "Could not save. Please retry."); return; }
      setStatus("Event saved."); router.push(`/studio/events?id=${result.id}`); router.refresh();
    } catch { setStatus("Connection interrupted. Your edits are still here; please retry."); }
    finally { setSaving(false); }
  }}>
    <h2>{event ? "Edit event" : "New event"}</h2>
    <label htmlFor="event-name">Event name<input id="event-name" name="name" defaultValue={event?.name} required minLength={2} maxLength={200} aria-invalid={!!errors.name} aria-describedby={errors.name ? "event-name-error" : undefined} /></label>{errors.name && <p className="field-error" id="event-name-error">{errors.name[0]}</p>}
    <label htmlFor="event-date">Date<input id="event-date" type="date" name="date" defaultValue={event?.date} required aria-invalid={!!errors.date} aria-describedby={errors.date ? "event-date-error" : undefined} /></label>{errors.date && <p className="field-error" id="event-date-error">{errors.date[0]}</p>}
    <p className="source-note">South Africa time. Leave performance times unspecified unless announced.</p>
    <label htmlFor="event-venue">Venue / location<input id="event-venue" name="venue" defaultValue={event?.venue} required minLength={2} maxLength={300} aria-invalid={!!errors.venue} /></label>{errors.venue && <p className="field-error">{errors.venue[0]}</p>}
    <label htmlFor="event-tickets">Verified ticket URL (optional)<input id="event-tickets" name="ticket_url" type="url" defaultValue={event?.ticket_url} maxLength={2048} aria-invalid={!!errors.ticket_url} /></label>{errors.ticket_url && <p className="field-error">{errors.ticket_url[0]}</p>}
    <label htmlFor="event-status">Publication status<select id="event-status" name="status" defaultValue={event?.status ?? "draft"}><option value="draft">Draft — private</option><option value="published">Published — visible on Live</option><option value="archived">Archived — hidden from Live</option></select></label>
    <p className="privacy-note">Saving as Published updates the Live page in this environment. Drafts and archived listings remain private. Dates automatically determine upcoming or past status.</p>
    {errors.version && <p className="field-error">{errors.version[0]}</p>}
    <button className="button button-light" disabled={saving} aria-busy={saving}>{saving ? "Saving…" : "Save event"}<span>→</span></button>
    <p role="status" aria-live="polite" className="form-status">{status}</p>
  </form>;
}
