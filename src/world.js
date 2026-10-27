import * as T from '../assets/vendor/three.module.min.js';
import {mergeGeometries} from '../assets/vendor/utils/BufferGeometryUtils.js';
import {C,materials,paint,add,sphere,cylinder,ring,rod,tube,roundedBox,label,batchWorld} from './geometry.js?v=4';
import {createZoro} from './zoro.js?v=5';
import {createAdventure} from './adventure.js?v=14';
import {createMegaFabriophase,ISLAND_RADII} from './megaworld.js?v=14';
import {createSeaFleet} from './fleet.js?v=13';
import {createEggheadMachines} from './creatures.js?v=14';


const tick=()=>new Promise(r=>setTimeout(r,0));
export async function createEgghead(scene,{low=false,onProgress=()=>{}}={}){
 const world=new T.Group();world.name='EGGHEAD_FUTURE_ISLAND';scene.add(world);
 let seed=6648;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const moving=[],clock={value:0};
 function cloudPuff(parent,position,scale,color,segments=24){
  const shape=new T.SphereGeometry(1,segments,Math.round(segments*.65)),v=shape.attributes.position;
  for(let i=0;i<v.count;i++){
   const x=v.getX(i),y=v.getY(i),z=v.getZ(i);
   const ripple=.065*Math.sin(x*13+y*8+z*4)+.038*Math.cos(z*17-x*7+y*5);
   v.setXYZ(i,x*(1+ripple),y*(1+ripple*.7),z*(1+ripple));
  }
  shape.computeVertexNormals();
  const mesh=add(parent,shape,color,position,scale,[0,0,0],materials.cloud),c=mesh.geometry.attributes.color;
  for(let i=0;i<c.count;i++){
   const shade=.91+.09*T.MathUtils.smoothstep(v.getY(i),-.8,.8);
   c.setXYZ(i,c.getX(i)*shade,c.getY(i)*shade,c.getZ(i)*shade);
  }
  c.needsUpdate=true;return mesh;
 }
 onProgress('Shaping the coastline…');
 // A solid sculpted island: sand shoulder, weathered cliff and a green crown.
 const vertices=[],indices=[],colours=[],uvs=[],levels=[[-23,.68,0x343f3d],[-20,.86,0x474b42],[-13,.98,0x746958],[-5,1.02,0x5b5947],[.4,1.0,0x356541],[1.7,.91,0x46783a]];
 for(let j=0;j<levels.length;j++)for(let i=0;i<=128;i++){
  const a=i/128*Math.PI*2,[y,r,color]=levels[j],noise=1+.055*Math.sin(a*5)+.038*Math.cos(a*11)+.024*Math.sin(a*19),c=new T.Color(color);
  vertices.push(Math.cos(a)*ISLAND_RADII.x*r*noise,y+Math.sin(a*5)*.12,Math.sin(a)*ISLAND_RADII.z*r*noise);colours.push(c.r,c.g,c.b);uvs.push(i/128,j/(levels.length-1));
  if(j<levels.length-1&&i<128){const k=j*129+i;indices.push(k,k+129,k+1,k+1,k+129,k+130);}
 }
 const cliff=new T.BufferGeometry();cliff.setAttribute('position',new T.Float32BufferAttribute(vertices,3));cliff.setAttribute('color',new T.Float32BufferAttribute(colours,3));cliff.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));cliff.setIndex(indices);cliff.computeVertexNormals();const cliffMesh=new T.Mesh(cliff,materials.earth);cliffMesh.receiveShadow=true;world.add(cliffMesh);
 // Dark vertical joints and hanging moss break up the coast's large stone faces.
 const seamPoints=[];
 for(let i=0;i<78;i++){
  const a=(i+.23*Math.sin(i*2.7))/78*Math.PI*2,n=1+.055*Math.sin(a*5)+.038*Math.cos(a*11)+.024*Math.sin(a*19);
  for(const [r1,y1,r2,y2] of [[.97,-16,1.02,-8],[1.02,-8,1.0,.25]]){
   seamPoints.push(Math.cos(a)*ISLAND_RADII.x*r1*n,y1,Math.sin(a)*ISLAND_RADII.z*r1*n,Math.cos(a)*ISLAND_RADII.x*r2*n,y2,Math.sin(a)*ISLAND_RADII.z*r2*n);
  }
  if(i%3===0){const x=Math.cos(a)*ISLAND_RADII.x*n,z=Math.sin(a)*ISLAND_RADII.z*n;
   tube(world,[[x*.99,1.5,z*.99],[x,0,z],[x*1.006,-3.8,z*1.006]],.045,i%2?0x2a653d:0x467c46,10,materials.foliage);
  }
 }
 const seamGeometry=new T.BufferGeometry();seamGeometry.setAttribute('position',new T.Float32BufferAttribute(seamPoints,3));world.add(new T.LineSegments(seamGeometry,new T.LineBasicMaterial({color:0x353b37,transparent:true,opacity:.6})));
 // A terrain fan meets the cliff's exact noisy upper rim. A cylinder here
 // produced a conspicuous flat green disk hovering over the stone coast.
 const crownPositions=[],crownColours=[],crownUV=[],crownIndices=[],shoreNoise=a=>1+.055*Math.sin(a*5)+.038*Math.cos(a*11)+.024*Math.sin(a*19);
 for(let k=0;k<=8;k++)for(let i=0;i<=128;i++){
  const a=i/128*Math.PI*2,t=k/8,n=shoreNoise(a),r=.91*t;
  crownPositions.push(Math.cos(a)*ISLAND_RADII.x*r*n,1.48+.22*t+.12*Math.sin(a*5)*t,Math.sin(a)*ISLAND_RADII.z*r*n);
  crownUV.push(.5+Math.cos(a)*r*n/2,.5+Math.sin(a)*r*n/2);
  const c=new T.Color().setHex(k>6?0x3e733e:k>3?0x508441:0x5d8d46);c.multiplyScalar(.92+.08*Math.sin(a*7+k));crownColours.push(c.r,c.g,c.b);
  if(k<8&&i<128){const j=k*129+i;crownIndices.push(j,j+1,j+129,j+1,j+130,j+129);}
 }
 const crownGeometry=new T.BufferGeometry();crownGeometry.setAttribute('position',new T.Float32BufferAttribute(crownPositions,3));crownGeometry.setAttribute('color',new T.Float32BufferAttribute(crownColours,3));crownGeometry.setAttribute('uv',new T.Float32BufferAttribute(crownUV,2));crownGeometry.setIndex(crownIndices);crownGeometry.computeVertexNormals();
 const crown=new T.Mesh(crownGeometry,materials.earth);crown.name='Organic_Fabriophase_Crown';crown.receiveShadow=true;world.add(crown);
 const mega=createMegaFabriophase(world,{low});
 // Fine enamel promenades, not flat dirt. Inlaid stripes follow the curve.
 function road(points,width,color){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),v=[],uv=[],ix=[];
  for(let i=0;i<=80;i++){const p=curve.getPoint(i/80),d=curve.getTangent(i/80),n=new T.Vector3(-d.z,0,d.x).normalize();for(const side of [-1,1]){const q=p.clone().addScaledVector(n,side*width/2);v.push(q.x,q.y,q.z);uv.push(i/80,side<0?0:1);}if(i<80){const k=i*2;ix.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();add(world,g,color);return curve;
 }
 const avenue=[[0,1.93,34],[7,1.93,25],[0,1.93,11],[-2,1.93,-5],[5,1.93,-25]];
 const route=road(avenue,7.4,C.cream);
 for(const side of [-1,1]){const edge=route.getSpacedPoints(60).map((p,i)=>{const tangent=route.getTangentAt(i/60);return p.addScaledVector(new T.Vector3(-tangent.z,0,tangent.x),side*3.45).add(new T.Vector3(0,.025,0)).toArray();});tube(world,edge,.045,C.mint,80);}
 road([[-35,1.88,-4],[-23,1.88,5],[-6,1.88,9],[16,1.88,7],[35,1.88,-7]],5.5,0xceeee5);
 for(let i=0;i<14;i++){const p=route.getPointAt((i+.4)/14),d=route.getTangentAt((i+.4)/14);add(world,roundedBox(.11,.025,.8,.01),C.yellow,[p.x,1.97,p.z],[1,1,1],[0,Math.atan2(d.x,d.z),0]);}
 const plaza=new T.Group();plaza.name='Zoro_Promenade';plaza.position.set(9,1.9,24);world.add(plaza);
 cylinder(plaza,[0,.12,0],3.2,.22,C.white,3.35,64);ring(plaza,[0,.245,0],3.0,.045,C.blue);ring(plaza,[0,.25,0],2.75,.018,C.yellow);
 label(plaza,'SSG  /  03',[0,.26,1.9],2,.45,{color:'#357e9f',font:'bold 88px Arial',rotation:[-Math.PI/2,0,0]});
 const zoro=createZoro();zoro.root.position.set(9,2.08,24);zoro.root.rotation.y=-.12;world.add(zoro.root);
 await tick();onProgress('Building the future city…');
 function porthole(g,a,y,r,bodyRadius){const x=Math.sin(a)*bodyRadius,z=Math.cos(a)*bodyRadius;const hole=new T.Group();hole.position.set(x,y,z);hole.rotation.y=a;g.add(hole);ring(hole,[0,0,0],r,.09,C.cream,'z',24,materials.metal);sphere(hole,[0,0,-.025],[r*.88,r*.88,.045],0x42acbd,materials.metal,20);sphere(hole,[-r*.22,r*.24,.025],[r*.25,r*.34,.015],0xbef3e5,materials.enamel,12);}
 function saucer(x,z,r,h,color,variant=0){
  const g=new T.Group();g.name='Fabriophase_Pod_'+variant;g.position.set(x,1.7,z);world.add(g);
  const pole=h*.52; cylinder(g,[0,pole/2,0],r*.33,pole,C.cream,r*.42);for(let i=0;i<3;i++)ring(g,[0,pole*(.3+i*.2),0],r*.35,.06,color);
  sphere(g,[0,h*.68,0],[r,r*.70,r],color);cylinder(g,[0,h*.64,0],r*1.08,.3,C.cream,r*1.08,48);ring(g,[0,h*.66,0],r*1.09,.10,C.yellow);
  sphere(g,[0,h*.97,0],[r*.72,r*.3,r*.72],C.cream);cylinder(g,[0,h*1.025,0],r*.28,.24,color);
  for(let i=0;i<6;i++)porthole(g,i*Math.PI/3,h*.82,r*.135,r*.84);
  rod(g,[0,h*1.03,0],[0,h*1.23,0],.07,C.gold);sphere(g,[0,h*1.23,0],[.22,.22,.22],variant%2?C.pink:C.blue);
  const door=add(g,roundedBox(r*.54,r*.68,.2,r*.18),0x3e7284,[0,pole*.5,r*.34]);
  for(let i=0;i<5;i++)add(g,roundedBox(.05,r*.43,.025,.01),C.mint,[(i-2)*r*.08,pole*.5,r*.45]);
  return g;
 }
 const buildingPositions=[[-21,18,5,12,C.cyan],[-27,-2,4,16,C.pink],[-17,-13,5.3,14,C.yellow],[22,12,5.5,15,C.mint],[29,-7,4.5,18,C.cream],[10,-16,5.3,16,C.coral],[-30,-18,3.4,11,C.green],[24,-21,3.4,12,C.yellow],[-5,-25,4.5,15,C.cyan]];
 for(let i=0;i<buildingPositions.length;i++){saucer(...buildingPositions[i],i);if(i%3===0)await tick();}
 // The large purple central silhouette seen beneath the cloud platform.
 const pear=new T.Group();pear.name='PUNK_Power_Plant';pear.position.set(0,1.7,-12);world.add(pear);
 const profile=[[1.7,0],[2.2,2],[5.0,4],[6.2,7],[6.0,10],[5.2,13],[3.8,15],[1.8,16],[1.2,17]].map(p=>new T.Vector2(...p));
 add(pear,new T.LatheGeometry(profile,48),C.purple);cylinder(pear,[0,8,0],6.36,.6,0x5a4c93);label(pear,'P U N K',[0,8.05,6.40],8,1.0,{color:'#fff1b9',font:'500 80px Arial'});
 cylinder(pear,[0,18.4,0],.8,3,0x7d57a7);sphere(pear,[0,20,0],[1.1,.45,1.1],C.purple);
 for(let i=0;i<5;i++)porthole(pear,(i-2)*.45,4.3,.55,4.9);
 // White spiral tower and its three separated pink/yellow flight decks.
 const spiral=new T.Group();spiral.name='Orbital_Tower';spiral.position.set(28,1.7,4);world.add(spiral);
 cylinder(spiral,[0,10,0],1.7,20,C.cream,2.3,40);
 for(const [j,y] of [5.5,10.5,15.5].entries()){
  cylinder(spiral,[0,y,0],4.1,.3,j%2?C.pink:C.yellow,4.1,48);ring(spiral,[0,y+.08,0],4.15,.12,C.white);
  cylinder(spiral,[0,y+.7,0],2.2,1.1,C.cyan,2.2,40);ring(spiral,[0,y+1.3,0],2.25,.09,C.cream);
 }
 sphere(spiral,[0,20.2,0],[2.4,1.1,2.4],C.mint);rod(spiral,[0,21,0],[0,23,0],.10,C.gold);sphere(spiral,[0,23,0],[.6,.6,.6],C.pink);
 // Grounded rocket-shaped observatory at the city edge.
 const rocket=new T.Group();rocket.name='Colour_Observatory';rocket.position.set(-29,1.7,12);world.add(rocket);
 cylinder(rocket,[0,7,0],2.3,14,C.blue,3.0,40);sphere(rocket,[0,14,0],[2.3,3.8,2.3],C.cyan);
 for(const y of [2,4,10,12])ring(rocket,[0,y,0],2.6,.12,C.cream);cylinder(rocket,[0,6,0],3.8,.5,C.pink,3.8,48);ring(rocket,[0,6.3,0],3.85,.15,C.yellow);
 for(let i=0;i<4;i++)porthole(rocket,Math.PI/4+i*Math.PI/2,11,.6,2.4);
 for(const a of [0,2.1,4.2]){const fin=new T.Group();fin.rotation.y=a;rocket.add(fin);add(fin,roundedBox(.25,4,2.8,.25),C.pink,[0,1.5,3],[1,1,1],[.25,0,0]);}
 // A busy but navigable skyline, with four distinct small building families.
 for(let i=0;i<32;i++){
  const a=i*2.39996,r=17+random()*17,x=Math.cos(a)*r,z=Math.sin(a)*r*.75;
  if(Math.abs(x)<10&&z>0||buildingPositions.some(b=>Math.hypot(b[0]-x,b[1]-z)<b[2]+2)||Math.hypot(x-9,z-24)<7||Math.hypot(x,z+12)<8)continue;
  const g=new T.Group();g.position.set(x,1.7,z);g.name='City_Residence_'+i;world.add(g);const h=3+random()*5.5,radius=1.25+random()*1.3,color=[C.coral,C.blue,C.yellow,C.mint,C.pink,C.purple][i%6];
  cylinder(g,[0,h/2,0],radius,h,C.cream,radius*1.05,24);sphere(g,[0,h,0],[radius,radius*.7,radius],color,materials.enamel,20);ring(g,[0,h*.65,0],radius*1.03,.08,color,'y',32);
  for(let j=0;j<4;j++)porthole(g,j*Math.PI/2,h*.65,.25,radius*1.02);
  if(i%3===0){rod(g,[0,h+radius*.6,0],[0,h+radius+1,0],.045,C.gold);sphere(g,[0,h+radius+1,0],[.16,.16,.16],color);}
 }
 // Star antenna, translucent greenhouse and the luminous VEGA sign.
 const star=new T.Group();star.name='Star_Antenna';star.position.set(-16,1.7,26);world.add(star);
 add(star,new T.ConeGeometry(.8,5,32),C.coral,[0,2.5,0]);ring(star,[0,3.7,0],1.9,.23,C.yellow);
 const starShape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.55:1.25;const p=[Math.cos(a)*r,Math.sin(a)*r];i?starShape.lineTo(...p):starShape.moveTo(...p);}starShape.closePath();const starGeo=new T.ExtrudeGeometry(starShape,{depth:.24,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:2,steps:1});add(star,starGeo,C.yellow,[0,5.9,-.12]);
 const garden=new T.Group();garden.name='Bubble_Garden';garden.position.set(21,1.7,24);world.add(garden);cylinder(garden,[0,.2,0],4.4,.35,C.cream,4.4,48);ring(garden,[0,.4,0],4.35,.16,C.yellow);
 add(garden,new T.SphereGeometry(4.2,40,24,0,Math.PI*2,0,Math.PI/2),C.mint,[0,.4,0],[1,1,1],[0,0,0],materials.glass);
 for(let i=0;i<7;i++){const a=i*2.4,r=1+random()*1.7;sphere(garden,[Math.cos(a)*r,.75,Math.sin(a)*r],[.6,.6,.6],i%2?C.pink:C.green,materials.foliage,16);}
 const sign=new T.Group();sign.name='VEGA_Illuminated_Sign';sign.position.set(-11,8.5,3);sign.rotation.y=.15;world.add(sign);ring(sign,[0,0,0],2.5,.18,C.yellow,'z',48);sphere(sign,[0,0,-.08],[2.45,2.45,.12],C.cyan);label(sign,'VEGA',[0,.25,.10],3.8,1.1,{color:'#effff2',font:'italic bold 100px Arial'});label(sign,'PUNK',[0,-.75,.10],2.9,.6,{color:'#effff2',font:'italic 80px Arial'});rod(world,[-11,1.7,3],[-11,6,3],.18,C.cream);
 await tick();onProgress('Connecting the island…');
 // Real transport tubes with structural collars and moving capsules.
 const tubes=[{points:[[-25,11,12],[-23,20,4],[-9,20,-2],[10,18,-2],[27,18,4]],color:C.pink}, {points:[[-21,9,18],[-12,13,23],[8,13,14],[19,12,3],[23,14,-15]],color:C.cyan}];
 for(const {points,color} of tubes){
  const {curve}=tube(world,points,.54,color,70,materials.glass);tube(world,points.map(p=>[p[0],p[1]-.48,p[2]]),.055,C.cream,70);
  for(let i=0;i<=18;i++){const t=i/18,p=curve.getPointAt(t),d=curve.getTangentAt(t),collar=ring(world,p.toArray(),.60,.06,C.cream,'z',20);collar.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d);}
  const pod=new T.Group();pod.userData.dynamic=true;pod.name='Transit_Capsule';world.add(pod);sphere(pod,[0,0,0],[.34,.34,.8],color);ring(pod,[0,0,0],.35,.04,C.white,'z',20);moving.push({group:pod,curve,speed:.035,phase:random()});
 }
 // Elevated support arches keep the routes visually grounded in the city.
 for(const [x,z,y] of [[-23,4,18],[-9,-2,18],[10,-2,16],[19,3,10]]){rod(world,[x,1.7,z],[x,y,z],.13,C.cream);ring(world,[x,y*.45,z],.29,.05,C.yellow);}
 const elevator=tube(world,[[1,22,-12],[-1,45,-13],[-7,68,-9],[-12,91,-3],[-10,108,0]],.13,C.gold,90).curve;
 for(const off of [-.3,.3])tube(world,[[1+off,22,-12],[-1+off,45,-13],[-7+off,68,-9],[-12+off,91,-3],[-10+off,108,0]],.055,C.cream,90);
 const lift=new T.Group();lift.name='Cloud_Elevator';lift.userData.dynamic=true;world.add(lift);sphere(lift,[0,0,0],[.65,.55,.65],C.white);ring(lift,[0,0,0],.72,.10,C.pink);moving.push({group:lift,curve:elevator,speed:.015,phase:.45});
 // Tighter architectural streets behind the large landmarks. These use slim,
 // bevelled tower silhouettes rather than repeating the spherical pod shape.
 const towers=[[-12,-24],[-20,-21],[-9,-14],[-8,-6],[16,-23],[19,-15],[34,-1],[-33,5],[16,2],[-12,13]];
 for(let i=0;i<towers.length;i++){
  const [x,z]=towers[i];if(buildingPositions.some(b=>Math.hypot(b[0]-x,b[1]-z)<b[2]+1.3))continue;
  const g=new T.Group();g.name='Detail_Tower_'+i;g.position.set(x,1.7,z);world.add(g);const h=7+i%4*1.5,colour=[C.blue,C.coral,C.mint,C.purple][i%4];
  add(g,roundedBox(2.3,h,2.3,.28),C.cream,[0,h/2,0]);
  for(let j=0;j<4;j++){add(g,roundedBox(2.38,.65,2.38,.14),colour,[0,2+j*(h-2)/4,0]);add(g,roundedBox(.9,.3,.08,.04),C.cyan,[0,2.9+j*(h-2)/4,1.2]);}
  sphere(g,[0,h,0],[1.35,.55,1.35],colour);rod(g,[0,h+.4,0],[0,h+1.8,0],.035,C.gold);sphere(g,[0,h+1.9,0],[.14,.14,.14],C.coral);
 }
 await tick();onProgress('Growing the tropical gardens…');
 // Shared, curved palm prototypes with individual tapered leaflets.
 const palmPositions=[];
 for(let i=0;i<(low?36:52);i++){
  const a=i*2.39996,r=21+random()*16,x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
  if(Math.hypot(x-9,z-24)<6||Math.abs(x)<4&&z>0||buildingPositions.some(b=>Math.hypot(b[0]-x,b[1]-z)<b[2]+1.5))continue;
  palmPositions.push([x,1.7,z]);
 }
 const prototype=new T.Group(),fronds=new T.Group();
 tube(prototype,[[0,0,0],[-.12,2,0],[.2,4,-.15],[.4,5.5,0]],.17,0xc69b61,16,materials.earth);
 for(let i=0;i<10;i++)ring(prototype,[i>6?.25:0,.35+i*.48,0],.177,.016,0x9f8459,'y',14,materials.earth);
 for(let f=0;f<10;f++){
  const angle=f*Math.PI/5,dir=new T.Vector3(Math.cos(angle),0,Math.sin(angle)),side=new T.Vector3(-dir.z,0,dir.x),p=[],uv=[],ix=[];
  for(let k=0;k<=10;k++){const t=k/10,center=new T.Vector3(.4,5.5,0).addScaledVector(dir,t*3.4);center.y+=Math.sin(t*Math.PI)*.75-t*t*.65;const w=Math.sin(t*Math.PI)*.42;
   for(const s of [-1,1]){const point=center.clone().addScaledVector(side,w*s);point.y-=w*.3;p.push(...point.toArray());uv.push(t,s<0?0:1);}if(k<10){const a=k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(p,3));leaf.setAttribute('uv',new T.Float32BufferAttribute(uv,2));leaf.setIndex(ix);leaf.computeVertexNormals();add(fronds,leaf,f%2?0x62b94e:0x8bc94a,[0,0,0],[1,1,1],[0,0,0],materials.foliage);
  for(let j=1;j<11;j++)for(const s of [-1,1]){
   const t=j/12,center=new T.Vector3(.4,5.5+Math.sin(t*Math.PI)*.75-t*t*.65,0).addScaledVector(dir,t*3.4),tip=center.clone().addScaledVector(dir,.28).addScaledVector(side,s*Math.sin(t*Math.PI)*.67);tip.y-=.12;
   const inner=center.clone().addScaledVector(dir,.13),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...center.toArray(),...tip.toArray(),...inner.toArray()],3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,1,1,0],2));geo.computeVertexNormals();add(fronds,geo,j%2?0x68b34c:0x92cc58,[0,0,0],[1,1,1],[0,0,0],materials.foliage);
  }
 }
 const assemble=g=>{g.updateMatrixWorld(true);const pieces=[];g.traverse(o=>{if(o.isMesh){const p=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();p.applyMatrix4(o.matrixWorld);pieces.push(p);}});const geo=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());g.traverse(o=>o.geometry?.dispose());return geo;};
 const palmBark=assemble(prototype),palmLeaves=assemble(fronds);materials.foliage.side=T.DoubleSide;materials.foliage.forceSinglePass=true;
 materials.foliage.onBeforeCompile=shader=>{shader.uniforms.islandClock=clock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float islandClock;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=smoothstep(4.,6.4,position.y)*.07*sin(islandClock*.7+position.z);');};
 const trunkBatch=new T.InstancedMesh(palmBark,materials.earth,palmPositions.length),leafBatch=new T.InstancedMesh(palmLeaves,materials.foliage,palmPositions.length),dummy=new T.Object3D();trunkBatch.name='Egghead_Palm_Trunks';leafBatch.name='Egghead_Palm_Fronds';
 palmPositions.forEach((p,i)=>{dummy.position.set(...p);dummy.rotation.y=random()*Math.PI*2;const s=.8+random()*.4;dummy.scale.setScalar(s);dummy.updateMatrix();trunkBatch.setMatrixAt(i,dummy.matrix);leafBatch.setMatrixAt(i,dummy.matrix);});world.add(trunkBatch,leafBatch);trunkBatch.receiveShadow=true;leafBatch.castShadow=false;
 // Colourful garden islands and small engineering details along the sidewalks.
 for(let i=0;i<50;i++){
  const a=i*2.4,r=10+random()*26,x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
  if(Math.abs(x)<6&&z>0||Math.hypot(x-9,z-24)<4)continue;
  cylinder(world,[x,1.9,z],.65,.35,C.cream,.8,20);sphere(world,[x,2.5,z],[.8,.7,.75],i%5?0x8cc654:C.pink,materials.foliage,16);
 }
 // Extended Fabriophase: a denser urban belt behind the original landmarks.
 const district=new T.Group();district.name='Expanded_Fabriophase_District';world.add(district);
 for(let i=0;i<34;i++){
  const a=Math.PI*(.96+i/33*1.08),r=38+(i%3)*3.6,x=Math.cos(a)*r,z=Math.sin(a)*r*.85;
  if(x>28&&z>-25)continue;
  const tower=new T.Group();tower.position.set(x,1.7,z);district.add(tower);
  const h=5+(i*7%13),colour=[C.mint,C.pink,C.yellow,C.blue,C.coral][i%5];
  add(tower,roundedBox(2.8,h,2.8,.3),colour,[0,h/2,0]);
  add(tower,roundedBox(3.15,.6,3.15,.15),C.cream,[0,h,0]);
  for(let floor=0;floor<Math.floor(h/1.4);floor++)for(const side of [-1,1])add(tower,roundedBox(.75,.38,.08,.03),floor%3===0?C.navy:C.cyan,[side*.7,1+floor*1.4,1.44]);
  if(i%3===0){sphere(tower,[0,h+.6,0],[1.5,.9,1.5],C.cream);rod(tower,[0,h+1.2,0],[0,h+3,0],.05,C.gold);sphere(tower,[0,h+3,0],[.17,.17,.17],C.pink);}
  else if(i%3===1){cylinder(tower,[0,h+.6,0],.7,.9,C.navy);ring(tower,[0,h+1,0],.7,.08,C.mint);}
 }
 road([[-48,1.9,17],[-48,1.9,-12],[-30,1.9,-34],[0,1.9,-40],[30,1.9,-32],[46,1.9,-12]],4,C.cream);
 for(const x of [-40,40])tube(world,[[x,2,-28],[x,5,-32],[x*.5,5,-38]],.35,C.cyan,32);
 // Floating retro-future research satellites around the lower skyline.
 for(const [i,x,y,z] of [[0,-23,30,-15],[1,22,34,-18]]){
  const g=new T.Group();g.name='Research_Satellite_'+i;g.position.set(x,y,z);world.add(g);cylinder(g,[0,0,0],3.3,.6,C.cream,3.3,40);ring(g,[0,.35,0],3.35,.14,i?C.mint:C.yellow);sphere(g,[0,-.6,0],[2.8,1.4,2.8],C.navy);
  add(g,new T.SphereGeometry(2.9,32,20,0,Math.PI*2,0,Math.PI/2),i?C.yellow:C.cyan,[0,.4,0]);for(let j=0;j<5;j++)porthole(g,j*Math.PI*2/5,1.2,.3,2.6);
  rod(g,[0,3,0],[0,4.2,0],.06,C.gold);sphere(g,[0,4.3,0],[.22,.22,.22],C.coral);
 }
 await tick();onProgress('Forming the island clouds…');
 // One giant cloud platform, with the reference's flat blue equatorial collar.
 const cloud=new T.Group();cloud.name='Island_Cloud_Labophase';world.add(cloud);
 cloud.scale.set(3.7,2.1,3.7);
 sphere(cloud,[0,45.4,-2],[29,3.4,21],0xe9f9fc,materials.cloud,40);
 for(let i=0;i<216;i++){
  const a=i*2.39996,r=Math.sqrt((i+.5)/216),x=Math.cos(a)*r*31,z=Math.sin(a)*r*23-2,y=46.5+Math.sin(i*1.7)*3.2;
  if(z>1&&x>-25&&x<25)continue; // clear the visitor terrace in front of Punk Records
  const size=3.2+random()*5.1;cloudPuff(cloud,[x,y,z],[size*1.35,size*.84,size],i%5===0?0xb7ddeb:i%3===0?0xdceff7:0xf8ffff,24);
 }
 for(let i=0;i<12;i++)cloudPuff(cloud,[Math.sin(i*1.1)*2.1,40-i*1.55,-2+Math.cos(i*.75)*1.6],[5-i*.24,2.3-i*.07,4.5-i*.19],i%3?0xe9f7fa:0xcce5ee,20);
 for(const y of [45.7,46.35]){const r=ring(world,[0,y*2.1,-4.2],35.3*3.7,.11*3.7,0x3484ec,'y',128);r.scale.z=.80;}
 label(world,'= 066 =',[0,46.15*2.1,26.5*3.7],20.3,3.0,{color:'#3275d4',background:'#f6ffff',font:'bold 85px Arial'});
 // Top island. The dome is a cracked eggshell, not a generic opaque sphere.
 const lab=new T.Group();lab.name='PUNK_RECORDS_LABOPHASE';lab.position.set(0,51*2.1,-4.2);lab.scale.setScalar(2.1);world.add(lab);
 cylinder(lab,[0,.2,0],22,.7,C.cream,22,80);ring(lab,[0,.55,0],21.8,.13,C.mint,'y',96);
 cylinder(lab,[0,3.4,0],12.5,5.6,C.navy,13.2,64);cylinder(lab,[0,1.9,0],13.6,.75,C.white,13.6,64);
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14,box=add(lab,roundedBox(1.6,1,.12,.08),C.cyan,[Math.sin(a)*12.65,4.3,Math.cos(a)*12.65]);box.rotation.y=a;}
 const shell=new T.BufferGeometry(),sv=[],su=[],sx=[],border=[],grid=[];const around=96,rings=32;
 for(let j=0;j<=rings;j++)for(let i=0;i<=around;i++){
  const phi=i/around*Math.PI*2,front=T.MathUtils.smoothstep(Math.cos(phi),-.15,.5),tooth=1-Math.abs((((phi/Math.PI*6)%2)+2)%2-1),minimum=front*(6.7+tooth*3),theta=j/rings*Math.acos(minimum/18),point=new T.Vector3(Math.sin(theta)*Math.sin(phi)*18,Math.cos(theta)*18,Math.sin(theta)*Math.cos(phi)*18);
  sv.push(...point.toArray());su.push(i/around,j/rings);if(j===rings)border.push(point.clone().add(new T.Vector3(0,1.1,0)));
  if(j<rings&&i<around){const k=j*(around+1)+i;sx.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}
 }
 shell.setAttribute('position',new T.Float32BufferAttribute(sv,3));shell.setAttribute('uv',new T.Float32BufferAttribute(su,2));shell.setIndex(sx);shell.setAttribute('normal',new T.Float32BufferAttribute(sv.map(v=>v/18),3));
 add(lab,shell,C.pink,[0,1.1,0]);const inner=shell.clone();add(lab,inner,0x7e5b91,[0,1.1,0],[.992,.992,.992],[0,0,0],new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.75,side:T.BackSide}));
 const borderCurve=new T.CatmullRomCurve3(border.slice(0,-1),true,'centripetal');add(lab,new T.TubeGeometry(borderCurve,192,.10,6,true),C.cream);
 for(let j=1;j<rings;j++)for(let i=0;i<around;i++){
  const k=j*(around+1)+i;if(j%4===0)grid.push(...sv.slice(k*3,k*3+3),...sv.slice((k+1)*3,(k+1)*3+3));if(i%8===0)grid.push(...sv.slice(k*3,k*3+3),...sv.slice((k+around+1)*3,(k+around+1)*3+3));
 }
 const gridGeo=new T.BufferGeometry();gridGeo.setAttribute('position',new T.Float32BufferAttribute(grid,3));const lines=new T.LineSegments(gridGeo,new T.LineBasicMaterial({color:0xc46a92,transparent:true,opacity:.32}));lines.position.y=1.1;lines.scale.setScalar(1.001);lab.add(lines);
 label(lab,'PUNK RECORDS',[0,6.2,13.0],18.6,2.1,{color:'#fff3e7',font:'italic 86px Georgia'});
 // Angular blue mechanical bracket crossing above the cracked shell.
 const bracket=[[-18,14,7],[-15,17,7],[-7,18,6],[-4,21,5],[5,21,2],[9,19,-1],[18,18,-4],[21,15,-5]];
 for(let i=0;i<bracket.length-1;i++){
  const a=new T.Vector3(...bracket[i]),b=new T.Vector3(...bracket[i+1]),dir=b.clone().sub(a),bar=add(lab,roundedBox(2.0,2.0,dir.length()+.6,.16),0x5eacca,a.clone().add(b).multiplyScalar(.5).toArray());bar.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),dir.normalize());
  for(let j=0;j<5;j++){
   const panel=add(lab,roundedBox(1.55,.8,.14,.04),j%2?0x77b9d3:0x4e96b8,[0,0,0]);
   panel.position.copy(a.clone().lerp(b,j/5));panel.position.z+=1.1;
   for(const side of [-1,1])add(lab,roundedBox(.12,.5,.2,.02),0x97d5e3,[panel.position.x+side*.6,panel.position.y,panel.position.z+.1]);
  }
 }
 for(const s of [-1,1]){sphere(lab,[s*18.8,8,-3],[3.7,3.7,3.7],0x756cae);ring(lab,[s*18.8,8,.4],3.1,.35,C.cream,'z',48);sphere(lab,[s*18.8,8,.7],[2.8,2.8,.45],C.cyan,materials.metal,32);ring(lab,[s*18.8,8,1.1],2.1,.18,C.pink,'z',40);}
 // Tiny upper palms establish the laboratory platform's scale.
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9,mini=new T.Group();mini.position.set(Math.sin(a)*16,.55,Math.cos(a)*16);lab.add(mini);rod(mini,[0,0,0],[.1,2.3,0],.09,0xc69b61);for(let j=0;j<7;j++){const angle=j*Math.PI*2/7,leaf=sphere(mini,[Math.sin(angle)*.7,2.35,Math.cos(angle)*.7],[.22,.12,1.0],C.green,materials.foliage,12);leaf.rotation.y=angle;}}
 await tick();onProgress('Polishing the architecture…');
 onProgress('Choreographing the Sunny and sword fight…');const adventure=await createAdventure(world,zoro,{low});adventure.update(0,0);
 onProgress('Positioning the naval blockade…');const fleet=createSeaFleet(world,{low});
 onProgress('Bringing Egghead’s machines to life…');const machines=createEggheadMachines(world,{low});machines.update(0);
 const authoring=new URLSearchParams(location.search).has('studio')?world.clone(true):null;
 const batched=await batchWorld(world);
 // Clouds in the distance are separate from the giant landmark cloud.
 const distant=new T.Group();distant.name='Distant_Sky_Clouds';scene.add(distant);
 for(let i=0;i<14;i++){
  const a=i*Math.PI*2/14,r=390+random()*165,x=Math.cos(a)*r,z=Math.sin(a)*r,y=120+random()*145;
  for(let j=0;j<5;j++)cloudPuff(distant,[x+j*10,y+Math.sin(j*1.7)*5,z+j*3],[18+random()*11,7+random()*7,11+random()*11],j%3?0xeaf9fe:0xcbeaf4,20);
 }
 await batchWorld(distant);
 return {world,authoring,zoro,replay:(time,progress)=>adventure.replay(time,progress),frameCamera:(camera,progress,options)=>adventure.frameCamera(camera,progress,options),diagnostics:()=>({...adventure.diagnostics(),...machines.diagnostics()}),counts:{palms:palmPositions.length,...mega,...fleet,...machines.counts,...batched},update(time,progress=0){clock.value=time;zoro.update(time);adventure.update(time,progress);machines.update(time);for(const {group,curve,speed,phase} of moving){const t=(time*speed+phase)%1;group.position.copy(curve.getPointAt(t));group.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),curve.getTangentAt(t));}},dispose(){const geometries=new Set(),mats=new Set(),maps=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[]))mats.add(m);});geometries.forEach(g=>g.dispose());mats.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)maps.add(v);m.dispose();});maps.forEach(t=>t.dispose());}};
}

export function createOcean(scene){
 const time={value:0},material=new T.ShaderMaterial({uniforms:{time},vertexShader:`varying vec3 vWorld;uniform float time;void main(){vec3 p=position;p.z+=.08*sin(p.x*.23+time*.7)*cos(p.y*.19-time*.5);vWorld=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,fragmentShader:`varying vec3 vWorld;uniform float time;void main(){vec2 p=vWorld.xz;float wave=sin(p.x*.57+sin(p.y*.3)+time*.6)*cos(p.y*.45-time*.4);float rip=pow(max(0.,sin(p.x*1.6+p.y*1.1+wave+time*.35)),18.);float island=length(p/vec2(${ISLAND_RADII.x}.,${ISLAND_RADII.z}.));vec3 colour=mix(vec3(.025,.30,.46),vec3(.07,.58,.57),exp(-max(0.,island-1.)*.8));float foam=1.-smoothstep(.015,.065,abs(island-(1.04+.006*sin(time+p.x*.4))));colour=mix(colour,vec3(.91,.99,.89),foam*.7);colour+=rip*.065;float haze=1.-exp(-length(vWorld-cameraPosition)*.0012);colour=mix(colour,vec3(.68,.87,.94),haze);gl_FragColor=vec4(colour,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 material.uniforms.skyTop={value:new T.Color(0x219ce9)};material.uniforms.skyBottom={value:new T.Color(0xb4e9f8)};material.toneMapped=false;
 material.fragmentShader=material.fragmentShader.replace('varying vec3 vWorld;','uniform vec3 skyTop;uniform vec3 skyBottom;varying vec3 vWorld;').replace('float haze=1.-exp(-length(vWorld-cameraPosition)*.0012);colour=mix(colour,vec3(.68,.87,.94),haze);','float haze=smoothstep(110.,420.,length(vWorld-cameraPosition));float skyHeight=clamp(.65+normalize(vWorld-cameraPosition).y*1.1,.15,1.);colour=mix(colour,mix(skyBottom,skyTop,skyHeight),haze);').replace('#include <tonemapping_fragment>','');
 const ocean=new T.Mesh(new T.PlaneGeometry(3000,3000,64,64),material);ocean.name='Single_Pass_Ocean';ocean.rotation.x=-Math.PI/2;ocean.position.y=-17.5;scene.add(ocean);return {update(t){time.value=t;}};
}
