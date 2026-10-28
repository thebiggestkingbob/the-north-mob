import { publishedVisualz } from '@/lib/studio/public-visualz';
import { PhotoArchive } from '@/components/photo-archive';
import { VideoGallery } from '@/components/video-gallery';
export default async function WorldVisualz({searchParams}:{searchParams:Promise<{mode?:string}>}) {
 const {mode}=await searchParams;
 const {videos,photos,unavailable}=await publishedVisualz();
 return <main className="page visuals-page"><h1>{mode==='museum'?'MOB MUSEUM':'VISUALS CINEMA'}</h1>{unavailable?<p>Published media is temporarily unavailable.</p>:mode==='museum'?<PhotoArchive photos={photos}/>:<VideoGallery videos={videos}/>}</main>;
}
