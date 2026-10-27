import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label} from './geometry.js?v=4';

const positions=[
 [-210,98,'marine',1.13],[-162,157,'marine',.88],[-79,171,'marine',.94],
 [63,174,'marine',.95],[151,147,'marine',1.04],[215,53,'marine',.96],
 [205,-94,'marine',.82],[125,-173,'marine',.86],[-83,-166,'marine',.83],
 [-202,-83,'marine',.96],[-179,-153,'pirate',.74],[190,-166,'pirate',.81],
 [12,-194,'pirate',.68]
];

function sail(g,w,h,y,z,colour,word){
 const geo=new T.PlaneGeometry(w,h,16,10),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i)/w+.5,v=p.getY(i)/h+.5;
  p.setZ(i,Math.sin(x*Math.PI)*Math.sin(v*Math.PI)*.65);
 }
 geo.computeVertexNormals();
 add(g,geo,colour,[0,y,z],[1,1,1],[0,0,0],materials.cloth);
 const sign=label(g,word,[0,y,z+.72],w*.74,h*.35,{color:word==='MARINE'?'#294561':'#f9ead3',font:'bold 92px Georgia'});
 for(const e of [-1,1])rod(g,[e*w*.49,y-h*.5,z],[e*w*.49,y+h*.5,z],.025,0xe4e8d8);
 return sign;
}

function ship(kind,scale){
 const navy=kind==='marine',g=new T.Group();
 g.name=navy?'MARINE_WARSHIP':'PIRATE_SHIP';
 g.scale.setScalar(scale);
 const dark=navy?0x152f55:0x5e3024,trim=navy?0xdfe9e9:0xd3a55f,sailColor=navy?0xf0eee4:0x27333b;
 // An actual boat silhouette: curved wooden hull, keel, raised deck and rails.
 sphere(g,[0,.20,0],[2.45,1.3,6.5],dark,materials.enamel,32);
 sphere(g,[0,-.47,0],[1.75,.83,5.6],navy?0x182941:0x3c251f,materials.enamel,24);
 cylinder(g,[0,1.34,0],2.29,.25,navy?0xa36d4a:0x966847,2.29,32);
 const deck=add(g,new T.CylinderGeometry(2.25,2.25,.08,48),navy?0xb08a65:0x916641,[0,1.51,0],[1,1,2.58]);deck.receiveShadow=true;
 for(const side of [-1,1]){
  const rail=[];
  for(let k=0;k<=32;k++){
   const z=-5.9+k*11.8/32,x=side*(.30+2.20*Math.sqrt(Math.max(0,1-(z/6.4)**2)));
   rail.push([x,2.05,z]);
   if(k%4===0)rod(g,[x,1.44,z],[x,2.07,z],.045,trim);
  }
  tube(g,rail,.075,trim,70);
  for(const z of [-3.9,-1.7,.5,2.7,4.8]){
   const cannon=rod(g,[side*2.05,1.31,z],[side*3.18,1.31,z],.17,navy?0x263d54:0x342c29,materials.metal,.12);
   ring(g,[side*3.20,1.31,z],.17,.055,0xd1b777,'x',18);
   for(const dx of [-.4,.4])sphere(g,[side*1.8,1.27,z+dx],[.12,.12,.12],0x353330,materials.metal,12);
  }
 }
 for(let j=0;j<3;j++){
  const z=-4+j*3.7,h=j===1?12:8.5;
  rod(g,[0,1.5,z],[0,h,z],.14,navy?0xd6d6cb:0x87623b);
  rod(g,[-3.1,h-1,z],[3.1,h-1,z],.09,navy?0xb4aca0:0x816441);
  sail(g,j===1?5.6:4.7,j===1?4.7:3.4,h-3.3,z+.15,sailColor,navy?'MARINE':'☠');
  for(const side of [-1,1])rod(g,[0,h,z],[side*2.2,1.9,z+2.8],.02,0x9d947c);
  ring(g,[0,h+.18,z],.27,.035,trim);
 }
 const cabin=new T.Group();cabin.position.set(0,1.55,-4.5);g.add(cabin);
 add(cabin,roundedBox(3.2,2.5,2.0,.2),navy?0xe3e7df:0x693f2f,[0,1.25,0]);
 add(cabin,roundedBox(3.7,.3,2.3,.12),dark,[0,2.65,0]);
 for(const x of [-1,0,1]){sphere(cabin,[x,1.6,1.07],[.28,.31,.08],0x5bb2bd);ring(cabin,[x,1.6,1.11],.30,.055,trim,'z',20);}
 const bow=new T.Group();bow.position.set(0,1.2,6.1);g.add(bow);
 sphere(bow,[0,0,.3],[.47,.5,.7],navy?0xe0e9e2:0xcba953);
 rod(bow,[0,-.1,.5],[0,-.7,1.7],.11,trim);
 ring(g,[0,.08,0],6.9,.04,0xd7fcf5,'y',64).scale.x=.39;
 // The larger command ships carry an extra observation tower and signal flags.
 if(navy){
  rod(g,[0,3.9,-4.7],[0,7,-4.7],.075,0xb3b9ac);
  sphere(g,[0,7,-4.7],[.25,.25,.25],C.yellow);
  for(let k=0;k<3;k++)add(g,new T.BoxGeometry(.75,.35,.04),k%2?0xe4ece9:0x294966,[.38,6.5-k*.43,-4.7]);
 }
 return g;
}

export function createSeaFleet(world,{low=false}={}){
 const fleet=new T.Group();fleet.name='EGGHEAD_NAVAL_BLOCKADE_AND_PIRATES';world.add(fleet);
 const entries=low?positions.filter((_,i)=>i%2===0):positions;
 for(const [x,z,kind,size] of entries){
  const vessel=ship(kind,size);vessel.position.set(x,-17.55,z);
  vessel.rotation.y=Math.atan2(-x,-z)+(kind==='pirate'?.55:0);
  fleet.add(vessel);
 }
 return {warships:entries.filter(p=>p[2]==='marine').length,pirateShips:entries.filter(p=>p[2]==='pirate').length};
}
