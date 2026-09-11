const fs=require('fs');
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

const motifNotes=engine.match(/function objectiveMotifNotes\(r\)\{[\s\S]*?\n\}/)?.[0]||'';
const motifChord=engine.match(/function objectiveMotifChord\(r,final=false\)\{[^\n]+\}/)?.[0]||'';
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
for(const file of fs.readdirSync(jsDir).filter(f=>f.endsWith('.js'))){const src=fs.readFileSync(path.join(jsDir,file),'utf8');if(/function playFrequency\(/.test(src)||/function objectiveMotifPlayNote\(/.test(src))owners.push(file)}
const expected=['ardua.js','campaign-quarks.js','recipe-audio-sync.js'];
if(JSON.stringify(owners.sort())!==JSON.stringify(expected.sort()))throw new Error('Implementações musicais paralelas não auditadas: '+owners.join(', '));

if(!engine.includes("bindReliableTap($('phaseEndBtn'),endPhaseAction)"))throw new Error('Botão final não usa tap confiável');
if(!css.includes('.center-action.stage-end{z-index:2147483647!important;pointer-events:auto!important;'))throw new Error('Botão final perdeu z-index absoluto');
const version='20260911-objective-safe-chain-1';
for(const asset of ['recipe-sound-profile.js','audio-polish.js','ardua.js','recipe-audio-sync.js','campaign-quarks.js'])if(!index.includes('assets/js/'+asset+'?v='+version))throw new Error('Cache-busting musical ausente: '+asset);
const profilePos=index.indexOf('recipe-sound-profile.js'),polishPos=index.indexOf('audio-polish.js'),enginePos=index.indexOf('ardua.js');
if(!(profilePos>=0&&profilePos<polishPos&&profilePos<enginePos))throw new Error('Perfil Quarks precisa carregar antes dos consumidores');

console.log('Quarks audio parity OK: every three-note/chord implementation uses one shared Quarks profile; standard combinations keep a fixed register; victory song remains separate.');
