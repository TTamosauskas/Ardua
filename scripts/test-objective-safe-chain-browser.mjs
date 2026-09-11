import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto('http://127.0.0.1:4173/?objective-safe-chain-test=1',{waitUntil:'networkidle'});
await page.waitForFunction(()=>!!window.__ARDUA_CHAIN_TEST);
const result=await page.evaluate(()=>{
 const T=window.__ARDUA_CHAIN_TEST;
 const setPhase=id=>{
   const idx=T.phaseIndexById.get(id);if(!Number.isInteger(idx))throw new Error('phase missing: '+id);
   T.state.phaseIndex=idx;T.state.phaseDone=false;T.state.readyToAdvance=false;T.state.locked=false;T.state.selected=[];T.state.chainAutoContext=null;T.clearBoard();
 };
 const setup=(id,syms)=>{
   setPhase(id);const active=new Set(T.activeCells());
   const center=[...active].find(c=>(T.neigh[c]||[]).filter(n=>active.has(n)).length>=syms.length-1);
   if(center===undefined)throw new Error('no center for '+id);
   const cells=[center,...(T.neigh[center]||[]).filter(n=>active.has(n)).slice(0,syms.length-1)];
   const pieces=syms.map((sym,i)=>T.createPiece(sym,cells[i],false));
   return pieces;
 };
 const choose=(id,syms)=>{const pieces=setup(id,syms),c=T.autoFusionCandidate(pieces[0]);return c?.r?.out||null};
 const checks={};
 checks.fragileDiversion=choose('fragile',['He','He3']);
 checks.fragileGoal=choose('fragile',['He','He','He3']);
 checks.oxygen=choose('o',['C','H','He']);
 checks.magnesium=choose('mg',['Ne','H','He']);
 checks.silicon=choose('si',['Mg','H','He']);
 checks.sulfur=choose('s',['Si','H','He']);
 checks.argon=choose('ar',['S','H','He']);
 checks.calcium=choose('ca',['Ar','H','He']);
 checks.titanium=choose('ti',['Ca','H','He']);
 checks.chromium=choose('cr',['Ti','H','He']);
 checks.ironAlpha=choose('cr_alpha_fe',['Cr','H','He']);
 checks.nickel=choose('ni_fusion',['Si','H','He','Si']);
 setPhase('fragile');checks.fragileKnown=T.learnedFusionRecipes().map(r=>r.out);
 let pieces=setup('white',['C','He','C','C']);checks.whiteAtQuota=T.autoFusionCandidate(pieces[0])?.r?.out||null;
 const active=new Set(T.activeCells()),extra=[...active].find(c=>T.state.board[c]===null);T.createPiece('C',extra,false);checks.whiteWithExcess=T.autoFusionCandidate(pieces[0])?.r?.out||null;
 return checks;
});
await browser.close();
if(pageErrors.length)throw new Error('Browser JS errors: '+pageErrors.join(' | '));
const expect={fragileDiversion:null,fragileGoal:'Be8',oxygen:'O',magnesium:'Mg',silicon:'Si',sulfur:'S',argon:'Ar',calcium:'Ca',titanium:'Ti',chromium:'Cr',ironAlpha:'Fe',nickel:'Ni',whiteAtQuota:null,whiteWithExcess:'O'};
for(const [k,v] of Object.entries(expect))if(result[k]!==v)throw new Error(`${k}: expected ${v}, got ${result[k]}`);
for(const required of ['Be7','Be8'])if(!result.fragileKnown.includes(required))throw new Error('Fragile canonical knowledge missing '+required);
for(const future of ['C','N','O','Ne','Mg'])if(result.fragileKnown.includes(future))throw new Error('Fragile revisit inherited future fusion output '+future);
console.log('Browser objective-safe chain scenarios passed:',JSON.stringify(result));
