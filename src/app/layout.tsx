import type { Metadata } from "next";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import "./cinematic.css";
import "./refinements.css";
import { SoundtrackProvider } from "@/components/soundtrack";
import { SiteShell } from "@/components/site-shell";

const siteUrl = process.env.SITE_URL;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || "http://localhost:3000"),
  title: { default: "THE NORTH MOB", template: "%s — THE NORTH MOB" },
  description: "The official home of THE NORTH MOB. Music, visuals, the collective and live shows. Pretoria, South Africa.",
  openGraph: { title: "THE NORTH MOB", description: "Sound. Vision. A movement.", images: [{ url: "/assets/group_wide.jpeg", alt: "THE NORTH MOB collective" }] },
  robots: siteUrl ? { index: true, follow: true } : { index: false, follow: false },
};
import { publishedMusic } from "@/lib/studio/public-music";
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const music=await publishedMusic();
  return <html lang="en"><body><SoundtrackProvider initialTracks={music.tracks}><SiteShell>{children}</SiteShell></SoundtrackProvider></body></html>;
}
