"use client";
import { useEffect, useRef, useState } from "react";
import { loadYouTube, type YouTubePlayer } from "@/lib/youtube";
export function YouTubeVideo({id,title}:{id:string;title:string}){
 const mount=useRef<HTMLDivElement>(null);const [state,setState]=useState<"loading"|"ready"|"error"|"manual">("loading");
 useEffect(()=>{
  let disposed=false;let failed=false;let player:YouTubePlayer|undefined;
  const destroy=()=>{const active=player;player=undefined;active?.destroy();};
  const timeout=setTimeout(()=>{if(!disposed){failed=true;setState("error");destroy();}},20000);
  const holder=document.createElement("div");mount.current?.appendChild(holder);
  loadYouTube().then(api=>{
   if(disposed)return;
   player=new api.Player(holder,{host:"https://www.youtube-nocookie.com",videoId:id,width:"100%",height:"100%",playerVars:{origin:location.origin,playsinline:1,rel:0,autoplay:0,controls:1},events:{
    onReady:event=>{if(disposed||failed)return;clearTimeout(timeout);const frame=event.target.getIframe();frame.title=title;frame.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen");frame.setAttribute("allowfullscreen","");frame.referrerPolicy="strict-origin-when-cross-origin";setState("ready");event.target.playVideo();},
    onStateChange:event=>{if(!disposed&&!failed&&event.data===1){window.dispatchEvent(new Event("northmob:video-open"));setState("ready");}},
    onError:()=>{if(!disposed){clearTimeout(timeout);failed=true;setState("error");destroy();}},
    onAutoplayBlocked:()=>{if(!disposed)setState("manual");},
   }});
  }).catch(()=>{if(!disposed){clearTimeout(timeout);setState("error");}});
  return()=>{disposed=true;clearTimeout(timeout);destroy();holder.remove();};
 },[id,title]);
 return <><div className="youtube-stage" hidden={state==="error"} ref={mount}/>{state==="loading"&&<p className="youtube-status" role="status">Loading video…</p>}{state==="manual"&&<p className="source-note" role="status">Press play in the video to start.</p>}{state==="error"&&<div className="youtube-error" role="alert"><p>This video could not play here. It may be unavailable or restricted, or the connection may be blocked.</p><a className="text-link" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">Watch on YouTube</a></div>}</>;
}
