/* Ardua — independent hard-navigation escape from a phase to the campaign home. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const HOME_PARAM='arduaHome';

function hideSurface(id){
 const el=$(id);if(!el)return;
 el.classList.remove('show','leaving');el.setAttribute('aria-hidden','true');
}
function openCampaignHome(){
 const map=$('campaignMap');if(!map)return false;
 ['phaseQuickMenu','menuModal','campaignVictoryReward','campaignPhasePreview','stellarIntro','discoveryUnlockModal','eventTooltip'].forEach(hideSurface);
 $('menuOpenBtn')?.setAttribute('aria-expanded','false');
 document.body.classList.remove('victory-reward-open');
 map.classList.add('show','trail-revealed');map.setAttribute('aria-hidden','false');document.body.classList.add('campaign-map-open');
 const trail=$('campaignTrail');if(trail)trail.setAttribute('aria-hidden','false');
 const close=$('campaignClose');if(close){close.disabled=false;close.textContent='Voltar'}
 $('mapDetail')?.classList.remove('show');
 requestAnimationFrame(()=>{window.ARDUA_SURFACE_COORDINATOR?.sync?.();window.dispatchEvent(new Event('resize'))});
 setTimeout(()=>window.dispatchEvent(new Event('resize')),90);
 return true;
}
function cleanHomeParam(){
 const url=new URL(window.location.href);if(!url.searchParams.has(HOME_PARAM))return;
 url.searchParams.delete(HOME_PARAM);history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
}
function installButton(){
 const mapBtn=$('phaseQuickMap');if(!mapBtn||$('phaseQuickHome'))return false;
 const home=document.createElement('button');home.type='button';home.id='phaseQuickHome';
 home.innerHTML='<span>Início</span><small>Voltar à página inicial da campanha</small>';
 mapBtn.before(home);
 home.addEventListener('click',()=>{
  const url=new URL(window.location.href);url.searchParams.set(HOME_PARAM,'1');url.hash='';window.location.assign(url.href);
 });
 return true;
}
function boot(){
 installButton();
 if(new URLSearchParams(window.location.search).get(HOME_PARAM)!=='1')return;
 if(openCampaignHome())cleanHomeParam();
}
boot();
new MutationObserver(()=>installButton()).observe(document.body,{childList:true,subtree:true});
})();
