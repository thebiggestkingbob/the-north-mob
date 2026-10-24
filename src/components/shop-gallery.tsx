"use client";
import Image from "next/image";
import { useState,type CSSProperties } from "react";
import { merch,money } from "@/config/merch";
import { stockLeft } from "@/lib/shop";
import { useShop,updateShop } from "@/lib/use-shop";
import { useClientReady } from "@/lib/use-client-ready";
import { ShopModal } from "./shop-modal";
import { ProductDetail } from "./shop-product";
import { ShopCart } from "./shop-cart";
import { ShopCheckout } from "./shop-checkout";
type Panel={kind:"product";id:string}|{kind:"cart"|"checkout"|"saved"}|null;
const angles=[-3,2,-2,4,-1,2,-4,1,-2,3,-1,2,-3];
export function ShopGallery(){
 const {state,storageAvailable}=useShop(),ready=useClientReady();const [panel,setPanel]=useState<Panel>(null);
 const count=state.cart.reduce((sum,line)=>sum+line.quantity,0),product=panel?.kind==="product"?merch.find(p=>p.id===panel.id):null;
 return <><div className="shop-tools"><p className="eyebrow">13 objects / prototype collection</p><div><button disabled={!ready} onClick={()=>setPanel({kind:"saved"})}>Pre-saves ({state.saved.length})</button><button className="merch-cart-trigger" disabled={!ready} onClick={()=>setPanel({kind:"cart"})} aria-label={`Open cart, ${count} items`}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16l-1 14H5L4 7ZM8 8V6a4 4 0 0 1 8 0v2"/></svg>Cart <span>{count}</span></button></div></div><p className="merch-prototype-note">Demo collection. Prices and stock are prototype recommendations; no real orders.</p>{!storageAvailable&&<p role="status">Browser storage is unavailable. Your demo stays in this tab only.</p>}
 <div className="polaroid-gallery">{merch.map((product,index)=>{const image=product.images[0];return <button className="merch-polaroid" style={{"--tilt":`${angles[index]}deg`} as CSSProperties} key={product.id} data-product={product.id} disabled={!ready} onClick={()=>setPanel({kind:"product",id:product.id})} aria-label={`View ${product.name}`}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 600px) 85vw, (max-width: 1100px) 40vw, 27vw" quality={90} priority={index<2}/><div className="polaroid-caption"><span className="merch-object-number">OBJECT {String(index+1).padStart(2,"0")}</span><h2>{product.name}</h2><p>{product.description}</p><div className="polaroid-meta"><span>{money(product.price)}</span><span>{product.status==="coming-soon"?"COMING SOON":product.status==="sold-out"?"SOLD OUT":stockLeft(state,product.id)===0?"DEMO STOCK EXHAUSTED":"AVAILABLE / DEMO"}</span></div></div></button>;})}</div>
 <ShopModal drawer={!!panel&&panel.kind!=="product"} open={panel!==null} label={product?`${product.name} product details`:panel?.kind==="checkout"?"Demo checkout":panel?.kind==="saved"?"Local pre-saves":"Demo shopping cart"} onClose={()=>setPanel(null)}>
 {product?<ProductDetail key={product.id} product={product} state={state} onCart={()=>setPanel({kind:"cart"})}/>:panel?.kind==="cart"?<ShopCart state={state} onContinue={()=>setPanel(null)} onCheckout={()=>setPanel({kind:"checkout"})}/>:panel?.kind==="checkout"?<ShopCheckout state={state} onBack={()=>setPanel({kind:"cart"})} onContinue={()=>setPanel(null)}/>:panel?.kind==="saved"?<section className="merch-cart"><h2>Local pre-saves</h2><p className="merch-note">Saved on this browser only. No preorder, payment or notification signup.</p>{state.saved.length?<ul className="merch-saved">{state.saved.map(id=>{const product=merch.find(p=>p.id===id)!;return <li key={id}><button onClick={()=>setPanel({kind:"product",id})}>{product.name}</button><button onClick={()=>updateShop(current=>({...current,saved:current.saved.filter(saved=>saved!==id)}))} aria-label={`Remove saved ${product.name}`}>Remove</button></li>;})}</ul>:<p>No pre-saves yet.</p>}<button className="button" onClick={()=>setPanel(null)}>Continue shopping</button></section>:null}
 </ShopModal></>;
}
