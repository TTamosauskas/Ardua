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
function releaseSessionOpening(){
 const map=$('campaignMap'),trail=$('campaignTrail');if(!map||!trail)return;
 document.documentElement.classList.remove('ardua-awaiting-bigbang');
 map.classList.remove('awaiting-bigbang','bigbang-expanding','bigbang-revealing');
 map.classList.add('bigbang-complete','trail-revealed');
 trail.setAttribute('aria-hidden','false');
 const oldRoot=map.querySelector('.singularity-map');
 if(oldRoot&&!oldRoot.dataset.arduaHomeReleased){
  // campaign-opening owns a direct capture listener that replays the session Big Bang.
  // Clone only on this explicit escape load so the map's delegated canonical handler remains.
  const root=oldRoot.cloneNode(true);root.dataset.arduaHomeReleased='1';root.setAttribute('aria-label','Big Bang');oldRoot.replaceWith(root);
 }
 const prompt=map.querySelector('.bigbang-start-prompt');prompt?.remove();
 const label=map.querySelector('.singularity-map-label');if(label)label.hidden=false;
}
function visibleCurrentPhase(){
 const active=window.ARDUA_CAMPAIGN?.getState?.().activeId;
 if(!active||active==='bigbang')return null;
 return [...document.querySelectorAll(`#campaignMap .phase-node.current[data-phase="${active}"]`)].find(el=>el.getClientRects().length>0)||null;
}
function phaseMapReady(){
 const map=$('campaignMap'),trail=$('campaignTrail');
 return !!map&&map.classList.contains('show')&&!map.classList.contains('awaiting-bigbang')&&map.classList.contains('trail-revealed')&&trail?.getAttribute('aria-hidden')==='false'&&!!visibleCurrentPhase();
}
function openPhaseMapAfterReload(){
 let attempts=0;
 const open=()=>{
  attempts++;
  const trigger=$('menuOpenBtn'),map=$('campaignMap');
  if((!trigger||!map||!window.ARDUA_CAMPAIGN)&&attempts<40){setTimeout(open,50);return}
  if(!trigger||!map){cleanHomeParam();return}
  releaseSessionOpening();
  // campaign-map.js owns refresh, branch expansion and required state. Synthetic clicks
  // bypass the quick-menu trusted-click interception and reach the canonical map opener.
  trigger.click();
  releaseSessionOpening();
  window.dispatchEvent(new Event('resize'));
  setTimeout(()=>{
   releaseSessionOpening();
   const current=visibleCurrentPhase();
   if(phaseMapReady()){
    current?.scrollIntoView({block:'center',behavior:'auto'});
    cleanHomeParam();
    return;
   }
   if(attempts<30){setTimeout(open,70);return}
   cleanHomeParam();
  },100);
 };
 // campaign-opening schedules its session ritual at 0ms earlier in script order; run after it.
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
