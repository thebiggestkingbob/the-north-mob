import { expect,it } from "vitest";
import { merch,demoDelivery } from "@/config/merch";
import { addCart,cartSubtotal,changeQuantity,completeDemo,decodeShop,emptyShop,safeCart } from "./shop";
it("maps all 20 supplied images to 13 products and the prototype status distribution",()=>{
 expect(merch).toHaveLength(13);expect(merch.flatMap(p=>p.images)).toHaveLength(20);
 expect(new Set(merch.flatMap(p=>p.images.map(i=>i.original))).size).toBe(20);
 expect(merch.filter(p=>p.status==="available")).toHaveLength(9);expect(merch.filter(p=>p.status==="sold-out")).toHaveLength(2);expect(merch.filter(p=>p.status==="coming-soon")).toHaveLength(2);
});
it("rejects unavailable products, invalid variants, noninteger quantities and forged prices",()=>{
 const cart=safeCart([{productId:"mob-socks",variant:"",quantity:1},{productId:"mob-flag",variant:"black",quantity:1},{productId:"h4b-mug",variant:"red",quantity:1},{productId:"lineup-tee",variant:"",quantity:2,price:1},{productId:"mob-tote",variant:"",quantity:1.5}]);
 expect(cart).toEqual([{productId:"lineup-tee",variant:"",quantity:2}]);expect(cartSubtotal(cart)).toBe(59800);
});
it("caps combined variant stock and merges duplicates on storage restoration",()=>{
 expect(safeCart([{productId:"h4b-mug",variant:"black",quantity:10},{productId:"h4b-mug",variant:"white",quantity:10}]).reduce((n,line)=>n+line.quantity,0)).toBe(12);
 expect(safeCart([{productId:"lineup-tee",variant:"",quantity:1},{productId:"lineup-tee",variant:"",quantity:2}])[0].quantity).toBe(3);
 expect(decodeShop('broken')).toEqual(emptyShop);
});
it("updates quantities and creates a local order without any personal data",()=>{
 const line={productId:"h4b-mug",variant:"white",quantity:2};let state=addCart(emptyShop,line);
 state=changeQuantity(state,line,3);expect(cartSubtotal(state.cart)).toBe(44700);
 const result=completeDemo(state,"delivery")!;expect(result.order.total).toBe(44700+demoDelivery.delivery);expect(result.order.reference).toMatch(/^NM-[A-F0-9]{8}$/);expect(result.state.cart).toEqual([]);expect(result.state.purchased["h4b-mug"]).toBe(3);
 expect(safeCart([{...line,quantity:99}],result.state.purchased)[0].quantity).toBe(9);
 expect(decodeShop(JSON.stringify({...result.state,email:"private@example.com",address:"Private street"}))).not.toHaveProperty("email");
 expect(JSON.stringify(result.order)).not.toMatch(/email|phone|street|customer/);
 expect(completeDemo(emptyShop,"collection")).toBeNull();
});
it("rejects blank customer data and malformed delivery details",async()=>{
 const {customerSchema,deliverySchema}=await import("./shop");
 expect(customerSchema.safeParse({firstName:"  ",lastName:"Visitor",email:"demo@example.com",phone:"(((((((((("}).success).toBe(false);
 expect(customerSchema.safeParse({firstName:"Demo",lastName:"Visitor",email:"demo@example.com",phone:"+27 71 234 5678"}).success).toBe(true);
 expect(deliverySchema.safeParse({street:"1 Demo Street",suburb:"Demo",city:"Pretoria",province:"Gauteng",postal:"12345"}).success).toBe(false);
});
it("keeps cart lines in place when changing quantities",()=>{
 const first={productId:"lineup-tee",variant:"",quantity:1},second={productId:"mob-tote",variant:"",quantity:1};
 const state=addCart(addCart(emptyShop,first),second);
 expect(changeQuantity(state,first,2).cart.map(line=>line.productId)).toEqual(["lineup-tee","mob-tote"]);
});
it("restores sold-out saves and pre-order selections without admitting unavailable cart lines",()=>{
 const state=decodeShop(JSON.stringify({...emptyShop,saved:["mob-socks","mob-socks","invalid"],preorders:["portrait-tank","invalid","portrait-tank"],cart:[{productId:"mob-socks",variant:"",quantity:1}]}));
 expect(state.saved).toEqual(["mob-socks"]);expect(state.preorders).toEqual(["portrait-tank"]);expect(state.cart).toEqual([]);
});
