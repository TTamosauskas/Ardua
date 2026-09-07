/* Ardua — route native recipe timing while keeping one audible recipe voice. */
(()=>{
'use strict';
const nodeProto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode,BaseCtxProto=window.BaseAudioContext?.prototype||window.AudioContext?.prototype;
if(!nodeProto||!GainCtor||!DestCtor||nodeProto.__arduaAudioPolishHook||typeof nodeProto.connect!=='function')return;
const nativeConnect=nodeProto.connect,nativeCreateGain=BaseCtxProto?.createGain;
const GLOBAL_SFX_LIFT=1.22;
const near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;
let lastChordCueAt=0,selectionMuteUntil=0;

/* Capture the value actually scheduled by tone(). Reading AudioParam.value after
   automation can vary between engines, which previously allowed a second voice through. */
if(BaseCtxProto&&typeof nativeCreateGain==='function'&&!BaseCtxProto.__arduaGainSeedHook){
 Object.defineProperty(BaseCtxProto,'__arduaGainSeedHook',{value:true,configurable:false,enumerable:false});
 BaseCtxProto.createGain=function(...args){
  const gain=nativeCreateGain.apply(this,args),param=gain?.gain;
  if(param&&typeof param.setValueAtTime==='function'&&!param.__arduaSeedHook){
   const nativeSet=param.setValueAtTime.bind(param);
   Object.defineProperty(param,'__arduaSeedHook',{value:true,configurable:false,enumerable:false});
   param.setValueAtTime=function(value,time){try{gain.__arduaScheduledSeed=Number(value)}catch(_e){}return nativeSet(value,time)};
  }
  return gain;
 };
}

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
  const now=performance.now();if(now-lastChordCueAt<90)return;lastChordCueAt=now;api.engineChord?.();return;
 }
 if(kind==='chord-final')api.engineChordFinal?.();
}
function armSelectionMute(ms=80){selectionMuteUntil=Math.max(selectionMuteUntil,performance.now()+Math.max(20,Number(ms)||80))}

Object.defineProperty(nodeProto,'__arduaAudioPolishHook',{value:true,configurable:false,enumerable:false});
nodeProto.connect=function(destination,...rest){
 if(rest.length===0&&OscCtor&&this instanceof OscCtor&&destination instanceof GainCtor){
  try{destination.__arduaPolishOscillatorType=this.type;destination.__arduaPolishOscillatorFrequency=Number(this.frequency?.value||0)}catch(_e){}
 }
 if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaPolishBooster){
  try{
   /* Replica gains are the single audible recipe voice and bypass every booster. */
   if(this.__arduaRecipeReplica)return nativeConnect.call(this,destination);
   const booster=this.context.createGain(),seed=Math.abs(Number(this.__arduaScheduledSeed??this.gain?.value??0)),type=this.__arduaPolishOscillatorType||'',freq=Number(this.__arduaPolishOscillatorFrequency||0),kind=classifyRecipeVoice(type,seed),selectionCue=performance.now()<selectionMuteUntil&&type==='sine'&&near(seed,.03,.0012);
   booster.__arduaPolishBooster=true;
   if(kind){booster.gain.value=0;routeCue(kind,freq)}else if(selectionCue)booster.gain.value=0;else booster.gain.value=GLOBAL_SFX_LIFT;
   nativeConnect.call(this,booster);nativeConnect.call(booster,destination);return destination;
  }catch(_e){}
 }
 return nativeConnect.call(this,destination,...rest);
};
window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:.99,recipeOwner:'recipe-audio-sync',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});
})();
