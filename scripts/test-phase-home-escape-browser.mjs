import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  const campaign={version:14,introduced:true,activeId:'primordial_t',completed:['bigbang','primordial_d'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
  const engine={phaseId:'primordial_t',phaseIndex:1,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]};
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
  window.__ARDUA_E2E={};window.__ARDUA_P1_E2E=true;Math.random=()=>.5;
});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

async function dismissBlockingSurface(){
  await page.waitForTimeout(220);
  for(let i=0;i<10;i++){
    const handled=await page.evaluate(()=>{
      const discovery=document.getElementById('discoveryUnlockModal');
      if(discovery?.classList.contains('show')){document.getElementById('discoveryUnlockContinue')?.click();return true}
      const intro=document.getElementById('stellarIntro');
      if(intro?.classList.contains('show')){document.getElementById('stellarStartBtn')?.click();return true}
      const tip=document.getElementById('eventTooltip');
      if(tip?.classList.contains('show')){document.getElementById('eventTooltipBtn')?.click();return true}
      return false;
    });
    if(!handled)break;
    await page.waitForTimeout(90);
  }
}

async function exposeSeededPhaseForFixture(){
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show'));
  // Test-only normalization: the saved campaign already owns Trítio. Hide the boot map so
  // the regression exercises only the independent phase-menu escape, not map animations.
  await page.evaluate(()=>{
    const map=document.getElementById('campaignMap');
    map?.classList.remove('show');map?.setAttribute('aria-hidden','true');
    document.body.classList.remove('campaign-map-open');
    document.getElementById('mapDetail')?.classList.remove('show');
  });
  await dismissBlockingSurface();
  await page.waitForFunction(()=>{
    const map=document.getElementById('campaignMap'),quick=document.getElementById('phaseQuickMenu');
    return !map?.classList.contains('show')&&!quick?.classList.contains('show')&&window.ARDUA_CAMPAIGN?.getState?.().activeId==='primordial_t';
  });
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('phaseQuickHome')&&window.ARDUA_CAMPAIGN);
  await exposeSeededPhaseForFixture();

  const beforeMenu=await page.evaluate(()=>({
    activeId:window.ARDUA_CAMPAIGN?.getState?.().activeId||'',
    mapOpen:document.getElementById('campaignMap')?.classList.contains('show')||false,
    homeExists:!!document.getElementById('phaseQuickHome')
  }));
  assert.deepEqual(beforeMenu,{activeId:'primordial_t',mapOpen:false,homeExists:true},'Fixture deve estar dentro de Trítio antes de testar Início');

  await page.click('#menuOpenBtn');
  await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'));

  const order=await page.evaluate(()=>{
    const home=document.getElementById('phaseQuickHome'),map=document.getElementById('phaseQuickMap');
    return{home:!!home,map:!!map,above:home?.nextElementSibling===map};
  });
  assert.deepEqual(order,{home:true,map:true,above:true},'Início deve existir imediatamente acima de Mapa com ID independente');

  await Promise.all([
    page.waitForNavigation({waitUntil:'domcontentloaded'}),
    page.click('#phaseQuickHome')
  ]);
  await page.waitForFunction(()=>document.getElementById('campaignMap')?.classList.contains('show')&&document.getElementById('campaignMap')?.getAttribute('aria-hidden')==='false');
  await page.waitForFunction(()=>!new URL(window.location.href).searchParams.has('arduaHome'));

  const state=await page.evaluate(()=>({
    activeId:window.ARDUA_CAMPAIGN?.getState?.().activeId||'',
    map:document.getElementById('campaignMap')?.classList.contains('show')||false,
    homeExists:!!document.getElementById('phaseQuickHome'),
    quickOpen:document.getElementById('phaseQuickMenu')?.classList.contains('show')||false,
    rewardOpen:document.getElementById('campaignVictoryReward')?.classList.contains('show')||false,
    previewOpen:document.getElementById('campaignPhasePreview')?.classList.contains('show')||false
  }));
  assert.equal(state.activeId,'primordial_t','A saída para Início deve preservar o progresso e a fase ativa');
  assert.equal(state.map,true,'Início deve retornar à entrada nativa da campanha após navegação completa');
  assert.equal(state.homeExists,true,'O botão independente deve continuar disponível após a recarga');
  assert.equal(state.quickOpen,false,'O menu rápido não pode reaparecer sobre a entrada da campanha');
  assert.equal(state.rewardOpen,false,'Reward residual não pode cobrir a entrada da campanha');
  assert.equal(state.previewOpen,false,'Preview residual não pode cobrir a entrada da campanha');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Independent Home escape OK: phaseQuickHome hard-navigates to the native campaign entry, preserves progress and stays independent from the legacy Map action.');
} finally {
  await context.close();await browser.close();
}
