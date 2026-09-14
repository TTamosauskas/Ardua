/* Ardua 2.5D — presentation-only depth controller. */
(()=>{
'use strict';

const body=document.body;
const shell=document.querySelector('.star-shell');
if(!body||!shell)return;

body.classList.add('ardua-25d');

const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let raf=0;
let targetX=3.2;
let targetY=-3.8;

function defaults(){
  if(window.matchMedia('(max-width: 620px)').matches){
    targetX=2.4;
    targetY=-2.6;
  }else{
    targetX=3.2;
    targetY=-3.8;
  }
}

function commitTilt(){
  raf=0;
  shell.style.setProperty('--ardua-tilt-x',`${targetX.toFixed(2)}deg`);
  shell.style.setProperty('--ardua-tilt-y',`${targetY.toFixed(2)}deg`);
}

function scheduleTilt(){
  if(!raf)raf=requestAnimationFrame(commitTilt);
}

function onPointerMove(event){
  if(!finePointer.matches||reducedMotion.matches)return;
  const rect=shell.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const nx=Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width-.5)*2));
  const ny=Math.max(-1,Math.min(1,((event.clientY-rect.top)/rect.height-.5)*2));
  targetX=3.0-ny*3.2;
  targetY=-3.0+nx*4.2;
  scheduleTilt();
}

function resetTilt(){
  defaults();
  scheduleTilt();
}

shell.addEventListener('pointermove',onPointerMove,{passive:true});
shell.addEventListener('pointerleave',resetTilt,{passive:true});
window.addEventListener('blur',resetTilt,{passive:true});
window.addEventListener('resize',resetTilt,{passive:true});

/* Keep the variant identifiable for screenshots/debugging without touching gameplay state. */
document.documentElement.dataset.arduaView='2.5d';

resetTilt();
})();
