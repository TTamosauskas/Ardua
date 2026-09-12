/* Ardua — owns the visible phase chrome while the custom Quarks lesson is active. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN;
const GOAL='Forme Prótons e Nêutrons';
const FORMULA='3 quarks → 1 próton ou nêutron';
const NEXT_LABEL='Próxima fase';
const AUTO_COMPLETE_DELAY=260;
let active=false,observer=null,completionArmed=false,completionTimer=0,endChrome=null;

function setText(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value}
function setClass(el,name,enabled){if(el&&el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}
function goalWithProgress(){const progress=$('goalText')?.textContent?.match(/\b\d+\/2\b/)?.[0]||'0/2';return`${GOAL} — ${progress}`}
function objectiveComplete(){return /\b2\s*\/\s*2\b/.test($('goalText')?.textContent||'')}
function restoreCompletionChrome(){
 clearTimeout(completionTimer);completionTimer=0;completionArmed=false;
 const end=$('phaseEndBtn');
 if(end&&endChrome){
  end.style.visibility=endChrome.visibility;end.style.pointerEvents=endChrome.pointerEvents;
  if(endChrome.hadAriaHidden)end.setAttribute('aria-hidden',endChrome.ariaHidden||'true');else end.removeAttribute('aria-hidden');
 }
 endChrome=null;$('discoveryUnlockModal')?.classList.remove('quarks-completion-handoff');
}
function armAutomaticCompletion(){
 const end=$('phaseEndBtn');if(!active||completionArmed||!end?.classList.contains('show')||!objectiveComplete())return;
 completionArmed=true;endChrome={visibility:end.style.visibility,pointerEvents:end.style.pointerEvents,hadAriaHidden:end.hasAttribute('aria-hidden'),ariaHidden:end.getAttribute('aria-hidden')};
 /* The legacy round button stays as an internal completion hook for the P0 contract,
    but it must never become a second player-facing CTA beside discovery/reward UI. */
 end.style.visibility='hidden';end.style.pointerEvents='none';end.setAttribute('aria-hidden','true');
 const reward=window.ARDUA_VICTORY_REWARD;
 if(!(reward?.pending||reward?.active))window.dispatchEvent(new CustomEvent('ardua:phase-completion-intent',{detail:{phaseId:'quarks',source:'quarks-objective-complete',at:performance.now()}}));
 /* Quarks grants its discoveries just before the old button is shown. Nudging the modal
    after the completion intent lets P1 absorb the already-open first discovery before paint. */
 const modal=$('discoveryUnlockModal');if(modal?.classList.contains('show'))modal.classList.add('quarks-completion-handoff');
 completionTimer=setTimeout(()=>{
  completionTimer=0;if(active&&end.isConnected&&end.classList.contains('show'))end.click();
 },AUTO_COMPLETE_DELAY);
}
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
 armAutomaticCompletion();
}
function startOwnership(){
 restoreCompletionChrome();active=true;applyQuarksChrome();
 if(observer)return;
 observer=new MutationObserver(applyQuarksChrome);
 for(const id of ['branchLabel','phaseTitle','goalText','formulaText','phaseEndBtn']){
  const el=$(id);if(!el)continue;
  const options={childList:true,subtree:true,characterData:true};
  if(id==='phaseEndBtn'){options.attributes=true;options.attributeFilter=['class']}
  observer.observe(el,options);
 }
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
}
function stopOwnership(){
 restoreCompletionChrome();active=false;observer?.disconnect();observer=null;
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