import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
 localStorage.setItem('arduaCampaignGraphV1',JSON.stringify({version:14,introduced:true,activeId:'primordial_d',completed:['bigbang'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}));
 localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseId:'primordial_d',phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}));
 localStorage.setItem('arduaRotationEnabledV2','1');
 window.__ARDUA_E2E={events:[]};window.__ARDUA_P1_E2E=true;Math.random=()=>.5;
 window.addEventListener('ardua:victory-reward-state',e=>window.__ARDUA_E2E.events.push({type:'reward',detail:e.detail}));
 window.addEventListener('ardua:phase-completion-state',e=>window.__ARDUA_E2E.events.push({type:'completion',detail:e.detail}));
});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

async function makeBaryonByDrag(sourceSelector,targetSelector){
 const source=page.locator(sourceSelector).first(),target=page.locator(targetSelector).first(),sb=await source.boundingBox(),tb=await target.boundingBox();
 assert.ok(sb&&tb,`Quarks drag: geometria ausente para ${sourceSelector} → ${targetSelector}`);
 const sx=sb.x+sb.width/2,sy=sb.y+sb.height/2,tx=tb.x+tb.width/2,ty=tb.y+tb.height/2;
 await page.mouse.move(sx,sy);await page.mouse.down();
 await page.mouse.move(sx+(tx-sx)*.22,sy+(ty-sy)*.22,{steps:3});
 await page.waitForFunction(()=>!!document.querySelector('.quark-piece.dragging'),undefined,{timeout:1200});
 const tb2=await target.boundingBox();assert.ok(tb2,'Quarks drag: alvo desapareceu durante o gesto');
 await page.mouse.move(tb2.x+tb2.width/2,tb2.y+tb2.height/2,{steps:5});
 await page.waitForFunction(()=>document.querySelectorAll('.quark-piece.drag-target').length===2,undefined,{timeout:1200});
 await page.mouse.up();
}

try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_QUARKS?.start&&window.ARDUA_VICTORY_REWARD&&window.ARDUA_PHASE_COMPLETION);
 await page.evaluate(()=>window.ARDUA_QUARKS.start());
 await page.waitForFunction(()=>window.ARDUA_QUARKS.isActive()&&document.querySelectorAll('.quark-piece').length===6);
 await page.waitForFunction(()=>document.getElementById('stageProgressLabel')?.textContent==='0 de 2'&&document.getElementById('stageProgressText')?.textContent==='0%'&&document.getElementById('formulaText')?.querySelector('.recipe-symbol-line')?.textContent==='junte três particulas',undefined,{timeout:2500});

 const chrome=await page.evaluate(()=>{
  const formula=document.getElementById('formulaText'),progress=document.querySelector('.stage-progress'),bar=document.getElementById('stageProgress'),style=progress?getComputedStyle(progress):null;
  return{
   name:formula?.querySelector('.recipe-name-line')?.textContent||'',
   symbol:formula?.querySelector('.recipe-symbol-line')?.textContent||'',
   progressVisible:!!progress&&!progress.hidden&&style?.visibility!=='hidden'&&style?.display!=='none',
   progressLabel:document.getElementById('stageProgressLabel')?.textContent||'',
   progressText:document.getElementById('stageProgressText')?.textContent||'',
   progressWidth:bar?.style.width||'',
   progressVisualWidth:bar?getComputedStyle(bar).width:'',
   goal:document.getElementById('goalText')?.textContent||'',
   title:document.getElementById('phaseTitle')?.textContent||''
  };
 });
 assert.equal(chrome.name,'quark + quark + quark → hádron','Quarks: primeira linha compacta da receita ausente');
 assert.equal(chrome.symbol,'junte três particulas','Quarks: instrução compacta da segunda linha ausente');
 assert.equal(chrome.progressVisible,true,'Quarks: barra de progresso continua oculta');
 assert.equal(chrome.progressLabel,'0 de 2','Quarks: meta inicial deveria ficar no início da barra');
 assert.equal(chrome.progressText,'0%','Quarks: porcentagem inicial deveria ficar no fim da barra');
 assert.equal(chrome.progressWidth,'0%','Quarks: valor lógico inicial deveria continuar em 0%');
 assert.ok(parseFloat(chrome.progressVisualWidth)>=8,'Quarks: barra em 0% deveria manter preenchimento visual mínimo');
 assert.equal(chrome.goal,'Forme Prótons e Nêutrons','Quarks: objetivo não deveria repetir a meta numérica');
 assert.equal(chrome.title,'Quarks','Quarks: título interno deve repetir exatamente o título canônico do mapa');

 if(await page.locator('#stellarIntro').evaluate(el=>el.classList.contains('show'))){
  await page.locator('#stellarStartBtn').click({force:true});
  await page.waitForFunction(()=>!document.getElementById('stellarIntro')?.classList.contains('show'),undefined,{timeout:2500});
 }
 await page.locator('#menuOpenBtn').click();
 await page.waitForFunction(()=>document.getElementById('phaseQuickMenu')?.classList.contains('show'));
 const rotation=await page.locator('#phaseQuickRotation').evaluate(el=>({text:el.querySelector('span')?.textContent||'',visible:getComputedStyle(el).display!=='none'}));
 assert.equal(rotation.visible,true,'Quarks: controle de Rotação ausente do menu da fase');
 assert.equal(rotation.text,'Desligar Rotação','Quarks: controle deveria refletir Rotação ativa');
 await page.locator('.phase-quick-close').click();

 await makeBaryonByDrag('.quark-piece.quark-d','.quark-piece.quark-u');
 await page.waitForFunction(()=>document.getElementById('stageProgressLabel')?.textContent==='1 de 2'&&document.getElementById('stageProgressText')?.textContent==='50%',undefined,{timeout:3000});
 const halfway=await page.evaluate(()=>({label:document.getElementById('stageProgressLabel')?.textContent||'',text:document.getElementById('stageProgressText')?.textContent||'',width:document.getElementById('stageProgress')?.style.width||''}));
 assert.equal(halfway.label,'1 de 2','Quarks: meta intermediária deveria ficar no início da barra');
 assert.equal(halfway.text,'50%','Quarks: porcentagem intermediária deveria ficar no fim da barra');
 assert.equal(halfway.width,'50%','Quarks: barra intermediária deveria estar em 50%');
 await makeBaryonByDrag('.quark-piece.quark-u','.quark-piece.quark-d');
 await page.waitForFunction(()=>document.getElementById('stageProgressLabel')?.textContent==='2 de 2'&&document.getElementById('stageProgressText')?.textContent==='100%',undefined,{timeout:3000});
 await page.waitForFunction(()=>window.ARDUA_VICTORY_REWARD.pending?.phaseId==='quarks'||document.documentElement.dataset.arduaCompletionState==='celebrating',undefined,{timeout:1200});
 await page.waitForFunction(()=>!document.getElementById('discoveryUnlockModal')?.classList.contains('show'),undefined,{timeout:1200});

 const handoff=await page.evaluate(()=>{
  const end=document.getElementById('phaseEndBtn'),style=end?getComputedStyle(end):null,modal=document.getElementById('discoveryUnlockModal');
  return{
   endPlayerVisible:!!end?.classList.contains('show')&&style?.visibility!=='hidden'&&style?.display!=='none'&&Number(style?.opacity||1)>0,
   endAriaHidden:end?.getAttribute('aria-hidden'),
   modalVisible:!!modal?.classList.contains('show'),
   pending:window.ARDUA_VICTORY_REWARD.pending?.phaseId||'',
   state:document.documentElement.dataset.arduaCompletionState||''
  };
 });
 assert.equal(handoff.endPlayerVisible,false,'Quarks: o botão redondo “Próxima fase” voltou a competir com a conclusão');
 assert.equal(handoff.modalVisible,false,'Quarks: modal de descoberta ficou sobreposto ao handoff de vitória');

 await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show'),undefined,{timeout:6500});
 const reward=await page.evaluate(()=>({
  headline:document.querySelector('[data-victory-result]')?.textContent||'',
  discoveryHidden:document.querySelector('[data-victory-discovery]')?.hidden,
  discovery:document.querySelector('[data-victory-discovery] strong')?.textContent||'',
  primary:document.querySelector('[data-victory-primary]')?.textContent||'',
  route:window.ARDUA_VICTORY_REWARD.route,
  modalVisible:document.getElementById('discoveryUnlockModal')?.classList.contains('show')||false,
  endVisible:document.getElementById('phaseEndBtn')?.classList.contains('show')||false,
  saved:window.ARDUA_CAMPAIGN.getState()
 }));
 assert.equal(reward.headline,'Prótons e nêutrons tomaram forma','Quarks: reward P1.5 perdeu o marco científico');
 assert.equal(reward.discoveryHidden,false,'Quarks: descobertas não foram incorporadas à recompensa');
 assert.ok(reward.discovery.length>0,'Quarks: recompensa não nomeou a descoberta incorporada');
 assert.equal(reward.primary,'CONTINUAR','Quarks: CTA único pós-vitória deve ser CONTINUAR');
 assert.equal(reward.route?.kind,'continue','Quarks: conclusão deveria continuar linearmente');
 assert.deepEqual(reward.route?.options,['primordial_d'],'Quarks: próxima fase canônica deveria ser Deutério primordial');
 assert.equal(reward.modalVisible,false,'Quarks: modal de descoberta reapareceu sobre a recompensa');
 assert.equal(reward.endVisible,false,'Quarks: botão redondo reapareceu sobre a recompensa');
 assert.ok(reward.saved.completed.includes('quarks'),'Quarks: conclusão não foi persistida antes da recompensa');

 await page.click('[data-victory-primary]');
 await page.waitForFunction(()=>!document.getElementById('campaignVictoryReward')?.classList.contains('show')&&window.ARDUA_CAMPAIGN.getState().activeId==='primordial_d',undefined,{timeout:4000});
 assert.deepEqual(errors,[],`Quarks mobile completion: erros JS: ${errors.join(' | ')}`);
 console.log('Quarks mobile completion OK: shared 0–100% progress UI, counter-free title, automatic completion and one CONTINUAR action passed.');
}finally{
 await context.close();await browser.close();
}
