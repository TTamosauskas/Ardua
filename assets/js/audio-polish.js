/* Ardua — additive SFX emphasis; recipe motif audio is owned exclusively by recipe-audio-sync.js. */
(()=>{
'use strict';
const proto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode;
if(!proto||!GainCtor||!DestCtor||proto.__arduaAudioPolishHook||typeof proto.connect!=='function')return;
const nativeConnect=proto.connect;
const GLOBAL_SFX_LIFT=1.22;
const near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;
function isEngineRecipeVoice(type,seed){
 return (type==='triangle'&&(
   near(seed,.074)||near(seed,.086)||near(seed,.040)||near(seed,.022)
 ))||(type==='sine'&&(
   near(seed,.074*.30)||near(seed,.086*.30)||near(seed,.014)
 ));
}
Object.defineProperty(proto,'__arduaAudioPolishHook',{value:true,configurable:false,enumerable:false});
proto.connect=function(destination,...rest){
 if(rest.length===0&&OscCtor&&this instanceof OscCtor&&destination instanceof GainCtor){
  try{destination.__arduaPolishOscillatorType=this.type}catch(_e){}
 }
 if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaPolishBooster){
  try{
   const booster=this.context.createGain(),seed=Math.abs(Number(this.gain?.value||0)),type=this.__arduaPolishOscillatorType||'';
   booster.__arduaPolishBooster=true;
   /* The native engine still emits its timing cues, while their recipe-note voices stay silent.
      recipe-audio-sync.js is the single audible owner of note 1, note 2, note 3 and the resolving chord. */
   booster.gain.value=isEngineRecipeVoice(type,seed)?0:GLOBAL_SFX_LIFT;
   nativeConnect.call(this,booster);
   nativeConnect.call(booster,destination);
   return destination;
  }catch(_e){}
 }
 return nativeConnect.call(this,destination,...rest);
};
window.ARDUA_AUDIO_POLISH=Object.freeze({
 globalSfxLift:GLOBAL_SFX_LIFT,
 recipeMotifLift:1,
 recipePeak:.99,
 recipeOwner:'recipe-audio-sync',
 standardNoteSerial:()=>0,
 motifRoot:()=>0
});
})();
