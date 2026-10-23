import { expect,it } from "vitest";
import { imageMime,mediaDetails,photoSchema,videoSchema } from "./media";
it("rejects executable or mislabeled image contents",()=>{
 expect(imageMime(Buffer.from("<svg onload=alert(1)></svg>"))).toBeNull();
 expect(imageMime(Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]))).toBe("image/png");
 expect(mediaDetails.safeParse({title:"Photo",alt:"Approved photo",rights:""}).success).toBe(false);
});
it("requires exactly one safe photo source and a version for edits",()=>{
 const fields={title:"Approved photograph",album:"Mob Ties",status:"draft",sort_order:0,local_path:"/assets/mob-ties/mob-ties-05.webp",media_id:null};
 expect(photoSchema.safeParse(fields).success).toBe(true);
 expect(photoSchema.safeParse({...fields,local_path:"/assets/../private.jpg"}).success).toBe(false);
 expect(photoSchema.safeParse({...fields,media_id:"00000000-0000-4000-8000-000000000001"}).success).toBe(false);
 expect(photoSchema.safeParse({...fields,id:"00000000-0000-4000-8000-000000000001"}).success).toBe(false);
});
it("accepts YouTube IDs only, with bounded categories and order",()=>{
 const fields={youtube_id:"on_eg9HLysA",title:"",category:"music-video",sort_order:0,featured:false,status:"draft"};
 expect(videoSchema.safeParse(fields).success).toBe(true);
 expect(videoSchema.safeParse({...fields,youtube_id:"https://evil.example"}).success).toBe(false);
 expect(videoSchema.safeParse({...fields,sort_order:-1}).success).toBe(false);
});
