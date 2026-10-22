import type { Metadata } from "next";
import Image from "next/image";
import { brevoConfigured } from "@/lib/brevo";
import { bookingEmail } from "@/config/content";
import { ContactForm } from "@/components/contact-form";
export const metadata: Metadata = { title: "Business" };
export default function Business() {
  const configured = brevoConfigured() || !!(process.env.CONTACT_DELIVERY_URL?.startsWith("https://") && process.env.CONTACT_DELIVERY_TOKEN);
  return <main id="main" className="page business-page"><div className="editorial-heading" data-reveal><div><p className="eyebrow">Bookings<br />Press<br />Partnerships</p><h1 tabIndex={-1}>BUSINESS<br />IS PERSONAL</h1></div><p className="eyebrow heading-aside">Music<br />Brand partnerships<br />Collaborations<br />The next chapter.</p></div><section className="business-grid"><div className="business-photo" data-reveal><Image src="/assets/group_wide.jpeg" alt="THE NORTH MOB collective on location in Pretoria" fill priority sizes="(max-width: 750px) 100vw, 55vw" /></div><div data-reveal><ContactForm configured={configured} fallbackEmail={bookingEmail} /></div></section></main>;
}
