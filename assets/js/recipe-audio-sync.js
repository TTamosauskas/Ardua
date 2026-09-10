/* Ardua — exact recipe motif sync using the engine's native tone envelope. */
(()=>{
'use strict';
const board=document.getElementById('starBoard'),formula=document.getElementById('formulaText'),phaseTitle=document.getElementById('phaseTitle');
if(!board||!formula)return;
const SELECTOR='.atom,.primordial-particle,.cosmic-ray,.neutron';
const ROOTS=[196,220,247,262,294,330];

/* Stretch the engine's own objective-motif waits, so audio and animation share
   exactly the same expanded cadence. The pause from the second note to the
   third and the pause from the third note to the union/chord use the same 2x cadence. */
if(!window.__arduaRecipeCadenceHook){
 const nativeSetTimeout=window.setTimeout.bind(window);
 const cadence=new Map([[105,210],[75,150],[28,56],[32,64],[285,570],[115,230],[70,140],[42,84]]);
 Object.defineProperty(window,'__arduaRecipeCadenceHook',{value:true,configurable:false,enumerable:false});
 window.setTimeout=function(handler,delay,...args){
  const ms=Number(delay),scaled=cadence.get(ms);
  if(scaled){
   const stack=String(new Error().stack||''),motifActive=!!document.querySelector('.objective-motif-stage');
   if(stack.includes('objectiveMotifConverge')||motifActive)return nativeSetTimeout(handler,scaled,...args);
  }
  return nativeSetTimeout(handler,delay,...args);
 };
}

const ELEMENT_NAMES={hidrogenio:'H',helio:'He',litio:'Li',berilio:'Be',boro:'B',carbono:'C',nitrogenio:'N',oxigenio:'O',fluor:'F',neonio:'Ne',sodio:'Na',magnesio:'Mg',aluminio:'Al',silicio:'Si',fosforo:'P',enxofre:'S',cloro:'Cl',argonio:'Ar',potassio:'K',calcio:'Ca',escandio:'Sc',titanio:'Ti',vanadio:'V',cromo:'Cr',manganes:'Mn',ferro:'Fe',cobalto:'Co',niquel:'Ni',cobre:'Cu',zinco:'Zn',galio:'Ga',germanio:'Ge',arsenio:'As',selenio:'Se',bromo:'Br',criptonio:'Kr',rubidio:'Rb',estroncio:'Sr',itrio:'Y',zirconio:'Zr',niobio:'Nb',molibdenio:'Mo',tecnecio:'Tc',rutenio:'Ru',rodio:'Rh',paladio:'Pd',prata:'Ag',cadmio:'Cd',indio:'In',estanho:'Sn',antimonio:'Sb',telurio:'Te',iodo:'I',xenonio:'Xe',cesio:'Cs',bario:'Ba',lantanio:'La',cerio:'Ce',praseodimio:'Pr',neodimio:'Nd',promecio:'Pm',samario:'Sm',europio:'Eu',gadolinio:'Gd',terbio:'Tb',disprosio:'Dy',holmio:'Ho',erbio:'Er',tulio:'Tm',iterbio:'Yb',lutecio:'Lu',hafnio:'Hf',tantalo:'Ta',tungstenio:'W',renio:'Re',osmio:'Os',iridio:'Ir',platina:'Pt',ouro:'Au',mercurio:'Hg',talio:'Tl',chumbo:'Pb',bismuto:'Bi',torio:'Th',uranio:'U'};
const SYMBOLS=new Map(Object.values(ELEMENT_NAMES).map(s=>[s.toLowerCase(),s]));
Object.assign(ELEMENT_NAMES,{deuterio:'D',tritio:'T','helio-3':'He3','carbono-13':'C13','neonio-22':'Ne22'});
const supers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁻':'-'};
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g,c=>supers[c]||c).replace(/\s+/g,' ').trim();
const keyOf=el=>`${el.classList.contains('atom')?'atom':el.classList.contains('cosmic-ray')?'ray':el.classList.contains('neutron')?'neutron':'particle'}:${el.dataset.id||''}`;
function canonicalSymbol(text){let raw=String(text||'').trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g,c=>supers[c]||c).replace(/\s+/g,'');if(/^2H$/i.test(raw))return'D';if(/^3H$/i.test(raw))return'T';if(/^3He$/i.test(raw))return'He3';if(/^13C$/i.test(raw))return'C13';if(/^22Ne$/i.test(raw))return'Ne22';raw=raw.replace(/\d*[+-]+$/,'');return SYMBOLS.get(raw.toLowerCase())||raw}
function tokenOf(el){if(!el)return'';if(el.classList.contains('primordial-particle')){if(el.classList.contains('proton'))return'p';if(el.classList.contains('neutronfree'))return'n';if(el.classList.contains('electron'))return'e';if(el.classList.contains('positron'))return'pos'}if(el.classList.contains('neutron'))return'n';if(el.classList.contains('cosmic-ray')){if(el.classList.contains('neutrino'))return'nu';if(el.classList.contains('gamma'))return'gamma';return'cosmic'}if(el.classList.contains('atom')){if(el.dataset.molecule)return el.dataset.molecule;return canonicalSymbol(el.querySelector('.sym')?.textContent||el.textContent)}return''}
function canonicalFormulaToken(text){const n=plain(text).replace(/^\d+\s*/,'');if(!n)return'';if(n.includes('heh+'))return'HeH+';if(/(^|\b)h2(\b|$)/.test(n))return'H2';if(n.includes('deuterio')||/(^|\b)2h(\b|$)/.test(n))return'D';if(n.includes('tritio')||/(^|\b)3h(\b|$)/.test(n))return'T';if(n.includes('helio-3')||/(^|\b)3he(\b|$)/.test(n))return'He3';if(n.includes('carbono-13')||/(^|\b)13c(\b|$)/.test(n))return'C13';if(n.includes('neonio-22')||/(^|\b)22ne(\b|$)/.test(n))return'Ne22';if(n.includes('proton')||n==='p'||n==='+')return'p';if(n.includes('neutron')||n==='n')return'n';if(n.includes('eletron')||/^\d*e-$/.test(n)||n==='e')return'e';if(n.includes('positron')||n==='e+')return'pos';if(n.includes('neutrino')||n==='ν'||n==='nu')return'nu';if(n.includes('foton')||n==='γ'||n==='gamma')return'gamma';if(n.includes('raio cosmico'))return'cosmic';for(const [name,sym] of Object.entries(ELEMENT_NAMES))if(n.includes(name))return sym;return canonicalSymbol(n)}
function formulaText(){const clone=formula.cloneNode(true);clone.querySelectorAll('.science-tag').forEach(x=>x.remove());return clone.textContent?.trim()||''}
function reactants(){const left=formulaText().split(/→|->/)[0]||'';return left.split(/\s+\+\s+/).map(canonicalFormulaToken).filter(Boolean).slice(0,2)}
function product(){const right=formulaText().split(/→|->/)[1]||'';return canonicalFormulaToken(right.split(/\s+\+\s+/)[0]||'')}
function hash(text=''){let h=17;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function activeId(){return window.ARDUA_CAMPAIGN?.getState?.().activeId||''}
function nativeRecipeKey(){const pair=reactants(),out=product()||'H',id=activeId();let interaction='';if(id.startsWith('primordial_'))interaction=`primordial:${id}:${out}`;else if(id.startsWith('atomic_'))interaction=id==='atomic_h'?`atomic:${id}:H`:`atomic:${id}:${out}:e`;else if(['first_atomic_bonds','first_nebulae'].includes(id))interaction=`molecule:${id}:${out}`;return interaction?`@${interaction}:a+@${interaction}:b>${out}`:`${[...pair].sort().join('+')}>${out}`}
function rootForCurrentFormula(){return ROOTS[hash(nativeRecipeKey())%ROOTS.length]}
function phaseSignature(){return`${activeId()}|${phaseTitle?.textContent||''}`}
function ratiosForProduct(sym=product()){return new Set(['HeU','FeU','Be7','Be8']).has(sym)?[1,4/3,1.5]:[1,1.25,1.5]}

let audioCtx=null,recipeBus=null;const replicaVoices=new Set();
const RECIPE_NOTE_MAIN_GAIN=.68,RECIPE_NOTE_HARM_GAIN=.22,RECIPE_CHORD_MAIN_GAIN=.18,RECIPE_CHORD_HARM_GAIN=.055,RECIPE_FINAL_GAIN=.14;
const RECIPE_MASTER_GAIN=1.05,RECIPE_LIMIT_THRESHOLD=-1.5,RECIPE_LIMIT_RATIO=20,RECIPE_LIMIT_ATTACK=.002,RECIPE_LIMIT_RELEASE=.12,RECIPE_OUTPUT_CEILING=.98;
function audio(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx??=new Ctx();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}catch(_e){return null}}
async function ensureAudioReady(){const ctx=audio();if(!ctx)return null;if(ctx.state==='suspended'){try{await ctx.resume()}catch(_e){return null}}return ctx.state==='running'?ctx:null}
function recipeOutput(ctx){
 if(recipeBus?.ctx===ctx)return recipeBus.input;
 const input=ctx.createGain(),limiter=ctx.createDynamicsCompressor(),ceiling=ctx.createGain();
 input.gain.value=RECIPE_MASTER_GAIN;limiter.threshold.value=RECIPE_LIMIT_THRESHOLD;limiter.knee.value=0;limiter.ratio.value=RECIPE_LIMIT_RATIO;limiter.attack.value=RECIPE_LIMIT_ATTACK;limiter.release.value=RECIPE_LIMIT_RELEASE;ceiling.gain.value=RECIPE_OUTPUT_CEILING;
 input.connect(limiter);limiter.connect(ceiling);ceiling.connect(ctx.destination);recipeBus={ctx,input,limiter,ceiling};return input;
}
function nativeTone(freq=440,duration=.05,type='sine',gain=.03,delay=0){
 try{const ctx=audio();if(!ctx)return;const play=()=>{try{const osc=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime+Math.max(0,Number(delay)||0);g.__arduaRecipeReplica=true;osc.type=type;osc.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(Math.max(.0001,gain),now);osc.connect(g);g.connect(recipeOutput(ctx));const item={osc,g};replicaVoices.add(item);osc.onended=()=>replicaVoices.delete(item);osc.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.stop(now+duration+.02)}catch(_e){}};if(ctx.state==='suspended'){const resumed=ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(play).catch(()=>{});else play()}else play()}catch(_e){}
}
function stopReplicaVoices(){const ctx=audioCtx;if(!ctx)return;const now=ctx.currentTime;for(const item of [...replicaVoices]){try{item.osc.stop(now+.01)}catch(_e){}}replicaVoices.clear()}
function playFrequency(freq,strong=false){const d=strong?.28:.24;nativeTone(freq,d,'triangle',RECIPE_NOTE_MAIN_GAIN);nativeTone(freq*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN)}
function playNote(index,root,ratios=ratiosForProduct()){playFrequency(root*ratios[Math.max(0,Math.min(2,index))],index===2)}
function playChord(root,ratios=ratiosForProduct()){for(const ratio of ratios){const f=root*ratio;nativeTone(f,.52,'triangle',RECIPE_CHORD_MAIN_GAIN);nativeTone(f*2,.42,'sine',RECIPE_CHORD_HARM_GAIN)}}
function playFinalAccent(root){nativeTone(root*2,.56,'triangle',RECIPE_FINAL_GAIN)}

document.addEventListener('pointerdown',()=>audio(),{capture:true,passive:true});document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')audio()},{capture:true});
let sessionSerial=0,phaseSig=phaseSignature(),motif=null,engineCueSerial=0,combinationOctave=0;
function pairKey(pair){return(pair||[]).join('|')}
function freshMotif(pair=reactants(),root=rootForCurrentFormula()){motif={session:++sessionSerial,pair:[...pair],root:Number(root)||rootForCurrentFormula(),ratios:ratiosForProduct(),step:0,first:null,second:null,done:false};return motif}
function resetMotif({stop=true}={}){motif=null;if(stop)stopReplicaVoices()}
function combinationRoot(){return rootForCurrentFormula()*(2**Math.max(0,Number(combinationOctave)||0))}
function syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;combinationOctave=0;if(motif?.step>=3)return;resetMotif()}}
if(phaseTitle)new MutationObserver(syncPhase).observe(phaseTitle,{childList:true,subtree:true,characterData:true});window.addEventListener('ardua:campaign-progress',syncPhase);
function matchingSlot(token,pair,skip=-1){for(let i=0;i<pair.length;i++)if(i!==skip&&pair[i]===token)return i;return-1}
function currentStage(){return[...board.querySelectorAll('.objective-motif-stage')].at(-1)||null}
function highlightedStage(stage=currentStage()){if(!(stage instanceof Element))return null;const nodes=[...stage.querySelectorAll('.objective-motif-nucleus:not(.result)')];return nodes.length>=2&&nodes.slice(0,2).every(n=>n.classList.contains('aligned'))?stage:null}
function markFirst(token,key,slot,root){const pair=reactants(),m=freshMotif(pair,root);m.first={token,key,slot};m.step=1;playFrequency(m.root);return m}
function markSecond(token,key,slot){if(!motif||motif.step!==1||motif.first?.key===key)return false;motif.second={token,key,slot};motif.step=2;playNote(1,motif.root,motif.ratios);queueMicrotask(()=>emitThirdForHighlight(currentStage()));return true}
function emitThirdForHighlight(stage){if(!motif||motif.step!==2)return false;const ready=highlightedStage(stage);if(!ready||ready.dataset.recipeThirdPlayed==='1')return false;ready.dataset.recipeThirdPlayed='1';ready.dataset.recipeSession=String(motif.session);motif.step=3;playNote(2,motif.root,motif.ratios);return true}
function engineNote(freq){syncPhase();engineCueSerial++;const pair=reactants();if(pair.length<2)return;const f=Number(freq)||rootForCurrentFormula();if(!motif||motif.done||pairKey(motif.pair)!==pairKey(pair)){const m=freshMotif(pair,f);m.step=1;m.first={token:pair[0],key:'engine:first',slot:0};playFrequency(f);return}if(motif.step===0){motif.root=f;motif.step=1;motif.first={token:pair[0],key:'engine:first',slot:0};playFrequency(f);return}if(motif.step===1){motif.second={token:pair[1],key:'engine:second',slot:1};motif.step=2;playFrequency(f);queueMicrotask(()=>emitThirdForHighlight(currentStage()))}}
function engineChord(){syncPhase();engineCueSerial++;if(!motif)return;emitThirdForHighlight(currentStage());if(motif.step!==3||motif.done)return;motif.step=4;motif.done=true;playChord(motif.root,motif.ratios);combinationOctave++}
function engineChordFinal(){if(motif?.done)playFinalAccent(motif.root)}
async function victorySong(){
 syncPhase();const ctx=await ensureAudioReady();if(!ctx)return false;stopReplicaVoices();
 const root=rootForCurrentFormula(),ratios=ratiosForProduct(),notes=ratios.map(r=>root*r),noteGap=.34,phraseGap=.48,phraseSpan=noteGap*2+phraseGap;
 for(let octave=0;octave<3;octave++){const start=octave*phraseSpan,mult=2**octave;for(let i=0;i<notes.length;i++){const delay=start+i*noteGap,last=octave===2&&i===2,d=last?.62:(i===2?.36:.28),f=notes[i]*mult;nativeTone(f,d,'triangle',RECIPE_NOTE_MAIN_GAIN,delay);nativeTone(f*2,d*.82,'sine',RECIPE_NOTE_HARM_GAIN,delay)}}
 await new Promise(resolve=>setTimeout(resolve,3640));return true;
}
window.ARDUA_RECIPE_AUDIO_SYNC=Object.freeze({engineNote,engineChord,engineChordFinal,victorySong,cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'}),state:()=>motif?{session:motif.session,step:motif.step,root:motif.root,pair:[...motif.pair],combinationOctave}:null});

document.addEventListener('click',e=>{const el=e.target instanceof Element?e.target.closest(SELECTOR):null;if(!el||!board.contains(el))return;syncPhase();const pair=reactants();if(pair.length<2)return;const token=tokenOf(el),key=keyOf(el);if(!token)return;const preSelected=el.classList.contains('selected'),preCandidate=el.classList.contains('candidate'),currentPairKey=pairKey(pair);let targetIntent=false;if(!motif||motif.done||pairKey(motif.pair)!==currentPairKey)targetIntent=matchingSlot(token,pair)>=0;else if(motif.step===1)targetIntent=matchingSlot(token,motif.pair,motif.first?.slot??-1)>=0&&(preCandidate||!preSelected);if(targetIntent)window.ARDUA_AUDIO_POLISH?.armSelectionMute?.(90);const beforeCue=engineCueSerial,beforeStages=board.querySelectorAll('.objective-motif-stage').length;setTimeout(()=>{syncPhase();if(engineCueSerial>beforeCue)return;const nowSelected=el.isConnected&&el.classList.contains('selected'),stageCount=board.querySelectorAll('.objective-motif-stage').length,newStage=stageCount>beforeStages;if(preSelected){if(motif?.first?.key===key&&motif.step===1&&!nowSelected)resetMotif();return}if(!motif||motif.done||pairKey(motif.pair)!==currentPairKey){const slot=matchingSlot(token,pair);if(slot>=0&&nowSelected)markFirst(token,key,slot,combinationRoot());return}if(motif.step===1){const slot=matchingSlot(token,motif.pair,motif.first?.slot??-1);if(slot>=0&&(preCandidate||nowSelected||newStage)){markSecond(token,key,slot);return}}emitThirdForHighlight(currentStage())},0)},true);

const stageObserver=new MutationObserver(muts=>{const stages=new Set();for(const m of muts){const owner=m.target instanceof Element?m.target.closest('.objective-motif-stage'):null;if(owner)stages.add(owner);for(const n of m.addedNodes)if(n instanceof Element){if(n.classList.contains('objective-motif-stage'))stages.add(n);n.querySelectorAll?.('.objective-motif-stage').forEach(x=>stages.add(x))}}stages.forEach(stage=>emitThirdForHighlight(stage))});
stageObserver.observe(board,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.addEventListener('blur',stopReplicaVoices);
})();