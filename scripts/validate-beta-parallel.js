const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const css=fs.readFileSync('assets/css/phase-polish.css','utf8');

const required=[
  'neutronBetaStartRound',
  'neutronBetaTotalRounds',
  'beta-progress-ring',
  '--beta-progress',
  'núcleos decaindo',
  ' • ',
  'function guidanceBoardSymbolCounts()',
  'if(p.neutronBetaPending)return',
  'available=guidanceBoardSymbolCounts()',
  'hasRecipeIngredients(action.recipe,guidanceBoardSymbolCounts())',
  "guidanceSpeciesCount('Be7')>0",
  "neutronGameplay(s).pattern==='branch'",
  "set(['weak_s_ga'],'betaWait',{neutronBetaRounds:3})",
  "set(['weak_s_se'],'betaWait',{neutronBetaRounds:1})",
  "set(['nb'],'betaWait',{neutronBetaRounds:2})",
  "set(['la'],'betaWait',{neutronBetaRounds:3})",
  "set(['nd'],'betaWait',{neutronBetaRounds:4})",
  "set(['rb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true})",
  "set(['rh'],'branch',{neutronBetaRounds:3,requiresNeutronBranch:true})",
  "set(['sb'],'branch',{neutronBetaRounds:4,requiresNeutronBranch:true})"
];
for(const token of required){if(!engine.includes(token))throw new Error(`Contrato beta ausente: ${token}`)}
if(engine.includes('aguarde β− enquanto reconstrói a cadeia'))throw new Error('Regressão: cabeçalho voltou a instruir espera passiva');
if(engine.includes('capture outro n ou aguarde β−'))throw new Error('Regressão: branch voltou a priorizar espera no cabeçalho');
if(engine.includes("const needs=counts(action.needs||[]),available=boardSymbolCounts();"))throw new Error('Regressão: busca recursiva voltou a contar núcleos beta-pendentes como reagentes livres');
if(engine.includes('return speciesCount(tr.from)>0;'))throw new Error('Regressão: captura guiada voltou a considerar espécie pendente como disponível');
if(!css.includes('.beta-progress-ring')||!css.includes('conic-gradient'))throw new Error('Indicador circular beta ausente');
console.log('Parallel beta-decay gameplay contract OK');
