/* Ardua — discoveries panel bridge for the campaign map. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const dataBtn=$('campaignData'),closeBtn=$('campaignClose'),modal=$('menuModal'),closeMenu=$('closeMenu');
if(!dataBtn||!closeBtn||!modal)return;
const heading=modal.querySelector('.card > h2'),mode=$('phaseMenuMode'),hint=$('phaseMenuHint'),phaseMenu=$('phaseMenu');
const firstSeparator=phaseMenu?.nextElementSibling?.classList?.contains('menu-sep')?phaseMenu.nextElementSibling:null;

function keepMapLabels(){
 dataBtn.textContent='Descobertas';
 dataBtn.setAttribute('aria-label','Abrir descobertas');
 if(closeBtn.textContent!=='Voltar')closeBtn.textContent='Voltar';
}
function setPhaseChromeHidden(hidden){
 for(const el of [mode,hint,phaseMenu,firstSeparator])if(el)el.hidden=hidden;
}
function openDiscoveries(){
 modal.classList.add('discoveries-view','show');
 modal.setAttribute('aria-label','Descobertas');
 if(heading)heading.textContent='Descobertas';
 setPhaseChromeHidden(true);
 $('mapDetail')?.classList.remove('show');
 requestAnimationFrame(()=>modal.querySelector('.menu-section h3')?.scrollIntoView({block:'start'}));
}
function leaveDiscoveriesView(){
 modal.classList.remove('discoveries-view');
 modal.removeAttribute('aria-label');
 if(heading)heading.textContent='Fases';
 setPhaseChromeHidden(false);
}

keepMapLabels();
new MutationObserver(keepMapLabels).observe(closeBtn,{childList:true,subtree:true});
dataBtn.addEventListener('click',()=>requestAnimationFrame(openDiscoveries));
closeMenu?.addEventListener('click',()=>setTimeout(leaveDiscoveriesView,0));
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&modal.classList.contains('discoveries-view')){
  modal.classList.remove('show');
  leaveDiscoveriesView();
 }
});
})();
