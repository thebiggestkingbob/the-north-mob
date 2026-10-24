import { z } from "zod";
import { findMerch,merch,demoDelivery } from "@/config/merch";
export const SHOP_STORAGE_KEY="northmob:shop-demo:v1";
export type CartLine={productId:string;variant:string;quantity:number};
export type DemoOrder={reference:string;createdAt:string;items:CartLine[];subtotal:number;fee:number;total:number;fulfilment:"delivery"|"collection"};
export type ShopState={version:1;cart:CartLine[];saved:string[];purchased:Record<string,number>;orders:DemoOrder[]};
export const emptyShop:ShopState={version:1,cart:[],saved:[],purchased:{},orders:[]};
export const lineKey=(line:Pick<CartLine,"productId"|"variant">)=>`${line.productId}:${line.variant}`;
export function stockLeft(state:ShopState,id:string){const product=findMerch(id);return product?.status==="available"?Math.max(0,product.stock-(state.purchased[id]??0)):0;}
export function safeCart(raw:unknown,purchased:Record<string,number>={}):CartLine[]{
 if(!Array.isArray(raw))return [];const cart:CartLine[]=[];
 for(const row of raw.slice(0,100)){
 if(!row||typeof row!=="object")continue;const p=findMerch(row.productId);if(!p||p.status!=="available"||!Number.isSafeInteger(row.quantity)||row.quantity<=0)continue;
 const variant=p.variants.length?p.variants.find(v=>v.id===row.variant)?.id:row.variant===""?"":undefined;if(variant===undefined)continue;
 const allocated=cart.filter(line=>line.productId===p.id).reduce((sum,line)=>sum+line.quantity,0);
 const quantity=Math.min(row.quantity,Math.max(0,p.stock-(purchased[p.id]??0)-allocated));if(!quantity)continue;
 const existing=cart.find(line=>line.productId===p.id&&line.variant===variant);if(existing)existing.quantity+=quantity;else cart.push({productId:p.id,variant,quantity});
 }return cart;
}
export function decodeShop(raw:string|null):ShopState{
 try{const value=JSON.parse(raw??"null");if(value?.version!==1)return {...emptyShop};
 const purchased:Record<string,number>={};for(const p of merch){const count=value.purchased?.[p.id];if(Number.isSafeInteger(count)&&count>0)purchased[p.id]=Math.min(count,p.stock);}
 // Only identifiers, totals and fulfilment are restored. Never restore customer or address data.
 const orders:DemoOrder[]=Array.isArray(value.orders)?value.orders.slice(-30).flatMap((order:DemoOrder)=>{
 if(!order||typeof order.reference!=="string"||!/^NM-(?:DEMO-)?[A-F0-9]{8}$/.test(order.reference)||typeof order.createdAt!=="string"||!Number.isFinite(Date.parse(order.createdAt))||!["delivery","collection"].includes(order.fulfilment))return [];
 const items=safeCart(order.items);if(!items.length)return [];
 const subtotal=cartSubtotal(items),fee=demoDelivery[order.fulfilment];
 return [{reference:order.reference,createdAt:order.createdAt,items,subtotal,fee,total:subtotal+fee,fulfilment:order.fulfilment}];
 }):[];
 return {version:1,cart:safeCart(value.cart,purchased),saved:Array.isArray(value.saved)?[...new Set<string>(value.saved.slice(0,100).filter((id:unknown)=>typeof id==="string"&&findMerch(id)?.status==="coming-soon"))]:[],purchased,orders};
 }catch{return {...emptyShop};}
}
export function changeQuantity(state:ShopState,line:CartLine,quantity:number):ShopState{
 if(!Number.isSafeInteger(quantity))return state;
 const others=state.cart.filter(item=>lineKey(item)!==lineKey(line));
 const cart=safeCart([...others,...(quantity>0?[{...line,quantity}]:[])],state.purchased);
 const position=(item:CartLine)=>{const index=state.cart.findIndex(previous=>lineKey(previous)===lineKey(item));return index<0?state.cart.length:index;};
 return {...state,cart:cart.sort((a,b)=>position(a)-position(b))};
}
export function addCart(state:ShopState,line:CartLine):ShopState{
 const existing=state.cart.find(item=>lineKey(item)===lineKey(line));return changeQuantity(state,line,(existing?.quantity??0)+line.quantity);
}
export function cartSubtotal(cart:CartLine[]){return cart.reduce((sum,line)=>sum+(findMerch(line.productId)?.price??0)*line.quantity,0);}
export function completeDemo(state:ShopState,fulfilment:"delivery"|"collection"): {state:ShopState;order:DemoOrder}|null{
 const cart=safeCart(state.cart,state.purchased);if(!cart.length)return null;
 const subtotal=cartSubtotal(cart),fee=demoDelivery[fulfilment];
 const order:DemoOrder={reference:`NM-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`,createdAt:new Date().toISOString(),items:cart,subtotal,fee,total:subtotal+fee,fulfilment};
 const purchased={...state.purchased};for(const line of cart)purchased[line.productId]=(purchased[line.productId]??0)+line.quantity;
 return {order,state:{...state,cart:[],purchased,orders:[...state.orders,order].slice(-30)}};
}

export const customerSchema=z.object({firstName:z.string().trim().min(1,"Enter a first name.").max(100),lastName:z.string().trim().min(1,"Enter a last name.").max(100),email:z.email("Enter a valid email.").max(254),phone:z.string().trim().max(25).refine(value=>/^[+0-9 ()-]+$/.test(value)&&value.replace(/\D/g,"").length>=9&&value.replace(/\D/g,"").length<=15,"Enter a valid phone number.")});
export const deliverySchema=z.object({street:z.string().trim().min(2,"Enter a street address.").max(200),suburb:z.string().trim().min(2,"Enter a suburb.").max(200),city:z.string().trim().min(2,"Enter a city.").max(200),province:z.enum(["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"]),postal:z.string().regex(/^[0-9]{4}$/, "Enter a four-digit postal code."),notes:z.string().trim().max(200).optional()});
