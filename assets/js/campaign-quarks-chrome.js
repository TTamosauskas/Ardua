/* Ardua — owns the visible phase chrome while the custom Quarks lesson is active. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN;
const GOAL='Forme Prótons e Nêutrons';
const FORMULA='3 quarks → 1 próton ou nêutron';
const NEXT_LABEL='Próxima fase';
let active=false,observer=null;

function setText(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value}
function setClass(el,name,enabled){if(el&&el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}
function goalWithProgress(){const progress=$('goalText')?.textContent?.match(/\b\d+\/2\b/)?.[0]||'0/2';return`${GOAL} — ${progress}`}
function applyQuarksChrome(){
 if(!active)return;
 const goal=goalWithProgress();
 setClass(document.documentElement,'quarks-phase-root',true);
 setClass(document.body,'quarks-phase-active',true);
 setClass(document.body,'prebang',false);
 setClass(document.body,'bigbang-phase',false);
 setText('branchLabel','QUARKS');
 setText('phaseTitle',goal);
 setText('goalText',goal);
 setText('formulaText',FORMULA);
 setText('phaseEndBtn',NEXT_LABEL);
}
function startOwnership(){
 active=true;applyQuarksChrome();
 if(observer)return;
 observer=new MutationObserver(applyQuarksChrome);
 for(const id of ['branchLabel','phaseTitle','goalText','formulaText','phaseEndBtn']){
  const el=$(id);if(el)observer.observe(el,{childList:true,subtree:true,characterData:true});
 }
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}
function stopOwnership(){
 active=false;observer?.disconnect();observer=null;
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