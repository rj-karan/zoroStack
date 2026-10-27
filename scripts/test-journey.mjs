import test from 'node:test';import assert from 'node:assert/strict';
import {cameraPose,advanceJourney,destinations,TOUR_SECONDS,chapterIndex,shots} from '../src/journey.js';
test('camera positions and targets remain finite over the full route',()=>{for(let i=0;i<=1000;i++){const p=cameraPose(i/1000);assert.ok(p.position.toArray().every(Number.isFinite));assert.ok(p.target.toArray().every(Number.isFinite));assert.ok(p.position.distanceTo(p.target)>4);}});
test('fast scroll reversals retain bounded momentum and settle on the chosen chapter',()=>{let value=0,velocity=0;for(let i=0;i<15000;i++){const target=i<5000?1:i<10000?0:.49;const next=advanceJourney(value,target,velocity,1/60);value=next.value;velocity=next.velocity;assert.ok(value>=0&&value<=1);assert.ok(Number.isFinite(velocity));}assert.ok(Math.abs(value-.49)<.0001);});
test('camera velocity and heading are continuous through every authored shot',()=>{for(const [at] of shots.slice(1,-1)){const e=.000001,a=cameraPose(at-e),b=cameraPose(at),c=cameraPose(at+e);const before=b.position.clone().sub(a.position).multiplyScalar(1/e),after=c.position.clone().sub(b.position).multiplyScalar(1/e);assert.ok(before.distanceTo(after)<2,`position tangent at ${at}`);assert.ok(a.quaternion.angleTo(c.quaternion)<.001,`orientation at ${at}`);}});
test('phone and desktop camera placement have no threshold jumps',async()=>{const {PerspectiveCamera}=await import('../assets/vendor/three.module.min.js');const {updateCamera}=await import('../src/journey.js');for(const portrait of [false,true]){const camera=new PerspectiveCamera();let before;for(let i=0;i<=4000;i++){updateCamera(camera,i/4000,{portrait});if(before)assert.ok(before.distanceTo(camera.position)<3);before=camera.position.clone();assert.ok(Math.abs(camera.getWorldDirection(new (await import('../assets/vendor/three.module.min.js')).Vector3()).dot(camera.up))<.9);}}});
test('world views preserve distance from the exhibits',async()=>{const {exhibitStops}=await import('../src/exhibit-route.js');for(const s of exhibitStops){const p=cameraPose(s.at);assert.ok(p.position.distanceTo({x:s.position[0],y:s.position[1],z:s.position[2]})>14);}});
test('the voyage has an overview and twelve ordered portfolio exhibits',()=>{assert.equal(destinations.length,13);destinations.forEach((d,i)=>{assert.equal(chapterIndex(d.at),i);if(i)assert.ok(d.at>destinations[i-1].at);});});
test('fast gestures travel faster, without overshoot or a fixed speed ceiling',()=>{
 const slow=advanceJourney(.2,.21,0,1/60),fast=advanceJourney(.2,.8,0,1/60);
 assert.ok(fast.velocity>slow.velocity*50);
 assert.ok(fast.value>.2&&fast.value<.8);
 let value=.2;for(let i=0;i<18;i++)value=advanceJourney(value,.8,0,1/60).value;
 assert.ok(.8-value<.007,'settles within 300 ms');
 const reversed=advanceJourney(value,.1,fast.velocity,1/60);assert.ok(reversed.value<value&&reversed.value>.1);
});
test('scroll response is consistent at 30, 60 and 144 Hz and catches up after slow frames',()=>{
 const results=[30,60,144].map(fps=>{let v=0;for(let i=0;i<fps;i++)v=advanceJourney(v,1,0,1/fps).value;return v;});
 assert.ok(Math.max(...results)-Math.min(...results)<.0001);
 assert.ok(advanceJourney(0,1,0,.5).value>.999);
 assert.deepEqual(advanceJourney(.4,.9,0,0),{value:.4,velocity:0});
});
