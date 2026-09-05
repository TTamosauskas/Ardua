from pathlib import Path


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


js_path = Path('assets/js/ardua.js')
test_path = Path('tests/validate-static.js')
js = js_path.read_text()
tests = test_path.read_text()

# Mark only the recyclable Be-8 lesson as a unique-matter objective.
anchor = " setTarget(['atomic_li'],3);setTarget(['fragile'],4);setTarget(['c','n','o'],5);setTarget(['spallation'],4);"
replacement = anchor + "\n const fragilePhase=byId.get('fragile');if(fragilePhase)fragilePhase.uniqueMatterObjective=true;"
js = once(js, anchor, replacement, 'fragile unique-matter objective')

# Transient lineage state is phase-local. It is deliberately not persisted in the save,
# because the board itself is reconstructed when a phase is loaded.
old_state_tail = "rewardPhaseComplete:false,chainCalloutTimer:null,chainCalloutRoot:null,preparedChainRoots:{}};"
new_state_tail = "rewardPhaseComplete:false,chainCalloutTimer:null,chainCalloutRoot:null,preparedChainRoots:{},nextMatterOrigin:1,objectiveLineages:new Set()};"
js = once(js, old_state_tail, new_state_tail, 'matter provenance state')

old_reset = "state.phaseMilestoneAnnounced=false;state.created={};state.protonCaptures=0;"
new_reset = "state.phaseMilestoneAnnounced=false;state.created={};state.nextMatterOrigin=1;state.objectiveLineages=new Set();state.protonCaptures=0;"
js = once(js, old_reset, new_reset, 'phase provenance reset')

# Add persistent first-occurrence lessons. productLessons is already saved globally.
old_lessons_tail = " rpCycle:{title:'CICLO Sn–Sb–Te',text:'Na região de Estanho, Antimônio e Telúrio, a rede pode fechar um ciclo. Esse comportamento representa o limite natural desta campanha do rp-process.'},\n stratification:{title:'CAMADAS ESTELARES',text:'Produtos mais pesados tendem a ocupar regiões internas, enquanto combustíveis mais leves dominam regiões externas.'}\n};"
new_lessons_tail = """ rpCycle:{title:'CICLO Sn–Sb–Te',text:'Na região de Estanho, Antimônio e Telúrio, a rede pode fechar um ciclo. Esse comportamento representa o limite natural desta campanha do rp-process.'},
 chainNuclear:{title:'REAÇÃO EM CADEIA',text:'O produto de uma reação encontrou, no próprio tabuleiro, reagentes para uma continuação nuclear válida. Ao fechar este aviso, a próxima etapa acontecerá automaticamente.'},
 chainNeutron:{title:'CASCATA DE NÊUTRONS',text:'Um nêutron emitido encontrou outro núcleo compatível em sua trajetória. Cada nêutron é consumido por no máximo uma captura.'},
 chainR:{title:'TEMPESTADE-r',text:'Em um fluxo extremo de nêutrons, capturas sucessivas podem ocorrer antes que a rede tenha tempo de decair. A sequência automática continua curta e causal.'},
 chainProton:{title:'CADEIA DE PRÓTONS',text:'O produto recém-formado encontrou outro próton próximo e uma rota de captura válida. Waiting points e a Barreira de Coulomb ainda podem interromper a sequência.'},
 chainEnergetic:{title:'RECICLAGEM NUCLEAR',text:'Uma partícula ou produto liberado por um evento energético encontrou uma reação estelar já aprendida e pode alimentar outra transformação.'},
 neutronSource:{title:'FONTE DE NÊUTRONS',text:'Algumas reações liberam nêutrons que passam a alimentar o processo-s ou o processo-r. A animação a seguir mostra essa fonte entrando em atividade.'},
 branching:{title:'RAMIFICAÇÃO NUCLEAR',text:'Neste ponto, capturar outro nêutron compete com esperar o decaimento β−. Os dois caminhos representam destinos físicos diferentes para o mesmo núcleo instável.'},
 freezeout:{title:'FREEZE-OUT',text:'O fluxo rápido de nêutrons está terminando. Depois deste ponto, os decaimentos passam a dominar a evolução da rede nuclear.'},
 recycledMatter:{title:'MATÉRIA RECICLADA',text:'Esta mesma linhagem de matéria já produziu o intermediário observado. A reação continua válida, mas não conta novamente para o objetivo; incorpore matéria nova para registrar outra formação independente.'},
 stratification:{title:'CAMADAS ESTELARES',text:'Produtos mais pesados tendem a ocupar regiões internas, enquanto combustíveis mais leves dominam regiões externas.'}
};"""
js = once(js, old_lessons_tail, new_lessons_tail, 'first occurrence lessons')

# Matter provenance helpers and lineage-bearing pieces.
create_anchor = "function createPiece(sym,cell,fromOutside=false,opts={}){"
provenance_helpers = """function normalizeMatterLineage(lineage=[]){
 const raw=Array.isArray(lineage)?lineage:(lineage instanceof Set?[...lineage]:[]);return [...new Set(raw.map(String).filter(Boolean))].sort();
}
function freshMatterLineage(){return [`m${state.nextMatterOrigin++}`]}
function pieceMatterLineage(piece){if(!piece)return[];if(!Array.isArray(piece.lineage)||!piece.lineage.length)piece.lineage=freshMatterLineage();piece.lineage=normalizeMatterLineage(piece.lineage);return piece.lineage}
function mergeMatterLineages(pieces=[]){return normalizeMatterLineage(pieces.flatMap(pieceMatterLineage))}
function matterLineageKey(lineage=[]){return normalizeMatterLineage(lineage).join('|')}
function objectiveLineageIsFresh(s,lineage){if(!s?.uniqueMatterObjective)return true;const key=matterLineageKey(lineage);return !!key&&!state.objectiveLineages.has(key)}
function creditObjectiveLineage(s,lineage){if(!s?.uniqueMatterObjective)return true;const key=matterLineageKey(lineage);if(!key||state.objectiveLineages.has(key))return false;state.objectiveLineages.add(key);return true}
""" + create_anchor
js = once(js, create_anchor, provenance_helpers, 'provenance helpers')

old_create_piece = "piece={id,sym,cell,x:p0.x,y:p0.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive};"
new_create_piece = "piece={id,sym,cell,x:p0.x,y:p0.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive,lineage:normalizeMatterLineage(opts.lineage?.length?opts.lineage:freshMatterLineage())};"
js = once(js, old_create_piece, new_create_piece, 'board piece lineage')

old_create_free = "piece={id,sym,cell:null,free:true,x:pt.x,y:pt.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive};"
new_create_free = "piece={id,sym,cell:null,free:true,x:pt.x,y:pt.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive,lineage:normalizeMatterLineage(opts.lineage?.length?opts.lineage:freshMatterLineage())};"
js = once(js, old_create_free, new_create_free, 'free piece lineage')

# Board fusion inherits the identities of its input nuclei.
old_fuse_start = "const cells=[...state.selected],target=[...cells].sort((a,b)=>coords[a].ring-coords[b].ring)[0],ids=cells.map(c=>state.board[c]),t=pos(coords[target]),preparedChain=preparedContinuationForFusion(r,cells,target);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;ids.forEach(id=>{"
new_fuse_start = "const cells=[...state.selected],target=[...cells].sort((a,b)=>coords[a].ring-coords[b].ring)[0],ids=cells.map(c=>state.board[c]),t=pos(coords[target]),preparedChain=preparedContinuationForFusion(r,cells,target),inputPieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),productLineage=mergeMatterLineages(inputPieces),uniqueGoal=r.out===phase().new&&!!phase().uniqueMatterObjective,objectiveLineageFresh=!uniqueGoal||objectiveLineageIsFresh(phase(),productLineage);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;if(uniqueGoal&&!objectiveLineageFresh)await teachProductOnce('recycledMatter',t.x,t.y);ids.forEach(id=>{"
js = once(js, old_fuse_start, new_fuse_start, 'fusion lineage preflight')

old_fuse_product = "const np=createPiece(r.out,target,false);np.x=t.x;np.y=t.y;focusPieceInfo(np);if(pieceIsUnstable(np))np.unstableBornRound=state.nuclearRound+1;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new?3:1,{kind:'nuclear',x:t.x,y:t.y,label:r.out===phase().new?E[r.out].name:null});state.selected=[];burst(t.x,t.y);"
new_fuse_product = "const np=createPiece(r.out,target,false,{lineage:productLineage});np.x=t.x;np.y=t.y;focusPieceInfo(np);if(pieceIsUnstable(np))np.unstableBornRound=state.nuclearRound+1;const objectiveLineageCredited=!uniqueGoal||creditObjectiveLineage(phase(),productLineage);if(!uniqueGoal||objectiveLineageCredited)state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);if(uniqueGoal&&!objectiveLineageCredited)captureTag(t.x,t.y,'MATÉRIA RECICLADA · sem novo crédito');if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new&&objectiveLineageCredited?3:1,{kind:'nuclear',x:t.x,y:t.y,label:r.out===phase().new&&objectiveLineageCredited?E[r.out].name:null});state.selected=[];burst(t.x,t.y);"
js = once(js, old_fuse_product, new_fuse_product, 'fusion objective lineage credit')

# Be-8 returns the same matter identities when it decays. Re-fusing those exact
# daughters recreates the same lineage and cannot farm the objective.
old_be8_head = "const firstLesson=!state.productLessons.has('helium'),origin=piece.cell,at={x:piece.x,y:piece.y};if(firstLesson)await teachProductOnce('helium',at.x,at.y);state.board[origin]=null;state.pieces.delete(piece.id);\n const first=createPiece('He',origin,false);"
new_be8_head = "const firstLesson=!state.productLessons.has('helium'),origin=piece.cell,at={x:piece.x,y:piece.y},lineage=pieceMatterLineage(piece);if(firstLesson)await teachProductOnce('helium',at.x,at.y);state.board[origin]=null;state.pieces.delete(piece.id);\n const first=createPiece('He',origin,false,{lineage});"
js = once(js, old_be8_head, new_be8_head, 'Be8 first daughter lineage')
js = once(js, "const second=createPiece('He',secondCell,false);", "const second=createPiece('He',secondCell,false,{lineage});", 'Be8 second daughter lineage')

# Alpha daughters also keep provenance, making the system safe for future recyclable objectives.
js = once(js, "const he=createPiece('He',cell,false);he.x=p.x;", "const he=createPiece('He',cell,false,{lineage:pieceMatterLineage(p)});he.x=p.x;", 'alpha daughter lineage')

# Chain tutorials: pause before the first automatic continuation, then resume the exact action.
chain_title_anchor = "function chainEventTitle(kind){return kind==='r'?'TEMPESTADE-r':kind==='neutron'?'CASCATA DE NÊUTRONS':kind==='proton'?'CADEIA DE PRÓTONS':kind==='energetic'?'RECICLAGEM NUCLEAR':kind==='decay'?'CASCATA DE DECAIMENTOS':kind==='accretion'?'ACREÇÃO':kind==='rotation'?'ROTAÇÃO':kind==='collapse'?'COLAPSO':kind==='nuclear'?'CADEIA NUCLEAR':'CASCATA'}"
chain_lesson_code = chain_title_anchor + "\nconst CHAIN_LESSON_BY_KIND=Object.freeze({nuclear:'chainNuclear',neutron:'chainNeutron',r:'chainR',proton:'chainProton',energetic:'chainEnergetic'});\nasync function teachChainEffectOnce(kind,x,y){const key=CHAIN_LESSON_BY_KIND[kind];return key?teachProductOnce(key,x,y):false}"
js = once(js, chain_title_anchor, chain_lesson_code, 'chain lesson map')

old_auto_fusion = "const product=state.pieces.get(pieceId),candidate=autoFusionCandidate(product);if(!product||!candidate)return;const ctx={rootId,depth:depth+1,kind,x:product.x,y:product.y,creditUsed:false,feedbackUsed:false};"
new_auto_fusion = "const product=state.pieces.get(pieceId),candidate=autoFusionCandidate(product);if(!product||!candidate)return;await teachChainEffectOnce(kind,product.x,product.y);if(state.phaseDone||state.readyToAdvance||!state.pieces.has(product.id))return;const refreshed=autoFusionCandidate(product);if(!refreshed)return;candidate.other=refreshed.other;candidate.r=refreshed.r;const ctx={rootId,depth:depth+1,kind,x:product.x,y:product.y,creditUsed:false,feedbackUsed:false};"
js = once(js, old_auto_fusion, new_auto_fusion, 'fusion cascade lesson')

old_neutron_ctx = "const n=state.neutrons.get(id),target=neutronTrajectoryCandidate(n);if(!n||!target)continue;depth++;links++;const ctx={rootId,depth,kind:storm?'r':'neutron',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};"
new_neutron_ctx = "const n=state.neutrons.get(id),target=neutronTrajectoryCandidate(n);if(!n||!target)continue;const cascadeKind=storm?'r':'neutron';await teachChainEffectOnce(cascadeKind,target.x,target.y);if(state.phaseDone||state.readyToAdvance||!state.neutrons.has(id)||!state.pieces.has(target.id))break;depth++;links++;const ctx={rootId,depth,kind:cascadeKind,x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};"
js = once(js, old_neutron_ctx, new_neutron_ctx, 'neutron cascade lesson')

old_proton_ctx = "const nearby=[...state.primordialParticles.values()].filter(q=>q.kind==='p'&&!q.reacting).map(q=>({q,d:Math.hypot(q.x-target.x,q.y-target.y)})).filter(x=>x.d<=starSize()*.24).sort((a,b)=>a.d-b.d)[0];if(!nearby)return;const ctx={rootId,depth:depth+1,kind:'proton',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};"
new_proton_ctx = "const nearby=[...state.primordialParticles.values()].filter(q=>q.kind==='p'&&!q.reacting).map(q=>({q,d:Math.hypot(q.x-target.x,q.y-target.y)})).filter(x=>x.d<=starSize()*.24).sort((a,b)=>a.d-b.d)[0];if(!nearby)return;await teachChainEffectOnce('proton',target.x,target.y);if(state.phaseDone||state.readyToAdvance||!state.pieces.has(target.id)||!state.primordialParticles.has(nearby.q.id))return;const ctx={rootId,depth:depth+1,kind:'proton',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};"
js = once(js, old_proton_ctx, new_proton_ctx, 'proton cascade lesson')

# First occurrence lessons for other major nuclear effects happen before their distinctive animation.
old_source = "if(state.locked||!source||!helium)return;const g=neutronGameplay(s);state.locked=true;const at={x:source.x,y:source.y},sourceCell=source.cell,heCell=helium.cell;\n state.board[sourceCell]=null;"
new_source = "if(state.locked||!source||!helium)return;const g=neutronGameplay(s);state.locked=true;const at={x:source.x,y:source.y},sourceCell=source.cell,heCell=helium.cell;\n await teachProductOnce('neutronSource',at.x,at.y);\n state.board[sourceCell]=null;"
js = once(js, old_source, new_source, 'neutron source lesson')

old_branch_capture = "if(p?.neutronBetaPending&&ng.pattern==='branch'){\n   const branchTr=p.neutronBetaTransition;if(!branchTr)return;state.selectedNeutron=null;"
new_branch_capture = "if(p?.neutronBetaPending&&ng.pattern==='branch'){\n   const branchTr=p.neutronBetaTransition;if(!branchTr)return;await teachProductOnce('branching',p.x,p.y);state.selectedNeutron=null;"
js = once(js, old_branch_capture, new_branch_capture, 'branch capture lesson')

old_branch_wait = "for(const p of pending){const tr=p.neutronBetaTransition;if(!tr)continue;if(neutronGameplay(s).pattern==='branch')state.neutronBranchesObserved++;clearNeutronPending(p);await betaTransform(p,s,tr)}"
new_branch_wait = "for(const p of pending){const tr=p.neutronBetaTransition;if(!tr)continue;if(neutronGameplay(s).pattern==='branch'){await teachProductOnce('branching',p.x,p.y);state.neutronBranchesObserved++}clearNeutronPending(p);await betaTransform(p,s,tr)}"
js = once(js, old_branch_wait, new_branch_wait, 'branch decay lesson')

old_freeze = "else if(ng.pattern==='rFreezeout'){recordFlow(1);state.neutronFreezeouts++;captureTag(p.x,p.y,'FREEZE-OUT');"
new_freeze = "else if(ng.pattern==='rFreezeout'){await teachProductOnce('freezeout',p.x,p.y);recordFlow(1);state.neutronFreezeouts++;captureTag(p.x,p.y,'FREEZE-OUT');"
js = once(js, old_freeze, new_freeze, 'freezeout lesson')

# Waiting point explains itself before the tunneling/capture animation begins.
old_waiting_pre = "const viable=!!route&&!blocked,photoReturn=viable&&route.photoChance>0&&Math.random()<route.photoChance;\n if(!viable||photoReturn){"
new_waiting_pre = "const viable=!!route&&!blocked,photoReturn=viable&&route.photoChance>0&&Math.random()<route.photoChance;\n if(viable&&!photoReturn&&route.rp&&route.pattern==='waiting')await teachProductOnce('waitingPoint',target.x,target.y);\n if(!viable||photoReturn){"
js = once(js, old_waiting_pre, new_waiting_pre, 'waiting point lesson timing')
js = once(js, "burst(target.x,target.y);renderPieces();if(route.rp&&route.pattern==='waiting')await teachProductOnce('waitingPoint',target.x,target.y);if(pieceIsUnstable(target)){", "burst(target.x,target.y);renderPieces();if(pieceIsUnstable(target)){", 'remove late waiting point lesson')

# Sn-Sb-Te lesson also precedes its distinctive alpha-return animation.
old_rp_cycle = "async function decayRpCycle(piece){\n if(!piece||!state.pieces.has(piece.id))return;const at={x:piece.x,y:piece.y},to=piece.unstableTo||'Sn';await ejectAlphaHelium(piece);"
new_rp_cycle = "async function decayRpCycle(piece){\n if(!piece||!state.pieces.has(piece.id))return;const at={x:piece.x,y:piece.y},to=piece.unstableTo||'Sn';await teachProductOnce('rpCycle',at.x,at.y);await ejectAlphaHelium(piece);"
js = once(js, old_rp_cycle, new_rp_cycle, 'rp cycle lesson timing')
js = once(js, "state.rpCyclesObserved++;recordFlow(2);await teachProductOnce('rpCycle',at.x,at.y);burst(at.x,at.y);", "state.rpCyclesObserved++;recordFlow(2);burst(at.x,at.y);", 'remove late rp cycle lesson')

# Make the fragile phase objective explicit in the HUD.
old_goal_prefix = "const made=state.created[s.new]||0;\n if(s.id==='brown')"
new_goal_prefix = "const made=state.created[s.new]||0;\n if(s.uniqueMatterObjective){$('goalText').textContent=`Observe ${s.target} formações independentes de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}\n if(s.id==='brown')"
js = once(js, old_goal_prefix, new_goal_prefix, 'unique matter HUD')

# Permanent regression tests.
marker = "ok(engine.includes(\"state.readyToAdvance?100:Math.min(99,Math.floor(p))\"),'texto da barra não arredonda uma fase incompleta para 100%');\n"
addition = marker + """ok(engine.includes("fragilePhase.uniqueMatterObjective=true")&&engine.includes('objectiveLineages:new Set()'),'fase de Be-8 usa objetivo por linhagem de matéria');
ok(engine.includes('function mergeMatterLineages')&&engine.includes('function creditObjectiveLineage'),'proveniência de matéria é herdável e creditada por linhagem');
ok(engine.includes("createPiece('He',origin,false,{lineage})")&&engine.includes("createPiece('He',secondCell,false,{lineage})"),'decaimento de Be-8 devolve Hélios com a mesma proveniência');
ok(engine.includes("teachProductOnce('recycledMatter',t.x,t.y)")&&engine.includes('MATÉRIA RECICLADA · sem novo crédito'),'reciclagem repetida permanece válida mas não farma o objetivo');
ok(engine.includes('CHAIN_LESSON_BY_KIND')&&engine.includes('await teachChainEffectOnce(kind,product.x,product.y)'),'primeira cascata pausa para explicação antes da continuação automática');
ok(engine.includes("await teachProductOnce('neutronSource',at.x,at.y)")&&engine.includes("await teachProductOnce('freezeout',p.x,p.y)")&&engine.includes("await teachProductOnce('branching',p.x,p.y)"),'fontes, freeze-out e ramificações recebem tooltip antes do efeito');
ok(engine.includes("if(viable&&!photoReturn&&route.rp&&route.pattern==='waiting')await teachProductOnce('waitingPoint',target.x,target.y)"),'waiting point é explicado antes da animação de captura');
"""
tests = once(tests, marker, addition, 'first-effect and provenance tests')

js_path.write_text(js)
test_path.write_text(tests)

# Temporary migration files must never survive the bot commit.
Path('tools/apply-first-effect-provenance.py').unlink(missing_ok=True)
Path('.github/workflows/apply-first-effect-provenance.yml').unlink(missing_ok=True)
