import type { Metadata } from "next";
import { ShopMotion } from "@/components/shop-motion";
import { ShopGallery } from "@/components/shop-gallery";
import "./shop.css";
export const metadata:Metadata={title:"Shop"};
export default function Shop(){return <ShopMotion><main id="main" className="page shop-page merch-page"><header className="merch-heading"><p className="eyebrow">THE NORTH MOB</p><h1 tabIndex={-1}>OBJECTS /<br/>MERCHANDISE</h1><p className="eyebrow">HERE 4 BUSINESS.</p></header><ShopGallery/></main></ShopMotion>;}
