/* Ardua — continuous background soundtrack, independent from game controls. */
(()=>{
'use strict';
const audio=document.getElementById('arduaSoundtrack');
if(!audio)return;
const MAP_VOLUME=.50;
const PHASE_VOLUME=.15;
const FADE_MS=950;
const START_AT=22;
let fadeFrame=0;
let observer=null;
let startPositionApplied=false;

audio.loop=false;
audio.preload='auto';
audio.playsInline=true;
audio.controls=false;
audio.volume=MAP_VOLUME;

function wantedVolume(){
 const body=document.body,map=document.getElementById('campaignMap');
 return !map||body?.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;
}
function stopFade(){if(fadeFrame){cancelAnimationFrame(fadeFrame);fadeFrame=0}}
function fadeTo(target,duration=FADE_MS){
 target=Math.max(0,Math.min(1,target));stopFade();
 const from=audio.volume,start=performance.now(),delta=target-from;
 if(Math.abs(delta)<.002||duration<=0){audio.volume=target;return}
 const step=now=>{const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);audio.volume=Math.max(0,Math.min(1,from+delta*ease));if(t<1)fadeFrame=requestAnimationFrame(step);else fadeFrame=0};
 fadeFrame=requestAnimationFrame(step);
}
function sync(immediate=false){const target=wantedVolume();if(immediate){stopFade();audio.volume=target}else fadeTo(target)}
function applyStartPosition(force=false){
 if(audio.readyState<1)return false;
 const maxStart=Number.isFinite(audio.duration)&&audio.duration>0?Math.max(0,audio.duration-.25):START_AT;
 const target=Math.min(START_AT,maxStart);
 if(force||!startPositionApplied||audio.currentTime<target-.25){
  try{audio.currentTime=target;startPositionApplied=true}catch(_e){return false}
 }
 return true;
}
function tryPlay(){
 sync(true);applyStartPosition(false);
 if(!audio.paused&&!audio.ended)return;
 try{const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_e){}
}
function restartLoop(){
 applyStartPosition(true);
 try{const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_e){}
}
function observeBody(){
 if(observer||!document.body)return;
 observer=new MutationObserver(()=>sync(false));
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}

audio.addEventListener('loadedmetadata',()=>{applyStartPosition(true);tryPlay()});
audio.addEventListener('loadeddata',tryPlay);
audio.addEventListener('canplay',tryPlay);
audio.addEventListener('playing',()=>sync(false));
audio.addEventListener('ended',restartLoop);
window.addEventListener('pageshow',tryPlay);
window.addEventListener('focus',tryPlay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);tryPlay()}});

observeBody();
tryPlay();

window.ARDUA_MUSIC=Object.freeze({audio,mapVolume:MAP_VOLUME,phaseVolume:PHASE_VOLUME,startAt:START_AT,sync:()=>sync(false),play:tryPlay});
})();
