from pathlib import Path


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


def replace_between(text, start, end, replacement, label):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f"{label}: start not found")
    b = text.find(end, a + len(start))
    if b < 0:
        raise SystemExit(f"{label}: end not found")
    return text[:a] + replacement.rstrip() + "\n" + text[b:]


js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
test_path = Path('tests/validate-static.js')
readme_path = Path('README.md')
js = js_path.read_text()
css = css_path.read_text()
tests = test_path.read_text()
readme = readme_path.read_text()

anchor = "const ObjectiveReactionMotif=Object.freeze({targetRecipes:objectiveMotifTargetRecipes,eligible:objectiveMotifReactionEligible,reset:objectiveMotifReset});"
generic = r'''

// Objective Interaction Motif: extends the same audiovisual grammar to manual
// particle interactions and to objective interactions outside the stellar fusion grid.
function objectiveInteractionRecipe(key,out='H'){
 const safe=out&&E[out]?out:'H';return{ing:[`@${key}:a`,`@${key}:b`],out:safe,interactionKey:key};
}
function objectiveInteractionParticleGlyph(kind){return kind==='p'?'p':kind==='n'?'n':kind==='e'?'e⁻':kind==='nu'?'ν':kind==='gamma'?'γ':kind==='cosmic'?'✦':'•'}
function objectiveInteractionParticleBackground(kind){
 const map={p:'radial-gradient(circle at 36% 30%,#fff,#ffb795 44%,#bb4a38 78%)',n:'radial-gradient(circle at 36% 30%,#fff,#c5e2ff 44%,#567aa7 78%)',e:'radial-gradient(circle at 36% 30%,#fff,#bce6ff 44%,#4679ae 78%)',nu:'radial-gradient(circle at 36% 30%,#fff,#dacbff 44%,#7859b7 78%)',gamma:'radial-gradient(circle at 36% 30%,#fff,#ffe991 44%,#c89c2c 78%)',cosmic:'radial-gradient(circle at 36% 30%,#fff,#cceaff 44%,#5969c3 78%)'};return map[kind]||map.cosmic;
}
function objectiveInteractionPieceToken(piece){if(!piece)return null;return{x:piece.x,y:piece.y,sym:piece.sym,label:pieceDisplaySymbol(piece),sourceEl:dom.pieces?.querySelector(`[data-id="${piece.id}"]`),particle:false}}
function objectiveInteractionPrimordialToken(p){if(!p)return null;return{x:p.x,y:p.y,kind:p.kind,label:objectiveInteractionParticleGlyph(p.kind),sourceEl:dom.primordial?.querySelector(`[data-id="${p.id}"]`),particle:true}}
function objectiveInteractionNeutronToken(n){if(!n)return null;return{x:n.x,y:n.y,kind:'n',label:'n',sourceEl:dom.neutrons?.querySelector(`[data-id="${n.id}"]`),particle:true}}
function objectiveInteractionCosmicToken(ray,s=phase()){if(!ray)return null;const kind=s.mode==='neutrino'?'nu':s.mode==='gamma'?'gamma':'cosmic';return{x:ray.x,y:ray.y,kind,label:objectiveInteractionParticleGlyph(kind),sourceEl:dom.cosmic?.querySelector(`[data-id="${ray.id}"]`),particle:true}}
function objectiveInteractionNode(token){
 const d=document.createElement('div');d.className='objective-motif-nucleus objective-motif-token'+(token?.particle?' particle':'');d.style.background=token?.sym&&E[token.sym]?elementStyle(token.sym):objectiveInteractionParticleBackground(token?.kind);d.innerHTML=`<span>${token?.label||'•'}</span>`;return d;
}
function objectiveInteractionClearSources(){dom.star?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))}
function objectiveInteractionFinish(ctx){if(!ctx)return;ctx.stage?.remove();objectiveInteractionClearSources();dom.star?.classList.remove('objective-motif-active');state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward()}
async function objectiveInteractionPrepare(key,tokens,out,targetPoint){
 const usable=(tokens||[]).filter(Boolean);if(usable.length!==2)return null;if(state.objectiveMotifActive)objectiveMotifReset();const r=objectiveInteractionRecipe(key,out),run=++state.objectiveMotifRun,stage=document.createElement('div'),size=starSize(),center=size/2,reduced=rewardReducedMotion();state.objectiveMotifActive=true;dom.star.classList.add('objective-motif-active');stage.className='objective-motif-stage objective-interaction-stage';dom.star.appendChild(stage);
 const nodes=usable.map((token,i)=>{const d=objectiveInteractionNode(token);d.style.left=token.x+'px';d.style.top=token.y+'px';d.dataset.side=i?'right':'left';stage.appendChild(d);token.sourceEl?.classList.add('motif-source');return d});
 objectiveMotifPlayNote(r,0);await wait(reduced?28:105);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,1);await wait(reduced?32:75);if(run!==state.objectiveMotifRun)return null;
 nodes[0].style.left=(size*.28)+'px';nodes[1].style.left=(size*.72)+'px';for(const d of nodes){d.style.top=(center*.98)+'px';d.classList.add('aligned')}
 await wait(reduced?70:285);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,2);stage.classList.add('aligned');await wait(reduced?42:115);return{run,stage,nodes,r,targetPoint,center};
}
async function objectiveInteractionPrelude(key,tokens,out,targetPoint){const ctx=await objectiveInteractionPrepare(key,tokens,out,targetPoint);if(!ctx)return null;return(await objectiveMotifConverge(ctx))?ctx:null}
function objectiveInteractionLabelNode(glyph,caption){const d=document.createElement('div');d.className='objective-motif-nucleus result objective-motif-token particle interaction-result';d.style.background=objectiveInteractionParticleBackground('cosmic');d.innerHTML=`<span>${glyph||'•'}</span><small>${caption||'INTERAÇÃO'}</small>`;return d}
async function objectiveInteractionRevealLabel(ctx,glyph,caption,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveInteractionLabelNode(glyph,caption);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,false);RewardDirector.particles(ctx.center,ctx.center,2);vibrate(rewardReducedMotion()?4:[5,8,5]);await wait(reduced?80:235);if(ctx.run!==state.objectiveMotifRun)return;result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?65:175);if(ctx.run!==state.objectiveMotifRun)return;objectiveInteractionFinish(ctx);
}
async function objectiveInteractionRevealPiece(ctx,product,targetPoint){
 if(!ctx||!product)return;renderPieces();const grid=dom.pieces?.querySelector(`[data-id="${product.id}"]`);if(grid)grid.classList.add('motif-grid-product');await objectiveMotifReveal(ctx,product,targetPoint);
}
async function objectiveInteractionImpact(key,tokens,out,targetPoint,glyph,caption='CAPTURA'){
 const ctx=await objectiveInteractionPrelude(key,tokens,out,targetPoint);if(!ctx)return false;await objectiveInteractionRevealLabel(ctx,glyph,caption,targetPoint);return true;
}
const ObjectiveInteractionMotif=Object.freeze({prepare:objectiveInteractionPrepare,prelude:objectiveInteractionPrelude,impact:objectiveInteractionImpact,reveal:objectiveInteractionRevealPiece});
'''
js = once(js, anchor, anchor + generic, 'insert ObjectiveInteractionMotif')
js = once(js, "dom.pieces?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))", "dom.star?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))", 'reset generic motif sources')
js = once(js, "dom.pieces.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))", "dom.star.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))", 'reveal generic motif sources')

prim_pair = r'''async function reactPrimordialParticlePair(r,a,b){
 if(state.locked||!a||!b||a.reacting||b.reacting)return;const s=phase(),x=(a.x+b.x)/2,y=(a.y+b.y)/2,goal=r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;state.primordialSelected=null;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPrimordialToken(a),objectiveInteractionPrimordialToken(b)],r.out,{x,y}):null;
 a.reacting=true;b.reacting=true;if(!motif){a.x=x;a.y=y;b.x=x;b.y=y;renderPrimordialParticles();await wait(260)}state.primordialParticles.delete(a.id);state.primordialParticles.delete(b.id);renderPrimordialParticles();const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}'''
js = replace_between(js, 'async function reactPrimordialParticlePair(r,a,b){', 'async function reactPrimordialMixed(r,piece,particle){', prim_pair, 'primordial particle pair motif')

prim_mixed = r'''async function reactPrimordialMixed(r,piece,particle){
 if(state.locked||!piece||!particle||particle.reacting)return;const s=phase(),x=piece.x,y=piece.y,goal=r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;state.freeSelected=[];state.primordialSelected=null;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(particle)],r.out,{x,y}):null;
 particle.reacting=true;if(!motif){particle.x=x;particle.y=y;renderPrimordialParticles();await wait(220)}state.primordialParticles.delete(particle.id);state.pieces.delete(piece.id);renderPrimordialParticles();renderPieces();const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}'''
js = replace_between(js, 'async function reactPrimordialMixed(r,piece,particle){', 'async function recombineHydrogenParticles(a,b){', prim_mixed, 'primordial mixed motif')

recombine = r'''async function recombineHydrogenParticles(a,b){
 if(state.locked||a.reacting||b.reacting)return;const p=a.kind==='p'?a:b,e=a.kind==='e'?a:b;if(!p||!e)return;const s=phase(),x=(p.x+e.x)/2,y=(p.y+e.y)/2;state.locked=true;state.primordialSelected=null;const motif=await objectiveInteractionPrelude(`atomic:${s.id}:H`,[objectiveInteractionPrimordialToken(p),objectiveInteractionPrimordialToken(e)],'H',{x,y});p.reacting=true;e.reacting=true;state.primordialParticles.delete(p.id);state.primordialParticles.delete(e.id);renderPrimordialParticles();const h=createFreePiece('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1});h.newborn=true;focusPieceInfo(h);state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,h,{x,y});else render();burst(x,y);await emitGamma(x,y);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(h.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}'''
js = replace_between(js, 'async function recombineHydrogenParticles(a,b){', 'async function bindElectronToPiece(piece,electron){', recombine, 'atomic hydrogen motif')

bind_e = r'''async function bindElectronToPiece(piece,electron){
 if(state.locked||!pieceCanBindElectron(piece)||!electron||electron.kind!=='e')return;const s=phase(),x=piece.x,y=piece.y,nextBound=Math.min(E[piece.sym].n,Number(piece.boundElectrons||0)+1),finalNeutral=nextBound>=E[piece.sym].n,objectiveNeutral=s.mode==='atomicRecombination'&&piece.sym===s.new&&finalNeutral;state.locked=true;state.freeSelected=[];state.primordialSelected=null;const key=`atomic:${s.id}:${piece.sym}:e`;const motif=objectiveNeutral?await objectiveInteractionPrelude(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y}):null;if(!objectiveNeutral)await objectiveInteractionImpact(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y},'e⁻','CAPTURA');electron.reacting=true;state.primordialParticles.delete(electron.id);renderPrimordialParticles();piece.boundElectrons=nextBound;piece.matterState='atom';piece.newborn=true;focusPieceInfo(piece);recordFlow(1);if(pieceCharge(piece)===0){state.created[piece.sym]=(state.created[piece.sym]||0)+1;state.discovered.add(piece.sym)}if(motif)await objectiveInteractionRevealPiece(motif,piece,{x,y});else renderPieces();burst(piece.x,piece.y);await emitGamma(piece.x,piece.y);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}'''
js = replace_between(js, 'async function bindElectronToPiece(piece,electron){', 'function invalidPrimordial(id){', bind_e, 'atomic electron motif')

fuse_free = r'''async function fuseFree(r,ids){
 if(state.locked)return;const parts=ids.map(id=>state.pieces.get(id)).filter(Boolean);if(parts.length!==r.pieces.length)return;const s=phase(),x=parts.reduce((n,p)=>n+p.x,0)/parts.length,y=parts.reduce((n,p)=>n+p.y,0)/parts.length,goal=parts.length===2&&r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPieceToken(parts[0]),objectiveInteractionPieceToken(parts[1])],r.out,{x,y}):null;if(!motif){parts.forEach(p=>{p.x=x;p.y=y});renderPieces();await wait(150)}ids.forEach(id=>state.pieces.delete(id));state.freeSelected=[];renderPieces();const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}'''
js = replace_between(js, 'async function fuseFree(r,ids){', 'function stopCosmicRaySystem(){', fuse_free, 'primordial free-piece motif')

fuse_proton = r'''async function fuseHydrogenWithProton(hCell,protonId,r){
 if(state.locked)return;const hId=state.board[hCell],h=state.pieces.get(hId),p=state.primordialParticles.get(protonId);if(!h||h.sym!=='H'||!p||p.kind!=='p')return;
 state.locked=true;state.fusionInProgress=true;state.selected=[hCell];state.primordialSelected=null;const t=pos(coords[hCell]);
 if(coulombRollBlocks(hCell,phase(),h.sym)){await showCoulombTooltip(t.x,t.y);showCoulombBarrier(h);state.coulombRepulsions++;p.coulombDeflect=true;renderPrimordialParticles();tone(165,.10,'sawtooth',.026);vibrate(6);await wait(300);p.coulombDeflect=false;state.primordialSelected=protonId;state.selected=[hCell];state.locked=false;state.fusionInProgress=false;render();return}
 const motif=await objectiveInteractionPrelude(`proton-fusion:${phase().id}:${r.out}`,[objectiveInteractionPieceToken(h),objectiveInteractionPrimordialToken(p)],r.out,t);p.reacting=true;state.primordialParticles.delete(protonId);state.board[hCell]=null;state.pieces.delete(hId);renderPrimordialParticles();renderPieces();const np=createPiece(r.out,hCell,false);np.x=t.x;np.y=t.y;focusPieceInfo(np);if(pieceIsUnstable(np))np.unstableBornRound=state.nuclearRound+1;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===phase().new?3:1);state.selected=[];if(motif)await objectiveInteractionRevealPiece(motif,np,t);else render();burst(t.x,t.y);await handleReactionEmissions(r,np);await wait(90);await afterNuclearAction({advanceRound:true,forceBoardPulse:true});state.fusionInProgress=false;state.locked=false;ensureOpportunity();render();checkComplete()
}'''
js = replace_between(js, 'async function fuseHydrogenWithProton(hCell,protonId,r){', 'function stellarProtonRecipe(s=phase()){', fuse_proton, 'stellar proton fusion motif')

atlas_complete = r'''async function atlasCompleteChannel(sp,cells,ids,{endothermic=false}={}){
 const target=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0],t=pos(coords[target]),pieces=ids.map(id=>state.pieces.get(id)).filter(Boolean);
 if(sp.category==='competing')await atlasShowBranches(sp,t.x,t.y);if(endothermic){atlasEnergyInflow(t.x,t.y);await wait(520)}const motif=pieces.length===2?await objectiveInteractionPrelude(`atlas:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.mainSym,t):null;
 cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));renderPieces();const product=createPiece(sp.mainSym,target,false,{massNumber:sp.mainA});product.x=t.x;product.y=t.y;product.newborn=true;focusPieceInfo(product);state.created[sp.mainSym]=(state.created[sp.mainSym]||0)+1;state.discovered.add(sp.mainSym);state.atlasProgress++;recordFlow(1);state.selected=[];delete state.atlasBarrierPassed[atlasPairKey(ids)];if(motif)await objectiveInteractionRevealPiece(motif,product,t);else renderPieces();burst(t.x,t.y);if(sp.channel==='gamma')await emitGamma(t.x,t.y);else await atlasCreateSecondary(sp,target,t.x,t.y);setTimeout(()=>{const q=state.pieces.get(product.id);if(q){q.newborn=false;renderPieces()}},360);await afterNuclearAction({advanceRound:true,replenish:true,protectedPieceIds:[product.id]});ensureAtlasOpportunity();render();checkComplete();
}'''
js = replace_between(js, 'async function atlasCompleteChannel(sp,cells,ids,{endothermic=false}={}){', 'async function atlasCreateFragmentCompound(sp,cells,ids){', atlas_complete, 'atlas completion motif')

atlas_fragment = r'''async function atlasCreateFragmentCompound(sp,cells,ids){
 const target=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0],t=pos(coords[target]),pieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),motif=pieces.length===2?await objectiveInteractionPrelude(`atlas-fragment:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.compound,t):null;cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));renderPieces();const compound=createPiece(sp.compound,target,false,{massNumber:sp.compoundA});compound.x=t.x;compound.y=t.y;compound.atlasCompound=true;compound.atlasSpecId=sp.id;compound.atlasLabel=`${infoSymbolFor(sp.compound)}*`;armPieceInstability(compound,{rounds:sp.rounds,mode:'atlasFragment',label:sp.label},state.nuclearRound+1);focusPieceInfo(compound);state.selected=[];delete state.atlasBarrierPassed[atlasPairKey(ids)];if(motif)await objectiveInteractionRevealPiece(motif,compound,t);else renderPieces();burst(t.x,t.y);tone(390,.12,'sawtooth',.03);await afterNuclearAction({advanceRound:true,replenish:true,protectedPieceIds:[compound.id]});ensureAtlasOpportunity();render();
}'''
js = replace_between(js, 'async function atlasCreateFragmentCompound(sp,cells,ids){', 'async function resolveAtlasFragment(piece){', atlas_fragment, 'atlas fragment motif')

old_inaccessible = """ if(sp.category==='inaccessible'){\n   await atlasApproachAndReturn(ids,true);state.atlasProgress++;recordFlow(1);state.selected=[];ensureAtlasOpportunity();state.locked=false;render();checkComplete();return;\n }"""
new_inaccessible = """ if(sp.category==='inaccessible'){\n   const ctx=pieces.length===2?await objectiveInteractionPrelude(`atlas-inaccessible:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.mainSym,t):null;if(ctx)await objectiveInteractionRevealLabel(ctx,'×','SEM FUSÃO',t);else await atlasApproachAndReturn(ids,false);await advanceNuclearRound();state.atlasProgress++;recordFlow(1);state.selected=[];ensureAtlasOpportunity();state.locked=false;render();checkComplete();return;\n }"""
js = once(js, old_inaccessible, new_inaccessible, 'atlas inaccessible motif')

source_fun = r'''async function activateNeutronSource(source,helium,s=phase()){
 if(state.locked||!source||!helium)return;const g=neutronGameplay(s);state.locked=true;const at={x:source.x,y:source.y},sourceCell=source.cell,heCell=helium.cell;await teachProductOnce('neutronSource',at.x,at.y);const motif=await objectiveInteractionPrelude(`neutron-source:${s.id}:${g.source}`,[objectiveInteractionPieceToken(source),objectiveInteractionPieceToken(helium)],g.sourceProduct||'O',at);state.board[sourceCell]=null;state.board[heCell]=null;state.pieces.delete(source.id);state.pieces.delete(helium.id);renderPieces();const product=createPiece(g.sourceProduct||'O',sourceCell,false);product.x=at.x;product.y=at.y;state.neutronSourceActivations++;state.neutronPulsesObserved++;state.selected=[];recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,product,at);else renderPieces();burst(at.x,at.y);captureTag(at.x,at.y,g.source==='C13'?'¹³C(α,n)':'²²Ne(α,n)');vibrate([8,14,8]);const count=Math.max(2,g.sourceBurst||4);for(let i=0;i<count;i++)spawnGeneratedNeutron(at.x+(Math.random()-.5)*18,at.y+(Math.random()-.5)*18);renderNeutrons();await wait(220);await afterNuclearAction({advanceRound:true});state.locked=false;ensureOpportunity();render();checkComplete();
}'''
js = replace_between(js, 'async function activateNeutronSource(source,helium,s=phase()){', '\n\nfunction tapAtom(id){', source_fun, 'neutron source motif')

# Successful neutron uses: replace the projectile flight with the interaction ceremony.
old = """   const branchTr=p.neutronBetaTransition;if(!branchTr)return;await teachProductOnce('branching',p.x,p.y);state.selectedNeutron=null;const el=dom.neutrons.querySelector(`[data-id=\"${id}\"]`);if(el){el.style.transition='left .24s ease-in,top .24s ease-in,opacity .24s';el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity='0'}state.locked=true;await wait(230);state.neutrons.delete(id);state.neutronBranchesObserved++;"""
new = """   const branchTr=p.neutronBetaTransition;if(!branchTr)return;await teachProductOnce('branching',p.x,p.y);state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:branch:${p.sym}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],branchTr.to||p.sym,{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();state.neutronBranchesObserved++;"""
js = once(js, old, new, 'branch neutron motif')
old = """   state.selectedNeutron=null;const el=dom.neutrons.querySelector(`[data-id=\"${id}\"]`);if(el){el.style.transition='left .26s ease-in,top .26s ease-in,transform .26s ease-in,opacity .26s';el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.transform='translate(-50%,-50%) scale(.3)';el.style.opacity='0'}\n   state.locked=true;await wait(250);state.neutrons.delete(id);p.sym='D';"""
new = """   state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:H>D`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],'D',{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();p.sym='D';"""
js = once(js, old, new, 'universal neutron motif')
old = """   state.selectedNeutron=null;const shellEl=dom.neutrons.querySelector(`[data-id=\"${id}\"]`);if(shellEl){shellEl.style.transition='left .24s ease-in,top .24s ease-in,opacity .24s';shellEl.style.left=p.x+'px';shellEl.style.top=p.y+'px';shellEl.style.opacity='0'}state.locked=true;await wait(230);state.neutrons.delete(id);p.neutronShellExposure=(p.neutronShellExposure||0)+1;"""
new = """   state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:shell:${p.sym}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],p.sym,{x:p.x,y:p.y},'n','EXPOSIÇÃO');state.neutrons.delete(id);renderNeutrons();p.neutronShellExposure=(p.neutronShellExposure||0)+1;"""
js = once(js, old, new, 'shell neutron motif')
old = """ state.selectedNeutron=null;const el=dom.neutrons.querySelector(`[data-id=\"${id}\"]`);\n if(el){el.style.transition='left .26s ease-in,top .26s ease-in,transform .26s ease-in,opacity .26s';el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.transform='translate(-50%,-50%) scale(.3)';el.style.opacity='0'}\n state.locked=true;await wait(250);state.neutrons.delete(id);p.captures=(p.captures||0)+1;"""
new = """ state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:${p.sym}>${tr.to}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],tr.to||p.sym,{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();p.captures=(p.captures||0)+1;"""
js = once(js, old, new, 'normal neutron motif')

old_tunnel = "p.tunneling=true;emitTunnelGhosts(p.x,p.y,target.x,target.y);p.x=target.x;p.y=target.y;renderPrimordialParticles();tone(760,.08,'triangle',.038);await wait(260);state.primordialParticles.delete(protonId);"
new_tunnel = "await objectiveInteractionImpact(`proton:${s.id}:${target.sym}>${route.out}`,[objectiveInteractionPieceToken(target),objectiveInteractionPrimordialToken(p)],route.out,{x:target.x,y:target.y},'p','CAPTURA');state.primordialParticles.delete(protonId);renderPrimordialParticles();"
js = once(js, old_tunnel, new_tunnel, 'proton capture motif')

cosmic = r'''async function fireCosmicRay(rayId,targetId){
 if(state.locked)return;const s=phase(),ray=state.cosmicRays.get(rayId),target=state.pieces.get(targetId),targets=particleTargets(s);if(!ray||!target||!targets.includes(target.sym))return;state.locked=true;state.selectedCosmic=null;const {x,y,cell}=target,source=target.sym,out=ray.product,resultSym=s.mode==='gamma'&&s.isotopeMode?target.sym:out,motif=await objectiveInteractionPrelude(`energetic:${s.id}:${source}:${resultSym}`,[objectiveInteractionPieceToken(target),objectiveInteractionCosmicToken(ray,s)],resultSym,{x,y});state.cosmicRays.delete(rayId);renderCosmicRays();
 if(s.mode==='gamma'&&s.isotopeMode){target.massNumber=Math.max(E[target.sym].n+1,(target.massNumber||(target.sym==='Mo'?100:104))-1);target.newborn=true;state.created[s.new]=(state.created[s.new]||0)+1;recordFlow(3);if(motif)await objectiveInteractionRevealPiece(motif,target,{x,y});else renderPieces();spallFragments(x,y);burst(x,y);captureTag(x,y,'γ,n');vibrate([10,14,10]);setTimeout(()=>{const q=state.pieces.get(target.id);if(q){q.newborn=false;renderPieces()}},340);announce('γ-PROCESSO',`${target.sym} · A=${target.massNumber}`,'O fóton removeu um nêutron; o elemento permaneceu o mesmo, mas o isótopo ficou mais proton-rich.');await afterNuclearAction();state.locked=false;render();checkComplete();if(!state.phaseDone)setTimeout(spawnCosmicRay,120);return}
 if(state.board[cell]===targetId)state.board[cell]=null;state.pieces.delete(targetId);renderPieces();const product=createPiece(out,cell,false);product.x=x;product.y=y;product.newborn=true;focusPieceInfo(product);state.created[out]=(state.created[out]||0)+1;state.discovered.add(out);if(s.mode==='spallation'){if(out===s.new)recordFlow(1)}else recordFlow(out===s.new?3:1);if(motif)await objectiveInteractionRevealPiece(motif,product,{x,y});else renderPieces();spallFragments(x,y);burst(x,y);vibrate([12,18,14]);setTimeout(()=>{const q=state.pieces.get(product.id);if(q){q.newborn=false;renderPieces()}},360);if(!triggerPhaseMilestone()){const tag=s.mode==='neutrino'?'ν-PROCESSO':s.mode==='gamma'?'γ-PROCESSO':'ESPALAÇÃO';announce(tag,`${E[out].name.toUpperCase()} FORMADO`,`${state.created[out]||0}/${s.target}`)}await afterNuclearAction();state.locked=false;render();checkComplete();const chainRoot=startChainEvent('energetic',product.x,product.y);scheduleAutoFusionCascade(product.id,chainRoot,1,'energetic');if(!state.phaseDone)setTimeout(spawnCosmicRay,120)
}'''
js = replace_between(js, 'async function fireCosmicRay(rayId,targetId){', 'function drawLines(){', cosmic, 'cosmic ray motif')

css_add = r'''

/* Objective Interaction Motif extensions */
.objective-motif-nucleus.objective-motif-token.particle{width:clamp(62px,calc(var(--cellSize) * 1.42),94px);height:clamp(62px,calc(var(--cellSize) * 1.42),94px);color:#f8fbff;border-color:rgba(235,247,255,.58);box-shadow:inset 0 0 22px rgba(255,255,255,.24),0 12px 30px rgba(0,0,0,.34),0 0 30px rgba(178,222,255,.20)}
.objective-motif-nucleus.objective-motif-token.particle>span{font-size:clamp(25px,calc(var(--cellSize) * .62),46px);letter-spacing:-.03em;text-shadow:0 2px 8px rgba(0,0,0,.46)}
.objective-motif-nucleus.interaction-result small{max-width:120px;text-align:center}
.star-board.objective-motif-active .motif-source{opacity:.05!important;filter:brightness(.48) saturate(.35)!important;transition:opacity .12s ease,filter .12s ease!important}
'''
if '/* Objective Interaction Motif extensions */' not in css:
    css += css_add

marker = "console.log('\\nValidação estática do Ardua concluída.');\n"
add_tests = r'''ok(engine.includes('const ObjectiveInteractionMotif=Object.freeze')&&engine.includes('objectiveInteractionImpact'),'Objective Interaction Motif generaliza a cerimônia para interações manuais');
ok(engine.includes('reactPrimordialParticlePair')&&engine.includes('primordial:${s.id}:${r.out}')&&engine.includes('reactPrimordialMixed'),'Universo primordial usa a cerimônia nas receitas que avançam o objetivo');
ok(engine.includes('atomic:${s.id}:H')&&engine.includes("'e⁻','CAPTURA'"),'Era atômica usa a cerimônia em recombinação e captura eletrônica');
ok(engine.includes('atlas:${sp.id}')&&engine.includes('atlas-inaccessible:${sp.id}')&&engine.includes("'×','SEM FUSÃO'"),'Atlas de fusões usa motivo em produtos e observações sem fusão');
ok(engine.includes('neutron-source:${s.id}:${g.source}')&&engine.includes('objectiveInteractionNeutronToken(n)'),'processo-s usa a cerimônia na fonte e nas capturas de nêutrons');
ok(engine.includes("'n','EXPOSIÇÃO'")&&engine.includes("'n','CAPTURA'"),'capturas de nêutrons e exposição de casca usam feedback audiovisual');
ok(engine.includes("'p','CAPTURA'")&&engine.includes('proton-fusion:${phase().id}:${r.out}'),'prótons livres usam a cerimônia em captura e fusão assistida');
ok(engine.includes('objectiveInteractionCosmicToken(ray,s)')&&engine.includes('energetic:${s.id}:${source}:${resultSym}'),'raios cósmicos, neutrinos e fótons gama usam a mesma cerimônia');
ok(css.includes('/* Objective Interaction Motif extensions */')&&css.includes('.objective-motif-token.particle')&&css.includes('.objective-motif-active .motif-source'),'CSS inclui partículas ampliadas e perda de contraste das fontes originais');
''' + marker
tests = once(tests, marker, add_tests, 'interaction motif regression tests')

old_doc = "Durante o Reaction Motif, o áudio adaptativo e banners secundários cedem prioridade à reação principal, e `prefers-reduced-motion` reduz o deslocamento visual sem remover a informação sonora. As notas individuais receberam ganho e um harmônico superior para permanecerem audíveis em alto-falantes pequenos; no encerramento da cerimônia, o produto real já está pré-renderizado e oculto na célula de destino, de modo que o overlay apenas entrega a imagem ao tabuleiro e não existe uma segunda transformação visual."
new_doc = old_doc + " A mesma gramática audiovisual também cobre as receitas-objetivo do Universo primordial, a recombinação da Era atômica e as observações do Atlas de fusões. Interações manuais mediadas por partículas — nêutrons, prótons, elétrons, neutrinos, fótons gama e raios cósmicos — usam o mesmo palco de destaque; no processo-s, isso inclui tanto a ativação das fontes `¹³C(α,n)`/`²²Ne(α,n)` quanto as capturas de nêutrons."
if old_doc in readme:
    readme = readme.replace(old_doc, new_doc, 1)
else:
    raise SystemExit('README motif paragraph anchor not found')

js_path.write_text(js)
css_path.write_text(css)
test_path.write_text(tests)
readme_path.write_text(readme)
Path('.github/objective-interaction-motif.py').unlink(missing_ok=True)
Path('.github/workflows/apply-objective-interaction-motif.yml').unlink(missing_ok=True)
