const fs=require('fs');
const replace=(file,from,to)=>{let s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw new Error(`Anchor not found in ${file}: ${from.slice(0,90)}`);s=s.replace(from,to);fs.writeFileSync(file,s)};

// The engine is the authoritative source for the phase actually on screen.
{
 const file='assets/js/ardua.js';let s=fs.readFileSync(file,'utf8');
 const anchor="const s=phase(),captureIndex=phaseIndexById.get('proton_capture')??Infinity";
 const repl="const s=phase();document.documentElement.dataset.arduaEnginePhase=s.id;window.dispatchEvent(new CustomEvent('ardua:engine-phase',{detail:{id:s.id}}));const captureIndex=phaseIndexById.get('proton_capture')??Infinity";
 if(!s.includes(anchor))throw new Error('startPhase engine identity anchor missing');
 s=s.replace(anchor,repl);
 // Canonical graph ancestry remains the curriculum boundary, but the active objective must
 // always be able to rebuild its own required precursor chain, even when a prerequisite
 // teaching phase is represented as a sibling branch in the campaign graph.
 const re=/(function learnedFusionRecipes\(\)\{[\s\S]*?)(return\s*\[\.\.\.map\.values\(\)\])/;
 const m=s.match(re);if(!m)throw new Error('learnedFusionRecipes return anchor missing');
 const inject=`  const addObjectiveDependency=(r,seen=new Set())=>{\n    if(!r)return;const key=[...r.ing].sort().join('+')+'>'+r.out;if(seen.has(key))return;seen.add(key);map.set(key,r);\n    for(const sym of r.ing||[]){const producer=FUSIONS[sym];if(producer)addObjectiveDependency(producer,seen)}\n  };\n  phaseFusionRecipes(current).forEach(r=>addObjectiveDependency(r));\n  `;
 s=s.replace(re,(_,a,b)=>a+inject+b);
 // Never advertise an impossible final reaction. If no executable route exists, name the
 // missing precursor instead of showing a recipe whose ingredients are absent.
 const old="   const r=contextualObjectiveRecipe(s);if(r)return topFusionLabel(r);";
 const neu="   const r=contextualObjectiveRecipe(s);if(r&&hasRecipeIngredients(r,guidanceBoardSymbolCounts()))return topFusionLabel(r);const missing=target?orderedSpatialNeeds(target,s).find(n=>n.missing>0):null;if(missing)return `Reconstrua ${E[missing.sym]?.name||missing.sym}`;";
 if(!s.includes(old))throw new Error('conciseRecipeLine fallback anchor missing');
 s=s.replace(old,neu);
 fs.writeFileSync(file,s);
}

replace('assets/js/campaign-runtime-sync.js',
 " const id=resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;",
 " const engineId=document.documentElement.dataset.arduaEnginePhase||'';const id=(G.runtimeOrder||[]).includes(engineId)?engineId:resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;"
);
replace('assets/js/campaign-runtime-sync.js',
 "window.addEventListener('ardua:forge-names',sync);",
 "window.addEventListener('ardua:engine-phase',sync);\nwindow.addEventListener('ardua:forge-names',sync);"
);
replace('assets/js/campaign-phase-labels.js',
 "function activeId(){return C.getState?.().activeId||''}",
 "function activeId(){if(window.ARDUA_QUARKS?.isActive?.())return'quarks';return document.documentElement.dataset.arduaEnginePhase||C.getState?.().activeId||''}"
);

// Coordinated cache busting for all runtime pieces participating in this fix.
{
 const file='index.html';let s=fs.readFileSync(file,'utf8');
 s=s.replace(/assets\/js\/ardua\.js\?v=[^\"]+/,'assets/js/ardua.js?v=20260911-phase-runtime-sync-1');
 s=s.replace(/assets\/js\/campaign-phase-labels\.js\?v=[^\"]+/,'assets/js/campaign-phase-labels.js?v=20260911-phase-runtime-sync-1');
 s=s.replace('assets/js/campaign-runtime-sync.js\"></script>','assets/js/campaign-runtime-sync.js?v=20260911-phase-runtime-sync-1\"></script>');
 fs.writeFileSync(file,s);
}

// Keep the existing audio cache validator aligned with the engine token.
{
 const file='scripts/validate-recipe-audio-cadence.js';let s=fs.readFileSync(file,'utf8');
 s=s.replace("const version='20260911-objective-safe-chain-1';","const version='20260911-phase-runtime-sync-1';");
 fs.writeFileSync(file,s);
}

console.log('Phase runtime identity and objective precursor sync patch applied.');
