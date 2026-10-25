import { z } from "zod";
import { findMerch,merch,demoDelivery,productPrice,posterCartLimit } from "@/config/merch";
export const SHOP_STORAGE_KEY="northmob:shop-demo:v1";
export type CartLine={productId:string;variant:string;quantity:number};
export type PreorderLine=Pick<CartLine,"productId"|"variant">;
export type OrderItem=CartLine&{name?:string;variantLabel?:string;unitPrice?:number;image?:string};
export type DemoOrder={reference:string;createdAt:string;gift?:boolean;items:OrderItem[];subtotal:number;fee:number;total:number;fulfilment:"delivery"|"collection"};
export type ShopState={version:1;giftCart?:boolean;cart:CartLine[];wishlist:string[];preorders?:string[];preorderLines?:PreorderLine[];purchased:Record<string,number>;orders:DemoOrder[]};
export const emptyShop:ShopState={version:1,cart:[],wishlist:[],purchased:{},orders:[]};
export const lineKey=(line:Pick<CartLine,"productId"|"variant">)=>`${line.productId}:${line.variant}`;
export function stockLeft(state:ShopState,id:string){const product=findMerch(id);return product?.status==="available"?product.madeToOrder?posterCartLimit:Math.max(0,product.stock-(state.purchased[id]??0)):0;}
export function safeCart(raw:unknown,purchased:Record<string,number>={}):CartLine[]{
 if(!Array.isArray(raw))return [];const cart:CartLine[]=[];
 for(const row of raw.slice(0,100)){
 if(!row||typeof row!=="object")continue;const p=findMerch(row.productId);if(!p||p.status!=="available"||!Number.isSafeInteger(row.quantity)||row.quantity<=0)continue;
 const variant=p.variants.length?p.variants.find(v=>v.id===row.variant)?.id:row.variant===""?"":undefined;if(variant===undefined)continue;
 const allocated=cart.filter(line=>line.productId===p.id).reduce((sum,line)=>sum+line.quantity,0);
 const quantity=Math.min(row.quantity,Math.max(0,(p.madeToOrder?posterCartLimit:p.stock-(purchased[p.id]??0))-allocated));if(!quantity)continue;
 const existing=cart.find(line=>line.productId===p.id&&line.variant===variant);if(existing)existing.quantity+=quantity;else cart.push({productId:p.id,variant,quantity});
 }return cart;
}
function safePreorders(raw:unknown):PreorderLine[]{
 if(!Array.isArray(raw))return [];const lines:PreorderLine[]=[];for(const item of raw.slice(0,100)){if(!item||typeof item!=="object")continue;const product=findMerch(item.productId);if(!product)continue;const variant=product.variants.length?product.variants.find(option=>option.id===item.variant)?.id:item.variant===""?"":undefined;if(variant===undefined||lines.some(line=>line.productId===product.id&&line.variant===variant))continue;lines.push({productId:product.id,variant});}return lines;
}
export function preorderEntries(state:ShopState):PreorderLine[]{return safePreorders([...(state.preorderLines??[]),...(state.preorders??[]).flatMap(id=>{const product=findMerch(id);return product?[{productId:id,variant:product.variants[0]?.id??""}]:[];})]);}
export function togglePreorder(state:ShopState,line:PreorderLine):ShopState{
 const valid=safePreorders([line])[0];if(!valid)return state;const lines=preorderEntries(state),exists=lines.some(item=>lineKey(item)===lineKey(valid));return {...state,preorders:[],preorderLines:exists?lines.filter(item=>lineKey(item)!==lineKey(valid)):[...lines,valid]};
}
function historicItems(raw:unknown):OrderItem[]{
 if(!Array.isArray(raw))return [];return raw.slice(0,100).flatMap(item=>{
  if(!item||typeof item!=="object"||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>1000)return [];
  const product=findMerch(item.productId);if(!product)return [];const variant=product.variants.find(option=>option.id===item.variant);
  if(product.variants.length?!variant:item.variant!=="")return [];
  const name=typeof item.name==="string"&&item.name.length<=200?item.name:product.name;
  const variantLabel=typeof item.variantLabel==="string"&&item.variantLabel.length<=200?item.variantLabel:variant?.label;
  const unitPrice=Number.isSafeInteger(item.unitPrice)&&item.unitPrice>=0&&item.unitPrice<=100000000?item.unitPrice:undefined;
  const image=typeof item.image==="string"&&/^\/assets\/(?:merch|visualz|mob-ties)\/[a-zA-Z0-9._-]+\.webp$/.test(item.image)&&!item.image.includes("..")?item.image:product.images[variant?.image??0].src;
  return [{productId:product.id,variant:variant?.id??"",quantity:item.quantity,name,variantLabel,unitPrice,image}];
 });
}
export function decodeShop(raw:string|null):ShopState{
 try{const value=JSON.parse(raw??"null");if(value?.version!==1)return {...emptyShop};
 const purchased:Record<string,number>={};for(const p of merch){const count=value.purchased?.[p.id];if(Number.isSafeInteger(count)&&count>0)purchased[p.id]=Math.min(count,p.stock);}
 // Only identifiers, totals and fulfilment are restored. Never restore customer or address data.
 const orders:DemoOrder[]=Array.isArray(value.orders)?value.orders.slice(-30).flatMap((order:DemoOrder)=>{
 if(!order||typeof order.reference!=="string"||!/^NM-(?:DEMO-)?[A-F0-9]{8}$/.test(order.reference)||typeof order.createdAt!=="string"||!Number.isFinite(Date.parse(order.createdAt))||!["delivery","collection"].includes(order.fulfilment))return [];
 const items=historicItems(order.items);if(!items.length)return [];
 const amounts=[order.subtotal,order.fee,order.total];if(!amounts.every(amount=>Number.isSafeInteger(amount)&&amount>=0&&amount<=1000000000)||order.subtotal+order.fee!==order.total)return [];
 return [{reference:order.reference,createdAt:order.createdAt,items,subtotal:order.subtotal,fee:order.fee,total:order.total,fulfilment:order.fulfilment,gift:order.gift===true}];
 }):[];
 return {version:1,giftCart:value.giftCart===true,cart:safeCart(value.cart,purchased),wishlist:Array.isArray(value.wishlist??value.saved)?[...new Set<string>((value.wishlist??value.saved).slice(0,100).filter((id:unknown)=>typeof id==="string"&&!!findMerch(id)))]:[],preorders:Array.isArray(value.preorders)?[...new Set<string>(value.preorders.slice(0,100).filter((id:unknown)=>typeof id==="string"&&!!findMerch(id)))]:[],preorderLines:safePreorders(value.preorderLines),purchased,orders};
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
export function cartSubtotal(cart:CartLine[]){return cart.reduce((sum,line)=>sum+(findMerch(line.productId)?productPrice(findMerch(line.productId)!,line.variant):0)*line.quantity,0);}
export function completeDemo(state:ShopState,fulfilment:"delivery"|"collection",gift=false): {state:ShopState;order:DemoOrder}|null{
 const cart=safeCart(state.cart,state.purchased);if(!cart.length)return null;
 const subtotal=cartSubtotal(cart),fee=demoDelivery[fulfilment];
 const order:DemoOrder={reference:`NM-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`,createdAt:new Date().toISOString(),items:cart.map(line=>{const product=findMerch(line.productId)!,variant=product.variants.find(option=>option.id===line.variant);return {...line,name:product.name,variantLabel:variant?.label,unitPrice:productPrice(product,line.variant),image:product.images[variant?.image??0].src};}),subtotal,fee,total:subtotal+fee,fulfilment,gift};
 const purchased={...state.purchased};for(const line of cart)if(!findMerch(line.productId)?.madeToOrder)purchased[line.productId]=(purchased[line.productId]??0)+line.quantity;
 return {order,state:{...state,cart:[],giftCart:false,purchased,orders:[...state.orders,order].slice(-30)}};
}

export const customerSchema=z.object({firstName:z.string().trim().min(1,"Enter a first name.").max(100),lastName:z.string().trim().min(1,"Enter a last name.").max(100),email:z.email("Enter a valid email.").max(254),phone:z.string().trim().max(25).refine(value=>/^[+0-9 ()-]+$/.test(value)&&value.replace(/\D/g,"").length>=9&&value.replace(/\D/g,"").length<=15,"Enter a valid phone number.")});
export const deliverySchema=z.object({street:z.string().trim().min(2,"Enter a street address.").max(200),suburb:z.string().trim().min(2,"Enter a suburb.").max(200),city:z.string().trim().min(2,"Enter a city.").max(200),province:z.enum(["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"]),postal:z.string().regex(/^[0-9]{4}$/, "Enter a four-digit postal code."),notes:z.string().trim().max(200).optional()});
export const giftSchema=z.object({recipientName:z.string().trim().min(2,"Enter the recipient’s name.").max(100),message:z.string().trim().max(500,"Keep the gift message under 500 characters.")});
