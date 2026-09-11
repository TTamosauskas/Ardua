const fs=require('fs');
const path='assets/js/ardua.js';
let src=fs.readFileSync(path,'utf8');

const learnedRe=/function learnedFusionRecipes\(\)\{[\s\S]*?\n\}\nconst STELLAR_SANDBOX_VISUALS=/;
if(!learnedRe.test(src))throw new Error('learnedFusionRecipes block not found');
const learned=`function canonicalKnowledgePhaseIds(s=phase()){
  const graph=window.ARDUA_CAMPAIGN_GRAPH,out=new Set(),visiting=new Set();
  const visit=id=>{
    if(!id||out.has(id)||visiting.has(id))return;
    visiting.add(id);
    const rule=graph?.prerequisites?.[id],deps=[];
    if(Array.isArray(rule?.allOf))deps.push(...rule.allOf);
    if(Array.isArray(rule?.anyOf))for(const group of rule.anyOf)if(Array.isArray(group))deps.push(...group);
    deps.forEach(visit);visiting.delete(id);out.add(id);
  };
  const anchor=s?.id&&graph?.prerequisites?.[s.id]?s.id:(s?.anchorId&&graph?.prerequisites?.[s.anchorId]?s.anchorId:null);
  if(anchor){visit(anchor);if(s?.id)out.add(s.id);return out}
  const idx=s?.id?phaseIndexById.get(s.id):state.phaseIndex,cut=Number.isInteger(idx)?idx:state.phaseIndex;
  for(let i=0;i<=Math.max(0,cut);i++)if(PHASES[i]?.id)out.add(PHASES[i].id);
  if(s?.id)out.add(s.id);return out;
}
function learnedFusionRecipes(){
  // O repertório pertence ao ponto canônico da campanha, não ao histórico futuro do jogador.
  // Ao revisitar uma fase antiga, receitas aprendidas depois dela deixam de aparecer.
  const map=new Map(),current=phase(),known=canonicalKnowledgePhaseIds(current);
  for(const p of PHASES){
    if(!known.has(p.id)||p.mode!=='fusion')continue;
    phaseFusionRecipes(p).forEach(r=>{const key=[...r.ing].sort().join('+')+'>'+r.out;map.set(key,r)})
  }
  // Fases de fusão sempre conhecem a própria receita, inclusive na primeira visita.
  if(current?.mode==='fusion')phaseFusionRecipes(current).forEach(r=>map.set(recipeKey(r),r));
  return[...map.values()]
}
const STELLAR_SANDBOX_VISUALS=`;
src=src.replace(learnedRe,learned);

const autoRe=/function fusionAutoRecipePreviouslyLearned\(r\)\{[\s\S]*?\n\}\nfunction neutronAutoTargetPreviouslyLearned/;
if(!autoRe.test(src))throw new Error('fusion auto eligibility block not found');
const auto=`function canonicalFusionRecipeKnown(r,s=phase()){
 if(!r)return false;return learnedFusionRecipes().some(q=>sameAutoRecipe(q,r));
}
function objectiveAutoTargetRecipes(s=phase()){
 if(s.mode==='whiteCompact')return[whiteTargetRecipe(s)].filter(Boolean);
 if(s.mode!=='fusion')return[];
 const recipes=phaseFusionRecipes(s).filter(Boolean),direct=recipes.filter(r=>r.out===s.new);
 return direct.length?direct:(recipes.length?[recipes[recipes.length-1]]:[]);
}
function objectiveAutoDependencyDistances(s=phase()){
 const available=activeFusionRecipes(),dist=new Map(),seen=new Map();
 const walk=(r,d=0)=>{
   if(!r)return;const key=recipeKey(r),best=seen.get(key);if(best!==undefined&&best<=d)return;seen.set(key,d);
   const current=dist.get(r.out);if(current===undefined||d<current)dist.set(r.out,d);
   for(const sym of r.ing||[]){
     const next=d+1,old=dist.get(sym);if(old===undefined||next<old)dist.set(sym,next);
     for(const producer of available)if(producer!==r&&producer.out===sym)walk(producer,next);
   }
 };
 objectiveAutoTargetRecipes(s).forEach(r=>walk(r,0));return dist;
}
function autoChainPreservesObjectiveReserve(r,s=phase()){
 if(!r)return false;
 if(s.mode!=='whiteCompact')return true;
 const info=whiteCounts(s),need=counts(r.ing||[]),afterC=info.c-(need.C||0)+(r.out==='C'?1:0),afterO=info.o-(need.O||0)+(r.out==='O'?1:0);
 // Carbono e Oxigênio já conquistados até a meta são reservas: só excedentes podem alimentar outra reação automática.
 if(afterC<Math.min(info.c,info.targetC))return false;
 if(afterO<Math.min(info.o,info.targetO))return false;
 return true;
}
function objectiveAutoRecipeAllowed(r,product,s=phase(),distances=objectiveAutoDependencyDistances(s)){
 if(!r||!product||!canonicalFusionRecipeKnown(r,s)||!autoChainPreservesObjectiveReserve(r,s))return false;
 const fromDistance=distances.get(product.sym),toDistance=distances.get(r.out);
 // A cascata só anda para mais perto do objetivo. Rotas laterais continuam disponíveis manualmente.
 return fromDistance!==undefined&&toDistance!==undefined&&toDistance<fromDistance;
}
function neutronAutoTargetPreviouslyLearned`;
src=src.replace(autoRe,auto);

const candidateRe=/function autoFusionCandidate\(product,s=phase\(\)\)\{[\s\S]*?return options\[0\]\|\|null;\n\}/;
if(!candidateRe.test(src))throw new Error('autoFusionCandidate block not found');
const candidate=`function autoFusionCandidate(product,s=phase()){
 if(!product||product.free||product.cell===null||product.cell===undefined||!fusionSandboxAllowed(s))return null;
 const distances=objectiveAutoDependencyDistances(s),fromDistance=distances.get(product.sym);if(fromDistance===undefined)return null;const options=[];
 for(const cell of neigh[product.cell]||[]){
   const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other)continue;
   const r=exactRecipe([product.sym,other.sym]);if(!r||!objectiveAutoRecipeAllowed(r,product,s,distances))continue;
   options.push({other,r,distance:distances.get(r.out)??999,goal:r.out===s.new?1:0});
 }
 options.sort((a,b)=>a.distance-b.distance||b.goal-a.goal||(E[b.r.out]?.n||0)-(E[a.r.out]?.n||0));return options[0]||null;
}`;
src=src.replace(candidateRe,candidate);

fs.writeFileSync(path,src);

// Keep the cumulative validator aligned with canonical phase knowledge.
const cv='scripts/validate-cumulative-recipes.js';
let c=fs.readFileSync(cv,'utf8');
const old=`for(const token of [\n 'for(let i=0;i<PHASES.length;i++)',\n \"if(!reached(p,i)||p.mode!=='fusion')continue\",\n 'phaseFusionRecipes(p).forEach',\n 'done.has(p.id)||p.id===currentId'\n])if(!learnedFusion.includes(token))fail('Memoria de fusao deixou de acumular fases anteriores: '+token);`;
const neu=`for(const token of [\n 'canonicalKnowledgePhaseIds(current)',\n \"if(!known.has(p.id)||p.mode!=='fusion')continue\",\n 'phaseFusionRecipes(p).forEach'\n])if(!learnedFusion.includes(token))fail('Memória canônica de fusão perdeu regra: '+token);\nif(/graphState|done\\.has\\(p\\.id\\)|currentId/.test(learnedFusion))fail('Revisita ainda depende do histórico futuro do jogador');`;
if(!c.includes(old))throw new Error('old cumulative validator contract not found');
c=c.replace(old,neu);fs.writeFileSync(cv,c);

// New permanent validator.
const validator=`const fs=require('fs'),vm=require('vm');\nconst fail=m=>{throw new Error(m)};\nconst s=fs.readFileSync('assets/js/ardua.js','utf8');\nconst gsrc=fs.readFileSync('assets/js/campaign-graph.js','utf8'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(gsrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;\nfor(const token of ['function canonicalKnowledgePhaseIds','canonicalKnowledgePhaseIds(current)',\"if(!known.has(p.id)||p.mode!=='fusion')continue\",'function objectiveAutoTargetRecipes','function objectiveAutoDependencyDistances','function autoChainPreservesObjectiveReserve','toDistance<fromDistance','objectiveAutoRecipeAllowed(r,product,s,distances)'])if(!s.includes(token))fail('Contrato de cascata segura ausente: '+token);\nif(s.includes('function fusionAutoRecipePreviouslyLearned'))fail('Elegibilidade automática ainda usa conceito de receita apenas previamente aprendida');\nfunction ancestors(id){const out=new Set(),seen=new Set();const visit=x=>{if(!x||seen.has(x))return;seen.add(x);const r=G.prerequisites[x]||{};(r.allOf||[]).forEach(visit);for(const group of r.anyOf||[])for(const y of group||[])visit(y);out.add(x)};visit(id);return out}\nconst fragile=ancestors('fragile');if(!fragile.has('stellar_li')||fragile.has('c')||fragile.has('o'))fail('Ancestralidade canônica de Berílio-8 incorreta');\nconst oxygen=ancestors('o');if(!oxygen.has('c')||!oxygen.has('n')||oxygen.has('carbon_burn'))fail('Ancestralidade canônica de Oxigênio misturou ramo de alta massa');\nconst magnesium=ancestors('mg');if(!magnesium.has('carbon_oxygen')||!magnesium.has('na')||magnesium.has('al'))fail('Ancestralidade canônica de Magnésio incorreta');\nconst conflicts=[\n [\"Be7:{ing:['He3','He'],out:'Be7'\",\"Be8:{ing:['He','He'],out:'Be8'\"],\n [\"N:{ing:['C','H'],out:'N'\",\"O:{ing:['C','He'],out:'O'\"],\n [\"Na:{ing:['Ne','H'],out:'Na'\",\"Mg:{ing:['Ne','He'],out:'Mg'\"],\n [\"Al:{ing:['Mg','H'],out:'Al'\",\"Si:{ing:['Mg','He'],out:'Si'\"],\n [\"P:{ing:['Si','H'],out:'P'\",\"S:{ing:['Si','He'],out:'S'\"],\n [\"Cl:{ing:['S','H'],out:'Cl'\",\"Ar:{ing:['S','He'],out:'Ar'\"],\n [\"K:{ing:['Ar','H'],out:'K'\",\"Ca:{ing:['Ar','He'],out:'Ca'\"],\n [\"Sc:{ing:['Ca','H'],out:'Sc'\",\"Ti:{ing:['Ca','He'],out:'Ti'\"],\n [\"V:{ing:['Ti','H'],out:'V'\",\"Cr:{ing:['Ti','He'],out:'Cr'\"],\n [\"Mn:{ing:['Cr','H'],out:'Mn'\",'CHROMIUM_ALPHA_FUSION']\n];for(const pair of conflicts)for(const token of pair)if(!s.includes(token))fail('Cenário concorrente ausente: '+token);\nif(!s.includes(\"if(s.mode==='whiteCompact')return[whiteTargetRecipe(s)].filter(Boolean);\"))fail('Anã branca não usa alvo dinâmico');\nif(!s.includes('afterC<Math.min(info.c,info.targetC)')||!s.includes('afterO<Math.min(info.o,info.targetO)'))fail('Reservas C/O da Anã branca não estão protegidas');\nconsole.log('Objective-safe chain validation passed: canonical revisits, goal-directed cascades and white-dwarf reserves are enforced.');\n`;
fs.writeFileSync('scripts/validate-objective-safe-chain.js',validator);

// Add validator to Pages CI once.
const wf='.github/workflows/pages.yml';let w=fs.readFileSync(wf,'utf8');
const marker=`      - name: Validate cumulative recipe architecture\n        run: node scripts/validate-cumulative-recipes.js\n`;
const addition=marker+`\n      - name: Validate objective-safe reaction chains\n        run: node scripts/validate-objective-safe-chain.js\n`;
if(!w.includes('Validate objective-safe reaction chains')){if(!w.includes(marker))throw new Error('pages workflow insertion point not found');w=w.replace(marker,addition);fs.writeFileSync(wf,w)}

// Bust only the engine cache; audio modules remain on their existing coordinated profile.
const ix='index.html';let html=fs.readFileSync(ix,'utf8');
const oldEngine='assets/js/ardua.js?v=20260910-quarks-audio-1',newEngine='assets/js/ardua.js?v=20260911-objective-safe-chain-1';
if(!html.includes(oldEngine)&&!html.includes(newEngine))throw new Error('engine script tag not found');html=html.replace(oldEngine,newEngine);fs.writeFileSync(ix,html);

console.log('Objective-safe chain patch applied.');
