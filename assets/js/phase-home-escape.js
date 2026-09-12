/* Ardua — independent hard-navigation escape from a phase to the campaign entry. */
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
 home.innerHTML='<span>Início</span><small>Voltar à página inicial da campanha</small>';
 mapBtn.before(home);
 home.addEventListener('click',()=>{
  const url=new URL(window.location.href);url.searchParams.set(HOME_PARAM,'1');url.hash='';window.location.assign(url.href);
 });
 return true;
}
function boot(){
 installButton();
 if(new URLSearchParams(window.location.search).get(HOME_PARAM)==='1')setTimeout(cleanHomeParam,0);
}
boot();
new MutationObserver(()=>installButton()).observe(document.body,{childList:true,subtree:true});
})();
