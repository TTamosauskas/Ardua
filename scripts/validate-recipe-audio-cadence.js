const fs=require('fs');
const recipe=fs.readFileSync('assets/js/recipe-audio-sync.js','utf8');
const polish=fs.readFileSync('assets/js/audio-polish.js','utf8');

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
console.log('Target recipe audio OK: 2x/2x cadence and native fallback when sync cannot route.');
