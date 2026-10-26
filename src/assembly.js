import * as T from '../assets/vendor/three.module.min.js';
import {mergeGeometries} from '../assets/vendor/utils/BufferGeometryUtils.js';

// A moving assembly can contain hundreds of crafted parts while using only a
// handful of draw calls. Articulated children are merged separately by bone.
export function finishAssembly(root){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),buckets=new Map(),remove=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.noMerge)return;let list=buckets.get(o.material);if(!list){list=[];buckets.set(o.material,list);}const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));list.push(g);remove.push(o);});
 for(const [material,parts] of buckets){const g=mergeGeometries(parts);if(!g)throw Error('Assembly attributes are incompatible');const mesh=new T.Mesh(g,material);mesh.receiveShadow=true;root.add(mesh);parts.forEach(p=>p.dispose());}
 remove.forEach(o=>{o.parent.remove(o);o.geometry.dispose();});return root;
}
export function microNormal(seed=17){
 const size=128,data=new Uint8Array(size*size*4);let n=seed;for(let i=0;i<size*size;i++){n=(n*1664525+1013904223)>>>0;const noise=(n/4294967296-.5)*30;data.set([128+noise,128+Math.sin(i%size*.8)*10+noise*.4,252,255],i*4);}const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.needsUpdate=true;return t;
}
export function softContact(){
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gradient=x.createRadialGradient(32,32,2,32,32,32);gradient.addColorStop(0,'rgba(20,42,59,.40)');gradient.addColorStop(.6,'rgba(20,42,59,.18)');gradient.addColorStop(1,'rgba(20,42,59,0)');x.fillStyle=gradient;x.fillRect(0,0,64,64);const map=new T.CanvasTexture(c);return new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
}
