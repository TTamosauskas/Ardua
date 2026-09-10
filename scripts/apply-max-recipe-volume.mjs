import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

replaceOnce('assets/js/recipe-audio-sync.js',
`function playFrequency(freq,strong=false){const d=strong?.28:.24,g=strong?.086:.074;nativeTone(freq,d,'triangle',g);nativeTone(freq*2,d*.82,'sine',g*.30)}\nfunction playNote(index,root,ratios=ratiosForProduct()){playFrequency(root*ratios[Math.max(0,Math.min(2,index))],index===2)}\nfunction playChord(root,ratios=ratiosForProduct()){for(const ratio of ratios){const f=root*ratio;nativeTone(f,.52,'triangle',.040);nativeTone(f*2,.42,'sine',.014)}}\nfunction playFinalAccent(root){nativeTone(root*2,.56,'triangle',.022)}`,
`const RECIPE_MAX_GAIN=1;\nfunction playFrequency(freq,strong=false){const d=strong?.28:.24;nativeTone(freq,d,'triangle',RECIPE_MAX_GAIN);nativeTone(freq*2,d*.82,'sine',RECIPE_MAX_GAIN)}\nfunction playNote(index,root,ratios=ratiosForProduct()){playFrequency(root*ratios[Math.max(0,Math.min(2,index))],index===2)}\nfunction playChord(root,ratios=ratiosForProduct()){for(const ratio of ratios){const f=root*ratio;nativeTone(f,.52,'triangle',RECIPE_MAX_GAIN);nativeTone(f*2,.42,'sine',RECIPE_MAX_GAIN)}}\nfunction playFinalAccent(root){nativeTone(root*2,.56,'triangle',RECIPE_MAX_GAIN)}`);

replaceOnce('assets/js/ardua.js',
`function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))],d=index===2?.28:.24,g=index===2?.086:.074;tone(f,d,'triangle',g);tone(f*2,d*.82,'sine',g*.30)}\nfunction objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',.040);tone(f*2,.42,'sine',.014)}if(final)tone(notes[0]*2,.56,'triangle',.022)}`,
`const OBJECTIVE_MOTIF_MAX_GAIN=1;\nfunction objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))],d=index===2?.28:.24;tone(f,d,'triangle',OBJECTIVE_MOTIF_MAX_GAIN);tone(f*2,d*.82,'sine',OBJECTIVE_MOTIF_MAX_GAIN)}\nfunction objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',OBJECTIVE_MOTIF_MAX_GAIN);tone(f*2,.42,'sine',OBJECTIVE_MOTIF_MAX_GAIN)}if(final)tone(notes[0]*2,.56,'triangle',OBJECTIVE_MOTIF_MAX_GAIN)}`);

replaceOnce('assets/js/audio-polish.js',
`window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:.99,recipeOwner:'recipe-audio-sync',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});`,
`window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:1,recipeOwner:'recipe-audio-sync',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});`);

const validatorPath='scripts/validate-recipe-audio-cadence.js';
let validator=fs.readFileSync(validatorPath,'utf8');
const marker="console.log('Target recipe audio OK: 2x/2x cadence and native fallback when sync cannot route.');";
if(!validator.includes(marker))throw new Error('validator anchor missing');
const checks=`const engine=fs.readFileSync('assets/js/ardua.js','utf8');\nfor(const token of ['const RECIPE_MAX_GAIN=1', \"nativeTone(freq,d,'triangle',RECIPE_MAX_GAIN)\", \"nativeTone(f,.52,'triangle',RECIPE_MAX_GAIN)\", \"nativeTone(root*2,.56,'triangle',RECIPE_MAX_GAIN)\"])if(!recipe.includes(token))throw new Error('Volume máximo da réplica musical ausente: '+token);\nfor(const token of ['const OBJECTIVE_MOTIF_MAX_GAIN=1', \"tone(f,d,'triangle',OBJECTIVE_MOTIF_MAX_GAIN)\", \"tone(f,.52,'triangle',OBJECTIVE_MOTIF_MAX_GAIN)\"])if(!engine.includes(token))throw new Error('Volume máximo do fallback musical ausente: '+token);\nif(!polish.includes('recipePeak:1'))throw new Error('Metadado de pico musical não está em 1.0');\n`;
validator=validator.replace(marker,checks+marker);
fs.writeFileSync(validatorPath,validator);
console.log('Recipe motif voices set to raw gain 1.0.');
