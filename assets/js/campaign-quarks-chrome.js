/* Ardua — owns the visible phase chrome while the custom Quarks lesson is active. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN;
const GOAL='Forme Prótons e Nêutrons';
const RECIPE_NAME='quark + quark + quark → hádron';
const RECIPE_SYMBOL='junte três particulas';
const NEXT_LABEL='Próxima fase';
const COMPLETE_GOAL='Fase concluída com sucesso';
let active=false,observer=null;

function setText(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value}
function renderRecipe(){
 const el=$('formulaText');if(!el)return;const name=el.querySelector('.recipe-name-line'),symbol=el.querySelector('.recipe-symbol-line');
 if(name?.textContent===RECIPE_NAME&&symbol?.textContent===RECIPE_SYMBOL)return;
 el.innerHTML=`<span class="recipe-name-line">${RECIPE_NAME}</span><span class="recipe-symbol-line">${RECIPE_SYMBOL}</span>`;
}
function ensureProgressVisible(){
 const progress=$('stageProgress')?.closest('.stage-progress');if(!progress)return;
 if(progress.hidden)progress.hidden=false;if(progress.style.visibility!=='visible')progress.style.visibility='visible';if(progress.style.display==='none')progress.style.display='';if(progress.getAttribute('aria-hidden')==='true')progress.removeAttribute('aria-hidden');
}
function setClass(el,name,enabled){if(el&&el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}
function objectiveComplete(){const bar=$('stageProgress'),current=Number(bar?.dataset.current||0),total=Number(bar?.dataset.total||0);return total>0&&current>=total}
function syncDiscoveryGate(hold){
 const modal=$('discoveryUnlockModal');if(!modal)return;
 if(hold){modal.dataset.quarksFinalGate='1';modal.style.opacity='0';modal.style.visibility='hidden';modal.style.pointerEvents='none';return}
 if(modal.dataset.quarksFinalGate==='1'){delete modal.dataset.quarksFinalGate;modal.style.opacity='';modal.style.visibility='';modal.style.pointerEvents=''}
}
function applyQuarksChrome(){
 if(!active)return;
 const complete=objectiveComplete();
 setClass(document.documentElement,'quarks-phase-root',true);
 setClass(document.body,'quarks-phase-active',true);
 setClass(document.body,'prebang',false);
 setClass(document.body,'bigbang-phase',false);
 setText('branchLabel','QUARKS');
 setText('phaseTitle',window.ARDUA_PHASE_LABELS?.canonicalMapTitle?.('quarks','Quarks')||'Quarks');
 setText('goalText',complete?COMPLETE_GOAL:GOAL);
 if(!complete)renderRecipe();
 ensureProgressVisible();
 setText('phaseEndBtn',NEXT_LABEL);
 syncDiscoveryGate(complete&&!!$('phaseEndBtn')?.classList.contains('show'));
}
function startOwnership(){
 active=true;applyQuarksChrome();
 if(observer)return;
 observer=new MutationObserver(applyQuarksChrome);
 for(const id of ['branchLabel','phaseTitle','goalText','formulaText','phaseEndBtn']){
  const el=$(id);if(!el)continue;
  const options={childList:true,subtree:true,characterData:true};
  if(id==='phaseEndBtn'){options.attributes=true;options.attributeFilter=['class']}
  observer.observe(el,options);
 }
 const progress=$('stageProgress')?.closest('.stage-progress');if(progress)observer.observe(progress,{attributes:true,attributeFilter:['style','hidden','aria-hidden']});
 const bar=$('stageProgress');if(bar)observer.observe(bar,{attributes:true,attributeFilter:['style','data-current','data-total']});
 const discovery=$('discoveryUnlockModal');if(discovery)observer.observe(discovery,{attributes:true,attributeFilter:['class']});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}
function stopOwnership(){
 active=false;observer?.disconnect();observer=null;syncDiscoveryGate(false);
 setClass(document.documentElement,'quarks-phase-root',false);
 setClass(document.body,'quarks-phase-active',false);
}

/* The custom phase itself is the authority here. Persist completion even if a stale native
   engine title briefly disagrees with campaign activeId during the final click. */
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null,end=target?.closest('#phaseEndBtn');
 if(!end||!active||!end.classList.contains('show'))return;
 const st=C?.getState?.()||{};
 if(!(st.completed||[]).includes('quarks'))C.markCompleted?.('quarks');
},true);

window.addEventListener('ardua:quarks-phase-start',startOwnership);
window.addEventListener('ardua:quarks-phase-stop',stopOwnership);
if(window.ARDUA_QUARKS?.isActive?.())startOwnership();
})();