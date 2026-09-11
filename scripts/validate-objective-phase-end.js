const fs=require('fs');

const runtime=fs.readFileSync('assets/js/campaign-runtime-sync.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');

function ok(value,message){if(!value)throw new Error(message)}

const delay=Number(runtime.match(/OBJECTIVE_END_FALLBACK_DELAY=(\d+)/)?.[1]||0);
ok(delay>720,'objective completion fallback must wait beyond the engine normal 720 ms arming delay');
ok(runtime.includes('function objectiveRatiosComplete(text)'), 'visible ratio completion detector is missing');
ok(runtime.includes("label.includes('espalhar')&&label.includes('poeira estelar')"), 'fallback must stay scoped to stellar dust endings');
ok(runtime.includes("button.classList.contains('show')"), 'fallback must yield to the normal engine end button');
ok(runtime.includes("clone.dataset.objectiveCompletionFallback='1'"), 'fallback round button marker is missing');
ok(runtime.includes('playVictoryFanfare?.()'), 'fallback must play the canonical final-phase fanfare');
ok(runtime.includes("d.className='dust-speck'"), 'fallback stellar-dust particles are missing');
ok(runtime.includes("pieces.classList.add('hidden')"), 'fallback must hide the original board pieces during dispersal');
ok(runtime.includes('maxMotionMs+(reducedMotion()?160:700)'), 'fallback must preserve the post-dispersal appreciation pause');
ok(runtime.includes("original.addEventListener('click',e=>e.stopImmediatePropagation(),{capture:true,once:true})"), 'fallback must hand completion to the map listener without replaying the engine transition');
ok(runtime.includes('original.click()'), 'fallback must hand completion back to the canonical campaign end-button listeners');

ok(/id:'he_red'[^\n]*target:6/.test(engine), 'Anã vermelha Hélio-4 regression fixture changed');
ok(/id:'stellar_movement'[^\n]*target:1,flowTarget:0/.test(engine), 'Movimentação Estelar regression fixture changed');
ok(engine.includes("Leve o Hélio até o núcleo estelar. — ${done}/${s.target}"), 'movement objective ratio contract changed');
ok(engine.includes("setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720)"), 'normal engine end-button arming contract changed');

console.log('Objective phase-end fallback validation passed.');
