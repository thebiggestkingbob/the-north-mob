"use client";
import { useState } from "react";
import type { ShareContent } from "@/lib/shop-sharing";
import { printContent } from "@/lib/shop-sharing";
import { ShopIcon } from "./shop-icons";
export function ShopSharePanel({content,onBack}:{content:ShareContent;onBack:()=>void}){
 const [notice,setNotice]=useState("");return <section className="merch-share"><p className="eyebrow">Pass it on</p><h2>{content.title}</h2><div className="share-options"><a className="button" href={`https://wa.me/?text=${encodeURIComponent(content.text)}`} target="_blank" rel="noreferrer"><ShopIcon name="whatsapp"/>Share on WhatsApp</a><button className="button" onClick={async()=>{try{if(navigator.share){await navigator.share({title:content.title,text:content.text});}else{await navigator.clipboard.writeText(content.text);setNotice("Share text copied.");}}catch(error){if(!(error instanceof Error&&error.name==="AbortError"))setNotice("Sharing is unavailable. Select and copy the text below.");}}}><ShopIcon name="share"/>More sharing options</button><button className="button" onClick={()=>printContent(content)}><ShopIcon name="print"/>Print</button></div><label>Share text<textarea readOnly value={content.text} rows={9} onFocus={event=>event.currentTarget.select()}/></label><p role="status">{notice}</p><button className="button" onClick={onBack}>Back</button></section>;
}
