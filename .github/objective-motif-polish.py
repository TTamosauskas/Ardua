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

old_tone = "function tone(f=440,d=.05,t='sine',v=.03){try{tone.ctx??=new(AudioContext||webkitAudioContext)();const o=tone.ctx.createOscillator(),g=tone.ctx.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(tone.ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,tone.ctx.currentTime+d);o.stop(tone.ctx.currentTime+d)}catch(e){}}"
new_tone = """function audioContextReady(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;tone.ctx??=new Ctx();return tone.ctx}catch(e){return null}}
function tone(f=440,d=.05,t='sine',v=.03){
 try{const ctx=audioContextReady();if(!ctx)return;const play=()=>{try{const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=t;o.frequency.setValueAtTime(f,now);g.gain.setValueAtTime(Math.max(.0001,v),now);o.connect(g);g.connect(ctx.destination);o.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.stop(now+d+.02)}catch(e){}};if(ctx.state==='suspended'){const resumed=ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(play).catch(()=>{});else play()}else play()}catch(e){}
}"""
js = once(js, old_tone, new_tone, 'robust Web Audio context')

js = once(js, "function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))];tone(f,index===2?.18:.13,index===2?'triangle':'sine',index===2?.032:.026)}", "function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))];tone(f,index===2?.20:.15,index===2?'triangle':'sine',index===2?.050:.042)}", 'motif note presence')
js = once(js, "function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes)tone(f,.34,'sine',.013);if(final)tone(notes[0]*2,.38,'triangle',.008)}", "function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes)tone(f,.38,'sine',.022);if(final)tone(notes[0]*2,.42,'triangle',.012)}", 'motif chord presence')

js = js.replace("dom.fx?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove())", "dom.star?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove())")
js = once(js, "stage.className='objective-motif-stage';dom.fx.appendChild(stage);", "stage.className='objective-motif-stage';dom.star.appendChild(stage);", 'motif stage top-level layering')

css = once(css, ".objective-motif-stage{position:absolute;inset:0;z-index:92;pointer-events:none;overflow:visible}", ".objective-motif-stage{position:absolute;inset:0;z-index:120;pointer-events:none;overflow:visible}", 'motif stage z-index')
layer_rule = """
.star-board.objective-motif-active .primordial-layer,
.star-board.objective-motif-active .neutrons,
.star-board.objective-motif-active .cosmic-rays,
.star-board.objective-motif-active .electron-mesh,
.star-board.objective-motif-active .remnant-layer{opacity:.16!important;filter:brightness(.55) saturate(.45);transition:opacity .22s ease,filter .22s ease}
.star-board.objective-motif-active .fx>.gamma-emission,
.star-board.objective-motif-active .fx>.decay-emission,
.star-board.objective-motif-active .fx>.spall-fragment,
.star-board.objective-motif-active .fx>.tunnel-ghost{opacity:.16!important;filter:brightness(.58) saturate(.45)}
"""
marker = ".star-board.objective-motif-active .atom:not(.motif-source){opacity:.42;filter:brightness(.67) saturate(.78)}\n"
css = once(css, marker, marker + layer_rule, 'dim floating layers during motif')

marker_test = "ok(css.includes('/* Objective Reaction Motif */')&&css.includes('.objective-motif-nucleus.result.visible'),'CSS contém a cerimônia visual central da reação-objetivo');\n"
add_tests = marker_test + "ok(engine.includes('window.AudioContext||window.webkitAudioContext')&&engine.includes(\"ctx.state==='suspended'\")&&engine.includes('ctx.resume()'),'áudio do Reaction Motif desbloqueia e retoma Web Audio de forma compatível');\nok(engine.includes(\"stage.className='objective-motif-stage';dom.star.appendChild(stage)\"),'palco do Reaction Motif fica acima das camadas de partículas');\nok(css.includes('.star-board.objective-motif-active .primordial-layer')&&css.includes('.star-board.objective-motif-active .neutrons')&&css.includes('.star-board.objective-motif-active .cosmic-rays'),'prótons, nêutrons e partículas flutuantes perdem contraste durante a cerimônia');\nok(css.includes('.objective-motif-stage{position:absolute;inset:0;z-index:120'),'Reaction Motif usa camada visual superior dedicada');\n"
tests = once(tests, marker_test, add_tests, 'motif polish regression tests')

js_path.write_text(js)
css_path.write_text(css)
test_path.write_text(tests)
Path('.github/objective-motif-polish.py').unlink(missing_ok=True)
Path('.github/workflows/apply-objective-motif-polish.yml').unlink(missing_ok=True)
