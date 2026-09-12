import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  const campaign={version:14,introduced:true,activeId:'primordial_d',completed:['bigbang','primordial_he3','primordial_he3d'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
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
      const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
      const goal=document.getElementById('goalText');if(goal&&goal.textContent!==target)goal.textContent=target;
      const end=document.getElementById('phaseEndBtn');if(end&&end.dataset.objectiveCompletionFallback!=='1'){end.classList.remove('show');end.removeAttribute('hidden');end.style.display='';}
    };
    keep();window.__mapExitKeep=setInterval(keep,40);
  });
  await page.waitForFunction(()=>document.querySelector('#phaseEndBtn[data-objective-completion-fallback="1"].show'),undefined,{timeout:5000});
  await page.evaluate(()=>clearInterval(window.__mapExitKeep));
  await page.click('#phaseEndBtn');
  await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:7000});
  const reward=await page.evaluate(()=>({route:window.ARDUA_VICTORY_REWARD.route,completed:window.ARDUA_CAMPAIGN.getState().completed}));
  assert.equal(reward.route?.kind,'continue','Deutério deve ter uma continuação única no fixture');
  assert.deepEqual(reward.route?.options,['primordial_t']);
  assert.ok(reward.completed.includes('primordial_d'),'Deutério não foi persistido como concluído');
  await page.click('[data-victory-primary]');
  await page.waitForFunction(()=>!document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_CAMPAIGN.getState().activeId==='primordial_t',undefined,{timeout:5000});
  await page.waitForTimeout(100);
  await page.click('#menuOpenBtn');
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'),undefined,{timeout:2500});
  await page.click('#phaseQuickMap');
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'),undefined,{timeout:2500});
  const state=await page.evaluate(()=>({
    map:document.getElementById('campaignMap')?.classList.contains('show'),
    hidden:document.getElementById('campaignMap')?.getAttribute('aria-hidden'),
    quick:document.getElementById('phaseQuickMenu')?.classList.contains('show'),
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    rewardPending:!!window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    surface:document.documentElement.dataset.arduaSurface||''
  }));
  assert.equal(state.map,true,'Mapa não abriu depois de Deutério → Continuar → Trítio');
  assert.equal(state.hidden,'false','Mapa permaneceu aria-hidden');
  assert.equal(state.quick,false,'Menu rápido permaneceu aberto');
  assert.equal(state.activeId,'primordial_t','Abrir mapa alterou a fase ativa');
  assert.equal(state.rewardPending,false,'Estado pending da vitória vazou para a fase seguinte');
  assert.equal(state.rewardActive,false,'Reward permaneceu ativo na fase seguinte');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Map exit regression OK: Deutério → CONTINUAR → Trítio → Menu → Mapa remains an escape route.');
} finally {
  await context.close();await browser.close();
}
