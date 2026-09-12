import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  const campaign={version:14,introduced:true,activeId:'primordial_d',completed:['bigbang','primordial_he3','primordial_he3d'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
  const engine={phaseId:'primordial_d',phaseIndex:1,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]};
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
      const intro=document.getElementById('stellarIntro');intro?.classList.remove('show');intro?.setAttribute('aria-hidden','true');
      const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
      const goal=document.getElementById('goalText');if(goal&&goal.textContent!==target)goal.textContent=target;
      const end=document.getElementById('phaseEndBtn');if(end&&end.dataset.objectiveCompletionFallback!=='1'){
        if(end.textContent!=='ESPALHAR POEIRA ESTELAR')end.textContent='ESPALHAR POEIRA ESTELAR';
        end.classList.remove('show');end.removeAttribute('hidden');end.style.display='';
      }
    };
    keep();window.__mapExitKeep=setInterval(keep,40);
  });
  await page.waitForFunction(()=>document.querySelector('#phaseEndBtn[data-objective-completion-fallback="1"].show'),undefined,{timeout:5000});
  await page.evaluate(()=>{clearInterval(window.__mapExitKeep);document.getElementById('phaseEndBtn')?.click()});
  await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:7000});

  const reward=await page.evaluate(()=>({route:window.ARDUA_VICTORY_REWARD.route,completed:window.ARDUA_CAMPAIGN.getState().completed}));
  assert.equal(reward.route?.kind,'continue','Deutério deve ter continuação única no fixture');
  assert.deepEqual(reward.route?.options,['primordial_t']);
  assert.ok(reward.completed.includes('primordial_d'),'Deutério não foi persistido como concluído');

  await page.click('[data-victory-primary]');
  await page.waitForFunction(()=>!document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_CAMPAIGN.getState().activeId==='primordial_t',undefined,{timeout:5000});
  await page.waitForTimeout(180);

  const beforeMap=await page.evaluate(()=>({
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    enginePhase:document.documentElement.dataset.arduaEnginePhase||'',
    pending:window.ARDUA_VICTORY_REWARD.pending,
    rewardActive:window.ARDUA_VICTORY_REWARD.active,
    map:document.getElementById('campaignMap')?.classList.contains('show')||false
  }));
  assert.equal(beforeMap.activeId,'primordial_t');
  assert.equal(beforeMap.pending,null,'Pending da vitória vazou para Trítio');
  assert.equal(beforeMap.rewardActive,false,'Reward permaneceu ativo em Trítio');
  assert.equal(beforeMap.map,false,'Mapa apareceu como pedágio durante CONTINUAR');

  // Deliberately poison the reward map method. Menu → Mapa must be owned by campaign-map.js,
  // so this method must never be consulted after the player is already in the next phase.
  await page.evaluate(()=>{
    const real=window.ARDUA_VICTORY_REWARD;
    window.ARDUA_VICTORY_REWARD=new Proxy(real,{get(target,key,receiver){
      if(key==='openMap')return()=>{throw new Error('phase menu incorrectly depended on victoryReward.openMap')};
      return Reflect.get(target,key,receiver);
    }});
  });

  await page.click('#menuOpenBtn');
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'),undefined,{timeout:2500});
  await page.click('#phaseQuickMap');
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'),undefined,{timeout:2500});
  await page.waitForTimeout(120);

  const state=await page.evaluate(()=>({
    map:document.getElementById('campaignMap')?.classList.contains('show')||false,
    hidden:document.getElementById('campaignMap')?.getAttribute('aria-hidden'),
    suppressed:document.getElementById('campaignMap')?.dataset.arduaSurfaceSuppressed||'',
    quick:document.getElementById('phaseQuickMenu')?.classList.contains('show')||false,
    activeId:window.ARDUA_CAMPAIGN.getState().activeId,
    closeDisabled:document.getElementById('campaignClose')?.disabled||false,
    closeText:document.getElementById('campaignClose')?.textContent?.trim()||''
  }));
  assert.equal(state.map,true,'Mapa não abriu depois de Deutério → CONTINUAR → Trítio');
  assert.equal(state.hidden,'false','Mapa permaneceu aria-hidden');
  assert.equal(state.suppressed,'','Mapa foi suprimido por uma superfície residual');
  assert.equal(state.quick,false,'Menu rápido permaneceu aberto');
  assert.equal(state.activeId,'primordial_t','Abrir mapa alterou a fase ativa');
  assert.equal(state.closeDisabled,false,'Mapa permaneceu preso em modo obrigatório da fase anterior');
  assert.equal(state.closeText,'Voltar','Mapa não foi reaberto pelo owner canônico');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Map exit regression OK: Deutério → CONTINUAR → Trítio → Menu → Mapa is independent of victory reward state.');
} finally {
  await context.close();await browser.close();
}
