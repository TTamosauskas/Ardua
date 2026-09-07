/* Ardua — additive SFX emphasis; recipe motif audio is routed to recipe-audio-sync.js. */
(()=>{
'use strict';
const proto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode;
if(!proto||!GainCtor||!DestCtor||proto.__arduaAudioPolishHook||typeof proto.connect!=='function')return;
const nativeConnect=proto.connect;
const GLOBAL_SFX_LIFT=1.22;
const near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;
let lastChordCueAt=0;
function classifyRecipeVoice(type,seed){
 if(type==='triangle'&&near(seed,.074))return'note12-main';
 if(type==='sine'&&near(seed,.074*.30))return'note12-harm';
 if(type==='triangle'&&near(seed,.086))return'note3-main';
 if(type==='sine'&&near(seed,.086*.30))return'note3-harm';
 if(type==='triangle'&&near(seed,.040))return'chord-main';
 if(type==='sine'&&near(seed,.014))return'chord-harm';
 if(type==='triangle'&&near(seed,.022))return'chord-final';
 return'';
}
function routeCue(kind,freq){
 const api=window.ARDUA_RECIPE_AUDIO_SYNC;if(!api)return;
 if(kind==='note12-main'){
  if(!document.querySelector('.objective-interaction-stage'))api.engineNote?.(freq);
  return;
 }
 if(kind==='chord-main'){
  const now=performance.now();if(now-lastChordCueAt<90)return;lastChordCueAt=now;api.engineChord?.();
 }
}
Object.defineProperty(proto,'__arduaAudioPolishHook',{value:true,configurable:false,enumerable:false});
proto.connect=function(destination,...rest){
 if(rest.length===0&&OscCtor&&this instanceof OscCtor&&destination instanceof GainCtor){
  try{destination.__arduaPolishOscillatorType=this.type;destination.__arduaPolishOscillatorFrequency=Number(this.frequency?.value||0)}catch(_e){}
 }
 if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaPolishBooster){
  try{
   const booster=this.context.createGain(),seed=Math.abs(Number(this.gain?.value||0)),type=this.__arduaPolishOscillatorType||'',freq=Number(this.__arduaPolishOscillatorFrequency||0),kind=classifyRecipeVoice(type,seed);
   booster.__arduaPolishBooster=true;
   if(kind){booster.gain.value=0;routeCue(kind,freq)}else booster.gain.value=GLOBAL_SFX_LIFT;
   nativeConnect.call(this,booster);nativeConnect.call(booster,destination);return destination;
  }catch(_e){}
 }
 return nativeConnect.call(this,destination,...rest);
};
window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:.99,recipeOwner:'recipe-audio-sync',standardNoteSerial:()=>0,motifRoot:()=>0});
})();
