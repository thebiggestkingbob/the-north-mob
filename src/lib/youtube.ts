export type YouTubePlayer = { destroy:()=>void; playVideo:()=>void; getIframe:()=>HTMLIFrameElement };
type PlayerOptions={host:string;videoId:string;width:string;height:string;playerVars:Record<string,string|number>;events:{onReady:(event:{target:YouTubePlayer})=>void;onStateChange:(event:{data:number})=>void;onError:(event:{data:number})=>void;onAutoplayBlocked:()=>void}};
type YouTubeAPI={Player:new(element:HTMLElement,options:PlayerOptions)=>YouTubePlayer};
declare global { interface Window { YT?:YouTubeAPI; onYouTubeIframeAPIReady?:()=>void } }
let pending:Promise<YouTubeAPI>|null=null;
export function loadYouTube():Promise<YouTubeAPI>{
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.src="https://www.youtube.com/iframe_api";script.async=true;
  const previous=window.onYouTubeIframeAPIReady;
  const cleanup=()=>{clearTimeout(timer);window.onYouTubeIframeAPIReady=previous;};
  const fail=()=>{cleanup();script.remove();pending=null;reject(new Error("YouTube could not load."));};
  const timer=setTimeout(fail,15000);
  window.onYouTubeIframeAPIReady=()=>{cleanup();if(window.YT?.Player)resolve(window.YT);else fail();previous?.();};
  script.onerror=fail;document.head.appendChild(script);
 });
 return pending;
}
