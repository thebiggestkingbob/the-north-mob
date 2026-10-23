import {describe,it,expect} from "vitest";
import {artistSchema} from "./artists";
const record={slug:"trophy",name:"Trophy",tagline:"ICON.",bio:"",portrait:"/assets/artists/trophy.webp",position:"43% 65%",sort_order:0,status:"draft"};
describe("artist publishing validation",()=>{
 it("accepts approved metadata",()=>expect(artistSchema.safeParse(record).success).toBe(true));
 it("rejects traversal and remote portraits",()=>{for(const portrait of ["/assets/../private.png","https://example.com/photo.jpg"]){expect(artistSchema.safeParse({...record,portrait}).success).toBe(false);}});
 it("requires a revision when editing",()=>expect(artistSchema.safeParse({...record,id:"10000000-0000-4000-8000-000000000001"}).success).toBe(false));
 it("rejects extra fields and invalid publication states",()=>{expect(artistSchema.safeParse({...record,role:"owner"}).success).toBe(false);expect(artistSchema.safeParse({...record,status:"live"}).success).toBe(false);});
});
