const fs=require('fs');
const recipe=fs.readFileSync('assets/js/recipe-audio-sync.js','utf8');
const polish=fs.readFileSync('assets/js/audio-polish.js','utf8');
const css=fs.readFileSync('assets/css/ardua.css','utf8');
const index=fs.readFileSync('index.html','utf8');

const required=[
  'const cadence=new Map([[105,210],[75,150],[28,56],[32,64],[285,570],[115,230],[70,140],[42,84]])',
  "cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'})",
  'third and the pause from the third note to the union/chord use the same 2x cadence'
];
for(const token of required){
  if(!recipe.includes(token))throw new Error(`Contrato de cadência alvo ausente: ${token}`);
}
for(const legacy of ['[285,855]','[115,345]','[70,210],[42,126]',"note3ToChord:'3x'"]){
  if(recipe.includes(legacy))throw new Error(`Regressão: intervalo 3ª nota → acorde voltou a ser mais longo (${legacy})`);
}
const routingRequired=[
  'function routeCue(kind,freq)',
  'if(!api)return false',
  "if(kind&&routed)booster.gain.value=0",
  "else booster.gain.value=GLOBAL_SFX_LIFT",
  "if(kind==='note3-main')",
  "if(kind==='chord-main')"
];
for(const token of routingRequired){
  if(!polish.includes(token))throw new Error(`Contrato de fallback de áudio ausente: ${token}`);
}
if(polish.includes("if(kind){booster.gain.value=0;routeCue(kind,freq)}")){
  throw new Error('Regressão: voz nativa não pode ser silenciada antes da confirmação do sincronizador');
}
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
for(const token of ['RECIPE_NOTE_MAIN_GAIN=.68','RECIPE_NOTE_HARM_GAIN=.22','RECIPE_CHORD_MAIN_GAIN=.18','RECIPE_CHORD_HARM_GAIN=.055','RECIPE_FINAL_GAIN=.14','RECIPE_MASTER_GAIN=1.05','RECIPE_LIMIT_THRESHOLD=-1.5','RECIPE_LIMIT_RATIO=20','RECIPE_OUTPUT_CEILING=.98','createDynamicsCompressor()','g.connect(recipeOutput(ctx))'])if(!recipe.includes(token))throw new Error('Master/limiter musical ausente: '+token);
for(const token of ['OBJECTIVE_MOTIF_NOTE_MAIN_GAIN=.68','OBJECTIVE_MOTIF_NOTE_HARM_GAIN=.22','OBJECTIVE_MOTIF_CHORD_MAIN_GAIN=.18','OBJECTIVE_MOTIF_CHORD_HARM_GAIN=.055','OBJECTIVE_MOTIF_FINAL_GAIN=.14'])if(!engine.includes(token))throw new Error('Fallback musical calibrado ausente: '+token);
for(const token of ["near(seed,.68)","near(seed,.22)","near(seed,.18)","near(seed,.055)","near(seed,.14)","else if(kind)booster.gain.value=1",'recipePeak:.98','recipeLimiter:true'])if(!polish.includes(token))throw new Error('Roteamento/limite musical ausente: '+token);
if(recipe.includes('RECIPE_MAX_GAIN=1')||engine.includes('OBJECTIVE_MOTIF_MAX_GAIN=1'))throw new Error('Regressão: ganho bruto 1.0 por voz voltou ao motivo musical');
for(const token of ["function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0)",'ctx.currentTime+Math.max(0,Number(delay)||0)','let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0,combinationOctave=0','function combinationRoot()','playChord(motif.root,motif.ratios);combinationOctave++','async function victorySong()','noteGap=.34,phraseGap=.48','for(let octave=0;octave<3;octave++)','mult=2**octave','setTimeout(resolve,3640)','engineChordFinal,victorySong'])if(!recipe.includes(token))throw new Error('Progressão por oitavas / música de vitória ausente: '+token);
for(const token of ['objectiveMotifCombinationOctave:0','root=baseRoot*(2**octave)','state.objectiveMotifCombinationOctave=Math.max(0,Number(state.objectiveMotifCombinationOctave)||0)+1','state.objectiveMotifCombinationOctave=0',"setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720)",'async function endPhaseAction()',"await window.ARDUA_RECIPE_AUDIO_SYNC?.victorySong?.()"])if(!engine.includes(token))throw new Error('Contrato de oitava/botão final ausente: '+token);
if(recipe.includes('function victorySting()')||engine.includes('victorySting?.()'))throw new Error('Regressão: sting rápido antigo ainda está presente');
for(const token of ['async function ensureAudioReady()','const ctx=await ensureAudioReady();if(!ctx)return false'])if(!recipe.includes(token))throw new Error('Victory song não garante AudioContext ativo: '+token);
if(!engine.includes("bindReliableTap($('phaseEndBtn'),endPhaseAction)"))throw new Error('Botão final não usa tap confiável');
if(engine.includes("$('phaseEndBtn').addEventListener('click',endPhaseAction)"))throw new Error('Listener simples antigo do botão final voltou');
if(!css.includes('.center-action.stage-end{z-index:2147483647!important;pointer-events:auto!important;'))throw new Error('Botão final não está no topo absoluto do tabuleiro');
for(const token of ['assets/css/ardua.css?v=20260910-victory-click-1','assets/js/audio-polish.js?v=20260910-victory-click-1','assets/js/ardua.js?v=20260910-victory-click-1','assets/js/recipe-audio-sync.js?v=20260910-victory-click-1'])if(!index.includes(token))throw new Error('Cache-busting coordenado ausente: '+token);
const completionReward=engine.match(/function phaseCompletionReward\(s=phase\(\)\)\{[\s\S]*?\n\}/)?.[0]||'';if(completionReward.includes("adaptiveAudioResolve('completion')"))throw new Error('Som genérico não deve tocar quando o botão apenas aparece');
console.log('Target recipe audio OK: 2x/2x cadence and native fallback when sync cannot route.');
