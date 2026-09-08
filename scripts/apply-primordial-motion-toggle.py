from pathlib import Path

P=Path('assets/js/ardua.js')
s=P.read_text(encoding='utf-8')

old="function stopPrimordialDrift(){if(state.primordialDriftTimer){clearInterval(state.primordialDriftTimer);state.primordialDriftTimer=null}}\nfunction startPrimordialDrift(){\n stopPrimordialDrift();const s=phase();if(s.mode==='opening'||!state.primordialParticles.size)return;"
new="function rotationMotionEnabled(){return window.ARDUA_ROTATION?.enabled?.()!==false}\nfunction stopPrimordialDrift(){if(state.primordialDriftTimer){clearInterval(state.primordialDriftTimer);state.primordialDriftTimer=null}}\nfunction startPrimordialDrift(){\n stopPrimordialDrift();const s=phase();if(!rotationMotionEnabled()||s.mode==='opening'||!state.primordialParticles.size)return;"
if new not in s:
    if old not in s: raise SystemExit('primordial drift anchor missing')
    s=s.replace(old,new,1)

old="const now=phase();if(now.mode==='opening'||state.phaseDone)return;"
new="const now=phase();if(!rotationMotionEnabled()||now.mode==='opening'||state.phaseDone)return;"
if new not in s:
    if old not in s: raise SystemExit('primordial interval guard missing')
    s=s.replace(old,new,1)

old="function startPrimordialMoleculeDrift(){\n stopPrimordialMoleculeDrift();if(!state.primordialMolecules?.size)return;state.primordialMoleculeTimer=setInterval(()=>{const s=phase();if(s.mode!=='primordialMolecule'||state.phaseDone||state.locked)return;"
new="function startPrimordialMoleculeDrift(){\n stopPrimordialMoleculeDrift();if(!rotationMotionEnabled()||!state.primordialMolecules?.size)return;state.primordialMoleculeTimer=setInterval(()=>{const s=phase();if(!rotationMotionEnabled()||s.mode!=='primordialMolecule'||state.phaseDone||state.locked)return;"
if new not in s:
    if old not in s: raise SystemExit('molecule drift anchor missing')
    s=s.replace(old,new,1)

old="function animateParticleThrow(id,vx,vy){\n const p=state.primordialParticles.get(id);if(!p)return;const maxSpeed=.95,speed=Math.hypot(vx,vy);"
new="function animateParticleThrow(id,vx,vy){\n const p=state.primordialParticles.get(id);if(!p)return;if(!rotationMotionEnabled()){p.throwing=false;p.throwVx=0;p.throwVy=0;renderPrimordialParticles();return}const maxSpeed=.95,speed=Math.hypot(vx,vy);"
if new not in s:
    if old not in s: raise SystemExit('throw start anchor missing')
    s=s.replace(old,new,1)

old="const step=now=>{const q=state.primordialParticles.get(id);if(!q||q.reacting||q.dragging){if(q)q.throwing=false;return}const dt=Math.min(34,Math.max(8,now-last));"
new="const step=now=>{const q=state.primordialParticles.get(id);if(!q||q.reacting||q.dragging){if(q)q.throwing=false;return}if(!rotationMotionEnabled()){q.throwing=false;q.throwVx=0;q.throwVy=0;renderPrimordialParticles();return}const dt=Math.min(34,Math.max(8,now-last));"
if new not in s:
    if old not in s: raise SystemExit('throw frame anchor missing')
    s=s.replace(old,new,1)

anchor="window.addEventListener('resize',()=>{applyGeometry();drawCells();"
listener="window.addEventListener('ardua:rotation-change',ev=>{\n const moving=ev.detail?.enabled!==false;\n if(!moving){\n  stopPrimordialDrift();stopPrimordialMoleculeDrift();\n  state.primordialParticles.forEach(p=>{if(p.throwing){p.throwing=false;p.throwVx=0;p.throwVy=0}});\n  renderPrimordialParticles();syncPrimordialMoleculeVisuals();\n }else{startPrimordialDrift();startPrimordialMoleculeDrift()}\n});\n"
if listener not in s:
    if anchor not in s: raise SystemExit('bottom listener anchor missing')
    s=s.replace(anchor,listener+anchor,1)

P.write_text(s,encoding='utf-8')
print('primordial motion now follows rotation toggle')
