import './music.js?v=5';
import {createPortfolioWorld} from './portfolio.js?v=10';
import * as T from '../assets/vendor/three.module.min.js';
import {RoomEnvironment} from '../assets/vendor/environments/RoomEnvironment.js';
import {createEgghead,createOcean} from './world.js?v=10';
import {destinations,chapterIndex,TOUR_SECONDS,updateCamera,advanceJourney,cameraPose} from './journey.js?v=10';

const canvas=document.querySelector('#world'),loading=document.querySelector('#loading-copy'),enter=document.querySelector('#explore'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),query=new URLSearchParams(location.search);
let focusStop=null,focusBlend=0,focusWanted=false;
let renderer,nature,exhibits,environment,pmrem,raf=0,last=0,lastPaint=0,clock=0,current=0,target=0,velocity=0,touring=false,paused=reduced.matches,dirty=true,active=-1,lost=false,audit=false,yaw=0,pitch=0,drag=null,lastRatio=1,quality=1;
const records=[],errors=[],scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.2,1600);scene.fog=new T.Fog(0xb7e6f0,150,540);
const measure=()=>Math.max(1,document.querySelector('.journey').offsetHeight-innerHeight);
function setTarget(value){focusWanted=false;document.querySelector('#leave-exhibit').hidden=true;target=Math.max(0,Math.min(1,value));if(reduced.matches||paused||lost)current=target;if(paused||reduced.matches)velocity=0;if(lost)setUI();scrollTo({top:target*measure(),behavior:'instant'});yaw=pitch=0;wake();}
function wake(){dirty=true;if(!raf&&!document.hidden&&!lost&&renderer)raf=requestAnimationFrame(draw);}
function sync(){document.querySelector('#motion').setAttribute('aria-pressed',String(paused));document.querySelector('#motion').innerHTML=paused?'<span>▷</span> Play world':'<span>Ⅱ</span> Pause world';document.querySelector('#tour').setAttribute('aria-pressed',String(touring));}
function setUI(){
 const index=chapterIndex(current),distance=Math.min(...destinations.map(d=>Math.abs(d.at-current))),caption=1-T.MathUtils.smoothstep(distance,.014,.043);document.documentElement.style.setProperty('--caption-opacity',caption.toFixed(3));document.querySelector('#intro').style.pointerEvents=caption>.15?'auto':'none';
 if(index!==active){active=index;const d=destinations[index];document.querySelector('#eyebrow').textContent=d.kicker;document.querySelector('#heading').textContent=d.heading;document.querySelector('#description').textContent=d.description;enter.innerHTML=d.cta+' <span>↗</span>';document.querySelector('#location-index').textContent=String(index+1).padStart(2,'0');document.querySelector('#location-name').textContent=d.name;document.body.classList.toggle('at-home',index===0);document.body.classList.toggle('at-zoro',index===4||index===5);document.body.classList.toggle('is-action',Boolean(d.moment));document.querySelector('#replay').hidden=!d.moment;document.querySelector('#replay').textContent=d.moment||'Replay moment';document.querySelectorAll('[data-stop]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.stop)===d.at)));window.dispatchEvent(new CustomEvent('world:chapter',{detail:{index}}));}
 document.querySelector('#progress-label').textContent=String(Math.round(current*100)).padStart(2,'0');document.querySelector('#progress-bar').style.width=current*100+'%';canvas.dataset.progress=current.toFixed(4);
}
function applyExhibitFocus(){
 if(!focusStop||focusBlend<.001)return;
 const [x,y,z]=focusStop.position,look=new T.Vector3(x,y+4.1*.48,z),p=new T.Vector3(x,y+4.5*.48,z+11.7*.48);
 if(innerWidth<700)p.sub(look).multiplyScalar(1.52).add(look);
 const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(p,look,new T.Vector3(0,1,0)));
 camera.position.lerp(p,focusBlend);camera.quaternion.slerp(q,focusBlend);camera.fov=T.MathUtils.lerp(camera.fov,innerWidth<700?59:46,focusBlend);camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
addEventListener('exhibit:focus',e=>{focusStop=e.detail;focusWanted=true;touring=false;document.querySelector('#leave-exhibit').hidden=false;sync();wake();});
document.querySelector('#leave-exhibit').onclick=()=>{focusWanted=false;document.querySelector('#leave-exhibit').hidden=true;wake();};
addEventListener('keydown',e=>{if(e.key==='Escape'){focusWanted=false;document.querySelector('#leave-exhibit').hidden=true;wake();}});
function resize(){if(!renderer)return;const budget=innerWidth<700?900000:2000000;quality=Math.min(quality,Math.min(devicePixelRatio,1.5,Math.sqrt(budget/(innerWidth*innerHeight))));renderer.setPixelRatio(quality);lastRatio=quality;renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?53:44;camera.updateProjectionMatrix();wake();}
function draw(stamp){
 try{
 raf=0;if(lost||document.hidden||!renderer)return;
 const fps=canvas.dataset.tier==='low'||innerWidth<700?30:60;if(stamp-lastPaint<1000/fps-.01){raf=requestAnimationFrame(draw);return;}
 const elapsed=last?Math.max(0,(stamp-last)/1000):1/60,dt=Math.min(elapsed,.05);last=stamp;
 if(touring&&!paused&&!audit){target=Math.min(1,target+dt/TOUR_SECONDS);if(target===1){touring=false;sync();}scrollTo({top:target*measure(),behavior:'instant'});}
 const focusing=Math.abs(focusBlend-(focusWanted?1:0))>.001;const moving=(!paused&&Math.abs(target-current)>.00008)||focusing;if(!audit&&!paused){const next=advanceJourney(current,target,velocity,elapsed);current=reduced.matches?target:next.value;velocity=reduced.matches?0:next.velocity;}
 if(!paused&&!audit)clock+=dt;
 if(dirty||moving||!paused){
  focusBlend=T.MathUtils.lerp(focusBlend,focusWanted?1:0,1-Math.exp(-elapsed*8));
  const ratio=moving?Math.min(quality,1):quality;if(Math.abs(ratio-lastRatio)>.01){renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);lastRatio=ratio;}
  updateCamera(camera,current,{yaw,pitch,portrait:innerWidth<700});applyExhibitFocus();nature?.update(clock,current);exhibits?.update(current);ocean?.update(clock);setUI();
  const start=performance.now();renderer.render(scene,camera);const cost=performance.now()-start;lastPaint=stamp;canvas.dataset.triangles=renderer.info.render.triangles;canvas.dataset.drawCalls=renderer.info.render.calls;
  if(query.has('debug')||query.has('studio')){records.push({stamp,cost,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,ratio:lastRatio});if(records.length>300)records.shift();}
  if(cost>32&&!audit){slow++;if(slow>=30){quality=Math.max(.45,quality*.85);canvas.dataset.tier='low';slow=0;resize();}}else slow=Math.max(0,slow-1);
  dirty=false;
 }
 if(!paused||moving||touring)raf=requestAnimationFrame(draw);
 }catch(error){lost=true;raf=0;canvas.dataset.state="fallback";document.body.classList.add("fallback");console.info("Still island retained:",error.message);}
}
let ocean,slow=0;
async function start(){
 try{
  renderer=new T.WebGLRenderer({canvas,antialias:innerWidth>=900,powerPreference:'default'});
  const gl=renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info'),name=extension?String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)):'';const software=/swiftshader|llvmpipe|software/i.test(name),low=software||innerWidth<700||(navigator.deviceMemory||4)<4;
  canvas.dataset.renderer=name;canvas.dataset.tier=low?'low':'high';quality=software||(navigator.deviceMemory||4)<4?1:1.5;renderer.setPixelRatio(quality);renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  scene.add(new T.HemisphereLight(0xc8f3ff,0x6c88ac,1.25));const sun=new T.DirectionalLight(0xfff2db,2.5);sun.position.set(-45,95,65);sun.castShadow=true;sun.shadow.mapSize.setScalar(low?512:1536);Object.assign(sun.shadow.camera,{left:-57,right:57,top:60,bottom:-50,near:1,far:220});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0003;sun.shadow.normalBias=.06;scene.add(sun);
  environment=new RoomEnvironment();pmrem=new T.PMREMGenerator(renderer);const room=pmrem.fromScene(environment,.04,.1,100,{size:low?64:128});scene.environment=room.texture;scene.environmentIntensity=.32;environment.dispose();
  const sky=new T.Mesh(new T.SphereGeometry(1100,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color(0x219cE9)},bottom:{value:new T.Color(0xb4e9f8)}},vertexShader:'varying vec3 skyPosition;void main(){skyPosition=position;gl_Position=projectionMatrix*viewMatrix*vec4(position+cameraPosition,1.);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 skyPosition;void main(){float h=clamp(.65+normalize(skyPosition).y*1.1,.15,1.);gl_FragColor=vec4(mix(bottom,top,h),1.);\n\n#include <colorspace_fragment>\n}'}));sky.name='Sky';scene.add(sky);
  ocean=createOcean(scene);
  resize();renderer.render(scene,camera);nature=await createEgghead(scene,{low,onProgress:message=>loading.textContent=message});
  exhibits=await createPortfolioWorld(nature.world,{camera,canvas,wake,travel:setTarget});
  if(nature.authoring)nature.authoring.add(exhibits.root.clone(true));
  loading.textContent='Finishing the light…';updateCamera(camera,current,{portrait:innerWidth<700});nature.update(0,0);renderer.shadowMap.needsUpdate=true;await renderer.compileAsync(scene,camera);renderer.render(scene,camera);
  canvas.dataset.state='ready';document.body.classList.add('is-ready');enter.disabled=false;loading.textContent='The island is ready.';
  if(query.has('debug')||query.has('studio'))window.__egghead={
   ready:true,focus:(id)=>{const s=exhibits.diagnostics().stations.find(s=>s.id===id);window.dispatchEvent(new CustomEvent('exhibit:focus',{detail:s}));},exhibits:()=>exhibits.diagnostics(),counts:nature.counts,frames:()=>records.slice(),motion:()=>({current,target,velocity,paused,audit,lost,raf,focusBlend,focusWanted,hidden:document.hidden}),replayMoment(){nature.replay(clock,current);},camera:()=>({position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),progress:current}),
   capture(value,time=4){audit=true;paused=true;touring=false;focusWanted=false;focusBlend=0;target=current=Math.max(0,Math.min(1,value));scrollTo({top:target*measure(),behavior:'instant'});velocity=0;clock=time;yaw=pitch=0;cancelAnimationFrame(raf);raf=0;updateCamera(camera,current,{portrait:innerWidth<700});applyExhibitFocus();nature.update(time,current);exhibits?.update(current);ocean.update(time);setUI();renderer.render(scene,camera);return {progress:current,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,memory:{...renderer.info.memory,programs:renderer.info.programs.length},camera:this.camera(),counts:nature.counts,...nature.diagnostics()};},
   resume(){audit=false;paused=false;sync();wake();},
   loseContext(){const ext=renderer.getContext().getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();setTimeout(()=>ext.restoreContext(),350);return true;},
   async exportGLB(){
    if(!nature.authoring)throw Error('Open with ?studio=1 for editable world export');
    const {GLTFExporter}=await import('../assets/vendor/exporters/GLTFExporter.js');const root=nature.authoring;
    const routeCamera=new T.PerspectiveCamera(44,1.777,.2,1600);routeCamera.name='RJ_Island_Journey';root.add(routeCamera);const times=[],positions=[],rotations=[];
    for(let i=0;i<=360;i++){const p=cameraPose(i/360);times.push(i/360*TOUR_SECONDS);routeCamera.position.copy(p.position);routeCamera.quaternion.copy(p.quaternion);positions.push(...routeCamera.position.toArray());rotations.push(...routeCamera.quaternion.toArray());}
    const opening=cameraPose(0);routeCamera.position.copy(opening.position);routeCamera.quaternion.copy(opening.quaternion);
    const journey=new T.AnimationClip('Egghead_Journey',TOUR_SECONDS,[new T.VectorKeyframeTrack('RJ_Island_Journey.position',times,positions),new T.QuaternionKeyframeTrack('RJ_Island_Journey.quaternion',times,rotations)]);
    const light=new T.DirectionalLight(0xfff2db,2.5);light.name='Egghead_Sun';light.position.set(-45,95,65);light.lookAt(0,0,0);root.add(light);
    const buffer=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true,animations:[journey],maxTextureSize:1024});root.remove(routeCamera,light);const a=document.createElement('a'),url=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));a.href=url;a.download='egghead-world.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return {bytes:buffer.byteLength};
   }
  };
  last=0;wake();
 }catch(error){cancelAnimationFrame(raf);raf=0;lost=true;nature?.dispose();renderer?.dispose();errors.push(error.stack);console.error(error);canvas.dataset.state='fallback';document.body.classList.add('fallback','is-ready');loading.textContent='The still island is ready.';enter.disabled=false;enter.textContent='Explore the destinations';}
}
document.querySelectorAll('[data-travel]').forEach(a=>a.onclick=e=>{e.preventDefault();touring=false;audit=false;sync();setTarget(Number(a.dataset.travel));});
document.querySelector('#chapter-rail').innerHTML=destinations.map((d,i)=>`<button data-stop="${d.at}" aria-label="Chapter ${i+1}: ${d.name}" title="${d.name}"><span>${String(i+1).padStart(2,'0')}</span><i></i></button>`).join('');
document.querySelectorAll('[data-stop]').forEach(button=>button.onclick=()=>{touring=false;sync();setTarget(Number(button.dataset.stop));});enter.onclick=()=>setTarget(destinations[active].next);
document.querySelector('.brand').onclick=e=>{e.preventDefault();touring=false;sync();setTarget(0);};document.querySelector('#reset').onclick=()=>{touring=false;sync();setTarget(0);};
document.querySelector('#replay').onclick=()=>{nature?.replay(clock,current);paused=reduced.matches;audit=false;sync();wake();};
document.querySelector('#motion').onclick=()=>{paused=!paused;audit=false;if(paused){velocity=0;target=current;scrollTo({top:current*measure(),behavior:'instant'});}sync();wake();};document.querySelector('#tour').onclick=()=>{touring=!touring;paused=false;audit=false;sync();wake();};
addEventListener('wheel',()=>{focusWanted=false;document.querySelector('#leave-exhibit').hidden=true;if(touring){touring=false;sync();}},{passive:true});
addEventListener('touchstart',e=>{if(touring&&!e.target.closest('button,a')){touring=false;sync();}},{passive:true});
addEventListener('scroll',()=>{if(!audit){target=Math.min(1,Math.max(0,scrollY/measure()));if(reduced.matches||paused||lost)current=target;if(paused||reduced.matches)velocity=0;if(lost)setUI();wake();}},{passive:true});addEventListener('resize',resize);
addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&!e.target.closest('.story-panel,button,a,dialog,header,footer'))drag={x:e.clientX,y:e.clientY,yaw,pitch};});
addEventListener('pointermove',e=>{if(!drag)return;yaw=T.MathUtils.clamp(drag.yaw+(drag.x-e.clientX)*.003,-.45,.45);pitch=T.MathUtils.clamp(drag.pitch+(drag.y-e.clientY)*.002,-.15,.18);wake();});addEventListener('pointerup',()=>drag=null);addEventListener('pointercancel',()=>drag=null);
const about=document.querySelector('#about');document.querySelector('#info-button').onclick=()=>about.showModal();document.querySelector('#close-about').onclick=()=>about.close();about.onclick=e=>{if(e.target===about)about.close();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();});reduced.addEventListener('change',()=>{paused=reduced.matches;touring=false;sync();wake();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;canvas.dataset.state='recovering';document.body.classList.add('fallback');});
canvas.addEventListener('webglcontextrestored',()=>{try{pmrem?.dispose();scene.environment?.dispose();const room=new RoomEnvironment();pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.04,.1,100,{size:canvas.dataset.tier==='low'?64:128}).texture;room.dispose();lost=false;last=0;renderer.shadowMap.needsUpdate=true;canvas.dataset.state='ready';document.body.classList.remove('fallback');wake();}catch(error){canvas.dataset.state='fallback';document.body.classList.add('fallback');console.info('Still island retained:',error.message);}});
addEventListener('pagehide',e=>{cancelAnimationFrame(raf);if(!e.persisted){nature?.dispose();pmrem?.dispose();scene.environment?.dispose();renderer?.dispose();}});addEventListener('pageshow',e=>{if(e.persisted){last=0;wake();}});
sync();start();
