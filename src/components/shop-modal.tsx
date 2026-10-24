"use client";
import { useEffect,useRef } from "react";
export function ShopModal({open,onClose,children,label,drawer=false}:{open:boolean;onClose:()=>void;children:React.ReactNode;label:string;drawer?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
 useEffect(()=>{
 if(!open){dialog.current?.close();return;}
 trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
 const x=window.scrollX,y=window.scrollY;const node=dialog.current;node?.showModal();const previous=document.body.style.overflow;document.body.style.overflow="hidden";
 return()=>{node?.close();document.body.style.overflow=previous;trigger.current?.focus({preventScroll:true});window.scrollTo({left:x,top:y,behavior:"instant"});};
 },[open]);
 return <dialog ref={dialog} className={`merch-dialog ${drawer?"is-drawer":""}`} aria-label={label} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===dialog.current)onClose();}}><div className="merch-dialog-header"><button autoFocus className="merch-close" aria-label="Close shop dialog" onClick={onClose}>Close ×</button></div>{children}</dialog>;
}
