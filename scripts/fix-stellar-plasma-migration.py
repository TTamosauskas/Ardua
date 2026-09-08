from pathlib import Path
p=Path('scripts/apply-stellar-plasma-phases.py')
s=p.read_text(encoding='utf-8')
old='''# Fill-stage hook. fillStage has already cleared the old board/particle layers.\ns=s.replace("const s=phase();\\n if(s.mode===\'reactionExplore\')", "const s=phase();\\n if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}\\n if(s.mode===\'reactionExplore\')")\n'''
new='''# Fill-stage hook. Locate the declaration structurally because fillStage is compacted.\nhook="if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}"\nif hook not in s:\n    start=s.find("function fillStage()")\n    if start<0: raise SystemExit("fillStage declaration missing")\n    marker="const s=phase();"\n    at=s.find(marker,start)\n    if at<0: raise SystemExit("fillStage phase marker missing")\n    at+=len(marker)\n    s=s[:at]+hook+s[at:]\n'''
if old not in s:
    raise SystemExit('migration source anchor missing')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('stellar plasma migration fillStage locator fixed')
