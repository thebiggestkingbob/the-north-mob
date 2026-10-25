import { expect,it } from "vitest";
import { merch,posterProducts } from "@/config/merch";
import { productContent,orderContent } from "./shop-sharing";
it("always shares the public production domain instead of the current preview origin",()=>{
 const product=productContent(merch[1]);expect(new URL(product.url).origin).toBe("https://the-north-mob.vercel.app");expect(product.url).toContain('#product-lineup-tee');
 const poster=productContent(posterProducts[0],"a1");expect(poster.url).toBe(`https://the-north-mob.vercel.app/visuals#photo-${posterProducts[0].photoId}:a1`);expect(poster.text).toContain("A1");
 const receipt=orderContent({reference:"NM-ABCDEF12",createdAt:"2026-10-25",items:[],subtotal:0,fee:0,total:0,fulfilment:"collection"});expect(receipt.url).toBe("https://the-north-mob.vercel.app/shop");
});
