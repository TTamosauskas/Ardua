from pathlib import Path

ENGINE = Path('assets/js/ardua.js')
src = ENGINE.read_text(encoding='utf-8')

# Guidance must distinguish pieces present on the board from pieces actually available
# for a new recipe. A nucleus waiting for beta decay remains visible, but is busy.
old = """function boardSymbolCounts(){const out={};state.pieces.forEach(p=>out[p.sym]=(out[p.sym]||0)+1);return out}
function hasRecipeIngredients(r,available=boardSymbolCounts()){const need=counts(r.ing);return Object.entries(need).every(([sym,n])=>(available[sym]||0)>=n)}"""
new = """function boardSymbolCounts(){const out={};state.pieces.forEach(p=>out[p.sym]=(out[p.sym]||0)+1);return out}
function guidanceBoardSymbolCounts(){const out={};state.pieces.forEach(p=>{if(p.neutronBetaPending)return;out[p.sym]=(out[p.sym]||0)+1});return out}
function guidanceSpeciesCount(sym){return guidanceBoardSymbolCounts()[sym]||0}
function hasRecipeIngredients(r,available=boardSymbolCounts()){const need=counts(r.ing);return Object.entries(need).every(([sym,n])=>(available[sym]||0)>=n)}"""
if old not in src:
    raise SystemExit('boardSymbolCounts anchor not found')
src = src.replace(old, new, 1)

# A neutron transition is actionable for guidance only when a free nucleus exists.
# Branch phases are the deliberate exception: a pending nucleus may capture before beta.
old = """function neutronTransitionActionable(tr,s=phase()){
 if(!tr||s.mode!=='neutron')return false;
 return speciesCount(tr.from)>0;
}"""
new = """function neutronTransitionActionable(tr,s=phase()){
 if(!tr||s.mode!=='neutron')return false;
 const free=[...state.pieces.values()].some(p=>p.sym===tr.from&&!p.neutronBetaPending);
 if(free)return true;
 if(neutronGameplay(s).pattern==='branch')return [...state.pieces.values()].some(p=>p.sym===tr.from&&p.neutronBetaPending&&p.neutronBetaTransition?.to===tr.to);
 return false;
}"""
if old not in src:
    raise SystemExit('neutronTransitionActionable anchor not found')
src = src.replace(old, new, 1)

# Fusion/Cameron-Fowler guidance follows the same availability rule.
old = """function guidanceActionIsExecutable(action,s=phase()){
 if(!action)return false;
 if(action.kind==='fusion')return hasRecipeIngredients(action.recipe);
 if(action.kind==='cameronFowler')return speciesCount('Be7')>0;
 if(action.kind==='neutron')return neutronTransitionActionable(action.transition,s);
 return false;
}"""
new = """function guidanceActionIsExecutable(action,s=phase()){
 if(!action)return false;
 if(action.kind==='fusion')return hasRecipeIngredients(action.recipe,guidanceBoardSymbolCounts());
 if(action.kind==='cameronFowler')return guidanceSpeciesCount('Be7')>0;
 if(action.kind==='neutron')return neutronTransitionActionable(action.transition,s);
 return false;
}"""
if old not in src:
    raise SystemExit('guidanceActionIsExecutable anchor not found')
src = src.replace(old, new, 1)

# Recursive route search must also calculate missing precursors from free pieces only.
old = """   const needs=counts(action.needs||[]),available=boardSymbolCounts();"""
new = """   const needs=counts(action.needs||[]),available=guidanceBoardSymbolCounts();"""
if old not in src:
    raise SystemExit('recursive guidance availability anchor not found')
src = src.replace(old, new, 1)

ENGINE.write_text(src, encoding='utf-8')
print('Applied beta guidance availability fix')
