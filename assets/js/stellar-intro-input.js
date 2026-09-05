/* Ardua — reliable mobile input for every stellar phase intro. */
(()=>{
'use strict';
const intro=document.getElementById('stellarIntro');
const button=document.getElementById('stellarStartBtn');
if(!intro||!button)return;

button.style.touchAction='manipulation';
button.style.position='relative';
button.style.zIndex='12';
button.style.pointerEvents='auto';

let lastActivation=0;
function activate(ev){
 if(!intro.classList.contains('show'))return;
 if(ev.pointerType==='mouse'&&Number.isFinite(ev.button)&&ev.button!==0)return;
 const now=performance.now();if(now-lastActivation<500)return;lastActivation=now;
 ev.preventDefault();ev.stopImmediatePropagation();
 // O engine já liga o click deste botão a closeStellarPopup().
 // Disparar aqui, no pointerdown, evita depender do pointerup/click sintetizado pelo Chrome mobile.
 button.click();
}

button.addEventListener('pointerdown',activate,true);
if(!window.PointerEvent)button.addEventListener('touchstart',activate,{capture:true,passive:false});
})();
