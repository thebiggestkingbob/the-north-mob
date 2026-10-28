import { NextResponse } from "next/server";
import { merch } from "@/config/merch";
import { publishedMusic } from "@/lib/studio/public-music";
import { publishedEvents } from "@/lib/studio/public-events";
import { publishedVisualz } from "@/lib/studio/public-visualz";
export const dynamic = "force-dynamic";
export async function GET(){
 const [music,live,visualz]=await Promise.all([publishedMusic(),publishedEvents(),publishedVisualz()]);
 const now=new Date().toLocaleDateString("en-CA",{timeZone:"Africa/Johannesburg"});
 return NextResponse.json({
  shop:merch.map(p=>({name:p.name,description:p.description,price:p.price,status:p.status,image:p.images[0]?.src,href:"/shop"})),
  studio:music.tracks.filter(t=>music.releases.some(r=>r.slug===t.releaseId)).map(t=>({name:t.title,description:t.credits+" · "+t.duration,image:t.cover??music.releases.find(r=>r.slug===t.releaseId)?.cover,href:t.source,spotify:t.uri})),
  album:music.releases.map(r=>({name:r.title,image:r.cover,spotify:r.spotify_uri})),
  cinema:visualz.videos.map(v=>({name:v.title,description:"Official music video",image:"https://i.ytimg.com/vi/"+v.id+"/hqdefault.jpg",href:"https://www.youtube.com/watch?v="+v.id,videoId:v.id})),
  museum:visualz.photos.map(p=>({name:p.title,description:"THE NORTH MOB archive",image:p.src})),
  live:live.events.filter(e=>e.date>=now).map(e=>({name:e.name,description:e.date+" · "+e.venue,href:e.ticketUrl})),
  unavailable:{studio:music.unavailable,cinema:visualz.unavailable,museum:visualz.unavailable,live:live.unavailable}
 },{headers:{"Cache-Control":"no-store"}});
}
