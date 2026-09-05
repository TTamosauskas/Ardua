from pathlib import Path
import hashlib
p=Path('assets/js/ardua.js')
s=p.read_text()
source=hashlib.sha256(s.encode()).hexdigest()
assert source=='12e5972dacabc16daa63fc1e7659dd4d747be9f11b0947b229a7eee7c2bada78', source

def rep(old,new,label):
    global s
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 occurrence, got {n}')
    s=s.replace(old,new,1)

rep("seedCount:5,menuTag:step.to","seedCount:1,menuTag:step.to","rp seed count")
rep("function rpStep(s=phase()){return s?.mode==='rpProcess'?s.rp:null}\n",
"""const RP_FOUNDATION_STEPS=[
 {id:'rp_foundation_co',from:'Fe',to:'Co',pattern:'capture',chain:1,label:'Fe + p → Co · reconstrução rp agregada'},
 {id:'rp_foundation_ni',from:'Co',to:'Ni',pattern:'capture',chain:1,label:'Co + p → Ni · reconstrução rp agregada'}
];
function rpStep(s=phase()){return s?.mode==='rpProcess'?s.rp:null}
function rpAvailableSteps(s=phase()){
 const current=rpStep(s);if(!current)return[];const i=RP_PROCESS_STEPS.findIndex(x=>x.id===current.id);
 return[...RP_FOUNDATION_STEPS,...RP_PROCESS_STEPS.slice(0,Math.max(0,i)+1)];
}
function rpStepForSymbol(sym,s=phase()){return rpAvailableSteps(s).slice().reverse().find(step=>step.from===sym)||null}
""","rp foundation")
rep("configureRelaxedFlow(PHASES);\n\nconst STELLAR_POPUPS={",
"""configureRelaxedFlow(PHASES);

// Regra global de progressão relaxante: cada fase de captura recebe exatamente
// uma semente que pode produzir diretamente uma unidade do objetivo. As unidades
// restantes precisam ser reconstruídas pelo jogador a partir da matéria-base.
function configureSingleObjectiveIngredients(phases){
 for(const p of phases){
   if(p.mode==='rpProcess'){p.seedCount=1;p.singleObjectiveSeed=true;continue}
   const cls=neutronProcessClass(p);
   if(p.mode==='neutron'&&p.seed&&cls){
     p.seedCount=1;p.singleObjectiveSeed=true;p.chainRebuild=true;
     p.allowBackground=['H','He','C','N','O','Fe'];
     const baseCount=Math.max(0,(p.target||1)-1);
     p.starterGroups=[[p.seed],...Array.from({length:baseCount},()=>['Fe'])];
   }
 }
}
configureSingleObjectiveIngredients(PHASES);

const STELLAR_POPUPS={""","single objective config")
rep("const step=rpStep(s),cells=activeCells().slice(),used=new Set(),seedCount=Math.max(3,s.seedCount||5);",
    "const step=rpStep(s),cells=activeCells().slice(),used=new Set(),seedCount=1;","rp fill seed")
rep("""    const rest=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5),amount=Math.max(0,Math.min((s.fill||30)-used.size,rest.length));
    rest.slice(0,amount).forEach((cell,i)=>createPiece(i<8?'H':replenishmentSymbol(),cell,false));
""",
"""    // Ferro é a semente-base da reconstrução: nunca conta como precursor direto
    // de Cu→Te, mas permite refazer Ni e toda a cadeia rp já aprendida.
    const baseFeed=Math.max(0,(s.target||1)-1),baseCells=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5);
    for(let i=0;i<Math.min(baseFeed,baseCells.length);i++){const cell=baseCells[i];createPiece('Fe',cell,false);used.add(cell)}
    const rest=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5),amount=Math.max(0,Math.min((s.fill||30)-used.size,rest.length));
    rest.slice(0,amount).forEach((cell,i)=>createPiece(i<8?'H':replenishmentSymbol(),cell,false));
""","rp base feed")
rep("""   const step=rpStep(s);if(!step||target.sym!==step.from)return null;
   const actualMass=Number(target.massNumber??step.inputMass??0)||null;
""",
"""   const step=rpStepForSymbol(target.sym,s);if(!step)return null;
   const actualMass=Number(target.massNumber??step.inputMass??0)||null;
""","rp cumulative route")
rep("""    const step=rpStep(s);if(!step)return false;let seed=[...state.pieces.values()].find(p=>p.sym===step.from);
    if(!seed){const cell=peripheralEmptyCell();if(cell!==null){seed=createPiece(step.from,cell,true,{massNumber:step.inputMass??null});seed.rpProgress=0;seed.rpIsotope=!!step.inputMass;renderPieces()}}
    if(step.fuel==='p')ensureProtonCaptureFuel(4);
""",
"""    const step=rpStep(s);if(!step)return false;
    // Nunca reponha o precursor direto. Se toda a cadeia pesada for consumida,
    // reintroduza apenas Ferro, que é matéria-base e precisa ser processado pelo jogador.
    const hasRpRoute=[...state.pieces.values()].some(p=>!!rpStepForSymbol(p.sym,s));
    if(!hasRpRoute){const cell=peripheralEmptyCell();if(cell!==null)createPiece('Fe',cell,true)}
    if(step.fuel==='p')ensureProtonCaptureFuel(4);
""","rp no auto precursor")
rep("""   const current=phaseNeutronTransitions(s).filter(tr=>tr.to===sym).map(tr=>({...tr,processClass:neutronProcessClass(s)}));
   const learned=learnedNeutronTransitions(s).filter(tr=>tr.to===sym);
   const seen=new Set();
   for(const tr of [...current,...learned].reverse()){
""",
"""   const current=phaseNeutronTransitions(s).filter(tr=>tr.to===sym).map(tr=>({...tr,processClass:neutronProcessClass(s)}));
   const learned=learnedNeutronTransitions(s).filter(tr=>tr.to===sym),foundation=neutronFoundationTransition(s);
   const foundations=foundation&&foundation.to===sym?[foundation]:[];
   const seen=new Set();
   for(const tr of [...current,...learned,...foundations].reverse()){
""","neutron guidance foundation")
rep(""" if(s.mode==='rpProcess'){const step=rpStep(s);if(step?.fuel==='H'&&countFloatingParticle('p')<1)return 'H → p + e⁻';if(step?.pattern==='waiting'){if((state.created[s.new]||0)>=s.target&&!state.rpWaitDecays)return `${E[s.new].name} proton-rich · aguarde β⁺ enquanto as rodadas passam`;return `${step.label} · ponto de espera`;}return step?.label||'núcleo + p → próximo núcleo';}
""",
""" if(s.mode==='rpProcess'){const step=rpStep(s);if(step?.fuel==='H'&&countFloatingParticle('p')<1)return 'H → p + e⁻';if(step?.pattern==='waiting'&&(state.created[s.new]||0)>=s.target&&!state.rpWaitDecays)return `${E[s.new].name} proton-rich · aguarde β⁺ enquanto as rodadas passam`;const currentSeed=[...state.pieces.values()].find(p=>p.sym===step?.from);if(currentSeed)return step?.pattern==='waiting'?`${step.label} · ponto de espera`:step?.label||'núcleo + p → próximo núcleo';const rebuild=[...state.pieces.values()].map(p=>rpStepForSymbol(p.sym,s)).find(Boolean);return rebuild?.label||'Fe + p → Co · reconstrução da semente';}
""","rp guidance rebuild")
rep("""      // Nessas fases os reagentes históricos são pistas finitas: nunca recrie O, C,
      // Ni, Cu, Zn etc. automaticamente. A fase só continua com o que foi colocado
      // em starterGroups e com o que o próprio jogador produzir a partir dessas pistas.
      if([...state.pieces.values()].some(p=>neutronEligible(p,s)||(s.id==='co'&&p.sym==='FeU'&&p.radioactiveReady)))return true;
      if(s.id==='co'){
""",
"""      // Nessas fases o precursor direto é finito: nunca recrie Ni, Cu, Cs, Sm, Pt etc.
      // automaticamente. Quando a cadeia termina, só matéria-base pode reaparecer.
      if([...state.pieces.values()].some(p=>neutronEligible(p,s)||(s.id==='co'&&p.sym==='FeU'&&p.radioactiveReady)))return true;
      const foundation=neutronFoundationTransition(s);
      if(foundation){const cell=peripheralEmptyCell();if(cell!==null){createPiece('Fe',cell,true);renderPieces();return true}}
      if(s.id==='co'){
""","neutron base refill")
rep("function neutronTransitionFor(p,s=phase()){if(!p||s.mode!=='neutron')return null;return currentNeutronTransition(p.sym,s)||learnedNeutronTransitions(s).slice().reverse().find(tr=>tr.from===p.sym)||null}\n",
"""function neutronFoundationTransition(s=phase()){
 const cls=neutronProcessClass(s);
 if(cls==='weak-s')return{from:'Fe',to:'Ni',captures:2,rprocess:false,processClass:cls,rebuild:true,phaseId:'foundation_weak_s'};
 if(cls==='agb-s')return{from:'Fe',to:'Kr',captures:4,rprocess:false,processClass:cls,rebuild:true,phaseId:'foundation_agb_s'};
 if(cls==='r')return{from:'Fe',to:'Sm',captures:6,rprocess:true,processClass:cls,rebuild:true,phaseId:'foundation_r'};
 return null;
}
function neutronTransitionFor(p,s=phase()){if(!p||s.mode!=='neutron')return null;const foundation=neutronFoundationTransition(s);return currentNeutronTransition(p.sym,s)||(foundation&&p.sym===foundation.from?foundation:null)||learnedNeutronTransitions(s).slice().reverse().find(tr=>tr.from===p.sym)||null}
""","neutron foundation routes")

p.write_text(s)
target=hashlib.sha256(s.encode()).hexdigest()
assert target=='ebb64f07439f63d630b37516efec23c15515153d5f4b17445fcbfb478f177937', target
print('patched engine',target)
