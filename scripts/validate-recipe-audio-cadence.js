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
for(const token of ['const RECIPE_MAX_GAIN=1', "nativeTone(freq,d,'triangle',RECIPE_MAX_GAIN)", "nativeTone(f,.52,'triangle',RECIPE_MAX_GAIN)", "nativeTone(root*2,.56,'triangle',RECIPE_MAX_GAIN)"])if(!recipe.includes(token))throw new Error('Volume máximo da réplica musical ausente: '+token);
for(const token of ['const OBJECTIVE_MOTIF_MAX_GAIN=1', "tone(f,d,'triangle',OBJECTIVE_MOTIF_MAX_GAIN)", "tone(f,.52,'triangle',OBJECTIVE_MOTIF_MAX_GAIN)"])if(!engine.includes(token))throw new Error('Volume máximo do fallback musical ausente: '+token);
if(!polish.includes('recipePeak:1'))throw new Error('Metadado de pico musical não está em 1.0');
console.log('Target recipe audio OK: 2x/2x cadence and native fallback when sync cannot route.');
