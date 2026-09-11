import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];
function campaignState(activeId,completed=[]){return{version:14,introduced:true,activeId,completed,generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}}
function engineState(phaseId){return{phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}}
async function pageFor({activeId='he_red',engineId=activeId,completed=[]}={}){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(({campaign,engine})=>{
  if(!sessionStorage.getItem('__arduaE2ESeeded')){
   localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));localStorage.setItem('arduaRotationEnabledV2','0');sessionStorage.setItem('__arduaE2ESeeded','1');
  }
  window.__ARDUA_E2E={events:[]};window.__ARDUA_P1_E2E=true;Math.random=()=>.5;
  window.addEventListener('ardua:victory-reward-state',e=>window.__ARDUA_E2E.events.push({type:'reward',detail:e.detail}));
 },{campaign:campaignState(activeId,completed),engine:engineState(engineId)});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ARDUA_VICTORY_REWARD&&window.ARDUA_PHASE_COMPLETION&&window.ARDUA_CAMPAIGN);
 return{context,page,errors};
}
async function noErrors(errors,label){assert.deepEqual(errors,[],`${label}: erros JS: ${errors.join(' | ')}`)}

async function stellarContinue(){
 const label='stellar victory → continue', {context,page,errors}=await pageFor({activeId:'he_red',engineId:'he_red'});
 try{
  await page.waitForFunction(()=>document.documentElement.dataset.arduaEnginePhase==='he_red');
  await page.evaluate(()=>{
   const target='Forme Hélio-4 — 6/6';
   const keep=()=>{
    const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
    const goal=document.getElementById('goalText');if(goal&&goal.textContent!==target)goal.textContent=target;
    const end=document.getElementById('phaseEndBtn');if(end&&end.dataset.objectiveCompletionFallback!=='1'){if(end.textContent!=='ESPALHAR POEIRA ESTELAR')end.textContent='ESPALHAR POEIRA ESTELAR';end.classList.remove('show');end.removeAttribute('hidden');end.style.display=''}
   };
   const pieces=document.getElementById('pieces');if(pieces)pieces.innerHTML='<button class="atom" style="left:50%;top:50%"><span class="sym">He</span></button>';keep();window.__p1Keep=setInterval(keep,40);
  });
  await page.waitForFunction(()=>document.querySelector('#phaseEndBtn[data-objective-completion-fallback="1"].show'),undefined,{timeout:5000});await page.evaluate(()=>clearInterval(window.__p1Keep));
  await page.evaluate(()=>document.getElementById('phaseEndBtn')?.click());await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:6000});
  const during=await page.evaluate(()=>({saved:window.ARDUA_CAMPAIGN.getState(),map:document.getElementById('campaignMap')?.classList.contains('show'),route:window.ARDUA_VICTORY_REWARD.route,primary:document.querySelector('[data-victory-primary]')?.textContent,next:document.querySelector('[data-victory-next] strong')?.textContent,result:document.querySelector('[data-victory-result]')?.textContent}));
  assert.ok(during.saved.completed.includes('he_red'),`${label}: save não ocorreu antes da recompensa`);assert.equal(during.map,false,`${label}: mapa apareceu sob a recompensa`);assert.equal(during.route?.kind,'continue');assert.deepEqual(during.route?.options,['stellar_movement']);assert.equal(during.primary,'CONTINUAR');assert.ok(during.next?.length);assert.ok(/formou|hélio/i.test(during.result||''));
  await page.click('[data-victory-primary]');await page.waitForFunction(()=>!document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_CAMPAIGN.getState().activeId==='stellar_movement',undefined,{timeout:4000});
  assert.equal(await page.evaluate(()=>document.getElementById('campaignMap')?.classList.contains('show')),false,`${label}: mapa piscou como pedágio antes da próxima fase`);await noErrors(errors,label);
 }finally{await context.close()}
}

async function branchChoice(){
 const label='stellar mass branch', {context,page,errors}=await pageFor({activeId:'first_generation_formation',engineId:'first_generation_formation',completed:['first_generation_formation']});
 try{
  await page.evaluate(()=>window.ARDUA_VICTORY_REWARD.present({phaseId:'first_generation_formation',goal:'Forme a primeira estrela — 1/1',name:'Primeira estrela',wasCompleted:false,discoveries:[]}));
  const ui=await page.evaluate(()=>({route:window.ARDUA_VICTORY_REWARD.route,primary:document.querySelector('[data-victory-primary]')?.textContent,secondaryHidden:document.querySelector('[data-victory-map]')?.hidden}));
  assert.equal(ui.route?.kind,'choose');assert.ok((ui.route?.options||[]).length>1,`${label}: não expôs múltiplos caminhos canônicos`);assert.equal(ui.primary,'ESCOLHER CAMINHO');assert.equal(ui.secondaryHidden,true);
  await page.click('[data-victory-primary]');await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));assert.equal(await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState().activeId),'first_generation_formation',`${label}: o jogo escolheu uma massa estelar pelo jogador`);await noErrors(errors,label);
 }finally{await context.close()}
}

async function revisitReturn(){
 const label='revisit return', {context,page,errors}=await pageFor({activeId:'stellar_movement',engineId:'he_red',completed:['bigbang','quarks','low_mass_formation','he_red']});
 try{
  await page.evaluate(()=>window.ARDUA_VICTORY_REWARD.present({phaseId:'he_red',goal:'Forme Hélio-4 — 6/6',name:'Hélio-4',wasCompleted:true,revisitReturnId:'stellar_movement',discoveries:[]}));
  assert.equal(await page.textContent('[data-victory-primary]'),'VER MAPA');await page.click('[data-victory-primary]');await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));
  assert.equal(await page.evaluate(()=>window.ARDUA_CAMPAIGN.getState().activeId),'stellar_movement',`${label}: revisita alterou a progressão ativa`);await noErrors(errors,label);
 }finally{await context.close()}
}

for(const [name,fn] of [['stellar',stellarContinue],['branch',branchChoice],['revisit',revisitReturn]]){try{await fn()}catch(e){failures.push(`${name}: ${e.stack||e.message||e}`)}}
await browser.close();if(failures.length){console.error(failures.map((x,i)=>`${i+1}. ${x}`).join('\n\n'));process.exit(1)}
console.log('P1 browser E2E OK: completion is saved before reward, linear Continue skips the map, branch points defer choice to the map, and revisits preserve the active path.');
