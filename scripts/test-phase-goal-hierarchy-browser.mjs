import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];

async function openPhase(id,expectedTitle,expectedContext){
 const context=await browser.newContext({viewport:{width:360,height:800},deviceScaleFactor:1});
 await context.addInitScript(phaseId=>{
  const nativePhaseId=phaseId==='quarks'?'primordial_d':phaseId;
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify({version:14,introduced:true,activeId:nativePhaseId,completed:phaseId==='quarks'?['bigbang']:[],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}));
  localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseId:nativePhaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}));
 },id);
 const page=await context.newPage();
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_PHASE_LABELS&&document.body.classList.contains('phase-goal-hierarchy'));
 if(id==='quarks'){
  await page.waitForFunction(()=>window.ARDUA_QUARKS?.start&&window.ARDUA_QUARKS?.isActive);
  await page.evaluate(()=>window.ARDUA_QUARKS.start());
  await page.waitForFunction(()=>window.ARDUA_QUARKS.isActive()&&window.ARDUA_CAMPAIGN.getState().activeId==='quarks');
 }
 await page.waitForTimeout(900);
 const result=await page.evaluate(()=>{
  const title=document.getElementById('phaseTitle'),context=document.getElementById('branchLabel'),goal=document.getElementById('goalText'),formula=document.getElementById('formulaText');
  const ts=getComputedStyle(title),gs=getComputedStyle(goal),fs=getComputedStyle(formula);
  return{title:title.textContent.trim(),context:context.hidden?'':context.textContent.trim(),whiteSpace:ts.whiteSpace,clientWidth:title.clientWidth,scrollWidth:title.scrollWidth,goalDisplay:gs.display,formulaText:formula.textContent.trim(),formulaWeight:Number(fs.fontWeight)||0,formulaSize:parseFloat(fs.fontSize)};
 });
 try{
  assert.equal(result.title,expectedTitle,`${id}: título inesperado`);
  assert.equal(result.context,expectedContext,`${id}: contexto inesperado`);
  assert.equal(result.whiteSpace,'nowrap',`${id}: título pode quebrar linha`);
  assert.ok(result.scrollWidth<=result.clientWidth+1,`${id}: título estoura uma linha (${result.scrollWidth}>${result.clientWidth})`);
  assert.equal(result.goalDisplay,'none',`${id}: objetivo antigo continua na caixa inferior`);
  assert.ok(result.formulaText.length>0,`${id}: receita/instrução ficou vazia`);
  assert.ok(result.formulaWeight>=900,`${id}: receita/instrução não herdou o peso do objetivo`);
  assert.ok(result.formulaSize>=12,`${id}: receita/instrução ficou pequena demais`);
  assert.deepEqual(pageErrors,[],`${id}: erros JavaScript: ${pageErrors.join(' | ')}`);
 }catch(e){failures.push(e.message)}
 await context.close();
}

await openPhase('quarks','Forme Prótons e Nêutrons — 0/2','QUARKS');
await openPhase('primordial_t','Forme Trítio — 0/4','');
await openPhase('first_nebulae','Crie gás primordial — 0/4','PRIMEIRAS NEBULOSAS');
await openPhase('first_generation_formation','Reúna Hidrogênio — 2/36','PRIMEIRA GERAÇÃO');
await openPhase('he_orange','Forme Hélio-3 — 0/5','ANÃ LARANJA');
await openPhase('c','Forme Carbono — 0/5','TRIPLO-ALFA');
await openPhase('weak_s_cu','Forme Cobre — 0/4','PROCESSO-S FRACO');
await openPhase('au','Forme Ouro — 0/2','FREEZE-OUT DO PROCESSO-R');
await openPhase('decay_pa','Forme Protactínio — 0/2','CADEIA RADIOATIVA');
await openPhase('white','Forme C e O — C 0/3 · O 0/3','ANÃ BRANCA');
await openPhase('black_hole','Atraia matéria — 0/6','BURACO NEGRO');

const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.ARDUA_PHASE_LABELS&&document.getElementById('campaignMap'));
await page.waitForTimeout(1200);
await page.evaluate(()=>window.ARDUA_PHASE_LABELS?.sync?.());
await page.waitForTimeout(300);
const labels=await page.evaluate(()=>{
 const map=id=>document.querySelector(`#campaignMap .phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||'';
 const menu=id=>document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${id}"] strong`)?.textContent?.trim()||'';
 const mapNodes=[...document.querySelectorAll('#campaignMap .phase-node[data-phase]')];
 const menuButtons=[...document.querySelectorAll('#phaseMenu .phase-jump')];
 return{
  map:{t:map('primordial_t'),li:map('primordial_li'),c:map('c'),w:map('weak_s_cu'),au:map('au'),rp:map('rp_ge'),d:map('decay_pa'),bf:map('brown_formation')},
  menu:{t:menu('primordial_t'),li:menu('primordial_li'),c:menu('c'),w:menu('weak_s_cu'),au:menu('au'),d:menu('decay_pa')},
  mapEmpty:mapNodes.filter(x=>!x.querySelector('strong')?.textContent?.trim()).length,
  menuCount:menuButtons.length,menuIdCount:menuButtons.filter(x=>x.dataset.phaseId).length,
  forjar:[...mapNodes,...menuButtons].filter(x=>/\bForjar\b/i.test(x.textContent||'')).length
 };
});
try{
 assert.equal(labels.map.t,'Forme Trítio');
 assert.equal(labels.map.li,'Forme Lítio-7');
 assert.equal(labels.map.c,'Triplo-alfa: Carbono');
 assert.equal(labels.map.w,'Processo-s fraco: Cobre');
 assert.equal(labels.map.au,'Processo-r: Ouro');
 assert.equal(labels.map.rp,'rp-process: Germânio · waiting point');
 assert.equal(labels.map.d,'Protactínio · cadeia radioativa');
 assert.equal(labels.map.bf,'Formação da Anã Marrom');
 assert.equal(labels.menu.t,'Forme Trítio');
 assert.equal(labels.menu.li,'Forme Lítio-7');
 assert.equal(labels.menu.c,'Triplo-alfa: Carbono');
 assert.equal(labels.menu.w,'Forme Cobre');
 assert.equal(labels.menu.au,'Forme Ouro');
 assert.equal(labels.menu.d,'Forme Protactínio');
 assert.equal(labels.mapEmpty,0,'mapa contém fases sem título');
 assert.equal(labels.menuIdCount,labels.menuCount,'menu contém fases sem identificação canônica');
 assert.equal(labels.forjar,0,'“Forjar” permaneceu em algum título do mapa/menu');
 assert.deepEqual(errors,[],`map/menu: erros JavaScript: ${errors.join(' | ')}`);
}catch(e){failures.push(e.message)}
await context.close();
await browser.close();

if(failures.length){console.error(failures.map((x,i)=>`${i+1}. ${x}`).join('\n'));process.exit(1)}
console.log('Browser OK: Quarks real runtime + representative campaign phases use one-line objectives; recipe-only card and canonical map/menu labels pass on mobile viewports.');
