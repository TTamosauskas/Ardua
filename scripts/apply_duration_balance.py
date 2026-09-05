from pathlib import Path

path=Path('assets/js/ardua.js')
s=path.read_text()

def once(old,new,label):
    global s
    count=s.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1 occurrence, found {count}')
    s=s.replace(old,new,1)

anchor="configureRelaxedFlow(PHASES);\n\n// Regra global de progressão relaxante"
insert="""configureRelaxedFlow(PHASES);

// Orçamento de duração: classes internas usadas para manter as primeiras fases
// rápidas e permitir marcos progressivamente mais longos sem cronômetro ou derrota.
const DURATION_BUDGETS=Object.freeze({
 quick:{minSeconds:60,maxSeconds:90,flow:6},
 short:{minSeconds:90,maxSeconds:150,flow:9},
 standard:{minSeconds:150,maxSeconds:210,flow:12},
 long:{minSeconds:210,maxSeconds:255,flow:15},
 epic:{minSeconds:255,maxSeconds:300,flow:18}
});
function configurePhaseDurationBudget(phases){
 const byId=new Map(phases.map(p=>[p.id,p]));
 const classify=(p)=>{
   if(p.id==='bigbang'||p.primordial)return'quick';
   if(p.mode==='guidedDecay'||p.mode==='reactionExplore'||p.micro)return'short';
   if(['remnant','pulsar','accretion','collapseFinal','blackhole','neutronize'].includes(p.mode))return'short';
   if(p.mode==='rpProcess')return'standard';
   if(p.rprocess)return'long';
   if(p.visual==='agb'||p.weakS)return'standard';
   return p.mode==='fusion'?'standard':'short';
 };
 for(const p of phases)p.durationClass=classify(p);
 const setClass=(ids,cls)=>{for(const id of ids){const p=byId.get(id);if(p)p.durationClass=cls}};
 const setTarget=(ids,target)=>{for(const id of ids){const p=byId.get(id);if(p)p.target=target}};
 setClass(['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li','atomic_he','atomic_h'],'quick');
 setClass(['atomic_li','brown','he_red','he_orange','he_yellow','coulomb_intro'],'short');
 setClass(['stellar_li','fragile','c','n','o','spallation_be','spallation'],'standard');
 setClass(['weak_s_cu','weak_s_zn','weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br','weak_s_kr'],'standard');
 setClass(['rb','sr','y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs'],'standard');
 setClass(['ba','la','ce','pr','nd','pm','sm'],'long');
 setClass(['pb','bi'],'epic');
 setClass(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir'],'long');
 setClass(['pt','au','th','u'],'epic');
 setClass(['hg','tl'],'long');
 setClass(['decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at','white','final_collapse','neutron_star','pulsar','accretion','stability','black_hole'],'short');
 setClass(['rp_cu','rp_zn','rp_ga','rp_ge','rp_as','rp_se','rp_br','rp_kr'],'standard');
 setClass(['rp_rb','rp_sr','rp_y','rp_zr','rp_nb','rp_mo','rp_tc','rp_ru','rp_rh','rp_pd','rp_ag','rp_cd','rp_in','rp_sn','rp_sb'],'long');
 setClass(['rp_te'],'epic');
 // Quanto mais cara a reconstrução, menor o número de produtos repetidos.
 setTarget(['atomic_li'],3);setTarget(['fragile'],4);setTarget(['c','n','o'],5);setTarget(['spallation'],4);
 setTarget(['ne','na','mg','al','si','s','ar','ca'],5);setTarget(['ti','cr','mn','fe'],4);
 setTarget(['weak_s_cu','weak_s_zn'],4);setTarget(['weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br'],3);setTarget(['weak_s_kr'],2);
 setTarget(['rb','sr'],3);setTarget(['y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm','pb','bi'],2);
 setTarget(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir','pt','au','hg','tl','th','u'],2);
 setTarget(['rp_rb','rp_sr','rp_y','rp_zr','rp_nb','rp_mo','rp_tc','rp_ru','rp_rh','rp_pd','rp_ag','rp_cd','rp_in','rp_sn','rp_sb','rp_te'],2);
 // flowTarget mede ritmo, mas nunca deve transformar a fase em trabalho artificial.
 // Redes profundas naturalmente acumulam flow durante a reconstrução; o piso da
 // classe serve principalmente para as fases mais simples e repetíveis.
 for(const p of phases){
   const budget=DURATION_BUDGETS[p.durationClass]||DURATION_BUDGETS.standard;
   if(p.id==='bigbang'){p.flowTarget=0;continue}
   if(p.id==='brown'||p.mode==='whiteCompact')continue;
   if(['guidedDecay','reactionExplore','spallation','neutrino','gamma','protonCapture','neutronize','remnant','pulsar','accretion','collapseFinal','blackhole'].includes(p.mode)){
     p.flowTarget=Math.max(1,p.target||1);continue;
   }
   if(p.primordial){p.flowTarget=Math.max(p.target||1,Math.min(budget.flow,(p.target||1)*2));continue}
   const objectiveFloor=Math.max(1,Math.ceil((p.target||1)*1.5));
   p.flowTarget=Math.max(objectiveFloor,budget.flow);
 }
 // Todos os modos recebem a janela-alvo como metadado de balanceamento.
 for(const p of phases){const b=DURATION_BUDGETS[p.durationClass]||DURATION_BUDGETS.standard;p.durationMinSeconds=b.minSeconds;p.durationMaxSeconds=b.maxSeconds}
}
configurePhaseDurationBudget(PHASES);

// Regra global de progressão relaxante"""
once(anchor,insert,'duration budget insertion')

old_progress="function currentProgress(){const s=phase();if(s.mode==='opening')return 0;if(s.mode==='reactionExplore')return Math.min(100,(state.atlasProgress/Math.max(1,s.target||1))*100);if(isPrimordial(s))return Math.min(100,(primordialGoalCount(s)/Math.max(1,s.target))*100);if(s.mode==='protonCapture')return Math.min(100,(state.protonCaptures/Math.max(1,s.target||1))*100);if(s.mode==='rpProcess')return Math.min(100,((state.created[s.new]||0)/Math.max(1,s.target||1))*100);if(s.id==='brown')return Math.min(100,((state.created.He3||0)/brownBurnLimit())*100);if(s.mode==='whiteCompact'){const info=whiteCounts(s);return Math.min(100,((Math.min(info.c,info.targetC)+Math.min(info.o,info.targetO))/Math.max(1,info.targetC+info.targetO))*100)}return Math.min(100,(state.flow/Math.max(1,s.flowTarget||1))*100)}"
new_progress="function currentProgress(){const s=phase();if(s.mode==='opening')return 0;if(s.id==='brown')return Math.min(100,((state.created.He3||0)/brownBurnLimit())*100);if(s.mode==='whiteCompact'){const info=whiteCounts(s);return Math.min(100,((Math.min(info.c,info.targetC)+Math.min(info.o,info.targetO))/Math.max(1,info.targetC+info.targetO))*100)}return Math.min(100,(state.flow/Math.max(1,s.flowTarget||1))*100)}"
once(old_progress,new_progress,'progress bar source')

once("announce('ATIVIDADE DA FASE',`${key}% DO AMBIENTE EXPLORADO`","announce('PROGRESSO DA FASE',`${key}% DO PROGRESSO`",'progress milestone title')
once("'Reações compatíveis também contam para esta atividade.'","'Reações compatíveis também contam para este progresso.'",'progress milestone copy')
once("const p=currentProgress(),flowTarget=Math.max(0,s.flowTarget||0),flowShown=Math.min(state.flow,flowTarget);","const p=currentProgress(),flowTarget=Math.max(0,s.flowTarget||0);",'HUD flow variable')

old_hud=""" if(s.mode==='reactionExplore')$('stageProgressText').textContent=`${state.atlasProgress}/${s.target}`;
 else if(isPrimordial(s)&&s.mode!=='opening')$('stageProgressText').textContent=`${primordialGoalCount(s)}/${s.target}`;
 else if(s.id==='brown')$('stageProgressText').textContent=`${state.created.He3||0}/${brownBurnLimit()}`;
 else if(s.mode==='whiteCompact'){const w=whiteCounts(s);$('stageProgressText').textContent=`C ${Math.min(w.c,w.targetC)}/${w.targetC} · O ${Math.min(w.o,w.targetO)}/${w.targetO}`}
 else if(s.mode==='rpProcess')$('stageProgressText').textContent=`${state.created[s.new]||0}/${s.target}`;
 else $('stageProgressText').textContent=flowTarget?`${flowShown}/${flowTarget}`:'';
 $('stageProgressLabel').textContent=s.id==='brown'?(state.readyToAdvance?'RESERVATÓRIO ESGOTADO':'QUEIMA DE DEUTÉRIO'):(state.readyToAdvance?'CONCLUÍDA':'ATIVIDADE');"""
new_hud=""" if(s.id==='brown')$('stageProgressText').textContent=`${state.created.He3||0}/${brownBurnLimit()}`;
 else if(s.mode==='whiteCompact'){const w=whiteCounts(s);$('stageProgressText').textContent=`C ${Math.min(w.c,w.targetC)}/${w.targetC} · O ${Math.min(w.o,w.targetO)}/${w.targetO}`}
 else $('stageProgressText').textContent=flowTarget?`${Math.round(p)}%`:'';
 $('stageProgressLabel').textContent=s.id==='brown'?(state.readyToAdvance?'RESERVATÓRIO ESGOTADO':'QUEIMA DE DEUTÉRIO'):(state.readyToAdvance?'CONCLUÍDA':'PROGRESSO');"""
once(old_hud,new_hud,'HUD progress display')

required=[
    "quick:{minSeconds:60,maxSeconds:90,flow:6}",
    "epic:{minSeconds:255,maxSeconds:300,flow:18}",
    "configurePhaseDurationBudget(PHASES)",
    "setTarget(['weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br'],3)",
    "setTarget(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir','pt','au','hg','tl','th','u'],2)",
    "setClass(['rp_te'],'epic')",
    "state.readyToAdvance?'CONCLUÍDA':'PROGRESSO'",
    "`${Math.round(p)}%`"
]
for marker in required:
    if marker not in s:
        raise SystemExit(f'missing marker: {marker}')

path.write_text(s)
print('duration/progress migration applied')
