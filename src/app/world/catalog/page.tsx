import type { Metadata } from "next";
import Image from "next/image";
import { merch } from "@/config/merch";
export const metadata: Metadata = { title: "Mob World — Shop Gallery" };
export default function WorldCatalogue() {
  return <main style={{background:"#101010",color:"#f5f5f5",minHeight:"100vh",padding:"24px",fontFamily:"Arial,sans-serif"}}>
    <p style={{fontFamily:"monospace",letterSpacing:".2em",fontSize:11}}>THE NORTH MOB · OFFICIAL MERCHANDISE</p>
    <h1 style={{fontSize:"clamp(36px,7vw,70px)",margin:"8px 0 20px"}}>MOB SHOP</h1>
    <p style={{color:"#aaa",maxWidth:650}}>Real products and prices from the same catalogue used by the website. Purchases and cart actions continue through the official shop.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
      {merch.map(p=><article key={p.id} style={{background:"#1a1a1a",padding:12,border:"1px solid #444"}}>
        {p.images[0]&&<Image src={p.images[0].src} alt={p.images[0].alt} width={p.images[0].width} height={p.images[0].height} style={{width:"100%",height:190,objectFit:"contain",background:"#e9e9e9"}}/>}
        <h2 style={{fontSize:17,margin:"12px 0 5px"}}>{p.name}</h2>
        <p style={{fontSize:13,color:"#bbb",minHeight:48}}>{p.description}</p>
        <p style={{fontFamily:"monospace"}}>R{(p.price/100).toLocaleString("en-ZA")} · {p.status.replaceAll("-"," ").toUpperCase()}</p>
        <a href="/shop" target="_top" style={{display:"inline-block",background:"#f5f5f5",color:"#000",padding:"10px 12px",fontSize:12,fontWeight:800,textDecoration:"none"}}>VIEW IN OFFICIAL SHOP</a>
      </article>)}
    </div>
  </main>;
}
