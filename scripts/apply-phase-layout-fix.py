from pathlib import Path

engine=Path('assets/js/ardua.js')
s=engine.read_text()
old="""function applyGeometry(){
  const g=phaseGeometry(),root=document.documentElement;
  const px=Math.max(260,Math.min(window.innerWidth*g.factor,g.max));
  root.style.setProperty('--starSize',`${px}px`);
  const minCell=g.r>=5?28:36,c=Math.max(minCell,Math.min(72,px*.88/(2*g.r+1)));
  root.style.setProperty('--cellSize',`${c}px`);
}"""
new="""function applyGeometry(){
  const g=phaseGeometry(),root=document.documentElement;
  const desired=Math.max(260,Math.min(window.innerWidth*g.factor,g.max));
  const shellWidth=Math.max(0,dom.star?.parentElement?.clientWidth||window.innerWidth-26);
  const px=Math.min(desired,shellWidth||desired);
  root.style.setProperty('--starSize',`${px}px`);
  const minCell=g.r>=5?28:36,c=Math.max(minCell,Math.min(72,px*.88/(2*g.r+1)));
  root.style.setProperty('--cellSize',`${c}px`);
}"""
if old not in s:
    raise SystemExit('applyGeometry source pattern not found')
engine.write_text(s.replace(old,new,1))

index=Path('index.html')
s=index.read_text()
link='<link rel="stylesheet" href="assets/css/phase-layout-consistency.css?v=20260910-phase-layout-1"/>'
anchor='<link rel="stylesheet" href="assets/css/campaign-discovery-notifications.css"/>'
if link not in s:
    if anchor not in s: raise SystemExit('index CSS anchor not found')
    s=s.replace(anchor,anchor+'\n'+link,1)
index.write_text(s)

pages=Path('.github/workflows/pages.yml')
s=pages.read_text()
step='''      - name: Validate phase layout consistency\n        run: node scripts/validate-phase-layout-consistency.js\n\n'''
anchor='''      - name: Validate compact phase goal hierarchy\n        run: node scripts/validate-phase-goal-hierarchy.js\n\n'''
if step not in s:
    if anchor not in s: raise SystemExit('Pages validator anchor not found')
    s=s.replace(anchor,anchor+step,1)
pages.write_text(s)
