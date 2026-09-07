/* Ardua — optional forge challenge shown during beta-decay waiting windows. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const objective=$('objective');
if(!objective)return;

let hideTimer=0;
const state={active:false,target:'',targetName:'',required:0,progress:0};

const hud=document.createElement('div');
hud.id='betaBonusHud';
hud.className='beta-bonus-hud';
hud.hidden=true;
objective.appendChild(hud);

const modal=document.createElement('div');
modal.id='betaBonusModal';
modal.className='beta-bonus-modal';
modal.setAttribute('aria-hidden','true');
modal.innerHTML=`<div class="beta-bonus-backdrop" data-beta-bonus-close></div>
<section class="beta-bonus-card" role="dialog" aria-modal="true" aria-labelledby="betaBonusTitle">
  <div class="beta-bonus-kicker">OBJETIVO BÔNUS</div>
  <h2 id="betaBonusTitle">Enquanto o núcleo decai...</h2>
  <p id="betaBonusTask"></p>
  <button type="button" id="betaBonusContinue">CONTINUAR</button>
</section>`;
document.body.appendChild(modal);

function targetLabel(){return state.targetName||state.target||'átomo'}
function countLabel(n){return `${n} ${n===1?'átomo':'átomos'}`}
function renderHud(){
 if(!state.active){hud.hidden=true;return}
 hud.hidden=false;
 hud.innerHTML=`<strong>Enquanto o núcleo decai...</strong><span>${targetLabel()} · ${state.progress}/${state.required}</span>`;
}
function closeModal(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
function openModal(){
 const task=$('betaBonusTask');
 if(task)task.textContent=`Forje ${countLabel(state.required)} de ${targetLabel()}.`;
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');
 requestAnimationFrame(()=>$('betaBonusContinue')?.focus());
}
function clearUi(){
 if(hideTimer)clearTimeout(hideTimer);hideTimer=0;
 state.active=false;state.target='';state.targetName='';state.required=0;state.progress=0;
 closeModal();hud.hidden=true;hud.classList.remove('completed');
}

modal.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-beta-bonus-close]'))closeModal()});
$('betaBonusContinue')?.addEventListener('click',closeModal);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))closeModal()});

window.addEventListener('ardua:beta-bonus-start',e=>{
 const d=e.detail||{};
 if(hideTimer)clearTimeout(hideTimer);hideTimer=0;
 state.active=true;state.target=d.target||'';state.targetName=d.targetName||d.target||'';state.required=Math.max(1,Number(d.required)||1);state.progress=Math.max(0,Number(d.progress)||0);
 hud.classList.remove('completed');renderHud();openModal();
});
window.addEventListener('ardua:beta-bonus-progress',e=>{
 const d=e.detail||{};if(!state.active)return;
 state.progress=Math.max(0,Number(d.progress)||0);renderHud();
});
window.addEventListener('ardua:beta-bonus-end',e=>{
 const d=e.detail||{};closeModal();
 if(d.completed){
  state.active=true;state.progress=state.required;hud.hidden=false;hud.classList.add('completed');hud.innerHTML=`<strong>BÔNUS CONCLUÍDO</strong><span>${targetLabel()} · ${state.required}/${state.required}</span>`;
  hideTimer=setTimeout(clearUi,1900);
 }else clearUi();
});
window.addEventListener('ardua:beta-bonus-reset',clearUi);
})();
