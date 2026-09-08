from pathlib import Path
import json

ROOT=Path('.')

def read(path): return (ROOT/path).read_text(encoding='utf-8')
def write(path,text): (ROOT/path).write_text(text,encoding='utf-8')
def replace_once(path,old,new,label):
    s=read(path)
    if new in s:
        return
    if old not in s:
        raise SystemExit(f'{label}: anchor missing in {path}')
    write(path,s.replace(old,new,1))

def insert_before(path,anchor,text,label):
    s=read(path)
    if text.strip() in s:
        return
    if anchor not in s:
        raise SystemExit(f'{label}: anchor missing in {path}')
    write(path,s.replace(anchor,text+anchor,1))

# ---------------------------------------------------------------------------
# Campaign graph: three sequential phases between Anã Amarela and Coulomb.
# ---------------------------------------------------------------------------
p='assets/js/campaign-graph.js'
s=read(p)
s=s.replace("const G={version:7,", "const G={version:8,")
s=s.replace('"he_orange","he_yellow","coulomb_intro","stellar_convection"', '"he_orange","he_yellow","solar_wind","stellar_ionization","stellar_recombination","coulomb_intro","stellar_convection"')
s=s.replace('"mid":["intermediate_mass_formation","he_orange","he_yellow","coulomb_intro","stellar_convection"', '"mid":["intermediate_mass_formation","he_orange","he_yellow","solar_wind","stellar_ionization","stellar_recombination","coulomb_intro","stellar_convection"')
s=s.replace('"coulomb_intro":{"allOf":["he_yellow"]}', '"solar_wind":{"allOf":["he_yellow"]},"stellar_ionization":{"allOf":["solar_wind"]},"stellar_recombination":{"allOf":["stellar_ionization"]},"coulomb_intro":{"allOf":["stellar_recombination"]}')
write(p,s)

# ---------------------------------------------------------------------------
# Campaign save migration: ids remain authoritative; only a player parked on
# the not-yet-completed Coulomb lesson is redirected to the new block.
# ---------------------------------------------------------------------------
p='assets/js/campaign-mode.js'
s=read(p)
s=s.replace("function defaults(){return{version:10,", "function defaults(){return{version:11,")
s=s.replace("...x,version:10,completed", "...x,version:11,completed")
anchor=""" if(previousVersion<10){
  // v9 marcou a formação de Alta Massa como concluída em saves que já haviam passado
"""
if "previousVersion<11&&next.activeId==='coulomb_intro'" not in s:
    migration=""" if(previousVersion<11&&next.activeId==='coulomb_intro'&&!next.completed.includes('coulomb_intro')&&next.completed.includes('he_yellow')){
  // Novas lições de plasma entram imediatamente antes de Coulomb. Só redirecione
  // quem estava parado exatamente nessa fronteira; progresso posterior é preservado.
  next.activeId='solar_wind';
 }
"""
    if anchor not in s: raise SystemExit('campaign v11 migration anchor missing')
    s=s.replace(anchor,migration+anchor,1)
write(p,s)

# ---------------------------------------------------------------------------
# Engine phase definitions and scientific facts.
# ---------------------------------------------------------------------------
p='assets/js/ardua.js'
s=read(p)
phase_anchor="{id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade'"
if "id:'solar_wind'" not in s:
    phases="""{id:'solar_wind',branch:'Coroa estelar · plasma e escape',title:'Vento Solar',meta:'H + e⁻ → p⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:0,ionizationSpecies:['H'],solarWindTutorial:true,menuTag:'VENTO SOLAR',endEvent:'plasmaTransition',endLabel:'APRENDER<br>IONIZAÇÃO'},
{id:'stellar_ionization',branch:'Coroa estelar · ionização',title:'Ionização Estelar',meta:'Átomo + e⁻ → Íon⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:0,ionizationSpecies:['H','He','Li'],menuTag:'ÍON +1',endEvent:'plasmaTransition',endLabel:'APRENDER<br>RECOMBINAÇÃO'},
{id:'stellar_recombination',branch:'Coroa estelar · recombinação',title:'Recombinação Estelar',meta:'Íon⁺ + e⁻ → Átomo + γ',new:'H',mode:'stellarRecombination',target:3,visual:'yellowDwarf',fill:0,recombinationSpecies:['H','He','Li'],menuTag:'RECOMBINAÇÃO',endEvent:'plasmaTransition',endLabel:'EXPLORAR<br>COULOMB'},
"""
    if phase_anchor not in s: raise SystemExit('phase insertion anchor missing')
    s=s.replace(phase_anchor,phases+phase_anchor,1)

facts_anchor='"coulomb_intro":"Núcleos positivos se repelem eletricamente.'
if '"solar_wind":' not in s:
    facts=""""solar_wind":"A coroa de uma estrela como o Sol é um plasma extremamente quente. O vento solar é o fluxo de partículas desse plasma que escapa continuamente para o espaço.",
 "stellar_ionization":"Colisões com elétrons suficientemente energéticos podem remover elétrons ligados de muitos átomos, produzindo íons positivos e mais elétrons livres.",
 "stellar_recombination":"Um íon positivo pode capturar um elétron e voltar a um estado menos ionizado ou neutro, liberando energia em forma de radiação.",
 """
    if facts_anchor not in s: raise SystemExit('phase facts anchor missing')
    s=s.replace(facts_anchor,facts+facts_anchor,1)

# Flow budget: the three actions are the objective, not a hidden grind target.
s=s.replace("'primordialMolecule','convection','protonCapture'", "'primordialMolecule','stellarIonization','stellarRecombination','convection','protonCapture'")
# Solar-type grid stays compact.
s=s.replace("if(s.id==='he_orange'||s.id==='he_yellow'||s.mode==='whiteCompact'", "if(s.id==='he_orange'||s.id==='he_yellow'||s.visual==='yellowDwarf'||s.mode==='whiteCompact'")

# Runtime counters.
state_anchor="objectiveMotifSelection:null"
if 'stellarIonizations:0' not in s:
    state_fields="stellarIonizations:0,stellarRecombinations:0,stellarIonizedSpecies:new Set(),stellarRecombinedSpecies:new Set(),solarWindEvents:0,solarWindRunning:false,solarWindCheckTimer:null,stellarAtomicTransfer:null,"
    if state_anchor not in s: raise SystemExit('state anchor missing')
    s=s.replace(state_anchor,state_fields+state_anchor,1)

# ---------------------------------------------------------------------------
# Generic +1 ion model, phase seeding/transfer, and solar-wind system.
# Insert after existing atomic charge helpers, where all referenced function
# declarations are still available through hoisting.
# ---------------------------------------------------------------------------
atomic_anchor="function primordialMassForSym(sym){"
if 'function stellarAtomicMode(s=phase())' not in s:
    block=r"""
function stellarAtomicMode(s=phase()){return !!s&&['stellarIonization','stellarRecombination'].includes(s.mode)}
function stellarAtomicChemistryAllowed(s=phase()){
 if(!s||isPrimordial(s)||s.mode==='opening'||s.mode==='stellarFormation'||isPostMode(s)||['neutronize','guidedDecay','decayGarden','spallation','neutrino','gamma','explosive','rpProcess'].includes(s.mode))return false;
 return stellarAtomicMode(s)||campaignKnowledgeReached('stellar_ionization')||campaignKnowledgeReached('stellar_recombination')
}
function stellarIonizationSpecies(s=phase()){return Array.isArray(s?.ionizationSpecies)?s.ionizationSpecies:null}
function stellarRecombinationSpecies(s=phase()){return Array.isArray(s?.recombinationSpecies)?s.recombinationSpecies:null}
function neutralStellarAtom(p){return !!p&&!p.free&&p.matterState==='atom'&&pieceCharge(p)===0}
function positiveStellarIon(p){return !!p&&!p.free&&p.matterState==='atom'&&pieceCharge(p)===1}
function stellarIonizationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!neutralStellarAtom(p))return false;const list=stellarIonizationSpecies(s);return !list||list.includes(p.sym)
}
function stellarRecombinationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!positiveStellarIon(p))return false;const list=stellarRecombinationSpecies(s);return !list||list.includes(p.sym)
}
function stellarAtomicSnapshot(targetId){
 const size=starSize();return{to:targetId,particles:snapshotPrimordialParticles(),pieces:[...state.pieces.values()].filter(p=>!p.free&&p.cell!==null&&p.cell!==undefined).map(p=>({sym:p.sym,cell:p.cell,matterState:p.matterState||'nucleus',boundElectrons:Number(p.boundElectrons||0),massNumber:p.massNumber??E[p.sym]?.mass??null,lineage:normalizeMatterLineage(p.lineage)}))}
}
function stellarAtomicOpenCells(){return activeCells().filter(cell=>state.board[cell]===null).sort((a,b)=>(coords[b]?.ring||0)-(coords[a]?.ring||0)||a-b)}
function placeNeutralStellarAtom(sym){const cell=stellarAtomicOpenCells()[0];if(cell===undefined)return null;return createPiece(sym,cell,false,{matterState:'atom',boundElectrons:Number(E[sym]?.n||0),massNumber:primordialMassForSym(sym)})}
function placePositiveStellarIon(sym){const cell=stellarAtomicOpenCells()[0];if(cell===undefined)return null;return createPiece(sym,cell,false,{matterState:'atom',boundElectrons:Math.max(0,Number(E[sym]?.n||0)-1),massNumber:primordialMassForSym(sym)})}
function restoreStellarAtomicTransfer(transfer){
 if(!transfer)return false;for(const item of transfer.pieces||[]){if(!Number.isInteger(item.cell)||state.board[item.cell]!==null)continue;createPiece(item.sym,item.cell,false,{matterState:item.matterState||'atom',boundElectrons:Number(item.boundElectrons||0),massNumber:item.massNumber,lineage:item.lineage})}restorePrimordialParticles(transfer.particles||[]);return true
}
function fillStellarAtomicStage(s=phase()){
 const transfer=state.stellarAtomicTransfer?.to===s.id?state.stellarAtomicTransfer:null;state.stellarAtomicTransfer=null;
 if(transfer)restoreStellarAtomicTransfer(transfer);
 if(s.id==='solar_wind'){
  clearBoard();clearPrimordialParticles();drawCells();for(let i=0;i<3;i++)placeNeutralStellarAtom('H');createPrimordialParticle('e');for(let i=0;i<3;i++)createPrimordialParticle('n');
 }else if(s.id==='stellar_ionization'){
  if(!transfer){ensurePrimordialParticleMix({p:1,e:1,n:1})}else ensurePrimordialParticleMix({p:1,e:1,n:1});
  for(const sym of ['H','He','Li'])if(![...state.pieces.values()].some(p=>neutralStellarAtom(p)&&p.sym===sym))placeNeutralStellarAtom(sym);
 }else if(s.id==='stellar_recombination'){
  if(!transfer){ensurePrimordialParticleMix({p:2,e:4,n:1});placePositiveStellarIon('He');placePositiveStellarIon('Li')}
  else{ensurePrimordialParticleMix({p:1,e:3,n:1});if(![...state.pieces.values()].some(p=>positiveStellarIon(p)&&p.sym==='He'))placePositiveStellarIon('He');if(![...state.pieces.values()].some(p=>positiveStellarIon(p)&&p.sym==='Li'))placePositiveStellarIon('Li')}
 }
 renderPieces();renderPrimordialParticles();startPrimordialDrift()
}
function stellarAtomicSelectedElectron(){const p=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;return p?.kind==='e'?p:null}
function creditStellarIonization(sym,s=phase()){
 if(s.mode!=='stellarIonization')return false;const list=stellarIonizationSpecies(s)||[];if(list.length&&!list.includes(sym))return false;
 if(s.id==='solar_wind'){state.stellarIonizations++;recordFlow(1);return true}
 if(state.stellarIonizedSpecies.has(sym))return false;state.stellarIonizedSpecies.add(sym);state.stellarIonizations++;recordFlow(1);return true
}
function creditStellarRecombination(sym,s=phase()){
 if(s.mode!=='stellarRecombination')return false;const list=stellarRecombinationSpecies(s)||[];if(list.length&&!list.includes(sym)||state.stellarRecombinedSpecies.has(sym))return false;state.stellarRecombinedSpecies.add(sym);state.stellarRecombinations++;return true
}
function solarWindEligibleParticles(){return[...state.primordialParticles.values()].filter(p=>['p','e','n','pos'].includes(p.kind)&&!p.dragging)}
function solarWindPhaseAllows(s=phase()){
 if(!s||isPrimordial(s)||s.mode==='opening'||s.mode==='stellarFormation'||isPostMode(s)||['neutronize','guidedDecay','decayGarden','spallation','neutrino','gamma','explosive','rpProcess'].includes(s.mode))return false;
 return s.id==='solar_wind'||campaignKnowledgeReached('solar_wind')
}
function solarWindKeepIds(items){const keep=new Set();for(const kind of ['p','e','n']){const p=items.find(x=>x.kind===kind);if(p)keep.add(p.id)}return keep}
async function triggerSolarWind(){
 const s=phase(),items=solarWindEligibleParticles();if(state.solarWindRunning||items.length<10||!solarWindPhaseAllows(s)||state.phaseDone||state.popupOpen)return false;
 state.solarWindRunning=true;const oldLock=state.locked;state.locked=true;state.selected=[];state.primordialSelected=null;cancelParticleDrag();stopPrimordialDrift();renderPrimordialParticles();dom.star.classList.add('solar-wind-active');
 const keep=solarWindKeepIds(items),size=starSize(),c=size/2,animations=[];
 for(const p of items){const el=dom.primordial.querySelector(`[data-id="${p.id}"]`);if(!el)continue;el.classList.remove('particle-reserve');el.setAttribute('aria-hidden','false');el.style.pointerEvents='none';const dx=p.x-c,dy=p.y-c,r=Math.max(38,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),dir=p.id%2?1:-1,spin=a+dir*1.55,mid1={x:c+Math.cos(a+dir*.65)*r*.86,y:c+Math.sin(a+dir*.65)*r*.86},mid2={x:c+Math.cos(spin)*r*.78,y:c+Math.sin(spin)*r*.78};let end={x:p.x,y:p.y,opacity:1};if(!keep.has(p.id)){const outA=spin+(Math.random()-.5)*.48,reach=size*(.82+Math.random()*.28);end={x:c+Math.cos(outA)*reach,y:c+Math.sin(outA)*reach,opacity:0}}const anim=el.animate([{left:`${p.x}px`,top:`${p.y}px`,opacity:1},{offset:.34,left:`${mid1.x}px`,top:`${mid1.y}px`,opacity:1},{offset:.62,left:`${mid2.x}px`,top:`${mid2.y}px`,opacity:1},{left:`${end.x}px`,top:`${end.y}px`,opacity:end.opacity}],{duration:1150,easing:'cubic-bezier(.22,.68,.2,1)',fill:'forwards'});animations.push(anim.finished.catch(()=>{}))}
 tone(260,.22,'sine',.025);setTimeout(()=>tone(390,.24,'triangle',.028),170);setTimeout(()=>tone(585,.30,'sine',.024),360);vibrate([6,10,8]);await Promise.all(animations);for(const p of items){if(!keep.has(p.id))state.primordialParticles.delete(p.id);else{p.reacting=false;p.throwing=false;p.dragging=false;primeStellarShellParticle(p,p.kind)}}state.solarWindEvents++;const first=!state.rewardDiscoveries.has('phenomenon:solarWind');if(first)registerRewardDiscovery('phenomenon:solarWind',{title:'VENTO SOLAR',text:'Plasma da coroa escapou da estrela como um fluxo de partículas.',silent:true});dom.star.classList.remove('solar-wind-active');state.solarWindRunning=false;state.locked=oldLock&&s.id!=='solar_wind';render();startPrimordialDrift();if(first)announce('DESCOBERTA','VENTO SOLAR','O plasma da coroa pode escapar continuamente para o espaço.');checkComplete();return true
}
function queueSolarWindCheck(){
 if(state.solarWindRunning||state.solarWindCheckTimer||!solarWindPhaseAllows()||solarWindEligibleParticles().length<10)return;state.solarWindCheckTimer=setTimeout(()=>{state.solarWindCheckTimer=null;if(!state.locked&&!state.popupOpen&&!state.phaseDone&&!document.body.classList.contains('campaign-map-open')&&!document.getElementById('campaignMap')?.classList.contains('show'))triggerSolarWind()},40)
}
"""
    if atomic_anchor not in s: raise SystemExit('atomic helper insertion anchor missing')
    s=s.replace(atomic_anchor,block+atomic_anchor,1)

# Ionization/recombination actions, after the existing electron-binding reaction.
bind_anchor="function invalidPrimordial(id){"
if 'async function ionizeStellarAtom(piece,electron)' not in s:
    actions=r"""
async function ionizeStellarAtom(piece,electron){
 const s=phase();if(state.locked||state.phaseDone||!electron||electron.kind!=='e'||electron.reacting||!stellarIonizationEligible(piece,s))return false;const sym=piece.sym,x=piece.x,y=piece.y,cell=piece.cell;state.locked=true;state.selected=[];state.primordialSelected=null;electron.reacting=true;await objectiveInteractionImpact(`stellar-ionization:${s.id}:${sym}`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],sym,{x,y},sym==='H'?'p⁺ + e⁻':`${sym}⁺ + e⁻`,'IONIZAÇÃO');
 if(sym==='H'){if(cell!==null&&cell!==undefined&&state.board[cell]===piece.id)state.board[cell]=null;state.pieces.delete(piece.id);spawnFloatingParticle('p',x-8,y)}else{piece.matterState='atom';piece.boundElectrons=Math.max(0,Number(E[sym]?.n||0)-1);piece.newborn=true}
 spawnFloatingParticle('e',x+9,y);electron.reacting=false;electron.x=x+18;electron.y=y-8;primeStellarShellParticle(electron,'e');creditStellarIonization(sym,s);burst(x,y);captureTag(x,y,'IONIZAÇÃO');tone(sym==='H'?610:540,.11,'triangle',.032);render();await wait(470);if(piece&&state.pieces.has(piece.id)){piece.newborn=false;renderPieces()}state.locked=false;startPrimordialDrift();render();if(s.id==='solar_wind'&&state.stellarIonizations>=s.target)await triggerSolarWind();else queueSolarWindCheck();checkComplete();return true
}
async function recombineStellarIon(piece,electron){
 const s=phase();if(state.locked||state.phaseDone||!electron||electron.kind!=='e'||electron.reacting||!stellarRecombinationEligible(piece,s))return false;const sym=piece.sym,x=piece.x,y=piece.y;state.locked=true;state.selected=[];state.primordialSelected=null;electron.reacting=true;await objectiveInteractionImpact(`stellar-recombination:${s.id}:${sym}`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],sym,{x,y},'γ','RECOMBINAÇÃO');state.primordialParticles.delete(electron.id);piece.boundElectrons=Math.min(Number(E[sym]?.n||0),Number(piece.boundElectrons||0)+1);piece.matterState='atom';piece.newborn=true;const credited=creditStellarRecombination(sym,s);if(credited)recordFlow(1);burst(x,y);captureTag(x,y,'RECOMBINAÇÃO');renderPieces();renderPrimordialParticles();await emitGamma(x,y);setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;startPrimordialDrift();render();checkComplete();return true
}
function handleStellarAtomicTap(piece,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!piece||piece.free)return false;const electron=stellarAtomicSelectedElectron();
 if(stellarIonizationEligible(piece,s)){if(electron){ionizeStellarAtom(piece,electron);return true}state.selected=[piece.cell];state.primordialSelected=null;tone(350,.04,'sine',.022);render();return true}
 if(stellarRecombinationEligible(piece,s)){if(electron){recombineStellarIon(piece,electron);return true}state.selected=[piece.cell];state.primordialSelected=null;tone(390,.04,'sine',.022);render();return true}
 return false
}
"""
    if bind_anchor not in s: raise SystemExit('stellar atomic action anchor missing')
    s=s.replace(bind_anchor,actions+bind_anchor,1)

# H recombination already has a correct physical implementation; count it for
# the new phase when the p/e pair is used there.
old="state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);"
new="state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);if(s.mode==='stellarRecombination')creditStellarRecombination('H',s);"
if old not in s: raise SystemExit('hydrogen recombination credit anchor missing')
s=s.replace(old,new,1)

# Custom phase starter must bypass the cumulative 2p/2n/2e replenisher.
s=s.replace("function ensureCumulativeParticleFuel(s=phase()){\n if(!s||isPrimordial(s)||!cumulativeParticleInteractionAllowed(s))return;", "function ensureCumulativeParticleFuel(s=phase()){\n if(stellarAtomicMode(s))return;\n if(!s||isPrimordial(s)||!cumulativeParticleInteractionAllowed(s))return;")

# Particle UI: custom chemistry makes electrons selectable and all tutorial
# particles visible, rather than collapsing extras into the reserve style.
s=s.replace("canUseCumulative=cumulativeParticleInteractionAllowed(s),canUseStellarProton=!!stellarProtonRecipe(s)||protonCaptureAvailable(s),", "canUseCumulative=cumulativeParticleInteractionAllowed(s),canUseStellarProton=!!stellarProtonRecipe(s)||protonCaptureAvailable(s),canUseStellarAtomic=stellarAtomicChemistryAllowed(s),")
s=s.replace("(primordialActive||canUseStellarProton||canUseCumulative)&&!state.locked", "(primordialActive||canUseStellarProton||canUseCumulative||canUseStellarAtomic)&&!state.locked")
s=s.replace("}else if((canUseStellarProton||canUseCumulative)&&!p.reacting){", "}else if((canUseStellarProton||canUseCumulative||canUseStellarAtomic)&&!p.reacting){")
s=s.replace("candidate=!!primordialMixedReaction(selectedBoardPiece.sym,p.kind)||(p.kind==='p'&&((stellarProtonRecipe(s)&&selectedBoardPiece.sym==='H')||(protonCaptureAvailable(s)&&protonCaptureRoute(selectedBoardPiece,s))));interactive=candidate", "candidate=!!primordialMixedReaction(selectedBoardPiece.sym,p.kind)||(p.kind==='p'&&((stellarProtonRecipe(s)&&selectedBoardPiece.sym==='H')||(protonCaptureAvailable(s)&&protonCaptureRoute(selectedBoardPiece,s))))||(p.kind==='e'&&(stellarIonizationEligible(selectedBoardPiece,s)||stellarRecombinationEligible(selectedBoardPiece,s)));interactive=candidate")
s=s.replace("else{interactive=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&['H','He','Li'].some(atomicRecombinationLearned))||(p.kind==='p'&&canUseStellarProton)}", "else{interactive=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&(['H','He','Li'].some(atomicRecombinationLearned)||canUseStellarAtomic))||(p.kind==='p'&&(canUseStellarProton||phase().mode==='stellarRecombination'))}")
s=s.replace("const reserve=!isPrimordial(s)&&['p','n','e'].includes(p.kind)", "const reserve=!isPrimordial(s)&&!stellarAtomicMode(s)&&['p','n','e'].includes(p.kind)")

# Board candidate glow when an electron is armed.
s=s.replace("stellarProtonTarget=!primordial&&selectedPrimordialParticle?.kind==='p'&&((stellarProtonRecipe(s)&&p.sym==='H')||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))),blackHoleTarget", "stellarProtonTarget=!primordial&&selectedPrimordialParticle?.kind==='p'&&((stellarProtonRecipe(s)&&p.sym==='H')||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))),stellarElectronTarget=!primordial&&selectedPrimordialParticle?.kind==='e'&&(stellarIonizationEligible(p,s)||stellarRecombinationEligible(p,s)),blackHoleTarget")
s=s.replace("||stellarProtonTarget||blackHoleTarget;", "||stellarProtonTarget||stellarElectronTarget||blackHoleTarget;")

# Particle tapping: selected board + e executes chemistry; otherwise e can arm
# the reaction. p/e remains the H recombination route in phase 3.
old=""" const board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;if(board){const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p)}
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
"""
new=""" const board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;if(board){if(p.kind==='e'&&stellarIonizationEligible(board,s))return ionizeStellarAtom(board,p);if(p.kind==='e'&&stellarRecombinationEligible(board,s))return recombineStellarIon(board,p);const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p)}
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
"""
if old not in s: raise SystemExit('nonprimordial particle board anchor missing')
s=s.replace(old,new,1)
old=""" if(state.primordialSelected!==null){const first=state.primordialParticles.get(state.primordialSelected);if(first){if(atomicRecombinationLearned('H')&&same([first.kind,p.kind],['p','e']))return recombineHydrogenParticles(first,p);const pair=primordialParticlePairReaction([first.kind,p.kind]);if(pair)return reactPrimordialParticlePair(pair,first,p)}}
 if(cumulativeParticleInteractionAllowed(s)&&learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))){"""
new=""" if(state.primordialSelected!==null){const first=state.primordialParticles.get(state.primordialSelected);if(first){if(atomicRecombinationLearned('H')&&same([first.kind,p.kind],['p','e']))return recombineHydrogenParticles(first,p);const pair=primordialParticlePairReaction([first.kind,p.kind]);if(pair)return reactPrimordialParticlePair(pair,first,p)}}
 if(stellarAtomicChemistryAllowed(s)&&(p.kind==='e'||(s.mode==='stellarRecombination'&&p.kind==='p'))){state.primordialSelected=id;state.selected=[];tone(p.kind==='e'?460:340,.04);render();return}
 if(cumulativeParticleInteractionAllowed(s)&&learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))){"""
if old not in s: raise SystemExit('atomic particle arm anchor missing')
s=s.replace(old,new,1)

# Atom tapping gives the new atomic mechanics priority over fusion/movement.
s=s.replace("function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(p.free&&cumulativeParticleInteractionAllowed(s))", "function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(handleStellarAtomicTap(p,s))return;if(p.free&&cumulativeParticleInteractionAllowed(s))")

# Fill-stage hook. fillStage has already cleared the old board/particle layers.
s=s.replace("const s=phase();\n if(s.mode==='reactionExplore')", "const s=phase();\n if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}\n if(s.mode==='reactionExplore')")

# Objective recipe lines and HUD.
s=s.replace("function conciseRecipeLine(s=phase()){\n if(s.mode==='stellarFormation')", "function conciseRecipeLine(s=phase()){\n if(s.id==='solar_wind')return 'H + e⁻ → p⁺ + 2e⁻';\n if(s.mode==='stellarIonization')return 'Átomo + e⁻ → Íon⁺ + 2e⁻';\n if(s.mode==='stellarRecombination')return 'Íon⁺ + e⁻ → Átomo + γ';\n if(s.mode==='stellarFormation')")
s=s.replace("const p=s.mode==='stellarFormation'?Math.min(100,formationLargest/formationSpec.total*100):currentProgress(),flowTarget", "const p=s.mode==='stellarFormation'?Math.min(100,formationLargest/formationSpec.total*100):s.mode==='stellarIonization'?Math.min(100,state.stellarIonizations/Math.max(1,s.target)*100):s.mode==='stellarRecombination'?Math.min(100,state.stellarRecombinations/Math.max(1,s.target)*100):currentProgress(),flowTarget")
s=s.replace("else if(s.mode==='primordialMolecule')$('stageProgressText').textContent", "else if(s.mode==='stellarIonization')$('stageProgressText').textContent=`${state.stellarIonizations}/${s.target}`;\n else if(s.mode==='stellarRecombination')$('stageProgressText').textContent=`${state.stellarRecombinations}/${s.target}`;\n else if(s.mode==='primordialMolecule')$('stageProgressText').textContent")
s=s.replace("$('stageProgressLabel').textContent=s.mode==='stellarFormation'?", "$('stageProgressLabel').textContent=s.id==='solar_wind'?(state.readyToAdvance?'CONCLUÍDA':'VENTO SOLAR'):s.mode==='stellarIonization'?(state.readyToAdvance?'CONCLUÍDA':'IONIZAÇÃO'):s.mode==='stellarRecombination'?(state.readyToAdvance?'CONCLUÍDA':'RECOMBINAÇÃO'):s.mode==='stellarFormation'?")
obj_anchor="function updateObjective(){\n const s=phase();"
if "Ionize átomos de Hidrogênio" not in s:
    obj_insert="""function updateObjective(){
 const s=phase();
 if(s.id==='solar_wind'){$('goalText').textContent=`Ionize átomos de Hidrogênio ${state.stellarIonizations}/${s.target}`;setFormula('H + e⁻ → p⁺ + 2e⁻');return}
 if(s.mode==='stellarIonization'){$('goalText').textContent=`Ionize átomos ${state.stellarIonizations}/${s.target}`;setFormula('Átomo + e⁻ → Íon⁺ + 2e⁻');return}
 if(s.mode==='stellarRecombination'){$('goalText').textContent=`Recombine íons ${state.stellarRecombinations}/${s.target}`;setFormula('Íon⁺ + e⁻ → Átomo + γ');return}
"""
    if obj_anchor not in s: raise SystemExit('objective anchor missing')
    # replace the two-line prefix, keeping a single function declaration
    s=s.replace(obj_anchor,obj_insert,1)

# Objective completion.
s=s.replace("function objectiveSatisfied(s=phase()){\n if(s.mode==='campaignMilestone')", "function objectiveSatisfied(s=phase()){\n if(s.id==='solar_wind')return state.stellarIonizations>=s.target&&state.solarWindEvents>=1;\n if(s.mode==='stellarIonization')return state.stellarIonizations>=s.target;\n if(s.mode==='stellarRecombination')return state.stellarRecombinations>=s.target;\n if(s.mode==='campaignMilestone')")

# Completion messages.
s=s.replace("else if(s.mode==='convection')announce('OBJETIVO CONCLUÍDO'", "else if(s.id==='solar_wind')announce('OBJETIVO CONCLUÍDO','VENTO SOLAR','A ionização produziu plasma livre e o excesso de partículas escapou da coroa.');\n else if(s.mode==='stellarIonization')announce('OBJETIVO CONCLUÍDO','IONIZAÇÃO ESTELAR','Hidrogênio, Hélio e Lítio demonstraram que diferentes átomos podem formar íons positivos.');\n else if(s.mode==='stellarRecombination')announce('OBJETIVO CONCLUÍDO','RECOMBINAÇÃO ESTELAR','Os íons capturaram elétrons e voltaram a átomos neutros, emitindo radiação.');\n else if(s.mode==='convection')announce('OBJETIVO CONCLUÍDO'")

# Phase-to-phase transfer without the ordinary dust-scatter transition.
advance_anchor="async function scatterStage(){"
if 'async function advanceStellarAtomicPhase()' not in s:
    advance_block="""async function advanceStellarAtomicPhase(){
 if(!state.phaseDone)return;const s=phase(),next=PHASES[state.phaseIndex+1];$('phaseEndBtn').classList.remove('show');state.locked=true;stopPrimordialDrift();state.stellarAtomicTransfer=next&&stellarAtomicMode(next)?stellarAtomicSnapshot(next.id):null;dom.star.classList.add('primordial-transition');tone(315,.18,'sine',.026);await wait(360);dom.star.classList.remove('primordial-transition');advancePhase()
}
"""
    if advance_anchor not in s: raise SystemExit('plasma advance anchor missing')
    s=s.replace(advance_anchor,advance_block+advance_anchor,1)
s=s.replace("if(isPrimordial(s))return advancePrimordial();if(s.endEvent==='stellarBirth')", "if(isPrimordial(s))return advancePrimordial();if(s.endEvent==='plasmaTransition')return advanceStellarAtomicPhase();if(s.endEvent==='stellarBirth')")

# Reset custom phase runtime and seed custom stage. Keep transfer only for its
# intended next phase.
reset_anchor="state.created={};state.nextMatterOrigin=1;"
if "state.stellarIonizations=0;state.stellarRecombinations=0;" not in s.split('function startPhase',1)[1]:
    repl="state.created={};state.stellarIonizations=0;state.stellarRecombinations=0;state.stellarIonizedSpecies=new Set();state.stellarRecombinedSpecies=new Set();state.solarWindEvents=0;state.solarWindRunning=false;if(state.solarWindCheckTimer){clearTimeout(state.solarWindCheckTimer);state.solarWindCheckTimer=null}state.nextMatterOrigin=1;"
    if reset_anchor not in s: raise SystemExit('startPhase counter reset anchor missing')
    s=s.replace(reset_anchor,repl,1)
# stale transfer is invalid if player navigates elsewhere
s=s.replace("applyGeometry();if(preserved){", "applyGeometry();if(!stellarAtomicMode(s)&&state.stellarAtomicTransfer)state.stellarAtomicTransfer=null;if(preserved){")

# Modal language and family.
s=s.replace("if(s.id==='he_yellow')return '³He + ³He → He';", "if(s.id==='he_yellow')return '³He + ³He → He';\n if(s.id==='solar_wind')return 'H + e⁻ → p⁺ + 2e⁻';\n if(s.mode==='stellarIonization')return 'Átomo + e⁻ → Íon⁺ + 2e⁻';\n if(s.mode==='stellarRecombination')return 'Íon⁺ + e⁻ → Átomo + γ';")
s=s.replace("if(s.id==='he_yellow')return 'Complete a cadeia formando Hélio estável';", "if(s.id==='he_yellow')return 'Complete a cadeia formando Hélio estável';\n if(s.id==='solar_wind')return 'Ionize três H; quando houver 10 partículas livres, observe o plasma escapar da coroa';\n if(s.mode==='stellarIonization')return 'Use um elétron livre para ionizar H, He e Li uma vez cada';\n if(s.mode==='stellarRecombination')return 'Recombine p⁺, He⁺ e Li⁺ com elétrons e observe a emissão γ';")
s=s.replace("atomic_li:'LÍTIO',coulomb_intro:'BARREIRA DE COULOMB'", "atomic_li:'LÍTIO',solar_wind:'VENTO SOLAR',stellar_ionization:'IONIZAÇÃO ESTELAR',stellar_recombination:'RECOMBINAÇÃO ESTELAR',coulomb_intro:'BARREIRA DE COULOMB'")
s=s.replace("'he_red','he_orange','he_yellow','coulomb_intro'", "'he_red','he_orange','he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro'")

# Render schedules the permanent environmental threshold check.
s=s.replace("function render(){drawLines();renderPieces();updateMoveTargets();renderPrimordialParticles();renderCosmicRays();updateHUD();renderNeutrons();renderConvectionControl();renderMenu()}", "function render(){drawLines();renderPieces();updateMoveTargets();renderPrimordialParticles();renderCosmicRays();updateHUD();renderNeutrons();renderConvectionControl();renderMenu();queueSolarWindCheck()}")

# Ensure fillStage actually seeds the custom mode. If the generic anchor changed,
# fail loudly rather than shipping empty stages.
if "if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}" not in s:
    raise SystemExit('fillStage custom hook was not installed')

write(p,s)

# ---------------------------------------------------------------------------
# Campaign-facing names and phenomenon catalog.
# ---------------------------------------------------------------------------
p='assets/js/campaign-phase-names.js'; s=read(p)
if "solar_wind:'Vento Solar'" not in s:
    s=s.replace("const NAMES=Object.freeze({\n", "const NAMES=Object.freeze({\n solar_wind:'Vento Solar',\n stellar_ionization:'Ionização Estelar',\n stellar_recombination:'Recombinação Estelar',\n",1)
write(p,s)

p='assets/js/campaign-discoveries.js'; s=read(p)
phen_anchor=" {key:'phenomenon:coulombBarrier'"
if "title:'Vento Solar'" not in s:
    entry=" {key:'phenomenon:solarWind',glyph:'↗',title:'Vento Solar',group:'Processos estelares',text:'Fluxo contínuo de plasma que escapa da coroa de uma estrela como o Sol, composto principalmente por prótons e elétrons e também por íons.',phases:['solar_wind'],infer:[]},\n"
    if phen_anchor not in s: raise SystemExit('phenomena solar wind anchor missing')
    s=s.replace(phen_anchor,entry+phen_anchor,1)
write(p,s)

p='assets/js/campaign-discoveries-phenomena.js'; s=read(p)
if "'Vento Solar':'Vento solar'" not in s:
    s=s.replace(" 'Anã Marrom':'Anã marrom',", " 'Vento Solar':'Vento solar',\n 'Anã Marrom':'Anã marrom',",1)
write(p,s)

# Local-source record reuses the already-attributed local Sun image; no remote
# runtime image is introduced.
p='assets/data/phenomenon-sources.json'; data=json.loads(read(p))
if 'Vento Solar' not in data:
    data['Vento Solar']={
      'wikiTitle':'Vento solar','slug':'solar-wind','wikiResolvedTitle':'Vento solar',
      'wikiUrl':'https://pt.wikipedia.org/wiki/Vento_solar',
      'imagePath':'assets/images/phenomena/yellow-dwarf.jpg',
      'imageWikiResolvedTitle':'Anã amarela',
      'imageSourceUrl':'https://commons.wikimedia.org/wiki/File:Sun_white.jpg',
      'imageLicense':'CC BY 4.0','imageLicenseUrl':'https://creativecommons.org/licenses/by/4.0','imageArtist':'Geoff Elston'
    }
write(p,json.dumps(data,ensure_ascii=False,indent=2)+"\n")

# Validators know the catalog now has 50 entries and explicitly require solar wind.
p='scripts/validate-phenomenon-sources.mjs'; s=read(p)
s=s.replace("if(entries.length!==49)throw new Error(`Esperados 49 fenômenos, encontrados ${entries.length}`);", "if(entries.length!==50)throw new Error(`Esperados 50 fenômenos, encontrados ${entries.length}`);")
write(p,s)

p='scripts/validate-phenomena-discoveries.mjs'; s=read(p)
if "'Vento Solar':['solar_wind']" not in s:
    s=s.replace("'Anã Marrom':['brown']", "'Vento Solar':['solar_wind'], 'Anã Marrom':['brown']",1)
write(p,s)

# Permanent contract validator for this feature.
validator=Path('scripts/validate-stellar-plasma.js')
validator.write_text(r"""const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graph=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const discoveries=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const sources=JSON.parse(fs.readFileSync('assets/data/phenomenon-sources.json','utf8'));
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const requiredEngine=[
 "id:'solar_wind'","title:'Vento Solar'","meta:'H + e⁻ → p⁺ + 2e⁻'",
 "id:'stellar_ionization'","meta:'Átomo + e⁻ → Íon⁺ + 2e⁻'",
 "id:'stellar_recombination'","meta:'Íon⁺ + e⁻ → Átomo + γ'",
 'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',
 'function triggerSolarWind()','solarWindEligibleParticles().length<10',
 "for(const kind of ['p','e','n'])","state.stellarIonizations>=s.target&&state.solarWindEvents>=1",
 'Ionize átomos de Hidrogênio ${state.stellarIonizations}/${s.target}',
 'Ionize átomos ${state.stellarIonizations}/${s.target}',
 'Recombine íons ${state.stellarRecombinations}/${s.target}',
 "registerRewardDiscovery('phenomenon:solarWind'",'stellarAtomicSnapshot(next.id)',
 "if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}",
 "if(stellarAtomicMode(s))return;"
];
for(const token of requiredEngine)if(!engine.includes(token))throw new Error(`Contrato de plasma ausente: ${token}`);
const order=['he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro'];
let last=-1;for(const id of order){const at=graph.indexOf(`\"${id}\"`);if(at<0||at<=last)throw new Error(`Ordem de campanha inválida em ${id}`);last=at}
for(const token of ['"solar_wind":{"allOf":["he_yellow"]}','"stellar_ionization":{"allOf":["solar_wind"]}','"stellar_recombination":{"allOf":["stellar_ionization"]}','"coulomb_intro":{"allOf":["stellar_recombination"]}'])if(!graph.includes(token))throw new Error(`Pré-requisito ausente: ${token}`);
if(!discoveries.includes("key:'phenomenon:solarWind'")||!discoveries.includes("title:'Vento Solar'"))throw new Error('Vento Solar ausente de Fenômenos');
if(!sources['Vento Solar']?.imagePath||!sources['Vento Solar']?.wikiUrl)throw new Error('Fonte local de Vento Solar incompleta');
if(!campaign.includes('version:11')||!campaign.includes("next.activeId='solar_wind'"))throw new Error('Migração v11 da campanha ausente');
console.log('Stellar plasma phases contract OK');
""",encoding='utf-8')

# Pages runs the new contract on every deploy.
p='.github/workflows/pages.yml'; s=read(p)
if 'Validate stellar plasma phases' not in s:
    anchor="""      - name: Validate menu discoveries UX
        run: node scripts/validate-menu-discoveries-ux.js

"""
    step=anchor+"""      - name: Validate stellar plasma phases
        run: node scripts/validate-stellar-plasma.js

"""
    if anchor not in s: raise SystemExit('pages validator anchor missing')
    s=s.replace(anchor,step,1)
write(p,s)

print('stellar plasma phase migration applied')
