"use client";
import { useState } from "react";
import { enquiryTypes } from "@/lib/contact";
export function ContactForm({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  return <form className="contact-form" onSubmit={async (event) => {
    event.preventDefault();
    if (status === "sending" || !configured) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setErrors({}); setStatus("sending"); setNotice("");
    try {
      const response = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(data), consent: data.get("consent") === "on" }) });
      const result = await response.json();
      if (!response.ok || result.delivered !== true) {
        setErrors(result.errors ?? {}); setNotice(result.message ?? "We couldn’t send your enquiry. Please try again."); setStatus("error");
        const firstField = Object.keys(result.errors ?? {})[0];
        if (firstField) form.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
        return;
      }
      setStatus("sent"); setNotice("Your enquiry has been delivered. Thank you for getting in touch."); form.reset();
    } catch { setStatus("error"); setNotice("Connection interrupted. Please try again when you’re back online."); }
  }}>
    <h2 className="eyebrow">Get in touch</h2>
    {!configured && <p className="form-unavailable">Enquiries are not open through this form yet. Connect with the collective on Instagram below.</p>}
    <label htmlFor="name">Name<input id="name" name="name" autoComplete="name" placeholder="Name" required minLength={2} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} /></label>{errors.name && <p className="field-error" id="name-error">{errors.name[0]}</p>}
    <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" placeholder="Email" required maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} /></label>{errors.email && <p className="field-error" id="email-error">{errors.email[0]}</p>}
    <label htmlFor="type">Enquiry type<select id="type" name="type" defaultValue="" required aria-invalid={!!errors.type}><option value="" disabled>Enquiry type</option>{enquiryTypes.map(type => <option key={type}>{type}</option>)}</select></label>
    <label htmlFor="message">Message<textarea id="message" name="message" placeholder="Message" required minLength={10} maxLength={5000} rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} /></label>{errors.message && <p className="field-error" id="message-error">{errors.message[0]}</p>}
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="consent"><input type="checkbox" name="consent" required /><span>I agree to my details being used to respond to this enquiry.</span></label>
    <p className="privacy-note">Your details are shared only with the team and its delivery provider to handle your enquiry. Please don’t include sensitive personal information.</p>
    <button className="button button-light" type="submit" disabled={!configured || status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}<span>→</span></button>
    <p className={`form-status ${status}`} role="status" aria-live="polite">{notice}</p>
  </form>;
}
