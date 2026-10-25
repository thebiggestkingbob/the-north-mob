"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect,useState,type CSSProperties } from "react";
import { merch,findMerch,money,hasPriceRange,productPrice } from "@/config/merch";
import { addCart,stockLeft,preorderEntries,togglePreorder,type CartLine,type DemoOrder } from "@/lib/shop";
import { productContent,productPath,orderContent,type ShareContent } from "@/lib/shop-sharing";
import { useShop,updateShop } from "@/lib/use-shop";
import { useClientReady } from "@/lib/use-client-ready";
import { ShopModal } from "./shop-modal";
import { ProductDetail } from "./shop-product";
import { ShopCart } from "./shop-cart";
import { ShopCheckout } from "./shop-checkout";
import { ShopIconButton } from "./shop-icons";
import { ShopOrders,OrderReceipt } from "./shop-orders";
import { ShopSharePanel } from "./shop-share-panel";
type Panel={kind:"product";id:string;variant?:string}|{kind:"cart"|"checkout"|"wishlist"|"orders"}|{kind:"order";reference:string}|{kind:"share";content:ShareContent;back:Panel}|null;
const angles=[-3,2,-2,4,-1,2,-4,1,-2,3,-1,2,-3];
export function ShopGallery(){
 const router=useRouter();
 const {state,storageAvailable}=useShop(),ready=useClientReady(),preorders=preorderEntries(state);
 const [panel,setPanel]=useState<Panel>(null),[notice,setNotice]=useState("");const gift=state.giftCart===true;
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),3000);return()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{
  const parse=(kind:string)=>{if(kind==="saved")kind="wishlist";if(kind==="cart"||kind==="wishlist"||kind==="orders")setPanel({kind});else if(kind.startsWith("share-product-")&&merch.some(p=>p.id===kind.slice(14))){const item=merch.find(p=>p.id===kind.slice(14))!;setPanel({kind:"share",content:productContent(item),back:null});}else if(kind.startsWith("product-")&&merch.some(p=>p.id===kind.slice(8)))setPanel({kind:"product",id:kind.slice(8)});};
  const open=(event:Event)=>parse(String((event as CustomEvent).detail));window.addEventListener("northmob:shop-open",open);queueMicrotask(()=>parse(location.hash.slice(1)));return()=>window.removeEventListener("northmob:shop-open",open);
 },[]);
 const product=panel?.kind==="product"?merch.find(p=>p.id===panel.id):null;
 const order=panel?.kind==="order"?state.orders.find(order=>order.reference===panel.reference):null;
 const browse=(direction:number)=>{if(!product)return;const index=merch.findIndex(p=>p.id===product.id);setPanel({kind:"product",id:merch[(index+direction+merch.length)%merch.length].id});};
 const wishlist=(id:string)=>{const exists=state.wishlist.includes(id);updateShop(current=>({...current,wishlist:exists?current.wishlist.filter(item=>item!==id):[...current.wishlist,id]}));setNotice(exists?"Removed from your wishlist.":"Added to your wishlist on this browser.");};
 const openProduct=(id:string,variant="")=>{const item=findMerch(id);if(item?.photoId){setPanel(null);router.push(productPath(item,variant));}else if(item)setPanel({kind:"product",id,variant});};
 const shareProduct=(id:string,variant="")=>{const item=findMerch(id);if(item)setPanel({kind:"share",content:productContent(item,variant),back:panel});};
 const shareOrder=(item:DemoOrder)=>setPanel({kind:"share",content:orderContent(item),back:{kind:"order",reference:item.reference}});
 const giftItems=(lines:CartLine[])=>{
  let added=0;updateShop(current=>{let next=current;const before=current.cart.reduce((n,line)=>n+line.quantity,0);for(const line of lines)next=addCart(next,line);added=next.cart.reduce((n,line)=>n+line.quantity,0)-before;return added?{...next,giftCart:true}:current;});
  if(!added){setNotice("These items are currently unavailable to add. You can wishlist or pre-order them instead.");return;}
  setPanel({kind:"cart"});setNotice("Gift selection added. Review the cart, then add the recipient at checkout.");
 };
 const openOrder=(reference:string)=>setPanel({kind:"order",reference});
 const label=product?`${product.name} product details`:panel?.kind==="checkout"?"Checkout":panel?.kind==="wishlist"?"Wishlist":panel?.kind==="orders"?"Previous orders":panel?.kind==="order"?"Order details":panel?.kind==="share"?"Share":"Shopping cart";
 return <><p className="eyebrow merch-collection-count">{merch.length} objects / collection</p>{!storageAvailable&&<p role="status">Browser storage is unavailable. Your selections stay in this tab only.</p>}<p className={`shop-feedback ${notice?"has-message":""}`} role="status" aria-live="polite">{panel?"":notice}</p>
 <div className="polaroid-gallery">{merch.map((item,index)=>{const image=item.images[0],available=stockLeft(state,item.id)-state.cart.filter(line=>line.productId===item.id).reduce((n,line)=>n+line.quantity,0)>0;return <article className="merch-polaroid" style={{"--tilt":`${angles[index%angles.length]}deg`} as CSSProperties} key={item.id} data-product={item.id}>
 <button className="merch-product-open" disabled={!ready} onClick={()=>setPanel({kind:"product",id:item.id})} aria-label={`View ${item.name}`}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 600px) 85vw, (max-width: 1100px) 40vw, 27vw" quality={90} priority={index<2}/><div className="polaroid-caption"><span className="merch-object-number">OBJECT {String(index+1).padStart(2,"0")}</span><h2>{item.name}</h2>{item.limitedEdition&&<span className="merch-edition">Limited Edition</span>}<p>{item.description}</p><div className="polaroid-meta"><span>{hasPriceRange(item)?"From ":""}{money(item.price)}</span><span>{item.status==="coming-soon"?"COMING SOON":!available?"SOLD OUT":"AVAILABLE"}</span></div></div></button>
 <div className="merch-card-actions" role="group" aria-label={`${item.name} actions`}><ShopIconButton icon="cart" label={`Add ${item.name} to cart`} disabled={!ready||!available} onClick={()=>{if(item.variants.length){setPanel({kind:"product",id:item.id});setNotice("Choose your option before adding to cart.");}else{updateShop(current=>addCart(current,{productId:item.id,variant:"",quantity:1}));setNotice(`${item.name} added to cart.`);}}}/><ShopIconButton icon="heart" label={`${state.wishlist.includes(item.id)?"Remove":"Add"} ${item.name} ${state.wishlist.includes(item.id)?"from":"to"} wishlist`} aria-pressed={state.wishlist.includes(item.id)} disabled={!ready} onClick={()=>wishlist(item.id)}/><ShopIconButton icon="share" label={`Share ${item.name}`} disabled={!ready} onClick={()=>shareProduct(item.id)}/></div>
 </article>;})}</div>
 <ShopModal drawer={!!panel&&panel.kind!=="product"} open={panel!==null} label={label} onClose={()=>setPanel(null)}>
 {notice&&panel?.kind!=="product"&&<p className="shop-modal-notice" role="alert">{notice}</p>}
 {product?<><nav className="product-browse" aria-label="Browse products"><button className="button" onClick={()=>browse(-1)}>← Previous product</button><span className="eyebrow">{merch.findIndex(p=>p.id===product.id)+1} / {merch.length}</span><button className="button" onClick={()=>browse(1)}>Next product →</button></nav><ProductDetail key={`${product.id}:${panel?.kind==="product"?panel.variant??"":""}`} initialVariant={panel?.kind==="product"?panel.variant:undefined} product={product} state={state} onBrowse={browse} onCart={()=>setPanel({kind:"cart"})} onShare={variant=>shareProduct(product.id,variant)} onGift={line=>giftItems([line])}/></>
 :panel?.kind==="cart"?<ShopCart state={state} gift={gift} onGift={()=>updateShop(current=>({...current,giftCart:!current.giftCart}))} onOrders={()=>setPanel({kind:"orders"})} onContinue={()=>setPanel(null)} onCheckout={()=>setPanel({kind:"checkout"})}/>
 :panel?.kind==="checkout"?<ShopCheckout state={state} initialGift={gift} onGiftChange={value=>updateShop(current=>({...current,giftCart:value}))} onBack={()=>setPanel({kind:"cart"})} onContinue={()=>setPanel(null)} onOrders={()=>setPanel({kind:"orders"})} onShare={shareOrder} onGiftOrder={order=>giftItems(order.items)}/>
 :panel?.kind==="share"?<ShopSharePanel key={panel.content.title} content={panel.content} onBack={()=>setPanel(panel.back)}/>
 :panel?.kind==="orders"?<ShopOrders state={state} onOpen={openOrder}/>
 :order?<OrderReceipt order={order} onShare={shareOrder} onGift={order=>giftItems(order.items)} onBack={()=>setPanel({kind:"orders"})}/>
 :panel?.kind==="wishlist"?<section className="merch-cart"><h2>Wishlist</h2><p className="merch-note">Your wishlist stays on this browser.</p>{state.wishlist.length?<ul className="merch-wishlist">{state.wishlist.map(id=>{const item=findMerch(id)!;return <li key={id}><button className="wishlist-open" onClick={()=>openProduct(id)}>{item.name}</button><ShopIconButton icon="heart" label={`Remove ${item.name} from wishlist`} aria-pressed onClick={()=>wishlist(id)}/></li>;})}</ul>:<p>Your wishlist is empty.</p>}
 {!!preorders.length&&<div className="merch-preorders"><h3>Pre-order selections</h3><p className="merch-note">Selections only; no orders have been sent.</p>{preorders.map(line=>{const item=findMerch(line.productId)!,variant=item.variants.find(option=>option.id===line.variant);return <p key={`${line.productId}:${line.variant}`}><button className="button" onClick={()=>openProduct(item.id,line.variant)}>{item.name}{variant?` / ${variant.label}`:""} · {money(productPrice(item,line.variant))}</button><button className="button" aria-label={`Remove pre-order ${item.name}${variant?` / ${variant.label}`:""}`} onClick={()=>updateShop(current=>togglePreorder(current,line))}>Remove</button></p>;})}</div>}
 <button className="button" onClick={()=>setPanel(null)}>Continue shopping</button></section>:null}
 </ShopModal></>;
}
