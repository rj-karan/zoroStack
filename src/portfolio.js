import * as T from '../assets/vendor/three.module.min.js';
import {C,materials,add,sphere,cylinder,ring,rod,tube,roundedBox,label,batchWorld} from './geometry.js?v=4';
import {exhibitStops} from './exhibit-route.js?v=13';

export function safeUrl(value){
 try{const u=new URL(String(value||''),location.href);return value&&['https:','http:','mailto:'].includes(u.protocol)?u.href:null;}catch{return null;}
}
export async function loadContent(){
 const keys=['site','projects','reports','cves','articles','achievements'];
 const values=await Promise.all(keys.map(async key=>{const r=await fetch(`content/${key}.json`,{cache:'no-store'});if(!r.ok)throw Error(`Unable to load ${key}`);return r.json();}));
 const data=Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
 for(const key of keys.slice(1))data[key]=data[key].filter(x=>x&&x.published!==false).sort((a,b)=>(a.order??99)-(b.order??99)||String(b.date||'').localeCompare(String(a.date||'')));
 return data;
}
function wrap(ctx,text,width){
 const lines=[];
 for(const paragraph of String(text||'').split('\n')){let line='';for(const word of paragraph.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}lines.push(line);}
 return lines;
}
export async function createPortfolioWorld(world,{camera,canvas,wake,travel}){
 const data=await loadContent(),root=new T.Group();root.name='KARAN_RJ_PORTFOLIO_DISTRICTS';world.add(root);
 const actions=[],screens=[],exhibits=[];
 const makeAction=(parent,text,x,y,width,action)=>{
  const button=add(parent,roundedBox(width,.48,.14,.06),C.navy,[x,y,.60]);
  label(parent,text,[x,y,.69],width*.88,.22,{color:'#f4ffe8'});
  button.userData.dynamic=true;button.userData.action=action;button.userData.actionLabel=text;actions.push(button);return button;
 };
 function terminal(stop,entries){
  const g=new T.Group();g.name=`EXHIBIT_${stop.id}`;g.position.set(...stop.position);g.scale.setScalar(stop.position[1]>100?1:.48);root.add(g);
  // Circular laboratory deck, visible feet, bolted enamel casing and cable loom.
  cylinder(g,[0,-.25,0],5.5,.5,C.cream,5.7,64);ring(g,[0,.02,0],5.4,.09,stop.color);
  for(const x of [-3.25,3.25]){add(g,roundedBox(.5,1.4,1,.12),C.navy,[x,.7,0]);cylinder(g,[x,.08,0],.65,.15,stop.color);}
  add(g,roundedBox(8.6,6.15,.8,.24),C.cream,[0,4.1,0]);
  add(g,roundedBox(8.25,5.8,.12,.12),stop.color,[0,4.1,.42]);
  for(const x of [-4,4])for(const y of [1.4,6.8])sphere(g,[x,y,.49],[.08,.08,.04],C.navy,materials.metal,12);
  tube(g,[[3.7,1.5,-.5],[4.5,1,-.6],[4.5,.2,-1],[2,.15,-2]],.12,stop.color,20);
  rod(g,[-3.9,7.2,0],[-3.9,8.5,0],.055,C.navy);sphere(g,[-3.9,8.5,0],[.17,.17,.17],stop.color);
  label(g,stop.zone.toUpperCase(),[0,7.55,0],7.8,.32,{color:'#153d58'});
  const surface=document.createElement('canvas');surface.width=1536;surface.height=1056;
  const ctx=surface.getContext('2d'),texture=new T.CanvasTexture(surface);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
  const screen=new T.Mesh(new T.PlaneGeometry(7.8,5.36),new T.MeshBasicMaterial({map:texture,toneMapped:false}));screen.name=`CONTENT_${stop.id}`;screen.position.set(0,4.1,.50);g.add(screen);screens.push(screen);screen.userData.action=()=>window.dispatchEvent(new CustomEvent('exhibit:focus',{detail:stop}));screen.userData.actionLabel='Read '+stop.title;actions.push(screen);
  let page=0;const pages=[];
  for(const entry of entries){
   ctx.font='60px Arial';const lines=wrap(ctx,[entry.summary,entry.body].filter(Boolean).join('\n\n'),1320);
   for(let offset=0;offset<Math.max(1,lines.length);offset+=6)pages.push({...entry,lines:lines.slice(offset,offset+6),continued:offset>0});
  }
  function render(){
   const item=pages[page];ctx.fillStyle='#102e43';ctx.fillRect(0,0,1536,1056);
   ctx.fillStyle='#8fe1d7';ctx.font='bold 25px monospace';ctx.fillText('RJ / '+stop.id.toUpperCase().replace('-',' · '),90,80);
   ctx.fillStyle='#f5f4df';ctx.font='bold 95px Arial';let title=item.title+(item.continued?' / continued':'');
   while(ctx.measureText(title).width>1340){const n=parseFloat(ctx.font.match(/[\d.]+/)[0])-2;ctx.font=`bold ${n}px Arial`;}
   ctx.fillText(title,86,210);ctx.fillStyle='#779baf';ctx.fillRect(90,258,1356,2);
   ctx.fillStyle='#e5efeb';ctx.font='60px Arial';item.lines.forEach((line,i)=>ctx.fillText(line,90,345+i*82));
   ctx.fillStyle='#99c5ce';ctx.font='32px monospace';ctx.fillText((item.meta||'').slice(0,78),90,915);
   ctx.fillStyle='#8fe1d7';ctx.font='28px monospace';ctx.fillText(`${String(page+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}     ${safeUrl(item.url)?'OPEN SOURCE BELOW ↗':'SCROLL TO CONTINUE ↓'}`,90,991);
   screen.userData.page=page;screen.userData.title=item.title;texture.needsUpdate=true;wake();
  }
  makeAction(g,'← PREVIOUS',-2.65,.75,2.1,()=>{page=(page+pages.length-1)%pages.length;render();});
  makeAction(g,'OPEN ↗',0,.75,2.2,()=>{const url=safeUrl(pages[page].url);if(url){if(url.startsWith('mailto:'))location.href=url;else window.open(url,'_blank','noopener,noreferrer');}else{document.querySelector('#world-link').textContent='No public source for this entry yet';setTimeout(()=>document.querySelector('#world-link').textContent='',2200);}});
  makeAction(g,'NEXT →',2.65,.75,2.1,()=>{page=(page+1)%pages.length;render();});
  // The exhibition's category is also represented by a sculptural object.
  const sculpture=new T.Group();sculpture.position.set(-4.6,1.15,1);g.add(sculpture);
  if(stop.id==='achievements'){
   cylinder(sculpture,[0,.1,0],.55,.2,C.navy);rod(sculpture,[0,.2,0],[0,1.3,0],.13,C.gold);sphere(sculpture,[0,1.4,0],[.6,.65,.6],C.gold,materials.metal);for(const side of [-1,1])ring(sculpture,[side*.5,1.5,0],.38,.07,C.gold,'z');
  }else if(stop.id==='contact'){
   sphere(sculpture,[0,.4,0],[.6,.4,.5],C.mint);sphere(sculpture,[0,1,0],[.42,.43,.35],C.cream);for(const side of [-1,1]){rod(sculpture,[side*.2,1.2,0],[side*.32,1.7,.15],.04,C.cream);sphere(sculpture,[side*.32,1.7,.15],[.12,.12,.12],C.white);sphere(sculpture,[side*.32,1.7,.25],[.055,.055,.025],C.navy);}for(let i=0;i<4;i++)ring(sculpture,[0,.45,-.2+i*.1],.4-i*.06,.04,C.yellow,'z');
  }else{for(let i=0;i<3;i++){add(sculpture,roundedBox(.8,.4,.7,.06),i%2?stop.color:C.navy,[0,.35+i*.47,0]);for(let j=0;j<3;j++)sphere(sculpture,[-.22+j*.22,.35+i*.47,.36],[.035,.035,.02],C.mint,materials.enamel,8);}}
  if(false){cylinder(g,[0,-1.1,0],4.6,1.2,stop.color,3.3,48);ring(g,[0,-1.7,0],3.2,.15,C.cream);sphere(g,[0,-2,0],[2.8,.8,2.8],C.navy);}
  exhibits.push({id:stop.id,at:stop.at,position:stop.position,pages:pages.length,entries:entries.length,screen});render();
 }
 for(const stop of exhibitStops){
  let entries;
  if(stop.id==='about')entries=[{title:'KARAN RJ',summary:data.site.hero_intro,meta:'SECURITY RESEARCHER / FULL-STACK DEVELOPER',url:data.site.github},{title:'About the researcher',summary:data.site.about,meta:'INDIA / OFFENSIVE SECURITY / SOFTWARE',url:data.site.github}];
  else if(stop.id.startsWith('project-')){const index=Number(stop.id.split('-')[1]);entries=index===5?data.projects.slice(index):data.projects.slice(index,index+1);entries=entries.map(p=>({...p,meta:(p.stack||[]).join(' / ')}));}
  else if(stop.id==='contact')entries=[{title:'Let’s build something.',summary:data.site.contact_intro,meta:data.site.email,url:`mailto:${data.site.email}`},...['github','linkedin','tryhackme','hackthebox','leetcode','medium'].filter(k=>safeUrl(data.site[k])).map(k=>({title:{github:'GitHub',linkedin:'LinkedIn',tryhackme:'TryHackMe',hackthebox:'Hack The Box',leetcode:'LeetCode',medium:'Medium'}[k],summary:'Find my work and activity here. Use OPEN below to visit my profile.',meta:data.site[k],url:data.site[k]}))];
  else entries=data[stop.id].map(x=>({...x,meta:[x.date,x.severity].filter(Boolean).join(' / ')}));
  if(!entries.length)entries=[{title:stop.title,summary:`No public ${stop.id} published yet.\n\nVerified entries will appear in this ${stop.id==='achievements'?'observatory':'archive'} when they are ready to share.`,meta:'PUBLIC RECORD / AWAITING PUBLICATION'}];
  terminal(stop,entries);
 }
 await batchWorld(root);
 const ray=new T.Raycaster(),pointer=new T.Vector2();let down=null;
 function hit(e){const box=canvas.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(actions,false)[0]?.object;}
 // Buttons are excluded from batching so hit testing preserves their actions.
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
 canvas.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<8)hit(e)?.userData.action?.();down=null;});
 canvas.addEventListener('pointermove',e=>{const object=hit(e);canvas.style.cursor=object?'pointer':'grab';document.querySelector('#world-link').textContent=object?object.userData.actionLabel:'';});
 return {root,update(){},diagnostics(){return {stations:exhibits.map(({screen,...x})=>({...x,page:screen.userData.page,title:screen.userData.title,worldPosition:screen.getWorldPosition(new T.Vector3()).toArray()})),controls:actions.map(o=>{const p=o.getWorldPosition(new T.Vector3()).project(camera);return {label:o.userData.actionLabel,x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,z:p.z};}),actions:actions.length,overlayCards:document.querySelectorAll('.story-panel').length};}};
}
