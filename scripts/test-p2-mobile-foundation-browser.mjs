import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const viewports=[
 {name:'android-small',width:360,height:800},
 {name:'android-reference',width:390,height:844},
 {name:'android-large',width:412,height:915},
 {name:'phone-landscape',width:844,height:390}
];

function campaignState(){return{version:14,introduced:true,activeId:'primordial_d',completed:['bigbang','quarks'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}}
function engineState(){return{phaseId:'primordial_d',phaseIndex:0,version:'10.80',discovered:['H'],ignited:false,productLessons:[],rewardDiscoveries:['particle:quark','particle:proton','particle:neutron'],rewardAchievements:[],signatureSeen:[]}}
function inside(rect,width,height,label){
 assert.ok(rect,`${label}: elemento sem geometria`);
 assert.ok(rect.left>=-1,`${label}: saiu pela esquerda (${rect.left})`);
 assert.ok(rect.top>=-1,`${label}: saiu pelo topo (${rect.top})`);
 assert.ok(rect.right<=width+1,`${label}: saiu pela direita (${rect.right} > ${width})`);
 assert.ok(rect.bottom<=height+1,`${label}: saiu por baixo (${rect.bottom} > ${height})`);
}
async function rect(page,selector){return page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}})}
async function assertNoHorizontalOverflow(page,label){
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,body:document.body.scrollWidth,inner:innerWidth}));
 assert.ok(dims.scroll<=dims.inner+1,`${label}: document overflow horizontal ${JSON.stringify(dims)}`);
 assert.ok(dims.body<=dims.inner+1,`${label}: body overflow horizontal ${JSON.stringify(dims)}`);
}
async function assertButtonsAtLeast(page,selector,min,label){
 const sizes=await page.locator(selector).evaluateAll(els=>els.filter(el=>!el.hidden&&getComputedStyle(el).display!=='none').map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,text:el.textContent?.trim()||el.getAttribute('aria-label')||''}}));
 for(const size of sizes)assert.ok(size.h>=min-0.5&&size.w>=min-0.5,`${label}: alvo menor que ${min}px ${JSON.stringify(size)}`);
}

for(const vp of viewports){
 const label=`p2.1-${vp.name}`;
 const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:true,hasTouch:true});
 await context.addInitScript(({campaign,engine})=>{
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
  sessionStorage.setItem('__arduaE2ESeeded','1');
 },{campaign:campaignState(),engine:engineState()});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
 try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ARDUA_SURFACE_COORDINATOR&&window.ARDUA_VICTORY_REWARD&&window.ARDUA_CAMPAIGN);
  await page.evaluate(()=>{
   for(const id of ['stellarIntro','campaignPhasePreview','menuModal','discoveryUnlockModal','phaseQuickMenu','campaignVictoryReward']){const el=document.getElementById(id);el?.classList.remove('show');el?.setAttribute('aria-hidden','true')}
   const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
   window.ARDUA_SURFACE_COORDINATOR.sync();
  });
  await assertNoHorizontalOverflow(page,label);
  inside(await rect(page,'.app'),vp.width,Math.max(vp.height,(await rect(page,'.app')).bottom),`${label}: app horizontal`);
  const trigger=await rect(page,'#menuOpenBtn');assert.ok(trigger.width>=44&&trigger.height>=44,`${label}: menu trigger abaixo de 44px`);

  await page.locator('#menuOpenBtn').click({force:true});
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show')&&window.ARDUA_SURFACE_COORDINATOR.top==='quick-menu');
  inside(await rect(page,'.phase-quick-card'),vp.width,vp.height,`${label}: quick menu`);
  await assertButtonsAtLeast(page,'.phase-quick-actions>button,.phase-quick-close',44,`${label}: quick menu`);

  await page.evaluate(()=>{
   const d=document.getElementById('discoveryUnlockModal');d?.classList.add('show');d?.setAttribute('aria-hidden','false');window.ARDUA_SURFACE_COORDINATOR.sync();
  });
  await page.waitForFunction(()=>window.ARDUA_SURFACE_COORDINATOR.top==='discovery');
  const ownership=await page.evaluate(()=>({
   quickSuppressed:document.getElementById('phaseQuickMenu')?.dataset.arduaSurfaceSuppressed||'',
   quickInert:document.getElementById('phaseQuickMenu')?.inert||false,
   top:document.documentElement.dataset.arduaSurface,
   active:window.ARDUA_SURFACE_COORDINATOR.active
  }));
  assert.equal(ownership.quickSuppressed,'1',`${label}: discovery não suprimiu quick menu concorrente`);
  assert.equal(ownership.quickInert,true,`${label}: quick menu concorrente não ficou inert`);
  assert.equal(ownership.top,'discovery',`${label}: discovery não assumiu ownership`);
  inside(await rect(page,'.discovery-unlock-card'),vp.width,vp.height,`${label}: discovery modal`);
  await assertButtonsAtLeast(page,'#discoveryUnlockContinue',44,`${label}: discovery CTA`);

  await page.evaluate(()=>{
   const d=document.getElementById('discoveryUnlockModal');d?.classList.remove('show');d?.setAttribute('aria-hidden','true');
   const q=document.getElementById('phaseQuickMenu');q?.classList.remove('show');q?.setAttribute('aria-hidden','true');
   document.getElementById('menuOpenBtn')?.setAttribute('aria-expanded','false');window.ARDUA_SURFACE_COORDINATOR.sync();
   window.ARDUA_VICTORY_REWARD.openMap();
  });
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show')&&window.ARDUA_SURFACE_COORDINATOR.top==='map');
  inside(await rect(page,'.campaign-head'),vp.width,vp.height,`${label}: map header`);
  await assertButtonsAtLeast(page,'.campaign-close',44,`${label}: map close`);
  await assertNoHorizontalOverflow(page,`${label}: map`);

  /* P1 launches a phase through the canonical map node handler even when that node is
     outside the currently expanded visual branch. Reuse that exact DOM path here; node
     visibility is not part of this geometry contract. */
  await page.evaluate(()=>document.querySelector('#campaignMap .phase-node[data-phase="primordial_d"]')?.click());
  await page.waitForFunction(()=>document.getElementById('campaignPhasePreview')?.classList.contains('show')&&window.ARDUA_SURFACE_COORDINATOR.top==='phase-preview');
  const previewState=await page.evaluate(()=>({
   mapBackground:document.getElementById('campaignMap')?.dataset.arduaSurfaceBackground||'',
   mapSuppressed:document.getElementById('campaignMap')?.dataset.arduaSurfaceSuppressed||'',
   mapInert:document.getElementById('campaignMap')?.inert||false
  }));
  assert.equal(previewState.mapBackground,'1',`${label}: mapa não virou backdrop do preview`);
  assert.equal(previewState.mapSuppressed,'',`${label}: preview apagou o mapa em vez de usá-lo como contexto`);
  assert.equal(previewState.mapInert,true,`${label}: mapa continuou interativo atrás do preview`);
  inside(await rect(page,'.campaign-phase-preview-card'),vp.width,vp.height,`${label}: phase preview`);
  await assertButtonsAtLeast(page,'.phase-modal-actions button',44,`${label}: preview CTAs`);

  await page.evaluate(()=>{
   const p=document.getElementById('campaignPhasePreview');p?.classList.remove('show');p?.setAttribute('aria-hidden','true');
   const m=document.getElementById('campaignMap');m?.classList.remove('show');m?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
   window.ARDUA_SURFACE_COORDINATOR.sync();
   window.ARDUA_VICTORY_REWARD.present({phaseId:'primordial_d',goal:'Forme Deutério — 2/2',name:'Deutério',wasCompleted:false,activeIdBefore:'primordial_d',revisitReturnId:'',discoveries:['Deutério'],capturedAt:performance.now()});
  });
  await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_SURFACE_COORDINATOR.top==='reward');
  inside(await rect(page,'.campaign-victory-card'),vp.width,vp.height,`${label}: reward`);
  await assertButtonsAtLeast(page,'.victory-reward-actions button',44,`${label}: reward CTAs`);
  await assertNoHorizontalOverflow(page,`${label}: reward`);

  const coarse=await page.evaluate(()=>matchMedia('(pointer: coarse)').matches);
  assert.equal(coarse,true,`${label}: contexto mobile não expôs pointer coarse`);
  assert.deepEqual(errors,[],`${label}: erros JavaScript inesperados: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

console.log('P2.1 mobile foundation OK: safe-area geometry, 44px targets, exclusive surface ownership, map-backed phase preview and reward fit passed across portrait and landscape phones.');
await browser.close();
