// Walk-through buildings share world coordinates with the street: no teleporting or redirects.
export function createInteriors(THREE,scene,sites){
 const group=new THREE.Group();scene.add(group);
 const solid=[],exhibits=[],loaded=new Set(),walls=[];
 const upperExhibits=[];
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.82});
 const dark=mat(0x181818),floor=mat(0x333333),white=mat(0xe9e5df),steel=mat(0x555555);
 const loader=new THREE.TextureLoader();
 let content={};
 const ready=fetch('/api/world/exhibits',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Exhibits '+r.status);return r.json()}).then(d=>{content=d;return d}).catch(e=>{console.warn('World exhibits',e);return null});
 function block(x,y,z,w,h,d,m,collide=false){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);
  if(collide){solid.push({x,z,w,d,y,h});if(h>3)walls.push(mesh)}return mesh;
 }
 function textMesh(label,width=3,height=.6){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#e9e5df';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#111';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 85px Arial';ctx.fillText(label,512,130,975);
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));
 }
 function label(t,x,y,z,w=3){const mesh=textMesh(t,w);mesh.position.set(x,y,z);group.add(mesh);return mesh}
 function art(item,x,y,z,rotation=0,maxW=3,maxH=3){
  const material=new THREE.MeshBasicMaterial({color:0xdedbd4,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(maxW,maxH),material);mesh.position.set(x,y,z);mesh.rotation.y=rotation;group.add(mesh);
  if(item.image&&(item.image.startsWith('/')||item.image.startsWith('https://i.ytimg.com/'))){
   loader.load(item.image,texture=>{
    const image=texture.image;if(!image)return;
    const aspect=image.width/image.height;const w=Math.min(maxW,maxH*aspect),h=w/aspect;
    mesh.geometry.dispose();mesh.geometry=new THREE.PlaneGeometry(w,h);
    mesh.material.dispose();mesh.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
   },undefined,()=>{});
  }
  return mesh;
 }
 // Lightweight sculptural product forms make merchandise occupy real 3D space.
 // The authentic product image remains alongside each form until dedicated GLB assets exist.
 function merchSculpture(item,x,z,y=1.45){
  const name=(item.name||'').toLowerCase();
  const blackMat=mat(0x111111),lightMat=mat(0xdad7d0);
  const piece=new THREE.Group();piece.position.set(x,y,z);group.add(piece);
  const part=(w,h,d,px,py,pz,m=blackMat)=>{
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
   mesh.position.set(px,py,pz);mesh.castShadow=true;piece.add(mesh);return mesh;
  };
  if(/cap|bucket|beanie|hat/.test(name)){
   const crown=new THREE.Mesh(new THREE.CylinderGeometry(.39,.44,.45,16),blackMat);crown.position.y=.35;piece.add(crown);
   const brim=new THREE.Mesh(new THREE.CylinderGeometry(.68,.68,.065,20),lightMat);brim.position.y=.12;piece.add(brim);
  }else if(/mug|cup/.test(name)){
   const mug=new THREE.Mesh(new THREE.CylinderGeometry(.28,.25,.65,16),lightMat);mug.position.y=.35;piece.add(mug);
   const handle=new THREE.Mesh(new THREE.TorusGeometry(.2,.055,8,16,Math.PI*1.5),blackMat);handle.position.set(.31,.36,0);piece.add(handle);
  }else if(/chain|necklace|keyring/.test(name)){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.06,8,20),lightMat);ring.position.y=.52;piece.add(ring);
   part(.32,.42,.09,0,.1,0,blackMat);
  }else if(/tote|bag/.test(name)){
   part(.9,.85,.22,0,.43,0,lightMat);
   const strap=new THREE.Mesh(new THREE.TorusGeometry(.28,.045,8,20,Math.PI),blackMat);strap.position.y=1;piece.add(strap);
  }else if(/skirt|pants|trouser/.test(name)){
   part(.9,.85,.3,0,.5,0,blackMat);
   part(.36,.55,.3,-.24,-.12,0,blackMat);part(.36,.55,.3,.24,-.12,0,blackMat);
  }else{
   // Garment silhouette: body and sleeves (not a substitute for a true product model).
   part(.85,.95,.22,0,.45,0,blackMat);
   part(.35,.42,.22,-.58,.72,0,blackMat);
   part(.35,.42,.22,.58,.72,0,blackMat);
  }
  return piece;
 }
 function populate(site){
  if(loaded.has(site.id))return;loaded.add(site.id);
  const {x,z,w,d,h,id}=site,front=z+d/2,back=z-d/2;
  const items=(content[id]||[]);
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
   items.forEach((item,i)=>{
    const side=i%3,slot=Math.floor(i/3),spacing=2.9,perWall=Math.max(1,Math.floor((d-3)/spacing)),row=Math.floor(slot/perWall),position=slot%perWall;
    if(side===0&&front-2.3-position*spacing>back+1.3){const zz=front-2.3-position*spacing;art(item,x-w/2+.37,3.4+row*2.8,zz,Math.PI/2,2.4,2.7);exhibits.push({item,x:x-w/2+1.8,z:zz,site:id})}
    else if(side===1&&front-2.3-position*spacing>back+1.3){const zz=front-2.3-position*spacing;art(item,x+w/2-.37,3.4+row*2.8,zz,-Math.PI/2,2.4,2.7);exhibits.push({item,x:x+w/2-1.8,z:zz,site:id})}
    else if(side===2&&x-w/2+2.1+position*2.9<x+w/2-1){const xx=x-w/2+2.1+position*2.9;art(item,xx,3.4+row*2.8,back+.38,0,2.4,2.7);exhibits.push({item,x:xx,z:back+1.8,site:id})}
   });
  }
  if(id==='shop'){
   // Perimeter fixtures leave a central aisle. Product photographs hang above real display plinths.
   items.forEach((item,i)=>{
    const left=i%2===0,slot=Math.floor(i/2),zz=front-2.4-slot*2.35;
    if(zz<back+1.5)return;
    const xx=x+(left?-w/2+1.25:w/2-1.25);
    block(xx,.7,zz,1.65,1.4,.9,steel,true);
    merchSculpture(item,xx,zz);
    const wallX=x+(left?-w/2+.38:w/2-.38);
    art(item,wallX,3.1,zz,left?Math.PI/2:-Math.PI/2,2.05,2.6);
    exhibits.push({item,x:xx+(left?1.5:-1.5),z:zz,site:id});
   });
   // Walkable mezzanine with a stairway, rails and additional merchandise.
   const upperY=4.7,stairs=10,stepH=upperY/stairs;
   const stairX=x+w/2-3.2,stairStart=front-3.8;
   for(let i=0;i<stairs;i++){
    const depth=.72,zz=stairStart-i*depth;
    block(stairX,(i+1)*stepH/2,zz,2.2,(i+1)*stepH,depth,steel,false);
   }
   // Balcony floor occupies the rear half; the front remains open to the shop below.
   const balconyFront=stairStart-stairs*.72+.4,balconyBack=back+.25,balconyDepth=balconyFront-balconyBack;
   block(x,upperY-.14,(balconyFront+balconyBack)/2,w-.7,.28,balconyDepth,steel);
   // Leave the stair landing clear and protect the rest of the balcony edge.
   block(x-(w-4)/4,upperY+.55,balconyFront,(w-4)/2,1.1,.12,white,true);
   for(const item of items.slice(8)){
    const i=items.indexOf(item)-8,side=i%2===0?-1:1,slot=Math.floor(i/2);
    const zz=balconyFront-1.7-slot*2.2;
    if(zz<balconyBack+1.2)continue;
    const xx=x+side*(w/2-1.45);
    art(item,x+side*(w/2-.4),upperY+2.1,zz,side<0?Math.PI/2:-Math.PI/2,2,2.4);
    const plinthX=x+side*(w/2-1.8);
    block(plinthX,upperY+.45,zz,1.5,.9,.85,steel,true);
    merchSculpture(item,plinthX,zz,upperY+.9);
    upperExhibits.push({item,x:xx-side*1.3,z:zz,site:id});
   }
   label('UPSTAIRS · MOB COLLECTION',x,upperY+2.8,back+.38,7);

  }
  if(id==='cinema'){block(x,2.8,back+.48,w-2,4.5,.18,white);for(const xx of [x-3.5,x,x+3.5])block(xx,.5,z+1,2.2,1,1.4,steel,true)}
  if(id==='studio'){block(x,.8,z,4,1.6,2,steel,true);label('LISTEN · H4B',x,2,z-1.2,3.6)}
  if(id==='live'){block(x,.7,back+2,w-2,1.4,3.2,steel,true);label('LIVE · THE MOB',x,3.5,back+.42,6)}
  if(!items.length)label('MORE COMING SOON',x,2.5,back+.4,5);
 }
 function near(x,z,y=0){
  let best=null,dist=2.1;
  for(const exhibit of (y>2?upperExhibits:exhibits)){const d=Math.hypot(x-exhibit.x,z-exhibit.z);if(d<dist){best={kind:'exhibit',title:exhibit.item.name,item:exhibit.item};dist=d}}
  return best;
 }
 function floorHeight(x,z,current=0){
  const shop=sites.find(s=>s.id==='shop');if(!shop)return 0;
  const upper=4.7,front=shop.z+shop.d/2,back=shop.z-shop.d/2;
  const stairX=shop.x+shop.w/2-3.2,stairStart=front-3.8;
  const stairEnd=stairStart-10*.72;
  const onStairs=Math.abs(x-stairX)<1.25&&z<=stairStart+.4&&z>=stairEnd-.4;
  if(onStairs)return Math.max(0,Math.min(upper,(stairStart-z)/(.72*10)*upper));
  const onBalcony=Math.abs(x-shop.x)<shop.w/2-.4&&z<=stairEnd+.4&&z>back+.35;
  // Only stay upstairs when arriving from the stairs / already on the upper floor.
  if(onBalcony&&current>upper-1.2)return upper;
  return 0;
 }
 function blocked(x,z,y=0){
  const radius=.38,foot=y+.15,head=y+1.75;
  return solid.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius&&head>b.y-b.h/2&&foot<b.y+b.h/2);
 }
 function cameraWalls(){return walls}
 function cameraSolids(){return group.children.filter(o=>o.isMesh&&o.geometry?.type==='BoxGeometry')}
 function inside(x,z){return sites.find(s=>Math.abs(x-s.x)<s.w/2-.3&&Math.abs(z-s.z)<s.d/2-.3)||null}
 // Fill rooms after published data arrives; street remains playable while fetching.
 ready.then(()=>sites.forEach(populate));
 return {ready,near,blocked,inside,cameraWalls,cameraSolids,floorHeight,get content(){return content}};
}
