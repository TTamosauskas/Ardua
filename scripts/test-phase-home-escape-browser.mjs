import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  const campaign={version:14,introduced:true,activeId:'primordial_t',completed:['bigbang','primordial_d'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
  const engine={phaseId:'primordial_t',phaseIndex:1,version:'10.80',discovered:['D'],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]};
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
  window.__ARDUA_E2E={};window.__ARDUA_P1_E2E=true;Math.random=()=>.5;
});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

async function dismissIntro(){
  await page.waitForTimeout(220);
  await page.evaluate(()=>{
    const intro=document.getElementById('stellarIntro');
    if(intro?.classList.contains('show'))document.getElementById('stellarStartBtn')?.click();
  });
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('phaseQuickHome')&&window.ARDUA_CAMPAIGN);
  await dismissIntro();
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
    closeDisabled:document.getElementById('campaignClose')?.disabled||false,
    closeText:document.getElementById('campaignClose')?.textContent?.trim()||'',
    homeExists:!!document.getElementById('phaseQuickHome'),
    quickOpen:document.getElementById('phaseQuickMenu')?.classList.contains('show')||false,
    rewardOpen:document.getElementById('campaignVictoryReward')?.classList.contains('show')||false,
    previewOpen:document.getElementById('campaignPhasePreview')?.classList.contains('show')||false
  }));
  assert.equal(state.activeId,'primordial_t','A saída para Início deve preservar o progresso e a fase ativa');
  assert.equal(state.map,true,'Início deve abrir a home da campanha após navegação completa');
  assert.equal(state.closeDisabled,false,'A home aberta pelo escape não pode ficar em modo obrigatório');
  assert.equal(state.closeText,'Voltar','A home deve permitir retorno à fase');
  assert.equal(state.homeExists,true,'O botão independente deve continuar disponível após a recarga');
  assert.equal(state.quickOpen,false,'O menu rápido não pode reaparecer sobre a home');
  assert.equal(state.rewardOpen,false,'Reward residual não pode cobrir a home');
  assert.equal(state.previewOpen,false,'Preview residual não pode cobrir a home');
  assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
  console.log('Independent Home escape OK: phaseQuickHome hard-navigates to campaign home, preserves progress and stays independent from the legacy Map action.');
} finally {
  await context.close();await browser.close();
}
