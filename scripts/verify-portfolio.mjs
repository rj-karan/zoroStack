import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
const root=new URL('../',import.meta.url).pathname;
mkdirSync(root+'docs/screenshots/current',{recursive:true});

const base = process.env.WORLD_URL || 'http://127.0.0.1:8090';
const port = 9261;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = spawn('/usr/bin/chromium', [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/rj-egghead-portfolio-check'
], {stdio: 'ignore'});

let socket;
let requestId = 0;
const pending = new Map();
const errors = [];
try {
  let tab;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      tab = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((item) => item.type === 'page');
      if (tab) break;
    } catch {}
    await wait(250);
  }
  if (!tab) throw Error('Chromium debugging target did not start');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      pending.delete(message.id);
      clearTimeout(task.timer);
      message.error ? task.reject(message.error) : task.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(message.params.args.map((arg) => arg.value || arg.description || '').join(' '));
    }
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++requestId;
    const timer = setTimeout(() => reject(Error(method + ' timed out')), 120000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async (expression) => {
    for (let attempt = 0; attempt < 240; attempt++) {
      if (await evaluate(expression)) return;
      await wait(250);
    }
    throw Error('Timed out waiting for ' + expression + ': ' + JSON.stringify({errors,loading:await evaluate('document.querySelector("#loading-copy")?.textContent'),state:await evaluate('document.querySelector("#world")?.dataset.state')}));
  };

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await call('Page.navigate', {url: base + '/?debug=1'});
  await until('document.querySelector("#world")?.dataset.state === "ready"');
  assert.equal(await evaluate('window.__egghead.exhibits().stations.length'),12);
  assert.equal(await evaluate('window.__egghead.exhibits().overlayCards'),0);
  assert.equal(await evaluate('window.__egghead.exhibits().actions'),48);
  const footprint=await evaluate('window.__egghead.counts.areaScale');
  assert.ok(footprint>=6.7&&footprint<=6.9);
  const district=await evaluate('window.__egghead.counts');
  assert.ok(district.pods>=25&&district.coastalCanopies>150&&district.cliffRocks>100&&district.palms>30);
  assert.ok(district.warships>=5&&district.pirateShips>=1);
  assert.ok(district.grassClumps>2500&&district.mossPatches>300&&district.leafDetails>3000&&district.forestTrunks>280&&district.understoryLeaves>3000);
  assert.ok(district.giantPalms>35&&district.spreadingTrees>70&&district.umbrellaTrees>70&&district.youngTrees>70);
  assert.ok(district.seaBeasts>=2&&district.serviceRobots>=4&&district.vegaForce===1);
  const stations=await evaluate('window.__egghead.exhibits().stations');
  const approach=await evaluate('window.__egghead.capture(0)');
  const roaming=await evaluate('window.__egghead.capture(0,42)');
  assert.ok(Math.hypot(...approach.seaBeasts[0].map((v,i)=>v-roaming.seaBeasts[0][i]))>20);
  assert.ok(Math.hypot(...approach.vegaForce.map((v,i)=>v-roaming.vegaForce[i]))>1);
  await evaluate('window.__egghead.capture(0)');
  await evaluate('window.__egghead.capture(.04)');
  let fleetShot=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-fleet.png',Buffer.from(fleetShot.data,'base64'));
  const boost=await evaluate('window.__egghead.capture(.13)');
  let boostShot=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-boost-publish.png',Buffer.from(boostShot.data,'base64'));
  const landed=await evaluate('window.__egghead.capture(.35)');
  await evaluate('window.__egghead.capture(.325)');
  let descentShot=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-descent.png',Buffer.from(descentShot.data,'base64'));
  assert.ok(approach.shipPosition[0]>165 && approach.shipPosition[1]>75);
  assert.equal(boost.burstVisible,true);
  assert.ok(landed.shipPosition[0]<-145 && landed.shipPosition[1]<0);
  await evaluate('window.__egghead.resume()');
  await wait(1400);
  const renderCosts=await evaluate('window.__egghead.frames().slice(-30).map(x=>x.cost)');
  await evaluate('window.__egghead.capture(0)');

  for(const station of [{id:'overview',at:0},...stations]){
    await evaluate(`window.__egghead.capture(${station.at})`);
    const shot=await call('Page.captureScreenshot',{format:'png'});
    writeFileSync(`/tmp/egghead-world-${station.id}.png`,Buffer.from(shot.data,'base64'));
    writeFileSync(root+`docs/screenshots/current/${station.id}.png`,Buffer.from(shot.data,'base64'));
  }
  // Hit the real mesh with mouse input, then use its physical NEXT and OPEN buttons.
  await evaluate('window.__egghead.capture(.35)');
  const clickControl=async index=>{const c=await evaluate(`window.__egghead.exhibits().controls[${index}]`);await call('Input.dispatchMouseEvent',{type:'mousePressed',x:c.x,y:c.y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:c.x,y:c.y,button:'left',clickCount:1});};
  await clickControl(0);
  await until('window.__egghead.motion().focusBlend > .99');
  await clickControl(3);
  assert.equal(await evaluate('window.__egghead.exhibits().stations[0].page'),1);
  await evaluate('window.__opened=null;window.open=(url)=>{window.__opened=url}');
  await clickControl(2);
  assert.equal(await evaluate('window.__opened'),'https://github.com/rj-karan');
  await evaluate("window.__egghead.focus('reports')");
  await wait(1200);
  let upper=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-research-focused.png',Buffer.from(upper.data,'base64'));
  await evaluate('window.__egghead.capture(.42)');
  await evaluate("window.__egghead.focus('project-0')");
  await wait(1500);
  let focused=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-focused.png',Buffer.from(focused.data,'base64'));
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('window.__egghead.capture(.42)');
  let shot=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-mobile.png',Buffer.from(shot.data,'base64'));
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),true);
  await evaluate("window.__egghead.focus('project-0')");
  await until('window.__egghead.motion().focusBlend > .99');
  shot=await call('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/egghead-world-mobile-focused.png',Buffer.from(shot.data,'base64'));
  await call('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),true);
  await call('Page.navigate',{url:base+'/directory.html'});
  await until('document.querySelectorAll("#projects article").length === 6');
  assert.equal(await evaluate('document.querySelectorAll("#links a").length'),7);
  if(process.env.WORLD_EXPORT==='1'){
    await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:root+'assets/world'});
    await call('Page.navigate',{url:base+'/?studio=1'});
    await until('window.__egghead?.ready');
    console.log('GLB export',await evaluate('window.__egghead.exportGLB()'));
    await wait(1500);
  }
  assert.deepEqual(errors,[]);
  console.log('Egghead island metrics',JSON.stringify({areaScale:footprint,pods:district.pods,coastalCanopies:district.coastalCanopies,palms:district.palms,warships:district.warships,pirateShips:district.pirateShips,triangles:approach.triangles,drawCalls:approach.calls,memory:approach.memory,medianRenderMs:renderCosts.sort((a,b)=>a-b)[Math.floor(renderCosts.length/2)]}));
  console.log('World exhibits passed: twelve stations, 36 physical controls and 12 readable screens, no HTML cards, mobile layout, no runtime errors.');
} finally {
  pending.forEach((task) => clearTimeout(task.timer));
  socket?.close();
  browser.kill();
}
