import "server-only";
import { videoIds } from "@/config/videos";
import photoArchive from "@/config/visualz-photos.json";
import { publicStudioClient } from "./public-client";
export type GalleryPhoto={number:string|number;title:string;src:string;alt?:string;width?:number;height?:number;posterId?:string};
export type GalleryVideo={id:string;title:string;category:string};
export const approvedPhotos:GalleryPhoto[]=photoArchive.map(photo=>({number:photo.id,title:photo.title,src:photo.src,alt:photo.title,width:photo.width,height:photo.height,posterId:`poster-${photo.id}`}));
export async function publishedVisualz():Promise<{videos:GalleryVideo[];photos:GalleryPhoto[];unavailable:boolean}>{
 const client=publicStudioClient();if(!client)return {videos:videoIds.map(id=>({id,title:"",category:"music-video"})),photos:approvedPhotos,unavailable:false};
 try{
 const [videos,photos]=await Promise.all([client.from("visualz_videos").select("youtube_id,title,category").eq("status","published").order("featured",{ascending:false}).order("sort_order").order("id"),client.from("visualz_photos").select("id,title,local_path,media_id,media_assets(id,alt,status)").eq("status","published").order("sort_order").order("id")]);
 if(videos.error||photos.error||!videos.data||!photos.data)return {videos:[],photos:[],unavailable:true};
 const published:GalleryPhoto[]=photos.data.flatMap(row=>{
 const asset=Array.isArray(row.media_assets)?row.media_assets[0]:row.media_assets;
 if(row.media_id&&(!asset||asset.status!=="published"))return [];
 const known=approvedPhotos.find(photo=>photo.src===row.local_path);
 return [{...(known??{}),number:known?.number??row.id,title:row.title,src:row.local_path??`/api/media/${row.media_id}`,alt:asset?.alt??row.title}];});
 // Review newly supplied, approved release assets only in protected Vercel previews.
 // Production continues to use Studio's published rows; activate the release seed after deploying assets.
 if(process.env.VERCEL_ENV==="preview")for(const photo of photoArchive.filter(photo=>photo.new)){
  if(!published.some(item=>item.src===photo.src))published.push(approvedPhotos.find(item=>item.src===photo.src)!);
 }
 return {videos:videos.data.map(row=>({id:row.youtube_id,title:row.title,category:row.category})),photos:published,unavailable:false};
 }catch{return {videos:[],photos:[],unavailable:true};}
}
