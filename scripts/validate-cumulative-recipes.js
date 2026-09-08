const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const gsrc=fs.readFileSync('assets/js/campaign-graph.js','utf8'),ctx={window:{}};
vm.createContext(ctx);vm.runInContext(gsrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;
if(JSON.stringify(G.prerequisites.he_yellow)!==JSON.stringify({allOf:['he_orange']}))fail('Anã Amarela deve seguir Anã Laranja');
if(JSON.stringify(G.prerequisites.stellar_movement)!==JSON.stringify({allOf:['he_red']}))fail('Movimentação deve seguir Anã Vermelha');
if(JSON.stringify(G.prerequisites.solar_wind)!==JSON.stringify({allOf:['stellar_movement']}))fail('Vento Solar deve seguir Movimentação na trilha de baixa massa');
if(JSON.stringify(G.prerequisites.stellar_ionization)!==JSON.stringify({allOf:['solar_wind']}))fail('Ionização Estelar deve seguir Vento Solar');
if(JSON.stringify(G.prerequisites.stellar_recombination)!==JSON.stringify({allOf:['stellar_ionization']}))fail('Recombinação Estelar deve seguir Ionização Estelar');
if(JSON.stringify(G.prerequisites.coulomb_intro)!==JSON.stringify({allOf:['he_yellow']}))fail('Coulomb deve seguir Anã Amarela na trilha intermediária');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
if(map.includes("branchCluster('mainseq'"))fail('Fork Laranja/Amarela ainda existe');
if(!map.includes('flow(G.sequences.mid)'))fail('Sequência intermediária linear ausente');
if(!map.includes('flow(G.sequences.red)'))fail('Sequência de baixa massa linear ausente');
const s=fs.readFileSync('assets/js/ardua.js','utf8');
for(const t of ["campaignKnowledgeReached(r.unlock)","campaignKnowledgeReached('primordial_d')",'primordialFusionRecipe','cumulativeParticleInteractionAllowed','ensureCumulativeParticleFuel','reactCumulativeProcessNeutronWithProton','reactCumulativeProcessNeutronMixed'])if(!s.includes(t))fail('Arquitetura cumulativa ausente: '+t);

const learnedStart=s.indexOf('function allLearnedNeutronTransitions(){'),learnedEnd=s.indexOf('function neutronTransitionEnvironmentAllows',learnedStart),learned=s.slice(learnedStart,learnedEnd);
if(learnedStart<0||learnedEnd<0)fail('Validador de memória de nêutrons perdeu a âncora');
if(learned.includes('state.phaseIndex'))fail('Memória de captura depende do índice linear');
if(!learned.includes('campaignKnowledgeReached(p.id)'))fail('Memória de captura deve seguir histórico real');

const neutronEnvStart=s.indexOf('function neutronTransitionEnvironmentAllows'),neutronEnvEnd=s.indexOf('function learnedNeutronTransitions',neutronEnvStart),neutronEnv=s.slice(neutronEnvStart,neutronEnvEnd);
if(neutronEnvStart<0||neutronEnvEnd<0)fail('Compatibilidade cumulativa de nêutrons ausente');
if(neutronEnv.includes('tr.processClass===cls'))fail('Capturas aprendidas ficaram presas à família original');
if(!neutronEnv.includes('return true'))fail('Transições aprendidas precisam permanecer executáveis em fases de captura');

const cpiStart=s.indexOf('function cumulativeParticleInteractionAllowed'),cpiEnd=s.indexOf('function ensureCumulativeParticleFuel',cpiStart),cpi=s.slice(cpiStart,cpiEnd);
if(cpiStart<0||cpiEnd<0)fail('Camada cumulativa ausente');
if(/remnant|pulsar|accretion|blackhole|neutronize/.test(cpi))fail('Camada cumulativa exclui fases posteriores');

const fusionStart=s.indexOf('function fusionSandboxAllowed'),fusionEnd=s.indexOf('function fusionRecipeLearned',fusionStart),fusion=s.slice(fusionStart,fusionEnd);
if(fusionStart<0||fusionEnd<0)fail('Sandbox cumulativo de fusão ausente');
for(const mode of ['remnant','pulsar','accretion','blackhole','neutronize'])if(fusion.includes(`s.mode==='${mode}'`)||fusion.includes(`'${mode}'`))fail(`Fusão cumulativa exclui ${mode}`);
if(!fusion.includes("s.mode==='stellarFormation'")||!fusion.includes("s.mode==='campaignMilestone'"))fail('Superfícies sem grade precisam manter gesto próprio');
if(/BROWN_FUSION\)return|RED_UNSTABLE_FUSION\)return|RED_STABLE_FUSION\)return/.test(fusion))fail('Receitas aprendidas ficaram limitadas à fase de origem');

const candidateStart=s.indexOf('function candidateCells()'),candidateEnd=s.indexOf('function superNum',candidateStart),candidate=s.slice(candidateStart,candidateEnd);
if(candidateStart<0||candidateEnd<0)fail('Candidatos de fusão ausentes');
if(candidate.includes("s.mode==='neutronize'")||candidate.includes('isPostMode()'))fail('Candidatos cumulativos somem em fases posteriores');

const helperStart=s.indexOf('function cumulativeFusionTapAvailable'),helperEnd=s.indexOf('function neutronSourceSelectedPiece',helperStart),helper=s.slice(helperStart,helperEnd);
if(helperStart<0||helperEnd<0)fail('Prioridade de toque cumulativo ausente');
for(const t of ['possibleRecipes([...selectedSyms(),p.sym])','connectedRecipeCluster(r,[cell])'])if(!helper.includes(t))fail('Toque cumulativo perdeu regra: '+t);
if(!s.includes("s.mode!=='reactionExplore'&&cumulativeFusionTapAvailable(p,s)&&handleFusionTap(p)"))fail('Clique em candidato cumulativo precisa chegar ao executor de fusão');

const captureStart=s.indexOf('async function captureNeutron(id){');
const bridge=s.indexOf("particle?.kind==='p'",captureStart),gate=s.indexOf("if(s.mode!=='neutron')return",captureStart);
if(captureStart<0||bridge<0||gate<0||bridge>gate)fail('p+n deve anteceder o handler específico de captura');
const primordial=s.indexOf("id:'pn_d'"),particles=s.indexOf("particles:['p','n']",primordial),deuterium=s.indexOf("out:'D'",primordial);
if(primordial<0||particles<primordial||deuterium<primordial)fail('Receita p+n→D ausente');

const coulombRecipeContract="if(s.id==='coulomb_intro')return[FUSIONS.D,FUSIONS.He3,FUSIONS.He];";
if(!s.includes(coulombRecipeContract))fail('Coulomb deve herdar H+H→²H, ²H+H→³He e ³He+³He→⁴He');
if(!s.includes("const inheritedStarterGroups=[['He3','He3'],['D','H'],['H','H']];"))fail('Coulomb precisa expor oportunidades conectadas da cadeia pp acumulada');
const isotopeDisplayStart=s.indexOf('function pieceDisplaySymbol');
const isotopeDisplayEnd=s.indexOf('function pieceSymbolScale',isotopeDisplayStart);
const isotopeDisplay=s.slice(isotopeDisplayStart,isotopeDisplayEnd);
if(isotopeDisplayStart<0||isotopeDisplayEnd<0||isotopeDisplay.includes("return q>0?`${p.sym}")||!isotopeDisplay.includes(':base}'))fail('Isótopos devem usar o símbolo científico também em estado atômico');
if(!s.includes("if(r===FUSIONS.He)return'³He + ³He → ⁴He + 2 prótons';"))fail('Rótulo completo da reação pp-I deve explicitar ⁴He');

console.log('Cumulative recipe contract validation passed.');
