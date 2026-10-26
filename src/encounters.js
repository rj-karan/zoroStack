import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label,mergeBone} from './geometry.js?v=4';
import {microNormal,softContact} from './assembly.js?v=4';

function katana(colour=C.cream,length=1.65){
 const g=new T.Group();g.name='Drawn_Katana';rod(g,[0,.05,0],[0,.35,0],.025,colour);ring(g,[0,0,0],.09,.015,C.gold,'y',20,materials.metal);
 for(let i=0;i<6;i++)add(g,new T.BoxGeometry(.037,.020,.05),C.navy,[0,.08+i*.043,.02],[1,1,1],[0,0,.65]);
 const shape=new T.Shape();shape.moveTo(-.035,-.06);shape.lineTo(-.04,-length*.82);shape.quadraticCurveTo(-.02,-length,.12,-length-.1);shape.lineTo(.065,-length*.78);shape.lineTo(.035,-.06);shape.closePath();
 const blade=new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:false,curveSegments:8,steps:1});add(g,blade,0xd5e5e8,[0,0,-.009],[1,1,1],[0,0,0],materials.metal);tube(g,[[.03,-.08,.015],[.04,-length*.8,.015],[.12,-length-.1,.015]],.008,C.white,16,materials.metal);mergeBone(g);return g;
}
function createSHawk(){
 const root=new T.Group();root.name='S_HAWK_SERAPHIM';root.userData.dynamic=true;const brown=0xa47656;
 sphere(root,[0,1.35,0],[.33,.43,.19],C.white);add(root,roundedBox(.55,.23,.38),C.white,[0,1.0,0]);label(root,'S-HAWK',[0,1.42,.20],.46,.14,{color:'#263952',font:'bold 88px Arial'});
 for(const s of [-1,1]){rod(root,[s*.16,1.05,0],[s*.22,.30,.06],.12,C.white);sphere(root,[s*.22,.15,.12],[.19,.15,.29],C.navy);}
 const head=new T.Group();head.name='S_Hawk_Head';head.position.y=2.08;root.add(head);sphere(head,[0,0,0],[.25,.30,.23],brown);sphere(head,[0,-.04,.22],[.04,.06,.04],brown,materials.enamel,12);
 for(const s of [-1,1]){sphere(head,[s*.10,.045,.207],[.075,.032,.018],C.cream,materials.enamel,16);sphere(head,[s*.10,.045,.224],[.019,.027,.008],0x654d2b,materials.enamel,12);tube(head,[[s*.16,.1,.19],[s*.08,.12,.22],[s*.04,.09,.22]],.012,0xeeeeec,8);}
 tube(head,[[-.07,-.17,.19],[0,-.18,.205],[.07,-.17,.19]],.006,0x473830,8);
 add(head,new T.SphereGeometry(.26,24,12,0,Math.PI*2,0,Math.PI*.52),C.white,[0,.10,0],[1,.8,1]);for(let i=0;i<32;i++){const a=i*2.4,r=Math.sqrt((i+.5)/32)*.23,tuft=add(head,new T.ConeGeometry(.045,.12,5),0xe7e8e1,[Math.cos(a)*r,.23+(.23-r)*.5,Math.sin(a)*r]);tuft.rotation.z=Math.cos(a)*-.4;}mergeBone(head);
 const wings=[];for(const s of [-1,1]){const wing=new T.Group();wing.name='S_Hawk_Black_Wing';wing.position.set(s*.26,1.62,-.12);root.add(wing);rod(wing,[0,0,0],[s*.8,.4,-.3],.10,0x243348);for(let i=0;i<9;i++){const feather=add(wing,new T.CapsuleGeometry(.075,.65+i*.04,3,8),i%2?0x28374c:0x39475a,[s*(.2+i*.1),.15-i*.08,-.22-i*.02]);feather.rotation.z=s*(-.7-i*.055);}mergeBone(wing);wings.push({wing,s});}
 const arms=[];for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.36,1.64,0);root.add(arm);rod(arm,[0,0,0],[s*.07,-.60,.12],.11,C.white);sphere(arm,[s*.07,-.65,.13],[.12,.13,.1],brown);if(s<0){const blade=katana(C.navy,2.0);blade.position.set(s*.07,-.72,.13);arm.add(blade);}mergeBone(arm);arms.push({arm,s});}
 const fire=new T.Group();fire.position.set(0,1.75,-.42);root.add(fire);const flame=new T.MeshBasicMaterial({color:0xffb444,toneMapped:false});add(fire,new T.SphereGeometry(1,12,10),C.orange,[0,.15,0],[.20,.48,.16],[0,0,0],flame);add(fire,new T.ConeGeometry(.20,.70,8),C.yellow,[0,.65,0],[1,1,1],[0,0,-.15],flame);
 mergeBone(root);return {root,arms,wings,fire};
}
export function createBattle(world,zoro){
 const foe=createSHawk();foe.root.position.set(14.0,2.08,24);foe.root.rotation.y=-Math.PI/2;world.add(foe.root);
 const body=zoro.root.getObjectByName('Zoro_Torso'),left=zoro.root.getObjectByName('Zoro_Arm_L'),right=zoro.root.getObjectByName('Zoro_Arm_R'),head=zoro.root.getObjectByName('Zoro_Head');
 const drawn=[];for(const [arm,s] of [[left,-1],[right,1]]){const sword=katana(s<0?0x8251a2:C.cream);sword.position.set(s*.12,-1.11,.14);arm.add(sword);drawn.push(sword);}
 const mouth=katana(0x684757,1.35);mouth.position.set(0,-.15,.26);mouth.rotation.z=Math.PI/2;head.add(mouth);drawn.push(mouth);
 const sheaths=['Wado_Ichimonji','Enma','Sandai_Kitetsu'].map(n=>zoro.root.getObjectByName(n));
 const fx=new T.Group();fx.name='Three_Sword_Impact';fx.userData.dynamic=true;fx.position.set(12.15,4.5,24);world.add(fx);
 const green=new T.MeshBasicMaterial({color:0x7aee9e,transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,toneMapped:false});const arcs=[];
 for(let i=0;i<3;i++){const arc=new T.Mesh(new T.TorusGeometry(1.0+i*.24,.028,4,40,Math.PI*1.25),green);arc.rotation.set(.4+i*.65,.2+i*.4,i*1.1);fx.add(arc);arcs.push(arc);}
 const rayGeo=new T.BufferGeometry(),p=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;p.push(Math.cos(a)*.10,Math.sin(a)*.10,0,Math.cos(a)*.65,Math.sin(a)*.65,0);}rayGeo.setAttribute('position',new T.Float32BufferAttribute(p,3));const sparks=new T.LineSegments(rayGeo,new T.LineBasicMaterial({color:0xffeb97,transparent:true,opacity:1}));fx.add(sparks);
 const shadowMaterial=softContact(),shadows=[];for(let i=0;i<2;i++){const s=new T.Mesh(new T.PlaneGeometry(1.5,1.1),shadowMaterial);s.rotation.x=-Math.PI/2;s.position.y=2.225;world.add(s);shadows.push(s);}
 zoro.root.traverse(o=>{if(o.isMesh)o.castShadow=false;});foe.root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
 let active=false,phase=0,start=0;
 return {cull(camera){const visible=camera.position.distanceTo(zoro.root.position)<90;zoro.root.visible=visible;foe.root.visible=visible;},replay(time){start=time-2.4;},update(time,progress){
  active=progress>=.45&&progress<=.67;phase=((time-start)%7.5+7.5)%7.5;
  const wind=T.MathUtils.smoothstep(phase,1.3,2.8),strike=T.MathUtils.smoothstep(phase,2.8,3.65),recover=T.MathUtils.smoothstep(phase,4.2,6.2),attack=wind*(1-recover),clash=Math.exp(-Math.pow((phase-3.65)/.32,2));
  drawn.forEach(o=>o.visible=active);sheaths.forEach(o=>o.visible=!active);fx.visible=active;foe.root.visible=true;
  zoro.root.position.set(9+(active?attack*.9:0),2.08,24);zoro.root.rotation.y=active?Math.PI/2:-.12;body.rotation.x=active?-.10*attack:0;
  if(active){left.rotation.set(-.3-attack*1.05+Math.sin(phase*2)*.12,0,-.12);right.rotation.set(-.15-wind*.5-strike*1.4+recover*1.9,0,.2);head.rotation.y=0;}
  else {left.rotation.x=right.rotation.x=0;}
  foe.root.position.x=14.0-(active?attack*.35:0);foe.root.rotation.z=active?Math.sin(phase*1.8)*.045:0;
  foe.arms.forEach(({arm,s})=>{arm.rotation.x=active?-.45-attack*1.1+clash*.15:0;arm.rotation.z=s*.12;});foe.wings.forEach(({wing,s})=>wing.rotation.y=s*(.1+(active?.18:0)+Math.sin(time*.8)*.035));foe.fire.scale.setScalar(1+Math.sin(time*4)*.06);
  arcs.forEach((arc,i)=>{arc.visible=phase>2.9&&phase<4.3;arc.rotation.z=i*1.1+strike*2.3;arc.scale.setScalar(.7+strike*.4);});green.opacity=.55*(1-recover);sparks.visible=clash>.05;sparks.scale.setScalar(.5+clash*1.5);sparks.rotation.z=time*2;
  shadows[0].position.x=zoro.root.position.x;shadows[0].position.z=24;shadows[1].position.x=foe.root.position.x;shadows[1].position.z=24;
 },diagnostics(){return {battleActive:active,battlePhase:phase,opponent:'S-Hawk',drawnSwords:active?3:0,zoroPosition:zoro.root.position.toArray(),swordArmRotation:right.rotation.toArray().slice(0,3),opponentArmRotation:foe.arms[0].arm.rotation.toArray().slice(0,3)};}};
}

export function createIronGiant(world){
 const root=new T.Group();root.name='EMET_ANCIENT_IRON_GIANT';root.position.set(43,1.7,-15);root.userData.dynamic=true;world.add(root);
 const contact=new T.Mesh(new T.PlaneGeometry(8,6),softContact());contact.rotation.x=-Math.PI/2;contact.position.set(43,1.78,-15);world.add(contact);
 const ruins=new T.Group();ruins.name='Emet_Ancient_Foundations';ruins.position.set(43,1.7,-15);world.add(ruins);
 for(let i=0;i<11;i++){const a=i*Math.PI*2/11,r=4.3+(i%3)*.35;add(ruins,roundedBox(1.6,.22,1.1,.13),i%2?0xa2ada3:0x88988c,[Math.sin(a)*r,-.02,Math.cos(a)*r],[1,1,1],[0,a+.2,0],materials.earth);for(let j=0;j<2;j++)sphere(ruins,[Math.sin(a)*r+j*.18,.10,Math.cos(a)*r],[.27,.06,.23],0x86a65c,materials.foliage,12);}
 for(const s of [-1,1]){cylinder(ruins,[s*3.7,.4,1.8],.5,.8,0x526b64,.6,16,materials.metal);ring(ruins,[s*3.7,.82,1.8],.45,.09,0xbd9e60);tube(ruins,[[s*3.7,.9,1.8],[s*4.2,1.4,1.0],[s*4.6,.4,-.5]],.11,0x677e65,12);}
 const rusty=new T.MeshStandardMaterial({vertexColors:true,roughness:.87,metalness:.35,normalMap:microNormal(81),normalScale:new T.Vector2(.65,.65)}),rust=0x9a6950,dark=0x4f5450,brass=0xb79858;
 for(const s of [-1,1]){sphere(root,[s*1.7,.65,.6],[1.25,.65,1.9],dark,rusty);rod(root,[s*1.7,1.0,0],[s*1.4,4.7,0],.67,rust,rusty,.85);ring(root,[s*1.5,3.1,0],.81,.14,brass,'y',32,rusty);sphere(root,[s*1.4,4.8,0],[.9,.9,.9],dark,rusty);}
 cylinder(root,[0,5.5,0],1.8,1.0,dark,2.0,32,rusty);
 const torso=new T.Group();torso.name='Emet_Torso';torso.position.y=5.8;root.add(torso);sphere(torso,[0,2,0],[2.8,2.9,1.6],rust,rusty,32);
 ring(torso,[0,2.1,1.5],1.6,.22,brass,'z',48,rusty);sphere(torso,[0,2.1,1.54],[1.4,1.4,.18],dark,rusty,24);ring(torso,[0,2.1,1.75],.78,.12,rust,'z',32,rusty);
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14;sphere(torso,[Math.sin(a)*1.65,2.1+Math.cos(a)*1.65,1.66],[.10,.10,.07],brass,rusty,12);}
 const reactor=new T.Mesh(new T.SphereGeometry(.48,20,12),new T.MeshBasicMaterial({color:0xe19c50,toneMapped:false}));reactor.userData.noMerge=true;reactor.position.set(0,2.1,1.8);reactor.scale.z=.2;torso.add(reactor);
 const head=new T.Group();head.name='Emet_Horned_Helmet';head.position.set(0,4.8,0);torso.add(head);sphere(head,[0,.6,0],[1.7,1.55,1.25],rust,rusty,32);
 add(head,roundedBox(2.6,.75,.2,.18),dark,[0,.65,1.05],[1,1,1],[0,0,0],rusty);const eyes=[];for(const s of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(.22,16,10),new T.MeshBasicMaterial({color:0xedd07c,toneMapped:false}));eye.userData.noMerge=true;eye.position.set(s*.65,.72,1.2);eye.scale.z=.3;head.add(eye);eyes.push(eye);tube(head,[[s*1.3,1.15,0],[s*2.2,1.8,0],[s*2.4,3.1,.1],[s*2.1,3.6,.25]],.30,0xb7b397,24,rusty);}
 for(let i=0;i<6;i++)add(head,roundedBox(.15,.48,.13,.02),brass,[(i-2.5)*.32,-.05,1.20],[1,1,1],[0,0,0],rusty);
 const arms=[];for(const s of [-1,1]){const arm=new T.Group();arm.name='Emet_Arm_'+s;arm.position.set(s*2.75,3.4,0);torso.add(arm);sphere(arm,[0,0,0],[1.15,1.15,1.15],dark,rusty);rod(arm,[0,0,0],[s*.6,-2.5,.2],.72,rust,rusty,.9);ring(arm,[s*.6,-2.5,.2],.8,.14,brass,'y',32,rusty);sphere(arm,[s*.65,-3,.3],[.85,.9,.75],dark,rusty);for(let j=0;j<4;j++)rod(arm,[s*.65+(j-1.5)*.30,-3.3,.65],[s*.65+(j-1.5)*.30,-4.1,.75],.12,rust,rusty);mergeBone(arm);arms.push({arm,s});}
 for(let i=0;i<18;i++){const a=i*2.4,x=Math.sin(a)*2.4,y=.5+(i%6)*.6;sphere(torso,[x,y,1.1],[.3,.16,.14],i%2?0x69845d:0x84916b,materials.foliage,12);}
 mergeBone(head);mergeBone(torso);mergeBone(root);root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
 let start=0,awake=false;return {replay(time){start=time;},update(time,progress){awake=progress>.66&&progress<.83;const wake=awake?T.MathUtils.smoothstep((time-start)%12,0,3):0;head.rotation.x=.24-wake*.24;head.rotation.y=Math.sin(time*.25)*.05*wake;torso.rotation.z=Math.sin(time*.4)*.012*wake;arms.forEach(({arm,s})=>{arm.rotation.x=-wake*.28;arm.rotation.z=s*(.09+wake*.12);});eyes.forEach(e=>{e.visible=awake;});reactor.visible=awake;reactor.scale.set(1+Math.sin(time*1.4)*.1,1+Math.sin(time*1.4)*.1,.2);},diagnostics(){return {ironGiantAwake:awake,giantHeadTilt:head.rotation.x,giantArmTilt:arms[0].arm.rotation.x};}};
}
