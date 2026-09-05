/* Ardua — reliable mobile start input for the Convecção Estelar intro. */
(()=>{
'use strict';
const intro=document.getElementById('stellarIntro');
const button=document.getElementById('stellarStartBtn');
const C=window.ARDUA_CAMPAIGN;
if(!intro||!button||!C)return;

button.style.touchAction='manipulation';
button.style.position='relative';
button.style.zIndex='4';

let lastActivation=0;
function activeConvectionIntro(){
 return intro.classList.contains('show')&&C.getState?.().activeId==='stellar_convection';
}
function pointInsideButton(ev){
 const p=ev.touches?.[0]||ev.changedTouches?.[0]||ev;
 if(!Number.isFinite(p?.clientX)||!Number.isFinite(p?.clientY))return false;
 const r=button.getBoundingClientRect();
 return p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom;
}
function activate(ev){
 if(!activeConvectionIntro()||!pointInsideButton(ev))return;
 const now=performance.now();if(now-lastActivation<700)return;lastActivation=now;
 ev.preventDefault();ev.stopImmediatePropagation();
 button.click();
}

intro.addEventListener('pointerdown',activate,true);
intro.addEventListener('touchstart',activate,{capture:true,passive:false});
})();
