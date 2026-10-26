import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label} from './geometry.js?v=4';
import {finishAssembly,microNormal} from './assembly.js?v=4';

export function createSunny(wind){
 const ship=new T.Group();ship.name='THOUSAND_SUNNY';ship.userData.dynamic=true;
 const wood=new T.MeshStandardMaterial({vertexColors:true,roughness:.72,normalMap:microNormal(24),normalScale:new T.Vector2(.3,.3)}),sail=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,normalMap:microNormal(7),normalScale:new T.Vector2(.16,.16),side:T.DoubleSide,forceSinglePass:true});
 const scan=(name,srgb=false)=>{const map=new T.TextureLoader().load('assets/textures/'+name);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;if(srgb)map.colorSpace=T.SRGBColorSpace;return map;};
 const hullWood=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,side:T.DoubleSide,map:scan('sunny-wood-diff.jpg',true),normalMap:scan('sunny-wood-normal.jpg'),roughnessMap:scan('sunny-wood-rough.jpg'),normalScale:new T.Vector2(.38,.38)});
 sail.onBeforeCompile=shader=>{shader.uniforms.sailClock=wind;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float sailClock;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(uv.x*3.14159)*sin(uv.y*3.14159)*.12*sin(sailClock*1.4+position.y);');};
 const p=[],uv=[],ix=[],sections=32,sides=16;
 for(let j=0;j<=sections;j++){const t=j/sections,z=-6+t*12,w=.18+Math.pow(Math.sin(t*Math.PI),.58)*3.25,keel=.15+Math.pow((t-.5)*2,4)*1.5;
  for(let i=0;i<=sides;i++){const a=i/sides*Math.PI;p.push(Math.cos(a)*w,3.0-(3-keel)*Math.sin(a),z);uv.push(t*8,i/sides);if(j<sections&&i<sides){const k=j*(sides+1)+i;ix.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}}
 }
 const hull=new T.BufferGeometry();hull.setAttribute('position',new T.Float32BufferAttribute(p,3));hull.setAttribute('uv',new T.Float32BufferAttribute(uv,2));hull.setIndex(ix);hull.computeVertexNormals();wood.side=T.DoubleSide;add(ship,hull,0xb47d56,[0,0,0],[1,1,1],[0,0,0],hullWood);
 for(const sign of [-1,1]){
  for(const [y,col,r] of [[3.0,C.cream,.13],[2.7,C.coral,.24],[.95,C.cream,.12]]){const pts=[];for(let j=0;j<=32;j++){const t=j/32;pts.push([sign*(.18+Math.pow(Math.sin(t*Math.PI),.58)*3.25),y+Math.pow((t-.5)*2,4)*.3,-6+t*12]);}tube(ship,pts,r,col,64);}
  for(const y of [1.4,2.1]){const pts=[];for(let j=0;j<=24;j++){const t=j/24;pts.push([sign*(.18+Math.pow(Math.sin(t*Math.PI),.58)*3.25)*Math.sqrt(Math.max(.05,1-Math.pow((3-y)/2.8,2))),y,-6+t*12]);}tube(ship,pts,.018,0x663c2a,48,wood);}
  for(let i=0;i<4;i++){const z=-3.9+i*2.6,x=sign*(2.65+.5*Math.sin((z+6)/12*Math.PI));const door=new T.Group();door.position.set(x,1.75,z);door.rotation.y=sign*Math.PI/2;ship.add(door);ring(door,[0,0,0],.72,.12,C.gold,'z',28);sphere(door,[0,0,-.06],[.65,.65,.06],C.cream);label(door,String(i+1),[0,0,.03],.55,.75,{color:'#bf492e',font:'bold 90px Georgia'});}
  for(let i=0;i<15;i++){const z=-5.5+i*11/14,x=sign*(.23+Math.pow(Math.sin((z+6)/12*Math.PI),.58)*3.1);rod(ship,[x,3.05,z],[x,3.85,z],.055,C.cream);sphere(ship,[x,3.87,z],[.09,.09,.09],C.gold,materials.metal,12);}
  const rail=[];for(let i=0;i<=32;i++){const t=i/32;rail.push([sign*(.25+Math.pow(Math.sin(t*Math.PI),.58)*3.1),3.8,-5.6+t*11.2]);}tube(ship,rail,.065,C.cream,64);
  for(let i=0;i<3;i++){const z=-3+i*2.8;const cannon=cylinder(ship,[sign*3.25,2.65,z],.16,.6,C.navy,.22,16,materials.metal);cannon.rotation.z=sign*Math.PI/2;ring(ship,[sign*3.56,2.65,z],.17,.045,C.gold,'x',16);}
 }
 add(ship,new T.CylinderGeometry(3.12,3.12,.12,64),0xc08d55,[0,3.02,0],[1,1,1.78],[0,0,0],hullWood);
 for(let i=0;i<24;i++){const z=-5.3+i*.45,w=Math.sqrt(Math.max(0,1-z*z/30.8))*3.04;rod(ship,[-w,3.10,z],[w,3.10,z],.016,0x826443,wood);}
 add(ship,new T.CylinderGeometry(1.65,1.65,.035,48),0x97bc54,[0,3.12,.3],[1,1,1.6],[0,0,0],materials.earth);
 for(let i=0;i<3;i++){const x=2.3,z=-2+i*1.3;cylinder(ship,[x,3.25,z],.28,.34,C.coral,.22,16);rod(ship,[x,3.4,z],[x,4.2,z],.06,0x8c6540,wood);sphere(ship,[x,4.3,z],[.52,.55,.50],0x639a42,materials.foliage,16);for(let j=0;j<5;j++){const a=j*2.4;sphere(ship,[x+Math.sin(a)*.4,4.3+Math.cos(a)*.24,z+.27],[.09,.09,.09],C.orange,materials.enamel,12);}}
 const cabin=new T.Group();cabin.position.set(0,3.1,-3.8);ship.add(cabin);add(cabin,roundedBox(3.5,2.3,3,.25),C.coral,[0,1.15,0]);add(cabin,roundedBox(4, .35,3.5,.16),C.cream,[0,2.45,0]);
 for(const x of [-1.15,0,1.15]){add(cabin,roundedBox(.70,.80,.10,.15),C.gold,[x,1.2,1.55]);add(cabin,roundedBox(.52,.62,.12,.12),C.cyan,[x,1.2,1.63]);rod(cabin,[x-.3,1.2,1.71],[x+.3,1.2,1.71],.025,C.cream);}
 sphere(cabin,[0,2.8,0],[1.65,.6,1.4],C.cream);rod(cabin,[0,3.0,0],[0,4,0],.10,C.gold);ring(cabin,[0,3.4,.16],.28,.065,C.gold,'z',24);label(cabin,'SUNNY',[0,2,1.7],2.5,.35,{color:'#fff9d9',font:'bold 85px Georgia'});
 for(const x of [-2,2])for(let z=-2;z<=1;z+=1.3){const y=3.25+(-z+1)*.25;add(ship,roundedBox(.55,.17,.5,.04),C.cream,[x,y,z]);}
 // Masts, crow's nests and authentic-looking tensioned rigging.
 for(const [z,h] of [[.8,13.4],[-3.9,9.5]]){
  cylinder(ship,[0,3+h/2,z],.13,h,0x845638,.20,20,wood);rod(ship,[-3.9,h*.75+3,z],[3.9,h*.75+3,z],.10,0x845638,wood);
  for(const s of [-1,1]){rod(ship,[0,h+3,z],[s*2.6,3.8,z+2.8],.023,0x76684a);rod(ship,[0,h+3,z],[s*2.4,3.8,z-2.6],.023,0x76684a);}
 }
 cylinder(ship,[0,14.3,.8],.65,.6,C.cream,.58,24);ring(ship,[0,14.65,.8],.70,.055,C.gold);for(let i=0;i<10;i++){const a=i*Math.PI*2/10;rod(ship,[Math.sin(a)*.65,14.3,.8+Math.cos(a)*.65],[Math.sin(a)*.65,15,.8+Math.cos(a)*.65],.025,C.cream);}ring(ship,[0,15,.8],.65,.045,C.cream);
 function cloth(width,height,y,z,color){const g=new T.PlaneGeometry(width,height,12,10),v=g.attributes.position;for(let i=0;i<v.count;i++){const u=v.getX(i)/width+.5,w=v.getY(i)/height+.5;v.setZ(i,Math.sin(u*Math.PI)*Math.sin(w*Math.PI)*.7);}g.computeVertexNormals();return add(ship,g,color,[0,y,z],[1,1,1],[0,0,0],sail);}
 cloth(7.5,5.8,10.0,1.1,C.cream);cloth(4.7,3.1,7.3,-3.5,C.coral);
 // The masthead carries a real cloth mesh with a separate sculpted Straw Hat mark.
 const flag=new T.Group();flag.name='Sunny_Masthead_Flag';flag.position.set(0,15.6,.8);ship.add(flag);
 const flagMaterial=new T.MeshStandardMaterial({color:0x172b4a,roughness:.95,side:T.DoubleSide});
 flagMaterial.onBeforeCompile=shader=>{shader.uniforms.flagClock=wind;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float flagClock;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=.12*uv.x*uv.x*sin(flagClock*2.4+uv.x*7.0+uv.y*2.5);');};
 const flagCloth=new T.Mesh(new T.PlaneGeometry(2.35,1.23,24,12),flagMaterial);flagCloth.position.set(1.2,.02,0);flagCloth.receiveShadow=true;flag.add(flagCloth);
 rod(flag,[.04,-.65,-.02],[.04,.74,-.02],.045,C.gold,wood);
 for(const y of [-.49,.48]){rod(flag,[.1,y,.025],[2.28,y,.025],.015,C.cream);sphere(flag,[.08,y,.04],[.045,.045,.045],C.gold,materials.metal,12);}
 const mark=new T.Group();mark.position.set(1.18,.02,.085);flag.add(mark);
 for(const angle of [-.65,.65]){const end=Math.cos(angle)*.48,rise=Math.sin(angle)*.35;rod(mark,[-end,-rise-.13,0],[end,rise-.13,0],.045,C.white);for(const s of [-1,1])sphere(mark,[s*end,s*rise-.13,0],[.07,.07,.055],C.white,materials.enamel,12);}
 sphere(mark,[0,.03,.035],[.34,.29,.065],C.white);for(const x of [-.12,.12])sphere(mark,[x,.07,.095],[.066,.075,.02],C.navy);
 add(mark,roundedBox(.38,.10,.035,.014),C.white,[0,-.24,.065]);sphere(mark,[0,.31,.045],[.39,.12,.07],C.yellow);add(mark,roundedBox(.65,.055,.04,.01),C.coral,[0,.26,.105]);
 for(const y of [6.65,7.35,8.05])rod(ship,[-2.3,y,-3.25],[2.3,y,-3.25],.06,C.cream);
 // The Straw Hat emblem is real meshwork on the bowed main sail.
 const emblem=new T.Group();emblem.position.set(0,10.2,1.95);ship.add(emblem);
 for(const a of [-.7,.7]){const b=rod(emblem,[-Math.cos(a)*1.3,-Math.sin(a)*1.3-.4,0],[Math.cos(a)*1.3,Math.sin(a)*1.3-.4,0],.10,C.cream);for(const s of [-1,1])sphere(emblem,[s*Math.cos(a)*1.28,s*Math.sin(a)*1.28-.4,0],[.16,.16,.09],C.cream,materials.enamel,12);}
 sphere(emblem,[0,0,.08],[.76,.72,.12],C.white);for(const x of [-.29,.29])sphere(emblem,[x,.08,.205],[.15,.18,.035],C.navy,materials.enamel,16);sphere(emblem,[0,-.2,.22],[.08,.09,.025],C.navy,materials.enamel,12);
 add(emblem,roundedBox(.70,.28,.15,.05),C.white,[0,-.6,.12]);for(const x of [-.18,0,.18])rod(emblem,[x,-.73,.21],[x,-.47,.21],.015,C.navy);
 sphere(emblem,[0,.52,.05],[.82,.34,.14],C.yellow);add(emblem,roundedBox(1.25,.12,.16,.04),C.coral,[0,.46,.20]);sphere(emblem,[0,.34,.17],[1.03,.075,.10],C.yellow);
 // Lion-sun prow and the crossed bones that make Sunny unmistakable.
 const lion=new T.Group();lion.name='Sunny_Lion_Figurehead';lion.position.set(0,3.15,6.05);ship.add(lion);
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14,m=sphere(lion,[Math.sin(a)*1.25,Math.cos(a)*1.25,0],[.34,.62,.26],i%2?C.gold:C.orange);m.rotation.z=-a;}
 sphere(lion,[0,0,.26],[1.08,1.05,.35],C.yellow);for(const x of [-.40,.40])sphere(lion,[x,.22,.59],[.12,.16,.045],C.navy,materials.enamel,16);
 sphere(lion,[0,-.25,.59],[.68,.43,.16],C.cream);sphere(lion,[0,-.04,.77],[.18,.12,.07],C.navy,materials.enamel,16);tube(lion,[[-.34,-.28,.76],[0,-.43,.79],[.34,-.28,.76]],.035,C.navy,16);
 for(const s of [-1,1])rod(lion,[s*1.2,-1.0,-.05],[-s*1.2,1.0,-.05],.12,C.cream);
 // Luffy on the forward deck, straw hat and raised arm visible in the landing.
 const luffy=new T.Group();luffy.name='Luffy_On_Deck';luffy.position.set(0,3.15,4.1);ship.add(luffy);
 sphere(luffy,[0,.9,0],[.28,.42,.18],C.coral);sphere(luffy,[0,1.5,0],[.23,.28,.22],0xe7b384);cylinder(luffy,[0,1.73,0],.29,.16,C.yellow,.3,20);ring(luffy,[0,1.67,0],.38,.05,C.yellow);ring(luffy,[0,1.69,0],.29,.035,C.coral);
 for(const s of [-1,1]){rod(luffy,[s*.2,.65,0],[s*.2,.25,.1],.10,C.blue);rod(luffy,[s*.22,1.1,0],[s*.45,s>0?1.6:.65,.1],.065,0xe7b384);sphere(luffy,[s*.2,.17,.16],[.13,.08,.22],0x77523d);}
 finishAssembly(ship);ship.traverse(o=>{if(o.isMesh)o.castShadow=false;});return ship;
}
