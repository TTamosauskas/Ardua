const fs=require('fs');
const must=(v,m)=>{if(!v)throw new Error(m)};
const once=(s,a,b,m)=>{const n=s.split(a).length-1;must(n===1,`${m}: ${n} anchors`);return s.replace(a,b)};

// Campaign topology: intermediate mass is a single teaching sequence.
{
  const p='assets/js/campaign-graph.js';let s=fs.readFileSync(p,'utf8');
  s=once(s,'"he_yellow":{"allOf":["atomic_li"]},"coulomb_intro":{"anyOf":[["he_orange"],["he_yellow"]]}','"he_yellow":{"allOf":["he_orange"]},"coulomb_intro":{"allOf":["he_yellow"]}','graph intermediate chain');
  fs.writeFileSync(p,s);
}
{
  const p='assets/js/campaign-map.js';let s=fs.readFileSync(p,'utf8');
  s=once(s," mainseq:{orange:xseq(['he_orange']),yellow:xseq(['he_yellow'])},\n",'', 'mainseq branch members');
  const a=s.indexOf(" const mainseq=branchCluster('mainseq',[");
  const b=s.indexOf(" const neutron=branchCluster('neutron',[",a);
  must(a>=0&&b>a,'mainseq cluster bounds');s=s.slice(0,a)+s.slice(b);
  s=once(s,"  {key:'mid',label:'Massa intermediária',visual:'sphere-gold',content:`${mainseq}<div class=\"convergence mainseq-convergence\" data-junction=\"mainseq-convergence\">Evolução estelar</div>${flow(['coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o'])}${structural('Estrela AGB')}${portal('Processo-s',G.sequences.sprocess,false,'s')}${flow(['white'])}`},","  {key:'mid',label:'Massa intermediária',visual:'sphere-gold',content:`${flow(G.sequences.mid)}${structural('Estrela AGB')}${portal('Processo-s',G.sequences.sprocess,false,'s')}${flow(['white'])}`},",'linear intermediate map');
  const infer=/\n if\(!branchSelection\.mainseq\)\{[\s\S]*?\n \}/;must(infer.test(s),'mainseq selection inference');s=s.replace(infer,'');
  const da=s.indexOf('function drawMid(){'),db=s.indexOf('\nfunction drawHigh(){',da);must(da>=0&&db>da,'drawMid bounds');
  s=s.slice(0,da)+`function drawMid(){\n const midSphere=branchSphereEl('stellar','mid');\n addPath(midSphere,byPhase('he_orange'),'mid',.40);\n connectTrail(['he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li'],'mid');\n const sPortal=portalSummary('s');\n if(portalOpen('s')){addPath(sPortal,portalFirst('s'),'mid');connectTrail(G.sequences.sprocess,'mid');addPath(portalLast('s'),byPhase('white'),'mid')}\n}\n`+s.slice(db+1);
  must(!s.includes("branchCluster('mainseq'"),'mainseq cluster remains');
  fs.writeFileSync(p,s);
}

// Engine: cumulative knowledge and interactions.
{
  const p='assets/js/ardua.js';let s=fs.readFileSync(p,'utf8');

  s=once(s,
    "function learnedPrimordialNuclearReactions(){return PRIMORDIAL_NUCLEAR_REACTIONS.filter(r=>{const i=phaseIndexById.get(r.unlock);return i!==undefined&&state.phaseIndex>=i})}",
`function campaignKnowledgeReached(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed);
 if(aware)return gs.activeId===id||gs.completed.includes(id);
 const i=phaseIndexById.get(id);return i!==undefined&&state.phaseIndex>=i
}
function learnedPrimordialNuclearReactions(){return PRIMORDIAL_NUCLEAR_REACTIONS.filter(r=>campaignKnowledgeReached(r.unlock))}`,
    'primordial knowledge');
  s=once(s,"function atomicRecombinationLearned(sym){const id=atomicRecipeUnlock(sym),i=id?phaseIndexById.get(id):undefined;return i!==undefined&&state.phaseIndex>=i}","function atomicRecombinationLearned(sym){const id=atomicRecipeUnlock(sym);return !!id&&campaignKnowledgeReached(id)}",'atomic knowledge');
  s=once(s,"function universalNeutronCaptureEligible(p){return !!(state.neutronCaptureUnlocked&&p&&p.sym==='H')}","function universalNeutronCaptureEligible(p){return !!(campaignKnowledgeReached('primordial_d')&&p&&p.sym==='H')}",'H+n learned rule');

  const nla=s.indexOf('function allLearnedNeutronTransitions(){'),nlb=s.indexOf('\nfunction neutronTransitionEnvironmentAllows',nla);must(nla>=0&&nlb>nla,'neutron learned bounds');
  s=s.slice(0,nla)+`function allLearnedNeutronTransitions(){
 const map=new Map();
 for(const p of PHASES){
   if(!campaignKnowledgeReached(p.id))continue;
   const cls=neutronProcessClass(p);if(!cls)continue;
   for(const tr of phaseNeutronTransitions(p))map.set(\`${'${tr.from}'}>${'${tr.to}'}@${'${cls}'}\`,{...tr,processClass:cls})
 }
 return[...map.values()]
}`+s.slice(nlb);

  s=once(s,
`function activeFusionRecipes(){
  const s=phase(),map=new Map();
  for(const r of learnedFusionRecipes()){
    if(!recipeEnvironmentAllows(r,s))continue;
    map.set(recipeKey(r),r);
  }
  return[...map.values()]
}`,
`function primordialFusionRecipe(r){return{...r,ing:[...(r.pieces||[])],primordialCarry:true}}
function activeFusionRecipes(){
  const s=phase(),map=new Map();
  for(const r of learnedFusionRecipes()){
    if(!recipeEnvironmentAllows(r,s))continue;
    map.set(recipeKey(r),r);
  }
  if(fusionSandboxAllowed(s))for(const pr of learnedPrimordialNuclearReactions()){
    if(pr.particles.length||pr.pieces.length<2)continue;
    const r=primordialFusionRecipe(pr);map.set(recipeKey(r),r);
  }
  return[...map.values()]
}`,'active cumulative fusion catalog');

  const renderAnchor='function renderPrimordialParticles(){';must(s.includes(renderAnchor),'render primordial anchor');
  s=s.replace(renderAnchor,`function cumulativeParticleInteractionAllowed(s=phase()){return !!s&&s.mode!=='opening'&&learnedPrimordialNuclearReactions().length>0}
function ensureCumulativeParticleFuel(s=phase()){
 if(!s||isPrimordial(s)||!cumulativeParticleInteractionAllowed(s))return;
 ensurePrimordialParticleMix({p:2,n:2,e:atomicRecombinationLearned('H')?2:0});startPrimordialDrift();
}
${renderAnchor}`);
  s=once(s,"if(!dom.primordial)return;const s=phase(),primordialActive=isPrimordial(s)&&s.mode!=='opening',canUseStellarProton=!!stellarProtonRecipe(s)||protonCaptureAvailable(s),selectedParticle=", "if(!dom.primordial)return;const s=phase(),primordialActive=isPrimordial(s)&&s.mode!=='opening',canUseCumulative=cumulativeParticleInteractionAllowed(s),canUseStellarProton=!!stellarProtonRecipe(s)||protonCaptureAvailable(s),selectedParticle=",'render cumulative flag');
  s=once(s,"dom.primordial.classList.toggle('active',(primordialActive||canUseStellarProton)&&!state.locked)","dom.primordial.classList.toggle('active',(primordialActive||canUseStellarProton||canUseCumulative)&&!state.locked)",'particle layer active');
  s=once(s,
`   }else if(canUseStellarProton&&!p.reacting){
     if(p.kind==='p'&&selectedBoardPiece){candidate=!!((stellarProtonRecipe(s)&&selectedBoardPiece.sym==='H')||(protonCaptureAvailable(s)&&protonCaptureRoute(selectedBoardPiece,s)));interactive=candidate}
     else interactive=p.kind==='p';
   }`,
`   }else if((canUseStellarProton||canUseCumulative)&&!p.reacting){
     if(selectedBoardPiece){candidate=!!primordialMixedReaction(selectedBoardPiece.sym,p.kind)||(p.kind==='p'&&((stellarProtonRecipe(s)&&selectedBoardPiece.sym==='H')||(protonCaptureAvailable(s)&&protonCaptureRoute(selectedBoardPiece,s))));interactive=candidate}
     else if(selectedParticle&&selectedParticle.id!==id){candidate=!!primordialParticlePairReaction([selectedParticle.kind,p.kind])||(atomicRecombinationLearned('H')&&same([selectedParticle.kind,p.kind],['p','e']));interactive=candidate||state.primordialSelected===id}
     else{interactive=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&['H','He','Li'].some(atomicRecombinationLearned))||(p.kind==='p'&&canUseStellarProton)}
   }`,'post primordial particle interactions');

  const tapIdx=s.indexOf('function tapPrimordialParticle(id){');must(tapIdx>=0,'tap particle anchor');
  const helpers=`async function reactCumulativeProcessNeutronWithProton(proton,n){
 const r=primordialParticlePairReaction(['p','n']);if(!r||state.locked||!proton||!n)return;
 const x=(proton.x+n.x)/2,y=(proton.y+n.y)/2;state.locked=true;state.primordialSelected=null;state.selectedNeutron=null;
 await objectiveInteractionImpact(\`cumulative:${'${phase().id}'}:p+n>D\`,[objectiveInteractionPrimordialToken(proton),objectiveInteractionNeutronToken(n)],'D',{x,y},'γ','FUSÃO');
 state.primordialParticles.delete(proton.id);state.neutrons.delete(n.id);renderPrimordialParticles();renderNeutrons();
 const out=createFreePiece('D',x,y,{massNumber:2});out.newborn=true;state.created.D=(state.created.D||0)+1;state.discovered.add('D');focusPieceInfo(out);burst(x,y);await emitGamma(x,y);await afterNuclearAction({advanceRound:true});
 setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
async function reactCumulativeBoardMixed(r,piece,particle){
 if(!r||state.locked||!piece||!particle||particle.reacting)return;const x=piece.x,y=piece.y;state.locked=true;state.selected=[];state.primordialSelected=null;
 await objectiveInteractionImpact(\`cumulative:${'${phase().id}'}:${'${piece.sym}'}+${'${particle.kind}'}>${'${r.out}'}\`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(particle)],r.out,{x,y},particle.kind,'CAPTURA');
 particle.reacting=true;state.primordialParticles.delete(particle.id);renderPrimordialParticles();piece.sym=r.out;piece.massNumber=r.mass??E[r.out]?.mass??null;piece.captures=0;piece.newborn=true;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);focusPieceInfo(piece);burst(x,y);await handleReactionEmissions(r,piece);await afterNuclearAction({advanceRound:true});
 setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
async function reactCumulativeProcessNeutronMixed(r,piece,n){
 if(!r||state.locked||!piece||!n)return;const x=piece.x,y=piece.y,wasFree=!!piece.free;state.locked=true;state.selected=[];state.freeSelected=[];state.selectedNeutron=null;
 await objectiveInteractionImpact(\`cumulative:${'${phase().id}'}:${'${piece.sym}'}+n>${'${r.out}'}\`,[objectiveInteractionPieceToken(piece),objectiveInteractionNeutronToken(n)],r.out,{x,y},'n','CAPTURA');state.neutrons.delete(n.id);renderNeutrons();let out=piece;
 if(wasFree){state.pieces.delete(piece.id);out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive})}else{out.sym=r.out;out.massNumber=r.mass??E[r.out]?.mass??null;out.captures=0}
 out.newborn=true;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);focusPieceInfo(out);burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
`;
  s=s.slice(0,tapIdx)+helpers+s.slice(tapIdx);

  s=once(s,"if(!isPrimordial(s)){if(stellarProtonRecipe(s)||protonCaptureAvailable(s))return tapStellarProton(id);return}",
`if(!isPrimordial(s)){
 const p=preview;if(!p||p.reacting||p.dragging||state.locked||state.phaseDone)return;
 const processN=state.selectedNeutron!==null?state.neutrons.get(state.selectedNeutron):null;
 if(processN&&p.kind==='p'&&primordialParticlePairReaction(['p','n']))return reactCumulativeProcessNeutronWithProton(p,processN);
 const free=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null;if(free){if(p.kind==='e'&&pieceCanBindElectron(free))return bindElectronToPiece(free,p);const mixed=primordialMixedReaction(free.sym,p.kind);if(mixed)return reactPrimordialMixed(mixed,free,p)}
 const board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;if(board){const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p)}
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
 if(state.primordialSelected!==null){const first=state.primordialParticles.get(state.primordialSelected);if(first){if(atomicRecombinationLearned('H')&&same([first.kind,p.kind],['p','e']))return recombineHydrogenParticles(first,p);const pair=primordialParticlePairReaction([first.kind,p.kind]);if(pair)return reactPrimordialParticlePair(pair,first,p)}}
 if(cumulativeParticleInteractionAllowed(s)&&learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))){state.primordialSelected=id;tone(p.kind==='e'?460:p.kind==='n'?420:340,.04);render();return}
 if(p.kind==='p'&&(stellarProtonRecipe(s)||protonCaptureAvailable(s)))return tapStellarProton(id);return
}`,'post primordial tap logic');

  s=once(s,"function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();","function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);",'free cumulative pieces');
  s=once(s," const armedProton=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;\n if(armedProton?.kind==='p'){"," const armedProton=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;\n if(armedProton){const mixed=primordialMixedReaction(p.sym,armedProton.kind);if(mixed){state.selected=[p.cell];render();reactCumulativeBoardMixed(mixed,p,armedProton);return}}\n if(armedProton?.kind==='p'){",'board mixed cumulative particle');

  s=once(s,
`async function captureNeutron(id){
 focusParticleInfo('n',id);if(state.locked||phase().mode!=='neutron')return;
 const n=state.neutrons.get(id);if(!n)return;
 const s=phase();`,
`async function captureNeutron(id){
 focusParticleInfo('n',id);if(state.locked)return;
 const n=state.neutrons.get(id);if(!n)return;const s=phase(),particle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null,free=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null,board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;
 if(particle?.kind==='p'&&primordialParticlePairReaction(['p','n'])){reactCumulativeProcessNeutronWithProton(particle,n);return}
 if(free){const r=primordialMixedReaction(free.sym,'n');if(r){reactCumulativeProcessNeutronMixed(r,free,n);return}}
 if(board){const r=primordialMixedReaction(board.sym,'n');if(r){reactCumulativeProcessNeutronMixed(r,board,n);return}}
 if(s.mode!=='neutron')return;`,'process neutron cumulative bridge');

  s=once(s,"if(s.mode==='blackhole')state.postInitialMatter=state.pieces.size;const popupShown=showStellarPopup(forcePopup);","if(s.mode==='blackhole')state.postInitialMatter=state.pieces.size;ensureCumulativeParticleFuel(s);const popupShown=showStellarPopup(forcePopup);",'phase cumulative fuel');
  s=once(s,"  const s=phase();if(ensureNeutronMechanicOpportunity(s))return;","  const s=phase();ensureCumulativeParticleFuel(s);if(ensureNeutronMechanicOpportunity(s))return;",'refresh cumulative fuel');

  fs.writeFileSync(p,s);
}

// Permanent regression validator.
fs.mkdirSync('scripts',{recursive:true});
fs.writeFileSync('scripts/validate-cumulative-recipes.js',`const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const gsrc=fs.readFileSync('assets/js/campaign-graph.js','utf8'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(gsrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;
if(JSON.stringify(G.prerequisites.he_yellow)!==JSON.stringify({allOf:['he_orange']}))fail('Anã Amarela deve seguir Anã Laranja');
if(JSON.stringify(G.prerequisites.coulomb_intro)!==JSON.stringify({allOf:['he_yellow']}))fail('Coulomb deve seguir Anã Amarela');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');if(map.includes("branchCluster('mainseq'"))fail('Fork Laranja/Amarela ainda existe');if(!map.includes('flow(G.sequences.mid)'))fail('Sequência intermediária linear ausente');
const s=fs.readFileSync('assets/js/ardua.js','utf8');
for(const t of ["campaignKnowledgeReached(r.unlock)","campaignKnowledgeReached('primordial_d')",'primordialFusionRecipe','cumulativeParticleInteractionAllowed','ensureCumulativeParticleFuel','reactCumulativeProcessNeutronWithProton','reactCumulativeProcessNeutronMixed'])if(!s.includes(t))fail('Arquitetura cumulativa ausente: '+t);
const learned=s.slice(s.indexOf('function allLearnedNeutronTransitions(){'),s.indexOf('function neutronTransitionEnvironmentAllows'));if(learned.includes('state.phaseIndex'))fail('Memória de captura depende do índice linear');if(!learned.includes('campaignKnowledgeReached(p.id)'))fail('Memória de captura deve seguir histórico real');
const cpi=s.slice(s.indexOf('function cumulativeParticleInteractionAllowed'),s.indexOf('function ensureCumulativeParticleFuel'));if(/remnant|pulsar|accretion|blackhole|neutronize/.test(cpi))fail('Camada cumulativa exclui fases posteriores');
const cap=s.slice(s.indexOf('async function captureNeutron(id){'),s.indexOf('function neutronTrajectoryCandidate'));const bridge=cap.indexOf("particle?.kind==='p'");const gate=cap.indexOf("if(s.mode!=='neutron')return");if(bridge<0||gate<0||bridge>gate)fail('p+n deve anteceder o handler específico de captura');
if(!/\{id:'pn_d',unlock:'primordial_d',pieces:\[\],particles:\['p','n'\],out:'D'/.test(s))fail('Receita p+n→D ausente');
console.log('Cumulative recipe regression validation passed.');
`);

// Pages must run the validator on every production deployment.
{
  const p='.github/workflows/pages.yml';let s=fs.readFileSync(p,'utf8'),a='      - name: Upload static site\n';
  if(!s.includes('Validate cumulative recipe architecture')){must(s.includes(a),'Pages upload anchor');s=s.replace(a,'      - name: Validate cumulative recipe architecture\n        run: node scripts/validate-cumulative-recipes.js\n\n'+a);fs.writeFileSync(p,s)}
}

console.log('Migration applied.');
