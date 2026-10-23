import { afterEach,expect,it,vi } from "vitest";
const fixture=vi.hoisted(()=>({owner:vi.fn()}));
vi.mock("@/lib/studio/server",()=>({studioOwner:fixture.owner}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
import {POST,PATCH} from "./route";
afterEach(()=>vi.clearAllMocks());
it("rejects cross-origin uploads and edits before accessing owner data",async()=>{
 for(const method of [POST,PATCH])expect((await method(new Request("https://site.example/api/studio/media",{method:"POST",headers:{origin:"https://other.example"}}))).status).toBe(403);
 expect(fixture.owner).not.toHaveBeenCalled();
});
it("requires an owner for upload and status changes",async()=>{
 fixture.owner.mockResolvedValue(null);
 for(const method of [POST,PATCH])expect((await method(new Request("https://site.example/api/studio/media",{method:"POST",headers:{origin:"https://site.example"}}))).status).toBe(401);
});
it("rejects oversized image bodies without a storage write",async()=>{
 fixture.owner.mockResolvedValue({user:{id:"owner"}});
 const response=await POST(new Request("https://site.example/api/studio/media",{method:"POST",headers:{origin:"https://site.example","content-type":"multipart/form-data; boundary=fixture","content-length":"9999999"},body:"bad"}));
 expect(response.status).toBe(413);
});
it("processes a real image and records a private draft without exposing originals",async()=>{
 const sharp=(await import("sharp")).default;
 const image=await sharp({create:{width:20,height:10,channels:3,background:"white"}}).png().toBuffer();
 const uploads:{bucket:string;path:string;bytes:Uint8Array}[]=[];
 const insert=vi.fn().mockResolvedValue({error:null});
 fixture.owner.mockResolvedValue({user:{id:"upload-owner"},client:{storage:{from:(bucket:string)=>({upload:vi.fn(async(path:string,bytes:Uint8Array)=>{uploads.push({bucket,path,bytes});return {error:null};}),remove:vi.fn()})},from:()=>({insert})}});
 const form=new FormData();form.set("file",new File([new Uint8Array(image)],"image.png",{type:"image/png"}));form.set("title","Approved photo");form.set("alt","An approved North Mob photo");form.set("rights","North Mob owns this photograph");
 const response=await POST(new Request("https://site.example/api/studio/media",{method:"POST",headers:{origin:"https://site.example"},body:form}));
 expect(response.status).toBe(201);
 expect(uploads.map(row=>row.bucket)).toEqual(["studio-originals","studio-images"]);
 expect((await sharp(uploads[1].bytes).metadata()).format).toBe("webp");
 expect(insert).toHaveBeenCalledWith(expect.objectContaining({status:"draft",width:20,height:10}));
});
it("removes uploaded objects when the database record fails",async()=>{
 const sharp=(await import("sharp")).default;
 const image=await sharp({create:{width:2,height:2,channels:3,background:"white"}}).png().toBuffer();
 const remove=vi.fn().mockResolvedValue({error:null});
 fixture.owner.mockResolvedValue({user:{id:"cleanup-owner"},client:{storage:{from:()=>({upload:vi.fn().mockResolvedValue({error:null}),remove})},from:()=>({insert:vi.fn().mockResolvedValue({error:{message:"database unavailable"}})})}});
 const form=new FormData();form.set("file",new File([new Uint8Array(image)],"image.png",{type:"image/png"}));form.set("title","Approved photo");form.set("alt","An approved photograph");form.set("rights","Approved by North Mob");
 const response=await POST(new Request("https://site.example/api/studio/media",{method:"POST",headers:{origin:"https://site.example"},body:form}));
 expect(response.status).toBe(502);expect(remove).toHaveBeenCalledTimes(2);
});
