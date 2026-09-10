import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

replaceOnce('assets/js/ardua.js',
  "$('phaseEndBtn').addEventListener('click',endPhaseAction);",
  "bindReliableTap($('phaseEndBtn'),endPhaseAction);");

replaceOnce('assets/js/recipe-audio-sync.js',
  "function audio(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx??=new Ctx();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}catch(_e){return null}}",
  "function audio(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx??=new Ctx();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}catch(_e){return null}}\nasync function ensureAudioReady(){const ctx=audio();if(!ctx)return null;if(ctx.state==='suspended'){try{await ctx.resume()}catch(_e){return null}}return ctx.state==='running'?ctx:null}");

replaceOnce('assets/js/recipe-audio-sync.js',
  " syncPhase();if(!audio())return false;stopReplicaVoices();",
  " syncPhase();const ctx=await ensureAudioReady();if(!ctx)return false;stopReplicaVoices();");

replaceOnce('assets/css/ardua.css',
  ".center-action.stage-end{font-size:12px;",
  ".center-action.stage-end{z-index:2147483647!important;pointer-events:auto!important;font-size:12px;");

const version='20260910-victory-click-1';
replaceOnce('index.html','<link rel="stylesheet" href="assets/css/ardua.css"/>',`<link rel="stylesheet" href="assets/css/ardua.css?v=${version}"/>`);
replaceOnce('index.html','<script src="assets/js/audio-polish.js"></script>',`<script src="assets/js/audio-polish.js?v=${version}"></script>`);
replaceOnce('index.html','<script src="assets/js/ardua.js"></script>',`<script src="assets/js/ardua.js?v=${version}"></script>`);
replaceOnce('index.html','<script src="assets/js/recipe-audio-sync.js"></script>',`<script src="assets/js/recipe-audio-sync.js?v=${version}"></script>`);

const validatorPath='scripts/validate-recipe-audio-cadence.js';
let validator=fs.readFileSync(validatorPath,'utf8');
replaceOnce(validatorPath,
  "const polish=fs.readFileSync('assets/js/audio-polish.js','utf8');",
  "const polish=fs.readFileSync('assets/js/audio-polish.js','utf8');\nconst css=fs.readFileSync('assets/css/ardua.css','utf8');\nconst index=fs.readFileSync('index.html','utf8');");
validator=fs.readFileSync(validatorPath,'utf8');
const marker="if(recipe.includes('function victorySting()')||engine.includes('victorySting?.()'))throw new Error('Regressão: sting rápido antigo ainda está presente');";
const insert=`${marker}\nfor(const token of ['async function ensureAudioReady()','const ctx=await ensureAudioReady();if(!ctx)return false'])if(!recipe.includes(token))throw new Error('Victory song não garante AudioContext ativo: '+token);\nif(!engine.includes("bindReliableTap($('phaseEndBtn'),endPhaseAction)"))throw new Error('Botão final não usa tap confiável');\nif(engine.includes("$('phaseEndBtn').addEventListener('click',endPhaseAction)"))throw new Error('Listener simples antigo do botão final voltou');\nif(!css.includes('.center-action.stage-end{z-index:2147483647!important;pointer-events:auto!important;'))throw new Error('Botão final não está no topo absoluto do tabuleiro');\nfor(const token of ['assets/css/ardua.css?v=20260910-victory-click-1','assets/js/audio-polish.js?v=20260910-victory-click-1','assets/js/ardua.js?v=20260910-victory-click-1','assets/js/recipe-audio-sync.js?v=20260910-victory-click-1'])if(!index.includes(token))throw new Error('Cache-busting coordenado ausente: '+token);`;
if(!validator.includes(marker))throw new Error('validator marker missing');
validator=validator.replace(marker,insert);
fs.writeFileSync(validatorPath,validator);

console.log('Victory click audio readiness, cache busting, and final-button z-index applied.');
