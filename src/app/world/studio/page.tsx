import { publishedMusic } from "@/lib/studio/public-music";
export default async function WorldStudio(){
 const {releases,tracks,unavailable}=await publishedMusic();
 return <main style={{minHeight:"100vh",background:"#111",color:"white",fontFamily:"Arial,sans-serif",padding:20}}>
 <p style={{fontFamily:"monospace",letterSpacing:".18em",fontSize:11}}>THE NORTH MOB / OFFICIAL MUSIC</p><h1 style={{fontSize:"clamp(38px,7vw,70px)",margin:"10px 0"}}>THE STUDIO</h1>
 {unavailable?<p role="status">Published music is temporarily unavailable.</p>:<>
 {releases.map(release=><section key={release.slug} style={{marginBottom:25,borderBottom:"1px solid #444",paddingBottom:20}}>
 <h2>{release.title}</h2>{release.cover&&<img src={release.cover} alt={release.title+" artwork"} style={{maxWidth:280,width:"100%",height:"auto"}}/>}
 {release.spotify_uri?.startsWith("spotify:album:")&&<iframe title={release.title+" Spotify player"} src={"https://open.spotify.com/embed/album/"+release.spotify_uri.slice(14)} width="100%" height="352" style={{border:0,marginTop:12}} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"/>}
 <p>{tracks.filter(track=>track.releaseId===release.slug).length} published tracks</p>
 </section>)}
 <ol>{tracks.map(track=><li key={track.id} style={{padding:"8px 0",borderBottom:"1px solid #333"}}>{track.title} · {track.artist} {track.uri?.startsWith("spotify:track:")&&<a style={{color:"white",marginLeft:8}} href={track.source} target="_blank" rel="noreferrer">Listen</a>}</li>)}</ol>
 </>}
 </main>;
}
