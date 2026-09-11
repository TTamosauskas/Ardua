import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];

function recordFailure(name,error){failures.push(`${name}: ${error?.stack||error?.message||error}`)}
function campaignState(activeId,completed=[]){return{version:14,introduced:true,activeId,completed,generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}}
function engineState(phaseId){return{phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}}

async function makePage({activeId='primordial_d',engineId=activeId,completed=[],reducedMotion='no-preference',fixedRandom=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion});
 await context.addInitScript(({campaign,engine,fixedRandom})=>{
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
  if(fixedRandom)Math.random=()=>.5;
  window.__ARDUA_E2E={events:[]};
  const push=(type,detail={})=>window.__ARDUA_E2E.events.push({type,time:performance.now(),detail:JSON.parse(JSON.stringify(detail||{}))});
  window.addEventListener('ardua:phase-completion-state',e=>push('completion',e.detail));
  window.addEventListener('ardua:victory-fanfare',e=>push('fanfare',e.detail));
  window.addEventListener('ardua:reaction-chain',e=>push('chain',e.detail));
 },{campaign:campaignState(activeId,completed),engine:engineState(engineId),fixedRandom});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_CAMPAIGN&&window.ARDUA_PHASE_COMPLETION&&window.ARDUA_CHAIN_FEEDBACK);
 return{context,page,errors};
}

async function completionEvents(page){return page.evaluate(()=>window.__ARDUA_E2E.events.filter(x=>x.type==='completion'))}
async function fanfareCount(page){return page.evaluate(()=>window.__ARDUA_E2E.events.filter(x=>x.type==='fanfare').length)}
async function assertNoErrors(errors,label){assert.deepEqual(errors,[],`${label}: erros JavaScript inesperados: ${errors.join(' | ')}`)}

async function testStellarFallback({reducedMotion='no-preference'}={}){
 const label=`stellar-fallback-${reducedMotion}`;
 const {context,page,errors}=await makePage({activeId:'he_red',engineId:'he_red',reducedMotion,fixedRandom:true});
 try{
  await page.waitForFunction(()=>document.documentElement.dataset.arduaEnginePhase==='he_red');
  await page.evaluate(()=>{
   const pieces=document.getElementById('pieces');
   if(pieces)pieces.innerHTML='<button class="atom" style="left:50%;top:50%"><span class="sym">He</span></button>';
   const goal=document.getElementById('goalText');if(goal)goal.textContent='Forme Hélio-4 — 6/6';
   const end=document.getElementById('phaseEndBtn');if(end){end.textContent='ESPALHAR POEIRA ESTELAR';end.classList.remove('show');end.removeAttribute('hidden')}
  });
  await page.waitForFunction(()=>document.querySelector('#phaseEndBtn[data-objective-completion-fallback="1"].show'));
  const started=Date.now();
  await page.evaluate(()=>{const b=document.getElementById('phaseEndBtn');b.click();b.click();b.click()});
  await page.waitForTimeout(90);
  const during=await page.evaluate(()=>({
   state:document.documentElement.dataset.arduaCompletionState,
   dust:document.querySelectorAll('#explosion .dust-speck').length,
   piecesHidden:document.getElementById('pieces')?.classList.contains('hidden')||false,
   mapVisible:document.getElementById('campaignMap')?.classList.contains('show')||false
  }));
  assert.equal(during.state,'celebrating',`${label}: clique não entrou em celebrating`);
  assert.ok(during.dust>=34,`${label}: dispersão não criou 34 partículas`);
  assert.equal(during.piecesHidden,true,`${label}: peças originais não foram escondidas durante a dispersão`);
  assert.equal(during.mapVisible,false,`${label}: mapa abriu antes da celebração acabar`);
  await page.waitForFunction(()=>document.documentElement.dataset.arduaCompletionState==='completed',{timeout:5000});
  const elapsed=Date.now()-started;
  const events=await completionEvents(page),states=events.map(x=>x.detail.status);
  assert.equal(states.filter(x=>x==='celebrating').length,1,`${label}: celebração duplicada`);
  assert.equal(states.filter(x=>x==='committing').length,1,`${label}: commit duplicado`);
  assert.equal(states.filter(x=>x==='completed').length,1,`${label}: conclusão duplicada`);
  assert.equal(await fanfareCount(page),1,`${label}: fanfarra deve tocar uma única vez`);
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));
  const saved=await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState());
  assert.ok(saved.completed.includes('he_red'),`${label}: fase não persistiu como concluída`);
  await assertNoErrors(errors,label);
  return elapsed;
 }finally{await context.close()}
}

async function completeQuarks(page){
 await page.evaluate(()=>window.ARDUA_QUARKS.start());
 await page.waitForFunction(()=>window.ARDUA_QUARKS.isActive()&&document.querySelectorAll('.quark-piece').length===6);
 await page.evaluate(()=>document.querySelector('.quark-piece.quark-d')?.click());
 await page.waitForFunction(()=>document.querySelectorAll('.quark-piece.candidate').length===2);
 await page.evaluate(()=>document.querySelector('.quark-piece.candidate')?.click());
 await page.waitForFunction(()=>document.getElementById('goalText')?.textContent.includes('1/2'),{timeout:3000});
 await page.evaluate(()=>document.querySelector('.quark-piece.quark-u')?.click());
 await page.waitForFunction(()=>document.querySelectorAll('.quark-piece.candidate').length===2);
 await page.evaluate(()=>document.querySelector('.quark-piece.candidate')?.click());
 await page.waitForFunction(()=>document.getElementById('phaseEndBtn')?.classList.contains('show')&&document.getElementById('goalText')?.textContent.includes('2/2'),{timeout:3000});
}

async function testQuarks(){
 const label='quarks';
 const {context,page,errors}=await makePage({activeId:'primordial_d',engineId:'primordial_d',completed:['bigbang']});
 try{
  await page.waitForFunction(()=>window.ARDUA_QUARKS?.start);
  await completeQuarks(page);
  await page.evaluate(()=>{const b=document.getElementById('phaseEndBtn');b.click();b.click();b.click()});
  await page.waitForTimeout(90);
  const during=await page.evaluate(()=>({
   state:document.documentElement.dataset.arduaCompletionState,
   stageHidden:document.querySelector('.quarks-stage')?.style.visibility==='hidden',
   dust:document.querySelectorAll('#explosion .dust-speck').length,
   mapVisible:document.getElementById('campaignMap')?.classList.contains('show')||false
  }));
  assert.equal(during.state,'celebrating',`${label}: não entrou em celebrating`);
  assert.equal(during.stageHidden,true,`${label}: campo de quarks não foi ocultado na dispersão`);
  assert.ok(during.dust>=34,`${label}: partículas finais ausentes`);
  assert.equal(during.mapVisible,false,`${label}: mapa abriu antes do final audiovisual`);
  await page.waitForFunction(()=>document.documentElement.dataset.arduaCompletionState==='completed',{timeout:5000});
  assert.equal(await fanfareCount(page),1,`${label}: clique repetido duplicou a fanfarra`);
  const states=(await completionEvents(page)).map(x=>x.detail.status);
  for(const state of ['celebrating','committing','completed'])assert.equal(states.filter(x=>x===state).length,1,`${label}: estado ${state} ocorreu mais de uma vez`);
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));
  let saved=await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState());
  assert.ok(saved.completed.includes('quarks'),`${label}: conclusão não foi salva`);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ARDUA_CAMPAIGN);
  saved=await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState());
  assert.ok(saved.completed.includes('quarks'),`${label}: conclusão não sobreviveu ao reload`);
  await assertNoErrors(errors,label);
 }finally{await context.close()}
}

async function testQuasar(){
 const label='quasar';
 const {context,page,errors}=await makePage({activeId:'quasar',engineId:'quasar',completed:['bigbang','black_hole']});
 try{
  await page.waitForFunction(()=>window.ARDUA_QUASAR_GAME&&document.querySelector('.quasar-layer'));
  for(let pair=0;pair<6;pair++){
   await page.evaluate(pair=>{const xs=[...document.querySelectorAll(`.quasar-gas[data-pair="${pair}"]`)];xs[0]?.click();xs[1]?.click()},pair);
   await page.waitForFunction(target=>document.getElementById('stageProgressText')?.textContent===`${target}/6`,pair+1,{timeout:2000});
  }
  await page.waitForFunction(()=>{const b=document.getElementById('phaseEndBtn');return b&&!b.hidden&&getComputedStyle(b).display!=='none'});
  await page.evaluate(()=>{const b=document.getElementById('phaseEndBtn');b.click();b.click();b.click()});
  await page.waitForTimeout(90);
  const during=await page.evaluate(()=>({
   state:document.documentElement.dataset.arduaCompletionState,
   exiting:document.querySelector('.quasar-layer')?.classList.contains('quasar-finale-exit')||false,
   dust:document.querySelectorAll('#explosion .dust-speck').length,
   mapVisible:document.getElementById('campaignMap')?.classList.contains('show')||false
  }));
  assert.equal(during.state,'celebrating',`${label}: não entrou em celebrating`);
  assert.equal(during.exiting,true,`${label}: quasar não entrou na saída visual`);
  assert.ok(during.dust>=34,`${label}: partículas finais ausentes`);
  assert.equal(during.mapVisible,false,`${label}: mapa abriu antes da celebração`);
  await page.waitForFunction(()=>document.documentElement.dataset.arduaCompletionState==='completed',{timeout:5000});
  assert.equal(await fanfareCount(page),1,`${label}: clique repetido duplicou a fanfarra`);
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));
  let saved=await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState());
  assert.ok(saved.completed.includes('quasar'),`${label}: conclusão não foi salva`);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ARDUA_CAMPAIGN);
  saved=await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState());
  assert.ok(saved.completed.includes('quasar'),`${label}: conclusão não sobreviveu ao reload`);
  await assertNoErrors(errors,label);
 }finally{await context.close()}
}

async function testChainBridge(){
 const label='reaction-chain';
 const {context,page,errors}=await makePage();
 try{
  await page.evaluate(()=>{
   const fx=document.getElementById('fx');
   window.__emitChain=(step)=>{
    fx.querySelector('.chain-callout')?.remove();
    const el=document.createElement('div');el.className='chain-callout visible';el.innerHTML=`<small>CADEIA</small><strong>×${step}</strong>`;fx.appendChild(el);
   };
   window.__clearChain=()=>fx.querySelector('.chain-callout')?.remove();
  });
  for(const [step,tier] of [[2,'chain'],[3,'strong'],[5,'major'],[8,'cosmic']]){
   await page.evaluate(step=>window.__emitChain(step),step);
   await page.waitForFunction(step=>window.__ARDUA_E2E.events.some(x=>x.type==='chain'&&x.detail.step===step),step);
   const seen=await page.evaluate(()=>({tier:document.querySelector('.chain-callout.visible')?.dataset.chainTier,board:document.getElementById('starBoard')?.dataset.chainTier}));
   assert.equal(seen.tier,tier,`${label}: ×${step} recebeu tier incorreto`);
   assert.equal(seen.board,tier,`${label}: board não recebeu tier ${tier}`);
   await page.evaluate(()=>window.__clearChain());await page.waitForTimeout(120);
  }
  const before=await page.evaluate(()=>window.__ARDUA_E2E.events.filter(x=>x.type==='chain'&&x.detail.step===3).length);
  await page.evaluate(()=>window.__emitChain(3));await page.waitForFunction(count=>window.__ARDUA_E2E.events.filter(x=>x.type==='chain'&&x.detail.step===3).length>count,before);
  await page.evaluate(()=>window.__clearChain());await page.waitForTimeout(120);
  await page.evaluate(()=>window.__emitChain(3));await page.waitForFunction(count=>window.__ARDUA_E2E.events.filter(x=>x.type==='chain'&&x.detail.step===3).length>count,before+1);
  const after=await page.evaluate(()=>window.__ARDUA_E2E.events.filter(x=>x.type==='chain'&&x.detail.step===3).length);
  assert.equal(after,before+2,`${label}: duas cadeias ×3 consecutivas não geraram eventos distintos`);
  await page.evaluate(()=>window.__clearChain());await page.waitForTimeout(160);
  const cleared=await page.evaluate(()=>({active:document.getElementById('starBoard')?.classList.contains('chain-feedback-active'),tier:document.getElementById('starBoard')?.dataset.chainTier||''}));
  assert.equal(cleared.active,false,`${label}: estado visual ficou preso após a cadeia`);
  assert.equal(cleared.tier,'',`${label}: tier ficou preso no board`);
  await assertNoErrors(errors,label);
 }finally{await context.close()}
}

try{
 const normal=await testStellarFallback({reducedMotion:'no-preference'});
 const reduced=await testStellarFallback({reducedMotion:'reduce'});
 assert.ok(reduced+250<normal,`reduced-motion: celebração não ficou materialmente mais curta (${reduced}ms vs ${normal}ms)`);
}catch(e){recordFailure('stellar/reduced-motion',e)}
for(const [name,fn] of [['quarks',testQuarks],['quasar',testQuasar],['reaction-chain',testChainBridge]]){
 try{await fn()}catch(e){recordFailure(name,e)}
}

await browser.close();
if(failures.length){console.error(failures.map((x,i)=>`${i+1}. ${x}`).join('\n\n'));process.exit(1)}
console.log('P0 browser E2E OK: stellar fallback, reduced motion, Quarks, Quasar, repeated final clicks, persistence and reaction-chain tiers passed.');
