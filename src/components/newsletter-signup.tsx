"use client";
import { useState } from "react";
export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");
  return <form className="newsletter-signup" aria-labelledby="newsletter-heading" onSubmit={async event => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending"); setNotice("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("newsletter-email"), consent: data.get("newsletter-consent") === "on", website: data.get("newsletter-website") }) });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) { setStatus("error"); setNotice(result.message ?? "We couldn’t complete your signup. Please try again."); return; }
      setStatus("success"); setNotice(result.message); form.reset();
    } catch { setStatus("error"); setNotice("Connection interrupted. Please try again when you’re back online."); }
  }}>
    <h2 className="eyebrow" id="newsletter-heading">Get North Mob updates</h2>
    <div className="newsletter-fields"><label htmlFor="newsletter-email">Email<input id="newsletter-email" name="newsletter-email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" /></label><button type="submit" className="button" disabled={status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? "Joining…" : "Join the mailing list"}</button></div>
    <label className="newsletter-consent"><input type="checkbox" name="newsletter-consent" required /><span>I agree to receive THE NORTH MOB updates by email. Unsubscribe in any update.</span></label>
    <div className="newsletter-honeypot" aria-hidden="true"><label>Website<input name="newsletter-website" tabIndex={-1} autoComplete="off" /></label></div>
    <p className="source-note">Your email is stored with Brevo to send the updates you request.</p>
    {notice && <p className="form-status" role="status" aria-live="polite">{notice}</p>}
  </form>;
}
