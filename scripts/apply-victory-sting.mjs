import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

replaceOnce('assets/js/recipe-audio-sync.js',
`function nativeTone(freq=440,duration=.05,type='sine',gain=.03){\n try{const ctx=audio();if(!ctx)return;const play=()=>{try{const osc=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;g.__arduaRecipeReplica=true;osc.type=type;osc.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(Math.max(.0001,gain),now);osc.connect(g);g.connect(recipeOutput(ctx));const item={osc,g};replicaVoices.add(item);osc.onended=()=>replicaVoices.delete(item);osc.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.stop(now+duration+.02)}catch(_e){}};if(ctx.state==='suspended'){const resumed=ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(play).catch(()=>{});else play()}else play()}catch(_e){}\n}`,
`function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0){\n try{const ctx=audio();if(!ctx)return;const play=()=>{try{const osc=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime+Math.max(0,Number(delay)||0);g.__arduaRecipeReplica=true;osc.type=type;osc.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(Math.max(.0001,gain),now);osc.connect(g);g.connect(recipeOutput(ctx));const item={osc,g};replicaVoices.add(item);osc.onended=()=>replicaVoices.delete(item);osc.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.stop(now+duration+.02)}catch(_e){}};if(ctx.state==='suspended'){const resumed=ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(play).catch(()=>{});else play()}else play()}catch(_e){}\n}`);

replaceOnce('assets/js/recipe-audio-sync.js',
`function engineChordFinal(){if(motif?.done)playFinalAccent(motif.root)}\nwindow.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair]}:null});`,
`function engineChordFinal(){if(motif?.done)playFinalAccent(motif.root)}\nfunction victorySting(){\n syncPhase();\n const root=Number(motif?.root)||rootForCurrentFormula(),ratios=motif?.ratios||ratiosForProduct(),notes=ratios.map(r=>root*r);\n const arp=(f,delay,strong=false)=>{const d=strong?.28:.22;nativeTone(f,d,'triangle',RECIPE_NOTE_MAIN_GAIN,delay);nativeTone(f*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN,delay)};\n arp(notes[0],0);arp(notes[1],.12);arp(notes[2],.24,true);\n for(const f of notes){nativeTone(f,.62,'triangle',RECIPE_CHORD_MAIN_GAIN,.46);nativeTone(f*2,.48,'sine',RECIPE_CHORD_HARM_GAIN,.46)}\n nativeTone(root*2,.64,'triangle',RECIPE_FINAL_GAIN,.52);\n return true;\n}\nwindow.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySting,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair]}:null});`);

replaceOnce('assets/js/ardua.js',
`if(state.rewardPhaseComplete)return;state.rewardPhaseComplete=true;unlockRewardAchievement('phaseComplete');dom.star.classList.add('completion-settle');setTimeout(()=>dom.star?.classList.remove('completion-settle'),1050);adaptiveAudioResolve('completion');`,
`if(state.rewardPhaseComplete)return;state.rewardPhaseComplete=true;unlockRewardAchievement('phaseComplete');dom.star.classList.add('completion-settle');setTimeout(()=>dom.star?.classList.remove('completion-settle'),1050);`);

replaceOnce('assets/js/ardua.js',
`state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;if(s.mode==='stellarFormation')dom.star.parentElement?.classList.add('formation-ready-shell');save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);`,
`state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;if(s.mode==='stellarFormation')dom.star.parentElement?.classList.add('formation-ready-shell');save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance){$('phaseEndBtn').classList.add('show');const played=window.ARDUA_RECIPE_AUDIO_SYNC?.victorySting?.();if(!played)adaptiveAudioResolve('completion')}},720);`);

const validatorPath='scripts/validate-recipe-audio-cadence.js';
let validator=fs.readFileSync(validatorPath,'utf8');
const marker="console.log('Target recipe audio OK: 2x/2x cadence and native fallback when sync cannot route.');";
if(!validator.includes(marker))throw new Error('validator anchor missing');
const checks=`for(const token of [\"function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0)\",'ctx.currentTime+Math.max(0,Number(delay)||0)','function victorySting()','arp(notes[0],0);arp(notes[1],.12);arp(notes[2],.24,true)',\"RECIPE_CHORD_MAIN_GAIN,.46\",\"RECIPE_FINAL_GAIN,.52\",'engineChordFinal,victorySting'])if(!recipe.includes(token))throw new Error('Victory sting do motivo musical ausente: '+token);\nfor(const token of [\"$('phaseEndBtn').classList.add('show');const played=window.ARDUA_RECIPE_AUDIO_SYNC?.victorySting?.()\",\"if(!played)adaptiveAudioResolve('completion')\"])if(!engine.includes(token))throw new Error('Disparo da fanfarra no botão final ausente: '+token);\nconst completionReward=engine.match(/function phaseCompletionReward\\(s=phase\\(\\)\\)\\{[\\s\\S]*?\\n\\}/)?.[0]||'';if(completionReward.includes(\"adaptiveAudioResolve('completion')\"))throw new Error('Som genérico ainda dispara antes do botão final');\n`;
validator=validator.replace(marker,checks+marker);
fs.writeFileSync(validatorPath,validator);
console.log('Victory sting wired to the phase-end button using the phase recipe notes.');
