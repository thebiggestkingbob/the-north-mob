import type { Page } from "@playwright/test";
import { videoIds } from "../../src/config/videos";
// Integration fixture only: never establishes actual YouTube playback permission.
export async function mockYouTube(page:Page,errorCode=0){
 await page.route("**/api/videos",route=>route.fulfill({json:{videos:videoIds.map((id,index)=>({id,title:`Fixture video ${index+1}`}))}}));
 await page.route("https://i.ytimg.com/**",route=>route.fulfill({contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#396ba6"/></svg>'}));
 await page.route("https://www.youtube-nocookie.com/**",route=>route.fulfill({body:"YouTube integration fixture"}));
 await page.route("https://www.youtube.com/iframe_api",route=>route.fulfill({contentType:"application/javascript",body:`window.__ytCreates=0;window.__ytDestroys=0;window.__ytPlays=0;window.YT={Player:function(element,options){window.__ytCreates++;const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+options.videoId;frame.allowFullscreen=true;element.replaceWith(frame);let gone=false;this.getIframe=()=>frame;this.destroy=()=>{if(!gone){gone=true;window.__ytDestroys++;frame.remove();}};this.playVideo=()=>{window.__ytPlays++;options.events.onStateChange({data:1});};setTimeout(()=>{if(!gone){${errorCode?`options.events.onError({data:${errorCode}});`:'options.events.onReady({target:this});'} }},20);}};window.onYouTubeIframeAPIReady();`}));
}
