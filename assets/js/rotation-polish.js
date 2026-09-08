/* Ardua — optional orbital rotation for playable atom fields. */
(()=>{
'use strict';
const KEY='arduaRotationEnabledV1';
const SPEED=.00028; // rad/ms: same order of magnitude as stellar-formation cluster rotation.
let enabled=true,angle=0,last=performance.now(),lastFormation=false;

function readPreference(){
 try{return localStorage.getItem(KEY)!=='0'}catch(_e){return true}
}
function persistPreference(value){try{localStorage.setItem(KEY,value?'1':'0')}catch(_e){}}
enabled=readPreference();

function buttons(){return [...document.querySelectorAll('#phaseQuickRotation,#campaignHomeRotation')]}
function syncButtons(){
 for(const button of buttons()){
  const label=button.querySelector('span')||button;
  label.textContent=enabled?'Desligar Rotação':'Ligar Rotação';
  button.setAttribute('aria-pressed',enabled?'true':'false');
  button.setAttribute('aria-label',enabled?'Desligar Rotação':'Ligar Rotação');
 }
}
function resetAtomOffsets(){
 document.querySelectorAll('#pieces .atom').forEach(atom=>{
  atom.style.removeProperty('translate');
  atom.style.removeProperty('will-change');
 });
}
function setEnabled(value,{persist=true}={}){
 const next=!!value;
 if(enabled===next){syncButtons();return enabled}
 enabled=next;
 if(persist)persistPreference(enabled);
 angle=0;last=performance.now();
 if(!enabled)resetAtomOffsets();
 syncButtons();
 window.dispatchEvent(new CustomEvent('ardua:rotation-change',{detail:{enabled}}));
 return enabled;
}
function toggle(){return setEnabled(!enabled)}
window.ARDUA_ROTATION=Object.freeze({enabled:()=>enabled,setEnabled,toggle,key:KEY});

function makeMenuButton(id){
 const button=document.createElement('button');
 button.type='button';button.id=id;
 button.innerHTML='<span></span>';
 button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle()});
 return button;
}
function attachMenuButtons(){
 const phaseActions=document.querySelector('#phaseQuickMenu .phase-quick-actions');
 if(phaseActions&&!document.getElementById('phaseQuickRotation')){
  const button=makeMenuButton('phaseQuickRotation');
  const sound=document.getElementById('phaseQuickSound');
  phaseActions.insertBefore(button,sound||null);
 }
 const homeActions=document.querySelector('#campaignHomeMenu .campaign-home-menu-actions');
 if(homeActions&&!document.getElementById('campaignHomeRotation')){
  const button=makeMenuButton('campaignHomeRotation');
  const sound=document.getElementById('campaignHomeSound');
  homeActions.insertBefore(button,sound||null);
 }
 syncButtons();
}

function rotateNormalAtoms(now){
 const board=document.getElementById('starBoard'),pieces=document.getElementById('pieces');
 if(!board||!pieces)return;
 const formation=board.classList.contains('stellar-formation-mode')||!!board.querySelector('.stellar-formation-layer');
 if(formation!==lastFormation){angle=0;last=now;resetAtomOffsets();lastFormation=formation}
 if(!enabled||formation){if(!enabled)resetAtomOffsets();return}
 const dt=Math.min(40,Math.max(0,now-last));last=now;angle=(angle+dt*SPEED)%(Math.PI*2);
 const cx=board.clientWidth/2,cy=board.clientHeight/2,ca=Math.cos(angle),sa=Math.sin(angle);
 for(const atom of pieces.querySelectorAll('.atom')){
  const x=Number.parseFloat(atom.style.left),y=Number.parseFloat(atom.style.top);
  if(!Number.isFinite(x)||!Number.isFinite(y))continue;
  const dx=x-cx,dy=y-cy;
  // The piece stays upright: only its center is translated to the rotated orbit position.
  const rx=cx+dx*ca-dy*sa,ry=cy+dx*sa+dy*ca;
  atom.style.translate=`${(rx-x).toFixed(3)}px ${(ry-y).toFixed(3)}px`;
  atom.style.willChange='translate';
 }
}
function frame(now){rotateNormalAtoms(now);requestAnimationFrame(frame)}

attachMenuButtons();
new MutationObserver(attachMenuButtons).observe(document.body,{subtree:true,childList:true});
window.addEventListener('storage',e=>{if(e.key===KEY){enabled=readPreference();angle=0;last=performance.now();if(!enabled)resetAtomOffsets();syncButtons()}});
window.addEventListener('ardua:phase-enter',()=>{angle=0;last=performance.now();resetAtomOffsets()});
requestAnimationFrame(frame);
})();
