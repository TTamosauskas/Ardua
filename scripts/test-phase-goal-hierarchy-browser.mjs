import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];

async function openPhase(id,expectedTitle,expectedContext,expectedRecipe=null,expectedFormation=null){
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
 await page.waitForFunction(({id,context})=>{const active=id==='quarks'?'quarks':document.documentElement.dataset.arduaEnginePhase||window.ARDUA_CAMPAIGN?.getState?.().activeId||id,phaseTitle=document.getElementById('phaseTitle')?.textContent?.trim()||'',mapTitle=document.querySelector(`#campaignMap .phase-node[data-phase="${active}"] strong`)?.textContent?.trim()||window.ARDUA_PHASE_LABELS?.canonicalMapTitle?.(active,'')||'',branch=document.getElementById('branchLabel'),branchText=branch?.hidden?'':(branch?.textContent?.trim()||'');return !!phaseTitle&&!!mapTitle&&phaseTitle===mapTitle&&branchText===context},{id,context:expectedContext},{timeout:5000});
 const result=await page.evaluate(()=>{
  window.ARDUA_PHASE_LABELS?.sync?.();
  const title=document.getElementById('phaseTitle'),context=document.getElementById('branchLabel'),goal=document.getElementById('goalText'),formula=document.getElementById('formulaText');
  const ts=getComputedStyle(title),gs=getComputedStyle(goal),fs=getComputedStyle(formula);
  const nameLine=formula.querySelector('.recipe-name-line'),symbolLine=formula.querySelector('.recipe-symbol-line');
  const ns=nameLine?getComputedStyle(nameLine):null,ss=symbolLine?getComputedStyle(symbolLine):null;
  const formationAtoms=[...document.querySelectorAll('.stellar-formation-layer .formation-atom')],formationFields=document.querySelectorAll('.stellar-formation-layer .formation-g-field').length;
  const activeId=window.ARDUA_QUARKS?.isActive?.()?'quarks':document.documentElement.dataset.arduaEnginePhase||window.ARDUA_CAMPAIGN?.getState?.().activeId||'';
  const mapTitle=document.querySelector(`#campaignMap .phase-node[data-phase="${activeId}"] strong`)?.textContent?.trim()||window.ARDUA_PHASE_LABELS?.canonicalMapTitle?.(activeId,'')||'';
  return{title:title.textContent.trim(),mapTitle,context:context.hidden?'':context.textContent.trim(),whiteSpace:ts.whiteSpace,clientWidth:title.clientWidth,scrollWidth:title.scrollWidth,goalDisplay:gs.display,progressText:document.getElementById('stageProgressText')?.textContent?.trim()||'',formulaText:formula.textContent.trim(),formulaWeight:Number(fs.fontWeight)||0,formulaSize:parseFloat(fs.fontSize),recipeName:nameLine?.textContent?.trim()||'',recipeSymbols:symbolLine?.textContent?.trim()||'',recipeNameSize:ns?parseFloat(ns.fontSize):0,recipeSymbolSize:ss?parseFloat(ss.fontSize):0,recipeSymbolWeight:ss?(Number(ss.fontWeight)||0):0,formationAtoms:formationAtoms.length,formationFields,formationAtomSize:formationAtoms[0]?parseFloat(getComputedStyle(formationAtoms[0]).width):0};
 });
 try{
  assert.equal(result.title,expectedTitle,`${id}: título inesperado`);
  assert.equal(result.title,result.mapTitle,`${id}: título interno diverge do título canônico do mapa`);
  assert.equal(result.context,expectedContext,`${id}: contexto inesperado`);
  assert.equal(result.whiteSpace,'nowrap',`${id}: título pode quebrar linha`);
  assert.ok(result.scrollWidth<=result.clientWidth+1,`${id}: título estoura uma linha (${result.scrollWidth}>${result.clientWidth})`);
  assert.equal(result.goalDisplay,'none',`${id}: objetivo antigo continua na caixa inferior`);
  assert.equal(/\b\d+\/\d+\b/.test(result.title),false,`${id}: contador ainda aparece no título`);
  if(id!=='bigbang')assert.ok(result.progressText.includes('%'),`${id}: barra deixou de exibir porcentagem`);
  assert.ok(result.formulaText.length>0,`${id}: receita/instrução ficou vazia`);
  assert.ok(result.formulaWeight>=900,`${id}: receita/instrução não herdou o peso do objetivo`);
  assert.ok(result.formulaSize>=12,`${id}: receita/instrução ficou pequena demais`);
  if(expectedRecipe){
   assert.equal(result.recipeName,expectedRecipe.name,`${id}: linha nominal da receita incorreta`);
   assert.equal(result.recipeSymbols,expectedRecipe.symbols,`${id}: linha simbólica da receita incorreta`);
   assert.equal(result.recipeNameSize,14,`${id}: linha nominal deve usar 14px`);
   assert.equal(result.recipeSymbolSize,14,`${id}: linha simbólica deve usar 14px`);
   assert.ok(result.recipeSymbolWeight<=500,`${id}: linha simbólica não pode ficar em negrito`);
  }
  if(expectedFormation){
   assert.equal(result.formationAtoms,expectedFormation.atoms,`${id}: quantidade inicial de átomos da formação incorreta`);
   assert.equal(result.formationFields,expectedFormation.groups,`${id}: quantidade inicial de grupos da formação incorreta`);
   assert.ok(result.formationAtomSize<=expectedFormation.maxAtomSize,`${id}: átomos da formação continuam grandes demais (${result.formationAtomSize}px)`);
  }
  assert.deepEqual(pageErrors,[],`${id}: erros JavaScript: ${pageErrors.join(' | ')}`);
 }catch(e){failures.push(e.message)}
 await context.close();
}

await openPhase('quarks','Quarks','QUARKS');
await openPhase('primordial_d','Forme Deutério','',{name:'Próton + Nêutron → Deutério',symbols:'(+) + (n) → ²H'});
await openPhase('primordial_t','Forme Trítio','',{name:'Deutério + Nêutron → Trítio',symbols:'²H + (n) → ³H'});
await openPhase('atomic_h','Forme átomos de Hidrogênio','',{name:'Próton + Elétron → Hidrogênio',symbols:'(+) + (-) → H'});
await openPhase('first_nebulae','Primeiras Nebulosas','PRIMEIRAS NEBULOSAS');
await openPhase('first_generation_formation','Primeira Geração Estelar','PRIMEIRA GERAÇÃO',null,{atoms:8,groups:4,maxAtomSize:32});
await openPhase('he_orange','Anã laranja','ANÃ LARANJA');
await openPhase('c','Triplo-alfa: Carbono','TRIPLO-ALFA');
await openPhase('weak_s_cu','Processo-s fraco: Cobre','PROCESSO-S FRACO');
await openPhase('au','Processo-r: Ouro','FREEZE-OUT DO PROCESSO-R');
await openPhase('decay_pa','Protactínio · cadeia radioativa','CADEIA RADIOATIVA');
await openPhase('white','Anã branca','ANÃ BRANCA');
await openPhase('black_hole','Buraco negro','BURACO NEGRO');

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
console.log('Browser OK: representative phases reuse the canonical map title inside gameplay; recipe/progress and map/menu labels remain consistent on mobile viewports.');
