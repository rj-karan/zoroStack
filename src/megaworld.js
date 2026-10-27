import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,ring,rod,sphere,cylinder,roundedBox,tube,label} from './geometry.js?v=4';
import {exhibitStops} from './exhibit-route.js?v=13';

// Egghead's Fabriophase is a compact city inside a rocky, wooded shoreline.
export const ISLAND_RADII={x:132,z:106};
const random=(()=>{let seed=260917;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};})();
const painted=new T.MeshStandardMaterial({color:0xffffff,roughness:.85});
function palmLeaf(){
 const vertices=[],indices=[];
 for(let j=0;j<=9;j++){
  const t=j/9,w=Math.sin(Math.PI*t)*.52;
  vertices.push(-w,.2*Math.sin(Math.PI*t)-1.05*t*t,3.7*t,w,.2*Math.sin(Math.PI*t)-1.05*t*t,3.7*t);
  if(j<9){const k=j*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function instances(parent,name,geometry,placements,material=painted){
 const mesh=new T.InstancedMesh(geometry,material,placements.length),dummy=new T.Object3D();mesh.name=name;
 placements.forEach(([x,y,z,sx,sy,sz,color,angle=0],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(color));});
 mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=true;mesh.frustumCulled=false;parent.add(mesh);
 return mesh;
}
function exhibitClearance(x,z,r=11){
 return exhibitStops.every(stop=>stop.position[1]>20||Math.hypot(stop.position[0]-x,stop.position[2]-z)>r);
}
function sightlineClear(x,z){
 return exhibitStops.every(stop=>{
  if(stop.position[1]>20)return true;
  const [sx,,sz]=stop.position;
  return !(Math.abs(x-sx)<12&&z>sz-12&&z<sz+43);
 });
}
function detailBuilding(parent,x,z,n){
 const colors=[C.cyan,C.coral,C.mint,C.yellow,C.purple,C.pink],c=colors[n%colors.length];
 const g=new T.Group();g.position.set(x,1.7,z);g.name='FABRIOPHASE_DETAIL_'+n;parent.add(g);
 const family=n%4,h=9+n%5*2.2;
 if(family===0){
  // Wide hovering saucers supported by a ribbed white stem.
  cylinder(g,[0,h*.38,0],1.55,h*.76,C.cream,2.1,28);
  for(const y of [h*.25,h*.46,h*.68])ring(g,[0,y,0],1.75,.13,C.cyan);
  cylinder(g,[0,h*.86,0],5.25,.75,C.cream,5.25,48);
  sphere(g,[0,h*.95,0],[5.2,1.55,5.2],c,materials.enamel,32);
  sphere(g,[0,h+1.15,0],[3.2,.55,3.2],C.cream);
  for(let k=0;k<10;k++){
   const a=k*Math.PI/5,p=[Math.sin(a)*4.36,h*.94,Math.cos(a)*4.36];
   sphere(g,p,[.32,.42,.14],0x348dae,materials.metal,12);
   sphere(g,[p[0],p[1],p[2]+.14],[.09,.15,.04],0xc5fbff,materials.enamel,10);
  }
  ring(g,[0,h*.85,0],5.30,.15,C.gold);
  cylinder(g,[0,h+1.8,0],.25,1.7,C.navy,.35,16);sphere(g,[0,h+2.8,0],[.43,.43,.43],c);
 }else if(family===1){
  // Tall striped laboratories with round observation decks and glowing portholes.
  cylinder(g,[0,h*.47,0],2.7,h*.94,C.cream,3.05,32);
  for(let y=2;y<h-1;y+=2.5){
   ring(g,[0,y,0],3.1,.15,c);
   for(let k=0;k<6;k++){const a=k*Math.PI/3;
    const p=[Math.sin(a)*3.07,y+1,Math.cos(a)*3.07];
    sphere(g,p,[.45,.53,.16],0x176d96,materials.metal,12);
   }
  }
  cylinder(g,[0,h,0],4.1,.6,C.white,4.1,48);
  sphere(g,[0,h+.8,0],[3.8,1.25,3.8],c);
  for(const side of [-1,1])rod(g,[side*2.2,.8,0],[side*3.5,h*.8,0],.11,C.yellow);
  rod(g,[0,h+1.5,0],[0,h+4,0],.1,C.cream);sphere(g,[0,h+4,0],[.35,.35,.35],C.yellow);
 }else if(family===2){
  // Blue and coral coil tower, with offset circular transit rings.
  cylinder(g,[0,h*.44,0],2.1,h*.88,0xe9f1e9,2.4,24);
  for(let k=0;k<4;k++){
   const y=3+k*3;
   cylinder(g,[0,y,0],4.2,.38,k%2?c:C.cyan,4.2,40);
   ring(g,[0,y+.23,0],4.25,.12,C.white);
   sphere(g,[0,y+.7,0],[2.2,.8,2.2],k%2?C.cream:c);
   for(const side of [-1,1])sphere(g,[side*3.4,y+.3,0],[.4,.27,.4],C.yellow);
  }
  sphere(g,[0,h+2,0],[2.5,1.2,2.5],C.mint);
  rod(g,[0,h+2,0],[0,h+5,0],.07,C.gold);
 }else{
  // Asymmetric research pods with exposed ducts and a raised sensor eye.
  cylinder(g,[0,h*.35,0],2.5,h*.7,C.cream,2.8,28);
  sphere(g,[0,h*.76,0],[4,2.1,3.6],c,materials.enamel,28);
  ring(g,[0,h*.67,0],4.1,.16,C.cream);
  for(let k=0;k<7;k++){
   const a=k*Math.PI*2/7;
   sphere(g,[Math.sin(a)*3.55,h*.9,Math.cos(a)*3.2],[.46,.37,.12],0x2a779c,materials.metal,12);
  }
  tube(g,[[0,2.0,2.5],[4,2.4,4],[5,6,2],[1,6.5,-1]],.18,C.cyan,24);
  sphere(g,[0,h+1.3,0],[1.6,1.6,1.6],C.cream);
  ring(g,[0,h+1.3,1.2],.9,.16,C.pink,'z');
 }
 cylinder(g,[0,.12,0],5.5,.24,0xe0ebe4,5.7,48);
 ring(g,[0,.25,0],5.4,.08,c);
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2;
  cylinder(g,[Math.sin(a)*5,.65,Math.cos(a)*5],.12,.8,C.cream,.15,12);
  sphere(g,[Math.sin(a)*5,1.15,Math.cos(a)*5],[.16,.18,.16],C.cyan);
 }
 return g;
}
function bubbleHabitat(parent,x,z,colour,n){
 const g=new T.Group();g.name='SEALEVEL_BUBBLE_HABITAT_'+n;g.position.set(x,1.7,z);parent.add(g);
 cylinder(g,[0,.35,0],8.4,.7,C.cream,8.5,64);
 ring(g,[0,.76,0],8.3,.23,colour);
 cylinder(g,[0,1,0],6.6,.25,C.mint,6.6,56);
 const glass=new T.MeshPhysicalMaterial({color:0xaaf6f4,roughness:.07,metalness:.04,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false,clearcoat:1});
 const dome=new T.Mesh(new T.SphereGeometry(8.0,48,24,0,Math.PI*2,0,Math.PI/2),glass);dome.position.y=1.2;g.add(dome);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;rod(g,[Math.sin(a)*8.0,1.0,Math.cos(a)*8.0],[Math.sin(a)*2,7.8,Math.cos(a)*2],.065,C.cream);
 }
 ring(g,[0,1.2,0],8,.09,C.gold);
 for(const [px,pz,h,c] of [[-2,-1,3,C.pink],[2,1,4,C.yellow],[0,3,2.5,C.cyan]]){
  cylinder(g,[px,1.2+h/2,pz],.7,h,C.cream,.9,18);
  sphere(g,[px,1.2+h,pz],[1.3,.65,1.3],c);
 }
 for(let i=0;i<5;i++){const a=i*2.4,r=3+i%2*1.3;
  cylinder(g,[Math.sin(a)*r,1.4,Math.cos(a)*r],.5,.4,C.cream,.55,14);
  sphere(g,[Math.sin(a)*r,2.1,Math.cos(a)*r],[.85,.85,.85],i%2?C.green:C.mint,materials.foliage,16);
 }
 rod(g,[0,1.2,0],[0,7.9,0],.09,C.gold);sphere(g,[0,8.1,0],[.5,.5,.5],colour);
 return g;
}
export function createMegaFabriophase(world){
 const district=new T.Group();district.name='FABRIOPHASE_FOREST_AND_CITY';world.add(district);
 const foliage=[],lowerLeaves=[],upperTufts=[],trunks=[],fronds=[],rocks=[],roofs=[],columns=[],windows=[],antennae=[];
 let palms=0,pods=0;
 // The dark, irregular vegetation belt frames a smaller city. Leave the port open.
 for(let i=0;i<270;i++){
  const a=i*2.3999632,r=71+random()*40,x=Math.cos(a)*r,z=Math.sin(a)*r*.80;
  if(x < -103 && z>10 && z<68||!sightlineClear(x,z))continue;
  const size=2.8+random()*5.5,depth=3+random()*4;
  foliage.push([x,2.8+random()*2,z,size,size*.65,depth,[0x376d3c,0x477f40,0x2f6654,0x5a923d,0x73a34b][i%5],a]);
  if(i%3===0)lowerLeaves.push([x+(random()-.5)*3,1.8,z,size*.9,1.5,depth*.8,0x284f38,a]);
  for(let f=0;f<3;f++){const q=f*Math.PI*2/3+a;
   upperTufts.push([x+Math.sin(q)*size*.43,4.2+size*.26,z+Math.cos(q)*depth*.38,size*.43,size*.31,depth*.42,f%2?0x4c8e43:0x5d9c49,q]);
  }
  if(i%7===0){const h=7+random()*4;palms++;
   trunks.push([x,2+h/2,z,.25,h,.25,0x94784a,a]);
   for(let f=0;f<9;f++){const q=f*Math.PI*2/9;fronds.push([x,2+h,z,1,1,1,f%2?0x326e40:0x529043,q]);}
  }
 }
 for(let i=0;i<112;i++){
  const a=i*Math.PI*2/112,r=.91+random()*.07,x=Math.cos(a)*132*r,z=Math.sin(a)*106*r;
  rocks.push([x,-12+random()*2,z,2+random()*3,12+random()*4,2+random()*3,i%4?0x5b5a4b:0x77705a,a]);
 }
 // Sparse rounded technology rises through the trees; the central city is hand built.
 for(let i=0;i<34;i++){
  const a=i*2.3999632,r=48+random()*34,x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
  if(Math.hypot(x-1,z-20)<13||x < -62 && z>20||!sightlineClear(x,z))continue;
  const h=8+random()*13,w=2+random()*1.6,c=[C.cyan,C.mint,C.pink,C.yellow,C.coral][i%5];pods++;
  columns.push([x,2+h/2,z,w*.55,h,w*.55,C.cream]);
  roofs.push([x,2+h,z,w*1.35,w*.65,w*1.35,c]);
  windows.push([x,2+h*.66,z+w*.57,w*.28,.45,.1,0x267aa0]);
  if(i%3===0)antennae.push([x,2+h+w*.6+1,z,.09,2,.09,C.gold]);
 }
 instances(district,'Coastal_Forest_Canopies',new T.IcosahedronGeometry(1,1),foliage);
 instances(district,'Coastal_Forest_Undergrowth',new T.IcosahedronGeometry(1,1),lowerLeaves);
 instances(district,'Coastal_Forest_Leaf_Tufts',new T.IcosahedronGeometry(1,1),upperTufts);
 instances(district,'Weathered_Cliff_Faces',new T.DodecahedronGeometry(1,0),rocks);
 instances(district,'Shoreline_Palm_Trunks',new T.CylinderGeometry(1,1,1,8),trunks);
 instances(district,'Shoreline_Palm_Fronds',palmLeaf(),fronds,new T.MeshStandardMaterial({color:0xffffff,roughness:.95,side:T.DoubleSide}));
 instances(district,'Fabriophase_Satellite_Columns',new T.CylinderGeometry(1,1,1,16),columns);
 instances(district,'Fabriophase_Satellite_Domes',new T.SphereGeometry(1,20,12),roofs);
 instances(district,'Fabriophase_Satellite_Windows',new T.BoxGeometry(1,1,1),windows);
 instances(district,'Fabriophase_Antennae',new T.CylinderGeometry(1,1,1,8),antennae);
 for(const [x,z,c] of [[-64,-22,C.cyan],[58,-28,C.pink],[70,24,C.yellow]]){
  const g=new T.Group();g.position.set(x,1.7,z);district.add(g);
  cylinder(g,[0,7,0],3.1,14,C.cream,3.2,32);sphere(g,[0,14,0],[4.8,2.4,4.8],c);
  for(const y of [3,7,11])ring(g,[0,y,0],3.4,.16,C.cyan);
  rod(g,[0,16,0],[0,19,0],.08,C.gold);
 }
 const grid=new T.Group();grid.name='FABRIOPHASE_GROUND_GRID';district.add(grid);
 const gridPoints=[];
 for(let q=-70;q<=70;q+=7){gridPoints.push(q,1.91,-65,q,1.91,70,-70,1.91,q,70,1.91,q);}
 const lineGeometry=new T.BufferGeometry();lineGeometry.setAttribute('position',new T.Float32BufferAttribute(gridPoints,3));
 grid.add(new T.LineSegments(lineGeometry,new T.LineBasicMaterial({color:0x72c7bc,transparent:true,opacity:.18,depthWrite:false})));
 let detailedBuildings=0;
 for(let i=0;i<36;i++){
  const a=i*2.3999632,r=34+(i*17%43),x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
  if(!exhibitClearance(x,z,13)||!sightlineClear(x,z)||Math.hypot(x,z)<30)continue;
  detailBuilding(district,x,z,i);detailedBuildings++;
 }
 let habitats=0;
 for(const [x,z,c] of [[-46,49,C.cyan],[39,54,C.pink],[-3,68,C.yellow]]){
  if(exhibitClearance(x,z,12)&&sightlineClear(x,z)){bubbleHabitat(district,x,z,c,habitats);habitats++;}
 }
 return {radiusX:132,radiusZ:106,areaScale:(132*106)/(66*53),pods,palms,coastalCanopies:foliage.length,cliffRocks:rocks.length,detailedBuildings,habitats};
}
