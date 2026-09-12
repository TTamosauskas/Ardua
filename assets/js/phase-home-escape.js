/* Ardua — independent hard-navigation escape from a phase to the campaign map. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const HOME_PARAM='arduaHome';

function cleanHomeParam(){
 const url=new URL(window.location.href);if(!url.searchParams.has(HOME_PARAM))return;
 url.searchParams.delete(HOME_PARAM);history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
}
function installButton(){
 const mapBtn=$('phaseQuickMap');if(!mapBtn||$('phaseQuickHome'))return false;
 const home=document.createElement('button');home.type='button';home.id='phaseQuickHome';
 home.innerHTML='<span>Início</span><small>Voltar ao mapa de fases</small>';
 mapBtn.before(home);
 home.addEventListener('click',()=>{
  const url=new URL(window.location.href);url.searchParams.set(HOME_PARAM,'1');url.hash='';window.location.assign(url.href);
 });
 return true;
}
function openPhaseMapAfterReload(){
 let attempts=0;
 const open=()=>{
  attempts++;
  const trigger=$('menuOpenBtn'),map=$('campaignMap');
  if((!trigger||!map||!window.ARDUA_CAMPAIGN)&&attempts<30){setTimeout(open,50);return}
  if(!trigger||!map){cleanHomeParam();return}
  // campaign-map.js owns refresh, branch expansion, required state and current-phase scroll.
  // This synthetic click bypasses the quick-menu trusted-click handler and reaches the
  // canonical map opener after the normal boot timer has completed.
  trigger.click();
  setTimeout(cleanHomeParam,0);
 };
 setTimeout(open,0);
}
function boot(){
 const requested=new URLSearchParams(window.location.search).get(HOME_PARAM)==='1';
 installButton();
 if(requested)openPhaseMapAfterReload();
}
boot();
new MutationObserver(()=>installButton()).observe(document.body,{childList:true,subtree:true});
})();
