/* Ardua — additive SFX emphasis and objective-recipe voice routing. */
(()=>{
'use strict';
const proto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode,OscCtor=window.OscillatorNode;
if(!proto||!GainCtor||!DestCtor||proto.__arduaAudioPolishHook||typeof proto.connect!=='function')return;
const nativeConnect=proto.connect;
const GLOBAL_SFX_LIFT=1.22;
const MIXER_SFX_GAIN=3.6;
const NOTE_MAIN_TARGET=.82;
const NOTE_HARMONIC_TARGET=.17;
const CHORD_MAIN_TARGET=.24;
const CHORD_HARMONIC_TARGET=.05;
const CHORD_FINAL_TARGET=.12;
let standardNoteSerial=0,lastMotifRoot=220,lastPhaseSignature='';
const near=(a,b,e=.00035)=>Math.abs(Number(a)-Number(b))<=e;
const phaseSignature=()=>document.getElementById('phaseTitle')?.textContent?.trim()||'';
const interactionStageActive=()=>!!document.querySelector('.objective-interaction-stage');
function normalizedLift(seed,target){return target/Math.max(.0001,Math.abs(seed)*MIXER_SFX_GAIN)}
function rememberStandardRoot(freq){
 const sig=phaseSignature(),f=Number(freq)||0;if(!f)return;
 if(sig!==lastPhaseSignature){lastPhaseSignature=sig;lastMotifRoot=f}else lastMotifRoot=Math.min(lastMotifRoot||f,f);
 standardNoteSerial++;
}
Object.defineProperty(proto,'__arduaAudioPolishHook',{value:true,configurable:false,enumerable:false});
proto.connect=function(destination,...rest){
 if(rest.length===0&&OscCtor&&this instanceof OscCtor&&destination instanceof GainCtor){
  try{destination.__arduaPolishOscillatorType=this.type;destination.__arduaPolishOscillatorFrequency=Number(this.frequency?.value||0)}catch(_e){}
 }
 if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaPolishBooster){
  try{
   const booster=this.context.createGain(),seed=Math.abs(Number(this.gain?.value||0)),type=this.__arduaPolishOscillatorType||'',freq=this.__arduaPolishOscillatorFrequency||0;
   const firstSecondMain=type==='triangle'&&near(seed,.074);
   const firstSecondHarm=type==='sine'&&near(seed,.074*.30);
   const thirdMain=type==='triangle'&&near(seed,.086);
   const thirdHarm=type==='sine'&&near(seed,.086*.30);
   const chordMain=type==='triangle'&&near(seed,.040);
   const chordHarm=type==='sine'&&near(seed,.014);
   const chordFinal=type==='triangle'&&near(seed,.022);
   booster.__arduaPolishBooster=true;

   if((firstSecondMain||firstSecondHarm)&&interactionStageActive()){
    booster.gain.value=0;
   }else if(thirdMain||thirdHarm){
    /* The third note is emitted by recipe-audio-sync exactly when both enlarged reactants align. */
    booster.gain.value=0;
   }else if(firstSecondMain){
    rememberStandardRoot(freq);
    booster.gain.value=normalizedLift(seed,NOTE_MAIN_TARGET);
   }else if(firstSecondHarm){
    booster.gain.value=normalizedLift(seed,NOTE_HARMONIC_TARGET);
   }else if(chordMain){
    booster.gain.value=interactionStageActive()?0:normalizedLift(seed,CHORD_MAIN_TARGET);
   }else if(chordHarm){
    booster.gain.value=interactionStageActive()?0:normalizedLift(seed,CHORD_HARMONIC_TARGET);
   }else if(chordFinal){
    booster.gain.value=interactionStageActive()?0:normalizedLift(seed,CHORD_FINAL_TARGET);
   }else{
    booster.gain.value=GLOBAL_SFX_LIFT;
   }
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
 standardNoteSerial:()=>standardNoteSerial,
 motifRoot:()=>lastMotifRoot
});
})();
