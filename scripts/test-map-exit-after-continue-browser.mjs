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

async function dismissBlockingTeaching(){
  for(let i=0;i<10;i++){
    const handled=await page.evaluate(()=>{
      const intro=document.getElementById('stellarIntro');
      if(intro?.classList.contains('show')){document.getElementById('stellarStartBtn')?.click();return true}
      const discovery=document.getElementById('discoveryUnlockModal');
      if(discovery?.classList.contains('show')){document.getElementById('discoveryUnlockContinue')?.click();return true}
      const tip=document.getElementById('eventTooltip');
      if(tip?.classList.contains('show')){document.getElementById('eventTooltipBtn')?.click();return true}
      const ambient=document.getElementById('ambientBanner');
      const ambientBtn=document.getElementById('ambientContinueBtn');
      if(ambient?.classList.contains('show')&&!ambientBtn?.hidden){ambientBtn.click();return true}
      return false;
    });
    if(!handled)break;
    await page.waitForTimeout(90);
  }
}

async function clickFirst(selector){
  await page.locator(selector).first().evaluate(el=>el.click());
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ARDUA_VICTORY_REWARD&&window.ARDUA_PHASE_COMPLETION&&window.ARDUA_CAMPAIGN);
  await page.waitForFunction(()=>document.documentElement.dataset.arduaEnginePhase==='primordial_d');
  await page.waitForTimeout(250);
  await dismissBlockingTeaching();
  await page.evaluate(()=>{
    const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
  });
  await page.waitForFunction(()=>document.querySelectorAll('#primordialLayer .primordial-particle.proton').length>=1&&document.querySelectorAll('#primordialLayer .primordial-particle.neutronfree').length>=1);

  for(let made=1;made<=4;made++){
    await dismissBlockingTeaching();
    await clickFirst('#primordialLayer .primordial-particle.proton:not(.reacting)');
    await page.waitForFunction(()=>!!document.querySelector('#primordialLayer .primordial-particle.neutronfree.candidate'),undefined,{timeout:2500});
    await clickFirst('#primordialLayer .primordial-particle.neutronfree.candidate');
    await page.waitForFunction(target=>document.getElementById('goalText')?.textContent.includes(`${target}/4`),made,{timeout:4000});
    await dismissBlockingTeaching();
  }

  await page.waitForFunction(()=>{
    const b=document.getElementById('phaseEndBtn');
    return b?.classList.contains('show')&&b.dataset.objectiveCompletionFallback!=='1';
  },undefined,{timeout:4000});
  const beforeEnd=await page.evaluate(()=>({goal:document.getElementById('goalText')?.textContent||'',label:document.getElementById('phaseEndBtn')?.textContent||'',fallback:document.getElementById('phaseEndBtn')?.dataset.objectiveCompletionFallback||''}));
  assert.match(beforeEnd.goal,/4\/4/,'Deutério não chegou a 4/4 por interação real');
  assert.equal(beforeEnd.fallback,'','O teste deve usar o botão nativo, não o fallback P0');

  await page.click('#phaseEndBtn');
  await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:7000});
  const reward=await page.evaluate(()=>({route:window.ARDUA_VICTORY_REWARD.route,completed:window.ARDUA_CAMPAIGN.getState().completed,pending:window.ARDUA_VICTORY_REWARD.pending}));
  assert.equal(reward.route?.kind,'continue','Deutério deve oferecer CONTINUAR no runtime real');
  assert.deepEqual(reward.route?.options,['primordial_t']);
  assert.ok(reward.completed.includes('primordial_d'),'Deutério não foi persistido como concluído');

  await page.click('[data-victory-primary]');
  await page.waitForFunction(()=>!document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_CAMPAIGN.getState().activeId==='primordial_t',undefined,{timeout:5000});
  await page.waitForTimeout(250);
  const beforeMap=await page.evaluate(()=>({
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    enginePhase:document.documentElement.dataset.arduaEnginePhase||'',
    pending:window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    preview:document.getElementById('campaignPhasePreview')?.classList.contains('show')||false,
    intro:document.getElementById('stellarIntro')?.classList.contains('show')||false,
    surface:document.documentElement.dataset.arduaSurface||'',
    appInert:document.querySelector('.app')?.inert||false
  }));

  await page.click('#menuOpenBtn');
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'),undefined,{timeout:2500});
  await page.click('#phaseQuickMap');
  await page.waitForTimeout(450);
  const state=await page.evaluate(()=>({
    map:document.getElementById('campaignMap')?.classList.contains('show')||false,
    hidden:document.getElementById('campaignMap')?.getAttribute('aria-hidden'),
    suppressed:document.getElementById('campaignMap')?.dataset.arduaSurfaceSuppressed||'',
    background:document.getElementById('campaignMap')?.dataset.arduaSurfaceBackground||'',
    quick:document.getElementById('phaseQuickMenu')?.classList.contains('show')||false,
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    pending:window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    surface:document.documentElement.dataset.arduaSurface||''
  }));
  assert.equal(state.map,true,`Mapa não abriu depois de Deutério → CONTINUAR → Trítio. before=${JSON.stringify(beforeMap)} after=${JSON.stringify(state)}`);
  assert.equal(state.hidden,'false','Mapa permaneceu aria-hidden');
  assert.equal(state.suppressed,'','Mapa foi suprimido por uma superfície residual');
  assert.equal(state.quick,false,'Menu rápido permaneceu aberto');
  assert.equal(state.activeId,'primordial_t','Abrir mapa alterou a fase ativa');
  assert.equal(state.pending,null,'Estado pending da vitória vazou para Trítio');
  assert.equal(state.rewardActive,false,'Reward permaneceu ativo na fase seguinte');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Native Map exit regression OK: real Deutério 4/4 → CONTINUAR → Trítio → Menu → Mapa remains an escape route.');
} finally {
  await context.close();await browser.close();
}
