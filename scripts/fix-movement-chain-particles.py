from pathlib import Path
p=Path('scripts/apply-movement-chain-particles.py')
s=p.read_text(encoding='utf-8')
s=s.replace('prog="  if(s.mode===\'opening\')return 0;"','prog="if(s.mode===\'opening\')return 0;"')
s=s.replace('prog+"\\n  if(s.mode===\'movementTutorial\')return 0;"','prog+"\\n if(s.mode===\'movementTutorial\')return 0;"')
p.write_text(s,encoding='utf-8')
print('movement migration objective anchor hardened')
