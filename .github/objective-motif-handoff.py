from pathlib import Path


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)

js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
test_path = Path('tests/validate-static.js')
js = js_path.read_text()
css = css_path.read_text()
tests = test_path.read_text()

old_audio = "function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))];tone(f,index===2?.20:.15,index===2?'triangle':'sine',index===2?.050:.042)}\nfunction objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes)tone(f,.38,'sine',.022);if(final)tone(notes[0]*2,.42,'triangle',.012)}"
new_audio = "function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))],d=index===2?.28:.24,g=index===2?.086:.074;tone(f,d,'triangle',g);tone(f*2,d*.82,'sine',g*.30)}\nfunction objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',.040);tone(f*2,.42,'sine',.014)}if(final)tone(notes[0]*2,.56,'triangle',.022)}"
js = once(js, old_audio, new_audio, 'stronger motif notes and chord')

old_reset = "function objectiveMotifReset(){\n state.objectiveMotifRun++;state.objectiveMotifActive=false;state.objectiveMotifSelection=null;dom.star?.classList.remove('objective-motif-active');dom.star?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove());dom.pieces?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));\n}"
new_reset = "function objectiveMotifReset(){\n state.objectiveMotifRun++;state.objectiveMotifActive=false;state.objectiveMotifSelection=null;dom.star?.classList.remove('objective-motif-active');dom.star?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove());dom.pieces?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.pieces?.querySelectorAll('.motif-grid-product,.motif-grid-ready').forEach(x=>x.classList.remove('motif-grid-product','motif-grid-ready'));\n}"
js = once(js, old_reset, new_reset, 'motif reset handoff cleanup')

old_reveal = """async function objectiveMotifReveal(ctx,product,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveMotifResultNode(product);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,objectiveMotifFinalCredit());updateHUD();RewardDirector.particles(ctx.center,ctx.center,3);vibrate(rewardReducedMotion()?5:[6,9,6]);await wait(reduced?90:310);if(ctx.run!==state.objectiveMotifRun)return;
 result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?70:245);if(ctx.run!==state.objectiveMotifRun)return;ctx.stage.remove();dom.pieces.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.star.classList.remove('objective-motif-active');state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward();
}"""
new_reveal = """async function objectiveMotifReveal(ctx,product,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveMotifResultNode(product);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,objectiveMotifFinalCredit());updateHUD();RewardDirector.particles(ctx.center,ctx.center,3);vibrate(rewardReducedMotion()?5:[6,9,6]);await wait(reduced?90:310);if(ctx.run!==state.objectiveMotifRun)return;
 result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?70:245);if(ctx.run!==state.objectiveMotifRun)return;const grid=dom.pieces.querySelector(`[data-id=\"${product.id}\"]`);ctx.stage.remove();dom.pieces.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.star.classList.remove('objective-motif-active');if(grid){grid.classList.remove('motif-grid-product');grid.classList.add('motif-grid-ready');requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('motif-grid-ready')))}state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward();
}"""
js = once(js, old_reveal, new_reveal, 'motif visual handoff')

old_fuse = "state.selected=[];if(motifCtx)await objectiveMotifReveal(motifCtx,np,t);burst(t.x,t.y);"
new_fuse = "state.selected=[];if(motifCtx){renderPieces();const motifGridProduct=dom.pieces.querySelector(`[data-id=\"${np.id}\"]`);if(motifGridProduct)motifGridProduct.classList.add('motif-grid-product');await objectiveMotifReveal(motifCtx,np,t)}burst(t.x,t.y);"
js = once(js, old_fuse, new_fuse, 'render product under motif before handoff')

if '/* Objective Motif grid handoff */' not in css:
    css += """

/* Objective Motif grid handoff */
.star-board .atom.motif-grid-product{opacity:0!important;pointer-events:none!important;transition:none!important}
.star-board .atom.motif-grid-ready{opacity:1!important;transition:none!important;filter:none!important}
"""

marker = "console.log('\\nValidação estática do Ardua concluída.');\n"
addition = """ok(engine.includes("d=index===2?.28:.24")&&engine.includes("g=index===2?.086:.074")&&engine.includes("tone(f*2,d*.82,'sine',g*.30)"),'notas de seleção e alinhamento do Reaction Motif têm presença reforçada e harmônico audível');
ok(engine.includes("tone(f,.52,'triangle',.040)")&&engine.includes("tone(f*2,.42,'sine',.014)"),'acorde final do Reaction Motif possui corpo e reforço harmônico próprios');
ok(engine.includes("renderPieces();const motifGridProduct=dom.pieces.querySelector")&&engine.includes("motifGridProduct.classList.add('motif-grid-product')"),'produto real da grade é renderizado sob a cerimônia antes do handoff');
ok(engine.includes("grid.classList.remove('motif-grid-product')")&&engine.includes("grid.classList.add('motif-grid-ready')"),'fim da cerimônia revela o produto já existente na grade sem segunda transformação');
ok(css.includes('/* Objective Motif grid handoff */')&&css.includes('.atom.motif-grid-product')&&css.includes('.atom.motif-grid-ready'),'CSS contém handoff instantâneo entre produto central e produto da grade');
""" + marker
tests = once(tests, marker, addition, 'objective motif handoff regression tests')

js_path.write_text(js)
css_path.write_text(css)
test_path.write_text(tests)
Path('.github/objective-motif-handoff.py').unlink(missing_ok=True)
Path('.github/workflows/apply-objective-motif-handoff.yml').unlink(missing_ok=True)
