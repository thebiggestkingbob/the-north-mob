"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "@/lib/use-shop";
import { useClientReady } from "@/lib/use-client-ready";
export function ShopHeaderActions(){
 const {state}=useShop(),pathname=usePathname(),ready=useClientReady();const savedCount=new Set([...state.saved,...(state.preorders??[])]).size;const count=state.cart.reduce((n,line)=>n+line.quantity,0);
 const icon=(kind:"saved"|"cart")=><><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">{kind==="saved"?<path d="M6 3h12v18l-6-4-6 4V3Z"/>:<path d="M4 7h16l-1 14H5L4 7ZM8 8V6a4 4 0 0 1 8 0v2"/>}</svg><span aria-hidden="true">{kind==="cart"?count:savedCount}</span></>;
 return <div className="header-shop-actions">{(["saved","cart"] as const).map(kind=>{const label=kind==="cart"?`Open cart, ${count} items`:`Open saved items, ${savedCount} items`;return pathname==="/shop"?<button key={kind} disabled={!ready} aria-label={label} onClick={()=>window.dispatchEvent(new CustomEvent("northmob:shop-open",{detail:kind}))}>{icon(kind)}</button>:<Link key={kind} href={`/shop#${kind}`} aria-label={label}>{icon(kind)}</Link>;})}</div>;
}
