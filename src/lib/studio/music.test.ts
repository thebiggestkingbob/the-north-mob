import { expect,it } from "vitest";
import { releaseSchema,trackSchema } from "./music";
const release={slug:"here-4-business",title:"Here 4 Business",artist:"THE NORTHMOB.",year:"2026",cover:"/assets/h4b-album-cover.jpg",kind:"album",spotify_uri:"spotify:album:3f1HZdfe4bPLqQOu5sfmvO",source:"https://open.spotify.com/album/3f1HZdfe4bPLqQOu5sfmvO",status:"draft"};
it("accepts verified source references without inventing artwork or year",()=>{
 expect(releaseSchema.safeParse({...release,kind:"reference",year:null,cover:null}).success).toBe(true);
 expect(releaseSchema.safeParse({...release,year:null}).success).toBe(false);
});
it("rejects arbitrary URLs, script artwork, invalid track times and stale edits",()=>{
 expect(releaseSchema.safeParse({...release,cover:"javascript:alert(1)"}).success).toBe(false);
 expect(releaseSchema.safeParse({...release,source:"https://evil.example"}).success).toBe(false);
 const track={catalogue_id:"h4b-1",release_slug:"here-4-business",title:"Verified",artist:"THE NORTHMOB.",credits:"",duration:"03:02",spotify_uri:null,source:release.source,sort_order:0,status:"draft"};
 expect(trackSchema.safeParse(track).success).toBe(true);
 expect(trackSchema.safeParse({...track,duration:"03:99"}).success).toBe(false);
 expect(trackSchema.safeParse({...track,id:"00000000-0000-4000-8000-000000000001"}).success).toBe(false);
});
