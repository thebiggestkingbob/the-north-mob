import { publishedArtists } from "@/lib/studio/public-artists";
import type { Metadata } from "next";
import Image from "next/image";
import { ArtistProfiles } from "@/components/artist-profiles";
import { collectiveBio } from "@/config/content";
export const metadata: Metadata = { title: "The Mob" };
export default async function TheMob() {
  const result = await publishedArtists();
  return <main id="main" className="page mob-page"><section className="collective-story" data-scroll-reveal><div><p className="eyebrow">A collective. A sound. A movement.</p><blockquote>{collectiveBio}</blockquote><p className="source-note">From THE NORTH MOB’s artist-authored Spotify biography.</p></div><Image src="/assets/group_wide.jpeg" alt="The collective photographed together" width={1152} height={1536} sizes="(max-width: 700px) 100vw, 32vw" /></section><div className="editorial-heading" data-reveal><div><p className="eyebrow">Four minds<br />One movement</p><h1 tabIndex={-1}>THE MOB</h1></div><p className="eyebrow heading-aside">Different perspectives.<br />Same direction.<br />The North Mob.</p></div>{result.unavailable ? <p role="status">Artist profiles are temporarily unavailable. Please retry shortly.</p> : <ArtistProfiles artists={result.artists} />}</main>;
}
