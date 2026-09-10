import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

replaceOnce('assets/js/ardua.js',
`objectiveMotifSelection:null,objectiveMotifActive:false,objectiveMotifRun:0};`,
`objectiveMotifSelection:null,objectiveMotifActive:false,objectiveMotifRun:0,objectiveMotifCombinationOctave:0};`);

replaceOnce('assets/js/ardua.js',
`function objectiveMotifNotes(r){\n const root=OBJECTIVE_MOTIF_ROOTS[objectiveMotifHash(recipeKey(r))%OBJECTIVE_MOTIF_ROOTS.length],unstable=!!E[r?.out]?.unstable;\n return unstable?[root,root*(4/3),root*1.5]:[root,root*1.25,root*1.5];\n}`,
`function objectiveMotifNotes(r){\n const baseRoot=OBJECTIVE_MOTIF_ROOTS[objectiveMotifHash(recipeKey(r))%OBJECTIVE_MOTIF_ROOTS.length],octave=Math.max(0,Number(state.objectiveMotifCombinationOctave)||0),root=baseRoot*(2**octave),unstable=!!E[r?.out]?.unstable;\n return unstable?[root,root*(4/3),root*1.5]:[root,root*1.25,root*1.5];\n}`);

replaceOnce('assets/js/ardua.js',
`function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',OBJECTIVE_MOTIF_CHORD_MAIN_GAIN);tone(f*2,.42,'sine',OBJECTIVE_MOTIF_CHORD_HARM_GAIN)}if(final)tone(notes[0]*2,.56,'triangle',OBJECTIVE_MOTIF_FINAL_GAIN)}`,
`function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',OBJECTIVE_MOTIF_CHORD_MAIN_GAIN);tone(f*2,.42,'sine',OBJECTIVE_MOTIF_CHORD_HARM_GAIN)}if(final)tone(notes[0]*2,.56,'triangle',OBJECTIVE_MOTIF_FINAL_GAIN);state.objectiveMotifCombinationOctave=Math.max(0,Number(state.objectiveMotifCombinationOctave)||0)+1}`);

replaceOnce('assets/js/ardua.js',
`state.selected=[];state.contextRecipeKey=null;state.infoSelection=null;state.stratificationCoreGroup=null;`,
`state.selected=[];state.contextRecipeKey=null;state.infoSelection=null;state.stratificationCoreGroup=null;state.objectiveMotifCombinationOctave=0;`);

replaceOnce('assets/js/ardua.js',
`state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;if(s.mode==='stellarFormation')dom.star.parentElement?.classList.add('formation-ready-shell');save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance){$('phaseEndBtn').classList.add('show');const played=window.ARDUA_RECIPE_AUDIO_SYNC?.victorySting?.();if(!played)adaptiveAudioResolve('completion')}},720);`,
`state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;if(s.mode==='stellarFormation')dom.star.parentElement?.classList.add('formation-ready-shell');save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);`);

replaceOnce('assets/js/ardua.js',
`function endPhaseAction(){\n const s=phase();if(!state.readyToAdvance)return;\n state.phaseDone=true;state.locked=true;stopPrimordialDrift();cancelParticleDrag();stopAccretionFeed();stopCosmicRaySystem();stopNeutronSystem();\n if(isPrimordial(s))return advancePrimordial();if(s.endEvent==='plasmaTransition')return advanceStellarAtomicPhase();if(s.endEvent==='stellarBirth')return stellarFormationAdvance();if(s.endEvent==='finale')return finishCampaign();if(s.endEvent==='postTransition')return compactAdvance();return scatterStage()\n}`,
`async function endPhaseAction(){\n const s=phase();if(!state.readyToAdvance||state.phaseDone)return;\n state.phaseDone=true;state.locked=true;$('phaseEndBtn').classList.remove('show');stopPrimordialDrift();cancelParticleDrag();stopAccretionFeed();stopCosmicRaySystem();stopNeutronSystem();\n let played=false;try{played=await window.ARDUA_RECIPE_AUDIO_SYNC?.victorySong?.()}catch(_e){}if(!played){adaptiveAudioResolve('completion');await wait(620)}if(phase()!==s)return;\n if(isPrimordial(s))return advancePrimordial();if(s.endEvent==='plasmaTransition')return advanceStellarAtomicPhase();if(s.endEvent==='stellarBirth')return stellarFormationAdvance();if(s.endEvent==='finale')return finishCampaign();if(s.endEvent==='postTransition')return compactAdvance();return scatterStage()\n}`);

replaceOnce('assets/js/recipe-audio-sync.js',
`let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0;`,
`let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0,combinationOctave=0;`);

replaceOnce('assets/js/recipe-audio-sync.js',
`function resetMotif({stop=true}={}){motif=null;if(stop)stopReplicaVoices()}\nfunction syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;if(motif?.step>=3)return;resetMotif()}}`,
`function resetMotif({stop=true}={}){motif=null;if(stop)stopReplicaVoices()}\nfunction combinationRoot(){return rootForCurrentFormula()*(2**Math.max(0,Number(combinationOctave)||0))}\nfunction syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;combinationOctave=0;if(motif?.step>=3)return;resetMotif()}}`);

replaceOnce('assets/js/recipe-audio-sync.js',
`function engineChord(){syncPhase();engineCueSerial++;if(!motif)return;emitThirdForHighlight(currentStage());if(motif.step!==3||motif.done)return;motif.step=4;motif.done=true;playChord(motif.root,motif.ratios)}`,
`function engineChord(){syncPhase();engineCueSerial++;if(!motif)return;emitThirdForHighlight(currentStage());if(motif.step!==3||motif.done)return;motif.step=4;motif.done=true;playChord(motif.root,motif.ratios);combinationOctave++}`);

const oldVictory=`function victorySting(){\n syncPhase();\n const root=Number(motif?.root)||rootForCurrentFormula(),ratios=motif?.ratios||ratiosForProduct(),notes=ratios.map(r=>root*r);\n const arp=(f,delay,strong=false)=>{const d=strong?.28:.22;nativeTone(f,d,'triangle',RECIPE_NOTE_MAIN_GAIN,delay);nativeTone(f*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN,delay)};\n arp(notes[0],0);arp(notes[1],.12);arp(notes[2],.24,true);\n for(const f of notes){nativeTone(f,.62,'triangle',RECIPE_CHORD_MAIN_GAIN,.46);nativeTone(f*2,.48,'sine',RECIPE_CHORD_HARM_GAIN,.46)}\n nativeTone(root*2,.64,'triangle',RECIPE_FINAL_GAIN,.52);\n return true;\n}\nwindow.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySting,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair]}:null});`;
const newVictory=`async function victorySong(){\n syncPhase();if(!audio())return false;stopReplicaVoices();\n const root=rootForCurrentFormula(),ratios=ratiosForProduct(),notes=ratios.map(r=>root*r),noteGap=.34,phraseGap=.48,phraseSpan=noteGap*2+phraseGap;\n for(let octave=0;octave<3;octave++){const start=octave*phraseSpan,mult=2**octave;for(let i=0;i<notes.length;i++){const delay=start+i*noteGap,last=octave===2&&i===2,d=last?.62:(i===2?.36:.28),f=notes[i]*mult;nativeTone(f,d,'triangle',RECIPE_NOTE_MAIN_GAIN,delay);nativeTone(f*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN,delay)}}\n await new Promise(resolve=>setTimeout(resolve,3640));return true;\n}\nwindow.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySong,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair],combinationOctave}:null});`;
replaceOnce('assets/js/recipe-audio-sync.js',oldVictory,newVictory);

replaceOnce('assets/js/recipe-audio-sync.js',
`if(slot>=0&&nowSelected)markFirst(token,key,slot,rootForCurrentFormula());return`,
`if(slot>=0&&nowSelected)markFirst(token,key,slot,combinationRoot());return`);

const validatorPath='scripts/validate-recipe-audio-cadence.js';
let validator=fs.readFileSync(validatorPath,'utf8');
const oldChecks=`for(const token of [\"function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0)\",'ctx.currentTime+Math.max(0,Number(delay)||0)','function victorySting()','arp(notes[0],0);arp(notes[1],.12);arp(notes[2],.24,true)',\"RECIPE_CHORD_MAIN_GAIN,.46\",\"RECIPE_FINAL_GAIN,.52\",'engineChordFinal,victorySting'])if(!recipe.includes(token))throw new Error('Victory sting do motivo musical ausente: '+token);\nfor(const token of [\"$('phaseEndBtn').classList.add('show');const played=window.ARDUA_RECIPE_AUDIO_SYNC?.victorySting?.()\",\"if(!played)adaptiveAudioResolve('completion')\"])if(!engine.includes(token))throw new Error('Disparo da fanfarra no botão final ausente: '+token);\nconst completionReward=engine.match(/function phaseCompletionReward\\(s=phase\\(\\)\\)\\{[\\s\\S]*?\\n\\}/)?.[0]||'';if(completionReward.includes(\"adaptiveAudioResolve('completion')\"))throw new Error('Som genérico ainda dispara antes do botão final');\n`;
const newChecks=`for(const token of [\"function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0)\",'ctx.currentTime+Math.max(0,Number(delay)||0)','let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0,combinationOctave=0','function combinationRoot()','playChord(motif.root,motif.ratios);combinationOctave++','async function victorySong()','noteGap=.34,phraseGap=.48','for(let octave=0;octave<3;octave++)','mult=2**octave','setTimeout(resolve,3640)','engineChordFinal,victorySong'])if(!recipe.includes(token))throw new Error('Progressão por oitavas / música de vitória ausente: '+token);\nfor(const token of ['objectiveMotifCombinationOctave:0','root=baseRoot*(2**octave)','state.objectiveMotifCombinationOctave=Math.max(0,Number(state.objectiveMotifCombinationOctave)||0)+1','state.objectiveMotifCombinationOctave=0',\"setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720)\",'async function endPhaseAction()',\"await window.ARDUA_RECIPE_AUDIO_SYNC?.victorySong?.()\"])if(!engine.includes(token))throw new Error('Contrato de oitava/botão final ausente: '+token);\nif(recipe.includes('function victorySting()')||engine.includes('victorySting?.()'))throw new Error('Regressão: sting rápido antigo ainda está presente');\nconst completionReward=engine.match(/function phaseCompletionReward\\(s=phase\\(\\)\\)\\{[\\s\\S]*?\\n\\}/)?.[0]||'';if(completionReward.includes(\"adaptiveAudioResolve('completion')\"))throw new Error('Som genérico não deve tocar quando o botão apenas aparece');\n`;
if(!validator.includes(oldChecks))throw new Error('old victory validator block missing');
validator=validator.replace(oldChecks,newChecks);
fs.writeFileSync(validatorPath,validator);

console.log('Octave progression and click-triggered victory song applied.');
