from pathlib import Path


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
test_path = Path('tests/validate-static.js')
js = js_path.read_text()
css = css_path.read_text()
tests = test_path.read_text()

# Phase-local state for the manual objective-reaction ceremony.
old_state = "preparedChainRoots:{},nextMatterOrigin:1,objectiveLineages:new Set()};"
new_state = "preparedChainRoots:{},nextMatterOrigin:1,objectiveLineages:new Set(),objectiveMotifSelection:null,objectiveMotifActive:false,objectiveMotifRun:0};"
js = once(js, old_state, new_state, 'objective motif state')

# Keep reward banners and ordinary adaptive reaction audio out of the ceremony itself.
old_director = " const p={kicker:'DESCOBERTA',title:'',text:'',priority:1,duration:1700,kind:'micro',...payload},now=performance.now(),shown=b.classList.contains('show'),current=Number(b.dataset.priority||0);\n if(shown&&(p.priority<current||(p.priority===current&&now-(state.rewardLastShownAt||0)<820))){if(p.priority>=2)state.rewardPending=p;return false}"
new_director = " const p={kicker:'DESCOBERTA',title:'',text:'',priority:1,duration:1700,kind:'micro',...payload};if(state.objectiveMotifActive){if(p.priority>=2)state.rewardPending=p;return false}const now=performance.now(),shown=b.classList.contains('show'),current=Number(b.dataset.priority||0);\n if(shown&&(p.priority<current||(p.priority===current&&now-(state.rewardLastShownAt||0)<820))){if(p.priority>=2)state.rewardPending=p;return false}"
js = once(js, old_director, new_director, 'reward director motif priority')

old_feedback = " if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);if(level>=2)rewardParticles(x,y,level);AdaptiveAudio.reaction(level,k,n);"
new_feedback = " if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);if(!state.objectiveMotifActive&&level>=2)rewardParticles(x,y,level);if(!state.objectiveMotifActive)AdaptiveAudio.reaction(level,k,n);"
js = once(js, old_feedback, new_feedback, 'reaction feedback motif quieting')

# ObjectiveReactionMotif: only a manual two-nucleus fusion that truly advances the
# phase's scientific objective gets the three-note ceremony. Intermediary/rebuild
# reactions keep the normal feedback layer.
anchor = "const AdaptiveAudio=Object.freeze({reaction:adaptiveAudioReaction,resolve:adaptiveAudioResolve});"
motif_code = r'''const AdaptiveAudio=Object.freeze({reaction:adaptiveAudioReaction,resolve:adaptiveAudioResolve});
const OBJECTIVE_MOTIF_ROOTS=Object.freeze([196,220,247,262,294,330]);
function objectiveMotifHash(text=''){let h=17;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function objectiveMotifNotes(r){
 const root=OBJECTIVE_MOTIF_ROOTS[objectiveMotifHash(recipeKey(r))%OBJECTIVE_MOTIF_ROOTS.length],unstable=!!E[r?.out]?.unstable;
 return unstable?[root,root*(4/3),root*1.5]:[root,root*1.25,root*1.5];
}
function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))];tone(f,index===2?.18:.13,index===2?'triangle':'sine',index===2?.032:.026)}
function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes)tone(f,.34,'sine',.013);if(final)tone(notes[0]*2,.38,'triangle',.008)}
function objectiveMotifSameRecipe(a,b){return !!a&&!!b&&recipeKey(a)===recipeKey(b)}
function objectiveMotifTargetRecipes(s=phase()){
 if(s.mode==='whiteCompact'){
   const info=whiteCounts(s),out=[];
   if(info.c<info.targetC)out.push(FUSIONS.C);
   if(info.o<info.targetO&&info.c>info.targetC)out.push(FUSIONS.O);
   return out.filter(Boolean);
 }
 if(s.mode!=='fusion')return[];
 return phaseFusionRecipes(s).filter(r=>r?.out===s.new);
}
function objectiveMotifReactionEligible(r,pieces=[],s=phase()){
 if(!r||state.chainAutoContext||state.phaseDone||state.readyToAdvance||r.ing?.length!==2||pieces.length!==2)return false;
 if(!objectiveMotifTargetRecipes(s).some(q=>objectiveMotifSameRecipe(q,r)))return false;
 if(s.uniqueMatterObjective&&!objectiveLineageIsFresh(s,mergeMatterLineages(pieces)))return false;
 if(s.mode==='whiteCompact'){
   const info=whiteCounts(s);if(r.out==='C')return info.c<info.targetC;if(r.out==='O')return info.o<info.targetO&&info.c>info.targetC;return false;
 }
 return !!s.new&&r.out===s.new&&(state.created[s.new]||0)<Math.max(1,s.target||1);
}
function objectiveMotifCandidateForFirst(piece,s=phase()){
 if(!piece||piece.cell===null||piece.cell===undefined||state.chainAutoContext)return null;
 for(const r of objectiveMotifTargetRecipes(s)){
   if(r.ing?.length!==2||!r.ing.includes(piece.sym))continue;
   for(const cell of neigh[piece.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other||!same([piece.sym,other.sym],r.ing))continue;if(objectiveMotifReactionEligible(r,[piece,other],s))return r}
 }
 return null;
}
function objectiveMotifCancelSelection(){state.objectiveMotifSelection=null}
function objectiveMotifArmFirst(piece,{sound=true}={}){
 const r=objectiveMotifCandidateForFirst(piece);if(!r){objectiveMotifCancelSelection();return false}
 state.objectiveMotifSelection={recipeKey:recipeKey(r),cells:[piece.cell],ready:false};if(sound)objectiveMotifPlayNote(r,0);return true;
}
function objectiveMotifArmSecond(r,cells){
 const sel=state.objectiveMotifSelection,pieces=(cells||[]).map(c=>state.pieces.get(state.board[c])).filter(Boolean);
 if(!sel||sel.recipeKey!==recipeKey(r)||sel.cells?.[0]!==cells?.[0]||!objectiveMotifReactionEligible(r,pieces)){objectiveMotifCancelSelection();return false}
 sel.cells=[...cells];sel.ready=true;objectiveMotifPlayNote(r,1);return true;
}
function objectiveMotifSelectionReady(r,cells){const sel=state.objectiveMotifSelection;return !!sel?.ready&&sel.recipeKey===recipeKey(r)&&same(sel.cells||[],cells||[])}
function objectiveMotifNode(piece,kind='reactant'){
 const d=document.createElement('div'),shown=pieceDisplaySymbol(piece);d.className=`objective-motif-nucleus ${kind}`;d.style.background=elementStyle(piece.sym);d.innerHTML=`<span>${shown}</span>`;return d;
}
function objectiveMotifResultNode(piece){const d=objectiveMotifNode(piece,'result'),name=document.createElement('small');name.textContent=E[piece.sym]?.name||piece.sym;d.appendChild(name);return d}
function objectiveMotifFlushReward(){const next=state.rewardPending;if(!next)return;state.rewardPending=null;setTimeout(()=>{if(!state.objectiveMotifActive)rewardDirectorShow(next)},180)}
function objectiveMotifReset(){
 state.objectiveMotifRun++;state.objectiveMotifActive=false;state.objectiveMotifSelection=null;dom.star?.classList.remove('objective-motif-active');dom.fx?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove());dom.pieces?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));
}
async function objectiveMotifPrepare(r,pieces,targetPoint){
 const run=++state.objectiveMotifRun,stage=document.createElement('div'),size=starSize(),center=size/2,reduced=rewardReducedMotion();state.objectiveMotifActive=true;dom.star.classList.add('objective-motif-active');stage.className='objective-motif-stage';dom.fx.appendChild(stage);
 const nodes=pieces.map((p,i)=>{const d=objectiveMotifNode(p);d.style.left=p.x+'px';d.style.top=p.y+'px';d.dataset.side=i?'right':'left';stage.appendChild(d);dom.pieces.querySelector(`[data-id="${p.id}"]`)?.classList.add('motif-source');return d});
 await wait(reduced?35:70);if(run!==state.objectiveMotifRun)return null;
 nodes[0].style.left=(size*.28)+'px';nodes[1].style.left=(size*.72)+'px';for(const d of nodes){d.style.top=(center*.98)+'px';d.classList.add('aligned')}
 await wait(reduced?70:330);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,2);stage.classList.add('aligned');await wait(reduced?45:135);return{run,stage,nodes,r,targetPoint,center};
}
async function objectiveMotifConverge(ctx){if(!ctx||ctx.run!==state.objectiveMotifRun)return false;const reduced=rewardReducedMotion();for(const d of ctx.nodes){d.style.left=ctx.center+'px';d.style.top=ctx.center+'px';d.classList.add('converging')}await wait(reduced?55:190);return ctx.run===state.objectiveMotifRun}
function objectiveMotifFinalCredit(s=phase()){if(s.mode==='whiteCompact')return objectiveSatisfied(s);return !!s.new&&(state.created[s.new]||0)>=Math.max(1,s.target||1)}
async function objectiveMotifReveal(ctx,product,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveMotifResultNode(product);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,objectiveMotifFinalCredit());updateHUD();RewardDirector.particles(ctx.center,ctx.center,3);vibrate(rewardReducedMotion()?5:[6,9,6]);await wait(reduced?90:310);if(ctx.run!==state.objectiveMotifRun)return;
 result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?70:245);if(ctx.run!==state.objectiveMotifRun)return;ctx.stage.remove();dom.pieces.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.star.classList.remove('objective-motif-active');state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward();
}
function objectiveMotifBarrierBlocked(piece,r){
 const sel=state.objectiveMotifSelection;if(sel?.ready&&sel.recipeKey===recipeKey(r)){const notes=objectiveMotifNotes(r);tone(notes[1]*.75,.13,'sine',.017)}objectiveMotifCancelSelection();if(piece)setTimeout(()=>objectiveMotifArmFirst(piece,{sound:false}),80);
}
const ObjectiveReactionMotif=Object.freeze({targetRecipes:objectiveMotifTargetRecipes,eligible:objectiveMotifReactionEligible,reset:objectiveMotifReset});'''
js = once(js, anchor, motif_code, 'objective motif system')

# Reset the visual/audio ceremony whenever the phase feedback state resets.
old_reset = "function resetChainFeedback(){\n state.chainEvent={id:0,kind:'',step:0,lastAt:0};"
new_reset = "function resetChainFeedback(){\n objectiveMotifReset();state.chainEvent={id:0,kind:'',step:0,lastAt:0};"
js = once(js, old_reset, new_reset, 'objective motif reset hook')

# Selection notes only occur for a pair that can actually credit the target recipe.
old_handle = r'''function handleFusionTap(p){
 const cell=p.cell;if(cell===null||cell===undefined)return false;
 if(state.selected.includes(cell)){state.selected=[];render();return true}
 if(!state.selected.length){
   const canStart=possibleRecipes([p.sym]).some(r=>!!connectedRecipeCluster(r,[cell]));
   if(!canStart&&!canSelectAtomForMovement(p))return false;
   state.selected=[cell];tone(canStart?320:300,.04);render();return true;
 }
 if(!state.selected.some(x=>neigh[x].includes(cell))){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];tone(300,.035);render();return true}return false}
 const test=[...selectedSyms(),p.sym];if(!possibleRecipes(test).length){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];tone(300,.035);render();return true}return false}
 state.selected.push(cell);render();const ex=exactRecipe(test);if(ex)setTimeout(()=>fuse(ex),85);return true;
}'''
new_handle = r'''function handleFusionTap(p){
 const cell=p.cell;if(cell===null||cell===undefined)return false;
 if(state.selected.includes(cell)){state.selected=[];objectiveMotifCancelSelection();render();return true}
 if(!state.selected.length){
   const canStart=possibleRecipes([p.sym]).some(r=>!!connectedRecipeCluster(r,[cell]));
   if(!canStart&&!canSelectAtomForMovement(p))return false;
   state.selected=[cell];if(!objectiveMotifArmFirst(p))tone(canStart?320:300,.04);render();return true;
 }
 if(!state.selected.some(x=>neigh[x].includes(cell))){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];objectiveMotifCancelSelection();if(!objectiveMotifArmFirst(p))tone(300,.035);render();return true}return false}
 const test=[...selectedSyms(),p.sym];if(!possibleRecipes(test).length){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];objectiveMotifCancelSelection();if(!objectiveMotifArmFirst(p))tone(300,.035);render();return true}return false}
 state.selected.push(cell);render();const ex=exactRecipe(test);if(ex){objectiveMotifArmSecond(ex,[...state.selected]);setTimeout(()=>fuse(ex),95)}return true;
}'''
js = once(js, old_handle, new_handle, 'fusion selection motif notes')

# Any invalid reset also discards a half-armed motif.
old_invalid = "function invalid(cell){const id=state.board[cell],el=id?dom.pieces.querySelector(`[data-id=\"${id}\"]`):null;if(el){el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),250)}tone(170,.07,'sawtooth');vibrate(10);state.selected=[];render()}"
new_invalid = "function invalid(cell){const id=state.board[cell],el=id?dom.pieces.querySelector(`[data-id=\"${id}\"]`):null;if(el){el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),250)}tone(170,.07,'sawtooth');vibrate(10);state.selected=[];objectiveMotifCancelSelection();render()}"
js = once(js, old_invalid, new_invalid, 'invalid clears motif')

# Coulomb failure keeps the two selection notes but deliberately withholds the
# third note/chord, then silently re-arms the surviving first ingredient.
old_barrier_end = " await showCoulombTooltip(t.x,t.y);showCoulombBarrier(blockedPiece);state.coulombRepulsions++;captureTag(t.x,t.y,'barreira de Coulomb');tone(165,.10,'sawtooth',.028);vibrate(7);await wait(300);state.selected=[blockedCell];render();return false;"
new_barrier_end = " await showCoulombTooltip(t.x,t.y);showCoulombBarrier(blockedPiece);state.coulombRepulsions++;captureTag(t.x,t.y,'barreira de Coulomb');tone(165,.10,'sawtooth',.028);vibrate(7);await wait(300);state.selected=[blockedCell];objectiveMotifBarrierBlocked(blockedPiece,r);render();return false;"
js = once(js, old_barrier_end, new_barrier_end, 'Coulomb unresolved motif')

# Integrate the visual timeline into the successful target fusion. The objective
# counter and flow are updated before the chord, while ordinary reaction audio is
# muted by objectiveMotifActive; updateHUD() is called exactly at the reveal.
old_fuse_start = "preparedChain=preparedContinuationForFusion(r,cells,target),inputPieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),productLineage=mergeMatterLineages(inputPieces),uniqueGoal=r.out===phase().new&&!!phase().uniqueMatterObjective,objectiveLineageFresh=!uniqueGoal||objectiveLineageIsFresh(phase(),productLineage);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;if(uniqueGoal&&!objectiveLineageFresh)await teachProductOnce('recycledMatter',t.x,t.y);ids.forEach(id=>{"
new_fuse_start = "preparedChain=preparedContinuationForFusion(r,cells,target),inputPieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),productLineage=mergeMatterLineages(inputPieces),uniqueGoal=r.out===phase().new&&!!phase().uniqueMatterObjective,objectiveLineageFresh=!uniqueGoal||objectiveLineageIsFresh(phase(),productLineage),motifEligible=objectiveMotifReactionEligible(r,inputPieces,phase())&&objectiveMotifSelectionReady(r,cells);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;if(uniqueGoal&&!objectiveLineageFresh)await teachProductOnce('recycledMatter',t.x,t.y);const motifCtx=motifEligible?await objectiveMotifPrepare(r,inputPieces,t):null;ids.forEach(id=>{"
js = once(js, old_fuse_start, new_fuse_start, 'fuse motif prepare')

old_fuse_mid = "dom.star.classList.add('pulse');renderPieces();await wait(140);cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));const np=createPiece(r.out,target,false,{lineage:productLineage});"
new_fuse_mid = "dom.star.classList.add('pulse');renderPieces();await wait(140);if(motifCtx)await objectiveMotifConverge(motifCtx);cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));const np=createPiece(r.out,target,false,{lineage:productLineage});"
js = once(js, old_fuse_mid, new_fuse_mid, 'fuse motif convergence')

old_credit = "if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new&&objectiveLineageCredited?3:1,{kind:'nuclear',x:t.x,y:t.y,label:r.out===phase().new&&objectiveLineageCredited?E[r.out].name:null});state.selected=[];burst(t.x,t.y);await handleReactionEmissions(r,np);const milestoneTriggered=triggerPhaseMilestone();tone(350+Math.max(1,E[r.out].n)*8,.09,'triangle',.042);"
new_credit = "if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new&&objectiveLineageCredited?3:1,{kind:'nuclear',x:t.x,y:t.y,label:motifCtx?null:(r.out===phase().new&&objectiveLineageCredited?E[r.out].name:null)});state.selected=[];if(motifCtx)await objectiveMotifReveal(motifCtx,np,t);burst(t.x,t.y);await handleReactionEmissions(r,np);const milestoneTriggered=triggerPhaseMilestone();if(!motifCtx)tone(350+Math.max(1,E[r.out].n)*8,.09,'triangle',.042);"
js = once(js, old_credit, new_credit, 'fuse motif reveal and chord')

old_finally = "}catch(err){console.error(err)}finally{state.fusionInProgress=false;state.locked=false;dom.star.classList.remove('pulse');ensureOpportunity();render()}checkComplete()}"
new_finally = "}catch(err){console.error(err)}finally{if(state.objectiveMotifActive)objectiveMotifReset();state.fusionInProgress=false;state.locked=false;dom.star.classList.remove('pulse');ensureOpportunity();render()}checkComplete()}"
js = once(js, old_finally, new_finally, 'fuse motif fail-safe')

# Visual language: temporary focus inside the star, symmetric reactants, central
# result, and a gentle return to the actual reaction cell.
css_marker = "/* Objective Reaction Motif */"
if css_marker in css:
    raise SystemExit('objective motif CSS already present')
css += r'''

/* Objective Reaction Motif */
.star-board.objective-motif-active .rings,.star-board.objective-motif-active .cells,.star-board.objective-motif-active .stellar-zones{opacity:.34;transition:opacity .28s ease}
.star-board.objective-motif-active .atom:not(.motif-source){opacity:.42;filter:brightness(.67) saturate(.78)}
.star-board.objective-motif-active .atom.motif-source{opacity:.08;box-shadow:none;outline-color:transparent}
.objective-motif-stage{position:absolute;inset:0;z-index:92;pointer-events:none;overflow:visible}
.objective-motif-stage::before{content:"";position:absolute;inset:7%;border-radius:50%;background:radial-gradient(circle at center,rgba(255,255,255,.075),rgba(12,17,34,.16) 42%,rgba(0,0,0,.34) 76%,transparent 100%);opacity:.82;backdrop-filter:blur(.6px)}
.objective-motif-nucleus{position:absolute;width:clamp(72px,calc(var(--cellSize) * 1.72),112px);height:clamp(72px,calc(var(--cellSize) * 1.72),112px);transform:translate(-50%,-50%) scale(.62);border-radius:50%;border:1px solid rgba(255,255,255,.42);display:grid;place-items:center;color:#07080b;box-shadow:inset 0 0 24px rgba(255,255,255,.22),0 12px 28px rgba(0,0,0,.30),0 0 24px rgba(255,255,255,.12);opacity:.78;transition:left .33s cubic-bezier(.18,.78,.2,1),top .33s cubic-bezier(.18,.78,.2,1),transform .26s cubic-bezier(.18,.78,.2,1),opacity .22s ease,filter .24s ease}
.objective-motif-nucleus>span{font-size:clamp(30px,calc(var(--cellSize) * .82),58px);font-weight:950;line-height:1;letter-spacing:-.05em;text-shadow:0 1px 0 rgba(255,255,255,.22)}
.objective-motif-nucleus.aligned{transform:translate(-50%,-50%) scale(1);opacity:1;filter:brightness(1.08);box-shadow:inset 0 0 26px rgba(255,255,255,.26),0 14px 34px rgba(0,0,0,.34),0 0 34px rgba(210,235,255,.22)}
.objective-motif-nucleus.converging{transform:translate(-50%,-50%) scale(.48);opacity:0;filter:brightness(1.45)}
.objective-motif-nucleus.result{z-index:3;transform:translate(-50%,-50%) scale(.45);opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.objective-motif-nucleus.result.visible{transform:translate(-50%,-50%) scale(1.18);opacity:1;filter:brightness(1.16);box-shadow:inset 0 0 28px rgba(255,255,255,.28),0 0 42px rgba(255,245,205,.35),0 16px 36px rgba(0,0,0,.32)}
.objective-motif-nucleus.result small{position:absolute;top:calc(100% + 9px);left:50%;transform:translateX(-50%);white-space:nowrap;color:#f8fbff;text-transform:uppercase;font-size:9px;font-weight:950;letter-spacing:.11em;text-shadow:0 2px 8px #000}
.objective-motif-nucleus.result.settling{transform:translate(-50%,-50%) scale(.52);opacity:.18;filter:brightness(1.08)}
@media(prefers-reduced-motion:reduce){.objective-motif-nucleus{transition:left .08s linear,top .08s linear,transform .08s linear,opacity .08s linear}.objective-motif-stage::before{backdrop-filter:none}.star-board.objective-motif-active .rings,.star-board.objective-motif-active .cells,.star-board.objective-motif-active .stellar-zones{transition:none}}
'''

# Permanent regression coverage for trigger scope, note/chord semantics, visual
# timeline, Coulomb interruption and CSS focus treatment.
marker = "ok(engine.includes(\"if(viable&&!photoReturn&&route.rp&&route.pattern==='waiting')await teachProductOnce('waitingPoint',target.x,target.y)\"),'waiting point é explicado antes da animação de captura');\n"
addition = marker + r'''ok(engine.includes('const ObjectiveReactionMotif=Object.freeze')&&engine.includes("if(s.mode!=='fusion')return[]"),'Reaction Motif é um sistema global mas só escolhe receitas-alvo de fusão manual');
ok(engine.includes('r?.out===s.new')||engine.includes('r.out===s.new'),'receita-alvo do motif precisa produzir o objetivo científico da fase');
ok(engine.includes('state.chainAutoContext')&&engine.includes('objectiveMotifReactionEligible'),'cascatas automáticas não recebem a cerimônia completa do objetivo');
ok(engine.includes('objectiveMotifArmFirst(p)')&&engine.includes('objectiveMotifArmSecond(ex,[...state.selected])'),'primeiro e segundo reagentes da receita-alvo disparam notas próprias');
ok(engine.includes('objectiveMotifPlayNote(r,2)')&&engine.includes('objectiveMotifChord(ctx.r'),'alinhamento toca a terceira nota e o produto resolve com o acorde das três notas');
ok(engine.includes('objectiveMotifSelectionReady(r,cells)')&&engine.includes('objectiveLineageIsFresh'),'motif exige seleção manual pronta e respeita a proveniência anti-reciclagem');
ok(engine.includes('objectiveMotifBarrierBlocked(blockedPiece,r)'),'Barreira de Coulomb interrompe a resolução musical e rearma a tentativa');
ok(engine.includes('await objectiveMotifPrepare')&&engine.includes('await objectiveMotifConverge')&&engine.includes('await objectiveMotifReveal'),'reação-objetivo possui timeline visual preparar → convergir → revelar');
ok(css.includes('/* Objective Reaction Motif */')&&css.includes('.objective-motif-nucleus.result.visible'),'CSS contém a cerimônia visual central da reação-objetivo');
'''
tests = once(tests, marker, addition, 'objective motif tests')

js_path.write_text(js)
css_path.write_text(css)
test_path.write_text(tests)

# The migration is one-shot; no staging files may survive its commit.
Path('tools/apply-objective-reaction-motif.py').unlink(missing_ok=True)
Path('.github/workflows/apply-objective-reaction-motif.yml').unlink(missing_ok=True)
