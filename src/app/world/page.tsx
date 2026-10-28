import type { Metadata } from "next";
export const metadata: Metadata = { title: "Enter the Mob — World" };
export default function WorldPage() {
  return <main id="main" style={{position:"relative",minHeight:"100svh",background:"#080808"}}>
    <iframe title="THE NORTH MOB interactive world" src="/world-engine/index.html" allow="autoplay; fullscreen" style={{display:"block",width:"100%",height:"100svh",border:0}} />
    <a href="/" style={{position:"absolute",top:12,right:12,zIndex:5,color:"white",background:"#111",border:"1px solid #555",padding:"9px 14px",font:"12px monospace",textDecoration:"none"}}>EXIT WORLD</a>
  </main>;
}
