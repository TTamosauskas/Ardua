const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const s=fs.readFileSync('assets/js/ardua.js','utf8');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['assets/js/campaign-graph.js','assets/js/campaign-required-atlas.js','assets/js/campaign-supergiants.js','assets/js/campaign-giants.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;
for(const token of ['function canonicalKnowledgePhaseIds','canonicalKnowledgePhaseIds(current)',"if(!known.has(p.id)||p.mode!=='fusion')continue",'function objectiveAutoTargetRecipes','function objectiveAutoDependencyDistances','function autoChainPreservesObjectiveReserve','toDistance<fromDistance','objectiveAutoRecipeAllowed(r,product,s,distances)'])if(!s.includes(token))fail('Contrato de cascata segura ausente: '+token);
if(s.includes('function fusionAutoRecipePreviouslyLearned'))fail('Elegibilidade automática ainda usa conceito de receita apenas previamente aprendida');
function ancestors(id){const out=new Set(),seen=new Set();const visit=x=>{if(!x||seen.has(x))return;seen.add(x);const r=G.prerequisites[x]||{};(r.allOf||[]).forEach(visit);for(const group of r.anyOf||[])for(const y of group||[])visit(y);out.add(x)};visit(id);return out}
const fragile=ancestors('fragile');if(!fragile.has('stellar_li')||!fragile.has('giant_formation')||fragile.has('c')||fragile.has('n')||fragile.has('o'))fail('Rota canônica de Berílio-8 incorreta no grafo runtime');
const oxygen=ancestors('o');if(!oxygen.has('giant_formation')||oxygen.has('c')||oxygen.has('n')||oxygen.has('fragile')||oxygen.has('carbon_burn'))fail('Rota canônica de Oxigênio misturou ramos paralelos');
const magnesium=ancestors('mg');if(!magnesium.has('carbon_burn')||!magnesium.has('na')||!magnesium.has('carbon_oxygen')||magnesium.has('al')||magnesium.has('si'))fail('Rota canônica de Magnésio incorreta');
const sulfur=ancestors('s');if(!sulfur.has('oxygen_burn')||!sulfur.has('si')||!sulfur.has('p')||sulfur.has('al')||sulfur.has('ar'))fail('Rota canônica de Enxofre incorreta');
const conflicts=[
 ["Be7:{ing:['He3','He'],out:'Be7'","Be8:{ing:['He','He'],out:'Be8'"],
 ["N:{ing:['C','H'],out:'N'","O:{ing:['C','He'],out:'O'"],
 ["Na:{ing:['Ne','H'],out:'Na'","Mg:{ing:['Ne','He'],out:'Mg'"],
 ["Al:{ing:['Mg','H'],out:'Al'","Si:{ing:['Mg','He'],out:'Si'"],
 ["P:{ing:['Si','H'],out:'P'","S:{ing:['Si','He'],out:'S'"],
 ["Cl:{ing:['S','H'],out:'Cl'","Ar:{ing:['S','He'],out:'Ar'"],
 ["K:{ing:['Ar','H'],out:'K'","Ca:{ing:['Ar','He'],out:'Ca'"],
 ["Sc:{ing:['Ca','H'],out:'Sc'","Ti:{ing:['Ca','He'],out:'Ti'"],
 ["V:{ing:['Ti','H'],out:'V'","Cr:{ing:['Ti','He'],out:'Cr'"],
 ["Mn:{ing:['Cr','H'],out:'Mn'",'CHROMIUM_ALPHA_FUSION']
];for(const pair of conflicts)for(const token of pair)if(!s.includes(token))fail('Cenário concorrente ausente: '+token);
if(!s.includes("if(s.mode==='whiteCompact')return[whiteTargetRecipe(s)].filter(Boolean);"))fail('Anã branca não usa alvo dinâmico');
if(!s.includes('afterC<Math.min(info.c,info.targetC)')||!s.includes('afterO<Math.min(info.o,info.targetO)'))fail('Reservas C/O da Anã branca não estão protegidas');
console.log('Objective-safe chain validation passed: runtime graph ancestry, goal-directed cascades and white-dwarf reserves are enforced.');
