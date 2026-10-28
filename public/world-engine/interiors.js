// Spatial rooms and exhibits: no navigation away from the 3D engine.
export function createInteriors(THREE,scene){
 const group=new THREE.Group();scene.add(group);group.visible=false;
 const material=(hex)=>new THREE.MeshStandardMaterial({color:hex,roughness:.8});
 const wall=material(0x171717),floor=material(0x383838),ivory=material(0xe9e5db),plinth=material(0x252525);
 const add=(w,h,d,x,y,z,m)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);group.add(mesh);return mesh};
 const sign=(text,w=6,h=1)=>{
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae0';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#080808';ctx.font='bold 92px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,130,980);
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));
 };
 const textureLoader=new THREE.TextureLoader();
 let current=null,exhibits=[],original=[],onLeave=null,content={};
 const roomThemes={
  shop:{title:'MOB SHOP',caption:'THE MERCH FLOOR',accent:0xd9d6cf},
  studio:{title:'THE STUDIO',caption:'RECORDS · H4B',accent:0xbcb2c8},
  cinema:{title:'VISUALS CINEMA',caption:'WATCH THE VISUALS',accent:0xa1a1a1},
  museum:{title:'MOB MUSEUM',caption:'THE ARCHIVE',accent:0xd6c4a4},
  live:{title:'LIVE YARD',caption:'SHOWS · TICKETS',accent:0xa7a7a7}
 };
 function clear(){while(group.children.length){const o=group.children[0];group.remove(o);o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();if(o.material&&!Array.isArray(o.material))o.material.dispose();}exhibits=[]}
 function loadContent(){return fetch('/api/world/exhibits',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('World exhibits '+r.status);return r.json()}).then(data=>{content=data;return data}).catch(error=>{console.warn('Exhibits unavailable',error);return null})}
 const ready=loadContent();
 function enter(site,leave){
  onLeave=leave;current=site;original=scene.children.filter(o=>o!==group&&!o.isLight);
  original.forEach(o=>o.visible=false);group.visible=true;clear();
  const theme=roomThemes[site.id],items=(content[site.id]||[]).slice(0,12);
  // An actual room with floor, ceiling, side walls and a doorway at the front.
  add(20,.3,27,0,-.16,0,floor);add(20,.3,27,0,7.6,0,wall);
  add(.35,7.5,27,-10,3.7,0,wall);add(.35,7.5,27,10,3.7,0,wall);
  add(20,7.5,.35,0,3.7,-13.5,wall);
  add(7.5,7.5,.35,-6.25,3.7,13.5,wall);add(7.5,7.5,.35,6.25,3.7,13.5,wall);
  add(5,.35,.4,0,7.2,13.5,ivory);
  const title=sign(theme.title,9,1.5);title.position.set(0,5.8,-13.24);group.add(title);
  const subtitle=sign(theme.caption,6,.8);subtitle.position.set(0,4.5,-13.23);group.add(subtitle);
  // Category-specific 3D architecture.
  if(site.id==='cinema'){add(14,5,.3,0,3,-13.15,ivory);for(let i=0;i<3;i++)for(let j=0;j<5;j++)add(1.2,.7,1.4,-6+j*3,.5,-1+i*3,plinth)}
  if(site.id==='studio'){for(let i=0;i<3;i++){add(2,.2,1.2,-6+i*6,1.1,-10,ivory);add(1.8,1,.6,-6+i*6,1.7,-10,plinth)}}
  if(site.id==='live'){add(14,1.2,5,0,.6,-10,plinth);for(const x of [-6,6])add(.4,5,.4,x,3.3,-11,ivory)}
  if(site.id==='shop'){for(const x of [-8.6,8.6])for(const z of [-9,-3,3]){add(1.5,2,.8,x,1,z,plinth);add(1.7,.12,1.1,x,2.1,z,ivory)}}
  if(site.id==='museum'){for(const x of [-9.6,9.6])for(const z of [-9,-3,3])add(.12,3,4,x,3,z,ivory)}
  const positions=[[-6,-8],[0,-8],[6,-8],[-6,-2],[0,-2],[6,-2],[-6,4],[0,4],[6,4],[-6,9],[0,9],[6,9]];
  const available=items.length?items:[{name:site.id==='live'?'NO UPCOMING EVENTS':'CONTENT COMING SOON',description:'Check back for published updates.'}];
  available.forEach((item,i)=>{
   const [x,z]=positions[i];if(x===undefined)return;
   const stand=add(3.6,.9,1.6,x,.45,z,plinth);
   const label=sign((item.name||'EXHIBIT').slice(0,25),3.5,.65);label.position.set(x,1.25,z+.85);group.add(label);
   const art=add(2.7,2.1,.1,x,2.65,z,ivory);
   if(item.image&&typeof item.image==='string'&&item.image.startsWith('/')){
    textureLoader.load(item.image,texture=>{if(current!==site){texture.dispose();return;}art.material.dispose();art.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});},undefined,()=>{});
   }
   exhibits.push({item,x,z});
  });
  const exitSign=sign('EXIT TO STREET',4.6,.7);exitSign.position.set(0,3.8,13.1);exitSign.rotation.y=Math.PI;group.add(exitSign);
  return {x:0,z:10,yaw:0};
 }
 function exit(){current=null;group.visible=false;clear();original.forEach(o=>o.visible=true);original=[];onLeave?.();onLeave=null}
 function near(x,z){
  if(!current)return null;
  if(z>11&&Math.abs(x)<4)return {kind:'exit',title:'EXIT TO STREET'};
  let best=null,dist=2.8;
  for(const exhibit of exhibits){const d=Math.hypot(x-exhibit.x,z-(exhibit.z+2));if(d<dist){dist=d;best={kind:'exhibit',title:exhibit.item.name,item:exhibit.item}}}
  return best;
 }
 function blocked(x,z){return Math.abs(x)>9.2||z< -12.5||z>12.7}
 return {enter,exit,near,blocked,get active(){return !!current},ready};
}
