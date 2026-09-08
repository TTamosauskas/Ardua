from pathlib import Path
p=Path('scripts/apply-stellar-plasma-followup.py')
s=p.read_text(encoding='utf-8')
legacy="""start=\"if(s.id==='coulomb_intro'){\"; end=\"if(s.mode==='stellarFormation')\"\na=s.find(start);b=s.find(end,a)\nrequire(a>=0 and b>a,'Coulomb fill block anchors missing')\n"""
scoped_old="""start=\"if(s.id==='coulomb_intro'){\"; end=\"if(s.mode==='stellarFormation')\"\nfill_at=s.find('function fillStage()');require(fill_at>=0,'fillStage missing')\na=s.find(start,fill_at);b=s.find(end,a)\nrequire(a>=fill_at and b>a,'Coulomb fill block anchors missing')\n"""
fixed="""start=\"if(s.id==='coulomb_intro'){\"; end=\"if(s.mode==='convection')\"\nfill_at=s.find('function fillStage()');require(fill_at>=0,'fillStage missing')\na=s.find(start,fill_at);b=s.find(end,a)\nrequire(a>=fill_at and b>a,'Coulomb fill block anchors missing')\n"""
if legacy in s:s=s.replace(legacy,fixed,1)
elif scoped_old in s:s=s.replace(scoped_old,fixed,1)
elif fixed not in s:raise SystemExit('Coulomb migration block not found')
oldv="'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',"
newv="'async function ionizeStellarAtom(piece,electron)','async function recombineStellarIon(piece,electron)',"
if oldv in s:s=s.replace(oldv,newv,1)
oldv="'function triggerSolarWind()','solarWindEligibleParticles().length<10'"
newv="'async function triggerSolarWind()','solarWindEligibleParticles().length<10'"
if oldv in s:s=s.replace(oldv,newv,1)
p.write_text(s,encoding='utf-8')
print('plasma follow-up migration locator fixed to Coulomb→Convection boundary')
