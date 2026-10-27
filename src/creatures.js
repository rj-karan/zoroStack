import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label} from './geometry.js?v=4';
import {finishAssembly} from './assembly.js?v=4';

function fin(parent,points,color,thickness=.22){
 const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 return add(parent,new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.08,bevelThickness:.06,bevelSegments:2}),color);
}
function mechanicalShark(number,color){
 const root=new T.Group();root.name='SEA_BEAST_WEAPON_SHARK_'+number;root.userData.dynamic=true;
 const body=new T.Group();root.add(body);
 sphere(body,[0,0,0],[3.7,2.25,8],color,materials.metal,32);
 sphere(body,[0,-1.1,1.2],[3.2,1.15,6.5],0xecf3ed,materials.enamel,28);
 sphere(body,[0,-.72,6.2],[3.05,.45,1.2],0x192a40,materials.metal,24);
 for(const side of [-1,1]){
  const eye=sphere(body,[side*2.65,.95,4.5],[.66,.60,.20],0x23263c,materials.metal,20);eye.rotation.y=side*.35;
  sphere(body,[side*2.82,1.00,4.58],[.32,.32,.20],0xff435b,materials.enamel,16);
  ring(body,[side*2.9,1.0,4.58],.63,.11,C.cream,'x',28,materials.metal);
  for(let i=0;i<4;i++){
   const z=2.6-i*.72;
   add(body,roundedBox(.17,1.05,.72,.08),0x8cdae3,[side*3.25,-.2,z],[1,1,1],[0,side*.26,0]);
  }
  fin(body,[[0,0],[side*5.4,-.22],[side*2.6,1.0]],color);
  for(let j=0;j<6;j++){
   const x=side*(.45+j*.41);
   const tooth=add(body,new T.ConeGeometry(.19,.78,6),C.white,[x,-.95,7.1-j*.10],[1,1,1],[Math.PI,0,0]);
   tooth.rotation.z=side*.12;
  }
 }
 fin(body,[[-1.25,0],[-.1,3.2],[1.5,0]],color);
 for(let j=0;j<7;j++){
  const z=-5.8+j*1.7;
  ring(body,[0,.15,z],3.52,.065,j%2?C.cream:C.cyan,'z',34,materials.metal);
  sphere(body,[0,1.9,z],[.22,.08,.30],C.gold,materials.metal,12);
 }
 cylinder(body,[0,1.85,-1.1],.60,.20,C.cream,.60,20);
 label(body,'S.B.W. / '+number,[0,1.9,-1.09],1.1,.26,{color:'#254467',font:'bold 76px Arial',rotation:[-Math.PI/2,0,0]});
 finishAssembly(body);
 const tail=new T.Group();tail.position.z=-7.1;root.add(tail);
 sphere(tail,[0,0,-1.25],[1.9,1.45,2.3],color,materials.metal,20);
 fin(tail,[[-.20,0],[-2.5,2.5],[-1.05,.5],[-2.2,-2.4],[.35,-.25],[2.2,2.3],[1.2,.45],[2.0,-2.5]],color,.28);
 finishAssembly(tail);
 return {root,tail};
}
function mechanicalSeaLion(){
 const root=new T.Group();root.name='SEA_BEAST_WEAPON_SEA_LION';root.userData.dynamic=true;
 const body=new T.Group();root.add(body);
 sphere(body,[0,-.3,0],[5,3.3,5.8],0x3b788e,materials.metal,32);
 sphere(body,[0,1.2,3.6],[3.4,3.2,3.0],0x9cc9c4,materials.enamel,28);
 sphere(body,[0,-.15,5.45],[2.5,1.1,1.5],C.cream,materials.enamel,24);
 for(const s of [-1,1]){
  sphere(body,[s*2.5,1.75,5.14],[.53,.58,.18],0x193c5b,materials.metal,16);
  sphere(body,[s*2.58,1.8,5.30],[.22,.25,.08],C.cyan,materials.enamel,12);
  ring(body,[s*2.5,1.75,5.25],.6,.10,C.gold,'z',20);
  fin(body,[[s*3.7,-.2],[s*8,-1.5],[s*4.6,-2.7]],0x377c9b,.36);
  rod(body,[s*1.2,-.7,5.9],[s*2.6,-2.0,6.0],.22,C.cream);
 }
 for(let i=0;i<5;i++){
  const z=-3.8+i*1.75;
  add(body,roundedBox(7.8,.35,1.12,.16),i%2?C.cyan:C.cream,[0,2.3,z]);
  for(const side of [-1,1])sphere(body,[side*3.7,2.45,z],[.23,.25,.23],C.gold,materials.metal,10);
 }
 sphere(body,[0,3.0,-1.0],[1.5,.75,1.7],C.pink);
 rod(body,[0,3.55,-1],[0,5.2,-1],.1,C.gold);
 sphere(body,[0,5.3,-1],[.47,.47,.47],C.yellow);
 finishAssembly(body);
 return {root,tail:null};
}
function serviceRobot(n){
 const root=new T.Group();root.name='FABRIOPHASE_PATROL_ROBOT_'+n;root.userData.dynamic=true;
 const body=new T.Group();root.add(body);
 cylinder(body,[0,.2,0],1.15,.35,C.cream,1.2,28);
 ring(body,[0,.38,0],1.18,.09,n%2?C.pink:C.cyan);
 sphere(body,[0,1.7,0],[1.3,1.4,1.0],n%2?C.cream:0xe2efec,materials.enamel,20);
 add(body,roundedBox(1.65,.62,.18,.16),0x203b5b,[0,2.05,.98]);
 for(const s of [-1,1]){
  sphere(body,[s*.45,2.05,1.1],[.17,.19,.10],C.cyan,materials.enamel,12);
  rod(body,[s*1.18,1.7,0],[s*1.7,.9,.35],.13,C.cream);
  sphere(body,[s*1.75,.85,.35],[.32,.31,.27],n%2?C.pink:C.cyan);
  sphere(body,[s*.68,.25,0],[.37,.37,.37],0x314c68,materials.metal,12);
 }
 rod(body,[0,2.95,0],[0,3.5,0],.08,C.gold);
 sphere(body,[0,3.6,0],[.28,.28,.28],C.yellow);
 finishAssembly(body);
 return root;
}
function vegaForce(){
 const root=new T.Group();root.name='VEGA_FORCE_01_PATROL';root.userData.dynamic=true;
 const body=new T.Group();root.add(body);
 for(const s of [-1,1]){
  cylinder(body,[s*3.0,4.0,0],1.65,8.0,C.white,1.95,24);
  sphere(body,[s*3.0,1.0,1.4],[2.0,1.5,3.1],0x158fbc,materials.metal,20);
  ring(body,[s*3.0,5.5,0],1.75,.20,C.cyan);
 }
 add(body,roundedBox(9.5,9.4,5.7,1.25),0x1768ac,[0,12.5,0]);
 add(body,roundedBox(7.5,4.3,.35,.25),C.cream,[0,13.6,2.96]);
 label(body,'VEGA FORCE 1',[0,13.9,3.21],6.2,.85,{color:'#1672ac',font:'bold 88px Arial'});
 add(body,roundedBox(5.6,2.3,3.5,.25),C.yellow,[0,18.4,0]);
 sphere(body,[0,21.3,.3],[2.1,2.2,1.75],0x125ea0,materials.metal,24);
 add(body,roundedBox(2.85,1.45,.23,.23),0x162c45,[0,21.3,2.02]);
 for(const s of [-1,1]){
  sphere(body,[s*.66,21.3,2.16],[.24,.27,.10],C.yellow,materials.enamel,12);
  sphere(body,[s*6.6,17.5,0],[3.1,4.6,3.3],C.white,materials.enamel,24);
  sphere(body,[s*6.6,17.6,2.3],[2.3,2.7,.8],C.cyan,materials.metal,20);
  label(body,'12',[s*6.6,18.0,3.05],2.3,2.5,{color:'#dc6073',font:'bold 96px Arial'});
  tube(body,[[s*8.6,20.2,-1],[s*9.5,18,-2],[s*8.4,15,-1]],.22,0x788693,22,materials.metal);
 }
 rod(body,[0,23.1,.1],[0,25.4,.1],.18,C.cyan);
 sphere(body,[0,25.5,.1],[.45,.45,.45],C.yellow);
 finishAssembly(body);
 const arms=[];
 for(const s of [-1,1]){
  const arm=new T.Group();arm.position.set(s*8,14.5,0);root.add(arm);
  cylinder(arm,[s*1.2,-2.6,0],1.7,6.2,0x68d2dc,1.9,24);
  sphere(arm,[s*1.5,-6.2,1.1],[2.4,2.5,2.3],0x1887b8,materials.metal,20);
  for(let i=0;i<4;i++)rod(arm,[s*(.2+i*.8),-7.5,2.1],[s*(.3+i*.9),-9.5,2.5],.27,C.cyan);
  ring(arm,[s*1.2,-3.5,0],1.85,.23,C.pink);
  finishAssembly(arm);arms.push(arm);
 }
 return {root,arms};
}

export function createEggheadMachines(world,{low=false}={}){
 const machines=new T.Group();machines.name='EGGHEAD_ROAMING_MACHINES';world.add(machines);
 const swimmers=[mechanicalShark('09',0xd85074),mechanicalSeaLion()];
 if(!low)swimmers.push(mechanicalShark('12',0x3c91ae),mechanicalShark('17',0x9a7dc0));
 swimmers.forEach(({root},i)=>{root.scale.setScalar(i===0?1.7:1.35);machines.add(root);});
 const giant=vegaForce();machines.add(giant.root);
 const bases=[[-32,-29],[27,-32],[38,13],[-24,38],[55,-11],[-45,5]];
 const patrols=bases.slice(0,low?4:6).map((_,i)=>{const bot=serviceRobot(i);machines.add(bot);return bot;});
 const state={seaBeasts:swimmers.length,serviceRobots:patrols.length,vegaForce:1};
 return {counts:state,update(time){
  swimmers.forEach(({root,tail},i)=>{
   const phase=time*(.028+i*.004)+i*1.9+.35,rx=low?218:225,rz=low?175:181;
   root.position.set(Math.sin(phase)*rx,-17.1+.25*Math.sin(time*1.4+i),Math.cos(phase)*rz);
   root.rotation.y=Math.atan2(Math.cos(phase)*rx,-Math.sin(phase)*rz);
   root.rotation.z=.035*Math.sin(time*.8+i);if(tail)tail.rotation.y=.18*Math.sin(time*2.6+i);
  });
  giant.root.position.set(-224+12*Math.sin(time*.12),-17.7+.35*Math.sin(time*.9),-24+10*Math.cos(time*.12));
  giant.root.rotation.y=.25+time*.045;
  giant.arms.forEach((arm,i)=>arm.rotation.z=(i?-.1:.1)+.10*Math.sin(time*.7+i*Math.PI));
  patrols.forEach((bot,i)=>{
   const [x,z]=bases[i],a=time*(.23+i*.025)+i*1.4;
   bot.position.set(x+Math.cos(a)*(2.5+i%3),1.5+.13*Math.sin(time*2+i),z+Math.sin(a)*(2.5+i%3));
   bot.rotation.y=a+Math.PI/2;
  });
 },diagnostics:()=>({seaBeasts:swimmers.map(({root})=>root.position.toArray()),vegaForce:giant.root.position.toArray(),serviceRobots:patrols.map(root=>root.position.toArray())})};
}
