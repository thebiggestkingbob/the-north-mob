import { expect,it } from "vitest";
import { merch,demoDelivery } from "@/config/merch";
import { addCart,cartSubtotal,changeQuantity,completeDemo,decodeShop,emptyShop,safeCart } from "./shop";
it("maps all 32 supplied images to 18 products and the approved status distribution",()=>{
 expect(merch).toHaveLength(18);expect(merch.flatMap(p=>p.images)).toHaveLength(32);
 expect(new Set(merch.flatMap(p=>p.images.map(i=>i.original))).size).toBe(32);
 expect(merch.filter(p=>p.status==="available")).toHaveLength(9);expect(merch.filter(p=>p.status==="sold-out")).toHaveLength(2);expect(merch.filter(p=>p.status==="coming-soon")).toHaveLength(7);
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
 const state=decodeShop(JSON.stringify({...emptyShop,wishlist:["mob-socks","mob-socks","invalid"],preorders:["portrait-tank","invalid","portrait-tank"],cart:[{productId:"mob-socks",variant:"",quantity:1}]}));
 expect(state.wishlist).toEqual(["mob-socks"]);expect(state.preorders).toEqual(["portrait-tank"]);expect(state.cart).toEqual([]);
});
it("prices the chain pair and singles independently without trusting client amounts",async()=>{
 const {findMerch,productPrice}=await import("@/config/merch");const chains=findMerch("mob-pendant-chains")!;
 expect(productPrice(chains,"pair")).toBe(49900);expect(productPrice(chains,"h4b")).toBe(29900);expect(productPrice(chains,"mob")).toBe(29900);
 expect(cartSubtotal([{productId:chains.id,variant:"pair",quantity:1},{productId:chains.id,variant:"mob",quantity:2}])).toBe(109700);
 expect(safeCart([{productId:chains.id,variant:"pair",quantity:1}])).toEqual([]);
});
it("retains separate pre-order chain variants and legacy product selections across reloads",async()=>{
 const {togglePreorder,preorderEntries}=await import("./shop");
 let state=togglePreorder({...emptyShop,preorders:["mob-cap"]},{productId:"mob-pendant-chains",variant:"pair"});state=togglePreorder(state,{productId:"mob-pendant-chains",variant:"h4b"});
 state=decodeShop(JSON.stringify({...state,preorderLines:[...state.preorderLines!,{productId:"mob-pendant-chains",variant:"invalid",price:1}]}));
 expect(preorderEntries(state)).toEqual([{productId:"mob-cap",variant:""},{productId:"mob-pendant-chains",variant:"pair"},{productId:"mob-pendant-chains",variant:"h4b"}]);
 state=togglePreorder(state,{productId:"mob-pendant-chains",variant:"pair"});expect(preorderEntries(state)).toHaveLength(2);expect(preorderEntries(state).some(line=>line.variant==="h4b")).toBe(true);
});
it("migrates legacy saved items into a wishlist without losing selections",()=>{
 const restored=decodeShop(JSON.stringify({version:1,saved:["lineup-tee","mob-socks","lineup-tee","missing"],cart:[],orders:[],purchased:{}}));
 expect(restored.wishlist).toEqual(["lineup-tee","mob-socks"]);expect(restored).not.toHaveProperty("saved");
});
it("freezes new receipt prices and retains orders independently of current stock",()=>{
 const stickers=merch.find(item=>item.id==="mob-stickers")!,price=stickers.price,status=stickers.status;
 const result=completeDemo(addCart(emptyShop,{productId:stickers.id,variant:"",quantity:2}),"collection",true)!;
 expect(result.order.items[0].unitPrice).toBe(9900);expect(result.order.gift).toBe(true);
 try{stickers.price=19900;stickers.status="sold-out";const restored=decodeShop(JSON.stringify(result.state));expect(restored.orders).toHaveLength(1);expect(restored.orders[0].items[0].quantity).toBe(2);expect(restored.orders[0].items[0].unitPrice).toBe(9900);expect(restored.orders[0].total).toBe(19800);}finally{stickers.price=price;stickers.status=status;}
});
it("keeps legacy order totals rather than replacing them with today's sticker price",()=>{
 const order={reference:"NM-DEMO-ABCDEF12",createdAt:"2026-10-24T12:00:00Z",items:[{productId:"mob-stickers",variant:"",quantity:1}],subtotal:7900,fee:0,total:7900,fulfilment:"collection"};
 const restored=decodeShop(JSON.stringify({...emptyShop,orders:[order]}));expect(restored.orders[0].total).toBe(7900);expect(restored.orders[0].items[0].unitPrice).toBeUndefined();expect(restored.orders[0].items[0].name).toBe("Mob Sticker Sheet");
});
it("rejects malformed imported receipts and invalid gift notes",async()=>{
 const {giftSchema}=await import("./shop");expect(giftSchema.safeParse({recipientName:" ",message:"Hi"}).success).toBe(false);expect(giftSchema.safeParse({recipientName:"Friend",message:"x".repeat(501)}).success).toBe(false);
 expect(decodeShop(JSON.stringify({...emptyShop,orders:[{reference:"NM-ABCDEF12",createdAt:"2026-10-24",items:[{productId:"lineup-tee",variant:"",quantity:-2}],subtotal:29900,fee:0,total:29900,fulfilment:"collection"}]})).orders).toEqual([]);
});
