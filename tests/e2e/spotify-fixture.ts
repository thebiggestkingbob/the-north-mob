import type { Page } from "@playwright/test";

// This fixture verifies our integration contract, not Spotify's real playback rights.
export async function mockSpotify(page: Page, allowPlayback = false, readyDelay = 0) {
  await page.addInitScript(({ allowed, delay }) => {
    if (window !== window.top) return;
    Object.assign(window, { __spotifyReadyDelay: delay, __spotifyPrematurePlays: 0, __spotifyAllowed: allowed, __spotifyCreates: 0, __spotifyPlays: 0, __spotifyPauses: 0, __spotifyUri: "" });
  }, { allowed: allowPlayback, delay: readyDelay });
  await page.route("https://open.spotify.com/embed/iframe-api/v1", route => route.fulfill({ contentType: "application/javascript", body: "const sdk=document.createElement('script');sdk.src='https://embed-cdn.spotifycdn.com/embed/iframe-api-fixture.js';document.body.appendChild(sdk);" }));
  await page.route("https://embed-cdn.spotifycdn.com/embed/iframe-api-fixture.js", route => route.fulfill({ contentType: "application/javascript", body: `
    window.onSpotifyIframeApiReady({createController:function(element,options,callback){
      window.top.__spotifyEvalWorks=new Function("return true")();
      window.top.__spotifyCreates++;
      window.top.__spotifyUri=options.uri;
      const iframe=document.createElement('iframe');
      const parts=options.uri.split(':');
      iframe.src='https://open.spotify.com/embed/'+parts[1]+'/'+parts[2]+'?theme=0';
      iframe.height=options.height;iframe.width='100%';element.replaceWith(iframe);
      let ready=false;
      const handlers={};
      const fire=(name,data)=>{if(handlers[name])handlers[name]({data:data||{}});};
      const playing=()=>{fire('playback_started',{playingURI:window.top.__spotifyUri});fire('playback_update',{isPaused:false,isBuffering:false,position:100,duration:190000});};
      const controller={
        play:function(){if(!ready)window.top.__spotifyPrematurePlays++;window.top.__spotifyPlays++;if(window.top.__spotifyAllowed)setTimeout(playing,0);},
        pause:function(){window.top.__spotifyPauses++;fire('playback_update',{isPaused:true,isBuffering:false,position:100,duration:190000});},
        loadUri:function(uri){window.top.__spotifyUri=uri;},
        addListener:function(name,handler){handlers[name]=handler;if(name==='ready'){window.top.__spotifyReleaseReady=()=>{ready=true;fire('ready');};if(window.top.__spotifyReadyDelay>=0)setTimeout(window.top.__spotifyReleaseReady,window.top.__spotifyReadyDelay);}},
        destroy:function(){iframe.remove();}
      };
      window.top.__spotifyNativePlay=playing;
      callback(controller);
    }});
  ` }));
  await page.route("https://open.spotify.com/embed/artist/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body style='background:#181818;color:white;font:16px sans-serif'><p>Spotify player test fixture</p><button>Play</button></body></html>" }));
  await page.route("https://open.spotify.com/embed/track/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body>Spotify track test fixture</body></html>" }));
}
