import fs from 'node:fs';

function replaceOnce(path,from,to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one exact anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}
function replaceRegexOnce(path,re,to){
  const src=fs.readFileSync(path,'utf8');
  const matches=[...src.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];
  if(matches.length!==1)throw new Error(`${path}: expected one regex anchor, found ${matches.length} for ${re}`);
  fs.writeFileSync(path,src.replace(re,to));
}

const profile=`/* Ardua — canonical recipe sound profile. Quarks is the reference voice. */
(()=>{
'use strict';
window.ARDUA_RECIPE_SOUND_PROFILE=Object.freeze({
 version:'quarks-v1',
 noteMainGain:.074,
 noteStrongGain:.086,
 harmonicRatio:.30,
 chordMainGain:.040,
 chordHarmGain:.014,
 finalAccentGain:.022,
 noteDuration:.24,
 strongDuration:.28,
 harmonicDurationRatio:.82,
 chordDuration:.52,
 chordHarmDuration:.42,
 finalAccentDuration:.56
});
})();
`;
fs.writeFileSync('assets/js/recipe-sound-profile.js',profile);

// Quarks remains the audible reference, now reading the shared canonical profile.
replaceOnce('assets/js/campaign-quarks.js',
  "const $=id=>document.getElementById(id),SAVE_KEY='stellarForgeV1013';\nconst C=window.ARDUA_CAMPAIGN;if(!C)return;",
  "const $=id=>document.getElementById(id),SAVE_KEY='stellarForgeV1013';\nconst AUDIO_PROFILE=window.ARDUA_RECIPE_SOUND_PROFILE||Object.freeze({noteMainGain:.074,noteStrongGain:.086,harmonicRatio:.30,chordMainGain:.040,chordHarmGain:.014,finalAccentGain:.022,noteDuration:.24,strongDuration:.28,harmonicDurationRatio:.82,chordDuration:.52,chordHarmDuration:.42,finalAccentDuration:.56});\nconst C=window.ARDUA_CAMPAIGN;if(!C)return;");
replaceOnce('assets/js/campaign-quarks.js',
  "function playFrequency(freq,strong=false){const d=strong?.28:.24,g=strong?.086:.074;tone(freq,d,'triangle',g);tone(freq*2,d*.82,'sine',g*.30)}\nfunction playChord(root){for(const ratio of [1,1.25,1.5]){const f=root*ratio;tone(f,.52,'triangle',.040);tone(f*2,.42,'sine',.014)}}\nfunction playFinalAccent(root){tone(root*2,.56,'triangle',.022)}",
  "function playFrequency(freq,strong=false){const d=strong?AUDIO_PROFILE.strongDuration:AUDIO_PROFILE.noteDuration,g=strong?AUDIO_PROFILE.noteStrongGain:AUDIO_PROFILE.noteMainGain;tone(freq,d,'triangle',g);tone(freq*2,d*AUDIO_PROFILE.harmonicDurationRatio,'sine',g*AUDIO_PROFILE.harmonicRatio)}\nfunction playChord(root){for(const ratio of [1,1.25,1.5]){const f=root*ratio;tone(f,AUDIO_PROFILE.chordDuration,'triangle',AUDIO_PROFILE.chordMainGain);tone(f*2,AUDIO_PROFILE.chordHarmDuration,'sine',AUDIO_PROFILE.chordHarmGain)}}\nfunction playFinalAccent(root){tone(root*2,AUDIO_PROFILE.finalAccentDuration,'triangle',AUDIO_PROFILE.finalAccentGain)}");

// Standard recipe audio: exact Quarks envelope/gains, direct output, no compressor/limiter.
replaceOnce('assets/js/recipe-audio-sync.js',
  "const SELECTOR='.atom,.primordial-particle,.cosmic-ray,.neutron';\nconst ROOTS=[196,220,247,262,294,330];",
  "const SELECTOR='.atom,.primordial-particle,.cosmic-ray,.neutron';\nconst ROOTS=[196,220,247,262,294,330];\nconst AUDIO_PROFILE=window.ARDUA_RECIPE_SOUND_PROFILE||Object.freeze({noteMainGain:.074,noteStrongGain:.086,harmonicRatio:.30,chordMainGain:.040,chordHarmGain:.014,finalAccentGain:.022,noteDuration:.24,strongDuration:.28,harmonicDurationRatio:.82,chordDuration:.52,chordHarmDuration:.42,finalAccentDuration:.56});");
replaceRegexOnce('assets/js/recipe-audio-sync.js',
  /let audioCtx=null,recipeBus=null;const replicaVoices=new Set\(\);\nconst RECIPE_NOTE_MAIN_GAIN=\.68,RECIPE_NOTE_HARM_GAIN=\.22,RECIPE_CHORD_MAIN_GAIN=\.18,RECIPE_CHORD_HARM_GAIN=\.055,RECIPE_FINAL_GAIN=\.14;\nconst RECIPE_MASTER_GAIN=1\.05,RECIPE_LIMIT_THRESHOLD=-1\.5,RECIPE_LIMIT_RATIO=20,RECIPE_LIMIT_ATTACK=\.002,RECIPE_LIMIT_RELEASE=\.12,RECIPE_OUTPUT_CEILING=\.98;/,
  "let audioCtx=null;const replicaVoices=new Set();");
replaceRegexOnce('assets/js/recipe-audio-sync.js',
  /function recipeOutput\(ctx\)\{[\s\S]*?\n\}\nfunction nativeTone/,
  'function nativeTone');
replaceOnce('assets/js/recipe-audio-sync.js','g.connect(recipeOutput(ctx))','g.connect(ctx.destination)');
replaceOnce('assets/js/recipe-audio-sync.js',
  "function playFrequency(freq,strong=false){const d=strong?.28:.24;nativeTone(freq,d,'triangle',RECIPE_NOTE_MAIN_GAIN);nativeTone(freq*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN)}\nfunction playNote(index,root,ratios=ratiosForProduct()){playFrequency(root*ratios[Math.max(0,Math.min(2,index))],index===2)}\nfunction playChord(root,ratios=ratiosForProduct()){for(const ratio of ratios){const f=root*ratio;nativeTone(f,.52,'triangle',RECIPE_CHORD_MAIN_GAIN);nativeTone(f*2,.42,'sine',RECIPE_CHORD_HARM_GAIN)}}\nfunction playFinalAccent(root){nativeTone(root*2,.56,'triangle',RECIPE_FINAL_GAIN)}",
  "function playFrequency(freq,strong=false){const d=strong?AUDIO_PROFILE.strongDuration:AUDIO_PROFILE.noteDuration,g=strong?AUDIO_PROFILE.noteStrongGain:AUDIO_PROFILE.noteMainGain;nativeTone(freq,d,'triangle',g);nativeTone(freq*2,d*AUDIO_PROFILE.harmonicDurationRatio,'sine',g*AUDIO_PROFILE.harmonicRatio)}\nfunction playNote(index,root,ratios=ratiosForProduct()){playFrequency(root*ratios[Math.max(0,Math.min(2,index))],index===2)}\nfunction playChord(root,ratios=ratiosForProduct()){for(const ratio of ratios){const f=root*ratio;nativeTone(f,AUDIO_PROFILE.chordDuration,'triangle',AUDIO_PROFILE.chordMainGain);nativeTone(f*2,AUDIO_PROFILE.chordHarmDuration,'sine',AUDIO_PROFILE.chordHarmGain)}}\nfunction playFinalAccent(root){nativeTone(root*2,AUDIO_PROFILE.finalAccentDuration,'triangle',AUDIO_PROFILE.finalAccentGain)}");
replaceOnce('assets/js/recipe-audio-sync.js',
  'let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0,combinationOctave=0;',
  'let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0;');
replaceOnce('assets/js/recipe-audio-sync.js',
  'function combinationRoot(){return rootForCurrentFormula()*(2**Math.max(0,Number(combinationOctave)||0))}',
  'function combinationRoot(){return rootForCurrentFormula()}');
replaceOnce('assets/js/recipe-audio-sync.js',
  'function syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;combinationOctave=0;if(motif?.step>=3)return;resetMotif()}}',
  'function syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;if(motif?.step>=3)return;resetMotif()}}');
replaceOnce('assets/js/recipe-audio-sync.js',
  'function engineChord(){syncPhase();engineCueSerial++;if(!motif)return;emitThirdForHighlight(currentStage());if(motif.step!==3||motif.done)return;motif.step=4;motif.done=true;playChord(motif.root,motif.ratios);combinationOctave++}',
  'function engineChord(){syncPhase();engineCueSerial++;if(!motif)return;emitThirdForHighlight(currentStage());if(motif.step!==3||motif.done)return;motif.step=4;motif.done=true;playChord(motif.root,motif.ratios)}');
replaceOnce('assets/js/recipe-audio-sync.js',
  "for(let octave=0;octave<3;octave++){const start=octave*phraseSpan,mult=2**octave;for(let i=0;i<notes.length;i++){const delay=start+i*noteGap,last=octave===2&&i===2,d=last?.62:(i===2?.36:.28),f=notes[i]*mult;nativeTone(f,d,'triangle',RECIPE_NOTE_MAIN_GAIN,delay);nativeTone(f*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN,delay)}}",
  "for(let octave=0;octave<3;octave++){const start=octave*phraseSpan,mult=2**octave;for(let i=0;i<notes.length;i++){const delay=start+i*noteGap,last=octave===2&&i===2,strong=i===2,d=last?.62:(strong?.36:AUDIO_PROFILE.noteDuration),g=strong?AUDIO_PROFILE.noteStrongGain:AUDIO_PROFILE.noteMainGain,f=notes[i]*mult;nativeTone(f,d,'triangle',g,delay);nativeTone(f*2,d*AUDIO_PROFILE.harmonicDurationRatio,'sine',g*AUDIO_PROFILE.harmonicRatio,delay)}}");
replaceOnce('assets/js/recipe-audio-sync.js',
  "window.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySong,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair],combinationOctave}:null});",
  "window.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySong,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair]}:null});");

// Engine fallback uses the exact same shared profile and a fixed per-recipe register.
replaceRegexOnce('assets/js/ardua.js',
  /function objectiveMotifNotes\(r\)\{\n const baseRoot=OBJECTIVE_MOTIF_ROOTS\[objectiveMotifHash\(recipeKey\(r\)\)%OBJECTIVE_MOTIF_ROOTS\.length\],octave=Math\.max\(0,Number\(state\.objectiveMotifCombinationOctave\)\|\|0\),root=baseRoot\*\(2\*\*octave\),unstable=!!E\[r\?\.out\]\?\.unstable;\n return unstable\?\[root,root\*\(4\/3\),root\*1\.5\]:\[root,root\*1\.25,root\*1\.5\];\n\}\nconst OBJECTIVE_MOTIF_NOTE_MAIN_GAIN=\.68,OBJECTIVE_MOTIF_NOTE_HARM_GAIN=\.22,OBJECTIVE_MOTIF_CHORD_MAIN_GAIN=\.18,OBJECTIVE_MOTIF_CHORD_HARM_GAIN=\.055,OBJECTIVE_MOTIF_FINAL_GAIN=\.14;\nfunction objectiveMotifPlayNote\(r,index\)\{const notes=objectiveMotifNotes\(r\),f=notes\[Math\.max\(0,Math\.min\(2,index\)\)\],d=index===2\?\.28:\.24;tone\(f,d,'triangle',OBJECTIVE_MOTIF_NOTE_MAIN_GAIN\);tone\(f\*2,d\*\.82,'sine',OBJECTIVE_MOTIF_NOTE_HARM_GAIN\)\}\nfunction objectiveMotifChord\(r,final=false\)\{const notes=objectiveMotifNotes\(r\);for\(const f of notes\)\{tone\(f,\.52,'triangle',OBJECTIVE_MOTIF_CHORD_MAIN_GAIN\);tone\(f\*2,\.42,'sine',OBJECTIVE_MOTIF_CHORD_HARM_GAIN\)\}if\(final\)tone\(notes\[0\]\*2,\.56,'triangle',OBJECTIVE_MOTIF_FINAL_GAIN\);state\.objectiveMotifCombinationOctave=Math\.max\(0,Number\(state\.objectiveMotifCombinationOctave\)\|\|0\)\+1\}/,
  "function objectiveMotifNotes(r){\n const root=OBJECTIVE_MOTIF_ROOTS[objectiveMotifHash(recipeKey(r))%OBJECTIVE_MOTIF_ROOTS.length],unstable=!!E[r?.out]?.unstable;\n return unstable?[root,root*(4/3),root*1.5]:[root,root*1.25,root*1.5];\n}\nconst OBJECTIVE_MOTIF_AUDIO=window.ARDUA_RECIPE_SOUND_PROFILE||Object.freeze({noteMainGain:.074,noteStrongGain:.086,harmonicRatio:.30,chordMainGain:.040,chordHarmGain:.014,finalAccentGain:.022,noteDuration:.24,strongDuration:.28,harmonicDurationRatio:.82,chordDuration:.52,chordHarmDuration:.42,finalAccentDuration:.56});\nfunction objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))],strong=index===2,d=strong?OBJECTIVE_MOTIF_AUDIO.strongDuration:OBJECTIVE_MOTIF_AUDIO.noteDuration,g=strong?OBJECTIVE_MOTIF_AUDIO.noteStrongGain:OBJECTIVE_MOTIF_AUDIO.noteMainGain;tone(f,d,'triangle',g);tone(f*2,d*OBJECTIVE_MOTIF_AUDIO.harmonicDurationRatio,'sine',g*OBJECTIVE_MOTIF_AUDIO.harmonicRatio)}\nfunction objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,OBJECTIVE_MOTIF_AUDIO.chordDuration,'triangle',OBJECTIVE_MOTIF_AUDIO.chordMainGain);tone(f*2,OBJECTIVE_MOTIF_AUDIO.chordHarmDuration,'sine',OBJECTIVE_MOTIF_AUDIO.chordHarmGain)}if(final)tone(notes[0]*2,OBJECTIVE_MOTIF_AUDIO.finalAccentDuration,'triangle',OBJECTIVE_MOTIF_AUDIO.finalAccentGain)}");

// Router recognizes exactly the shared Quarks gains and never boosts recipe voices.
replaceOnce('assets/js/audio-polish.js',
  'const GLOBAL_SFX_LIFT=1.22;\nconst near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;',
  "const GLOBAL_SFX_LIFT=1.22;\nconst AUDIO_PROFILE=window.ARDUA_RECIPE_SOUND_PROFILE||Object.freeze({noteMainGain:.074,noteStrongGain:.086,harmonicRatio:.30,chordMainGain:.040,chordHarmGain:.014,finalAccentGain:.022});\nconst near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;");
replaceRegexOnce('assets/js/audio-polish.js',
  /function classifyRecipeVoice\(type,seed\)\{[\s\S]*? return'';\n\}/,
  "function classifyRecipeVoice(type,seed){\n if(type==='triangle'&&near(seed,AUDIO_PROFILE.noteMainGain))return'note12-main';\n if(type==='sine'&&near(seed,AUDIO_PROFILE.noteMainGain*AUDIO_PROFILE.harmonicRatio))return'note12-harm';\n if(type==='triangle'&&near(seed,AUDIO_PROFILE.noteStrongGain))return'note3-main';\n if(type==='sine'&&near(seed,AUDIO_PROFILE.noteStrongGain*AUDIO_PROFILE.harmonicRatio))return'note3-harm';\n if(type==='triangle'&&near(seed,AUDIO_PROFILE.chordMainGain))return'chord-main';\n if(type==='sine'&&near(seed,AUDIO_PROFILE.chordHarmGain))return'chord-harm';\n if(type==='triangle'&&near(seed,AUDIO_PROFILE.finalAccentGain))return'chord-final';\n return'';\n}");
replaceOnce('assets/js/audio-polish.js',
  "window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1.05,recipePeak:.98,recipeLimiter:true,recipeOwner:'recipe-audio-sync',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});",
  "window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:null,recipeLimiter:false,recipeOwner:'recipe-audio-sync',recipeReference:'quarks-v1',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});");

// Coordinated cache-busting so every browser receives the same sound profile and consumers.
const version='20260910-quarks-audio-1';
replaceOnce('index.html',
  '<script src="assets/js/music.js"></script>\n<script src="assets/js/audio-polish.js?v=20260910-victory-click-1"></script>',
  `<script src="assets/js/music.js"></script>\n<script src="assets/js/recipe-sound-profile.js?v=${version}"></script>\n<script src="assets/js/audio-polish.js?v=${version}"></script>`);
replaceOnce('index.html','<script src="assets/js/ardua.js?v=20260910-victory-click-1"></script>',`<script src="assets/js/ardua.js?v=${version}"></script>`);
replaceOnce('index.html','<script src="assets/js/recipe-audio-sync.js?v=20260910-victory-click-1"></script>',`<script src="assets/js/recipe-audio-sync.js?v=${version}"></script>`);
replaceOnce('index.html','<script src="assets/js/campaign-quarks.js"></script>',`<script src="assets/js/campaign-quarks.js?v=${version}"></script>`);

const validator=`const fs=require('fs');
const path=require('path');
const recipe=fs.readFileSync('assets/js/recipe-audio-sync.js','utf8');
const polish=fs.readFileSync('assets/js/audio-polish.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const quarks=fs.readFileSync('assets/js/campaign-quarks.js','utf8');
const profile=fs.readFileSync('assets/js/recipe-sound-profile.js','utf8');
const css=fs.readFileSync('assets/css/ardua.css','utf8');
const index=fs.readFileSync('index.html','utf8');

const cadenceRequired=[
  'const cadence=new Map([[105,210],[75,150],[28,56],[32,64],[285,570],[115,230],[70,140],[42,84]])',
  "cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'})",
  'third and the pause from the third note to the union/chord use the same 2x cadence'
];
for(const token of cadenceRequired)if(!recipe.includes(token))throw new Error('Contrato de cadência ausente: '+token);
for(const legacy of ['[285,855]','[115,345]','[70,210],[42,126]',"note3ToChord:'3x'"])if(recipe.includes(legacy))throw new Error('Cadência 3x antiga voltou: '+legacy);

const profileRequired=["version:'quarks-v1'",'noteMainGain:.074','noteStrongGain:.086','harmonicRatio:.30','chordMainGain:.040','chordHarmGain:.014','finalAccentGain:.022','noteDuration:.24','strongDuration:.28','harmonicDurationRatio:.82','chordDuration:.52','chordHarmDuration:.42','finalAccentDuration:.56'];
for(const token of profileRequired)if(!profile.includes(token))throw new Error('Perfil canônico de Quarks incompleto: '+token);
for(const [name,src] of [['engine',engine],['sync',recipe],['quarks',quarks],['router',polish]])if(!src.includes('window.ARDUA_RECIPE_SOUND_PROFILE'))throw new Error(name+' não usa o perfil musical canônico de Quarks');

for(const token of ['AUDIO_PROFILE.noteMainGain','AUDIO_PROFILE.noteStrongGain','AUDIO_PROFILE.harmonicRatio','AUDIO_PROFILE.chordMainGain','AUDIO_PROFILE.chordHarmGain','AUDIO_PROFILE.finalAccentGain'])if(!quarks.includes(token)||!recipe.includes(token))throw new Error('Quarks/sync sem paridade de perfil: '+token);
for(const token of ['OBJECTIVE_MOTIF_AUDIO.noteMainGain','OBJECTIVE_MOTIF_AUDIO.noteStrongGain','OBJECTIVE_MOTIF_AUDIO.harmonicRatio','OBJECTIVE_MOTIF_AUDIO.chordMainGain','OBJECTIVE_MOTIF_AUDIO.chordHarmGain','OBJECTIVE_MOTIF_AUDIO.finalAccentGain'])if(!engine.includes(token))throw new Error('Fallback do engine sem perfil Quarks: '+token);

const motifNotes=engine.match(/function objectiveMotifNotes\\(r\\)\\{[\\s\\S]*?\\n\\}/)?.[0]||'';
const motifChord=engine.match(/function objectiveMotifChord\\(r,final=false\\)\\{[^\\n]+\\}/)?.[0]||'';
if(!motifNotes||motifNotes.includes('objectiveMotifCombinationOctave')||motifNotes.includes('2**'))throw new Error('Fases normais ainda elevam oitava entre combinações');
if(motifChord.includes('objectiveMotifCombinationOctave')||motifChord.includes('+1'))throw new Error('Acorde ainda incrementa oitava entre combinações');
if(!recipe.includes('function combinationRoot(){return rootForCurrentFormula()}'))throw new Error('Sync ainda altera o registro entre combinações');
for(const legacy of ['combinationOctave++','rootForCurrentFormula()*(2**','RECIPE_NOTE_MAIN_GAIN=.68','RECIPE_NOTE_HARM_GAIN=.22','RECIPE_CHORD_MAIN_GAIN=.18','RECIPE_CHORD_HARM_GAIN=.055','RECIPE_FINAL_GAIN=.14','RECIPE_MASTER_GAIN=1.05','createDynamicsCompressor()','recipeOutput(ctx)'])if(recipe.includes(legacy))throw new Error('Áudio pós-Quarks antigo ainda presente: '+legacy);
if(!recipe.includes('g.connect(ctx.destination)'))throw new Error('Voz sincronizada não usa saída direta como Quarks');
for(const legacy of ['OBJECTIVE_MOTIF_NOTE_MAIN_GAIN=.68','OBJECTIVE_MOTIF_NOTE_HARM_GAIN=.22','OBJECTIVE_MOTIF_CHORD_MAIN_GAIN=.18','OBJECTIVE_MOTIF_CHORD_HARM_GAIN=.055','OBJECTIVE_MOTIF_FINAL_GAIN=.14'])if(engine.includes(legacy))throw new Error('Fallback antigo do engine ainda presente: '+legacy);

for(const token of ["if(kind==='note3-main')","if(kind==='chord-main')","recipeMotifLift:1","recipePeak:null","recipeLimiter:false","recipeReference:'quarks-v1'",'AUDIO_PROFILE.noteStrongGain','AUDIO_PROFILE.chordMainGain'])if(!polish.includes(token))throw new Error('Roteamento Quarks ausente: '+token);
if(!polish.includes("if(kind&&routed)booster.gain.value=0")||!polish.includes('else if(kind)booster.gain.value=1'))throw new Error('Fallback musical deve ficar sem booster, exatamente como Quarks');

// A música de vitória continua sendo o efeito separado solicitado: três frases em oitavas ascendentes, mas com o mesmo timbre/dinâmica de Quarks.
for(const token of ['async function victorySong()','for(let octave=0;octave<3;octave++)','mult=2**octave','AUDIO_PROFILE.noteStrongGain','AUDIO_PROFILE.noteMainGain','AUDIO_PROFILE.harmonicRatio','setTimeout(resolve,3640)'])if(!recipe.includes(token))throw new Error('Música de vitória perdeu contrato: '+token);
for(const token of ['async function ensureAudioReady()','const ctx=await ensureAudioReady();if(!ctx)return false'])if(!recipe.includes(token))throw new Error('Victory song não garante AudioContext ativo: '+token);

// Audit all JS owners of the three-note/chord recipe motif. Any new parallel implementation fails CI until it adopts the shared profile.
const jsDir='assets/js';
const owners=[];
for(const file of fs.readdirSync(jsDir).filter(f=>f.endsWith('.js'))){const src=fs.readFileSync(path.join(jsDir,file),'utf8');if(/function playFrequency\\(/.test(src)||/function objectiveMotifPlayNote\\(/.test(src))owners.push(file)}
const expected=['ardua.js','campaign-quarks.js','recipe-audio-sync.js'];
if(JSON.stringify(owners.sort())!==JSON.stringify(expected.sort()))throw new Error('Implementações musicais paralelas não auditadas: '+owners.join(', '));

if(!engine.includes("bindReliableTap($('phaseEndBtn'),endPhaseAction)"))throw new Error('Botão final não usa tap confiável');
if(!css.includes('.center-action.stage-end{z-index:2147483647!important;pointer-events:auto!important;'))throw new Error('Botão final perdeu z-index absoluto');
const version='20260910-quarks-audio-1';
for(const asset of ['recipe-sound-profile.js','audio-polish.js','ardua.js','recipe-audio-sync.js','campaign-quarks.js'])if(!index.includes('assets/js/'+asset+'?v='+version))throw new Error('Cache-busting musical ausente: '+asset);
const profilePos=index.indexOf('recipe-sound-profile.js'),polishPos=index.indexOf('audio-polish.js'),enginePos=index.indexOf('ardua.js');
if(!(profilePos>=0&&profilePos<polishPos&&profilePos<enginePos))throw new Error('Perfil Quarks precisa carregar antes dos consumidores');

console.log('Quarks audio parity OK: every three-note/chord implementation uses one shared Quarks profile; standard combinations keep a fixed register; victory song remains separate.');
`;
fs.writeFileSync('scripts/validate-recipe-audio-cadence.js',validator);

console.log('Applied canonical Quarks audio profile to Quarks, engine fallback, sync voice, router, and victory timbre.');
