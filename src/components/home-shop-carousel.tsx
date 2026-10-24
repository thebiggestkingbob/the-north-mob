"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { merch,money } from "@/config/merch";
const featured=[merch[1],merch[4],merch[9],merch[11]];
export function HomeShopCarousel(){
 const rail=useRef<HTMLDivElement>(null);
 const move=(direction:number)=>rail.current?.scrollBy({left:direction*(rail.current.clientWidth*.8),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
 return <div className="home-merch-carousel" role="region" aria-label="Featured merchandise"><div className="home-merch-controls"><button onClick={()=>move(-1)} aria-label="Previous products">←</button><button onClick={()=>move(1)} aria-label="Next products">→</button></div><div className="home-merch-rail" ref={rail}>{featured.map(product=>{const image=product.images[0];return <Link key={product.id} className="home-merch-item" href={`/shop#product-${product.id}`}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 750px) 65vw, 25vw"/><div className="home-merch-caption"><span className="home-merch-number">OBJECT {String(merch.indexOf(product)+1).padStart(2,"0")}</span><h3>{product.name}</h3><p>{product.description}</p><span className="home-merch-price">{money(product.price)}</span></div></Link>;})}</div></div>;
}
