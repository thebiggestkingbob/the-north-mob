"use client";
import { preconnect } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { videoIds } from "@/config/videos";
import { useClientReady } from "@/lib/use-client-ready";
import { YouTubeVideo } from "./youtube-video";
function Thumbnail({id,index}:{id:string;index:number}){
 const [fallback,setFallback]=useState(0);const image=useRef<HTMLImageElement>(null);
 useEffect(()=>{
  if(fallback===2)return;
  // Image failures can arrive before hydration attaches React's handlers.
  const frame=requestAnimationFrame(()=>{if(image.current?.complete&&image.current.naturalWidth<=120)setFallback(value=>value===fallback?Math.min(value+1,2):value);});
  return()=>cancelAnimationFrame(frame);
 },[fallback]);
 if(fallback===2)return <span className="thumbnail-unavailable">Thumbnail unavailable</span>;
 // Native responsive images retain access to the real thumbnail's dimensions,
 // allowing YouTube's 120px missing-image response to trigger the fallback.
 // eslint-disable-next-line @next/next/no-img-element
 return <img ref={image} src={`https://i.ytimg.com/vi/${id}/${fallback?"hqdefault":"maxresdefault"}.jpg`} srcSet={fallback?undefined:`https://i.ytimg.com/vi/${id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${id}/maxresdefault.jpg 1280w`} sizes="(max-width: 800px) 100vw, 50vw" width={1280} height={720} alt="" loading={index<2?"eager":"lazy"} fetchPriority={index<2?"high":"auto"} onError={()=>setFallback(value=>value===fallback?Math.min(value+1,2):value)} onLoad={event=>{if(event.currentTarget.naturalWidth<=120)setFallback(value=>value===fallback?Math.min(value+1,2):value);}}/>;
}
export function VideoGallery(){
 preconnect("https://i.ytimg.com");
 const interactive=useClientReady();const [titles,setTitles]=useState<Record<string,string>>({});const [selected,setSelected]=useState<string|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement|null>(null);
 const [selectedTitle,setSelectedTitle]=useState("");
 useEffect(()=>{const abort=new AbortController();fetch("/api/videos",{signal:abort.signal}).then(response=>response.ok?response.json():null).then(data=>{if(!Array.isArray(data?.videos))return;const next:Record<string,string>={};for(const video of data.videos)if(videoIds.includes(video.id)&&typeof video.title==="string"&&video.title.trim())next[video.id]=video.title.slice(0,300);setTitles(next);}).catch(()=>{});return()=>abort.abort();},[]);
 useEffect(()=>{
  if(!selected){dialog.current?.close();return;}
  window.dispatchEvent(new Event("northmob:video-open"));dialog.current?.showModal();
  const previous=document.body.style.overflow;document.body.style.overflow="hidden";
  return()=>{document.body.style.overflow=previous;};
 },[selected]);
 const close=()=>{setSelected(null);};
 return <section className="youtube-gallery" aria-label="Official YouTube videos"><div className="youtube-grid">{videoIds.map((id,index)=>{const label=titles[id]??`Video ${String(index+1).padStart(2,"0")}`;return <figure key={id}><button className="youtube-thumbnail" data-video-id={id} disabled={!interactive} aria-label={`Play ${label}`} onClick={event=>{trigger.current=event.currentTarget;setSelectedTitle(label);setSelected(id);}}><Thumbnail id={id} index={index}/><span className="youtube-play" aria-hidden="true">▷</span></button><figcaption>{titles[id]??String(index+1).padStart(2,"0")}</figcaption></figure>;})}</div><dialog className="video-dialog youtube-dialog" ref={dialog} aria-labelledby="video-title" onCancel={event=>{event.preventDefault();close();}} onClose={()=>{setSelected(null);trigger.current?.focus({preventScroll:true});}} onClick={event=>{if(event.target===dialog.current)close();}}><div className="video-dialog-inner"><button className="close-button" autoFocus onClick={close} aria-label="Close video">×</button><h2 className="eyebrow" id="video-title">{selectedTitle}</h2>{selected&&<YouTubeVideo key={selected} id={selected} title={selectedTitle}/>}</div></dialog></section>;
}
