"use client";
import { useState } from "react";
import { enquirySchema, enquiryTypes } from "@/lib/contact";
export function ContactForm({ configured, fallbackEmail }: { configured: boolean; fallbackEmail?: string }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [draftUrl, setDraftUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  return <form className="contact-form" onSubmit={async (event) => {
    event.preventDefault();
    if (status === "sending" || (!configured && !fallbackEmail)) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setErrors({}); setNotice(""); setDraftUrl("");
    if (!configured && fallbackEmail) {
      const parsed = enquirySchema.safeParse({ ...Object.fromEntries(data), consent: data.get("consent") === "on" });
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        setErrors(fieldErrors); setStatus("error"); setNotice("Please check your enquiry.");
        form.querySelector<HTMLElement>(`[name="${Object.keys(fieldErrors)[0]}"]`)?.focus();
        return;
      }
      const { name, email, type, message, eventDate, location, budget, organisation } = parsed.data;
      const body = `Name: ${name}\nEmail: ${email}\nEnquiry: ${type}\n${[eventDate && `Date: ${eventDate}`, location && `Location: ${location}`, budget && `Budget: ${budget}`, organisation && `Organisation: ${organisation}`].filter(Boolean).join("\n")}\n\n${message}`;
      const url = `mailto:${fallbackEmail}?subject=${encodeURIComponent(`THE NORTH MOB — ${type}`)}&body=${encodeURIComponent(body)}`;
      setDraftUrl(url); setStatus("idle"); setNotice("Your enquiry is ready. Send it in your email app to complete your request.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(data), consent: data.get("consent") === "on" }) });
      const result = await response.json();
      if (!response.ok || (result.delivered !== true && result.accepted !== true)) {
        setErrors(result.errors ?? {}); setNotice(result.message ?? "We couldn’t send your enquiry. Please try again."); setStatus("error");
        const firstField = Object.keys(result.errors ?? {})[0];
        if (firstField) form.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
        return;
      }
      setStatus("sent"); setNotice(result.delivered === true ? "Your enquiry has been delivered. Thank you for getting in touch." : "Your enquiry has been submitted to the team’s email service. Thank you for getting in touch."); form.reset(); setCategory("");
    } catch { setStatus("error"); setNotice("Connection interrupted. Please try again when you’re back online."); }
  }}>
    <h2 className="eyebrow">Get in touch</h2>
    {!configured && <p className="form-unavailable">Prepare your enquiry, then open it in your email app to send. You can also email <a className="text-link" href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.</p>}
    <label htmlFor="name">Name<input id="name" name="name" autoComplete="name" placeholder="Name" required minLength={2} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} /></label>{errors.name && <p className="field-error" id="name-error">{errors.name[0]}</p>}
    <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" placeholder="Email" required maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} /></label>{errors.email && <p className="field-error" id="email-error">{errors.email[0]}</p>}
    <label htmlFor="type">Enquiry type<select id="type" name="type" value={category} onChange={event => setCategory(event.target.value)} required aria-invalid={!!errors.type}><option value="" disabled>Enquiry type</option>{enquiryTypes.map(type => <option key={type}>{type}</option>)}</select></label>
    {category === "Bookings" && <div className="adaptive-fields"><label htmlFor="eventDate">Event date (optional)<input id="eventDate" name="eventDate" type="date" aria-invalid={!!errors.eventDate} /></label><label htmlFor="location">Location (optional)<input id="location" name="location" maxLength={200} /></label><label htmlFor="budget">Budget (optional)<input id="budget" name="budget" maxLength={100} /></label></div>}
    {["Press", "Partnerships", "Sponsorship", "Collaboration"].includes(category) && <label htmlFor="organisation">Organisation / publication (optional)<input id="organisation" name="organisation" maxLength={200} /></label>}
    {errors.eventDate && <p className="field-error">{errors.eventDate[0]}</p>}
    <label htmlFor="message">Message<textarea id="message" name="message" placeholder="Message" required minLength={10} maxLength={5000} rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} /></label>{errors.message && <p className="field-error" id="message-error">{errors.message[0]}</p>}
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="consent"><input type="checkbox" name="consent" required /><span>I agree to my details being used to respond to this enquiry.</span></label>
    <p className="privacy-note">{configured ? "Your details are shared only with the team and its delivery provider to handle your enquiry." : "Your email app sends your enquiry directly to the team."} Please don’t include sensitive personal information.</p>
    <button className="button button-light" type="submit" disabled={(!configured && !fallbackEmail) || status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? "Sending…" : configured ? "Send message" : "Prepare email"}</button>
    {draftUrl && <a className="text-link" href={draftUrl}>Open enquiry in your email app</a>}
    <p className={`form-status ${status}`} role="status" aria-live="polite">{notice}</p>
  </form>;
}
