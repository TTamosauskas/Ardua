/* Ardua — continuous background soundtrack, independent from game controls. */
(()=>{
'use strict';
const audio=document.getElementById('arduaSoundtrack');
if(!audio)return;
const MAP_VOLUME=.20;
const PHASE_VOLUME=.15;
const FADE_MS=950;
const START_AT=22;
const DUCK_RATIO=.20;
const DUCK_ATTACK_MS=45;
const DUCK_RELEASE_MS=420;
const DUCK_HOLD_MS=760;
const SFX_GAIN=3.6;
let fadeFrame=0;
let observer=null;
let startPositionApplied=false;
let ducked=false;
let duckUntil=0;
let duckTimer=0;
let unlockArmed=false;

audio.loop=false;
audio.preload='auto';
audio.playsInline=true;
audio.controls=false;
audio.volume=MAP_VOLUME;

function wantedVolume(){
 const body=document.body,map=document.getElementById('campaignMap');
 return !map||body?.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;
}
function mixVolume(){return wantedVolume()*(ducked?DUCK_RATIO:1)}
function stopFade(){if(fadeFrame){cancelAnimationFrame(fadeFrame);fadeFrame=0}}
function fadeTo(target,duration=FADE_MS){
 target=Math.max(0,Math.min(1,target));stopFade();
 const from=audio.volume,start=performance.now(),delta=target-from;
 if(Math.abs(delta)<.002||duration<=0){audio.volume=target;return}
 const step=now=>{const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);audio.volume=Math.max(0,Math.min(1,from+delta*ease));if(t<1)fadeFrame=requestAnimationFrame(step);else fadeFrame=0};
 fadeFrame=requestAnimationFrame(step);
}
function sync(immediate=false){const target=mixVolume();if(immediate){stopFade();audio.volume=target}else fadeTo(target,ducked?DUCK_ATTACK_MS:FADE_MS)}
function releaseDuck(){
 const remaining=duckUntil-performance.now();
 if(remaining>10){duckTimer=setTimeout(releaseDuck,remaining);return}
 duckTimer=0;duckUntil=0;ducked=false;fadeTo(wantedVolume(),DUCK_RELEASE_MS);
}
function duckSoundtrack(ms=DUCK_HOLD_MS){
 const hold=Math.max(180,Number(ms)||DUCK_HOLD_MS),now=performance.now();
 duckUntil=Math.max(duckUntil,now+hold);
 if(duckTimer){clearTimeout(duckTimer);duckTimer=0}
 if(!ducked){ducked=true;fadeTo(wantedVolume()*DUCK_RATIO,DUCK_ATTACK_MS)}
 else if(audio.volume>wantedVolume()*DUCK_RATIO+.004)fadeTo(wantedVolume()*DUCK_RATIO,DUCK_ATTACK_MS);
 duckTimer=setTimeout(releaseDuck,Math.max(20,duckUntil-now));
}
function installSfxDuckHook(){
 const Ctx=window.AudioContext||window.webkitAudioContext,proto=Ctx?.prototype;
 if(!proto||proto.__arduaSoundtrackDuckHook||typeof proto.createOscillator!=='function')return;
 const createOscillator=proto.createOscillator;
 Object.defineProperty(proto,'__arduaSoundtrackDuckHook',{value:true,configurable:false,enumerable:false});
 proto.createOscillator=function(...args){duckSoundtrack(DUCK_HOLD_MS);return createOscillator.apply(this,args)};
}
function installSfxBoostHook(){
 const proto=window.AudioNode?.prototype,GainCtor=window.GainNode,DestCtor=window.AudioDestinationNode;
 if(!proto||!GainCtor||!DestCtor||proto.__arduaSfxBoostHook||typeof proto.connect!=='function')return;
 const nativeConnect=proto.connect;
 Object.defineProperty(proto,'__arduaSfxBoostHook',{value:true,configurable:false,enumerable:false});
 proto.connect=function(destination,...rest){
  if(rest.length===0&&this instanceof GainCtor&&destination instanceof DestCtor&&!this.__arduaSfxBooster){
   try{
    const booster=this.context.createGain();
    booster.__arduaSfxBooster=true;
    booster.gain.value=SFX_GAIN;
    nativeConnect.call(this,booster);
    nativeConnect.call(booster,destination);
    return destination;
   }catch(_e){}
  }
  return nativeConnect.call(this,destination,...rest);
 };
}
function applyStartPosition(force=false){
 if(audio.readyState<1)return false;
 const maxStart=Number.isFinite(audio.duration)&&audio.duration>0?Math.max(0,audio.duration-.25):START_AT;
 const target=Math.min(START_AT,maxStart);
 if(force||!startPositionApplied||audio.currentTime<target-.25){
  try{audio.currentTime=target;startPositionApplied=true}catch(_e){return false}
 }
 return true;
}
function disarmUnlock(){
 if(!unlockArmed)return;unlockArmed=false;
 document.removeEventListener('pointerdown',unlockPlayback,true);
 document.removeEventListener('touchstart',unlockPlayback,true);
 document.removeEventListener('keydown',unlockPlayback,true);
}
function armUnlock(){
 if(unlockArmed)return;unlockArmed=true;
 document.addEventListener('pointerdown',unlockPlayback,{capture:true,passive:true});
 document.addEventListener('touchstart',unlockPlayback,{capture:true,passive:true});
 document.addEventListener('keydown',unlockPlayback,true);
}
function unlockPlayback(){
 applyStartPosition(false);sync(true);
 try{
  const p=audio.play();
  if(p&&typeof p.then==='function')p.then(disarmUnlock).catch(()=>{});
 }catch(_e){}
}
function tryPlay(){
 sync(true);applyStartPosition(false);
 if(!audio.paused&&!audio.ended){disarmUnlock();return}
 try{
  const p=audio.play();
  if(p&&typeof p.then==='function')p.then(disarmUnlock).catch(armUnlock);
 }catch(_e){armUnlock()}
}
function restartLoop(){
 applyStartPosition(true);
 try{const p=audio.play();if(p&&typeof p.catch==='function')p.catch(armUnlock)}catch(_e){armUnlock()}
}
function observeBody(){
 if(observer||!document.body)return;
 observer=new MutationObserver(()=>sync(false));
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}

audio.addEventListener('loadedmetadata',()=>{applyStartPosition(true);tryPlay()});
audio.addEventListener('loadeddata',tryPlay);
audio.addEventListener('canplay',tryPlay);
audio.addEventListener('playing',()=>{disarmUnlock();sync(false)});
audio.addEventListener('ended',restartLoop);
window.addEventListener('pageshow',tryPlay);
window.addEventListener('focus',tryPlay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);tryPlay()}});

installSfxDuckHook();
installSfxBoostHook();
observeBody();
armUnlock();
tryPlay();

window.ARDUA_MUSIC=Object.freeze({audio,mapVolume:MAP_VOLUME,phaseVolume:PHASE_VOLUME,startAt:START_AT,duckRatio:DUCK_RATIO,sfxGain:SFX_GAIN,sync:()=>sync(false),play:tryPlay,duck:duckSoundtrack});
})();
