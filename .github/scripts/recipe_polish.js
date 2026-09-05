const fs=require('fs');

function replaceOnce(text,before,after,label){
  const i=text.indexOf(before);
  if(i<0)throw new Error(`Missing anchor: ${label}`);
  if(text.indexOf(before,i+before.length)>=0)throw new Error(`Ambiguous anchor: ${label}`);
  return text.slice(0,i)+after+text.slice(i+before.length);
}
function replaceRegexOnce(text,re,after,label){
  const matches=[...text.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];
  if(matches.length!==1)throw new Error(`${label}: expected 1 match, got ${matches.length}`);
  return text.replace(re,after);
}

const jsPath='assets/js/ardua.js';
let js=fs.readFileSync(jsPath,'utf8');

js=replaceOnce(js,
"$('branchLabel').textContent=s.branch;$('phaseTitle').textContent=s.title;$('phaseMeta').textContent=s.mode==='reactionExplore'?headerRecipeLine(atlasNextRecipeLine(s)):headerRecipeLine(s.mode==='primordialNuclear'?primordialNextRecipeLine(s):(s.meta||''));",
"$('branchLabel').textContent='';$('phaseTitle').textContent=s.title;$('phaseMeta').textContent='';",
'compact phase header');

js=replaceRegexOnce(js,
/function learnedFusionRecipes\(\)\{[\s\S]*?\n\}\nconst STELLAR_SANDBOX_VISUALS=/,
`function learnedFusionRecipes(){
  // Conhecimento cumulativo real: a campanha guarda as fases efetivamente alcançadas,
  // então ramos paralelos deixam de conceder receitas que o jogador ainda não viveu.
  const map=new Map(),campaign=window.ARDUA_CAMPAIGN,graphState=campaign?.getState?.(),done=new Set(graphState?.completed||[]),currentId=graphState?.activeId||phase()?.id,campaignAware=!!campaign&&!campaign.editor&&Array.isArray(graphState?.completed);
  const reached=(p,i)=>campaignAware?(done.has(p.id)||p.id===currentId):i<=state.phaseIndex;
  for(let i=0;i<PHASES.length;i++){
    const p=PHASES[i];if(!reached(p,i)||p.mode!=='fusion')continue;
    phaseFusionRecipes(p).forEach(r=>{const key=[...r.ing].sort().join('+')+'>'+r.out;map.set(key,r)})
  }
  const current=phase();if(current?.mode==='fusion')phaseFusionRecipes(current).forEach(r=>{const key=[...r.ing].sort().join('+')+'>'+r.out;map.set(key,r)});
  return[...map.values()]
}
const STELLAR_SANDBOX_VISUALS=`,
'learned fusion history');

js=replaceRegexOnce(js,
/function fusionSandboxAllowed\(s=phase\(\)\)\{[\s\S]*?\n\}\nfunction recipeEnvironmentAllows/,
`function fusionSandboxAllowed(s=phase()){
  // Depois que uma fusão foi aprendida, ela continua acessível nas fases que usam a
  // grade nuclear. Modos primordiais e remanescentes compactos mantêm seus gestos próprios.
  if(!s||isPrimordial(s)||s.mode==='opening')return false;
  if(['remnant','pulsar','accretion','blackhole','neutronize'].includes(s.mode))return false;
  return true;
}
function recipeEnvironmentAllows`,
'fusion sandbox breadth');

js=replaceRegexOnce(js,
/function recipeEnvironmentAllows\(r,s=phase\(\)\)\{[\s\S]*?\n\}\nfunction fusionRecipeLearned/,
`function recipeEnvironmentAllows(r,s=phase()){
  if(!r||!fusionSandboxAllowed(s))return false;
  // Estas três rotas são abstrações didáticas exclusivas de suas estrelas de origem.
  if(r===BROWN_FUSION)return s.id==='brown';
  if(r===RED_UNSTABLE_FUSION)return s.id==='he_red';
  if(r===RED_STABLE_FUSION)return s.id==='he_red';
  // Receitas de fusão já aprendidas permanecem jogáveis; temperatura segue como contexto científico.
  return true;
}
function fusionRecipeLearned`,
'cumulative fusion availability');

js=replaceOnce(js,
"function scienceScopeLabel(){return''}\nfunction setFormula(label,boldSyms=null){const tag=scienceScopeLabel(),shown=headerRecipeLine(label);$('formulaText').innerHTML=formulaHTML(shown,boldSyms)+(tag?`<small class=\"science-tag\">${tag}</small>`:'')}",
`function scienceScopeLabel(){return''}
function selectedGridPieceForFormula(){
 const cell=state.selected?.length===1?state.selected[0]:null,id=cell===null?null:state.board[cell];return id?state.pieces.get(id)||null:null
}
function formulaContainsSym(label,sym){const name=E[sym]?.name||'';return !!name&&headerRecipeLine(label).includes(name)}
function contextualRecipeForSelectedPiece(piece){
 if(!piece||piece.cell===null||piece.cell===undefined||!fusionSandboxAllowed())return null;
 const candidates=possibleRecipes([piece.sym]).map(r=>({r,cluster:connectedRecipeCluster(r,[piece.cell])})).filter(x=>x.cluster);
 if(!candidates.length)return null;const s=phase();candidates.sort((a,b)=>Number(b.r.out===s.new)-Number(a.r.out===s.new)||(E[a.r.out]?.n||0)-(E[b.r.out]?.n||0));return candidates[0].r
}
function contextualFormula(label,boldSyms=null){
 const piece=selectedGridPieceForFormula();if(!piece)return{label,boldSyms};
 const bold=[...(Array.isArray(boldSyms)?boldSyms:(boldSyms?[boldSyms]:[])),piece.sym];
 if(formulaContainsSym(label,piece.sym))return{label,boldSyms:bold};
 const recipe=contextualRecipeForSelectedPiece(piece);return recipe?{label:topFusionLabel(recipe),boldSyms:bold}:{label,boldSyms:bold}
}
function setFormula(label,boldSyms=null){const ctx=contextualFormula(label,boldSyms),tag=scienceScopeLabel(),shown=headerRecipeLine(ctx.label);$('formulaText').innerHTML=formulaHTML(shown,ctx.boldSyms)+(tag?`<small class="science-tag">${tag}</small>`:'')}
function flashRecipeTwice(){const el=$('formulaText');if(!el)return;el.classList.remove('recipe-intro-flash');void el.offsetWidth;el.classList.add('recipe-intro-flash');setTimeout(()=>el.classList.remove('recipe-intro-flash'),1500)}`,
'contextual formula');

js=replaceOnce(js,
" state.locked=state.phaseDone;if(!state.phaseDone&&['neutron','neutronize'].includes(phase().mode))startNeutronSystem();if(!state.phaseDone&&phase().mode==='accretion')startAccretionFeed();if(!state.phaseDone&&['spallation','neutrino','gamma'].includes(phase().mode))startCosmicRaySystem();if(isPrimordial()&&phase().mode!=='opening')startPrimordialDrift();render();\n}",
" state.locked=state.phaseDone;if(!state.phaseDone&&['neutron','neutronize'].includes(phase().mode))startNeutronSystem();if(!state.phaseDone&&phase().mode==='accretion')startAccretionFeed();if(!state.phaseDone&&['spallation','neutrino','gamma'].includes(phase().mode))startCosmicRaySystem();if(isPrimordial()&&phase().mode!=='opening')startPrimordialDrift();render();setTimeout(flashRecipeTwice,70);\n}",
'flash recipe on phase start');

js=replaceOnce(js,
" if(s.mode==='spallation'){if(state.selectedCosmic!==null)return tapParticleTarget(id);if(selectAtomForMovement(p))return;return tapParticleTarget(id)}",
" if(s.mode==='spallation'){if(state.selectedCosmic!==null)return tapParticleTarget(id);if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;if(selectAtomForMovement(p))return;return tapParticleTarget(id)}",
'spallation cumulative fusion');

js=replaceOnce(js,
" if(s.mode==='guidedDecay'||s.mode==='decayGarden'){if(selectAtomForMovement(p))return;return;}",
" if(s.mode==='guidedDecay'||s.mode==='decayGarden'){if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;if(selectAtomForMovement(p))return;return;}",
'decay cumulative fusion');

js=replaceOnce(js,
"if(s.mode==='collapseFinal'){toast('A matéria já está em órbita extrema. Segure o núcleo central.');return}",
"if(s.mode==='collapseFinal'){if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;toast('A matéria já está em órbita extrema. Segure o núcleo central.');return}",
'collapse cumulative fusion');

js=replaceOnce(js,
"const activeNow=new Set(activeFusionRecipes());learnedFusionRecipes().forEach(r=>{const b=document.createElement('button');b.className='reaction-chip'+(activeNow.has(r)?' available':'');b.textContent=fusionLabel(r);b.addEventListener('click',()=>{const min=fusionMinTemp(r),max=Number(phase().fusionTempMax||0),$d=$('reactionDetail'),scope=reactionScopeLabel(r);if($d)$d.innerHTML=`<strong>${fusionLabel(r)}</strong><span>${activeNow.has(r)?'Disponível agora':'Conhecida, mas fora das condições desta fase'}${scope?` · ${scope}`:''}</span><p>${min?(max?`Condição didática: reação exige ~${sci(min,1)} K · ambiente atual alcança ~${sci(max,1)} K.`:`Condição didática: reação exige ~${sci(min,1)} K.`):'Reação conhecida.'}</p>`});rc.appendChild(b)});",
"const activeNow=new Set(activeFusionRecipes());learnedFusionRecipes().forEach(r=>{const b=document.createElement('button');b.className='reaction-chip'+(activeNow.has(r)?' available':'');b.textContent=fusionLabel(r);b.addEventListener('click',()=>{const min=fusionMinTemp(r),max=Number(phase().fusionTempMax||0),$d=$('reactionDetail'),scope=reactionScopeLabel(r);if($d)$d.innerHTML=`<strong>${fusionLabel(r)}</strong><span>${activeNow.has(r)?'Disponível com reagentes compatíveis nesta fase':'Receita aprendida · permanece no repertório'}${scope?` · ${scope}`:''}</span><p>${min?(max?`Contexto térmico: limiar didático ~${sci(min,1)} K · ambiente atual ~${sci(max,1)} K.`:`Contexto térmico da reação: ~${sci(min,1)} K.`):'Reação conhecida.'}</p>`});rc.appendChild(b)});",
'reaction catalog cumulative wording');

fs.writeFileSync(jsPath,js);

const cssPath='assets/css/ardua.css';
let css=fs.readFileSync(cssPath,'utf8');
if(!css.includes('/* Phase header and recipe focus */'))css+=`\n\n/* Phase header and recipe focus */\n.phase-card small,.phase-card span{display:none!important}\n.phase-card strong{margin-top:0}\n.formula-line strong{font-weight:950;color:#fff;text-shadow:0 0 9px rgba(255,255,255,.22)}\n.formula-line.recipe-intro-flash{animation:recipeIntroFlash .62s ease-in-out 2}\n@keyframes recipeIntroFlash{0%,100%{opacity:1;transform:scale(1);text-shadow:none}45%{opacity:.42;transform:scale(.985);text-shadow:0 0 5px rgba(255,213,126,.1)}55%{opacity:1;transform:scale(1.035);text-shadow:0 0 18px rgba(255,213,126,.82)}}\n`;
fs.writeFileSync(cssPath,css);

console.log('Recipe/header polish applied.');
