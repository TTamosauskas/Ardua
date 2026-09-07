const fs=require('fs');
const path='assets/js/ardua.js';
let s=fs.readFileSync(path,'utf8');
function replaceOnce(from,to,label){
 const i=s.indexOf(from);if(i<0)throw new Error(`Anchor ausente: ${label}`);
 if(s.indexOf(from,i+from.length)>=0)throw new Error(`Anchor duplicada: ${label}`);
 s=s.slice(0,i)+to+s.slice(i+from.length);
}

replaceOnce(`function fusionSandboxAllowed(s=phase()){
  // Depois que uma fusão foi aprendida, ela continua acessível nas fases que usam a
  // grade nuclear. Modos primordiais e remanescentes compactos mantêm seus gestos próprios.
  if(!s||isPrimordial(s)||s.mode==='opening')return false;
  if(['remnant','pulsar','accretion','blackhole','neutronize'].includes(s.mode))return false;
  return true;
}
function recipeEnvironmentAllows(r,s=phase()){
  if(!r||!fusionSandboxAllowed(s))return false;
  // Estas três rotas são abstrações didáticas exclusivas de suas estrelas de origem.
  if(r===BROWN_FUSION)return s.id==='brown';
  if(r===RED_UNSTABLE_FUSION)return s.id==='he_red';
  if(r===RED_STABLE_FUSION)return s.id==='he_red';
  // Receitas de fusão já aprendidas permanecem jogáveis; temperatura segue como contexto científico.
  return true;
}`,
`function fusionSandboxAllowed(s=phase()){
  // Contrato cumulativo: toda fase que apresenta a grade nuclear mantém disponíveis
  // as receitas de fusão já aprendidas. A fase atual define o objetivo, e não apaga
  // o repertório anterior. Fases primordiais e de formação têm gestos próprios.
  if(!s||isPrimordial(s)||s.mode==='opening'||s.mode==='stellarFormation'||s.mode==='campaignMilestone')return false;
  return true;
}
function recipeEnvironmentAllows(r,s=phase()){
  // Uma receita aprendida permanece executável sempre que seus ingredientes estão
  // presentes na grade e o gesto de fusão está disponível nesta superfície.
  return !!r&&fusionSandboxAllowed(s);
}`,'fusion sandbox');

replaceOnce(`function candidateCells(){const s=phase();if(state.convectionArmed&&state.selected.length===1)return convectionDestinationCells();if(s.mode==='neutronize'||isPostMode()||!state.selected.length)return[];`,
`function candidateCells(){const s=phase();if(state.convectionArmed&&state.selected.length===1)return convectionDestinationCells();if(!state.selected.length)return[];`,'candidate cells');

replaceOnce(`function neutronTransitionEnvironmentAllows(tr,s=phase()){
 const cls=neutronProcessClass(s);if(!cls||!tr)return false;
 // Processo-s fraco e AGB permanecem redes distintas no gameplay; o processo-r é
 // ainda mais extremo. A receita é lembrada, mas só fica executável na família compatível.
 return tr.processClass===cls
}`,
`function neutronTransitionEnvironmentAllows(tr,s=phase()){
 const cls=neutronProcessClass(s);if(!cls||!tr)return false;
 // Memória cumulativa: em qualquer fase que forneça o gesto de captura de nêutrons,
 // transições já aprendidas continuam selecionáveis quando o núcleo reagente reaparece.
 return true
}`,'neutron cumulative memory');

const handleAnchor=`function neutronSourceSelectedPiece(s=phase()){
`;
const helper=`function cumulativeFusionTapAvailable(p,s=phase()){
 if(!fusionSandboxAllowed(s)||!p||p.free||p.cell===null||p.cell===undefined)return false;
 // Uma mecânica explicitamente armada conserva prioridade sobre o mesmo toque.
 if(state.selectedNeutron!==null||state.selectedCosmic!==null||state.primordialSelected!==null||state.blackHoleSelected||state.convectionArmed)return false;
 const cell=p.cell;
 if(state.selected.length){
   if(state.selected.includes(cell))return true;
   if(!state.selected.some(x=>(neigh[x]||[]).includes(cell)))return false;
   return possibleRecipes([...selectedSyms(),p.sym]).length>0;
 }
 return possibleRecipes([p.sym]).some(r=>!!connectedRecipeCluster(r,[cell]));
}
`;
replaceOnce(handleAnchor,helper+handleAnchor,'cumulative fusion tap helper');

replaceOnce(`function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;if((p.sym==='Tc'||p.sym==='Pm')&&p.radioactiveReady)return tapRadioactiveProof(p);if(s.mode==='reactionExplore'){`,
`function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;if((p.sym==='Tc'||p.sym==='Pm')&&p.radioactiveReady)return tapRadioactiveProof(p);if(s.mode!=='reactionExplore'&&cumulativeFusionTapAvailable(p,s)&&handleFusionTap(p))return;if(s.mode==='reactionExplore'){`,'tapAtom cumulative priority');

fs.writeFileSync(path,s);
console.log('Contrato cumulativo aplicado ao motor.');
