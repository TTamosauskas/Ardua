/* Ardua — owns the visible phase chrome while the custom Quarks lesson is active. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const GOAL='Forje os primeiros bárions';
const FORMULA='3 quarks → 1 próton ou nêutron';
const NEXT_LABEL='Próxima fase';
let active=false,observer=null;

function setText(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value}
function setClass(el,name,enabled){if(el&&el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}
function applyQuarksChrome(){
 if(!active)return;
 setClass(document.documentElement,'quarks-phase-root',true);
 setClass(document.body,'quarks-phase-active',true);
 setClass(document.body,'prebang',false);
 setClass(document.body,'bigbang-phase',false);
 setText('branchLabel','Universo primordial');
 setText('phaseTitle','Quarks');
 setText('goalText',GOAL);
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

window.addEventListener('ardua:quarks-phase-start',startOwnership);
window.addEventListener('ardua:quarks-phase-stop',stopOwnership);
if(window.ARDUA_QUARKS?.isActive?.())startOwnership();
})();
