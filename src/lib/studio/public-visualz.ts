import "server-only";
import { videoIds } from "@/config/videos";
import { publicStudioClient } from "./public-client";
export type GalleryPhoto={number:string|number;title:string;src:string;alt?:string};
export type GalleryVideo={id:string;title:string;category:string};
export const approvedPhotos:GalleryPhoto[]=[5,9,11,13,22,26,30,31,32].map(number=>({number,title:`Mob Ties / Photograph ${String(number).padStart(2,"0")}`,src:`/assets/mob-ties/mob-ties-${String(number).padStart(2,"0")}.webp`}));
export async function publishedVisualz():Promise<{videos:GalleryVideo[];photos:GalleryPhoto[];unavailable:boolean}>{
 const client=publicStudioClient();if(!client)return {videos:videoIds.map(id=>({id,title:"",category:"music-video"})),photos:approvedPhotos,unavailable:false};
 try{
 const [videos,photos]=await Promise.all([client.from("visualz_videos").select("youtube_id,title,category").eq("status","published").order("featured",{ascending:false}).order("sort_order").order("id"),client.from("visualz_photos").select("id,title,local_path,media_id,media_assets(id,alt,status)").eq("status","published").order("sort_order").order("id")]);
 if(videos.error||photos.error||!videos.data||!photos.data)return {videos:[],photos:[],unavailable:true};
 return {videos:videos.data.map(row=>({id:row.youtube_id,title:row.title,category:row.category})),photos:photos.data.flatMap(row=>{
 const asset=Array.isArray(row.media_assets)?row.media_assets[0]:row.media_assets;
 if(row.media_id&&(!asset||asset.status!=="published"))return [];
 return [{number:row.id,title:row.title,src:row.local_path??`/api/media/${row.media_id}`,alt:asset?.alt??row.title}];}),unavailable:false};
 }catch{return {videos:[],photos:[],unavailable:true};}
}
