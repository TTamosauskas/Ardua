const fs=require('fs');
const files={
 engine:'assets/js/ardua.js',
 sync:'assets/js/recipe-audio-sync.js',
 index:'index.html',
 cadence:'scripts/validate-recipe-audio-cadence.js',
 runtime:'scripts/validate-phase-runtime-sync.js',
 scatter:'scripts/validate-scatter-appreciation.js'
};
const read=k=>fs.readFileSync(files[k],'utf8');
const write=(k,s)=>fs.writeFileSync(files[k],s);
const replaceOnce=(src,from,to,label)=>{const n=src.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 match, got ${n}`);return src.replace(from,to)};

let engine=read('engine');
const oldEnd=` state.phaseDone=true;state.locked=true;$('phaseEndBtn').classList.remove('show');stopPrimordialDrift();cancelParticleDrag();stopAccretionFeed();stopCosmicRaySystem();stopNeutronSystem();\n let played=false;try{played=await window.ARDUA_RECIPE_AUDIO_SYNC?.victorySong?.()}catch(_e){}if(!played){adaptiveAudioResolve('completion');await wait(620)}if(phase()!==s)return;`;
const newEnd=` state.phaseDone=true;state.locked=true;$('phaseEndBtn').classList.remove('show');stopPrimordialDrift();cancelParticleDrag();stopAccretionFeed();stopCosmicRaySystem();stopNeutronSystem();\n if(phase()!==s)return;`;
engine=replaceOnce(engine,oldEnd,newEnd,'engine endPhaseAction');
write('engine',engine);

let sync=read('sync');
sync=replaceOnce(sync,"async function ensureAudioReady(){const ctx=audio();if(!ctx)return null;if(ctx.state==='suspended'){try{await ctx.resume()}catch(_e){return null}}return ctx.state==='running'?ctx:null}\n",'', 'ensureAudioReady');
const start=sync.indexOf('async function victorySong(){');
const end=sync.indexOf("window.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze",start);
if(start<0||end<0)throw new Error('victorySong block not found');
sync=sync.slice(0,start)+sync.slice(end);
sync=replaceOnce(sync,'Object.freeze({engineNote,engineChord,engineChordFinal,victorySong,cadence:','Object.freeze({engineNote,engineChord,engineChordFinal,cadence:','victorySong export');
write('sync',sync);

const oldVersion='20260911-scatter-appreciation-1',newVersion='20260911-no-octave-victory-1';
let index=read('index');
for(const asset of ['recipe-sound-profile.js','audio-polish.js','ardua.js','recipe-audio-sync.js','campaign-quarks.js']){
 const from=`assets/js/${asset}?v=${oldVersion}`,to=`assets/js/${asset}?v=${newVersion}`;
 index=replaceOnce(index,from,to,`cache ${asset}`);
}
write('index',index);

let cadence=read('cadence');
const oldVictory=`// A música de vitória continua sendo o efeito separado solicitado: três frases em oitavas ascendentes, mas com o mesmo timbre/dinâmica de Quarks.\nfor(const token of ['async function victorySong()','for(let octave=0;octave<3;octave++)','mult=2**octave','AUDIO_PROFILE.noteStrongGain','AUDIO_PROFILE.noteMainGain','AUDIO_PROFILE.harmonicRatio','setTimeout(resolve,3640)'])if(!recipe.includes(token))throw new Error('Música de vitória perdeu contrato: '+token);\nfor(const token of ['async function ensureAudioReady()','const ctx=await ensureAudioReady();if(!ctx)return false'])if(!recipe.includes(token))throw new Error('Victory song não garante AudioContext ativo: '+token);\n`;
const newVictory=`// A antiga música final em três oitavas foi removida. O motivo de combinação nota-nota-nota-acorde permanece intacto.\nfor(const token of ['async function victorySong()','for(let octave=0;octave<3;octave++)','mult=2**octave','setTimeout(resolve,3640)','async function ensureAudioReady()'])if(recipe.includes(token))throw new Error('Música final em oitavas ainda presente: '+token);\nif(engine.includes('ARDUA_RECIPE_AUDIO_SYNC?.victorySong'))throw new Error('Botão final ainda dispara a música em oitavas');\nfor(const token of ['function playFrequency(','function playChord(','function engineChord()','playNote(2,motif.root,motif.ratios)','playChord(motif.root,motif.ratios)'])if(!recipe.includes(token))throw new Error('Motivo nota-nota-nota-acorde foi alterado: '+token);\n`;
cadence=replaceOnce(cadence,oldVictory,newVictory,'cadence victory contract');
cadence=replaceOnce(cadence,"const version='20260911-scatter-appreciation-1';","const version='20260911-no-octave-victory-1';",'cadence cache version');
cadence=replaceOnce(cadence,"console.log('Quarks audio parity OK: every three-note/chord implementation uses one shared Quarks profile; standard combinations keep a fixed register; victory song remains separate.');","console.log('Quarks audio parity OK: note-note-note-chord remains canonical; the octave-rising final song is removed.');",'cadence log');
write('cadence',cadence);

let runtime=read('runtime');
runtime=replaceOnce(runtime,"assert(index.includes('ardua.js?v=20260911-scatter-appreciation-1'),'Engine sem cache bust da correção');","assert(index.includes('ardua.js?v=20260911-no-octave-victory-1'),'Engine sem cache bust da correção');",'runtime cache');
write('runtime',runtime);

let scatter=read('scatter');
scatter=replaceOnce(scatter,"assert(index.includes('ardua.js?v=20260911-scatter-appreciation-1'),'Engine sem cache bust da pausa de apreciação');","assert(index.includes('ardua.js?v=20260911-no-octave-victory-1'),'Engine sem cache bust da pausa de apreciação');",'scatter cache');
write('scatter',scatter);

console.log('Removed octave-rising victory song; preserved note-note-note-chord motif.');
