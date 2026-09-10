import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];

async function openPhase(id,expectedTitle,expectedContext){
 const context=await browser.newContext({viewport:{width:360,height:800},deviceScaleFactor:1});
 await context.addInitScript(phaseId=>{
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify({version:14,introduced:true,activeId:phaseId,completed:[],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}));
  localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}));
 },id);
 const page=await context.newPage();
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_PHASE_LABELS&&document.body.classList.contains('phase-goal-hierarchy'));
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
const diagnostic=await page.evaluate(()=>({
 runtimeLength:window.ARDUA_CAMPAIGN_GRAPH?.runtimeOrder?.length||0,
 mapCount:document.querySelectorAll('#campaignMap .phase-node').length,
 tritiumMapCount:document.querySelectorAll('#campaignMap .phase-node[data-phase="primordial_t"]').length,
 phaseMenuCount:document.querySelectorAll('#phaseMenu .phase-jump').length,
 phaseMenuIdCount:document.querySelectorAll('#phaseMenu .phase-jump[data-phase-id]').length,
 tritiumMenuCount:document.querySelectorAll('#phaseMenu .phase-jump[data-phase-id="primordial_t"]').length,
 existingMenuIds:[...document.querySelectorAll('#phaseMenu .phase-jump')].map((x,i)=>[i,x.dataset.phaseId||'']).filter(x=>x[1]).slice(0,12),
 firstMapIds:[...document.querySelectorAll('#campaignMap .phase-node[data-phase]')].slice(0,8).map(x=>[x.dataset.phase,x.textContent.trim()]),
 firstMenu:[...document.querySelectorAll('#phaseMenu .phase-jump')].slice(0,8).map(x=>[x.dataset.phaseId||'',x.querySelector('strong')?.textContent?.trim()||'']),
 directMapName:window.ARDUA_PHASE_LABELS.mapName('primordial_t','Forme Trítio'),
 directMenuName:window.ARDUA_PHASE_LABELS.menuName('primordial_t','Forme Trítio')
}));
console.log('PHASE_LABEL_DIAGNOSTIC '+JSON.stringify(diagnostic));
await page.evaluate(()=>window.ARDUA_PHASE_LABELS?.sync?.());
await page.waitForTimeout(300);
const labels=await page.evaluate(()=>{
 const map=id=>document.querySelector(`#campaignMap .phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||'';
 const menu=id=>document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${id}"] strong`)?.textContent?.trim()||'';
 return{map:{t:map('primordial_t'),c:map('c'),w:map('weak_s_cu'),au:map('au'),rp:map('rp_ge'),d:map('decay_pa'),bf:map('brown_formation')},menu:{t:menu('primordial_t'),c:menu('c'),w:menu('weak_s_cu'),au:menu('au'),d:menu('decay_pa')}};
});
try{
 assert.equal(labels.map.t,'Forme Trítio');
 assert.equal(labels.map.c,'Triplo-alfa: Carbono');
 assert.equal(labels.map.w,'Processo-s fraco: Cobre');
 assert.equal(labels.map.au,'Processo-r: Ouro');
 assert.equal(labels.map.rp,'rp-process: Germânio · waiting point');
 assert.equal(labels.map.d,'Protactínio · cadeia radioativa');
 assert.equal(labels.map.bf,'Formação da Anã Marrom');
 assert.equal(labels.menu.t,'Forme Trítio');
 assert.equal(labels.menu.c,'Triplo-alfa: Carbono');
 assert.equal(labels.menu.w,'Forme Cobre');
 assert.equal(labels.menu.au,'Forme Ouro');
 assert.equal(labels.menu.d,'Forme Protactínio');
 assert.deepEqual(errors,[],`map/menu: erros JavaScript: ${errors.join(' | ')}`);
}catch(e){failures.push(e.message)}
await context.close();
await browser.close();

if(failures.length){console.error(failures.map((x,i)=>`${i+1}. ${x}`).join('\n'));process.exit(1)}
console.log('Browser OK: one-line phase goals, contextual identities, recipe-only card, map/menu labels on mobile viewports.');
