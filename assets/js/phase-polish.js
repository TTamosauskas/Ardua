/* Ardua — focused phase UX polish loaded after campaign modules. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);

/* Phase restart is owned by the phase utility menu: it re-enters only the active phase. */

/* Draw attention to the recipe whenever a playable phase is entered. */
const formula=$('formulaText'),phaseTitle=$('phaseTitle'),stellarIntro=$('stellarIntro');
let recipeTimer=0,recipeCleanup=0;
function flashRecipe(){
 recipeTimer=0;
 if(!formula||stellarIntro?.classList.contains('show'))return;
 formula.classList.remove('recipe-intro-flash');
 void formula.offsetWidth;
 formula.classList.add('recipe-intro-flash');
 clearTimeout(recipeCleanup);
 recipeCleanup=setTimeout(()=>formula.classList.remove('recipe-intro-flash'),1500);
}
function scheduleRecipeFlash(delay=150){
 clearTimeout(recipeTimer);
 recipeTimer=setTimeout(flashRecipe,delay);
}
if(phaseTitle)new MutationObserver(()=>scheduleRecipeFlash(180)).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('#phaseMenu .phase-jump'):null;
 if(el)scheduleRecipeFlash(190);
},true);

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
