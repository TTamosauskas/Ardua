/* Ardua — continuous background soundtrack. */
(()=>{
'use strict';
const audio=document.getElementById('arduaSoundtrack');
if(!audio)return;

const MAP_VOLUME=.50;
const PHASE_VOLUME=.15;
const FADE_MS=950;
let fadeFrame=0;
let started=false;
let targetVolume=document.body.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;

audio.loop=true;
audio.preload='auto';
audio.volume=targetVolume;

function stopFade(){
 if(fadeFrame){cancelAnimationFrame(fadeFrame);fadeFrame=0}
}
function fadeTo(target,duration=FADE_MS){
 targetVolume=Math.max(0,Math.min(1,target));
 stopFade();
 const from=audio.volume,start=performance.now(),delta=targetVolume-from;
 if(Math.abs(delta)<.002||duration<=0){audio.volume=targetVolume;return}
 const step=now=>{
  const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);
  audio.volume=Math.max(0,Math.min(1,from+delta*ease));
  if(t<1)fadeFrame=requestAnimationFrame(step);else fadeFrame=0;
 };
 fadeFrame=requestAnimationFrame(step);
}
function contextualVolume(immediate=false){
 const target=document.body.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;
 if(immediate){stopFade();targetVolume=target;audio.volume=target}else fadeTo(target);
}
function removeUnlockListeners(){
 document.removeEventListener('pointerdown',unlockFromGesture,true);
 document.removeEventListener('touchend',unlockFromGesture,true);
 document.removeEventListener('keydown',unlockFromGesture,true);
}
function markStarted(){
 started=true;removeUnlockListeners();contextualVolume(false);
}
function tryPlay(){
 if(started&&!audio.paused)return;
 const attempt=audio.play();
 if(attempt&&typeof attempt.then==='function')attempt.then(markStarted).catch(()=>{});
 else if(!audio.paused)markStarted();
}
function unlockFromGesture(){tryPlay()}
function armPlayback(){
 document.addEventListener('pointerdown',unlockFromGesture,true);
 document.addEventListener('touchend',unlockFromGesture,true);
 document.addEventListener('keydown',unlockFromGesture,true);
}

new MutationObserver(contextualVolume).observe(document.body,{attributes:true,attributeFilter:['class']});

document.addEventListener('visibilitychange',()=>{
 if(document.hidden){stopFade();return}
 contextualVolume(true);if(started)tryPlay();
});

audio.addEventListener('ended',()=>{audio.currentTime=0;tryPlay()});
audio.addEventListener('canplay',()=>{if(started)contextualVolume(true)},{once:true});

armPlayback();
tryPlay();

window.ARDUA_MUSIC=Object.freeze({
 audio,
 mapVolume:MAP_VOLUME,
 phaseVolume:PHASE_VOLUME,
 sync:()=>contextualVolume(false)
});
})();
