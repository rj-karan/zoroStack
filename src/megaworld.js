import * as T from '../assets/vendor/three.module.min.js';
import {C,ring,rod,sphere,cylinder} from './geometry.js?v=4';

// Egghead's Fabriophase is a compact city inside a rocky, wooded shoreline.
export const ISLAND_RADII={x:132,z:106};
const random=(()=>{let seed=260917;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};})();
const painted=new T.MeshStandardMaterial({color:0xffffff,roughness:.85});
function instances(parent,name,geometry,placements,material=painted){
 const mesh=new T.InstancedMesh(geometry,material,placements.length),dummy=new T.Object3D();mesh.name=name;
 placements.forEach(([x,y,z,sx,sy,sz,color,angle=0],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(color));});
 mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=true;mesh.frustumCulled=false;parent.add(mesh);
 return mesh;
}
export function createMegaFabriophase(world){
 const district=new T.Group();district.name='FABRIOPHASE_FOREST_AND_CITY';world.add(district);
 const foliage=[],lowerLeaves=[],trunks=[],fronds=[],rocks=[],roofs=[],columns=[],windows=[],antennae=[];
 let palms=0,pods=0;
 // The dark, irregular vegetation belt frames a smaller city. Leave the port open.
 for(let i=0;i<270;i++){
  const a=i*2.3999632,r=71+random()*40,x=Math.cos(a)*r,z=Math.sin(a)*r*.80;
  if(x < -103 && z>10 && z<68)continue;
  const size=2.8+random()*5.5,depth=3+random()*4;
  foliage.push([x,2.8+random()*2,z,size,size*.65,depth,[0x376d3c,0x477f40,0x2f6654,0x5a923d,0x73a34b][i%5],a]);
  if(i%3===0)lowerLeaves.push([x+(random()-.5)*3,1.8,z,size*.9,1.5,depth*.8,0x284f38,a]);
  if(i%7===0){const h=7+random()*4;palms++;
   trunks.push([x,2+h/2,z,.25,h,.25,0x94784a,a]);
   for(let f=0;f<7;f++){const q=f*Math.PI*2/7;fronds.push([x+Math.sin(q)*2,2+h+.4,z+Math.cos(q)*2,.45,.20,3.0,f%2?0x326e40:0x529043,q]);}
  }
 }
 for(let i=0;i<112;i++){
  const a=i*Math.PI*2/112,r=.91+random()*.07,x=Math.cos(a)*132*r,z=Math.sin(a)*106*r;
  rocks.push([x,-10+random()*5,z,2+random()*3,10+random()*10,2+random()*3,i%4?0x5b5a4b:0x77705a,a]);
 }
 // Sparse rounded technology rises through the trees; the central city is hand built.
 for(let i=0;i<34;i++){
  const a=i*2.3999632,r=48+random()*34,x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
  if(Math.hypot(x-1,z-20)<13||x < -62 && z>20)continue;
  const h=8+random()*13,w=2+random()*1.6,c=[C.cyan,C.mint,C.pink,C.yellow,C.coral][i%5];pods++;
  columns.push([x,2+h/2,z,w*.55,h,w*.55,C.cream]);
  roofs.push([x,2+h,z,w*1.35,w*.65,w*1.35,c]);
  windows.push([x,2+h*.66,z+w*.57,w*.28,.45,.1,0x267aa0]);
  if(i%3===0)antennae.push([x,2+h+w*.6+1,z,.09,2,.09,C.gold]);
 }
 instances(district,'Coastal_Forest_Canopies',new T.IcosahedronGeometry(1,1),foliage);
 instances(district,'Coastal_Forest_Undergrowth',new T.IcosahedronGeometry(1,1),lowerLeaves);
 instances(district,'Weathered_Cliff_Faces',new T.DodecahedronGeometry(1,0),rocks);
 instances(district,'Shoreline_Palm_Trunks',new T.CylinderGeometry(1,1,1,8),trunks);
 instances(district,'Shoreline_Palm_Fronds',new T.SphereGeometry(1,10,6),fronds,new T.MeshStandardMaterial({color:0xffffff,roughness:.95,side:T.DoubleSide}));
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
 return {radiusX:132,radiusZ:106,areaScale:(132*106)/(66*53),pods,palms,coastalCanopies:foliage.length,cliffRocks:rocks.length};
}
