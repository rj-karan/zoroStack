import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label,mergeBone} from './geometry.js?v=4';

// Original articulated fan-art sculpt, using the Egghead outfit reference sheet.
export function createZoro(){
 const root=new T.Group();root.name='Roronoa_Zoro_Egghead';root.userData.dynamic=true;
 const navy=0x172b4a,navyLight=0x263d60,skin=0xdba87b,hair=0x7ba846,gold=0xf4c65e;
 const body=new T.Group();body.name='Zoro_Torso';body.position.y=1.65;root.add(body);
 sphere(body,[0,.47,0],[.43,.58,.23],navy);add(body,roundedBox(.67,.30,.41),navy,[0,.02,0]);
 cylinder(body,[0,1.0,0],.27,.25,navy,.31,24);ring(body,[0,1.125,0],.245,.035,navyLight);
 // Raised padded collar, jacket quilting and separate front closures sharpen
 // the Egghead coat silhouette at the close camera stop.
 for(const s of [-1,1]){
  const collar=add(body,roundedBox(.24,.33,.12,.045),navyLight,[s*.21,1.07,-.015],[1,1,1],[0,0,s*.27]);
  sphere(body,[s*.31,.62,-.02],[.16,.39,.245],navyLight);
  for(let k=0;k<4;k++)tube(body,[[s*.15,.74-k*.18,.236],[s*.30,.72-k*.18,.245],[s*.42,.68-k*.18,.17]],.011,0x56708c,10);
 }
 for(let k=0;k<5;k++)add(body,roundedBox(.065,.035,.025,.008),gold,[0,.76-k*.155,.255]);
 for(const s of [-1,1]){sphere(body,[s*.37,.79,0],[.18,.23,.24],navyLight);ring(body,[s*.4,.83,.13],.095,.023,gold,'z',20);rod(body,[s*.29,.81,.225],[s*.23,.2,.24],.018,C.white);}
 rod(body,[.25,.85,.24],[-.27,.2,.25],.043,gold);sphere(body,[-.03,.5,.285],[.09,.09,.023],gold,materials.metal,16);
 add(body,roundedBox(.1,.12,.025,.01),navy,[0,.5,.315]);
 label(body,'SSG',[-.2,.67,.245],.2,.07,{font:'bold 96px Arial',color:'#fff9e6'});
 for(const s of [-1,1])for(let i=0;i<3;i++)add(body,roundedBox(.07,.035,.018,.005),C.white,[s*(.11+i*.035),.57-i*.06,.246],[1,1,1],[0,0,s*.5]);
 const hips=[];
 for(const s of [-1,1]){
  const leg=new T.Group();leg.name=s<0?'Zoro_Leg_L':'Zoro_Leg_R';leg.position.set(s*.22,1.66,0);root.add(leg);
  rod(leg,[0,0,0],[s*.02,-.63,.025],.145,navy,materials.enamel,.17);rod(leg,[s*.02,-.63,.025],[s*.015,-.9,.055],.12,navy);
  label(leg,s>0?'SSG':'',[-.03,-.46,.158],.22,.13,{color:'#e58991',font:'bold 90px Arial'});
  const boot=new T.Group();boot.name='Zoro_DOM_Boot';boot.position.set(s*.01,-1.20,.05);leg.add(boot);
  cylinder(boot,[0,0,0],.205,.65,C.orange,.27,24);sphere(boot,[0,-.25,.12],[.27,.15,.36],C.orange);
  add(boot,roundedBox(.49,.105,.64,.08),navy,[0,-.325,.11]);ring(boot,[0,.32,0],.19,.026,C.cream);
  for(let k=0;k<4;k++)add(boot,roundedBox(.44,.022,.055,.01),0x43546a,[0,-.38,.29-k*.16]);
  sphere(boot,[0,.09,.215],[.105,.1,.025],gold,materials.metal,16);rod(boot,[0,.06,.22],[0,-.17,.28],.015,C.cream);
  for(const z of [-.15,.14])ring(boot,[0,-.1+z,0],.235,.008,0xb47c43,'y',24);
  add(boot,roundedBox(.11,.7,.065,.025),gold,[s*.18,.16,-.105],[1,1,1],[0,0,s*.15]);
  mergeBone(boot);mergeBone(leg);hips.push(leg);
 }
 const arms=[];
 for(const s of [-1,1]){
  const arm=new T.Group();arm.name=s<0?'Zoro_Arm_L':'Zoro_Arm_R';arm.position.set(s*.48,.83,0);body.add(arm);
  rod(arm,[0,0,0],[s*.10,-.38,.015],.155,navy,materials.enamel,.18);sphere(arm,[s*.1,-.38,.015],[.15,.15,.145],navy);
  for(let k=0;k<3;k++)ring(arm,[s*.06,-.12-k*.1,.014],.156,.008,navyLight,'y',20);
  rod(arm,[s*.10,-.38,.015],[s*.12,-.77,.10],.13,navyLight,materials.enamel,.15);
  for(const h of [.22,.32])rod(arm,[s*.015,-h,.13],[s*.18,-h-.05,.13],.023,gold);
  cylinder(arm,[s*.12,-.78,.10],.13,.10,navy,.13,20);sphere(arm,[s*.12,-.93,.1],[.115,.15,.085],navyLight);
  for(let i=0;i<4;i++){const x=s*.12+(i-1.5)*.045;rod(arm,[x,-.96,.16],[x,-1.075,.17],.022,navyLight);sphere(arm,[x,-1.07,.17],[.021,.024,.025],navyLight,materials.enamel,12);}
  mergeBone(arm);arms.push({arm,s});
 }
 const head=new T.Group();head.name='Zoro_Head';head.position.set(0,1.27,0);body.add(head);
 const face=new T.SphereGeometry(1,32,24),fp=face.attributes.position;
 for(let i=0;i<fp.count;i++){const y=fp.getY(i),jaw=y<-.15?T.MathUtils.lerp(.66,1,(y+1)/.85):1;fp.setXYZ(i,fp.getX(i)*.235*jaw,y*.30,fp.getZ(i)*.215);}face.computeVertexNormals();add(head,face,skin);
 sphere(head,[0,-.085,.207],[.035,.065,.037],skin,materials.enamel,16);
 for(const s of [-1,1]){sphere(head,[s*.23,-.005,0],[.052,.079,.043],skin,materials.enamel,16);tube(head,[[s*.145,.058,.183],[s*.095,.076,.213],[s*.05,.066,.211]],.012,0x314a2b,8);}
 sphere(head,[-.095,.034,.202],[.057,.025,.013],0xfff8dc,materials.enamel,16);sphere(head,[-.084,.035,.214],[.014,.021,.006],0x26334a,materials.enamel,12);
 tube(head,[[.045,.021,.213],[.103,.012,.212],[.146,.016,.182]],.006,0x6e4637,8);
 tube(head,[[.1,.14,.194],[.105,.06,.215],[.103,-.052,.211],[.095,-.115,.191]],.006,0xa86e59,12);
 tube(head,[[-.07,-.166,.174],[0,-.157,.193],[.069,-.165,.173]],.0055,0x805444,8);
 for(let i=0;i<3;i++)ring(head,[.264+i*.017,-.075-i*.012,.015],.026,.006,gold,'z',16,materials.metal);
 add(head,new T.SphereGeometry(.244,32,16,0,Math.PI*2,0,Math.PI*.51),hair,[0,.1,-.01],[1,.84,1]);
 let seed=7281;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<75;i++){
  const a=i*2.39996,level=Math.acos(1-(i+.5)/76),r=.235*Math.sin(level),p=new T.Vector3(Math.cos(a)*r,.105+Math.cos(level)*.19,Math.sin(a)*r-.02),direction=new T.Vector3(Math.cos(a)*.4,.8,Math.sin(a)*.35-.2).normalize();
  const tuft=add(head,new T.ConeGeometry(.035+rand()*.012,.05+rand()*.04,5),i%5?hair:0xb0ce75,p.clone().addScaledVector(direction,.04).toArray());tuft.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);
 }
 mergeBone(head);
 const swords=new T.Group();swords.name='Zoro_Three_Swords';swords.position.set(.03,.50,-.22);swords.rotation.z=-.49;body.add(swords);
 const sheaths=[C.cream,0x754287,0x7f3549];
 for(let i=0;i<3;i++){
  const x=(i-1)*.135,g=new T.Group();g.name=['Wado_Ichimonji','Enma','Sandai_Kitetsu'][i];g.position.set(x,0,(i-1)*.02);swords.add(g);
  cylinder(g,[0,-.60,0],.042,1.72,sheaths[i],.035,12);sphere(g,[0,-1.46,0],[.036,.05,.036],gold,materials.metal,12);
  for(const y of [-1.25,-.55,.15])ring(g,[0,y,0],.044,.009,gold,'y',16,materials.metal);
  cylinder(g,[0,.34,0],.035,.34,i===0?C.white:navy,.035,12);ring(g,[0,.145,0],.088,.012,gold,'y',24,materials.metal);
  for(let j=0;j<6;j++){const y=.21+j*.05;add(g,new T.BoxGeometry(.045,.024,.065),i===0?navy:C.cream,[0,y,0],[1,1,1],[0,0,.65]);}
  sphere(g,[0,.53,0],[.045,.018,.045],gold,materials.metal,12);mergeBone(g);
 }
 mergeBone(body);
 return {root,update(time){body.position.y=1.65+Math.sin(time*1.25)*.012;head.rotation.y=.11+Math.sin(time*.42)*.045;arms.forEach(({arm,s})=>{arm.rotation.z=s*(.03+Math.sin(time*.8+s)*.012);});swords.rotation.z=-.49+Math.sin(time*.8)*.008;}};
}
