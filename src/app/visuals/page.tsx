import "./visuals.css";
import type { Metadata } from "next";
import { PhotoArchive } from "@/components/photo-archive";
import { VideoGallery } from "@/components/video-gallery";
export const metadata: Metadata = { title: "Visualz" };
import { publishedVisualz } from "@/lib/studio/public-visualz";
export default async function Visuals() {
  const {videos,photos,unavailable}=await publishedVisualz();
  return <main id="main" className="page visuals-page"><div className="editorial-heading" data-reveal><div><p className="eyebrow">Moving image<br />Photography<br />The collective</p><h1 tabIndex={-1}>VISUALZ</h1></div><p className="eyebrow heading-aside">More than music.<br />A visual movement.</p></div>{unavailable?<p role="status">Visualz is temporarily unavailable. Please try again shortly.</p>:<><VideoGallery videos={videos}/><PhotoArchive photos={photos}/>{!videos.length&&!photos.length&&<p>No media has been published yet.</p>}</>}</main>;
}
