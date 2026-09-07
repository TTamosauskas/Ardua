/* Ardua — synchronize the objective-recipe motif with player choices and visual beats. */
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
function reactants(){
 const left=formulaText().split(/→|->/)[0]||'',parts=left.split(/\s+\+\s+/).map(canonicalFormulaToken).filter(Boolean);
 return parts.slice(0,2);
}
function hash(text=''){let h=17;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function rootForCurrentFormula(){return ROOTS[hash(`${window.ARDUA_CAMPAIGN?.getState?.().activeId||''}|${formulaText()}`)%ROOTS.length]}
let audioCtx=null;
function audio(){
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx??=new Ctx();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}catch(_e){return null}
}
function voice(f,d,type,gain){
 const ctx=audio();if(!ctx)return;try{const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(f,now);g.gain.setValueAtTime(gain,now);o.connect(g);g.connect(ctx.destination);o.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.stop(now+d+.025)}catch(_e){}
}
function playNote(index,root){
 const f=[root,root*1.25,root*1.5][Math.max(0,Math.min(2,index))],third=index===2,d=third ? .31 : .27;
 voice(f,d,'triangle',third ? .188 : .181);voice(f*2,d*.84,'sine',third ? .039 : .037);
}
function playChord(root){
 for(const f of [root,root*1.25,root*1.5]){voice(f,.56,'triangle',.055);voice(f*2,.46,'sine',.0115)}voice(root*2,.58,'triangle',.027);
}
function serial(){return Number(window.ARDUA_AUDIO_POLISH?.standardNoteSerial?.()||0)}
let first=null,phaseSig='';
function reset(){first=null}
function syncPhase(){const s=`${window.ARDUA_CAMPAIGN?.getState?.().activeId||''}|${phaseTitle?.textContent||''}`;if(s!==phaseSig){phaseSig=s;reset()}}
syncPhase();
if(phaseTitle)new MutationObserver(syncPhase).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
window.addEventListener('ardua:campaign-progress',syncPhase);

function matchingSlot(token,pair,skip=-1){for(let i=0;i<pair.length;i++)if(i!==skip&&pair[i]===token)return i;return-1}
document.addEventListener('pointerdown',()=>audio(),{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')audio()},{capture:true});
document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest(SELECTOR):null;if(!el||!board.contains(el))return;syncPhase();
 const pair=reactants();if(pair.length<2)return;const token=tokenOf(el),key=keyOf(el);if(!token)return;
 const preSelected=el.classList.contains('selected'),before=serial(),formulaRoot=first?.root||rootForCurrentFormula();
 if(preSelected){if(first?.key===key)reset();return}
 const remaining=first?matchingSlot(token,pair,first.slot):-1,secondIntent=!!first&&first.key!==key&&remaining>=0;
 const firstSlot=first ? -1 : matchingSlot(token,pair,-1);
 setTimeout(()=>{
  syncPhase();const engineHandled=serial()>before;
  if(secondIntent){
   if(!engineHandled)playNote(1,formulaRoot);
   first={...first,secondKey:key,secondSlot:remaining,root:formulaRoot};
   return;
  }
  if(firstSlot<0)return;
  const becameSelected=el.isConnected&&el.classList.contains('selected');
  if(!becameSelected)return;
  first={key,slot:firstSlot,token,root:formulaRoot};
  if(!engineHandled)playNote(0,formulaRoot);
 },0);
},true);

function stageRoot(stage){
 const saved=Number(stage.dataset.recipeSyncRoot||0);if(saved)return saved;
 const interaction=stage.classList.contains('objective-interaction-stage'),root=interaction?(first?.root||rootForCurrentFormula()):(Number(window.ARDUA_AUDIO_POLISH?.motifRoot?.()||0)||rootForCurrentFormula());
 stage.dataset.recipeSyncRoot=String(root);return root;
}
function inspectStage(stage){
 if(!(stage instanceof Element)||!stage.classList.contains('objective-motif-stage'))return;
 const root=stageRoot(stage),nodes=[...stage.querySelectorAll('.objective-motif-nucleus:not(.result)')];
 if(!stage.dataset.recipeThirdPlayed&&nodes.length>=2&&nodes.slice(0,2).every(n=>n.classList.contains('aligned'))){stage.dataset.recipeThirdPlayed='1';playNote(2,root)}
 if(stage.classList.contains('objective-interaction-stage')&&!stage.dataset.recipeChordPlayed){
  const result=stage.querySelector('.objective-motif-nucleus.result'),settling=nodes.some(n=>n.classList.contains('settling'));
  if((result&&(result.classList.contains('visible')||result.isConnected))||settling){stage.dataset.recipeChordPlayed='1';playChord(root);setTimeout(reset,80)}
 }
}
const stageObserver=new MutationObserver(muts=>{
 const stages=new Set();for(const m of muts){const owner=m.target instanceof Element?m.target.closest('.objective-motif-stage'):null;if(owner)stages.add(owner);for(const n of m.addedNodes)if(n instanceof Element){if(n.classList.contains('objective-motif-stage'))stages.add(n);n.querySelectorAll?.('.objective-motif-stage').forEach(x=>stages.add(x))}}
 stages.forEach(inspectStage);
});
stageObserver.observe(board,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
