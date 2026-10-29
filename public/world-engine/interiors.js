// Walk-through buildings share world coordinates with the street: no teleporting or redirects.
export function createInteriors(THREE,scene,sites){
 const group=new THREE.Group();scene.add(group);
 const solid=[],exhibits=[],loaded=new Set(),walls=[];
 const upperExhibits=[];
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.82});
 const dark=mat(0x181818),floor=mat(0x333333),white=mat(0xe9e5df),steel=mat(0x555555);
 const loader=new THREE.TextureLoader();
 // Model manifest is optional: a missing asset always leaves the existing 3D proxy visible.
 let modelLoaderPromise;
 const modelCache=new Map();
 function loadModel(item,piece){
  const url=item.model;
  if(typeof url!=='string'||!url.startsWith('/world-engine/models/')||!url.endsWith('.glb')||url.includes('..')||!/^[-a-z0-9_/\.]+$/i.test(url))return;
  if(!modelLoaderPromise)modelLoaderPromise=import('/world-engine/GLTFLoader.js').then(m=>new m.GLTFLoader());
  modelLoaderPromise.then(gltfLoader=>{
   if(!modelCache.has(url))modelCache.set(url,new Promise((resolve,reject)=>gltfLoader.load(url,resolve,undefined,reject)));
   return modelCache.get(url);
  }).then(gltf=>{
   if(!gltf)return;
   const model=gltf.scene.clone(true);
   const bounds=new THREE.Box3().setFromObject(model);
   const size=bounds.getSize(new THREE.Vector3());
   if(size.x<=0||size.y<=0||size.z<=0)return;
   const scale=Math.min(1.45/size.x,1.65/size.y,1.1/size.z);
   model.scale.setScalar(scale);
   const fitted=new THREE.Box3().setFromObject(model);
   const center=fitted.getCenter(new THREE.Vector3());
   model.position.set(-center.x,.82-fitted.min.y,-center.z);
   piece.clear();piece.add(model);
  }).catch(error=>console.warn('Merch model unavailable:',url,error));
 }
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
  const cylinder=(top,bottom,height,px,py,pz,m=blackMat,segments=16)=>{
   const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,segments),m);
   mesh.position.set(px,py,pz);mesh.castShadow=true;piece.add(mesh);return mesh;
  };
  if(/bucket/.test(name)){
   cylinder(.34,.53,.52,0,.38,0);
   cylinder(.67,.67,.07,0,.12,0,blackMat,24);
  }else if(/cap/.test(name)){
   const crown=new THREE.Mesh(new THREE.SphereGeometry(.44,16,10,0,Math.PI*2,0,Math.PI/2),blackMat);
   crown.position.y=.28;piece.add(crown);
   const brim=new THREE.Mesh(new THREE.BoxGeometry(.77,.07,.43),blackMat);
   brim.position.set(0,.17,.39);piece.add(brim);
  }else if(/beanie|hat/.test(name)){
   cylinder(.34,.44,.55,0,.4,0);
   cylinder(.45,.45,.16,0,.17,0,lightMat);
  }else if(/mug|cup/.test(name)){
   cylinder(.29,.26,.65,0,.38,0,lightMat);
   const handle=new THREE.Mesh(new THREE.TorusGeometry(.2,.055,8,16,Math.PI*1.5),blackMat);
   handle.position.set(.32,.38,0);piece.add(handle);
  }else if(/chain|necklace/.test(name)){
   const chain=new THREE.Mesh(new THREE.TorusGeometry(.37,.035,8,32,Math.PI*1.7),lightMat);
   chain.rotation.z=Math.PI;chain.position.y=.65;piece.add(chain);
   part(.38,.43,.08,0,.12,0,lightMat);
  }else if(/keyring/.test(name)){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.28,.045,8,20),lightMat);
   ring.position.y=.55;piece.add(ring);
   part(.32,.35,.08,0,.12,0,lightMat);
  }else if(/tote|bag/.test(name)){
   part(.95,.85,.24,0,.4,0,lightMat);
   const strap=new THREE.Mesh(new THREE.TorusGeometry(.29,.045,8,20,Math.PI),blackMat);
   strap.position.y=1;piece.add(strap);
  }else if(/skirt|pants|trouser/.test(name)){
   part(.9,.85,.3,0,.5,0);
   part(.36,.55,.3,-.24,-.12,0);part(.36,.55,.3,.24,-.12,0);
  }else if(/hoodie|hood/.test(name)){
   part(.95,1.05,.34,0,.45,0);
   part(.32,.86,.32,-.66,.42,0);
   part(.32,.86,.32,.66,.42,0);
   const hood=new THREE.Mesh(new THREE.TorusGeometry(.28,.13,8,16,Math.PI),blackMat);
   hood.rotation.z=Math.PI;hood.position.set(0,1.03,-.13);piece.add(hood);
   part(.42,.18,.04,0,.18,.19,lightMat);
  }else if(/shirt|tee|crop|long sleeve|sleeveless/.test(name)){
   const crop=/crop/.test(name),long=/long sleeve/.test(name),sleeveless=/sleeveless/.test(name);
   part(.86,crop?.55:.9,.2,0,crop?.64:.45,0);
   if(!sleeveless){
    part(.3,long?.85:.32,.2,-.57,long?.5:.77,0);
    part(.3,long?.85:.32,.2,.57,long?.5:.77,0);
   }
  }else{
   part(.85,.9,.22,0,.45,0);
   part(.3,.38,.22,-.57,.72,0);part(.3,.38,.22,.57,.72,0);
  }
  // A real product photo is mapped to the front as an honest visual reference.
  // The shape remains a stylised proxy until a dedicated textured GLB is supplied.
  if(item.image&&(item.image.startsWith('/')||item.image.startsWith('https://i.ytimg.com/'))){
   const badge=new THREE.Mesh(new THREE.PlaneGeometry(.58,.58),new THREE.MeshBasicMaterial({transparent:true,side:THREE.DoubleSide}));
   badge.position.set(0,.55,.22);piece.add(badge);
   loader.load(item.image,texture=>{
    const image=texture.image;if(!image)return;
    const aspect=image.width/image.height;
    badge.geometry.dispose();const bw=aspect>=1?.6:.6*aspect,bh=aspect>=1?.6/aspect:.6;
    badge.geometry=new THREE.PlaneGeometry(bw,bh);
    badge.material.map=texture;badge.material.needsUpdate=true;
   },undefined,()=>{piece.remove(badge)});
  }
  loadModel(item,piece);
  return piece;
 }
 // Reusable low-poly retail fixtures. Every piece is geometry, not a billboard.
 function retailRack(x,z,side=1,y=0){
  const pole=mat(0xc8c8c8);
  block(x,y+.08,z,2.65,.16,.65,dark,true);
  for(const dx of [-1.15,1.15])block(x+dx,y+1.15,z,.11,2.2,.11,pole);
  block(x,y+2.25,z,2.5,.11,.11,pole);
  for(let i=0;i<5;i++){
   const xx=x-1+i*.5;
   const hanger=new THREE.Group();hanger.position.set(xx,y+2.05,z);group.add(hanger);
   const shirt=new THREE.Mesh(new THREE.BoxGeometry(.36,.6,.13),i%2?white:dark);
   shirt.position.y=-.36;hanger.add(shirt);
  }
 }
 function mannequin(x,z,y=0){
  const stand=mat(0xb9b7b1);
  block(x,y+.055,z,.75,.11,.75,stand,true);
  block(x,y+.9,z,.07,1.65,.07,stand);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.29,.39,.95,8),dark);
  torso.position.set(x,y+1.55,z);group.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),white);
  head.position.set(x,y+2.22,z);group.add(head);
 }
 function shopAtmosphere(site,upperY){
  const {x,z,w,d}=site,front=z+d/2,back=z-d/2;
  // Structural columns, strip lighting, and a clear central circulation spine.
  for(const xx of [x-w/2+1,x+w/2-1]){
   for(const zz of [front-4.5,back+3]){
    block(xx,2.35,zz,.32,4.7,.32,steel);
   }
  }
  for(const zz of [front-3.5,z,back+3]){
   const lamp=block(x,4.32,zz,8,.12,.22,white);
   lamp.material=mat(0xf2f0e9);
   lamp.material.emissive=new THREE.Color(0x888888);
   const glow=new THREE.PointLight(0xfff4e6,9,13,2);
   glow.position.set(x,4.08,zz);group.add(glow);
  }
  // Two freestanding racks deliberately avoid the staircase and entry.
  retailRack(x-4.1,z+2.5,-1);
  retailRack(x-4.1,z-3,-1);
  mannequin(x+2.3,z+2.3);
  // Upper level has a small curated showroom, without blocking the landing.
  mannequin(x-3.3,back+2.3,upperY);
  retailRack(x-3.5,back+4.8,-1,upperY);
 }
 // THE STUDIO: a walkable recording room, built from geometry rather than flat murals.
 function studioAtmosphere(site){
  const {x,z,w,d}=site,back=z-d/2;
  const consoleZ=z-1.5;
  // Mixing desk with individual faders, monitor displays and studio speakers.
  block(x,.86,consoleZ,4.5,.3,1.45,steel,true);
  block(x,1.28,consoleZ-.46,4.2,.12,.4,dark);
  for(let i=0;i<12;i++){
   const xx=x-1.9+i*.34;
   block(xx,1.05,consoleZ+.18,.045,.035,.5,i%3===0?white:dark);
  }
  for(const xx of [x-1.15,x+1.15]){
   block(xx,1.7,consoleZ-.56,1.55,.92,.13,dark);
   const screen=block(xx,1.72,consoleZ-.475,1.34,.66,.025,mat(0x292929));
   screen.material.emissive=new THREE.Color(0x161616);
  }
  for(const xx of [x-3.35,x+3.35]){
   block(xx,1.35,consoleZ-.3,.78,1.65,.68,dark,true);
   for(const yy of [.96,1.65]){
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.035,24),white);
    cone.rotation.x=Math.PI/2;cone.position.set(xx,yy,consoleZ+.055);group.add(cone);
   }
  }
  // Vocal booth is set against the rear wall; keep the entrance and side aisles free.
  const boothX=x+3.3,boothZ=back+2.3;
  block(boothX,1.25,boothZ,2.6,.12,2.8,steel);
  for(const dx of [-1.3,1.3])block(boothX+dx,2.2,boothZ,.11,4.4,2.8,steel);
  block(boothX,2.2,boothZ-1.35,2.6,4.4,.11,steel);
  const mic=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.23,5,10),white);
  mic.position.set(boothX,1.65,boothZ);group.add(mic);
  block(boothX,1.04,boothZ,.06,1.85,.06,white);
  label('VOCAL BOOTH',boothX,3.5,boothZ-1.25,2.2);
  // Published album is the listening centerpiece; the console offers track selection.
  const album=(content.album||[]).find(a=>a.spotify)||null;
  if(album){
   art(album,x-3.15,2.55,back+.42,0,3.1,3.1);
   exhibits.push({item:album,x:x-3.15,z:back+1.85,site:'studio'});
   label('E · LISTEN TO THE ALBUM',x-3.15,4.2,back+.4,3.8);
  }
  const tracks=(content.studio||[]).filter(t=>t.spotify||t.href);
  // Keep listening stations accessible at the console front, never inside solid furniture.
  tracks.slice(0,6).forEach((track,i)=>{
   const xx=x-2.35+i*.94;
   const zz=consoleZ+1.7;
   const pedestal=block(xx,.5,zz,.7,1,.55,i%2?steel:dark,true);
   pedestal.castShadow=true;
   const card=label(String(i+1).padStart(2,'0'),xx,1.32,zz,.58);
   card.rotation.x=-Math.PI/7;
   exhibits.push({item:track,x:xx,z:zz+1.1,site:'studio'});
  });
  if(tracks.length>6){
   const remaining={name:'MORE H4B TRACKS',description:'Open the official album to explore the full tracklist.',spotify:album?.spotify,href:album?.href};
   exhibits.push({item:remaining,x:x,z:consoleZ+3,site:'studio'});
  }
  label('HERE 4 BUSINESS · THE STUDIO',x,4.3,back+.38,6.6);
 }
 // VISUALS CINEMA: screening room with physical screen, seats and selectable official videos.
 function cinemaAtmosphere(site){
  const {x,z,w,d}=site,front=z+d/2,back=z-d/2;
  const videos=(content.cinema||[]).filter(v=>v.videoId);
  // Screen is a physical frame at the rear wall. The selected video's actual thumbnail is projected on it.
  block(x,3.35,back+.52,w-2.3,5.35,.22,dark);
  block(x,3.35,back+.68,w-2.75,4.85,.08,white);
  if(videos[0])art(videos[0],x,3.35,back+.745,0,w-3.1,4.45);
  label('VISUALS · OFFICIAL MUSIC VIDEOS',x,6.45,back+.8,Math.min(w-2.5,9));
  // Raised cinema seating: leave the centre aisle and the street-facing doorway open.
  for(let row=0;row<3;row++){
   const zz=back+4.2+row*2.15;
   for(const xx of [x-4.1,x-2.6,x+2.6,x+4.1]){
    block(xx,.34,zz,1.18,.68,1.04,dark,true);
    block(xx,.9,zz+.36,1.18,1.08,.22,steel,true);
   }
  }
  // Select any official video from the side-wall posters; interaction opens the existing YouTube player.
  videos.forEach((video,i)=>{
   const side=i%2===0?-1:1,slot=Math.floor(i/2);
   const zz=back+2.3+slot*2.3;
   if(zz>front-1.8)return;
   const wallX=x+side*(w/2-.4);
   art(video,wallX,3.3,zz,side<0?Math.PI/2:-Math.PI/2,2.1,1.55);
   exhibits.push({item:video,x:x+side*(w/2-1.7),z:zz,site:'cinema'});
  });
  const primary=videos[0];
  if(primary)exhibits.push({item:primary,x,z:back+2.2,site:'cinema'});
  if(!videos.length)label('SCREENINGS COMING SOON',x,3.3,back+.85,6);
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
  if(id==='museum'){
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
   shopAtmosphere(site,upperY);

  }
  if(id==='cinema')cinemaAtmosphere(site);
  if(id==='studio')studioAtmosphere(site);
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
