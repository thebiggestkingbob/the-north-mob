import { findMerch,money,productPrice,type MerchProduct } from "@/config/merch";
import { publicSiteOrigin } from "@/config/site";
import type { DemoOrder } from "./shop";
export type ShareContent={title:string;text:string;url:string;lines:string[];image?:string};
export function productContent(product:MerchProduct,variant=""):ShareContent{
 const option=product.variants.find(item=>item.id===variant);const url=new URL(productPath(product,variant),publicSiteOrigin).href;
 const title=`${product.name}${option?` / ${option.label}`:""}`;
 const lines=[title,money(productPrice(product,variant)),...(product.limitedEdition?["Limited Edition"]:[]),product.description,url];
 return {title,text:`THE NORTH MOB\n${lines.join("\n")}`,url,lines,image:product.images[option?.image??0].src};
}
export function orderContent(order:DemoOrder):ShareContent{
 const title=`${order.gift?"Gift order":"Order"} ${order.reference.replace("NM-DEMO-","NM-")}`;
 const lines=[title,new Date(order.createdAt).toLocaleDateString("en-ZA",{timeZone:"Africa/Johannesburg"}),...order.items.map(item=>`${item.quantity} × ${item.name??findMerch(item.productId)?.name??"Item"}${item.variantLabel?` / ${item.variantLabel}`:""}${item.unitPrice===undefined?" · historical unit price not recorded":` · ${money(item.unitPrice*item.quantity)}`}`),`Subtotal ${money(order.subtotal)}`,`Fulfilment: ${order.fulfilment} · ${money(order.fee)}`,`Total ${money(order.total)}`,"Local order preview. No payment or fulfilment has been processed."];
 // A local order has no public receipt URL. Share public products, never a broken private order link.
 const url=new URL("/shop",publicSiteOrigin).href;return {title,text:`THE NORTH MOB\n${lines.join("\n")}\n${url}`,url,lines};
}
export async function printContent(content:ShareContent){
 const previous=document.getElementById("shop-print-content");previous?.remove();
 const section=document.createElement("section");section.id="shop-print-content";
 const heading=document.createElement("h1");heading.textContent="THE NORTH MOB";section.append(heading);
 if(content.image){const image=document.createElement("img");image.src=content.image;image.alt=content.title;section.append(image);}
 for(const line of content.lines){const p=document.createElement("p");p.textContent=line;section.append(p);}
 const footer=document.createElement("p");footer.textContent="No payment has been taken. Availability and fulfilment are unconfirmed.";section.append(footer);
 document.body.append(section);document.body.classList.add("shop-printing");
 const picture=section.querySelector("img");if(picture)await picture.decode().catch(()=>{});
 const cleanup=()=>{section.remove();document.body.classList.remove("shop-printing");};window.addEventListener("afterprint",cleanup,{once:true});
 requestAnimationFrame(()=>{try{window.print();}catch{cleanup();}});
}

export const productPath=(product:MerchProduct,variant="")=>product.photoId?`/visuals#photo-${product.photoId}:${variant||"a3"}`:`/shop#product-${product.id}`;
