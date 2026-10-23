import "server-only";
import { cache } from "react";
import { album,allTracks,type CatalogueTrack } from "@/config/catalogue";
import { publicStudioClient } from "./public-client";
export type PublicRelease={slug:string;title:string;artist:string;year:string|null;cover:string|null;kind:"album"|"reference";spotify_uri:string|null;source:string};
export const publishedMusic=cache(async function publishedMusic():Promise<{releases:PublicRelease[];tracks:CatalogueTrack[];unavailable:boolean}>{
 const client=publicStudioClient();if(!client)return {releases:[{slug:album.id,title:album.title,artist:album.artist,year:album.year,kind:"album",cover:album.cover,spotify_uri:album.uri,source:album.source}],tracks:allTracks,unavailable:false};
 try{
 const [releases,tracks]=await Promise.all([client.from("music_releases").select("slug,title,artist,year,cover,kind,spotify_uri,source").eq("status","published").order("created_at"),client.from("music_tracks").select("catalogue_id,release_slug,title,artist,credits,duration,spotify_uri,source").eq("status","published").order("sort_order").order("id")]);
 if(releases.error||tracks.error||!releases.data||!tracks.data)return {releases:[],tracks:[],unavailable:true};
 const visible=new Set(releases.data.map(r=>r.slug));
 return {releases:releases.data,tracks:tracks.data.filter(t=>visible.has(t.release_slug)).map(t=>({id:t.catalogue_id,releaseId:t.release_slug,title:t.title,artist:t.artist,credits:t.credits,duration:t.duration,source:t.source,...(t.spotify_uri?{uri:t.spotify_uri}:{}),...(releases.data.find(r=>r.slug===t.release_slug)?.cover?{cover:releases.data.find(r=>r.slug===t.release_slug)!.cover!}:{})})),unavailable:false};
 }catch{return {releases:[],tracks:[],unavailable:true};}
});
