/* Ardua — focused phase UX polish loaded after campaign modules. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);

/* Phase restart is owned by the phase utility menu: it re-enters only the active phase. */

/* A nucleus waiting for beta decay is rendered by the engine with an asterisk in its symbol. Keep that physical waiting state visibly trembling until the beta transition resolves. */
const pieces=$('pieces');
function syncBetaWaitingVisuals(){
 pieces?.querySelectorAll('.atom').forEach(atom=>{
  const symbol=atom.querySelector('.sym')?.textContent?.trim()||'';
  atom.classList.toggle('beta-waiting',symbol.endsWith('*'));
 });
}
if(pieces){
 new MutationObserver(syncBetaWaitingVisuals).observe(pieces,{subtree:true,childList:true,characterData:true});
 syncBetaWaitingVisuals();
}

/* The generic completion milestone duplicates the phase-end feedback and blocks the
   campaign rhythm. Suppress every occurrence before the browser paints it, while
   leaving scientific discoveries and other milestone banners untouched. */
const ambient=$('ambientBanner'),ambientKicker=$('ambientKicker'),ambientTitle=$('ambientTitle'),ambientContinue=$('ambientContinueBtn');
function suppressGenericPhaseComplete(){
 if(!ambient||!ambientTitle)return;
 const title=(ambientTitle.textContent||'').trim().toUpperCase(),kicker=(ambientKicker?.textContent||'').trim().toUpperCase();
 if(title!=='PROCESSO COMPLETO'||kicker!=='MARCO')return;
 if(ambient.classList.contains('show'))ambient.classList.remove('show');
 if(ambient.classList.contains('awaiting-continue'))ambient.classList.remove('awaiting-continue');
 if(ambient.dataset.priority!=='0')ambient.dataset.priority='0';
 if(ambientContinue&&!ambientContinue.hidden)ambientContinue.hidden=true;
}
if(ambient){
 new MutationObserver(suppressGenericPhaseComplete).observe(ambient,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});
 suppressGenericPhaseComplete();
}

/* Discoveries uses a persistent top-right close control and keeps the legacy close action as its behavior bridge. */
const modal=$('menuModal'),card=modal?.querySelector('.card'),legacyClose=$('closeMenu');
if(modal&&card&&legacyClose){
 let closeX=$('discoveriesCloseX');
 if(!closeX){
  closeX=document.createElement('button');
  closeX.type='button';
  closeX.id='discoveriesCloseX';
  closeX.className='discoveries-close-x';
  closeX.setAttribute('aria-label','Fechar Descobertas');
  closeX.textContent='×';
  closeX.hidden=true;
  card.prepend(closeX);
 }
 const syncDiscoveriesChrome=()=>{
  const active=modal.classList.contains('discoveries-view');
  closeX.hidden=!active;
  legacyClose.hidden=active;
 };
 closeX.addEventListener('click',()=>legacyClose.click());
 new MutationObserver(syncDiscoveriesChrome).observe(modal,{attributes:true,attributeFilter:['class']});
 syncDiscoveriesChrome();
}
})();
