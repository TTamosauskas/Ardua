/* Ardua — single-owner recipe motif: note 1 → note 2 → note 3 → resolving chord. */
(()=>{
'use strict';
const board=document.getElementById('starBoard'),formula=document.getElementById('formulaText'),phaseTitle=document.getElementById('phaseTitle');
if(!board||!formula)return;
const SELECTOR='.atom,.primordial-particle,.cosmic-ray,.neutron';
const ROOTS=[196,220,247,262,294,330];
const ELEMENT_NAMES={
 hidrogenio:'H',helio:'He',litio:'Li',berilio:'Be',boro:'B',carbono:'C',nitrogenio:'N',oxigenio:'O',fluor:'F',neonio:'Ne',sodio:'Na',magnesio:'Mg',aluminio:'Al',silicio:'Si',fosforo:'P',enxofre:'S',cloro:'Cl',argonio:'Ar',potassio:'K',calcio:'Ca',escandio:'Sc',titanio:'Ti',vanadio:'V',cromo:'Cr',manganes:'Mn',ferro:'Fe',cobalto:'Co',niquel:'Ni',cobre:'Cu',zinco:'Zn',galio:'Ga',germanio:'Ge',arsenio:'As',selenio:'Se',bromo:'Br',criptonio:'Kr',rubidio:'Rb',estroncio:'Sr',itrio:'Y',zirconio:'Zr',niobio:'Nb',molibdenio:'Mo',tecnecio:'Tc',rutenio:'Ru',rodio:'Rh',paladio:'Pd',prata:'Ag',cadmio:'Cd',indio:'In',estanho:'Sn',antimonio:'Sb',telurio:'Te',iodo:'I',xenonio:'Xe',cesio:'Cs',bario:'Ba',lantanio:'La',cerio:'Ce',praseodimio:'Pr',neodimio:'Nd',promecio:'Pm',samario:'Sm',europio:'Eu',gadolinio:'Gd',terbio:'Tb',disprosio:'Dy',holmio:'Ho',erbio:'Er',tulio:'Tm',iterbio:'Yb',lutecio:'Lu',hafnio:'Hf',tantalo:'Ta',tungstenio:'W',renio:'Re',osmio:'Os',iridio:'Ir',platina:'Pt',ouro:'Au',mercurio:'Hg',talio:'Tl',chumbo:'Pb',bismuto:'Bi',torio:'Th',uranio:'U'
};
const SYMBOLS=new Map(Object.values(ELEMENT_NAMES).map(s=>[s.toLowerCase(),s]));
Object.assign(ELEMENT_NAMES,{deuterio:'D',tritio:'T','helio-3':'He3','carbono-13':'C13','neonio-22':'Ne22'});
const supers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁻':'-'};
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g,c=>supers[c]||c).replace(/\s+/g,' ').trim();
const keyOf=el=>`${el.classList.contains('atom')?'atom':el.classList.contains('cosmic-ray')?'ray':el.classList.contains('neutron')?'neutron':'particle'}:${el.dataset.id||''}`;
function canonicalSymbol(text){
 let raw=String(text||'').trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g,c=>supers[c]||c).replace(/\s+/g,'');
 if(/^2H$/i.test(raw))return'D';if(/^3H$/i.test(raw))return'T';if(/^3He$/i.test(raw))return'He3';if(/^13C$/i.test(raw))return'C13';if(/^22Ne$/i.test(raw))return'Ne22';
 raw=raw.replace(/\d*[+-]+$/,'');
 return SYMBOLS.get(raw.toLowerCase())||raw;
}
function tokenOf(el){
 if(!el)return'';
 if(el.classList.contains('primordial-particle')){if(el.classList.contains('proton'))return'p';if(el.classList.contains('neutronfree'))return'n';if(el.classList.contains('electron'))return'e';if(el.classList.contains('positron'))return'pos'}
 if(el.classList.contains('neutron'))return'n';
 if(el.classList.contains('cosmic-ray')){if(el.classList.contains('neutrino'))return'nu';if(el.classList.contains('gamma'))return'gamma';return'cosmic'}
 if(el.classList.contains('atom')){if(el.dataset.molecule)return el.dataset.molecule;return canonicalSymbol(el.querySelector('.sym')?.textContent||el.textContent)}
 return'';
}
function canonicalFormulaToken(text){
 const n=plain(text).replace(/^\d+\s*/,'');
 if(!n)return'';
 if(n.includes('heh+'))return'HeH+';if(/(^|\b)h2(\b|$)/.test(n))return'H2';
 if(n.includes('deuterio')||/(^|\b)2h(\b|$)/.test(n))return'D';
 if(n.includes('tritio')||/(^|\b)3h(\b|$)/.test(n))return'T';
 if(n.includes('helio-3')||/(^|\b)3he(\b|$)/.test(n))return'He3';
 if(n.includes('carbono-13')||/(^|\b)13c(\b|$)/.test(n))return'C13';
 if(n.includes('neonio-22')||/(^|\b)22ne(\b|$)/.test(n))return'Ne22';
 if(n.includes('proton')||n==='p'||n==='+')return'p';
 if(n.includes('neutron')||n==='n')return'n';
 if(n.includes('eletron')||/^\d*e-$/.test(n)||n==='e')return'e';
 if(n.includes('positron')||n==='e+')return'pos';
 if(n.includes('neutrino')||n==='ν'||n==='nu')return'nu';
 if(n.includes('foton')||n==='γ'||n==='gamma')return'gamma';
 if(n.includes('raio cosmico'))return'cosmic';
 for(const [name,sym] of Object.entries(ELEMENT_NAMES))if(n.includes(name))return sym;
 return canonicalSymbol(n);
}
function formulaText(){const clone=formula.cloneNode(true);clone.querySelectorAll('.science-tag').forEach(x=>x.remove());return clone.textContent?.trim()||''}
function reactants(){const left=formulaText().split(/→|->/)[0]||'';return left.split(/\s+\+\s+/).map(canonicalFormulaToken).filter(Boolean).slice(0,2)}
function hash(text=''){let h=17;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function rootForCurrentFormula(){return ROOTS[hash(`${window.ARDUA_CAMPAIGN?.getState?.().activeId||''}|${formulaText()}`)%ROOTS.length]}
function phaseSignature(){return`${window.ARDUA_CAMPAIGN?.getState?.().activeId||''}|${phaseTitle?.textContent||''}`}

let audioCtx=null;
const activeVoices=new Set();
function audio(){
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx??=new Ctx();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}catch(_e){return null}
}
function releaseVoices(seconds=.03){
 const ctx=audioCtx;if(!ctx)return;const now=ctx.currentTime;
 for(const v of [...activeVoices]){
  try{const current=Math.max(.0001,Number(v.gain.gain.value||.0001));v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(current,now);v.gain.gain.exponentialRampToValueAtTime(.0001,now+seconds);v.osc.stop(now+seconds+.018)}catch(_e){}
 }
}
function voice(freq,duration,type,gain,startDelay=.032){
 const ctx=audio();if(!ctx)return;try{
  const osc=ctx.createOscillator(),g=ctx.createGain(),start=ctx.currentTime+startDelay,attack=.012,release=Math.max(.055,duration*.34);
  osc.type=type;osc.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+attack);g.gain.setValueAtTime(gain,start+Math.max(attack,duration-release));g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(g);g.connect(ctx.destination);const item={osc,gain:g};activeVoices.add(item);osc.onended=()=>activeVoices.delete(item);osc.start(start);osc.stop(start+duration+.02);
 }catch(_e){}
}
function playNote(index,root){
 releaseVoices(.026);const ratio=[1,1.25,1.5][Math.max(0,Math.min(2,index))],f=root*ratio,d=index===2?.235:.215;
 voice(f,d,'triangle',index===2?.184:.176,.032);voice(f*2,d*.82,'sine',index===2?.036:.034,.032);
}
function playChord(root){
 releaseVoices(.038);const delay=.044;
 for(const f of [root,root*1.25,root*1.5]){voice(f,.46,'triangle',.052,delay);voice(f*2,.38,'sine',.0105,delay)}voice(root*2,.48,'triangle',.024,delay);
}

document.addEventListener('pointerdown',()=>audio(),{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')audio()},{capture:true});

let sessionSerial=0,phaseSig=phaseSignature(),motif=null,chordTimer=0;
function freshMotif(pair=reactants()){
 clearTimeout(chordTimer);chordTimer=0;motif={session:++sessionSerial,pair:[...pair],root:rootForCurrentFormula(),step:0,first:null,second:null,lastAt:0,chordPending:false,done:false};return motif;
}
function resetMotif({release=true}={}){clearTimeout(chordTimer);chordTimer=0;motif=null;if(release)releaseVoices(.025)}
function syncPhase(){const sig=phaseSignature();if(sig!==phaseSig){phaseSig=sig;resetMotif()}}
if(phaseTitle)new MutationObserver(syncPhase).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
window.addEventListener('ardua:campaign-progress',syncPhase);
function matchingSlot(token,pair,skip=-1){for(let i=0;i<pair.length;i++)if(i!==skip&&pair[i]===token)return i;return-1}
function startFirst(el,token,key,pair,slot){
 const m=freshMotif(pair),session=m.session;
 setTimeout(()=>{
  syncPhase();if(!motif||motif.session!==session)return;
  const selected=el.isConnected&&el.classList.contains('selected');if(!selected){resetMotif({release:false});return}
  motif.first={key,token,slot};motif.step=1;motif.lastAt=performance.now();playNote(0,motif.root);
 },0);
}
function acceptSecond(token,key,slot){
 if(!motif||motif.step!==1||motif.first?.key===key)return;
 motif.second={key,token,slot};motif.step=2;motif.lastAt=performance.now();playNote(1,motif.root);
}
function emitThird(){
 if(!motif||motif.step!==2)return;motif.step=3;motif.lastAt=performance.now();playNote(2,motif.root);if(motif.chordPending)scheduleChord();
}
function scheduleChord(){
 if(!motif||motif.step!==3||chordTimer)return;const session=motif.session,elapsed=performance.now()-motif.lastAt,wait=Math.max(0,185-elapsed);
 chordTimer=setTimeout(()=>{chordTimer=0;if(!motif||motif.session!==session||motif.step!==3)return;motif.step=4;motif.done=true;motif.lastAt=performance.now();playChord(motif.root)},wait);
}

document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest(SELECTOR):null;if(!el||!board.contains(el))return;syncPhase();
 const pair=reactants();if(pair.length<2)return;const token=tokenOf(el),key=keyOf(el);if(!token)return;
 const preSelected=el.classList.contains('selected');
 if(preSelected){if(motif?.first?.key===key&&motif.step===1)resetMotif();return}
 if(!motif||motif.done||motif.pair.join('|')!==pair.join('|')){
  const slot=matchingSlot(token,pair);if(slot>=0)startFirst(el,token,key,pair,slot);return;
 }
 if(motif.step===0)return;
 if(motif.step===1){const slot=matchingSlot(token,motif.pair,motif.first?.slot??-1);if(slot>=0)acceptSecond(token,key,slot)}
},true);

function inspectStage(stage){
 if(!(stage instanceof Element)||!stage.classList.contains('objective-motif-stage')||!motif)return;
 if(!stage.dataset.recipeSession)stage.dataset.recipeSession=String(motif.session);
 if(Number(stage.dataset.recipeSession)!==motif.session)return;
 const nodes=[...stage.querySelectorAll('.objective-motif-nucleus:not(.result)')],aligned=nodes.length>=2&&nodes.slice(0,2).every(n=>n.classList.contains('aligned'));
 const result=stage.querySelector('.objective-motif-nucleus.result'),settling=nodes.some(n=>n.classList.contains('settling')),resolved=stage.classList.contains('objective-interaction-stage')&&((result&&(result.classList.contains('visible')||result.isConnected))||settling);
 if(resolved){stage.dataset.recipeChordQueued='1';motif.chordPending=true}
 if(aligned&&!stage.dataset.recipeThirdPlayed&&motif.step===2){stage.dataset.recipeThirdPlayed='1';emitThird()}
 if(motif.chordPending&&motif.step===3)scheduleChord();
}
const stageObserver=new MutationObserver(muts=>{
 const stages=new Set();for(const m of muts){const owner=m.target instanceof Element?m.target.closest('.objective-motif-stage'):null;if(owner)stages.add(owner);for(const n of m.addedNodes)if(n instanceof Element){if(n.classList.contains('objective-motif-stage'))stages.add(n);n.querySelectorAll?.('.objective-motif-stage').forEach(x=>stages.add(x))}}
 stages.forEach(inspectStage);
});
stageObserver.observe(board,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('blur',()=>releaseVoices(.02));
})();
