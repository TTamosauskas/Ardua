import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:4173/';
async function run(id,minDelay){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__ARDUA_SCATTER_TEST);
 const result=await page.evaluate(async({id,minDelay})=>{
  const h=window.__ARDUA_SCATTER_TEST,idx=h.phaseIndexById.get(id);h.startPhase(idx,false);h.state.phaseDone=true;
  const start=performance.now();let endedAt=0;window.addEventListener('ardua:phase-ended',()=>{endedAt=performance.now()},{once:true});
  const promise=h.scatterStage();await new Promise(r=>setTimeout(r,id==='final_collapse'?420:160));
  const during={children:document.getElementById('explosion')?.children.length||0,hidden:document.querySelector('.pieces')?.classList.contains('hidden')||false};
  await promise;const delay=endedAt?endedAt-start:0;
  return {id,delay,during,minDelay};
 },{id,minDelay});
 if(errors.length)throw new Error(id+' page errors: '+errors.join(' | '));
 if(result.during.children<20||!result.during.hidden)throw new Error(id+' dispersal animation was not visible during transition: '+JSON.stringify(result));
 if(result.delay<minDelay)throw new Error(id+' returned too early: '+JSON.stringify(result));
 await page.close();return result;
}
const dust=await run('c',1450);
const supernova=await run('final_collapse',1850);
console.log(JSON.stringify({dust,supernova},null,2));
console.log('Scatter appreciation browser regression passed.');
await browser.close();
