"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { preorderEntries } from "@/lib/shop";
import { useShop } from "@/lib/use-shop";
import { useClientReady } from "@/lib/use-client-ready";
import { ShopIcon } from "./shop-icons";
export function ShopHeaderActions(){
 const {state}=useShop(),pathname=usePathname(),ready=useClientReady();const wishlistCount=new Set([...state.wishlist,...preorderEntries(state).map(line=>line.productId)]).size;const count=state.cart.reduce((n,line)=>n+line.quantity,0);
 return <div className="header-shop-actions">{(["wishlist","cart"] as const).map(kind=>{const n=kind==="cart"?count:wishlistCount;const label=`Open ${kind}, ${n} items`;const content=<><ShopIcon name={kind==="wishlist"?"heart":kind}/><span aria-hidden="true">{n}</span></>;return pathname==="/shop"?<button key={kind} className="shop-icon-button" disabled={!ready} aria-label={label} title={kind==="wishlist"?"Wishlist":"Cart"} onClick={()=>window.dispatchEvent(new CustomEvent("northmob:shop-open",{detail:kind}))}>{content}</button>:<Link key={kind} className="shop-icon-button" href={`/shop#${kind}`} aria-label={label}>{content}</Link>;})}</div>;
}
