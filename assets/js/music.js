/* Ardua — continuous background soundtrack, independent from game controls. */
(()=>{
'use strict';
const RAW_SRC='https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a';
const LOCAL_FALLBACK='assets/AaronCopland.m4a';
const MAP_VOLUME=.50;
const PHASE_VOLUME=.15;
const FADE_MS=950;
const audio=new Audio();
let fadeFrame=0;
let fallbackUsed=false;
let observer=null;

audio.preload='auto';
audio.autoplay=true;
audio.loop=true;
audio.playsInline=true;
audio.controls=false;
audio.muted=false;
audio.defaultMuted=false;
audio.volume=MAP_VOLUME;
audio.src=RAW_SRC;

function wantedVolume(){
 const body=document.body;
 if(!body||document.documentElement.classList.contains('ardua-map-boot'))return MAP_VOLUME;
 return body.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;
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
function tryPlay(){
 sync(true);
 if(!audio.paused&&!audio.ended)return;
 try{const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_e){}
}
function observeBody(){
 if(!document.body||observer)return;
 observer=new MutationObserver(()=>sync(false));
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 sync(true);
}
function useLocalFallback(){
 if(fallbackUsed)return;fallbackUsed=true;
 audio.src=LOCAL_FALLBACK;audio.load();tryPlay();
}

audio.addEventListener('loadedmetadata',tryPlay);
audio.addEventListener('loadeddata',tryPlay);
audio.addEventListener('canplay',tryPlay);
audio.addEventListener('error',useLocalFallback);

document.addEventListener('DOMContentLoaded',()=>{observeBody();tryPlay()},{once:true});
window.addEventListener('load',tryPlay,{once:true});
window.addEventListener('pageshow',tryPlay);
window.addEventListener('focus',tryPlay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);tryPlay()}});

audio.load();
tryPlay();

window.ARDUA_MUSIC=Object.freeze({audio,source:RAW_SRC,mapVolume:MAP_VOLUME,phaseVolume:PHASE_VOLUME,sync:()=>sync(false),play:tryPlay});
})();
