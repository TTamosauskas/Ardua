import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  const campaign={version:14,introduced:true,activeId:'primordial_d',completed:['bigbang'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
  const engine={phaseId:'primordial_d',phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]};
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
  window.__ARDUA_E2E={};window.__ARDUA_P1_E2E=true;Math.random=()=>.5;
});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ARDUA_VICTORY_REWARD&&window.ARDUA_PHASE_COMPLETION&&window.ARDUA_CAMPAIGN);
  await page.waitForFunction(()=>document.documentElement.dataset.arduaEnginePhase==='primordial_d');
  await page.evaluate(()=>{
    const target='Forme Deutério — 4/4';
    const keep=()=>{
      const intro=document.getElementById('stellarIntro');if(intro?.classList.contains('show'))document.getElementById('stellarStartBtn')?.click();
      const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
      const goal=document.getElementById('goalText');if(goal&&goal.textContent!==target)goal.textContent=target;
      const end=document.getElementById('phaseEndBtn');if(end&&end.dataset.objectiveCompletionFallback!=='1'){
        if(end.textContent!=='ESPALHAR POEIRA ESTELAR')end.textContent='ESPALHAR POEIRA ESTELAR';
        end.classList.remove('show');end.removeAttribute('hidden');end.style.display='';
      }
    };
    keep();window.__mapBranchKeep=setInterval(keep,40);
  });
  await page.waitForFunction(()=>document.querySelector('#phaseEndBtn[data-objective-completion-fallback="1"].show'),undefined,{timeout:5000});
  await page.evaluate(()=>{clearInterval(window.__mapBranchKeep);const intro=document.getElementById('stellarIntro');if(intro?.classList.contains('show'))document.getElementById('stellarStartBtn')?.click()});
  await page.click('#phaseEndBtn');
  await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:7000});
  const route=await page.evaluate(()=>window.ARDUA_VICTORY_REWARD.route);
  assert.equal(route?.kind,'choose','Deutério deve abrir a escolha Trítio/Hélio-3');
  assert.ok(route?.options?.includes('primordial_t'));
  assert.ok(route?.options?.includes('primordial_he3'));

  await page.click('[data-victory-primary]');
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'),undefined,{timeout:3000});
  await page.click('.branch-choice[data-branch-group="primordial"][data-branch-open="tritium"]');
  await page.waitForFunction(()=>{
    const n=document.querySelector('.phase-node[data-phase="primordial_t"]');return !!n&&n.getClientRects().length>0;
  },undefined,{timeout:2500});
  await page.click('.phase-node[data-phase="primordial_t"]');
  await page.waitForFunction(()=>{
    const p=document.getElementById('campaignPhasePreview');return p?.classList.contains('show')&&p.dataset.phaseId==='primordial_t';
  },undefined,{timeout:2500});
  await page.click('#campaignPhasePreview [data-phase-preview-launch]');
  await page.waitForFunction(()=>window.ARDUA_CAMPAIGN.getState().activeId==='primordial_t'&&!document.getElementById('campaignMap')?.classList.contains('show'),undefined,{timeout:4000});
  await page.waitForTimeout(250);

  const before=await page.evaluate(()=>({
    pending:window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    preview:document.getElementById('campaignPhasePreview')?.classList.contains('show'),
    intro:document.getElementById('stellarIntro')?.classList.contains('show'),
    surface:document.documentElement.dataset.arduaSurface||'',
    appInert:document.querySelector('.app')?.inert||false
  }));
  await page.click('#menuOpenBtn');
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'),undefined,{timeout:2500});
  await page.click('#phaseQuickMap');
  await page.waitForTimeout(350);
  const state=await page.evaluate(()=>({
    map:document.getElementById('campaignMap')?.classList.contains('show'),
    hidden:document.getElementById('campaignMap')?.getAttribute('aria-hidden'),
    suppressed:document.getElementById('campaignMap')?.dataset.arduaSurfaceSuppressed||'',
    background:document.getElementById('campaignMap')?.dataset.arduaSurfaceBackground||'',
    quick:document.getElementById('phaseQuickMenu')?.classList.contains('show'),
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    pending:window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    surface:document.documentElement.dataset.arduaSurface||''
  }));
  assert.equal(state.map,true,`Mapa não permaneceu aberto depois do preview Trítio. before=${JSON.stringify(before)} after=${JSON.stringify(state)}`);
  assert.equal(state.hidden,'false','Mapa permaneceu aria-hidden');
  assert.equal(state.suppressed,'','Mapa foi suprimido por uma superfície residual');
  assert.equal(state.quick,false,'Menu rápido permaneceu aberto');
  assert.equal(state.activeId,'primordial_t','Abrir mapa alterou a fase ativa');
  assert.equal(state.pending,null,'Pending da fase anterior vazou para Trítio');
  assert.equal(state.rewardActive,false,'Reward anterior permaneceu ativo');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Branch preview map exit OK: Deutério → escolha Trítio → CONTINUAR → Menu → Mapa remains available.');
} finally {
  await context.close();await browser.close();
}
