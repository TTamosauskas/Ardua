from pathlib import Path


def load(path):
    return Path(path).read_text(encoding='utf-8')


def save(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


def replace_after(text, anchor, old, new, label):
    start = text.find(anchor)
    if start < 0:
        raise SystemExit(f'{label}: anchor missing')
    pos = text.find(old, start)
    if pos < 0:
        raise SystemExit(f'{label}: target missing after anchor')
    if text.find(old, pos + len(old), start + max(8000, len(old) * 4)) >= 0:
        # contextual replacements below are intentionally local; repeated global matches are fine.
        pass
    return text[:pos] + new + text[pos + len(old):]


# ---------------------------------------------------------------------------
# Engine/content
# ---------------------------------------------------------------------------
path = 'assets/js/ardua.js'
text = load(path)

old = """ {id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade',title:'Barreira de Coulomb',meta:'³He + ³He → ⁴He + 2p',new:'He',mode:'fusion',target:3,visual:'redGiant',fill:10,pool:['H'],gravityDelay:143,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'COULOMB',endLabel:'PRODUZIR<br>LÍTIO'},
 {id:'stellar_li',branch:'Gigante vermelha · mecanismo Cameron–Fowler',title:'Produção estelar de Lítio',meta:'³He + ⁴He → ⁷Be + γ · transporte → ⁷Li + νₑ',new:'Li',mode:'fusion',target:4,visual:'redGiant',fill:36,pool:['H','H','H','He','He'],gravityDelay:142,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'⁷Li',endLabel:'ACENDER<br>TRIPLO-ALFA'},"""
new = """ {id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade',title:'Barreira de Coulomb',meta:'³He + ³He → ⁴He + 2p',new:'He',mode:'fusion',target:3,visual:'redGiant',fill:10,pool:['H'],gravityDelay:143,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'COULOMB',endLabel:'APRENDER<br>CONVECÇÃO'},
 {id:'stellar_convection',branch:'Gigante vermelha · transporte de matéria e energia',title:'Convecção Estelar',meta:'Reação no interior → corrente convectiva → transporte radial',new:'He',mode:'convection',target:3,visual:'redGiant',fill:34,pool:['H','H','He','He3'],gravityDelay:142,fusionTempMax:1.2e8,reuseFusion:true,objectiveOnlyProgress:true,menuTag:'CONVECÇÃO',endLabel:'PRODUZIR<br>LÍTIO'},
 {id:'stellar_li',branch:'Gigante vermelha · mecanismo Cameron–Fowler',title:'Produção estelar de Lítio',meta:'³He + ⁴He → ⁷Be + γ · transporte → ⁷Li + νₑ',new:'Li',mode:'fusion',target:4,visual:'redGiant',fill:36,pool:['H','H','H','He','He'],gravityDelay:142,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'⁷Li',endLabel:'ACENDER<br>TRIPLO-ALFA'},"""
text = replace_once(text, old, new, 'insert convection phase')

text = replace_once(
    text,
    "setClass(['atomic_li','brown','he_red','he_orange','he_yellow','coulomb_intro'],'short');",
    "setClass(['atomic_li','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection'],'short');",
    'convection duration class'
)
text = replace_once(
    text,
    "if(['guidedDecay','reactionExplore','spallation','neutrino','gamma','protonCapture','neutronize','remnant','pulsar','accretion','collapseFinal','blackhole'].includes(p.mode)){",
    "if(['guidedDecay','reactionExplore','spallation','neutrino','gamma','protonCapture','convection','neutronize','remnant','pulsar','accretion','collapseFinal','blackhole'].includes(p.mode)){",
    'convection flow budget'
)

# Tutorial board: a fully populated inner region guarantees a nuclear action in rings 0–1,
# while the six outer spoke endpoints guarantee a visible convection destination.
fill_insert = r"""  if(s.mode==='convection'){
    const inner=[...(byRing[0]||[]),...(byRing[1]||[])],used=new Set();
    inner.forEach(cell=>{createPiece('He3',cell,false);used.add(cell)});
    const edgeRing=phaseRadius(s);
    for(const [dq,dr] of dirs){const cell=coordIndex.get(`${dq*edgeRing},${dr*edgeRing}`);if(cell!==undefined&&!used.has(cell)){createPiece('H',cell,false);used.add(cell)}}
    const rest=activeCells().filter(cell=>!used.has(cell)).sort(()=>Math.random()-.5),pool=['H','H','He','He3'];
    const amount=Math.max(0,Math.min((s.fill||34)-used.size,rest.length));
    rest.slice(0,amount).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));
    renderPieces();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces()});return;
  }
"""
text = replace_after(text, 'function fillStage(){', "  if(s.id==='brown'){", fill_insert + "  if(s.id==='brown'){", 'convection tutorial fill')

# Convection system lives beside the existing single-cell movement system.
convection_functions = r"""
function convectionMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('stellar_convection');
 if(intro===undefined||state.phaseIndex<intro||isPrimordial(s)||s.mode==='opening')return false;
 if(['spallation','neutrino','gamma','guidedDecay','decayGarden','explosive','neutronize','collapseFinal'].includes(s.mode)||isPostMode(s))return false;
 return true;
}
function convectionChargePhaseAllows(s=phase(),fx={}){
 if(fx?.kind==='convection')return false;
 if(s.mode==='convection')return fx?.kind==='nuclear';
 return ['fusion','reactionExplore','protonCapture','rpProcess','neutron','whiteCompact'].includes(s.mode);
}
function grantConvectionFromCells(cells,s=phase()){
 if(!convectionMechanicUnlocked(s)||Number(state.convectionCharge||0)>=1||state.chainAutoContext)return false;
 const valid=[...(cells||[])].filter(c=>Number.isInteger(c)&&c>=0&&c<coords.length);
 if(!valid.some(c=>(coords[c]?.ring??99)<=1))return false;
 state.convectionCharge=1;state.convectionArmed=false;
 dom.star?.classList.add('convection-charged-flash');setTimeout(()=>dom.star?.classList.remove('convection-charged-flash'),620);
 tone(520,.08,'triangle',.028);vibrate(6);
 if(s.id==='stellar_convection'&&!state.convectionLessonShown){state.convectionLessonShown=true;setTimeout(()=>toast('Convecção carregada · toque em CONVECÇÃO e escolha uma coluna radial.'),260)}
 renderConvectionControl();return true;
}
function nearestCellToPoint(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;let best=null,dist=Infinity;
 for(const cell of activeCells()){const p=pos(coords[cell]),d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=cell}}
 return best;
}
function maybeChargeConvectionFromAction(s=phase(),fx={}){
 if(!convectionChargePhaseAllows(s,fx))return false;
 const selected=(state.selected||[]).filter(c=>Number.isInteger(c));if(selected.length)return grantConvectionFromCells(selected,s);
 const cell=nearestCellToPoint(fx?.x,fx?.y);return cell===null?false:grantConvectionFromCells([cell],s);
}
function ensureConvectionControl(){
 let b=document.getElementById('convectionBtn');if(b)return b;
 b=document.createElement('button');b.type='button';b.id='convectionBtn';b.className='convection-control';b.setAttribute('aria-label','Convecção estelar');
 b.innerHTML='<span aria-hidden="true">↕</span><small>CONVECÇÃO</small>';
 b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();toggleConvectionArmed()});dom.star.appendChild(b);return b;
}
function renderConvectionControl(){
 const b=ensureConvectionControl(),available=convectionMechanicUnlocked(),charged=Number(state.convectionCharge||0)>0,armed=!!state.convectionArmed;
 b.classList.toggle('show',available);b.classList.toggle('charged',charged);b.classList.toggle('armed',armed);b.disabled=!available||!charged||state.locked||state.phaseDone;b.setAttribute('aria-pressed',armed?'true':'false');
 const small=b.querySelector('small');if(small)small.textContent=armed?(state.selected?.length?'ESCOLHA O EXTERNO':'ESCOLHA O INTERNO'):'CONVECÇÃO';
}
function toggleConvectionArmed(){
 if(!convectionMechanicUnlocked()||state.locked||state.phaseDone)return;
 if(Number(state.convectionCharge||0)<1){toast('Faça uma ação nuclear no centro ou na camada 1 para carregar a convecção.');return}
 state.convectionArmed=!state.convectionArmed;state.selected=[];state.primordialSelected=null;objectiveMotifCancelSelection();tone(state.convectionArmed?410:260,.05,'sine',.022);render();
}
function convectionAxialPoint(c){return{x:Math.sqrt(3)*(c.q+c.r/2),y:1.5*c.r}}
function convectionRadialPathTo(cell){
 if(!Number.isInteger(cell)||!coords[cell]||coords[cell].ring<1)return[];const target=convectionAxialPoint(coords[cell]),path=[cell];let current=cell,guard=0;
 while((coords[current]?.ring||0)>0&&guard++<MAX_RADIUS+2){
   const ring=coords[current].ring,inward=(neigh[current]||[]).filter(n=>(coords[n]?.ring??99)===ring-1);if(!inward.length)return[];
   inward.sort((a,b)=>{const A=convectionAxialPoint(coords[a]),B=convectionAxialPoint(coords[b]),crossA=Math.abs(A.x*target.y-A.y*target.x),crossB=Math.abs(B.x*target.y-B.y*target.x);return crossA-crossB||(A.x-target.x)**2+(A.y-target.y)**2-((B.x-target.x)**2+(B.y-target.y)**2)});
   current=inward[0];path.push(current);
 }
 return path.reverse();
}
function convectionPath(source,dest){
 if(!Number.isInteger(source)||!Number.isInteger(dest)||source===dest)return[];const sr=coords[source]?.ring??99,dr=coords[dest]?.ring??-1;if(sr>1||dr<=sr)return[];
 const full=convectionRadialPathTo(dest),at=full.indexOf(source);return at<0?[]:full.slice(at);
}
function convectionDestinationCells(){
 if(!state.convectionArmed||state.selected.length!==1)return[];const source=state.selected[0],sr=coords[source]?.ring??99;
 return activeCells().filter(cell=>state.board[cell]&&cell!==source&&(coords[cell]?.ring??-1)>sr&&convectionPath(source,cell).length>1);
}
function emitConvectionEnergyPulse(path,index,total){
 if(!dom.fx||!path.length)return;const from=path[Math.min(path.length-1,Math.floor(index*path.length/Math.max(1,total)))],to=path[path.length-1],a=pos(coords[from]),b=pos(coords[to]),inner=(coords[from]?.ring??9)<=1,d=document.createElement('div');
 d.className=`convection-energy ${inner?'gamma':'light'}`;d.textContent=inner?'γ':'✦';d.style.left=a.x+'px';d.style.top=a.y+'px';dom.fx.appendChild(d);
 requestAnimationFrame(()=>{d.style.left=b.x+'px';d.style.top=b.y+'px';d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(.58)'});setTimeout(()=>d.remove(),760);
}
async function performConvection(path){
 if(state.locked||Number(state.convectionCharge||0)<1)return false;const occupied=path.filter(cell=>state.board[cell]);if(occupied.length<2)return false;
 state.locked=true;state.convectionCharge=0;state.convectionArmed=false;state.selected=[];objectiveMotifCancelSelection();
 const ids=occupied.map(cell=>state.board[cell]),reversed=[...ids].reverse(),moves=[];occupied.forEach(cell=>state.board[cell]=null);
 occupied.forEach((cell,i)=>{const id=reversed[i],p=id?state.pieces.get(id):null;if(!p)return;const from=p.cell;state.board[cell]=id;p.cell=cell;p.convecting=true;if(from!==cell)moves.push({id,from,to:cell})});
 dom.star.classList.add('convection-active');renderPieces();[330,415,520,660].forEach((f,i)=>setTimeout(()=>tone(f,.11,'sine',.018+i*.004),i*85));vibrate([8,16,8]);
 requestAnimationFrame(()=>{for(const m of moves){const p=state.pieces.get(m.id);if(p){const q=pos(coords[m.to]);p.x=q.x;p.y=q.y}}renderPieces()});
 moves.forEach((m,i)=>setTimeout(()=>emitConvectionEnergyPulse(path,i,moves.length),80+i*55));await wait(680);
 for(const m of moves){const p=state.pieces.get(m.id);if(p)p.convecting=false}dom.star.classList.remove('convection-active');state.convectionMoves=(state.convectionMoves||0)+1;
 if(phase().mode==='convection')recordFlow(1,{kind:'convection',x:starSize()/2,y:starSize()/2,label:'energia transportada'});
 registerRewardDiscovery('phenomenon:stellarConvection',{title:'CONVECÇÃO ESTELAR',text:'Correntes transportam matéria e energia através do plasma estelar.',silent:true});captureTag(starSize()/2,starSize()*.18,`ENERGIA TRANSPORTADA · ${moves.length}`);
 ensureOpportunity();state.locked=false;render();checkComplete();return true;
}
function handleConvectionTap(p){
 if(!state.convectionArmed)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
 if(!state.selected.length){if(ring>1){toast('Escolha primeiro um núcleo no centro ou na camada 1.');return true}state.selected=[cell];state.primordialSelected=null;tone(330,.05,'sine',.024);render();return true}
 const source=state.selected[0];if(cell===source){state.selected=[];tone(250,.04,'sine',.018);render();return true}
 if(ring<=1){state.selected=[cell];tone(330,.04,'sine',.021);render();return true}
 const path=convectionPath(source,cell);if(path.length<2){toast('Escolha um núcleo externo na coluna convectiva destacada.');return true}performConvection(path);return true;
}
"""
text = replace_once(text, "function fusionCandidateCells(){", convection_functions + "\nfunction fusionCandidateCells(){", 'convection mechanics')

text = replace_once(
    text,
    "function candidateCells(){const s=phase();if(s.mode==='neutronize'||isPostMode()||!state.selected.length)return[];",
    "function candidateCells(){const s=phase();if(state.convectionArmed&&state.selected.length===1)return convectionDestinationCells();if(s.mode==='neutronize'||isPostMode()||!state.selected.length)return[];",
    'convection candidate cells'
)
text = replace_once(
    text,
    "+(p.newborn?' newborn':'');el.style.left=p.x+'px';",
    "+(p.newborn?' newborn':'')+(p.convecting?' convecting':'');el.style.left=p.x+'px';",
    'convection moving piece class'
)
text = replace_once(
    text,
    "function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if((p.sym==='Tc'||p.sym==='Pm')&&p.radioactiveReady)return tapRadioactiveProof(p);",
    "function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(state.convectionArmed&&handleConvectionTap(p))return;if((p.sym==='Tc'||p.sym==='Pm')&&p.radioactiveReady)return tapRadioactiveProof(p);",
    'convection tap priority'
)

# A fusion call gets an explicit location even when objective-only flow would skip a known reaction.
text = replace_once(
    text,
    "state.discovered.add(r.out);if(uniqueGoal&&!objectiveLineageCredited)captureTag(t.x,t.y,'MATÉRIA RECICLADA · sem novo crédito');if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow",
    "state.discovered.add(r.out);grantConvectionFromCells(cells,phase());if(uniqueGoal&&!objectiveLineageCredited)captureTag(t.x,t.y,'MATÉRIA RECICLADA · sem novo crédito');if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow",
    'fusion grants convection'
)

old_record = """function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;const fx=feedback||{};"""
new_record = """function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;const fx=feedback||{};maybeChargeConvectionFromAction(s,fx);
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(s.mode==='convection'&&fx.kind!=='convection')award=0;if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;"""
text = replace_once(text, old_record, new_record, 'recordFlow convection integration')

text = replace_once(text, " if(s.mode==='opening')return 0;\n if(s.mode==='reactionExplore')return ratio(state.atlasProgress,s.target);", " if(s.mode==='opening')return 0;\n if(s.mode==='convection')return ratio(state.convectionMoves,s.target);\n if(s.mode==='reactionExplore')return ratio(state.atlasProgress,s.target);", 'convection objective progress')
text = replace_once(text, "function phaseMilestoneReached(s=phase()){if(s.mode==='reactionExplore')return state.atlasProgress>=phaseMilestoneThreshold(s);", "function phaseMilestoneReached(s=phase()){if(s.mode==='convection')return(state.convectionMoves||0)>=phaseMilestoneThreshold(s);if(s.mode==='reactionExplore')return state.atlasProgress>=phaseMilestoneThreshold(s);", 'convection milestone reached')
text = replace_once(text, "setTimeout(()=>dom.star.classList.remove('milestone-flash'),980);if(s.mode==='reactionExplore'){", "setTimeout(()=>dom.star.classList.remove('milestone-flash'),980);if(s.mode==='convection'){announce('CONVECÇÃO ESTELAR','CORRENTE ESTABELECIDA',`${state.convectionMoves}/${s.target} correntes convectivas realizadas`);tone(620,.14,'triangle',.04);vibrate([10,16,12]);return true}if(s.mode==='reactionExplore'){", 'convection milestone feedback')

text = replace_once(text, " if(s.mode==='reactionExplore')return state.atlasProgress>=s.target;", " if(s.mode==='convection')return(state.convectionMoves||0)>=s.target;\n if(s.mode==='reactionExplore')return state.atlasProgress>=s.target;", 'convection objective satisfied')
text = replace_once(text, " else if(s.mode==='reactionExplore')announce('OBJETIVO CONCLUÍDO'", " else if(s.mode==='convection')announce('OBJETIVO CONCLUÍDO','CONVECÇÃO DOMINADA','A partir daqui, reações nucleares no centro ou na camada 1 podem alimentar novas correntes convectivas.');\n else if(s.mode==='reactionExplore')announce('OBJETIVO CONCLUÍDO'", 'convection completion message')

text = replace_once(
    text,
    " if(s.mode==='remnant'){registerRewardDiscovery('phenomenon:neutronStar'",
    " if(s.mode==='convection'){registerRewardDiscovery('phenomenon:stellarConvection',{title:'CONVECÇÃO ESTELAR',text:'Transporte convectivo de matéria e energia desbloqueado.',silent:true});RewardDirector.show({kicker:'NOVA HABILIDADE',title:'CONVECÇÃO ESTELAR',text:'Reações no centro ou na camada 1 agora podem carregar uma corrente convectiva.',priority:3,duration:1950,kind:'completion'})}\n else if(s.mode==='remnant'){registerRewardDiscovery('phenomenon:neutronStar'",
    'convection completion reward'
)

text = replace_once(text, " if(s.id==='he_red')return speciesCount('HeU')>=2?'He instável + He instável → He estável':'H + próton → He instável';\n if(s.id==='stellar_li')", " if(s.id==='he_red')return speciesCount('HeU')>=2?'He instável + He instável → He estável':'H + próton → He instável';\n if(s.mode==='convection'){if(state.convectionArmed&&state.selected.length)return'Escolha um núcleo externo na coluna destacada';if(state.convectionCharge)return'Ative CONVECÇÃO → escolha uma coluna radial';return'Reação nuclear no centro ou camada 1 → Convecção'}\n if(s.id==='stellar_li')", 'convection concise guidance')

text = replace_once(text, " if(s.id==='coulomb_intro'){const made=state.created.He||0;$('goalText').textContent=`Crie ${s.target} núcleos estáveis de Hélio por Fusão — ${made}/${s.target}`;setFormula('Hélio-3 + Hélio-3 → Hélio-4 + 2 prótons');return}\n if(s.id==='stellar_li')", " if(s.id==='coulomb_intro'){const made=state.created.He||0;$('goalText').textContent=`Crie ${s.target} núcleos estáveis de Hélio por Fusão — ${made}/${s.target}`;setFormula('Hélio-3 + Hélio-3 → Hélio-4 + 2 prótons');return}\n if(s.mode==='convection'){$('goalText').textContent=`Realize ${s.target} correntes convectivas — ${state.convectionMoves||0}/${s.target}`;setFormula(conciseRecipeLine(s));return}\n if(s.id==='stellar_li')", 'convection HUD objective')
text = replace_once(text, " if(s.id==='brown')$('stageProgressText').textContent=`${state.created.He3||0}/${brownBurnLimit()}`;\n else if(s.mode==='whiteCompact')", " if(s.id==='brown')$('stageProgressText').textContent=`${state.created.He3||0}/${brownBurnLimit()}`;\n else if(s.mode==='convection')$('stageProgressText').textContent=`${state.convectionMoves||0}/${s.target}`;\n else if(s.mode==='whiteCompact')", 'convection progress text')
text = replace_once(text, "$('stageProgressLabel').textContent=s.id==='brown'?(state.readyToAdvance?'RESERVATÓRIO ESGOTADO':'QUEIMA DE DEUTÉRIO'):(state.readyToAdvance?'CONCLUÍDA':'PROGRESSO');", "$('stageProgressLabel').textContent=s.id==='brown'?(state.readyToAdvance?'RESERVATÓRIO ESGOTADO':'QUEIMA DE DEUTÉRIO'):s.mode==='convection'?(state.readyToAdvance?'CONCLUÍDA':'CONVECÇÃO'):(state.readyToAdvance?'CONCLUÍDA':'PROGRESSO');", 'convection progress label')

# Intro/modal copy.
text = replace_once(text, " if(s.id==='coulomb_intro')return '³He + ³He → ⁴He + 2p';\n if(s.id==='stellar_li')", " if(s.id==='coulomb_intro')return '³He + ³He → ⁴He + 2p';\n if(s.mode==='convection')return 'Reação nuclear no interior → energia → corrente convectiva';\n if(s.id==='stellar_li')", 'convection modal primary')
text = replace_once(text, " if(s.id==='coulomb_intro')return 'Tente fundir os Hélios-3 da periferia e descubra como a posição muda a reação';\n if(s.id==='stellar_li')", " if(s.id==='coulomb_intro')return 'Tente fundir os Hélios-3 da periferia e descubra como a posição muda a reação';\n if(s.mode==='convection')return 'Faça uma reação no centro ou camada 1; ative CONVECÇÃO; escolha um núcleo interno e depois um núcleo externo na coluna destacada';\n if(s.id==='stellar_li')", 'convection modal secondary')
text = replace_once(text, "atomic_li:'LÍTIO',coulomb_intro:'BARREIRA DE COULOMB',stellar_li:'LÍTIO ESTELAR'", "atomic_li:'LÍTIO',coulomb_intro:'BARREIRA DE COULOMB',stellar_convection:'CONVECÇÃO ESTELAR',stellar_li:'LÍTIO ESTELAR'", 'convection intro title')
text = replace_once(text, "['brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_li','fragile','c','n','o']", "['brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o']", 'convection family')

# Chain audio categorization and persistent render control.
text = replace_once(text, " if(s.mode==='fusion'||isPrimordial(s)||s.mode==='whiteCompact')return'nuclear';", " if(s.mode==='fusion'||s.mode==='convection'||isPrimordial(s)||s.mode==='whiteCompact')return'nuclear';", 'convection chain audio kind')
text = replace_once(text, "function render(){drawLines();renderPieces();updateMoveTargets();renderPrimordialParticles();renderCosmicRays();updateHUD();renderNeutrons();renderMenu()}", "function render(){drawLines();renderPieces();updateMoveTargets();renderPrimordialParticles();renderCosmicRays();updateHUD();renderNeutrons();renderConvectionControl();renderMenu()}", 'render convection control')

# Reset phase-local charge and tutorial progress whenever a phase starts.
text = replace_once(text, "state.coulombRepulsions=0;state.neutronBirths=0;", "state.coulombRepulsions=0;state.convectionCharge=0;state.convectionArmed=false;state.convectionMoves=0;state.convectionLessonShown=false;state.neutronBirths=0;", 'convection state reset')

# The class renderer adds the transition class while a whole column is reversing.
# This substring occurs only in renderPieces after the earlier newborn replacement.

checks = [
    "id:'stellar_convection'",
    "mode:'convection',target:3",
    "function convectionMechanicUnlocked",
    "function performConvection",
    "function handleConvectionTap",
    "state.convectionMoves=(state.convectionMoves||0)+1",
    "if(s.mode==='convection')return(state.convectionMoves||0)>=s.target",
    "CONVECÇÃO ESTELAR",
]
for check in checks:
    if check not in text:
        raise SystemExit(f'engine validation missing: {check}')
save(path, text)


# ---------------------------------------------------------------------------
# Canonical campaign graph
# ---------------------------------------------------------------------------
path = 'assets/js/campaign-graph.js'
graph = load(path)
graph = replace_once(graph, '\"he_yellow\",\"coulomb_intro\",\"stellar_li\",\"fragile\"', '\"he_yellow\",\"coulomb_intro\",\"stellar_convection\",\"stellar_li\",\"fragile\"', 'graph base order')
graph = replace_once(graph, '\"mid\":[\"he_orange\",\"he_yellow\",\"coulomb_intro\",\"stellar_li\",\"fragile\"', '\"mid\":[\"he_orange\",\"he_yellow\",\"coulomb_intro\",\"stellar_convection\",\"stellar_li\",\"fragile\"', 'graph mid sequence')
graph = replace_once(graph, '\"coulomb_intro\":{\"allOf\":[\"he_yellow\"]},\"stellar_li\":{\"allOf\":[\"coulomb_intro\"]}', '\"coulomb_intro\":{\"allOf\":[\"he_yellow\"]},\"stellar_convection\":{\"allOf\":[\"coulomb_intro\"]},\"stellar_li\":{\"allOf\":[\"stellar_convection\"]}', 'graph prerequisites')
if graph.count('stellar_convection') != 3:
    raise SystemExit(f'graph validation: expected 3 stellar_convection references, found {graph.count("stellar_convection")}')
save(path, graph)


# ---------------------------------------------------------------------------
# Giant fork renderer: keep the new tutorial in the precursor trail.
# ---------------------------------------------------------------------------
path = 'assets/js/campaign-giants-map.js'
giants = load(path)
giants = replace_once(giants, "moveNodes(['he_orange','he_yellow','coulomb_intro',S.precursor],precursorFlow);", "moveNodes(['he_orange','he_yellow','coulomb_intro','stellar_convection',S.precursor],precursorFlow);", 'giant precursor nodes')
save(path, giants)


# ---------------------------------------------------------------------------
# Visual feedback
# ---------------------------------------------------------------------------
path = 'assets/css/ardua.css'
css = load(path)
marker = '/* Stellar convection mechanic */'
if marker in css:
    raise SystemExit('convection CSS marker already exists')
css += r'''

/* Stellar convection mechanic */
.convection-control{display:none;position:absolute;right:4%;top:5%;z-index:65;min-width:92px;min-height:42px;padding:6px 10px;border-radius:15px;border:1px solid rgba(143,205,255,.22);background:rgba(5,14,31,.78);color:#b9cae8;backdrop-filter:blur(8px);align-items:center;justify-content:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,.26);cursor:pointer;transition:opacity .2s ease,transform .2s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease}.convection-control.show{display:flex}.convection-control:disabled{opacity:.42;cursor:default}.convection-control span{font-size:18px;line-height:1;font-weight:950}.convection-control small{font-size:8px;line-height:1.05;letter-spacing:.08em;font-weight:950}.convection-control.charged{opacity:1;border-color:rgba(112,228,255,.82);background:rgba(18,62,82,.80);color:#e8fbff;box-shadow:0 0 0 2px rgba(104,220,255,.12),0 0 22px rgba(74,207,255,.34),0 7px 18px rgba(0,0,0,.25);animation:convectionReady 1.35s ease-in-out infinite alternate}.convection-control.armed{border-color:rgba(112,255,202,.92);background:rgba(20,84,64,.86);color:#effff8;animation:none;transform:scale(1.035);box-shadow:0 0 0 3px rgba(67,242,138,.15),0 0 28px rgba(67,242,138,.42)}
@keyframes convectionReady{from{filter:brightness(.92)}to{filter:brightness(1.18)}}
.star-board.convection-charged-flash .star-core{animation:convectionCoreFlash .62s ease-out}.star-board.convection-active .star-core{filter:brightness(1.18) saturate(1.12)}
@keyframes convectionCoreFlash{0%{filter:brightness(1)}35%{filter:brightness(1.55);box-shadow:inset 0 0 78px rgba(255,255,255,.30),0 0 78px rgba(109,224,255,.76),0 0 170px var(--starGlow)}100%{filter:brightness(1)}}
.atom.convecting{z-index:16;transition:left .58s cubic-bezier(.2,.72,.18,1),top .58s cubic-bezier(.2,.72,.18,1),transform .22s ease,box-shadow .22s ease;box-shadow:0 0 0 3px rgba(125,235,255,.22),0 0 22px rgba(99,221,255,.46),inset 0 0 14px rgba(255,255,255,.18)}
.convection-energy{position:absolute;z-index:48;pointer-events:none;transform:translate(-50%,-50%) scale(1);font-weight:950;transition:left .68s cubic-bezier(.18,.72,.22,1),top .68s cubic-bezier(.18,.72,.22,1),opacity .68s ease,transform .68s ease;text-shadow:0 0 10px currentColor,0 0 22px currentColor}.convection-energy.gamma{font-size:18px;color:#d8f5ff}.convection-energy.light{font-size:13px;color:#ffe8ae}
@media(max-width:430px){.convection-control{right:2.5%;top:3%;min-width:78px;min-height:38px;padding:5px 8px}.convection-control span{font-size:16px}.convection-control small{font-size:7px}}
'''
save(path, css)

print('stellar convection migration applied')
