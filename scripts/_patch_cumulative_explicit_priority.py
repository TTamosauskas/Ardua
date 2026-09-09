from pathlib import Path

p=Path('assets/js/ardua.js'); s=p.read_text()
old="if(!stellarAtomicMode(s)&&!electron&&cumulativeFusionTapAvailable(piece,s))return false;"
new="""const otherMechanicArmed=state.selectedNeutron!==null||state.selectedCosmic!==null||state.primordialSelected!==null||state.blackHoleSelected||state.convectionArmed;
 if(!stellarAtomicMode(s)&&!electron&&(otherMechanicArmed||cumulativeFusionTapAvailable(piece,s)))return false;"""
if old in s:s=s.replace(old,new,1)
elif new not in s:raise SystemExit('passive atomic priority anchor missing')
p.write_text(s)

p=Path('scripts/validate-cumulative-recipes.js'); v=p.read_text()
v=v.replace('const passiveYield="if(!stellarAtomicMode(s)&&!electron&&cumulativeFusionTapAvailable(piece,s))return false;";\nif(!atomicTap.includes(passiveYield))fail(\'Quimica atomica passiva pode roubar um toque de fusao cumulativa\');',"""const passiveYield=\"if(!stellarAtomicMode(s)&&!electron&&(otherMechanicArmed||cumulativeFusionTapAvailable(piece,s)))return false;\";
if(!atomicTap.includes('const otherMechanicArmed=state.selectedNeutron!==null||state.selectedCosmic!==null||state.primordialSelected!==null||state.blackHoleSelected||state.convectionArmed;'))fail('Mecanicas explicitamente armadas precisam vencer quimica atomica passiva');
if(!atomicTap.includes(passiveYield))fail('Quimica atomica passiva pode roubar um toque de fusao cumulativa');""",1)
p.write_text(v)
