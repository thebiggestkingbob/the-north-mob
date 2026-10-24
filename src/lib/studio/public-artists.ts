import "server-only";
import { createClient } from "@supabase/supabase-js";
import { artists } from "@/config/content";
import { studioConfig } from "./config";
import type { PublicArtist } from "./artists";
export async function publishedArtists():Promise<{artists:PublicArtist[];unavailable:boolean}>{
 const config=studioConfig();
 if(!config)return {artists:artists.map(artist=>({...artist,bio:""})),unavailable:false};
 try{
 const client=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store",signal:AbortSignal.timeout(5000)})}});
 const {data,error}=await client.from("artist_profiles").select("slug,name,tagline,bio,portrait,position").eq("status","published").order("sort_order").order("id");
 return error||!data?{artists:[],unavailable:true}:{artists:data.map(artist=>{const approved=artists.find(item=>item.slug===artist.slug);const previous=approved?.portrait.replace("-2026.webp",".webp");return approved&&artist.portrait===previous?{...artist,portrait:approved.portrait,position:approved.position}:artist;}),unavailable:false};
 }catch{return {artists:[],unavailable:true};}
}
