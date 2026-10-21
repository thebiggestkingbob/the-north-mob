import { NextRequest } from "next/server";

// Isolate vendor SDK requirements from the application's script policy.
const policy = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval' https://open.spotify.com https://embed-cdn.spotifycdn.com",
  "style-src 'unsafe-inline'", "frame-src https://open.spotify.com",
  "connect-src https://open.spotify.com https://embed-cdn.spotifycdn.com",
  "img-src data:", "frame-ancestors 'self'", "base-uri 'none'", "form-action 'none'",
].join("; ");

export function GET(request: NextRequest) {
  const uri = request.nextUrl.searchParams.get("uri") ?? "";
  if (!/^spotify:(artist|track):[a-zA-Z0-9]{22}$/.test(uri)) return new Response("Invalid Spotify content", { status: 400 });
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>THE NORTH MOB / Spotify</title><style>html,body{margin:0;background:#080909;color:#f5f4ef}iframe{border:0;display:block;width:100%;height:80px;border-radius:12px}</style></head><body><div id="player"></div><script>
(() => {
  const channel='northmob:spotify:v1';
  let selected=${JSON.stringify(uri)};
  let api=null, controller=null, ready=false, native=false, generation=0, wantsPlay=false;
  let timer;
  const host=document.getElementById('player');
  const emit=(type,data={})=>parent.postMessage({channel,type,uri:selected,data},location.origin);
  const valid=uri=>typeof uri==='string' && /^spotify:(artist|track):[a-zA-Z0-9]{22}$/.test(uri);
  const fallback=()=>{
    if(native)return;
    clearTimeout(timer); generation++; ready=false; native=true;
    try{controller?.destroy();}catch{}
    controller=null;
    const frame=document.createElement('iframe');
    const parts=selected.split(':');
    frame.src='https://open.spotify.com/embed/'+parts[1]+'/'+parts[2]+'?theme=0';
    frame.title='THE NORTH MOB Spotify native player';
    frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    host.replaceChildren(frame); emit('native');
  };
  const load=()=>{
    if(!api){if(native){native=false;fallback();}return;}
    clearTimeout(timer); const token=++generation;
    ready=false; native=false;
    try{controller?.destroy();}catch{}
    controller=null; host.replaceChildren();
    const mount=document.createElement('div');host.appendChild(mount);emit('loading');
    timer=setTimeout(fallback,15000);
    try{
      api.createController(mount,{uri:selected,width:300,height:80},embed=>{
        if(token!==generation){embed.destroy();return;}
        controller=embed;
        embed.addListener('ready',()=>{
          if(token!==generation)return;
          clearTimeout(timer);ready=true;emit('ready');
          if(wantsPlay){try{embed.play();}catch{emit('ready');}}
        });
        for(const name of ['playback_started','playback_update']){
          embed.addListener(name,event=>{if(token===generation)emit(name,event.data);});
        }
      });
    }catch{fallback();}
  };
  addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==parent || event.data?.channel!==channel)return;
    const {action,uri}=event.data;
    if(!valid(uri))return;
    if(action==='load'){
      if(uri!==selected){selected=uri;wantsPlay=false;load();}
      return;
    }
    if(uri!==selected)return;
    if(action==='play'){
      wantsPlay=true;
      if(ready){try{controller.play();}catch{emit('ready');}}
    }else if(action==='pause'){
      wantsPlay=false;
      try{controller?.pause();}catch{}
    }
  });
  window.onSpotifyIframeApiReady=vendor=>{api=vendor;if(native)return;clearTimeout(timer);load();};
  emit('boot');
  const script=document.createElement('script');
  script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
  script.onerror=fallback;timer=setTimeout(fallback,12000);document.body.appendChild(script);
})();
</script></body></html>`, { headers: {
    "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": policy,
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "autoplay=(self \"https://open.spotify.com\"), encrypted-media=(self \"https://open.spotify.com\"), camera=(), microphone=(), geolocation=()",
  } });
}
