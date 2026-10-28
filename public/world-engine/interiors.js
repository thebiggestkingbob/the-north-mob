// Walk-through buildings share world coordinates with the street: no teleporting or redirects.
export function createInteriors(THREE,scene,sites){
 const group=new THREE.Group();scene.add(group);
 const solid=[],exhibits=[],loaded=new Set();
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.82});
 const dark=mat(0x181818),floor=mat(0x333333),white=mat(0xe9e5df),steel=mat(0x555555);
 const loader=new THREE.TextureLoader();
 let content={};
 const ready=fetch('/api/world/exhibits',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Exhibits '+r.status);return r.json()}).then(d=>{content=d;return d}).catch(e=>{console.warn('World exhibits',e);return null});
 function block(x,y,z,w,h,d,m,collide=false){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);
  if(collide)solid.push({x,z,w,d});return mesh;
 }
 function textMesh(label,width=3,height=.6){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#e9e5df';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#111';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 85px Arial';ctx.fillText(label,512,130,975);
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));
 }
 function label(t,x,y,z,w=3){const mesh=textMesh(t,w);mesh.position.set(x,y,z);group.add(mesh);return mesh}
 function art(item,x,y,z,rotation=0,w=2.6,h=2.3){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xdedbd4,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=rotation;group.add(mesh);
  if(item.image&&item.image.startsWith('/'))loader.load(item.image,texture=>{mesh.material.dispose();mesh.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});},undefined,()=>{});
  return mesh;
 }
 function populate(site){
  if(loaded.has(site.id))return;loaded.add(site.id);
  const {x,z,w,d,h,id}=site,front=z+d/2,back=z-d/2;
  const items=(content[id]||[]).slice(0,id==='shop'?18:12);
  // Full-size interiors: walls and displays occupy the same physical building as its facade.
  block(x,0,z,w,.15,d,floor);
  block(x,h-.15,z,w,.3,d,dark);
  block(x-w/2+.16,h/2,z,.32,h,d,dark,true);
  block(x+w/2-.16,h/2,z,.32,h,d,dark,true);
  block(x,h/2,back+.16,w,h,.32,dark,true);
  // Street-facing doorway stays open: two facade segments, no invisible wall.
  const segment=(w-3.4)/2;
  block(x-(w+3.4)/4,h/2,front-.15,segment,h,.3,dark,true);
  block(x+(w+3.4)/4,h/2,front-.15,segment,h,.3,dark,true);
  block(x,h-.6,front-.15,3.4,1.2,.3,white);
  const title=label(site.title,x,h-1,back+.38,Math.min(w-2,9));
  // Wall gallery: artwork on the side and rear walls, never in the middle of the room.
  if(id==='museum'||id==='cinema'||id==='studio'){
   items.slice(0,9).forEach((item,i)=>{
    const side=i%3,slot=Math.floor(i/3);
    if(side===0){const zz=front-2.3-slot*2.8;art(item,x-w/2+.37,3.4,zz,Math.PI/2,2.4,2.7);exhibits.push({item,x:x-w/2+1.8,z:zz,site:id})}
    else if(side===1){const zz=front-2.3-slot*2.8;art(item,x+w/2-.37,3.4,zz,-Math.PI/2,2.4,2.7);exhibits.push({item,x:x+w/2-1.8,z:zz,site:id})}
    else{const xx=x-3+slot*3;art(item,xx,3.4,back+.38,0,2.4,2.7);exhibits.push({item,x:xx,z:back+1.8,site:id})}
   });
  }
  if(id==='shop'){
   // Perimeter fixtures leave a central aisle. Product photographs hang above real display plinths.
   items.forEach((item,i)=>{
    const left=i%2===0,slot=Math.floor(i/2),zz=front-2-slot*1.22;
    if(zz<back+1.1)return;
    const xx=x+(left?-w/2+1.25:w/2-1.25);
    block(xx,.7,zz,1.65,1.4,.9,steel,true);
    const wallX=x+(left?-w/2+.38:w/2-.38);
    art(item,wallX,2.9,zz,left?Math.PI/2:-Math.PI/2,1.05,1.5);
    exhibits.push({item,x:xx+(left?1.5:-1.5),z:zz,site:id});
   });
   // Upper-floor balcony / architectural mezzanine, kept visually separate from ground-floor path.
   block(x,5.4,back+2.6,w-1,.25,4.5,steel);
   for(const xx of [x-w/2+1,x+w/2-1])block(xx,6.4,back+4.7,.15,1.8,.15,white);
   label('MOB SHOP · UPPER GALLERY',x,7,back+.38,6);
  }
  if(id==='cinema'){block(x,2.8,back+.48,w-2,4.5,.18,white);for(const xx of [x-3.5,x,x+3.5])block(xx,.5,z+1,2.2,1,1.4,steel,true)}
  if(id==='studio'){block(x,.8,z,4,1.6,2,steel,true);label('LISTEN · H4B',x,2,z-1.2,3.6)}
  if(id==='live'){block(x,.7,back+2,w-2,1.4,3.2,steel,true);label('LIVE · THE MOB',x,3.5,back+.42,6)}
  if(!items.length)label('MORE COMING SOON',x,2.5,back+.4,5);
 }
 function near(x,z){
  let best=null,dist=2.1;
  for(const exhibit of exhibits){const d=Math.hypot(x-exhibit.x,z-exhibit.z);if(d<dist){best={kind:'exhibit',title:exhibit.item.name,item:exhibit.item};dist=d}}
  return best;
 }
 function blocked(x,z){
  const radius=.38;
  return solid.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);
 }
 function inside(x,z){return sites.find(s=>Math.abs(x-s.x)<s.w/2-.3&&Math.abs(z-s.z)<s.d/2-.3)||null}
 // Fill rooms after published data arrives; street remains playable while fetching.
 ready.then(()=>sites.forEach(populate));
 return {ready,near,blocked,inside};
}
