import type { Page } from "@playwright/test";

// This fixture verifies our integration contract, not Spotify's real playback rights.
export async function mockSpotify(page: Page, allowPlayback = false) {
  await page.addInitScript((allowed) => {
    Object.assign(window, { __spotifyAllowed: allowed, __spotifyCreates: 0, __spotifyPlays: 0, __spotifyPauses: 0, __spotifyUri: "" });
  }, allowPlayback);
  await page.route("https://open.spotify.com/embed/iframe-api/v1", route => route.fulfill({ contentType: "application/javascript", body: "const sdk=document.createElement('script');sdk.src='https://embed-cdn.spotifycdn.com/embed/iframe-api-fixture.js';document.body.appendChild(sdk);" }));
  await page.route("https://embed-cdn.spotifycdn.com/embed/iframe-api-fixture.js", route => route.fulfill({ contentType: "application/javascript", body: `
    window.onSpotifyIframeApiReady({createController:function(element,options,callback){
      window.__spotifyCreates++;
      window.__spotifyUri=options.uri;
      const iframe=document.createElement('iframe');
      const parts=options.uri.split(':');
      iframe.src='https://open.spotify.com/embed/'+parts[1]+'/'+parts[2]+'?theme=0';
      iframe.height=options.height;iframe.width='100%';element.replaceWith(iframe);
      const handlers={};
      const fire=(name,data)=>{if(handlers[name])handlers[name]({data:data||{}});};
      const playing=()=>{fire('playback_started',{playingURI:window.__spotifyUri});fire('playback_update',{isPaused:false,isBuffering:false,position:100,duration:190000});};
      const controller={
        play:function(){window.__spotifyPlays++;if(window.__spotifyAllowed)setTimeout(playing,0);},
        pause:function(){window.__spotifyPauses++;fire('playback_update',{isPaused:true,isBuffering:false,position:100,duration:190000});},
        loadUri:function(uri){window.__spotifyUri=uri;},
        addListener:function(name,handler){handlers[name]=handler;if(name==='ready')setTimeout(()=>fire('ready'),0);},
        destroy:function(){iframe.remove();}
      };
      window.__spotifyNativePlay=playing;
      callback(controller);
    }});
  ` }));
  await page.route("https://open.spotify.com/embed/artist/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body style='background:#181818;color:white;font:16px sans-serif'><p>Spotify player test fixture</p><button>Play</button></body></html>" }));
  await page.route("https://open.spotify.com/embed/track/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body>Spotify track test fixture</body></html>" }));
}
