from pathlib import Path

# Make the large-engine migration robust to the compact fillStage implementation.
p=Path('scripts/apply-stellar-plasma-phases.py')
s=p.read_text(encoding='utf-8')
old='''# Fill-stage hook. fillStage has already cleared the old board/particle layers.\ns=s.replace("const s=phase();\\n if(s.mode===\'reactionExplore\')", "const s=phase();\\n if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}\\n if(s.mode===\'reactionExplore\')")\n'''
new='''# Fill-stage hook. Locate the declaration structurally because fillStage is compacted.\nhook="if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}"\nif hook not in s:\n    start=s.find("function fillStage()")\n    if start<0: raise SystemExit("fillStage declaration missing")\n    marker="const s=phase();"\n    at=s.find(marker,start)\n    if at<0: raise SystemExit("fillStage phase marker missing")\n    at+=len(marker)\n    s=s[:at]+hook+s[at:]\n'''
if old not in s:
    raise SystemExit('migration source anchor missing')
p.write_text(s.replace(old,new,1),encoding='utf-8')

# The cumulative-recipe validator used to require Coulomb immediately after
# Anã Amarela. Preserve every cumulative-mechanics assertion, changing only
# the phase-order contract to the newly approved plasma lesson chain.
p=Path('scripts/validate-cumulative-recipes.js')
s=p.read_text(encoding='utf-8')
old="if(JSON.stringify(G.prerequisites.coulomb_intro)!==JSON.stringify({allOf:['he_yellow']}))fail('Coulomb deve seguir Anã Amarela');"
new="""if(JSON.stringify(G.prerequisites.solar_wind)!==JSON.stringify({allOf:['he_yellow']}))fail('Vento Solar deve seguir Anã Amarela');
if(JSON.stringify(G.prerequisites.stellar_ionization)!==JSON.stringify({allOf:['solar_wind']}))fail('Ionização Estelar deve seguir Vento Solar');
if(JSON.stringify(G.prerequisites.stellar_recombination)!==JSON.stringify({allOf:['stellar_ionization']}))fail('Recombinação Estelar deve seguir Ionização Estelar');
if(JSON.stringify(G.prerequisites.coulomb_intro)!==JSON.stringify({allOf:['stellar_recombination']}))fail('Coulomb deve seguir Recombinação Estelar');"""
if new not in s:
    if old not in s:
        raise SystemExit('cumulative phase-order anchor missing')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

print('stellar plasma migration locator and cumulative order contract fixed')
