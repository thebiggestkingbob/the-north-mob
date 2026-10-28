import '../../visuals/visuals.css';
import { publishedVisualz } from '@/lib/studio/public-visualz';
import { PhotoArchive } from '@/components/photo-archive';
import { VideoGallery } from '@/components/video-gallery';
export default async function WorldVisualz({searchParams}:{searchParams:Promise<{mode?:string}>}) {
 const {mode}=await searchParams;
 const {videos,photos,unavailable}=await publishedVisualz();
 return <main className="page visuals-page"><a href="/world" style={{display:"inline-block",padding:"9px 13px",background:"#fff",color:"#000",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:20}}>BACK TO WORLD</a><h1>{mode==='museum'?'MOB MUSEUM':'VISUALS CINEMA'}</h1>{unavailable?<p>Published media is temporarily unavailable.</p>:mode==='museum'?<PhotoArchive photos={photos}/>:<VideoGallery videos={videos}/>}</main>;
}
