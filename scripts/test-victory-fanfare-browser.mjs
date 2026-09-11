import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const base='http://127.0.0.1:4173';

async function prepare(kind){
 await page.goto(base,{waitUntil:'domcontentloaded'});
 return await page.evaluate(kind=>{
  const T=window.__ARDUA_VICTORY_TEST;if(!T)throw new Error('test hook missing');
  if(typeof window.ARDUA_RECIPE_AUDIO_SYNC?.playVictoryFanfare!=='function')throw new Error('victory fanfare API missing');
  let p;
  if(kind==='supernova')p=T.PHASES.find(x=>x.endEvent==='supernova');
  else if(kind==='scatter')p=T.PHASES.find(x=>x.mode==='fusion'&&!x.endEvent);
  else p=T.PHASES.find(x=>x.endEvent==='postTransition');
  if(!p)throw new Error('phase not found for '+kind);
  const idx=T.phaseIndexById.get(p.id);T.startPhase(idx,false,false);
  const intro=document.getElementById('stellarIntro');intro?.classList.remove('show');T.state.popupOpen=false;T.state.popupKind=null;
  T.state.readyToAdvance=true;T.state.phaseDone=false;T.state.locked=false;
  const btn=document.getElementById('phaseEndBtn');btn.classList.add('show');btn.disabled=false;
  window.__victoryAt=null;window.__explosionAt=null;
  window.addEventListener('ardua:victory-fanfare',()=>{if(window.__victoryAt===null)window.__victoryAt=performance.now()},{once:true});
  const exp=document.getElementById('explosion');
  new MutationObserver(()=>{if(exp.children.length&&window.__explosionAt===null)window.__explosionAt=performance.now()}).observe(exp,{childList:true});
  return p.id;
 },kind);
}

async function runCase(kind){
 const id=await prepare(kind);
 await page.evaluate(()=>window.__ARDUA_VICTORY_TEST.endPhaseAction());
 const data=await page.evaluate(()=>({victoryAt:window.__victoryAt,explosionAt:window.__explosionAt}));
 if(!Number.isFinite(data.victoryAt))throw new Error(kind+' did not emit fanfare');
 if(kind!=='special'){
  if(!Number.isFinite(data.explosionAt))throw new Error(kind+' did not start scatter');
  const delta=data.explosionAt-data.victoryAt;
  if(delta<0||delta>120)throw new Error(`${kind} fanfare/scatter delta ${delta.toFixed(1)}ms`);
 }
 console.log(kind,id,data);
}

await runCase('scatter');
await runCase('supernova');
await runCase('special');
await browser.close();
console.log('Victory fanfare browser regression passed.');
