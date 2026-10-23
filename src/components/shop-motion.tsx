"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";
export function ShopMotion({children}:{children:React.ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useGSAP(()=>{const media=gsap.matchMedia();media.add("(prefers-reduced-motion: no-preference)",()=>{
  gsap.from(".shop-title,.shop-mark,.shop-empty",{y:24,opacity:0,duration:1.1,stagger:.12,ease:"power3.out",clearProps:"all"});
 });return()=>media.revert();},{scope:root});
 return <div ref={root} className="shop-presentation">{children}</div>;
}
