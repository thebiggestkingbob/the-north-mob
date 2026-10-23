import { publishedVisualz } from "@/lib/studio/public-visualz";
export async function GET() {
 const catalogue=await publishedVisualz();
 if(catalogue.unavailable)return Response.json({videos:[]},{status:503,headers:{"Cache-Control":"no-store"}});
 const videos=await Promise.all(catalogue.videos.map(async ({id,title})=>{
  if(title)return {id,title};
  try{
   const url=new URL("https://www.youtube.com/oembed");url.searchParams.set("url",`https://www.youtube.com/watch?v=${id}`);url.searchParams.set("format","json");
   const response=await fetch(url,{redirect:"error",next:{revalidate:21600},signal:AbortSignal.timeout(5000)});
   if(!response.ok)return {id,title:null};
   const data=await response.json();
   return {id,title:typeof data.title==="string"&&data.title.trim().length>0?data.title.trim().slice(0,300):null};
  }catch{return {id,title:null};}
 }));
 return Response.json({videos},{headers:{"Cache-Control":videos.every(video=>video.title)?"public, s-maxage=21600, stale-while-revalidate=86400":"public, s-maxage=60, stale-while-revalidate=300"}});
}
