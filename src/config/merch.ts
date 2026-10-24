import images from "./merch-images.json";
export type MerchStatus="available"|"sold-out"|"coming-soon";
export type MerchImage={src:string;width:number;height:number;alt:string;original:string};
export type MerchProduct={id:string;name:string;description:string;category:string;price:number;status:MerchStatus;stock:number;images:MerchImage[];variants:{id:string;label:string;image?:number;price?:number}[];variantLabel?:string;note?:string;limitedEdition?:boolean};
function photos(files:string[],name:string):MerchImage[]{return files.map((file,index)=>{const image=images.find(image=>image.original===file+".png");if(!image)throw new Error(`Missing merch image: ${file}`);return {src:image.web,width:image.width,height:image.height,original:image.original,alt:`${name} — supplied merchandise photograph ${index+1}`};});}
function product(id:string,name:string,description:string,category:string,price:number,status:MerchStatus,stock:number,files:string[],extra:Partial<MerchProduct>={}):MerchProduct{return {id,name,description,category,price:price*100,status,stock,images:photos(files,name),variants:[],...extra};}
const sizing="Garment sizing has not been supplied.";
export const merch:MerchProduct[]=[
 product("h4b-print","H4B Photo Print","The collective in monochrome, shown as a statement photograph for your wall.","Print",199,"coming-soon",0,["0"],{note:"The image shows a framed presentation. Frame inclusion and print dimensions are not confirmed."}),
 product("lineup-tee","Lineup Tee","Black tee with a discreet chest mark and bold collective names across the back.","T-shirt",299,"available",12,["1.1","1.2"],{note:sizing}),
 product("portrait-tank","Portrait Tank","Black sleeveless top pairing the North Mob chest mark with H4B portrait artwork.","Sleeveless top",249,"sold-out",0,["2"],{note:sizing}),
 product("h4b-features-tee","H4B Features Tee","Light-coloured tee with collective photography and featured-artist cards on the reverse.","T-shirt",349,"available",10,["Vintage H4B T-Shirt Merch Mockup (1)"],{note:sizing}),
 product("mob-hoodie","Mob Hoodie","Black hooded sweatshirt carrying the North Mob mark and H4B group portrait.","Hoodie",599,"available",8,["4.1","4.2"],{note:sizing}),
 product("business-long-sleeve","Business Long Sleeve","White long sleeve with chest branding, sleeve lettering and the collective lineup.","Long sleeve",399,"available",10,["5.1","5.2"],{note:sizing}),
 product("mob-beanie","Mob Beanie","Black beanie with a folded cuff and a contrasting North Mob logo patch.","Beanie",199,"available",15,["6"]),
 product("mob-socks","Mob Socks","White socks with the North Mob logo positioned below the ribbed cuffs.","Socks",129,"sold-out",0,["7"],{note:"Sock sizing has not been supplied."}),
 product("mob-flag","Mob Flag","The North Mob wordmark fills a hanging flag in contrasting black and light colourways.","Flag",249,"coming-soon",0,["8.1","8.2"],{variantLabel:"Colour",variants:[{id:"light",label:"Light",image:0},{id:"black",label:"Black",image:1}],note:"Flag dimensions and fixing details have not been supplied. No release date is confirmed."}),
 product("mob-tote","Mob Tote","Black tote with long handles and a large contrasting North Mob mark.","Tote bag",199,"available",15,["9"]),
 product("h4b-mug","H4B Mug","North Mob and Here 4 Business lettering wrap the pictured black and white mugs.","Mug",149,"available",12,["10"],{variantLabel:"Colour",variants:[{id:"black",label:"Black"},{id:"white",label:"White"}],note:"Price is per mug. Both colours appear in the supplied photograph; capacity is unconfirmed."}),
 product("h4b-keyring","H4B Keyring","Choose the North Mob logo, H4B lettering or collective photograph as your keyring design.","Keyring",99,"available",24,["11.1","11.2","11.3","11.4"],{variantLabel:"Design",variants:[{id:"logo",label:"North Mob logo",image:1},{id:"portrait",label:"H4B photograph",image:2},{id:"business",label:"Here 4 Business",image:3}],note:"Price is per keyring. The first photograph shows the design collection."}),
 product("mob-stickers","Mob Sticker Sheet","A monochrome sticker sheet collecting North Mob logos, artist portraits and H4B graphics.","Stickers",79,"available",30,["12"]),
 product("mob-cap","Mob Cap","Black cap with the North Mob mark at the front and H4B lettering at the back.","Cap",249,"coming-soon",0,["13"],{note:"Stock and sizing have not been confirmed."}),
 product("mob-string-bucket-hat","Mob String Bucket Hat","Black bucket hat with chin cords, the North Mob mark and H4B lettering.","Bucket hat",399,"coming-soon",0,["14"],{note:"Stock and sizing have not been confirmed."}),
 product("h4b-worksuit","H4B Worksuit","Matching black utility vest and trousers with contrasting bands and North Mob / H4B details.","Worksuit",1099,"coming-soon",0,["15","15.1","15.2","15.3"],{limitedEdition:true,note:"Limited Edition. Garment sizing, stock quantities and release date have not been supplied."}),
 product("h4b-crop-skirt-set","H4B Crop & Skirt Set","Matching black crop top and pleated skirt with North Mob and Here 4 Business lettering.","Two-piece set",699,"coming-soon",0,["16","16.1","16.2"],{limitedEdition:true,note:"Price includes the crop top and skirt together. Sizes, stock quantities and release date are unconfirmed."}),
 product("mob-pendant-chains","Mob Pendant Chains","Choose the North Mob logo pendant, the Here 4 Business pendant, or both chains together.","Chains",299,"coming-soon",0,["17","17.2","17.3"],{limitedEdition:true,variantLabel:"Chain selection",variants:[{id:"pair",label:"Both chains",image:0,price:49900},{id:"h4b",label:"Here 4 Business chain",image:1,price:29900},{id:"mob",label:"North Mob logo chain",image:2,price:29900}],note:"Each single option includes one pictured pendant and chain; the pair includes both. Metal composition, chain length, stock and release date are unconfirmed."}),
];
export const demoDelivery={delivery:7900,collection:0};
export const money=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",minimumFractionDigits:0,maximumFractionDigits:2}).format(cents/100);
export function findMerch(id:string){return merch.find(product=>product.id===id);}

export const productPrice=(product:MerchProduct,variant:string)=>product.variants.find(option=>option.id===variant)?.price??product.price;
export const hasPriceRange=(product:MerchProduct)=>new Set([product.price,...product.variants.map(option=>option.price??product.price)]).size>1;
