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

old_progress = "function currentProgress(){const s=phase();if(s.mode==='opening')return 0;if(s.id==='brown')return Math.min(100,((state.created.He3||0)/brownBurnLimit())*100);if(s.mode==='whiteCompact'){const info=whiteCounts(s);return Math.min(100,((Math.min(info.c,info.targetC)+Math.min(info.o,info.targetO))/Math.max(1,info.targetC+info.targetO))*100)}return Math.min(100,(state.flow/Math.max(1,s.flowTarget||1))*100)}"
new_progress = r'''function objectiveProgress(s=phase()){
 const done=objectiveSatisfied(s);if(done)return 1;
 const ratio=(n,d)=>Math.max(0,Math.min(.99,Number(n||0)/Math.max(1,Number(d||1))));
 const combine=parts=>Math.max(0,Math.min(.99,parts.reduce((sum,v)=>sum+Math.max(0,Math.min(1,Number(v)||0)),0)/Math.max(1,parts.length)));
 if(s.mode==='opening')return 0;
 if(s.mode==='reactionExplore')return ratio(state.atlasProgress,s.target);
 if(s.mode==='decayGarden')return ratio(decayDiscoveryCount(s),s.target);
 if(s.mode==='whiteCompact'){const info=whiteCounts(s);return ratio(Math.min(info.c,info.targetC)+Math.min(info.o,info.targetO),info.targetC+info.targetO)}
 if(s.mode==='neutronize')return ratio(state.crushed,s.target);
 if(s.mode==='neutron'){
   const g=neutronGameplay(s),parts=[ratio(state.created[s.new]||0,s.target)];
   if(s.id==='tc'||s.id==='pm')parts.push(state.radioactiveProofDone?1:0);
   if(g.requiresSource)parts.push(state.neutronSourceActivations>=1?1:0);
   if(g.requiresBranch)parts.push(state.neutronBranchesObserved>=1?1:0);
   if(g.requiresFreezeout)parts.push(state.neutronFreezeouts>=1?1:0);
   return combine(parts);
 }
 if(s.mode==='blackhole'){const initial=Math.max(1,state.postInitialMatter||state.pieces.size||1);return ratio(Math.max(0,initial-state.pieces.size),initial)}
 if(isPostMode(s))return ratio(state.absorbed,s.target);
 if(isPrimordial(s)&&s.mode!=='opening')return ratio(primordialGoalCount(s),s.target);
 if(s.mode==='rpProcess'){
   const step=rpStep(s),parts=[ratio(state.created[s.new]||0,s.target)];
   if(step?.pattern==='waiting')parts.push(state.rpWaitDecays>=1?1:0);
   if(step?.pattern==='cycle')parts.push(state.rpCyclesObserved>=1?1:0);
   return combine(parts);
 }
 if(s.mode==='protonCapture')return ratio(state.protonCaptures,s.target);
 if(s.id==='brown')return ratio(state.created.He3||0,brownBurnLimit());
 return ratio(state.created[s.new]||0,s.target);
}
function currentProgress(){
 const s=phase();if(s.mode==='opening')return 0;
 const objective=objectiveProgress(s);
 if(s.id==='brown'||s.mode==='whiteCompact'||Number(s.flowTarget||0)<=0)return objective*100;
 const flow=Math.max(0,Math.min(1,state.flow/Math.max(1,s.flowTarget||1)));
 return Math.min(objective,flow)*100;
}'''
js = once(js, old_progress, new_progress, 'objective-aware progress')

old_text = "else $('stageProgressText').textContent=flowTarget?`${Math.round(p)}%`:'';"
new_text = "else {const shown=state.readyToAdvance?100:Math.min(99,Math.floor(p));$('stageProgressText').textContent=flowTarget?`${shown}%`:'';}"
js = once(js, old_text, new_text, 'truthful progress percentage')

marker = "ok(css.includes('@media(prefers-reduced-motion:reduce)'),'efeitos respeitam preferência de redução de movimento');\n"
addition = marker + "ok(engine.includes('function objectiveProgress(s=phase())')&&engine.includes('const done=objectiveSatisfied(s);if(done)return 1'),'barra possui progresso científico próprio e só libera 100% com objetivo satisfeito');\nok(engine.includes('const objective=objectiveProgress(s)')&&engine.includes('return Math.min(objective,flow)*100'),'PROGRESSO usa o menor avanço entre objetivo científico e flow');\nok(engine.includes(\"state.readyToAdvance?100:Math.min(99,Math.floor(p))\"),'texto da barra não arredonda uma fase incompleta para 100%');\n"
tests = once(tests, marker, addition, 'progress validation tests')

js_path.write_text(js)
test_path.write_text(tests)

# Temporary migration files must not survive the migration commit.
Path('tools/apply-objective-progress.py').unlink(missing_ok=True)
Path('.github/workflows/apply-objective-progress.yml').unlink(missing_ok=True)
