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
 const publicTracks = tracks.data.filter(track=>visible.has(track.release_slug)).map(track=>{
  // A Studio override wins. Fill only missing IDs for exact approved song matches.
  const approved=allTracks.find(item=>item.id===track.catalogue_id&&item.releaseId===track.release_slug&&item.title===track.title);
  const uri=track.spotify_uri??approved?.uri;
  const cover=releases.data.find(release=>release.slug===track.release_slug)?.cover;
  return {id:track.catalogue_id,releaseId:track.release_slug,title:track.title,artist:track.artist,credits:track.credits,duration:track.duration,source:track.source,...(uri?{uri}:{}),...(cover?{cover}:{})};
 });
 return {releases:releases.data,tracks:publicTracks,unavailable:false};
 }catch{return {releases:[],tracks:[],unavailable:true};}
});
