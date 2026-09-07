/* Ardua — additive SFX emphasis layered after the soundtrack mixer. */
(()=>{
'use strict';
const proto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode;
if(!proto||!GainCtor||!DestCtor||proto.__arduaAudioPolishHook||typeof proto.connect!=='function')return;
const nativeConnect=proto.connect;
const GLOBAL_SFX_LIFT=1.22;
const RECIPE_MOTIF_LIFT=1.45;
Object.defineProperty(proto,'__arduaAudioPolishHook',{value:true,configurable:false,enumerable:false});
proto.connect=function(destination,...rest){
 if(rest.length===0&&OscCtor&&this instanceof OscCtor&&destination instanceof GainCtor){
  try{destination.__arduaPolishOscillatorType=this.type}catch(_e){}
 }
 if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaPolishBooster){
  try{
   const booster=this.context.createGain(),seed=Math.abs(Number(this.gain?.value||0));
   const recipeLike=this.__arduaPolishOscillatorType==='triangle'&&seed>=.038;
   booster.__arduaPolishBooster=true;
   booster.gain.value=GLOBAL_SFX_LIFT*(recipeLike?RECIPE_MOTIF_LIFT:1);
   nativeConnect.call(this,booster);
   nativeConnect.call(booster,destination);
   return destination;
  }catch(_e){}
 }
 return nativeConnect.call(this,destination,...rest);
};
window.ARDUA_AUDIO_POLISH=Object.freeze({globalSfxLift:GLOBAL_SFX_LIFT,recipeMotifLift:RECIPE_MOTIF_LIFT});
})();
