/* Ardua — route native recipe timing while keeping one audible recipe voice. */
(()=>{
'use strict';
const nodeProto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode,BaseCtxProto=window.BaseAudioContext?.prototype||window.AudioContext?.prototype;
if(!nodeProto||!GainCtor||!DestCtor||nodeProto.__arduaAudioPolishHook||typeof nodeProto.connect!=='function')return;
const nativeConnect=nodeProto.connect,nativeCreateGain=BaseCtxProto?.createGain;
const GLOBAL_SFX_LIFT=1.22;
const near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;
let lastChordCueAt=0,selectionMuteUntil=0,lastRoutedAt=0,lastRoutedKind='';

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
function rememberRouted(kind){lastRoutedKind=kind;lastRoutedAt=performance.now()}
function routedRecently(kind,windowMs=90){return lastRoutedKind===kind&&performance.now()-lastRoutedAt<windowMs}
function routeCue(kind,freq){
 const api=window.ARDUA_RECIPE_AUDIO_SYNC;if(!api)return false;
 if(kind==='note12-main'){
  if(document.querySelector('.objective-interaction-stage'))return false;
  const before=api.state?.();api.engineNote?.(freq);const after=api.state?.();
  const played=!!after&&(!before||after.session!==before.session||after.step!==before.step);
  if(played)rememberRouted('note12');return played;
 }
 if(kind==='note12-harm')return routedRecently('note12');
 if(kind==='note3-main'){
  const played=Number(api.state?.()?.step||0)>=3;
  if(played)rememberRouted('note3');return played;
 }
 if(kind==='note3-harm')return routedRecently('note3');
 if(kind==='chord-main'){
  const now=performance.now();if(now-lastChordCueAt<90)return routedRecently('chord',110);
  const before=api.state?.();api.engineChord?.();const after=api.state?.();
  const played=!!after&&Number(after.step||0)>=4&&(!before||after.session!==before.session||after.step!==before.step);
  if(played){lastChordCueAt=now;rememberRouted('chord')}return played;
 }
 if(kind==='chord-harm')return routedRecently('chord',110);
 if(kind==='chord-final'){
  if(Number(api.state?.()?.step||0)<4)return false;
  api.engineChordFinal?.();rememberRouted('final');return true;
 }
 return false;
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
   const booster=this.context.createGain(),seed=Math.abs(Number(this.__arduaScheduledSeed??this.gain?.value??0)),type=this.__arduaPolishOscillatorType||'',freq=Number(this.__arduaPolishOscillatorFrequency||0),kind=classifyRecipeVoice(type,seed),selectionCue=performance.now()<selectionMuteUntil&&type==='sine'&&near(seed,.03,.0012),routed=kind?routeCue(kind,freq):false;
   /* Never mute the engine merely because a cue looks like the recipe motif.
      The native voice is suppressed only after the sync layer confirms that its
      replacement actually played. This keeps campaign mode audible even when
      contextual guidance temporarily makes the formula impossible to parse. */
   if(kind&&routed)booster.gain.value=0;else if(selectionCue)booster.gain.value=0;else booster.gain.value=GLOBAL_SFX_LIFT;
   nativeConnect.call(this,booster);nativeConnect.call(booster,destination);return destination;
  }catch(_e){}
 }
 return nativeConnect.call(this,destination,...rest);
};
window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:1,recipePeak:1,recipeOwner:'recipe-audio-sync',armSelectionMute,standardNoteSerial:()=>0,motifRoot:()=>0});
})();
