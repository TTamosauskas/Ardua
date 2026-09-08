from pathlib import Path

ROOT=Path('.')

def read(path): return (ROOT/path).read_text(encoding='utf-8')
def write(path,text): (ROOT/path).write_text(text,encoding='utf-8')
def require(cond,msg):
    if not cond: raise SystemExit(msg)
def replace_once(s,old,new,label):
    if new in s: return s
    require(old in s,f'{label}: anchor missing')
    return s.replace(old,new,1)

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
p='assets/js/ardua.js'; s=read(p)

# 1) Movement tutorial immediately after the red dwarf.
red=" {id:'he_red',branch:'Nova estrela · baixa massa',title:'Anã vermelha',meta:'Formação de Hélio estável',new:'He',mode:'fusion',target:6,visual:'redDwarf',fill:16,pool:['H'],gravityDelay:175},"
move=" {id:'stellar_movement',branch:'Nova estrela · baixa massa',title:'Movimentação Estelar',meta:'Leve o Hélio até o núcleo estelar.',new:'He',mode:'movementTutorial',target:1,flowTarget:0,visual:'redDwarf',fill:15,pool:['H'],gravityDelay:175,menuTag:'MOVIMENTO',endLabel:'ESPALHAR<br>POEIRA ESTELAR'},"
if "id:'stellar_movement'" not in s:
    require(red in s,'he_red phase anchor missing')
    s=s.replace(red,red+'\n'+move,1)

# 2) Recent plasma lessons finish with the same stellar-dust scatter action.
for phase_id,next_label in [
    ('solar_wind','APRENDER<br>IONIZAÇÃO'),
    ('stellar_ionization','APRENDER<br>RECOMBINAÇÃO'),
    ('stellar_recombination','EXPLORAR<br>COULOMB')
]:
    marker=f"id:'{phase_id}'"
    a=s.find(marker); require(a>=0,f'{phase_id} phase missing')
    b=s.find('\n',a); b=len(s) if b<0 else b
    line=s[a:b]
    line2=line.replace(",endEvent:'plasmaTransition'",'').replace(f"endLabel:'{next_label}'","endLabel:'ESPALHAR<br>POEIRA ESTELAR'")
    require("endEvent:'plasmaTransition'" not in line2 and "endLabel:'ESPALHAR<br>POEIRA ESTELAR'" in line2,f'{phase_id} scatter metadata failed')
    s=s[:a]+line2+s[b:]

# Movement is a separate learned mechanic; Coulomb remains only the barrier unlock.
old="""function atomicMovementAllowed(s=phase()){
 if(!coulombMechanicUnlocked(s))return false;
 if(isPrimordial(s)||s.mode==='neutronize'||isPostMode(s))return false;
 if(s.mode==='explosive')return false;
 return true;
}"""
new="""function movementMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('stellar_movement');
 if(intro===undefined||state.phaseIndex<intro)return false;
 if(isPrimordial(s)||s.mode==='opening'||s.mode==='stellarFormation'||s.mode==='neutronize'||isPostMode(s)||s.mode==='explosive')return false;
 return true;
}
function atomicMovementAllowed(s=phase()){return movementMechanicUnlocked(s)}"""
s=replace_once(s,old,new,'movement unlock')

# Dedicated tutorial board: same red-dwarf geometry, He on the last shell, center
# and an inward neighbor empty so the first path to the core is always possible.
anchor="  if(s.mode==='stellarFormation'){renderPieces();return}\n"
block="""  if(s.mode==='movementTutorial'){
    const center=(byRing[0]||[])[0],outer=(byRing[phaseRadius(s)]||[]).slice();let heCell=outer[0],pathCell=null;
    for(const cell of outer){const inward=(neigh[cell]||[]).find(n=>(coords[n]?.ring??99)===1);if(inward!==undefined){heCell=cell;pathCell=inward;break}}
    const reserved=new Set([center,pathCell,heCell].filter(Number.isInteger));if(Number.isInteger(heCell))createPiece('He',heCell,false);
    const rest=activeCells().filter(cell=>!reserved.has(cell)).sort(()=>Math.random()-.5),amount=Math.max(0,Math.min((s.fill||15)-1,rest.length));
    rest.slice(0,amount).forEach(cell=>createPiece('H',cell,false));renderPieces();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null&&p.cell!==undefined){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces()});return;
  }
"""
if block not in s:
    require(anchor in s,'fillStage stellarFormation anchor missing')
    s=s.replace(anchor,anchor+block,1)

# Tutorial completion = He reaches the central cell.
obj_sig='function objectiveSatisfied(s=phase()){'
obj_insert="""function objectiveSatisfied(s=phase()){
 if(s.mode==='movementTutorial'){const center=(byRing[0]||[])[0],id=Number.isInteger(center)?state.board[center]:null,p=id?state.pieces.get(id):null;return !!p&&p.sym==='He'}"""
if obj_insert not in s:
    require(obj_sig in s,'objectiveSatisfied anchor missing')
    s=s.replace(obj_sig,obj_insert,1)

prog="  if(s.mode==='opening')return 0;"
if "if(s.mode==='movementTutorial')return 0;" not in s:
    require(prog in s,'objectiveProgress opening anchor missing')
    s=s.replace(prog,prog+"\n  if(s.mode==='movementTutorial')return 0;",1)

mile='function phaseMilestoneReached(s=phase()){'
if "function phaseMilestoneReached(s=phase()){if(s.mode==='movementTutorial')return objectiveSatisfied(s);" not in s:
    require(mile in s,'phaseMilestoneReached anchor missing')
    s=s.replace(mile,"function phaseMilestoneReached(s=phase()){if(s.mode==='movementTutorial')return objectiveSatisfied(s);",1)

# Phase intro and instructions use the requested objective verbatim.
primary="function modalPrimaryLine(s=phase()){\n  if(s.mode==='stellarFormation')return 'Atraia moleculas com a gravidade';"
primary2="function modalPrimaryLine(s=phase()){\n  if(s.mode==='movementTutorial')return 'Leve o Hélio até o núcleo estelar.';\n  if(s.mode==='stellarFormation')return 'Atraia moleculas com a gravidade';"
s=replace_once(s,primary,primary2,'movement modal primary')
secondary="function modalSecondaryLine(s=phase()){\n  if(s.mode==='stellarFormation')return '';"
secondary2="function modalSecondaryLine(s=phase()){\n  if(s.mode==='movementTutorial')return 'Selecione o Hélio e escolha uma célula vazia vizinha até chegar ao centro.';\n  if(s.mode==='stellarFormation')return '';"
s=replace_once(s,secondary,secondary2,'movement modal secondary')

special="stellar_recombination:'RECOMBINAÇÃO ESTELAR',coulomb_intro:'BARREIRA DE COULOMB'"
if "stellar_movement:'MOVIMENTAÇÃO ESTELAR'" not in s:
    require(special in s,'phaseIntroTitle special anchor missing')
    s=s.replace(special,"stellar_recombination:'RECOMBINAÇÃO ESTELAR',stellar_movement:'MOVIMENTAÇÃO ESTELAR',coulomb_intro:'BARREIRA DE COULOMB'",1)

family="['brown','he_red','he_orange','he_yellow','solar_wind'"
if "['brown','he_red','stellar_movement','he_orange'" not in s:
    require(family in s,'phaseFamily low-mass anchor missing')
    s=s.replace(family,"['brown','he_red','stellar_movement','he_orange','he_yellow','solar_wind'",1)

# 3) Strict rule for AUTOMATIC chains. The currently active lesson is knowledge
# for manual play, but not for an automatic continuation until the phase is completed.
knowledge="""function campaignKnowledgeReached(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed);
 if(aware)return gs.activeId===id||gs.completed.includes(id);
 const i=phaseIndexById.get(id);return i!==undefined&&state.phaseIndex>=i
}"""
completed=knowledge+"""
function campaignKnowledgeCompleted(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed);
 if(aware)return gs.completed.includes(id);
 const i=phaseIndexById.get(id);return i!==undefined&&state.phaseIndex>i
}"""
if 'function campaignKnowledgeCompleted(id)' not in s:
    require(knowledge in s,'campaignKnowledgeReached exact anchor missing')
    s=s.replace(knowledge,completed,1)

auto_anchor='function autoFusionCandidate(product,s=phase()){'
auto_helpers="""function sameAutoRecipe(a,b){return !!a&&!!b&&a.out===b.out&&same(a.ing||[],b.ing||[])}
function fusionAutoRecipePreviouslyLearned(r){
 if(!r)return false;
 for(const p of PHASES){if(p.mode!=='fusion'||!campaignKnowledgeCompleted(p.id))continue;if(phaseFusionRecipes(p).some(q=>sameAutoRecipe(q,r)))return true}
 for(const pr of PRIMORDIAL_NUCLEAR_REACTIONS){if(!campaignKnowledgeCompleted(pr.unlock))continue;const q=primordialFusionRecipe(pr);if(q&&sameAutoRecipe(q,r))return true}
 return false
}
function neutronAutoTargetPreviouslyLearned(p,s=phase()){
 if(!p)return false;if(universalNeutronCaptureEligible(p)&&campaignKnowledgeCompleted('primordial_d'))return true;
 const tr=neutronTransitionFor(p,s);return !!tr?.phaseId&&campaignKnowledgeCompleted(tr.phaseId)
}
function protonAutoRoutePreviouslyLearned(s=phase()){return s.mode==='rpProcess'?campaignKnowledgeCompleted(s.id):campaignKnowledgeCompleted('proton_capture')}
"""
if 'function fusionAutoRecipePreviouslyLearned(r)' not in s:
    require(auto_anchor in s,'autoFusionCandidate anchor missing')
    s=s.replace(auto_anchor,auto_helpers+auto_anchor,1)

old="for(const cell of neigh[product.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other)continue;const r=exactRecipe([product.sym,other.sym]);if(!r)continue;options.push({other,r,goal:r.out===s.new?1:0})}"
new="for(const cell of neigh[product.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other)continue;const r=exactRecipe([product.sym,other.sym]);if(!r||!fusionAutoRecipePreviouslyLearned(r))continue;options.push({other,r,goal:r.out===s.new?1:0})}"
s=replace_once(s,old,new,'auto fusion knowledge gate')

old="for(const p of state.pieces.values()){if(p.free||p.cell===null||p.cell===undefined||!(neutronEligible(p,s)||universalNeutronCaptureEligible(p)))continue;"
new="for(const p of state.pieces.values()){if(p.free||p.cell===null||p.cell===undefined||!(neutronEligible(p,s)||universalNeutronCaptureEligible(p))||!neutronAutoTargetPreviouslyLearned(p,s))continue;"
s=replace_once(s,old,new,'auto neutron knowledge gate')

old="const target=state.pieces.get(pieceId),s=phase();if(!target||pieceIsUnstable(target)||!protonCaptureRoute(target,s))return;"
new="const target=state.pieces.get(pieceId),s=phase();if(!target||pieceIsUnstable(target)||!protonCaptureRoute(target,s)||!protonAutoRoutePreviouslyLearned(s))return;"
s=replace_once(s,old,new,'auto proton knowledge gate')

# 4) Selection-order symmetry for + / n / - interactions.
# Select a board nucleus first whenever a compatible visible particle already exists.
mixed_sig="function primordialMixedReaction(pieceSym,particleKind){return learnedPrimordialNuclearReactions().find(r=>r.pieces.length===1&&r.particles.length===1&&r.pieces[0]===pieceSym&&r.particles[0]===particleKind)||null}"
particle_helpers=mixed_sig+"""
function boardParticleTargetAvailable(p,s=phase()){
 if(!p||p.free||p.cell===null||p.cell===undefined||!cumulativeParticleInteractionAllowed(s))return false;
 for(const q of state.primordialParticles.values()){
  if(q.reacting)continue;if(primordialMixedReaction(p.sym,q.kind))return true;
  if(q.kind==='p'&&((p.sym==='H'&&stellarProtonRecipe(s))||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))))return true;
 }
 if(s.mode==='neutron'&&state.neutrons.size&&(!neutronGameplay(s).source||state.neutronSourceActivations>=1)&&(neutronEligible(p,s)||universalNeutronCaptureEligible(p)))return true;
 return false
}
function selectBoardParticleTarget(p){state.selected=[p.cell];state.primordialSelected=null;objectiveMotifCancelSelection();tone(330,.04,'sine',.021);render();return true}
"""
if 'function boardParticleTargetAvailable(p,s=phase())' not in s:
    require(mixed_sig in s,'primordialMixedReaction anchor missing')
    s=s.replace(mixed_sig,particle_helpers,1)

# Insert board-first fallback after armed floating-particle handling, before mode returns.
tap_anchor="""  if(armedProton?.kind==='p'){
    const protonRecipe=stellarProtonRecipe(s),pid=armedProton.id;
    if(p.sym==='H'&&protonRecipe){state.selected=[p.cell];render();setTimeout(()=>fuseHydrogenWithProton(p.cell,pid,protonRecipe),70);return}
    if(protonCaptureAvailable(s)){state.selected=[p.cell];render();setTimeout(()=>attemptProtonCapture(p.cell,pid),70);return}
  }
"""
tap_new=tap_anchor+"  if(state.primordialSelected===null&&boardParticleTargetAvailable(p,s)){selectBoardParticleTarget(p);return}\n"
if "boardParticleTargetAvailable(p,s)){selectBoardParticleTarget(p);return}" not in s:
    require(tap_anchor in s,'tapAtom armed proton block missing')
    s=s.replace(tap_anchor,tap_new,1)

# When the board target was selected first, clicking a proton must execute the same
# proton-capture paths that already work in the opposite selection order.
board_mixed="const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p)"
board_plus=board_mixed+";if(p.kind==='p'){const protonRecipe=stellarProtonRecipe(s);if(board.sym==='H'&&protonRecipe){setTimeout(()=>fuseHydrogenWithProton(board.cell,p.id,protonRecipe),70);return}if(protonCaptureAvailable(s)&&protonCaptureRoute(board,s)){setTimeout(()=>attemptProtonCapture(board.cell,p.id),70);return}}"
if board_plus not in s:
    require(board_mixed in s,'tapPrimordialParticle board mixed anchor missing')
    s=s.replace(board_mixed,board_plus,1)

write(p,s)

# ---------------------------------------------------------------------------
# Campaign graph: node after Anã Vermelha, then white dwarf follows tutorial.
# ---------------------------------------------------------------------------
p='assets/js/campaign-graph.js'; g=read(p)
g=g.replace('const G={version:8,','const G={version:9,',1)
g=g.replace('"low_mass_formation","he_red","intermediate_mass_formation"','"low_mass_formation","he_red","stellar_movement","intermediate_mass_formation"',1)
g=g.replace('"red":["low_mass_formation","he_red"]','"red":["low_mass_formation","he_red","stellar_movement"]',1)
g=g.replace('"he_red":{"allOf":["low_mass_formation"]},"intermediate_mass_formation"','"he_red":{"allOf":["low_mass_formation"]},"stellar_movement":{"allOf":["he_red"]},"intermediate_mass_formation"',1)
g=g.replace('"white":{"anyOf":[["he_red"],["bi"]]}','"white":{"anyOf":[["stellar_movement"],["bi"]]}',1)
for token in ['"he_red","stellar_movement","intermediate_mass_formation"','"red":["low_mass_formation","he_red","stellar_movement"]','"stellar_movement":{"allOf":["he_red"]}','"white":{"anyOf":[["stellar_movement"],["bi"]]}']:
    require(token in g,f'campaign graph patch missing {token}')
write(p,g)

# Save migration: players stopped exactly at the old red-dwarf -> white boundary
# are routed through the lesson; already completed white-dwarf saves are preserved.
p='assets/js/campaign-mode.js'; c=read(p)
c=c.replace('function defaults(){return{version:11,','function defaults(){return{version:12,',1)
c=c.replace('...defaults(),...x,version:11,completed','...defaults(),...x,version:12,completed',1)
migration=""" if(previousVersion<12){
  if(next.completed.includes('white')&&!next.completed.includes('stellar_movement'))next.completed=uniq([...next.completed,'stellar_movement']);
  if(next.activeId==='white'&&!next.completed.includes('white')&&next.completed.includes('he_red'))next.activeId='stellar_movement';
 }
"""
anchor=" if(previousVersion<11&&next.activeId==='coulomb_intro'&&!next.completed.includes('coulomb_intro')&&next.completed.includes('he_yellow')){"
if 'if(previousVersion<12)' not in c:
    require(anchor in c,'campaign v11 migration anchor missing')
    c=c.replace(anchor,migration+anchor,1)
require('version:12' in c and "activeId='stellar_movement'" in c,'campaign migration did not apply')
write(p,c)

print('movement tutorial, strict chain knowledge and particle-order symmetry applied')
