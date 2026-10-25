import { afterEach,expect,it,vi } from "vitest";
vi.mock("server-only",()=>({}));
const fixture=vi.hoisted(()=>({client:vi.fn()}));
vi.mock("./public-client",()=>({publicStudioClient:fixture.client}));
import { publishedMusic } from "./public-music";
import { publishedVisualz } from "./public-visualz";
afterEach(()=>vi.clearAllMocks());
function client(results:Record<string,{data:unknown;error:unknown}>){return {from:(table:string)=>{const query={select:()=>query,eq:()=>query,order:()=>query,then:(resolve:(value:unknown)=>unknown)=>Promise.resolve(resolve(results[table]))};return query;}};}
it("preserves the approved bundled content only before database activation",async()=>{
 fixture.client.mockReturnValue(null);
 expect((await publishedMusic()).tracks).toHaveLength(13);
 const visualz=await publishedVisualz();expect(visualz.videos).toHaveLength(6);expect(visualz.photos).toHaveLength(25);
});
it("does not resurrect archived static content during a connected database outage",async()=>{
 fixture.client.mockReturnValue(client({music_releases:{data:null,error:{message:"unavailable"}},music_tracks:{data:null,error:{message:"unavailable"}},visualz_videos:{data:null,error:{message:"unavailable"}},visualz_photos:{data:null,error:{message:"unavailable"}}}));
 expect(await publishedMusic()).toEqual({releases:[],tracks:[],unavailable:true});
 expect(await publishedVisualz()).toEqual({videos:[],photos:[],unavailable:true});
});
it("suppresses tracks whose release is not in the published result",async()=>{
 fixture.client.mockReturnValue(client({music_releases:{data:[],error:null},music_tracks:{data:[{catalogue_id:"hidden",release_slug:"archived"}],error:null}}));
 expect((await publishedMusic()).tracks).toEqual([]);
});
it("keeps draft or archived uploaded images out of the public photo archive",async()=>{
 fixture.client.mockReturnValue(client({visualz_videos:{data:[{youtube_id:"on_eg9HLysA",title:"Verified",category:"music-video"}],error:null},visualz_photos:{data:[{id:"photo",title:"Photo",media_id:"asset",local_path:null,media_assets:{id:"asset",alt:"Private",status:"archived"}}],error:null}}));
 const result=await publishedVisualz();expect(result.photos).toEqual([]);expect(result.videos[0].id).toBe("on_eg9HLysA");
});
it("stages the sixteen newly supplied photos only in protected previews, while production follows published Studio rows",async()=>{
 const {vi:mock}=await import("vitest");fixture.client.mockReturnValue(client({visualz_videos:{data:[],error:null},visualz_photos:{data:[],error:null}}));
 try{mock.stubEnv("VERCEL_ENV","production");expect((await publishedVisualz()).photos).toHaveLength(0);mock.stubEnv("VERCEL_ENV","preview");const preview=await publishedVisualz();expect(preview.photos).toHaveLength(16);expect(preview.photos.every(photo=>photo.src.startsWith("/assets/visualz/"))).toBe(true);}finally{mock.unstubAllEnvs();}
});
