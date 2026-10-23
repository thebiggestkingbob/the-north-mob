import {afterEach,expect,it,vi} from "vitest";
vi.mock("server-only",()=>({}));
import {GET} from "./route";
import {videoIds} from "@/config/videos";
afterEach(()=>vi.unstubAllGlobals());
it("requests only the six supplied IDs and keeps source order",async()=>{
 const fetcher=vi.fn(async(input:URL)=>{const target=new URL(input.searchParams.get("url")!);return Response.json({title:`YouTube title ${target.searchParams.get("v")}`});});vi.stubGlobal("fetch",fetcher);
 const response=await GET();const result=await response.json();expect(result.videos.map((video:{id:string})=>video.id)).toEqual([...videoIds]);expect(fetcher).toHaveBeenCalledTimes(6);expect(result.videos.every((video:{title:string})=>video.title.startsWith("YouTube title"))).toBe(true);
});
it("does not invent titles when YouTube is restricted or unavailable",async()=>{
 vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(null,{status:403})));const response=await GET();expect((await response.json()).videos).toEqual(videoIds.map(id=>({id,title:null})));expect(response.headers.get("cache-control")).toContain("s-maxage=60");
});
it("handles network errors without removing videos",async()=>{
 vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error("Unavailable")));const result=await(await GET()).json();expect(result.videos).toHaveLength(6);expect(result.videos.every((video:{title:null})=>video.title===null)).toBe(true);
});
