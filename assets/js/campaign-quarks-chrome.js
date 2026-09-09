/* Ardua — owns the visible phase chrome while the custom Quarks lesson is active. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const GOAL='Forje os primeiros bárions';
const FORMULA='3 quarks → 1 próton ou nêutron';
let active=false,observer=null;

function setText(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value}
function applyQuarksChrome(){
 if(!active)return;
 document.documentElement.classList.add('quarks-phase-root');
 document.body.classList.add('quarks-phase-active');
 document.body.classList.remove('prebang','bigbang-phase');
 setText('branchLabel','Universo primordial');
 setText('phaseTitle','Quarks');
 setText('goalText',GOAL);
 setText('formulaText',FORMULA);
}
function startOwnership(){
 active=true;applyQuarksChrome();
 if(observer)return;
 observer=new MutationObserver(applyQuarksChrome);
 for(const id of ['branchLabel','phaseTitle','goalText','formulaText']){
  const el=$(id);if(el)observer.observe(el,{childList:true,subtree:true,characterData:true});
 }
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}
function stopOwnership(){
 active=false;observer?.disconnect();observer=null;
 document.documentElement.classList.remove('quarks-phase-root');
}

window.addEventListener('ardua:quarks-phase-start',startOwnership);
window.addEventListener('ardua:quarks-phase-stop',stopOwnership);
if(window.ARDUA_QUARKS?.isActive?.())startOwnership();
})();
