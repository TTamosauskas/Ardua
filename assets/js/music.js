/* Ardua — continuous background soundtrack. */
(()=>{
'use strict';
const audio=document.getElementById('arduaSoundtrack');
if(!audio)return;

const RAW_SRC='https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a';
const LOCAL_FALLBACK='assets/AaronCopland.m4a';
const MAP_VOLUME=.50;
const PHASE_VOLUME=.15;
const FADE_MS=950;
let fadeFrame=0;
let started=false;
let fallbackUsed=false;
let playQueued=false;
let targetVolume=document.body.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;

audio.loop=true;
audio.preload='auto';
audio.playsInline=true;
audio.volume=targetVolume;
if(audio.getAttribute('src')!==RAW_SRC){audio.src=RAW_SRC;audio.load()}

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
 document.removeEventListener('touchstart',unlockFromGesture,true);
 document.removeEventListener('keydown',unlockFromGesture,true);
 document.removeEventListener('click',unlockFromGesture,true);
}
function markStarted(){
 started=true;playQueued=false;removeUnlockListeners();contextualVolume(false);
}
function tryPlay(){
 playQueued=false;
 if(started&&!audio.paused)return;
 const attempt=audio.play();
 if(attempt&&typeof attempt.then==='function')attempt.then(markStarted).catch(()=>{});
 else if(!audio.paused)markStarted();
}
function queuePlay(){
 if(playQueued)return;playQueued=true;
 // Executa logo depois do gesto atual. Assim o áudio deixa o botão COMEÇAR concluir
 // sua própria interação antes da tentativa de reprodução em mobile.
 queueMicrotask(tryPlay);
}
function unlockFromGesture(){queuePlay()}
function armPlayback(){
 document.addEventListener('pointerdown',unlockFromGesture,true);
 document.addEventListener('touchstart',unlockFromGesture,{capture:true,passive:true});
 document.addEventListener('keydown',unlockFromGesture,true);
 document.addEventListener('click',unlockFromGesture,true);
}

new MutationObserver(contextualVolume).observe(document.body,{attributes:true,attributeFilter:['class']});

document.addEventListener('visibilitychange',()=>{
 if(document.hidden){stopFade();return}
 contextualVolume(true);if(started)queuePlay();
});

audio.addEventListener('error',()=>{
 if(fallbackUsed)return;
 fallbackUsed=true;started=false;audio.src=LOCAL_FALLBACK;audio.load();queuePlay();
});
audio.addEventListener('ended',()=>{audio.currentTime=0;queuePlay()});
audio.addEventListener('canplay',()=>{contextualVolume(true);if(!started)queuePlay()});

armPlayback();
queuePlay();

window.ARDUA_MUSIC=Object.freeze({
 audio,
 source:RAW_SRC,
 mapVolume:MAP_VOLUME,
 phaseVolume:PHASE_VOLUME,
 sync:()=>contextualVolume(false),
 play:queuePlay
});
})();
