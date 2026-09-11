const fs=require('fs');
const replace=(file,from,to)=>{let s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw new Error(`Anchor not found in ${file}: ${from.slice(0,90)}`);s=s.replace(from,to);fs.writeFileSync(file,s)};
{
 const file='assets/js/ardua.js';let s=fs.readFileSync(file,'utf8');
 const anchor="const s=phase(),captureIndex=phaseIndexById.get('proton_capture')??Infinity";
 const repl="const s=phase();document.documentElement.dataset.arduaEnginePhase=s.id;window.dispatchEvent(new CustomEvent('ardua:engine-phase',{detail:{id:s.id}}));const captureIndex=phaseIndexById.get('proton_capture')??Infinity";
 if(!s.includes(anchor))throw new Error('startPhase engine identity anchor missing');s=s.replace(anchor,repl);
 const re=/(function learnedFusionRecipes\(\)\{[\s\S]*?)(return\s*\[\.\.\.map\.values\(\)\])/;if(!s.match(re))throw new Error('learnedFusionRecipes return anchor missing');
 const inject=`  const addObjectiveDependency=(r,seen=new Set())=>{\n    if(!r)return;const key=[...r.ing].sort().join('+')+'>'+r.out;if(seen.has(key))return;seen.add(key);map.set(key,r);\n    for(const sym of r.ing||[]){const producer=FUSIONS[sym];if(producer)addObjectiveDependency(producer,seen)}\n  };\n  phaseFusionRecipes(current).forEach(r=>addObjectiveDependency(r));\n  `;
 s=s.replace(re,(_,a,b)=>a+inject+b);
 const old="   const r=contextualObjectiveRecipe(s);if(r)return topFusionLabel(r);";
 const neu="   const r=contextualObjectiveRecipe(s);if(r&&hasRecipeIngredients(r,guidanceBoardSymbolCounts()))return topFusionLabel(r);const missing=target?orderedSpatialNeeds(target,s).find(n=>n.missing>0):null;if(missing)return `Reconstrua ${E[missing.sym]?.name||missing.sym}`;";
 if(!s.includes(old))throw new Error('conciseRecipeLine fallback anchor missing');s=s.replace(old,neu);fs.writeFileSync(file,s);
}
replace('assets/js/campaign-runtime-sync.js'," const id=resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;"," const engineId=document.documentElement.dataset.arduaEnginePhase||'';const id=(G.runtimeOrder||[]).includes(engineId)?engineId:resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;");
replace('assets/js/campaign-runtime-sync.js',"window.addEventListener('ardua:forge-names',sync);",`function syncFromEngine(e){
 const id=e?.detail?.id||document.documentElement.dataset.arduaEnginePhase||'';
 if(window.ARDUA_QUARKS?.isActive?.()||!(G.runtimeOrder||[]).includes(id))return;
 const st=C.getState?.();if(!st||st.activeId===id){document.documentElement.dataset.arduaActivePhase=id;return}
 busy=true;try{C.setActive(id);document.documentElement.dataset.arduaActivePhase=id;window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:C.getState?.(),source:'runtime-sync'}}))}finally{busy=false}
}
window.addEventListener('ardua:engine-phase',syncFromEngine);
window.addEventListener('ardua:forge-names',sync);`);
replace('assets/js/campaign-phase-labels.js',"function activeId(){return C.getState?.().activeId||''}","function activeId(){if(window.ARDUA_QUARKS?.isActive?.())return'quarks';return document.documentElement.dataset.arduaEnginePhase||C.getState?.().activeId||''}");
{
 const file='index.html';let s=fs.readFileSync(file,'utf8');s=s.replaceAll('20260911-objective-safe-chain-1','20260911-phase-runtime-sync-1');s=s.replace(/assets\/js\/campaign-phase-labels\.js\?v=[^\"]+/,'assets/js/campaign-phase-labels.js?v=20260911-phase-runtime-sync-1');s=s.replace('assets/js/campaign-runtime-sync.js\"></script>','assets/js/campaign-runtime-sync.js?v=20260911-phase-runtime-sync-1\"></script>');fs.writeFileSync(file,s);
}
{
 const file='scripts/validate-recipe-audio-cadence.js';let s=fs.readFileSync(file,'utf8');s=s.replace("const version='20260911-objective-safe-chain-1';","const version='20260911-phase-runtime-sync-1';");fs.writeFileSync(file,s);
}
{
 const file='scripts/validate-phase-goal-hierarchy.js';let s=fs.readFileSync(file,'utf8');s=s.replace("campaign-phase-labels.js?v=20260911-phase-goals-1","campaign-phase-labels.js?v=20260911-phase-runtime-sync-1");fs.writeFileSync(file,s);
}
{
 const file='.github/workflows/pages.yml';let s=fs.readFileSync(file,'utf8');const anchor='      - name: Validate precursor recipe planner\n        run: node scripts/validate-recipe-planner.js\n';const block='      - name: Validate precursor recipe planner\n        run: node scripts/validate-recipe-planner.js\n\n      - name: Validate phase runtime identity and recipe guidance\n        run: node scripts/validate-phase-runtime-sync.js\n';if(!s.includes(anchor))throw new Error('Pages validator anchor missing');s=s.replace(anchor,block);fs.writeFileSync(file,s);
}
console.log('Phase runtime identity and objective precursor sync patch applied.');
