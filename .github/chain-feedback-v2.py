from pathlib import Path

JS = Path('assets/js/ardua.js')
CSS = Path('assets/css/ardua.css')
js = JS.read_text()
css = CSS.read_text()


def once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, found {n}')
    return text.replace(old, new, 1)


def patch_section(text, start, end, fn, label):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f'{label}: start marker not found')
    if text.find(start, a + 1) >= 0:
        raise SystemExit(f'{label}: start marker not unique')
    b = text.find(end, a + len(start))
    if b < 0:
        raise SystemExit(f'{label}: end marker not found')
    section = text[a:b]
    replacement = fn(section)
    if replacement == section:
        raise SystemExit(f'{label}: patch made no change')
    return text[:a] + replacement + text[b:]

chain_system = r'''// Recompensa global de reações e cascatas causais curtas.
// A ação do jogador mantém o crédito normal; consequências automáticas recebem
// crédito decrescente e nunca podem resolver a fase sozinhas.
const CHAIN_AUTO_FLOW_FACTORS=Object.freeze([.25,.10,0]);
const CHAIN_MAX_PROGRESS_BONUS=.10;
const CHAIN_OBJECTIVE_PROGRESS_FLOOR=.75;
const CHAIN_MAX_AUTO_DEPTH=4;
const CHAIN_EVENT_WINDOW_MS=2200;
let chainEventSeq=0,chainResonanceTimer=null;
function chainKindForPhase(s=phase()){
 if(s.mode==='neutron')return s.rprocess?'r':'neutron';
 if(s.mode==='rpProcess'||s.mode==='protonCapture')return'proton';
 if(['gamma','spallation','neutrino'].includes(s.mode))return'energetic';
 if(s.mode==='guidedDecay'||s.mode==='decayGarden')return'decay';
 if(s.mode==='accretion'||s.mode==='blackhole')return'accretion';
 if(s.mode==='pulsar')return'rotation';
 if(s.mode==='neutronize'||s.mode==='collapseFinal')return'collapse';
 if(s.mode==='fusion'||isPrimordial(s)||s.mode==='whiteCompact')return'nuclear';
 return'reaction';
}
function chainEventTitle(kind){return kind==='r'?'TEMPESTADE-r':kind==='neutron'?'CASCATA DE NÊUTRONS':kind==='proton'?'CADEIA DE PRÓTONS':kind==='energetic'?'RECICLAGEM NUCLEAR':kind==='decay'?'CASCATA DE DECAIMENTOS':kind==='accretion'?'ACREÇÃO':kind==='rotation'?'ROTAÇÃO':kind==='collapse'?'COLAPSO':kind==='nuclear'?'CADEIA NUCLEAR':'CASCATA'}
function resetChainFeedback(){
 state.chainEvent={id:0,kind:'',step:0,lastAt:0};state.chainAutoContext=null;state.chainBonusFlowByRoot={};state.resonance=0;
 if(chainResonanceTimer){clearInterval(chainResonanceTimer);chainResonanceTimer=null}
 document.documentElement.style.setProperty('--resonanceGlow','0');dom.star?.classList.remove('chain-resonance','reaction-reward','reaction-reward-strong');
}
function applyReactionResonance(){const level=Math.max(0,Math.min(1,Number(state.resonance||0)));document.documentElement.style.setProperty('--resonanceGlow',level.toFixed(2));dom.star?.classList.toggle('chain-resonance',level>.035)}
function bumpReactionResonance(amount=.12){
 state.resonance=Math.min(1,Number(state.resonance||0)+Math.max(0,amount));applyReactionResonance();
 if(chainResonanceTimer)return;chainResonanceTimer=setInterval(()=>{state.resonance=Math.max(0,Number(state.resonance||0)-.055);applyReactionResonance();if(state.resonance<=0){clearInterval(chainResonanceTimer);chainResonanceTimer=null}},520);
}
function flashReactionReward(strength=1){if(!dom.star)return;const cls=strength>=3?'reaction-reward-strong':'reaction-reward';dom.star.classList.remove('reaction-reward','reaction-reward-strong');void dom.star.offsetWidth;dom.star.classList.add(cls);setTimeout(()=>dom.star?.classList.remove(cls),strength>=3?520:340)}
function reactionFeedback({kind=null,x=null,y=null,step=1,automatic=false,label=null}={}){
 const k=kind||chainKindForPhase(),n=Math.max(1,Number(step)||1);bumpReactionResonance(.10+Math.min(.30,(n-1)*.065));flashReactionReward(n);
 if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);
 if(n>1){if(Number.isFinite(x)&&Number.isFinite(y))captureTag(x,y,`${chainEventTitle(k)} ×${n}`);const notes=[720,840,960,1080,1200],freq=notes[Math.min(notes.length-1,n-2)];tone(freq,.075,n>=4?'triangle':'sine',Math.min(.038,.018+n*.004));if(n>=4)vibrate(n>=6?[8,16,12,20,14]:[7,12,9]);if(n===4)announce(chainEventTitle(k),'REAÇÕES ENCADEADAS',automatic?'Um produto encontrou uma nova rota compatível.':'Sequência física reconhecida.')}
}
function startChainEvent(kind=chainKindForPhase(),x=null,y=null){const id=++chainEventSeq;state.chainEvent={id,kind,step:1,lastAt:performance.now(),x,y};state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.chainBonusFlowByRoot[id]=0;return id}
function extendChainEvent(rootId,kind,x=null,y=null){
 const now=performance.now(),k=kind||chainKindForPhase();let ev=state.chainEvent;
 if(!ev||ev.id!==rootId||now-(ev.lastAt||0)>CHAIN_EVENT_WINDOW_MS)ev={id:rootId||++chainEventSeq,kind:k,step:1,lastAt:now};
 ev.kind=k;ev.step=Math.min(99,Math.max(1,ev.step||1)+1);ev.lastAt=now;state.chainEvent=ev;reactionFeedback({kind:k,x,y,step:ev.step,automatic:true});return ev.step;
}
function cascadeFlowAward(points,ctx,s=phase()){
 const depth=Math.max(2,Number(ctx?.depth)||2),factor=CHAIN_AUTO_FLOW_FACTORS[Math.min(CHAIN_AUTO_FLOW_FACTORS.length-1,depth-2)]||0,root=String(ctx?.rootId||'0'),cap=Math.max(0,Number(s.flowTarget||0)*CHAIN_MAX_PROGRESS_BONUS),used=Number(state.chainBonusFlowByRoot?.[root]||0),remaining=Math.max(0,cap-used),award=Math.min(Math.max(0,Number(points)||0)*factor,remaining);
 state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.chainBonusFlowByRoot[root]=used+award;return award;
}
function objectiveFlowFloorApplies(s=phase()){return s.mode!=='opening'&&s.id!=='brown'&&s.mode!=='whiteCompact'&&Number(s.flowTarget||0)>0}
function autoFusionCandidate(product,s=phase()){
 if(!product||product.free||product.cell===null||product.cell===undefined||!fusionSandboxAllowed(s))return null;const options=[];
 for(const cell of neigh[product.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other)continue;const r=exactRecipe([product.sym,other.sym]);if(!r)continue;options.push({other,r,goal:r.out===s.new?1:0})}
 options.sort((a,b)=>b.goal-a.goal||(E[b.r.out]?.n||0)-(E[a.r.out]?.n||0));return options[0]||null;
}
function scheduleAutoFusionCascade(pieceId,rootId,depth=1,kind='nuclear'){
 if(depth>=CHAIN_MAX_AUTO_DEPTH)return;setTimeout(async()=>{if(state.phaseDone||state.readyToAdvance||state.locked||state.selected.length||state.primordialSelected!==null)return;const product=state.pieces.get(pieceId),candidate=autoFusionCandidate(product);if(!product||!candidate)return;const ctx={rootId,depth:depth+1,kind,x:product.x,y:product.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[product.cell,candidate.other.cell];render();try{await fuse(candidate.r)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}},240);
}
function neutronTrajectoryCandidate(n,s=phase()){
 if(!n)return null;const speed=Math.hypot(n.vx||0,n.vy||0)||1,ux=(n.vx||0)/speed,uy=(n.vy||0)/speed,tol=Math.max(24,starSize()*.07),options=[];
 for(const p of state.pieces.values()){if(p.free||p.cell===null||p.cell===undefined||!(neutronEligible(p,s)||universalNeutronCaptureEligible(p)))continue;const dx=p.x-n.x,dy=p.y-n.y,forward=dx*ux+dy*uy;if(forward<0||forward>starSize()*.92)continue;const cross=Math.abs(dx*uy-dy*ux);if(cross>tol)continue;options.push({p,score:cross+forward*.025})}
 options.sort((a,b)=>a.score-b.score);return options[0]?.p||null;
}
function scheduleNeutronCascade(rootId,ids,{storm=false}={}){
 const list=[...(ids||[])],maxLinks=storm?3:2;if(!list.length)return;setTimeout(async()=>{let links=0,depth=1;for(const id of list){if(links>=maxLinks||depth>=CHAIN_MAX_AUTO_DEPTH||state.phaseDone||state.readyToAdvance||phase().mode!=='neutron')break;let spins=0;while(state.locked&&spins++<5)await wait(140);if(state.locked||state.selected.length||state.selectedNeutron!==null)break;const n=state.neutrons.get(id),target=neutronTrajectoryCandidate(n);if(!n||!target)continue;depth++;links++;const ctx={rootId,depth,kind:storm?'r':'neutron',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[target.cell];try{await captureNeutron(id)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}await wait(180)}},520);
}
function scheduleAutoProtonCascade(pieceId,rootId,depth=1){
 if(depth>=CHAIN_MAX_AUTO_DEPTH)return;setTimeout(async()=>{if(state.phaseDone||state.readyToAdvance||state.locked||state.selected.length||state.primordialSelected!==null)return;const target=state.pieces.get(pieceId),s=phase();if(!target||pieceIsUnstable(target)||!protonCaptureRoute(target,s))return;const nearby=[...state.primordialParticles.values()].filter(q=>q.kind==='p'&&!q.reacting).map(q=>({q,d:Math.hypot(q.x-target.x,q.y-target.y)})).filter(x=>x.d<=starSize()*.24).sort((a,b)=>a.d-b.d)[0];if(!nearby)return;const ctx={rootId,depth:depth+1,kind:'proton',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[target.cell];try{await attemptProtonCapture(target.cell,nearby.q.id)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}},260);
}
'''

if 'const CHAIN_AUTO_FLOW_FACTORS=' in js:
    raise SystemExit('chain system already present')
js = once(js, 'function currentProgress()', chain_system + '\nfunction currentProgress()', 'insert chain system')

record_start = 'function recordFlow(points=1){'
record_end = 'function phaseMilestoneThreshold'

def replace_record(section):
    return r'''function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;const fx=feedback||{};
 if(ctx&&!ctx.feedbackUsed){extendChainEvent(ctx.rootId,ctx.kind||fx.kind||chainKindForPhase(s),ctx.x??fx.x,ctx.y??fx.y);ctx.feedbackUsed=true}else if(!ctx)reactionFeedback({kind:fx.kind||chainKindForPhase(s),x:fx.x,y:fx.y,step:1,label:fx.label||null});
 if(s.id==='brown')return;
 const target=Math.max(1,s.flowTarget||1),marks=[[.25,'25'],[.5,'50'],[.75,'75']];
 for(const [ratio,key] of marks){if(before<target*ratio&&state.flow>=target*ratio&&!state.flowMilestones.has(key)){state.flowMilestones.add(key);setTimeout(()=>{if(phase()!==s||state.phaseDone)return;announce('PROGRESSO DA FASE',`${key}% DO PROGRESSO`,key==='50'?'Você já domina o gesto desta fase. Continue no seu ritmo.':'Reações compatíveis também contam para este progresso.');},240)}}
}
'''
js = patch_section(js, record_start, record_end, replace_record, 'recordFlow')

old_complete = " const objectiveDone=objectiveSatisfied(s),flowDone=s.id==='brown'||s.mode==='whiteCompact'||state.flow>=Math.max(0,s.flowTarget||0);if(!objectiveDone||!flowDone)return;"
new_complete = " const objectiveDone=objectiveSatisfied(s);if(objectiveDone&&objectiveFlowFloorApplies(s)){const floor=Math.ceil(Math.max(0,s.flowTarget||0)*CHAIN_OBJECTIVE_PROGRESS_FLOOR);if(state.flow<floor)state.flow=floor}\n const flowDone=s.id==='brown'||s.mode==='whiteCompact'||state.flow>=Math.max(0,s.flowTarget||0);if(!objectiveDone||!flowDone)return;"
js = once(js, old_complete, new_complete, 'objective progress floor')

js = once(js, 'state.phaseDone=false;state.readyToAdvance=false;state.flow=0;state.flowMilestones=new Set();', 'state.phaseDone=false;state.readyToAdvance=false;state.flow=0;state.flowMilestones=new Set();resetChainFeedback();', 'phase chain reset')
js = once(js, 'function captureTag(x,y,text){return}', "function captureTag(x,y,text){if(!dom.fx||!Number.isFinite(x)||!Number.isFinite(y)||!text)return null;const d=document.createElement('div');d.className='capture-tag';d.style.left=x+'px';d.style.top=y+'px';d.textContent=text;dom.fx.appendChild(d);setTimeout(()=>d.remove(),780);return d}", 'enable capture tags')

def patch_fuse(section):
    old = 'await afterNuclearAction({advanceRound:true,forceBoardPulse:true,protectedPieceIds:protectedIds})}catch(err)'
    new = "await afterNuclearAction({advanceRound:true,forceBoardPulse:true,protectedPieceIds:protectedIds});const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('nuclear',np.x,np.y),chainDepth=chainCtx?.depth||1;scheduleAutoFusionCascade(np.id,chainRoot,chainDepth,'nuclear')}catch(err)"
    return once(section, old, new, 'fusion continuation anchor')
js = patch_section(js, 'async function fuse(r){', 'function burst(', patch_fuse, 'fuse continuation')

def patch_proton(section):
    old = "state.protonCaptureAttempts[key]=0;ensureProtonCaptureFuel(s.mode==='protonCapture'?3:(rpStep(s)?.fuel==='p'?4:1));state.selected=[];state.locked=false;render();checkComplete();"
    new = "state.protonCaptureAttempts[key]=0;ensureProtonCaptureFuel(s.mode==='protonCapture'?3:(rpStep(s)?.fuel==='p'?4:1));state.selected=[];state.locked=false;render();checkComplete();const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('proton',target.x,target.y),chainDepth=chainCtx?.depth||1;if(!pieceIsUnstable(target))scheduleAutoProtonCascade(target.id,chainRoot,chainDepth);"
    return once(section, old, new, 'proton continuation anchor')
js = patch_section(js, 'async function attemptProtonCapture(', 'function learnedFusionRecipes()', patch_proton, 'proton continuation')

def patch_neutron(section):
    old = ' state.locked=false;ensureOpportunity();render();checkComplete();\n}'
    new = " const cascadeIds=!state.chainAutoContext&&s.rprocess&&!state.selected.length?[...state.neutrons.keys()].filter(nid=>nid!==id).slice(0,5):[],cascadeRoot=cascadeIds.length?startChainEvent('r',p?.x,p?.y):null;\n state.locked=false;ensureOpportunity();render();checkComplete();if(cascadeRoot)scheduleNeutronCascade(cascadeRoot,cascadeIds,{storm:true});\n}"
    return once(section, old, new, 'neutron continuation anchor')
js = patch_section(js, 'async function captureNeutron(id){', 'function captureTag(', patch_neutron, 'neutron continuation')

def patch_cosmic(section):
    old = "await afterNuclearAction();state.locked=false;render();checkComplete();if(!state.phaseDone)setTimeout(spawnCosmicRay,120)\n}"
    new = "await afterNuclearAction();state.locked=false;render();checkComplete();const chainRoot=startChainEvent('energetic',product.x,product.y);scheduleAutoFusionCascade(product.id,chainRoot,1,'energetic');if(!state.phaseDone)setTimeout(spawnCosmicRay,120)\n}"
    suffix=old+'\n'
    if not section.endswith(suffix):
        raise SystemExit('energetic continuation anchor: non-isotope tail not found at function end')
    return section[:-len(suffix)] + new + '\n'
js = patch_section(js, 'async function fireCosmicRay(', 'function drawLines()', patch_cosmic, 'energetic continuation')

css_marker = '/* Reaction feedback + causal cascades */'
if css_marker in css:
    raise SystemExit('cascade CSS already present')
css += r'''

/* Reaction feedback + causal cascades */
.capture-tag{position:absolute;z-index:40;pointer-events:none;transform:translate(-50%,-50%);padding:4px 7px;border:1px solid rgba(255,255,255,.42);border-radius:999px;background:rgba(8,15,30,.80);box-shadow:0 0 16px rgba(161,222,255,.26);color:#f7fbff;font-size:9px;font-weight:900;letter-spacing:.035em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.8);animation:captureTagRise .78s ease-out forwards}
@keyframes captureTagRise{0%{opacity:0;transform:translate(-50%,-30%) scale(.84)}18%{opacity:1;transform:translate(-50%,-58%) scale(1)}100%{opacity:0;transform:translate(-50%,-135%) scale(.94)}}
.star-board.chain-resonance::after{content:"";position:absolute;inset:-5%;z-index:2;pointer-events:none;border-radius:50%;opacity:var(--resonanceGlow,0);background:radial-gradient(circle,transparent 48%,rgba(255,246,190,.10) 61%,rgba(150,222,255,.30) 77%,transparent 92%);box-shadow:0 0 58px rgba(171,226,255,.48);mix-blend-mode:screen;transition:opacity .38s ease;filter:brightness(1.22)}
.star-board.reaction-reward{animation:reactionReward .34s ease-out}.star-board.reaction-reward-strong{animation:reactionRewardStrong .52s ease-out}
@keyframes reactionReward{0%{filter:brightness(1)}42%{filter:brightness(1.24) drop-shadow(0 0 24px rgba(192,235,255,.52))}100%{filter:brightness(1)}}
@keyframes reactionRewardStrong{0%{filter:brightness(1)}38%{filter:brightness(1.46) drop-shadow(0 0 46px rgba(255,238,169,.72))}100%{filter:brightness(1)}}
'''

JS.write_text(js)
CSS.write_text(css)
print('chain feedback v2 migration applied')
