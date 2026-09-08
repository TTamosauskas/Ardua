from pathlib import Path

engine=Path('assets/js/ardua.js')
s=engine.read_text(encoding='utf-8')
old="""function positiveStellarIon(p){return !!p&&!p.free&&p.matterState==='atom'&&pieceCharge(p)===1}
function stellarIonizationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!neutralStellarAtom(p))return false;const list=stellarIonizationSpecies(s);return !list||list.includes(p.sym)
}
function stellarRecombinationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!positiveStellarIon(p))return false;const list=stellarRecombinationSpecies(s);return !list||list.includes(p.sym)
}
"""
new="""function positiveStellarIon(p){return !!p&&!p.free&&p.matterState==='atom'&&pieceCharge(p)===1}
function stellarIonizationKnowledge(s=phase()){return s?.mode==='stellarIonization'||campaignKnowledgeReached('stellar_ionization')}
function stellarRecombinationKnowledge(s=phase()){return s?.mode==='stellarRecombination'||campaignKnowledgeReached('stellar_recombination')}
function stellarIonizationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!stellarIonizationKnowledge(s)||!neutralStellarAtom(p))return false;const list=stellarIonizationSpecies(s);return !list||list.includes(p.sym)
}
function stellarRecombinationEligible(p,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!stellarRecombinationKnowledge(s)||!positiveStellarIon(p))return false;const list=stellarRecombinationSpecies(s);return !list||list.includes(p.sym)
}
"""
if new not in s:
    if old not in s: raise SystemExit('plasma knowledge-gate anchor missing')
    s=s.replace(old,new,1)
engine.write_text(s,encoding='utf-8')

validator=Path('scripts/validate-stellar-plasma.js')
v=validator.read_text(encoding='utf-8')
needle=" 'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',"
replacement=" 'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',\n 'function stellarIonizationKnowledge(s=phase())','function stellarRecombinationKnowledge(s=phase())',\n \"!stellarIonizationKnowledge(s)||!neutralStellarAtom(p)\",\"!stellarRecombinationKnowledge(s)||!positiveStellarIon(p)\"," 
if replacement not in v:
    if needle not in v: raise SystemExit('plasma validator gate anchor missing')
    v=v.replace(needle,replacement,1)
validator.write_text(v,encoding='utf-8')
print('plasma ionization/recombination knowledge gates separated')
