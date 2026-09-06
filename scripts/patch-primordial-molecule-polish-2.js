const fs=require('fs');
const path='assets/js/ardua.js';
let s=fs.readFileSync(path,'utf8');

function rep(oldText,newText,label){
  if(!s.includes(oldText)){
    if(s.includes(newText)){console.log(`already applied: ${label}`);return;}
    throw new Error(`missing source: ${label}`);
  }
  s=s.replace(oldText,newText);
}

rep("{id:'first_atomic_bonds',branch:'Química primordial · primeiras ligações',title:'Primeiras Ligações Atômicas',meta:'He + H → HeH⁺',new:'HeH+',mode:'primordialMolecule',target:6,visual:'primordialHe'",
    "{id:'first_atomic_bonds',branch:'Química primordial · primeiras ligações',title:'Primeiras Ligações Atômicas',meta:'He + H → HeH⁺',new:'HeH+',mode:'primordialMolecule',target:4,visual:'primordialHe'",
    'first_atomic_bonds target');
rep("{id:'first_nebulae',branch:'Química primordial · primeiras nebulosas',title:'Primeiras Nebulosas',meta:'HeH⁺ + H → H₂',new:'H2',mode:'primordialMolecule',target:6,visual:'primordialH'",
    "{id:'first_nebulae',branch:'Química primordial · primeiras nebulosas',title:'Primeiras Nebulosas',meta:'HeH⁺ + H → H₂',new:'H2',mode:'primordialMolecule',target:4,visual:'primordialH'",
    'first_nebulae target');

rep("function primordialNeutronsStable(s=phase()){return s.mode==='opening'||s.mode==='primordialNuclear'||s.mode==='atomicRecombination'}",
    "function primordialNeutronsStable(s=phase()){return s.mode==='opening'||s.mode==='primordialNuclear'||s.mode==='atomicRecombination'||s.mode==='primordialMolecule'}",
    'stable molecule neutrons');

rep(`async function decayFloatingNeutron(n){
 if(!n||!state.primordialParticles.has(n.id))return;const {x,y}=n;state.primordialParticles.delete(n.id);spawnFloatingParticle('p',x-10,y);spawnFloatingParticle('e',x+10,y);burst(x,y);tone(360,.09,'triangle',.025);await emitAntineutrino(x,y);render()
}`,
`async function decayFloatingNeutron(n){
 if(!n||!state.primordialParticles.has(n.id))return;if(primordialNeutronsStable()){n.unstable=false;n.lifetimeRounds=null;n.bornRound=state.nuclearRound;renderPrimordialParticles();return}const {x,y}=n;state.primordialParticles.delete(n.id);spawnFloatingParticle('p',x-10,y);spawnFloatingParticle('e',x+10,y);burst(x,y);tone(360,.09,'triangle',.025);await emitAntineutrino(x,y);render()
}`,
'decay guard');

rep("function primordialMoleculeBondDistance(){return Math.max(32,Math.min(40,cellSize()*.64))}",
    "function primordialMoleculeBondDistance(){const el=dom.pieces?.querySelector('.atom.atomic-piece'),w=el?parseFloat(getComputedStyle(el).width):0;return Number.isFinite(w)&&w>0?w:Math.max(39,Math.min(window.innerWidth*.097,49))}",
    'touching molecule spacing');

rep(`function positionPrimordialMolecule(m){const a=state.pieces.get(m.members[0]),b=state.pieces.get(m.members[1]);if(!a||!b)return;const d=primordialMoleculeBondDistance(),dx=Math.cos(m.angle)*d/2,dy=Math.sin(m.angle)*d/2;a.x=m.x-dx;a.y=m.y-dy;b.x=m.x+dx;b.y=m.y+dy}
function createPrimordialMolecule(type,a,b,{credit=true,silent=false}={}){`,
`function positionPrimordialMolecule(m){const a=state.pieces.get(m.members[0]),b=state.pieces.get(m.members[1]);if(!a||!b)return;const d=primordialMoleculeBondDistance(),dx=Math.cos(m.angle)*d/2,dy=Math.sin(m.angle)*d/2;a.x=m.x-dx;a.y=m.y-dy;b.x=m.x+dx;b.y=m.y+dy}
async function preparePrimordialMoleculeFormationMotif(type,a,b,targetPoint){if(!a||!b)return null;return objectiveInteractionPrelude(\`molecule:\${phase().id}:\${type}\`,[objectiveInteractionPieceToken(a),objectiveInteractionPieceToken(b)],type,targetPoint)}
async function finishPrimordialMoleculeFormationMotif(ctx,m){
 if(!ctx||!m)return;const reduced=rewardReducedMotion(),members=m.members.map(id=>state.pieces.get(id)).filter(Boolean);renderPieces();objectiveMotifChord(ctx.r,primordialGoalCount()>=Math.max(1,phase().target||1));updateHUD();RewardDirector.particles(ctx.center,ctx.center,3);vibrate(rewardReducedMotion()?5:[6,9,6]);
 for(let i=0;i<ctx.nodes.length;i++){const piece=members[i],node=ctx.nodes[i];if(!piece||!node)continue;node.classList.add('settling');node.style.left=piece.x+'px';node.style.top=piece.y+'px'}
 await wait(reduced?80:245);objectiveInteractionFinish(ctx)
}
function createPrimordialMolecule(type,a,b,{credit=true,silent=false}={}){`,
'molecule formation motif helpers');

rep(`async function formPrimordialHeH(a,b){
 if(state.locked||!canCreatePrimordialHeH(a,b))return;state.locked=true;state.freeSelected=[];const x=(a.x+b.x)/2,y=(a.y+b.y)/2;a.x=x;a.y=y;b.x=x;b.y=y;renderPieces();await wait(170);createPrimordialMolecule('HeH+',a,b,{credit:true});state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();
}`,
`async function formPrimordialHeH(a,b){
 if(state.locked||!canCreatePrimordialHeH(a,b))return;state.locked=true;state.freeSelected=[];const x=(a.x+b.x)/2,y=(a.y+b.y)/2,motif=await preparePrimordialMoleculeFormationMotif('HeH+',a,b,{x,y});if(!motif){a.x=x;a.y=y;b.x=x;b.y=y;renderPieces();await wait(170)}const formed=createPrimordialMolecule('HeH+',a,b,{credit:true,silent:true});burst(x,y);captureTag(x,y,'HeH⁺');if(motif)await finishPrimordialMoleculeFormationMotif(motif,formed);else tone(520,.12,'triangle',.035);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();
}`,
'HeH formation motif');

rep(`async function reactPrimordialHeHWithHydrogen(m,h){
 const s=phase();if(s.id!=='first_nebulae'||state.locked||m?.type!=='HeH+'||!primordialNeutralAtom(h,'H'))return;const members=m.members.map(id=>state.pieces.get(id)).filter(Boolean),he=members.find(p=>p.sym==='He'),bondH=members.find(p=>p.sym==='H');if(!he||!bondH)return;
 state.locked=true;state.freeSelected=[];const x=(m.x+h.x)/2,y=(m.y+h.y)/2;h.x=m.x;h.y=m.y;renderPieces();await wait(170);dissolvePrimordialMolecule(m);const a=Math.random()*Math.PI*2;he.x=x+Math.cos(a)*74;he.y=y+Math.sin(a)*74;bondH.x=x;bondH.y=y;h.x=x;h.y=y;createPrimordialMolecule('H2',bondH,h,{credit:true,silent:true});burst(x,y);captureTag(x,y,'H₂ + He');tone(420,.14,'triangle',.038);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();
}`,
`async function reactPrimordialHeHWithHydrogen(m,h){
 const s=phase();if(s.id!=='first_nebulae'||state.locked||m?.type!=='HeH+'||!primordialNeutralAtom(h,'H'))return;const members=m.members.map(id=>state.pieces.get(id)).filter(Boolean),he=members.find(p=>p.sym==='He'),bondH=members.find(p=>p.sym==='H');if(!he||!bondH)return;
 state.locked=true;state.freeSelected=[];const x=(m.x+h.x)/2,y=(m.y+h.y)/2,motif=await preparePrimordialMoleculeFormationMotif('H2',bondH,h,{x,y});if(!motif){h.x=m.x;h.y=m.y;renderPieces();await wait(170)}dissolvePrimordialMolecule(m);const a=Math.random()*Math.PI*2;he.x=x+Math.cos(a)*74;he.y=y+Math.sin(a)*74;bondH.x=x;bondH.y=y;h.x=x;h.y=y;const formed=createPrimordialMolecule('H2',bondH,h,{credit:true,silent:true});burst(x,y);captureTag(x,y,'H₂ + He');if(motif)await finishPrimordialMoleculeFormationMotif(motif,formed);else tone(420,.14,'triangle',.038);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();
}`,
'H2 formation motif');

rep(`async function recombineHydrogenParticles(a,b){
 if(state.locked||a.reacting||b.reacting)return;const p=a.kind==='p'?a:b,e=a.kind==='e'?a:b;if(!p||!e)return;const s=phase(),x=(p.x+e.x)/2,y=(p.y+e.y)/2;state.locked=true;state.primordialSelected=null;const motif=await objectiveInteractionPrelude(\`atomic:\${s.id}:H\`,[objectiveInteractionPrimordialToken(p),objectiveInteractionPrimordialToken(e)],'H',{x,y});p.reacting=true;e.reacting=true;state.primordialParticles.delete(p.id);state.primordialParticles.delete(e.id);renderPrimordialParticles();const spawn=createParticleReactionProduct('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1}),h=spawn.piece;h.newborn=true;focusPieceInfo(h);state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,h,{x,y});else render();burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(h.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}`,
`async function recombineHydrogenParticles(a,b){
 if(state.locked||a.reacting||b.reacting)return;const p=a.kind==='p'?a:b,e=a.kind==='e'?a:b;if(!p||!e)return;const s=phase(),x=(p.x+e.x)/2,y=(p.y+e.y)/2,moleculePhase=s.mode==='primordialMolecule';state.locked=true;state.primordialSelected=null;const motif=moleculePhase?null:await objectiveInteractionPrelude(\`atomic:\${s.id}:H\`,[objectiveInteractionPrimordialToken(p),objectiveInteractionPrimordialToken(e)],'H',{x,y});p.reacting=true;e.reacting=true;if(moleculePhase){p.x=x;p.y=y;e.x=x;e.y=y;renderPrimordialParticles();await wait(145)}state.primordialParticles.delete(p.id);state.primordialParticles.delete(e.id);renderPrimordialParticles();const spawn=createParticleReactionProduct('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1}),h=spawn.piece;h.newborn=true;focusPieceInfo(h);state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,h,{x,y});else render();burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(h.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}`,
'plain prior H recombination');

rep(`async function bindElectronToPiece(piece,electron){
 if(state.locked||!pieceCanBindElectron(piece)||!electron||electron.kind!=='e')return;const s=phase(),x=piece.x,y=piece.y,nextBound=Math.min(E[piece.sym].n,Number(piece.boundElectrons||0)+1),finalNeutral=nextBound>=E[piece.sym].n,objectiveNeutral=s.mode==='atomicRecombination'&&piece.sym===s.new&&finalNeutral;state.locked=true;state.freeSelected=[];state.primordialSelected=null;const key=\`atomic:\${s.id}:\${piece.sym}:e\`;const motif=objectiveNeutral?await objectiveInteractionPrelude(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y}):null;if(!objectiveNeutral)await objectiveInteractionImpact(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y},'e⁻','CAPTURA');electron.reacting=true;state.primordialParticles.delete(electron.id);renderPrimordialParticles();piece.boundElectrons=nextBound;piece.matterState='atom';piece.newborn=true;focusPieceInfo(piece);recordFlow(1);if(pieceCharge(piece)===0){state.created[piece.sym]=(state.created[piece.sym]||0)+1;state.discovered.add(piece.sym)}if(motif)await objectiveInteractionRevealPiece(motif,piece,{x,y});else renderPieces();burst(piece.x,piece.y);await emitGamma(piece.x,piece.y);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}`,
`async function bindElectronToPiece(piece,electron){
 if(state.locked||!pieceCanBindElectron(piece)||!electron||electron.kind!=='e')return;const s=phase(),x=piece.x,y=piece.y,nextBound=Math.min(E[piece.sym].n,Number(piece.boundElectrons||0)+1),finalNeutral=nextBound>=E[piece.sym].n,objectiveNeutral=s.mode==='atomicRecombination'&&piece.sym===s.new&&finalNeutral,moleculePhase=s.mode==='primordialMolecule';state.locked=true;state.freeSelected=[];state.primordialSelected=null;const key=\`atomic:\${s.id}:\${piece.sym}:e\`;const motif=!moleculePhase&&objectiveNeutral?await objectiveInteractionPrelude(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y}):null;if(!moleculePhase&&!objectiveNeutral)await objectiveInteractionImpact(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y},'e⁻','CAPTURA');electron.reacting=true;if(moleculePhase){electron.x=x;electron.y=y;renderPrimordialParticles();await wait(120)}state.primordialParticles.delete(electron.id);renderPrimordialParticles();piece.boundElectrons=nextBound;piece.matterState='atom';piece.newborn=true;focusPieceInfo(piece);recordFlow(1);if(pieceCharge(piece)===0){state.created[piece.sym]=(state.created[piece.sym]||0)+1;state.discovered.add(piece.sym)}if(motif)await objectiveInteractionRevealPiece(motif,piece,{x,y});else renderPieces();burst(piece.x,piece.y);await emitGamma(piece.x,piece.y);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}`,
'plain prior electron capture');

fs.writeFileSync(path,s);
