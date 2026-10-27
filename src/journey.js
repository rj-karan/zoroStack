import * as T from '../assets/vendor/three.module.min.js';
export const TOUR_SECONDS=180;
import {exhibitStops} from './exhibit-route.js?v=13';
export const destinations=[{at:0,kicker:'EGGHEAD / FUTURE ISLAND',heading:'KARAN RJ',description:'A portfolio inside the world.',name:'Island overview',cta:'Meet Karan',next:.08},...exhibitStops.map((s,i)=>({at:s.at,kicker:s.zone,heading:s.title,description:s.zone,name:s.title,cta:'Next exhibit',next:exhibitStops[i+1]?.at??0}))];
// The ship crosses the enlarged Fabriophase before the camera visits each
// separate portfolio district at human scale.
export const shots=[
 [0,[200,105,280],[0,48,0],48],
 [.04,[191,142,270],[45,78,80],48],
 [.09,[155,130,230],[30,80,100],48],
 [.15,[36,145,228],[0,75,80],47],
 [.22,[-98,115,211],[-45,65,68],47],
 [.29,[-174,62,139],[-138,24,79],47],
 [.325,[-177,18,108],[-150,-8,65],48],
 [.35,[-158,15,88],[-123,5,46],45]
];
for(const stop of exhibitStops.slice(1)){
 const [x,y,z]=stop.position,upper=y>100;
 if(stop.id==='reports')shots.push([.855,[93,110,30],[55,87,0],48]);
 if(upper)shots.push([stop.at,[x+17,y+23,z+39],[x,y+7,z],47]);
 else shots.push([stop.at,[x+17,y+10,z+34],[x,y+3,z],47]);
}
const up=new T.Vector3(0,1,0),matrix=new T.Matrix4(),euler=new T.Euler(0,0,0,'YXZ');
const keys=shots.map(([at,p,target,fov])=>{const position=new T.Vector3(...p),focus=new T.Vector3(...target),q=new T.Quaternion().setFromRotationMatrix(matrix.lookAt(position,focus,up));euler.setFromQuaternion(q,'YXZ');return {at,values:[...p,euler.y,euler.x,position.distanceTo(focus),fov]};});
// Unwrap heading across +/- pi before interpolation. Keep roll exactly zero.
for(let i=1;i<keys.length;i++){while(keys[i].values[3]-keys[i-1].values[3]>Math.PI)keys[i].values[3]-=2*Math.PI;while(keys[i].values[3]-keys[i-1].values[3]<-Math.PI)keys[i].values[3]+=2*Math.PI;}
const slopes=keys.map((k,i)=>k.values.map((v,j)=>{if(i===0||i===keys.length-1)return 0;const before=keys[i-1],after=keys[i+1],a=(v-before.values[j])/(k.at-before.at),b=(after.values[j]-v)/(after.at-k.at);return a*b<=0?0:2*a*b/(a+b);}));
function interpolate(value){const p=T.MathUtils.clamp(value,0,1);let i=0;while(i<keys.length-2&&p>keys[i+1].at)i++;const a=keys[i],b=keys[i+1],span=b.at-a.at,t=(p-a.at)/span,t2=t*t,t3=t2*t;return a.values.map((v,j)=>(2*t3-3*t2+1)*v+(t3-2*t2+t)*span*slopes[i][j]+(-2*t3+3*t2)*b.values[j]+(t3-t2)*span*slopes[i+1][j]);}
export function chapterIndex(value){let index=0;for(let i=1;i<destinations.length;i++)if(value>=(destinations[i-1].at+destinations[i].at)/2)index=i;return index;}
export function routeParameter(value){return T.MathUtils.clamp(value,0,1);}
export function cameraPose(value){
 const [x,y,z,yaw,pitch,distance,fov]=interpolate(value),position=new T.Vector3(x,y,z),quaternion=new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,0,'YXZ'));
 const target=new T.Vector3(0,0,-Math.max(4,distance)).applyQuaternion(quaternion).add(position);return {position,target,quaternion,fov};
}
export function updateCamera(camera,value,{yaw=0,pitch=0,portrait=false}={}){
 const pose=cameraPose(value);camera.position.copy(pose.position);if(portrait)camera.position.sub(pose.target).multiplyScalar(1.12).add(pose.target);
 camera.quaternion.copy(pose.quaternion);camera.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(up,yaw));camera.quaternion.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),pitch));
 const fov=pose.fov+(portrait?13:0);if(Math.abs(camera.fov-fov)>.001){camera.fov=fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld();return pose;
}
// Follow scroll distance with a short, frame-rate-independent response. There is
// deliberately no travel/turn speed ceiling: a fast gesture advances faster.
export function advanceJourney(current,target,velocity,elapsed){
 const dt=Math.max(0,Math.min(Number.isFinite(elapsed)?elapsed:0,.5));
 if(!dt)return {value:current,velocity};
 target=T.MathUtils.clamp(target,0,1);
 let value=T.MathUtils.lerp(current,target,-Math.expm1(-dt/.065));
 if(Math.abs(target-value)<.00004)value=target;
 return {value,velocity:(value-current)/dt};
}
