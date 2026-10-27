import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label,mergeBone} from './geometry.js?v=4';
import {createSunny} from './sunny.js?v=13';
import {createBattle,createIronGiant} from './encounters.js?v=13';
import {microNormal} from './assembly.js?v=4';

export async function createAdventure(world,zoro,{low=false}={}){
 const wind={value:0},ship=createSunny(wind);world.add(ship);
 const wood=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,normalMap:microNormal(11),normalScale:new T.Vector2(.35,.35)});
 const harbor=new T.Group();harbor.name='SUNNY_HARBOUR';harbor.position.set(-95,-16,23);world.add(harbor);
 const start=new T.Vector3(-30,1.80,26),end=new T.Vector3(-49,1.80,38),direction=end.clone().sub(start).normalize(),side=new T.Vector3(-direction.z,0,direction.x);
 for(let i=0;i<38;i++){const p=start.clone().lerp(end,i/37),board=add(harbor,roundedBox(5.0,.20,.55,.055),i%3?0xb58b59:0xc69a62,p.toArray(),[1,1,1],[0,Math.atan2(direction.x,direction.z),0],wood);}
 for(const sign of [-1,1]){
  const a=start.clone().addScaledVector(side,sign*2.3),b=end.clone().addScaledVector(side,sign*2.3);rod(harbor,a.clone().add(new T.Vector3(0,.8,0)).toArray(),b.clone().add(new T.Vector3(0,.8,0)).toArray(),.055,C.cream);
  for(let i=0;i<9;i++){const p=a.clone().lerp(b,i/8);cylinder(harbor,[p.x,.2,p.z],.16,4,0x796342,.22,12,wood);cylinder(harbor,[p.x,2.4,p.z],.14,.9,C.cream,.14,16);sphere(harbor,[p.x,2.88,p.z],[.16,.10,.16],C.gold,materials.metal,12);}
 }
 for(const [x,z] of [[-43,33],[-46,35],[-48,38]]){cylinder(harbor,[x,2.0,z],.18,.4,C.navy,.24,16,materials.metal);rod(harbor,[x-.30,2.2,z],[x+.30,2.2,z],.08,C.navy,materials.metal);ring(harbor,[x,2.07,z],.30,.07,0xd9c7a0,'y',24);}
 const entry=new T.Group();entry.position.copy(start);entry.rotation.y=Math.atan2(direction.x,direction.z);harbor.add(entry);for(const x of [-2.6,2.6])rod(entry,[x,0,0],[x,5.6,0],.10,C.cream);add(entry,roundedBox(5.7,1.1,.18,.12),C.navy,[0,5.4,0]);label(entry,'SUNNY HARBOUR',[0,5.4,.11],5.3,.65,{color:'#ffefbd',font:'bold 86px Arial'});
 for(let i=0;i<5;i++){const g=new T.Group();g.position.set(-37+i*2.1,2.0,25-i*.5);harbor.add(g);add(g,roundedBox(1.15,1.05,1.1,.05),0xba8a53,[0,.5,0],[1,1,1],[0,0,0],wood);for(const x of [-.40,.40])add(g,new T.BoxGeometry(.08,1.03,.04),0x815b37,[x,.50,.57],[1,1,1],[0,0,0],wood);}
 const lifebuoy=ring(harbor,[-43,2.2,35.7],.45,.12,C.coral,'z',32);for(let i=0;i<4;i++){const a=i*Math.PI/2;add(harbor,roundedBox(.19,.22,.16,.03),C.cream,[-43+Math.sin(a)*.45,2.2+Math.cos(a)*.45,35.72],[1,1,1],[0,0,-a]);}
 const approach=new T.CatmullRomCurve3([[-36,1.91,28],[-33,1.91,24],[-29,1.91,19],[-22,1.91,16]].map(p=>new T.Vector3(...p)));
 for(let i=0;i<24;i++){const a=approach.getPoint(i/24),b=approach.getPoint((i+1)/24),d=b.clone().sub(a),p=a.clone().add(b).multiplyScalar(.5);add(harbor,roundedBox(2.8,.12,d.length()+.1,.035),C.cream,p.toArray(),[1,1,1],[0,Math.atan2(d.x,d.z),0]);}
 // A cliffside lift connects the harbour deck at sea level to Fabriophase.
 const portLift=new T.Group();portLift.name='CLIFFSIDE_SUNNY_PORT_LIFT';portLift.position.set(-125,-15.7,49);world.add(portLift);
 for(const s of [-1,1]){
  rod(portLift,[s*1.9,0,0],[s*1.9,18,0],.20,C.cream);
  for(let j=0;j<10;j++)rod(portLift,[s*1.9,j*1.8,0],[-s*1.9,j*1.8+1.8,0],.07,C.cyan);
 }
 for(const y of [.4,17.4]){
  add(portLift,roundedBox(5,.35,4,.12),C.white,[0,y,0]);ring(portLift,[0,y+.2,0],2.3,.07,C.gold);
 }
 for(const y of [3,7,11,15]){ring(portLift,[0,y,0],2.5,.09,C.cyan);sphere(portLift,[0,y,2.5],[.15,.15,.15],C.yellow);}
 label(portLift,'PORT LIFT / 01',[0,15.1,2.7],4.5,.65,{color:'#f7f7df',background:'#214b69',font:'bold 86px Arial'});
 await new Promise(r=>setTimeout(r,0));
 // A real outer district and technical streets expand the island's footprint.
 const district=new T.Group();district.name='OUTER_FABRIOPHASE_DISTRICT';world.add(district);const lots=[[-42,8],[-43,-7],[-33,-28],[-19,-35],[1,-37],[25,-31],[39,-24],[46,5],[39,27],[23,35],[-14,37],[-29,31]];
 for(let i=0;i<lots.length;i++){
  const [x,z]=lots[i],h=6+(i%4)*2.4,colour=[C.coral,C.mint,C.purple,C.blue,C.yellow][i%5],g=new T.Group();g.position.set(x,1.7,z);g.name='Outer_City_Block_'+i;district.add(g);
  cylinder(g,[0,h*.4,0],2.2,h*.8,C.cream,2.65,32);sphere(g,[0,h*.8,0],[3.1,1.5,3.1],colour);ring(g,[0,h*.8,0],3.15,.13,C.gold);cylinder(g,[0,h*.91,0],1.2,1.0,C.navy,1.2,24);sphere(g,[0,h+1.2,0],[1.7,.65,1.7],C.cream);
  for(let k=0;k<6;k++){const a=k*Math.PI/3,window=new T.Group();window.position.set(Math.sin(a)*2.24,h*.5,Math.cos(a)*2.24);window.rotation.y=a;g.add(window);add(window,roundedBox(.70,1.1,.1,.16),C.blue);ring(window,[0,.1,.08],.27,.035,C.cream,'z',20);}
  rod(g,[0,h+1.6,0],[0,h+3.2,0],.06,C.gold);sphere(g,[0,h+3.2,0],[.25,.25,.25],colour,materials.enamel,16);
  for(const s of [-1,1]){rod(g,[s*1.65,.3,-1.5],[s*1.65,h*.6,-1.5],.12,colour);}
  // Service cabinets, curved pedestrian strips and garden borders give each block a base.
  add(g,roundedBox(1.1,1.4,.55,.12),C.navy,[2.8,.7,1.5]);for(let k=0;k<3;k++)add(g,roundedBox(.65,.06,.03,.01),C.cyan,[2.8,.85+k*.15,1.80]);
  const route=new T.CatmullRomCurve3([[0,.12,3.2],[1.4,.12,3.8],[3.2,.12,3.3],[4,.12,2]].map(p=>new T.Vector3(...p)));
  for(let k=0;k<9;k++){const a=route.getPoint(k/9),b=route.getPoint((k+1)/9),d=b.clone().sub(a),p=a.clone().add(b).multiplyScalar(.5);add(g,roundedBox(1.15,.1,d.length()+.06,.03),C.cream,p.toArray(),[1,1,1],[0,Math.atan2(d.x,d.z),0]);}
  for(let k=0;k<3;k++){const a=k*2.4; sphere(g,[-2.3+Math.sin(a)*.6,.22,2.6+Math.cos(a)*.5],[.65,.3,.55],k%2?0x8dc65f:0xb9d98b,materials.foliage,16);}
  if(i%3===0)await new Promise(r=>setTimeout(r,0));
 }
 const turbines=[];for(let i=0;i<3;i++){
  const g=new T.Group();g.name='VEGA_Reactor_Turbine';g.userData.dynamic=true;g.position.set(-20+i*5.3,8,-31);world.add(g);ring(g,[0,0,0],1.8,.2,C.cream,'z',48);ring(g,[0,0,.05],1.55,.1,C.coral,'z',40);sphere(g,[0,0,0],[.3,.3,.15],C.gold,materials.metal);
  const rotor=new T.Group();g.add(rotor);for(let j=0;j<6;j++){const a=j*Math.PI/3,b=add(rotor,roundedBox(.42,1.15,.13,.09),C.blue,[Math.sin(a)*.85,Math.cos(a)*.85,.12],[1,1,1],[0,0,-a+.4]);}mergeBone(rotor);mergeBone(g);turbines.push(rotor);rod(world,[g.position.x,1.8,-31],[g.position.x,6.2,-31],.25,C.cream);
 }
 label(world,'VEGA ENERGY',[-14.7,11,-30.8],11,.85,{color:'#fffce1',background:'#22405d',font:'bold 80px Arial'});
 cylinder(world,[11.5,2.0,24],6.8,.20,0xe6eee4,6.85,8);ring(world,[11.5,2.12,24],6.4,.05,C.yellow);ring(world,[11.5,2.12,24],5.9,.035,C.cyan);
 for(let i=0;i<8;i++){const a=i*Math.PI/4,marker=add(world,roundedBox(.18,.025,.8,.01),C.coral,[11.5+Math.sin(a)*6.2,2.125,24+Math.cos(a)*6.2],[1,1,1],[0,a,0]);}
 const battle=createBattle(world,zoro),giant=createIronGiant(world);
 // A climbable-looking service gantry gives the long upward journey a landmark.
 const gantry=new T.Group();gantry.name='LABOPHASE_SERVICE_GANTRY';world.add(gantry);
 for(const s of [-1,1]){rod(gantry,[-25+s*1.4,1.7,-6],[-25+s*1.4,35,-6],.20,C.cream);for(let i=0;i<8;i++)rod(gantry,[-25+s*1.4,3+i*4,-6],[-25-s*1.4,7+i*4,-6],.08,C.cyan);}
 for(let i=0;i<19;i++)rod(gantry,[-25.7,2+i*1.7,-5.7],[-24.3,2+i*1.7,-5.7],.045,C.gold);label(gantry,'CLOUD LIFT / 066',[-25,28,-5.5],5,.7,{color:'#23405b',background:'#fff7d8',font:'bold 85px Arial'});
 const splash=new T.Group();splash.name='SUNNY_SPLASH';splash.userData.dynamic=true;world.add(splash);const foam=new T.MeshBasicMaterial({color:0xdffff7,transparent:true,opacity:.65,depthWrite:false});const waves=[];
 for(let i=0;i<3;i++){const mesh=new T.Mesh(new T.TorusGeometry(1,.035,4,64),foam);mesh.rotation.x=-Math.PI/2;splash.add(mesh);waves.push(mesh);}
 const drops=new T.InstancedMesh(new T.SphereGeometry(.13,7,4),new T.MeshBasicMaterial({color:0xe0ffff}),28);drops.userData.dynamicInsect=true;drops.frustumCulled=false;drops.count=0;splash.add(drops);const dummy=new T.Object3D();
 // Coup de Burst is a real exhaust assembly attached to the Sunny's stern.
 const burst=new T.Group();burst.name='COUP_DE_BURST';burst.position.set(0,2.5,-6.7);burst.visible=false;ship.add(burst);
 const blueFlame=new T.MeshBasicMaterial({color:0x168ff1,transparent:true,opacity:.68,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
 const innerFlame=new T.MeshBasicMaterial({color:0x86eaff,transparent:true,opacity:.72,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
 for(const x of [-1.35,0,1.35]){
  const nozzle=new T.Group();nozzle.position.set(x,0,0);burst.add(nozzle);
  ring(nozzle,[0,0,-.25],.46,.1,C.navy,'z',24);
  ring(nozzle,[0,0,-.38],.3,.045,C.cyan,'z',24);
  const flame=new T.Mesh(new T.ConeGeometry(.7,6,24),blueFlame);flame.rotation.x=-Math.PI/2;flame.position.z=-3.8;nozzle.add(flame);
  const core=new T.Mesh(new T.ConeGeometry(.28,4.5,20),innerFlame);core.rotation.x=-Math.PI/2;core.position.z=-3.25;nozzle.add(core);
  for(let i=0;i<3;i++){const halo=new T.Mesh(new T.TorusGeometry(.7+i*.35,.07,6,24),blueFlame);halo.position.z=-2.1-i*1.25;nozzle.add(halo);}
 }
 const flightPath=new T.CatmullRomCurve3([[170,80,135],[165,88,210],[65,105,205],[-45,95,175],[-115,62,120],[-152,25,102],[-150,-17.8,60]].map(v=>new T.Vector3(...v)),false,'centripetal');
 const trackingMatrix=new T.Matrix4(),trackingOrientation=new T.Quaternion(),trackingUp=new T.Vector3(0,1,0);
 let shipStart=0,u=0,shipState='airborne',replayingShip=false,fightState={},giantState={};
 return {replay(time,progress){if(progress<.365){shipStart=time;replayingShip=true;}else if(progress<.67)battle.replay(time);else giant.replay(time);},update(time,progress){
  wind.value=time;
  if(progress<.005||progress>.365)replayingShip=false;
  const elapsed=Math.max(0,time-shipStart),base=T.MathUtils.smoothstep(progress,.018,.345),play=T.MathUtils.smoothstep(elapsed,0,7.5);
  const replayWeight=T.MathUtils.smoothstep(progress,.012,.035)*(1-T.MathUtils.smoothstep(progress,.34,.365));u=replayingShip?T.MathUtils.lerp(base,play,replayWeight):base;
  const travel=T.MathUtils.smoothstep(u,0,1),point=flightPath.getPointAt(travel),heading=flightPath.getTangentAt(travel);
  ship.position.copy(point);ship.position.y+=Math.sin(time*1.3)*.18*(1-travel)+Math.sin(time*.8)*.10*travel;
  const yaw=Math.atan2(heading.x,heading.z);ship.rotation.set(.09*Math.sin(u*Math.PI)+Math.sin(time*.6)*.014, T.MathUtils.lerp(yaw,.62,T.MathUtils.smoothstep(u,.80,1)), -.22*Math.sin(Math.PI*u)+Math.sin(time*.8)*.012);
  burst.visible=progress>.055&&progress<.235&&u<.84;
  if(burst.visible){burst.scale.setScalar(.86+.17*Math.sin(time*12));blueFlame.opacity=.52+.12*Math.sin(time*11);}
  shipState=u<.18?'approach':u<.65?'coup-de-burst':u<.94?'descending':u<.995?'splashdown':'afloat';
  splash.position.set(-150,-17.40,60);splash.visible=u>.93;
  waves.forEach((mesh,i)=>{const t=(time*.28+i/3)%1;mesh.scale.setScalar(2+t*9);mesh.position.y=.02*i;});foam.opacity=.55;
  let count=0;if(u>.92&&u<1){for(let i=0;i<28;i++){const a=i*2.4,t=(u-.92)/.08;dummy.position.set(Math.sin(a)*(2+t*5),Math.sin(t*Math.PI)*(1.5+i%4*.4),Math.cos(a)*(2+t*4));dummy.scale.set(.6,1.5,.6);dummy.updateMatrix();drops.setMatrixAt(count++,dummy.matrix);}}drops.count=count;drops.instanceMatrix.needsUpdate=true;
  battle.update(time,progress);giant.update(time,progress);fightState=battle.diagnostics();giantState=giant.diagnostics();turbines.forEach((o,i)=>o.rotation.z=time*(.22+i*.05));
 },frameCamera(camera,progress,{allowTracking=true}={}){battle.cull(camera);const weight=T.MathUtils.smoothstep(progress,.055,.105)*(1-T.MathUtils.smoothstep(progress,.25,.34));if(weight>0&&allowTracking){const focus=ship.position.clone().add(new T.Vector3(0,7,0));trackingMatrix.lookAt(camera.position,focus,trackingUp);trackingOrientation.setFromRotationMatrix(trackingMatrix);camera.quaternion.slerp(trackingOrientation,weight);camera.updateMatrixWorld();}},diagnostics(){return {shipState,shipDescent:u,shipPosition:ship.position.toArray(),burstVisible:burst.visible,...fightState,...giantState,outerDistrictBlocks:lots.length};}};
}
