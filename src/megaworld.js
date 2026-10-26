import * as T from '../assets/vendor/three.module.min.js';
import {C,add,ring,rod,tube,roundedBox,label} from './geometry.js?v=4';
import {exhibitStops} from './exhibit-route.js?v=11';

// Geographic extension of Fabriophase. Architecture and people retain their
// authored size; the coast grows from 66 x 53 to 295 x 237 world units.
export const ISLAND_RADII={x:295,z:237};
const palette=[C.cyan,C.mint,C.pink,C.yellow,C.coral,C.purple,C.blue];
const random=(()=>{let seed=260917;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};})();
const mat=(roughness=.52,metalness=.08)=>new T.MeshStandardMaterial({color:0xffffff,roughness,metalness});
function lane(parent,inner,outer,color){
 const mesh=new T.Mesh(new T.RingGeometry(inner,outer,256),new T.MeshStandardMaterial({color,roughness:.82,side:T.DoubleSide}));
 mesh.rotation.x=-Math.PI/2;mesh.scale.y=ISLAND_RADII.z/ISLAND_RADII.x;mesh.position.y=1.91;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function instance(parent,name,geometry,material,placements){
 const mesh=new T.InstancedMesh(geometry,material,placements.length),dummy=new T.Object3D();mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=true;mesh.frustumCulled=false;
 placements.forEach(([x,y,z,sx,sy,sz,color,angle=0],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(color));});
 mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;parent.add(mesh);return mesh;
}
export function createMegaFabriophase(world,{low=false}={}){
 const district=new T.Group();district.name='FABRIOPHASE_TWENTY_TIMES_LARGER';world.add(district);
 const road=new T.Group();road.name='Fabriophase_Connected_Avenues';district.add(road);
 for(const [a,b,col] of [[71,78,0xeaf8e8],[125,132,0xf9f6eb],[188,196,0xe1f4ee],[252,261,0xf9f4e4]]){
  lane(road,a,b,col);lane(road,a+.5,a+.7,0x41c9cb);lane(road,b-.8,b-.6,0xffc75c);
 }
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,length=195,origin=66,mid=origin+length/2,x=Math.sin(a)*mid,z=Math.cos(a)*mid*.803;
  const path=add(road,new T.PlaneGeometry(5.5,length),i%2?0xf9f5e6:0xe3f4ef,[x,1.92,z],[1,.803,1],[-Math.PI/2,0,-a]);path.receiveShadow=true;
  for(let n=0;n<13;n++){const r=origin+n*14.5;const marker=add(road,new T.BoxGeometry(.11,.025,1.6),C.yellow,[Math.sin(a)*r,1.95,Math.cos(a)*r*.803],[1,1,1],[0,a,0]);marker.receiveShadow=false;}
 }
 const pods=[],crowns=[],flanges=[],windows=[],spires=[],antennae=[],beacons=[],towerBodies=[],towerCaps=[],towerWindows=[],palmTrunks=[],palmLeaves=[];
 const reserved=exhibitStops.filter(s=>s.position[1]<10).map(s=>s.position);
 let podCount=0,towerCount=0,palmCount=0;
 for(let row=0;row<18;row++)for(let col=0;col<40;col++){
  const theta=(col+(row%2)*.5)/40*Math.PI*2,r=84+row*10.25+(random()-.5)*4;
  const x=Math.sin(theta)*r,z=Math.cos(theta)*r*.803;
  if(x*x/(295*295)+z*z/(237*237)>.88||reserved.some(p=>Math.hypot(p[0]-x,p[2]-z)<15))continue;
  // Open sectors give the future-city silhouette breathing room and preserve roads.
  if(Math.abs(theta%(Math.PI/8))<.045||random()<.29)continue;
  const colour=palette[(row*3+col)%palette.length],h=5+random()*9,width=2+random()*1.5;
  if((row+col)%5===0){
   towerCount++;const high=12+random()*18;
   towerBodies.push([x,1.7+high/2,z,width*.8,high,width*.8,C.cream,theta]);
   towerCaps.push([x,1.7+high,z,width*1.08,.7,width*1.08,colour,theta]);
   for(let floor=0;floor<Math.floor(high/2.4);floor++)towerWindows.push([x+Math.sin(theta)*width*.83,3.2+floor*2.4,z+Math.cos(theta)*width*.83,.75,.55,.12,floor%3?C.cyan:C.navy,theta]);
  }else{
   podCount++;pods.push([x,1.7+h*.47,z,width*.46,h*.48,width*.46,C.cream,theta]);
   crowns.push([x,1.7+h*.91,z,width,width*.48,width,colour,theta]);
   flanges.push([x,1.7+h*.66,z,width*1.08,.20,width*1.08,C.cream,theta]);
   for(let j=0;j<4;j++){const a=theta+j*Math.PI/2;windows.push([x+Math.sin(a)*width*.74,1.7+h*.75,z+Math.cos(a)*width*.74,width*.19,width*.20,.08,0x2b9aae,a]);}
   if((row+col)%4===0){spires.push([x,1.7+h+width*.25,z,.08,1.4,.08,C.gold,theta]);beacons.push([x,1.7+h+width*.52+1.4,z,.18,.18,.18,colour]);}
  }
  if((row+col)%3===0){
   const px=x+Math.sin(theta+1)*7,pz=z+Math.cos(theta+1)*7,pheight=3.3+random()*1.7;
   palmCount++;palmTrunks.push([px,1.7+pheight/2,pz,.10,pheight,.10,0xc69b61]);
   for(let j=0;j<7;j++){const a=j*Math.PI*2/7;palmLeaves.push([px+Math.sin(a)*.85,1.7+pheight+.15,pz+Math.cos(a)*.85,.28,.10,1.5,j%2?0x8ec956:0x70b73d,a]);}
  }
 }
 const enamel=mat(),windowMat=mat(.27,.13),foliage=mat(.88,0);
 instance(district,'Future_Pod_Columns',new T.CylinderGeometry(1,1,2,12),enamel,pods);
 instance(district,'Future_Pod_Roofs',new T.SphereGeometry(1,18,12),enamel,crowns);
 instance(district,'Future_Pod_White_Bands',new T.CylinderGeometry(1,1,1,18),enamel,flanges);
 instance(district,'Future_Pod_Portholes',new T.SphereGeometry(1,10,8),windowMat,windows);
 instance(district,'Future_Pod_Antennas',new T.CylinderGeometry(1,1,1,8),enamel,spires);
 instance(district,'Future_Pod_Beacons',new T.SphereGeometry(1,10,8),enamel,beacons);
 instance(district,'Future_City_Towers',new T.BoxGeometry(2,1,2),enamel,towerBodies);
 instance(district,'Future_City_Tower_Caps',new T.BoxGeometry(2,1,2),enamel,towerCaps);
 instance(district,'Future_City_Window_Lights',new T.BoxGeometry(1,1,1),windowMat,towerWindows);
 instance(district,'Egghead_Palm_Trunks_Outer',new T.CylinderGeometry(1,1,1,8),mat(.95,0),palmTrunks);
 instance(district,'Egghead_Palm_Canopies_Outer',new T.SphereGeometry(1,10,6),foliage,palmLeaves);
 // Four landmarks orient the visitor inside the larger city.
 const anchors=[[-218,92,'FUTURE / WEST'],[-115,-166,'FABRIOPHASE / INDUSTRY'],[159,-138,'SSG / RESEARCH'],[232,62,'VEGA / ENERGY']];
 for(const [x,z,title] of anchors){
  const g=new T.Group();g.name=title.replaceAll(' ','_');g.position.set(x,1.7,z);district.add(g);
  add(g,new T.CylinderGeometry(8,9,1,48),C.cream,[0,.35,0]);ring(g,[0,.95,0],8.4,.15,C.blue);
  add(g,new T.CylinderGeometry(4.5,5.2,24,40),C.navy,[0,12,0]);
  for(const y of [6,13,20]){ring(g,[0,y,0],5,.22,C.mint);for(let k=0;k<6;k++){const a=k*Math.PI/3;const lamp=add(g,new T.BoxGeometry(1.6,1.8,.2),C.cyan,[Math.sin(a)*5.1,y,Math.cos(a)*5.1]);lamp.rotation.y=a;}}
  add(g,new T.SphereGeometry(5.7,32,18),C.pink,[0,25,0],[1,.5,1]);label(g,title,[0,12,5.25],8,1.0,{color:'#fcf8e9',background:'#173f59',font:'bold 70px Arial'});
 }
 return {radiusX:295,radiusZ:237,areaScale:(295*237)/(66*53),pods:podCount,towers:towerCount,palms:palmCount,roads:20};
}
