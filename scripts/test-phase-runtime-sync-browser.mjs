import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:4173/index.html?phase-runtime-sync-test=1',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__ARDUA_PHASE_SYNC_TEST&&window.ARDUA_CAMPAIGN);

const result=await page.evaluate(async()=>{
 const h=window.__ARDUA_PHASE_SYNC_TEST,C=window.ARDUA_CAMPAIGN;
 const idx=h.phaseIndexById.get('o');if(idx===undefined)throw new Error('Oxygen phase unavailable');
 h.startPhase(idx,false,false);await new Promise(r=>setTimeout(r,80));
 // Reproduce the class of race that produced the screenshot: campaign state says an old
 // sibling phase while the engine is already rendering Oxygen.
 C.setActive('fragile');window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id:'fragile',source:'browser-regression'}}));
 await new Promise(r=>setTimeout(r,80));
 h.clearBoard();const cells=h.activeCells().slice(0,8);
 const syms=['O','He','He','He3','H','H','H','H'];syms.forEach((sym,i)=>h.createPiece(sym,cells[i],false));
 h.state.created={O:1};h.state.selected=[];h.render();await new Promise(r=>setTimeout(r,120));
 const title=document.getElementById('phaseTitle')?.textContent?.trim()||'';
 const goal=document.getElementById('goalText')?.textContent?.trim()||'';
 const formula=document.getElementById('formulaText')?.textContent?.trim()||'';
 const active=C.getState?.().activeId||'';
 const engine=document.documentElement.dataset.arduaEnginePhase||'';
 const recipes=h.activeFusionRecipes().map(r=>r.out);
 const target=h.phase().target;
 return{title,goal,formula,active,engine,recipes,target,symbols:[...h.state.pieces.values()].map(p=>p.sym)};
});
console.log(JSON.stringify(result,null,2));
if(errors.length)throw new Error('Browser errors: '+errors.join(' | '));
if(result.engine!=='o')throw new Error('Engine identity drifted: '+result.engine);
if(result.active!=='o')throw new Error('Campaign activeId did not resync to Oxygen: '+result.active);
if(!result.title.includes('Oxigênio')||result.title.includes('Berílio-8'))throw new Error('Header drifted away from Oxygen: '+result.title);
if(!result.title.includes(`1/${result.target}`))throw new Error('Oxygen progress missing from header: '+result.title);
if(!result.recipes.includes('C')||!result.recipes.includes('O'))throw new Error('Oxygen phase cannot rebuild Carbon precursor: '+result.recipes.join(','));
if(result.formula.includes('Carbono + Hélio')&&result.formula.includes('Oxigênio'))throw new Error('Impossible final Oxygen recipe shown without Carbon: '+result.formula);
if(!/Berílio-8|Hélio/.test(result.formula))throw new Error('Expected executable precursor guidance, got: '+result.formula);
await browser.close();
console.log('Browser phase runtime sync regression passed.');
