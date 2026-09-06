from pathlib import Path

js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
js = js_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')

old_eject = "if(spawn.ejected){const c=starSize()/2,dx=piece.x-c,dy=piece.y-c,d=Math.hypot(dx,dy)||1,reach=Math.max(starSize()*1.30,Math.hypot(window.innerWidth,window.innerHeight)*.72);piece.x=c+dx/d*reach;piece.y=c+dy/d*reach;renderPieces();await wait(540);state.pieces.delete(piece.id);renderPieces();return null}"
new_eject = "if(spawn.ejected){const c=starSize()/2,dx=piece.x-c,dy=piece.y-c,d=Math.hypot(dx,dy),a=d>.001?Math.atan2(dy,dx):Math.random()*Math.PI*2,reach=Math.max(starSize()*1.30,Math.hypot(window.innerWidth,window.innerHeight)*.72);piece.x=c+Math.cos(a)*reach;piece.y=c+Math.sin(a)*reach;renderPieces();await wait(540);state.pieces.delete(piece.id);renderPieces();return null}"
if old_eject in js:
    js = js.replace(old_eject, new_eject, 1)
elif new_eject not in js:
    raise RuntimeError('stellar ejection block not found')

old_opacity = ".star-board:not(.primordial-mode) .primordial-particle.selected,\n.star-board:not(.primordial-mode) .primordial-particle.candidate,\n.star-board:not(.primordial-mode) .primordial-particle.reacting,\n.star-board:not(.primordial-mode) .primordial-particle.dragging{opacity:1}\n.neutron{"
new_opacity = ".star-board:not(.primordial-mode) .primordial-particle.candidate{opacity:.76}\n.star-board:not(.primordial-mode) .primordial-particle.selected,\n.star-board:not(.primordial-mode) .primordial-particle.reacting,\n.star-board:not(.primordial-mode) .primordial-particle.dragging{opacity:1}\n.neutron{"
if old_opacity in css:
    css = css.replace(old_opacity, new_opacity, 1)
elif new_opacity not in css:
    raise RuntimeError('stellar primordial opacity block not found')

old_neutron = ".neutron.candidate,.neutron.selected,.star-board.neutron-active .neutron{opacity:1}"
new_neutron = ".neutron.candidate{opacity:.76}.neutron.selected,.star-board.neutron-active .neutron{opacity:1}"
if old_neutron in css:
    css = css.replace(old_neutron, new_neutron, 1)
elif new_neutron not in css:
    raise RuntimeError('stellar neutron opacity block not found')

for token in [
    "d>.001?Math.atan2(dy,dx):Math.random()*Math.PI*2",
    ".primordial-particle.candidate{opacity:.76}",
    ".neutron.candidate{opacity:.76}",
]:
    if token not in js + css:
        raise RuntimeError(f'missing refinement token: {token}')

js_path.write_text(js, encoding='utf-8')
css_path.write_text(css, encoding='utf-8')
print('stellar particle shell refinements applied')
