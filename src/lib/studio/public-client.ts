import "server-only";
import { createClient } from "@supabase/supabase-js";
import { studioConfig } from "./config";
export function publicStudioClient(){
 const config=studioConfig();if(!config)return null;
 return createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store",signal:AbortSignal.timeout(5000)})}});
}
