import { publishedEvents } from "@/lib/studio/public-events";
export const revalidate=3600;
export default async function WorldLive(){
 const {events,unavailable}=await publishedEvents();
 const today=new Date().toLocaleDateString("en-CA",{timeZone:"Africa/Johannesburg"});
 const upcoming=[...events].filter(event=>event.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
 return <main style={{minHeight:"100vh",background:"#111",color:"white",fontFamily:"Arial,sans-serif",padding:20}}>
 <p style={{fontFamily:"monospace",letterSpacing:".18em",fontSize:11}}>THE NORTH MOB / PUBLISHED EVENTS</p><h1 style={{fontSize:"clamp(38px,7vw,70px)",margin:"10px 0"}}>LIVE YARD</h1>
 {unavailable?<p role="status">Live events are temporarily unavailable.</p>:upcoming.length?upcoming.map(event=><article key={event.date+"-"+event.name} style={{padding:"18px 0",borderBottom:"1px solid #444"}}><time dateTime={event.date}>{event.date}</time><h2>{event.name}</h2><p>{event.venue}</p>{event.ticketUrl&&<a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" style={{color:"white"}}>TICKETS</a>}</article>):<p>No upcoming dates have been announced.</p>}
 </main>;
}
