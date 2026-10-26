import * as T from '../assets/vendor/three.module.min.js';
export const TOUR_SECONDS=125;
import {exhibitStops} from './exhibit-route.js';
export const destinations=[{at:0,kicker:'EGGHEAD / FUTURE ISLAND',heading:'KARAN RJ',description:'A portfolio inside the world.',name:'Island overview',cta:'Meet Karan',next:.08},...exhibitStops.map((s,i)=>({at:s.at,kicker:s.zone,heading:s.title,description:s.zone,name:s.title,cta:'Next exhibit',next:exhibitStops[i+1]?.at??0}))];
export const shots=[
 [0,[114,58,142],[24,33,31],48],
 [.03,[106,64,153],[50,48,72],47],
 [.065,[79,64,143],[50,47,75],47],
 [.10,[12,53,136],[3,42,65],47],
 [.12,[-23,53,132],[-40,32,74],47],
 [.145,[-57,34,111],[-60,25,67],46],
 [.18,[-83,22,84],[-58,11,44],45],
 [.22,[-56,11,60],[-47,5,33],46],
 [.30,[-18,10,45],[-20,6,20],48],
 [.37,[-32,11,30],[-24,7,1],48],
 [.44,[-9,10,35],[-10,6,8],48],
 [.51,[3,9,43],[5,5,22],48],
 [.545,[15,6.5,36],[10,4,24],44],
 [.58,[21,11,43],[20,7,15],48],
 [.65,[44,13,31],[30,8,2],48],
 [.72,[59,15,12],[42,9,-12],48],
 [.765,[55,34,35],[0,38,0],49],
 [.80,[36,62,41],[10,58,0],48],
 [.87,[16,62,47],[4,59,1],48],
 [.94,[-8,63,47],[-4,59,0],48],
 [1,[-38,64,43],[-7,58,-2],48]
];
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
