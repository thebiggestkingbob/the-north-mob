"use client";
import { useSyncExternalStore } from "react";
import { decodeShop,emptyShop,SHOP_STORAGE_KEY,type ShopState } from "./shop";
let cachedRaw:string|null|undefined,cachedState:ShopState=emptyShop,storageAvailable=true;
function snapshot(){
 if(!storageAvailable)return cachedState;
 try{const raw=localStorage.getItem(SHOP_STORAGE_KEY);if(raw!==cachedRaw){cachedRaw=raw;cachedState=decodeShop(raw);}}catch{storageAvailable=false;}
 return cachedState;
}
function subscribe(callback:()=>void){
 const onStorage=(event:StorageEvent)=>{if(event.key===SHOP_STORAGE_KEY||event.key===null)callback();};
 window.addEventListener("storage",onStorage);window.addEventListener("northmob:shop",callback);
 return()=>{window.removeEventListener("storage",onStorage);window.removeEventListener("northmob:shop",callback);};
}
export function updateShop(change:(current:ShopState)=>ShopState){
 const next=change(snapshot());cachedState=next;
 try{const raw=JSON.stringify(next);localStorage.setItem(SHOP_STORAGE_KEY,raw);cachedRaw=raw;}catch{storageAvailable=false;}
 window.dispatchEvent(new Event("northmob:shop"));
}
export function useShop(){return {state:useSyncExternalStore(subscribe,snapshot,()=>emptyShop),storageAvailable};}
