import type { Metadata } from "next";
import { PhotoArchive } from "@/components/photo-archive";
import { VideoGallery } from "@/components/video-gallery";
export const metadata: Metadata = { title: "Visualz" };
export default function Visuals() {
  const nativeVideoUrl = process.env.NATIVE_VIDEO_URL;
  return <main id="main" className="page visuals-page"><div className="editorial-heading" data-reveal><div><p className="eyebrow">Moving image<br />Photography<br />The collective</p><h1 tabIndex={-1}>VISUALZ</h1></div><p className="eyebrow heading-aside">More than music.<br />A visual movement.</p></div><VideoGallery nativeVideoUrl={nativeVideoUrl && /^https:\/\//.test(nativeVideoUrl) ? nativeVideoUrl : undefined} captionsUrl={process.env.NATIVE_VIDEO_CAPTIONS_URL} /><PhotoArchive /></main>;
}
