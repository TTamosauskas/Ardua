from pathlib import Path

ENGINE = Path('assets/js/ardua.js')
CSS = Path('assets/css/phase-polish.css')

src = ENGINE.read_text(encoding='utf-8')
css = CSS.read_text(encoding='utf-8')

# 1) Give beta waits a deliberate 1–4 round progression. These values are relative
# gameplay abstractions for the represented isotope/routes, not literal element half-lives.
old = """ set(['weak_s_ga','weak_s_se','nb','la','nd'],'betaWait',{neutronBetaRounds:2});
 set(['weak_s_br','gamma_mo','pd','sn','cs'],'pulse',{neutronPulseSize:4,neutronPulseInterval:1550});
 set(['weak_s_kr','gamma_ru','cd','te'],'pulseStrong',{neutronPulseSize:6,neutronPulseInterval:1900});
 set(['rb','rh','sb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true});"""
new = """ // Tempo β em rodadas é uma escala relativa da rota/isótopo representado, não uma meia-vida literal do elemento.
 set(['weak_s_ga'],'betaWait',{neutronBetaRounds:3});
 set(['weak_s_se'],'betaWait',{neutronBetaRounds:1});
 set(['nb'],'betaWait',{neutronBetaRounds:2});
 set(['la'],'betaWait',{neutronBetaRounds:3});
 set(['nd'],'betaWait',{neutronBetaRounds:4});
 set(['weak_s_br','gamma_mo','pd','sn','cs'],'pulse',{neutronPulseSize:4,neutronPulseInterval:1550});
 set(['weak_s_kr','gamma_ru','cd','te'],'pulseStrong',{neutronPulseSize:6,neutronPulseInterval:1900});
 set(['rb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true});
 set(['rh'],'branch',{neutronBetaRounds:3,requiresNeutronBranch:true});
 set(['sb'],'branch',{neutronBetaRounds:4,requiresNeutronBranch:true});"""
if old not in src:
    raise SystemExit('configureNeutronGameplay anchor not found')
src = src.replace(old, new, 1)

# 2) Persist the start/total rounds so the UI can render an abstract circular progress arc.
old = """function clearNeutronPending(piece){if(!piece)return;piece.neutronBetaPending=false;piece.neutronBetaReadyRound=null;piece.neutronBetaTransition=null;piece.neutronShellExposure=0;piece.neutronShellOpen=false}
function scheduleNeutronBeta(piece,s,tr){
 const g=neutronGameplay(s);piece.captures=0;piece.neutronBetaPending=true;piece.neutronBetaTransition={...tr};piece.neutronBetaReadyRound=state.nuclearRound+g.betaRounds;state.neutronBetaWaits++;state.selected=[];captureTag(piece.x,piece.y,`β− em ${g.betaRounds} rodadas`);tone(590,.08,'sine',.028);renderPieces();
}"""
new = """function clearNeutronPending(piece){if(!piece)return;piece.neutronBetaPending=false;piece.neutronBetaReadyRound=null;piece.neutronBetaStartRound=null;piece.neutronBetaTotalRounds=null;piece.neutronBetaTransition=null;piece.neutronShellExposure=0;piece.neutronShellOpen=false}
function scheduleNeutronBeta(piece,s,tr){
 const g=neutronGameplay(s);piece.captures=0;piece.neutronBetaPending=true;piece.neutronBetaTransition={...tr};piece.neutronBetaStartRound=state.nuclearRound;piece.neutronBetaTotalRounds=g.betaRounds;piece.neutronBetaReadyRound=state.nuclearRound+g.betaRounds;state.neutronBetaWaits++;state.selected=[];captureTag(piece.x,piece.y,`β− iniciado`);tone(590,.08,'sine',.028);renderPieces();
}"""
if old not in src:
    raise SystemExit('beta schedule anchor not found')
src = src.replace(old, new, 1)

# 3) During a wait, guide the next productive chain instead of telling the player to wait.
old = """ const pending=[...state.pieces.values()].find(p=>p.neutronBetaPending);if(pending)return g.pattern==='branch'?`${pending.sym}* · capture outro n ou aguarde β−`:`${pending.sym}* · aguarde β− enquanto reconstrói a cadeia`;"""
new = """ const pendingAll=[...state.pieces.values()].filter(p=>p.neutronBetaPending);
 if(pendingAll.length){
   const status=pendingAll.length===1?`${pieceDisplaySymbol(pendingAll[0])} decaindo`:`${pendingAll.length} núcleos decaindo`;
   const fmtNeutron=tr=>`${E[tr.from]?.name||tr.from} + Nêutron → ${E[tr.to]?.name||tr.to}`;
   const liveSeed=s.seed?[...state.pieces.values()].find(p=>p.sym===s.seed&&!p.neutronBetaPending):null,direct=liveSeed?neutronTransitionFor(liveSeed,s):null;
   if(direct)return `${status} • ${fmtNeutron(direct)}`;
   const rebuild=s.seed?nextExecutableActionTowardSymbol(s.seed,s,new Set()):null;
   if(rebuild){const next=rebuild.kind==='neutron'?fmtNeutron(rebuild.transition):guidanceActionLine(rebuild);if(next)return `${status} • ${next}`}
   return `${status} • β− em andamento`;
 }"""
if old not in src:
    raise SystemExit('pending header anchor not found')
src = src.replace(old, new, 1)

# 4) Render the circular progress indicator as a child of each pending nucleus.
old = """  el.style.background=elementStyle(p.sym);const shownSym=pieceDisplaySymbol(p);el.style.setProperty('--symScale',pieceSymbolScale(p,shownSym));el.innerHTML=`<span class=\"sym\">${shownSym}</span>${cap}`;"""
new = """  el.style.background=elementStyle(p.sym);const shownSym=pieceDisplaySymbol(p);el.style.setProperty('--symScale',pieceSymbolScale(p,shownSym));
  if(p.neutronBetaPending){const total=Math.max(1,p.neutronBetaTotalRounds||neutronGameplay(s).betaRounds),start=p.neutronBetaStartRound??Math.max(0,(p.neutronBetaReadyRound??state.nuclearRound)-total),progress=Math.max(0,Math.min(1,(state.nuclearRound-start)/total));el.style.setProperty('--beta-progress',`${Math.round(progress*100)}%`);el.dataset.betaRemaining=String(Math.max(0,(p.neutronBetaReadyRound??state.nuclearRound)-state.nuclearRound));el.dataset.betaRounds=String(total)}else{el.style.removeProperty('--beta-progress');delete el.dataset.betaRemaining;delete el.dataset.betaRounds}
  const betaRing=p.neutronBetaPending?'<span class=\"beta-progress-ring\" aria-hidden=\"true\"></span>':'';el.innerHTML=`<span class=\"sym\">${shownSym}</span>${cap}${betaRing}`;"""
if old not in src:
    raise SystemExit('renderPieces anchor not found')
src = src.replace(old, new, 1)

# Ensure the engine itself carries the waiting class; phase-polish.js remains a compatibility fallback.
old = """+(pieceIsUnstable(p)?' unstable':'')+(p.longRadioactive?' long-radioactive':'')"""
new = """+(pieceIsUnstable(p)?' unstable':'')+(p.neutronBetaPending?' beta-waiting':'')+(p.longRadioactive?' long-radioactive':'')"""
if old not in src:
    raise SystemExit('atom class anchor not found')
src = src.replace(old, new, 1)

ring_css = r'''

/* Parallel beta decay: abstract circular progress, intentionally without numeric time. */
.atom.beta-waiting{overflow:visible!important}
.atom.beta-waiting .beta-progress-ring{
  position:absolute;
  inset:-6px;
  border-radius:50%;
  pointer-events:none;
  background:conic-gradient(rgba(157,225,255,.96) var(--beta-progress,0%),rgba(157,225,255,.12) 0);
  -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));
  mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));
  filter:drop-shadow(0 0 4px rgba(125,210,255,.42));
}
@media(prefers-reduced-motion:reduce){.atom.beta-waiting .beta-progress-ring{filter:none}}
'''
if 'beta-progress-ring' not in css:
    css += ring_css

ENGINE.write_text(src, encoding='utf-8')
CSS.write_text(css, encoding='utf-8')
print('Applied parallel beta-decay gameplay update')
