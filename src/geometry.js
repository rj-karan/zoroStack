import * as T from '../assets/vendor/three.module.min.js';
import {mergeGeometries} from '../assets/vendor/utils/BufferGeometryUtils.js';

export const C={cream:0xfff3d4,white:0xf2fff9,navy:0x203b5b,blue:0x167ce0,cyan:0x19bde6,mint:0x25c7a9,green:0x75bf37,pink:0xef739b,coral:0xf34e58,yellow:0xffc72e,gold:0xeea624,purple:0x8b47bc,orange:0xf28c35};
export const materials={
 enamel:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.38,metalness:.08}),
 metal:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.32,metalness:.52}),
 earth:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.95}),
 foliage:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.86}),
 cloud:new T.MeshLambertMaterial({color:0xffffff,vertexColors:true}),
 glass:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.17,metalness:.04,transparent:true,opacity:.29,depthWrite:false})
};
materials.cloth=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.92});
export function paint(geometry,color){
 const c=new T.Color(color),p=geometry.attributes.position,colors=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const grain=.987+.013*Math.sin(p.getX(i)*17+p.getY(i)*13+p.getZ(i)*11);colors.set([c.r*grain,c.g*grain,c.b*grain],i*3);}
 geometry.setAttribute('color',new T.BufferAttribute(colors,3));return geometry;
}
export function add(parent,geometry,color=C.white,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],material=materials.enamel){
 if(color===0x172b4a||color===0x263d60)material=materials.cloth;
 const mesh=new T.Mesh(paint(geometry,color),material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.rotation.set(...rotation);mesh.castShadow=material!==materials.cloud&&material!==materials.glass;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function sphere(g,p,s,color,mat=materials.enamel,segments=24){return add(g,new T.SphereGeometry(1,segments,Math.floor(segments*.6)),color,p,s,[0,0,0],mat);}
export function cylinder(g,p,r,h,color,rBottom=r,segments=32,mat=materials.enamel){return add(g,new T.CylinderGeometry(r,rBottom,h,segments),color,p,[1,1,1],[0,0,0],mat);}
export function ring(g,p,r,t,color,axis='y',segments=48,mat=materials.enamel){return add(g,new T.TorusGeometry(r,t,6,segments),color,p,[1,1,1],axis==='y'?[Math.PI/2,0,0]:axis==='x'?[0,Math.PI/2,0]:[0,0,0],mat);}
export function rod(g,a,b,r,color,mat=materials.enamel,rTop=r){
 const start=new T.Vector3(...a),end=new T.Vector3(...b),d=end.clone().sub(start),geometry=color===0x172b4a||color===0x263d60?new T.CapsuleGeometry(r,Math.max(.01,d.length()-r*2),6,16):new T.CylinderGeometry(rTop,r,d.length(),10),m=add(g,geometry,color,start.clone().add(end).multiplyScalar(.5).toArray(),[1,1,1],[0,0,0],mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
}
export function tube(g,points,r,color,segments=40,mat=materials.enamel){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return {mesh:add(g,new T.TubeGeometry(curve,segments,r,8,false),color,[0,0,0],[1,1,1],[0,0,0],mat),curve};}
export function roundedBox(w,h,d,r=.08){
 const s=new T.Shape(),x=-w/2,y=-h/2,rr=Math.min(r,w/3,h/3,d/3);
 s.moveTo(x+rr,y);s.lineTo(x+w-rr,y);s.quadraticCurveTo(x+w,y,x+w,y+rr);s.lineTo(x+w,y+h-rr);s.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);s.lineTo(x+rr,y+h);s.quadraticCurveTo(x,y+h,x,y+h-rr);s.lineTo(x,y+rr);s.quadraticCurveTo(x,y,x+rr,y);
 const geometry=new T.ExtrudeGeometry(s,{depth:d-2*rr,bevelEnabled:true,bevelThickness:rr,bevelSize:rr*.6,bevelSegments:2,steps:1,curveSegments:3});geometry.translate(0,0,-d/2+rr);return geometry;
}
const textMaps=new Map(),textMaterials=new Map();
export function label(g,text,p,width,height,{background=null,color='#fff8e8',font='bold 84px Arial',rotation=[0,0,0],radius=0}={}){
 if(!text)return null;
 const key=JSON.stringify([text,background,color,font]);let map=textMaps.get(key);
 if(!map){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');if(background){ctx.fillStyle=background;ctx.beginPath();ctx.roundRect(0,0,1024,256,radius);ctx.fill();}ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';const metrics=ctx.measureText(text);ctx.translate(512,128);ctx.scale(900/metrics.width,175/Math.max(1,metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent));ctx.fillText(text,0,0);map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;textMaps.set(key,map);}
 if(!textMaterials.has(map))textMaterials.set(map,new T.MeshBasicMaterial({map,transparent:true,alphaTest:.15,depthWrite:false,toneMapped:false}));
 const mesh=new T.Mesh(new T.PlaneGeometry(width,height),textMaterials.get(map));mesh.position.set(...p);mesh.rotation.set(...rotation);g.add(mesh);return mesh;
}
export function mergeBone(group){
 group.updateMatrixWorld(true);const buckets=new Map(),meshes=[];
 for(const o of group.children){if(!o.isMesh||o.material.map||o.userData.noMerge)continue;o.updateMatrix();let parts=buckets.get(o.material);if(!parts){parts=[];buckets.set(o.material,parts);}const p=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();p.applyMatrix4(o.matrix);parts.push(p);meshes.push(o);}
 for(const [material,parts] of buckets){const geometry=mergeGeometries(parts);if(!geometry)throw Error('Incompatible model geometry');const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);parts.forEach(p=>p.dispose());}
 meshes.forEach(o=>{group.remove(o);o.geometry.dispose();});
}
export async function batchWorld(world){
 const buckets=new Map(),sources=[];world.updateMatrixWorld(true);const centre=new T.Vector3();
 world.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||o.material.map||Array.isArray(o.material))return;
  for(let parent=o;parent;parent=parent.parent)if(parent.userData.dynamic)return;
  o.geometry.computeBoundingBox();o.geometry.boundingBox.getCenter(centre).applyMatrix4(o.matrixWorld);
  const key=[o.material.uuid,Math.floor(centre.x/27),Math.floor(centre.z/27),centre.y>35?'upper':'lower'].join(':');
  if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
 });
 let index=0;
 for(const meshes of buckets.values()){
  if(index++%5===0)await new Promise(r=>setTimeout(r,0));
  const parts=meshes.map(o=>{const p=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();p.applyMatrix4(o.matrixWorld);return p;});
  const geometry=mergeGeometries(parts);if(!geometry)throw Error('World batch incompatible');const mesh=new T.Mesh(geometry,meshes[0].material);mesh.name='Egghead-finished-geometry-'+index;mesh.castShadow=meshes[0].castShadow;mesh.receiveShadow=true;world.add(mesh);parts.forEach(p=>p.dispose());sources.push(...meshes);
 }
 sources.forEach(o=>{o.parent.remove(o);o.geometry.dispose();});return {batches:buckets.size,combinedMeshes:sources.length};
}
