import { redirect } from "next/navigation";
import { studioConfig } from "@/lib/studio/config";
import { studioOwner } from "@/lib/studio/server";
export default async function StudioLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = !!studioConfig();
  if (configured && await studioOwner()) redirect("/studio");
  const { error } = await searchParams;
  return <main id="main" className="studio-login"><p className="eyebrow">Private / Owner access</p><h1 tabIndex={-1}>STUDIO</h1>{configured ? <form className="contact-form" action="/api/studio/session" method="post"><label htmlFor="studio-email">Email<input id="studio-email" type="email" name="email" autoComplete="username" required maxLength={254} /></label><label htmlFor="studio-password">Password<input id="studio-password" type="password" name="password" autoComplete="current-password" required maxLength={1024} /></label>{error && <p role="alert">Unable to sign in. Check your credentials and owner access.</p>}<button className="button button-light">Sign in<span>→</span></button><p className="privacy-note">Access is limited to the designated owner. Public registration is unavailable.</p></form> : <p className="body-copy" role="status">Studio is not connected yet. Owner access will become available after the dedicated North Mob database and authentication are configured.</p>}</main>;
}
