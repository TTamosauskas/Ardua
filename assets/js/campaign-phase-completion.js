/* Ardua — universal player-facing phase completion contract. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const $=id=>document.getElementById(id);
if(!C)return;

const OBJECTIVE_END_FALLBACK_DELAY=980;
const adapters=new Map();
const replaying=new WeakSet();
let serial=0,busy=false,status='playing',activeRun=null;
let objectiveEndTimer=0,objectiveEndOriginal=null;

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
function activePhaseId(){return window.ARDUA_QUARKS?.isActive?.()?'quarks':(document.documentElement.dataset.arduaEnginePhase||C.getState?.().activeId||'')}
function objectiveRatiosComplete(text){
 const ratios=[...String(text||'').matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 return ratios.length>0&&ratios.every(([done,target])=>target>0&&done>=target);
}
function dustEndButton(btn){const label=norm(btn?.textContent||'');return label.includes('espalhar')&&label.includes('poeira estelar')}
function emit(next,detail={}){
 status=next;document.documentElement.dataset.arduaCompletionState=next;
 window.dispatchEvent(new CustomEvent('ardua:phase-completion-state',{detail:{status:next,phaseId:detail.phaseId||activePhaseId(),serial:detail.serial||serial,source:detail.source||'completion-contract'}}));
}
function setButtonBusy(button,on){if(!button)return;button.toggleAttribute('aria-busy',!!on);button.classList.toggle('completion-busy',!!on)}
function playVictoryFanfare(){try{return window.ARDUA_RECIPE_AUDIO_SYNC?.playVictoryFanfare?.()}catch(_e){return false}}
function replayButton(button){if(!button?.isConnected)return false;replaying.add(button);button.click();return true}
function registerAdapter(id,adapter){if(!id||!adapter)return false;adapters.set(id,Object.freeze({...adapter}));return true}
function unregisterAdapter(id){return adapters.delete(id)}

async function run({phaseId=activePhaseId(),button=$('phaseEndBtn'),source='completion-contract',celebrate=null,commit=null,playFanfare=true}={}){
 if(busy)return false;
 const runSerial=++serial;busy=true;activeRun={serial:runSerial,phaseId,source};
 setButtonBusy(button,true);button?.classList.remove('show');emit('celebrating',{phaseId,serial:runSerial,source});
 if(playFanfare)playVictoryFanfare();
 try{
  if(typeof celebrate==='function')await celebrate({phaseId,button,serial:runSerial});
  emit('committing',{phaseId,serial:runSerial,source});
  if(typeof commit==='function')await commit({phaseId,button,serial:runSerial});
  emit('completed',{phaseId,serial:runSerial,source});
  return true;
 }catch(error){
  emit('error',{phaseId,serial:runSerial,source});
  console.error('Ardua phase completion failed',error);
  return false;
 }finally{
  setButtonBusy(button,false);busy=false;activeRun=null;
 }
}

function restoreObjectiveEndButton(){
 const current=$('phaseEndBtn');
 if(current?.dataset.objectiveCompletionFallback==='1'&&objectiveEndOriginal)current.replaceWith(objectiveEndOriginal);
 objectiveEndOriginal=null;
}
async function scatterStellarFallback(){
 const board=$('starBoard'),pieces=$('pieces'),layer=$('explosion');if(!board||!pieces||!layer)return;
 layer.innerHTML='';const box=board.getBoundingClientRect(),size=Math.min(box.width,box.height),c=size/2,atoms=[...pieces.querySelectorAll('.atom')],clones=[];let maxMotionMs=0;
 for(const atom of atoms){
  const rect=atom.getBoundingClientRect(),el=atom.cloneNode(true),x=rect.left-box.left+rect.width/2,y=rect.top-box.top+rect.height/2;
  el.classList.remove('selected','candidate','invalid','newborn');el.style.left=x+'px';el.style.top=y+'px';el.style.opacity='1';layer.appendChild(el);clones.push({el,x,y});
 }
 for(let i=0;i<34;i++){
  const d=document.createElement('i');d.className='dust-speck';layer.appendChild(d);const a=Math.random()*Math.PI*2,dist=size*(.42+Math.random()*.35),dur=520+Math.random()*420;maxMotionMs=Math.max(maxMotionMs,dur);
  requestAnimationFrame(()=>{d.style.transition=`transform ${dur}ms ease-out,opacity ${dur}ms ease`;d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.25)`;d.style.opacity='0'});
 }
 pieces.classList.add('hidden');
 clones.forEach(({el,x,y},idx)=>{const radial=Math.atan2(y-c,x-c),a=radial+(Math.random()-.5)*.8,dist=size*(.52+Math.random()*.28),dur=620+Math.random()*280+idx*3;maxMotionMs=Math.max(maxMotionMs,dur);requestAnimationFrame(()=>{el.style.transition=`left ${dur}ms cubic-bezier(.15,.72,.2,1),top ${dur}ms cubic-bezier(.15,.72,.2,1),transform ${dur}ms ease,opacity ${dur*.9}ms ease`;el.style.left=(c+Math.cos(a)*dist)+'px';el.style.top=(c+Math.sin(a)*dist)+'px';el.style.transform='translate(-50%,-50%) scale(.45)';el.style.opacity='0'})});
 await wait(Math.ceil(maxMotionMs+(reducedMotion()?160:700)));
}
async function scatterQuarksFinale(){
 const board=$('starBoard'),stage=board?.querySelector('.quarks-stage'),layer=$('explosion');if(!board||!stage||!layer)return;
 layer.innerHTML='';const box=board.getBoundingClientRect(),size=Math.min(box.width,box.height),c=size/2,ghost=stage.cloneNode(true),items=[...ghost.querySelectorAll('.quark-piece,.quarks-baryon')];let maxMotionMs=0;
 ghost.classList.add('quarks-finale-ghost');ghost.style.pointerEvents='none';layer.appendChild(ghost);stage.style.visibility='hidden';
 for(let i=0;i<34;i++){
  const d=document.createElement('i');d.className='dust-speck';layer.appendChild(d);const a=Math.random()*Math.PI*2,dist=size*(.42+Math.random()*.35),dur=520+Math.random()*420;maxMotionMs=Math.max(maxMotionMs,dur);
  requestAnimationFrame(()=>{d.style.transition=`transform ${dur}ms ease-out,opacity ${dur}ms ease`;d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.25)`;d.style.opacity='0'});
 }
 items.forEach((el,idx)=>{
  const x=parseFloat(el.style.left)||c,y=parseFloat(el.style.top)||c,radial=Math.atan2(y-c,x-c),a=radial+(Math.random()-.5)*.8,dist=size*(.52+Math.random()*.28),dur=620+Math.random()*280+idx*35;maxMotionMs=Math.max(maxMotionMs,dur);
  requestAnimationFrame(()=>{el.style.transition=`left ${dur}ms cubic-bezier(.15,.72,.2,1),top ${dur}ms cubic-bezier(.15,.72,.2,1),transform ${dur}ms ease,opacity ${dur*.9}ms ease`;el.style.left=(c+Math.cos(a)*dist)+'px';el.style.top=(c+Math.sin(a)*dist)+'px';el.style.transform='translate(-50%,-50%) scale(.45)';el.style.opacity='0'});
 });
 await wait(Math.ceil(maxMotionMs+(reducedMotion()?160:700)));
}

registerAdapter('quarks',{
 matches:({button,phaseId})=>phaseId==='quarks'&&!!window.ARDUA_QUARKS?.isActive?.()&&C.getState?.().activeId==='quarks'&&button?.classList.contains('show')&&objectiveRatiosComplete($('goalText')?.textContent),
 celebrate:scatterQuarksFinale,
 commit:({button})=>replayButton(button)
});
registerAdapter('objective-fallback',{
 matches:({button})=>button?.dataset.objectiveCompletionFallback==='1',
 celebrate:scatterStellarFallback,
 commit:()=>{
  const original=objectiveEndOriginal;restoreObjectiveEndButton();
  if(original){original.classList.remove('show');original.addEventListener('click',e=>e.stopImmediatePropagation(),{capture:true,once:true});replayButton(original)}
 }
});

function adapterFor(context){for(const [id,adapter] of adapters)if(adapter.matches?.(context))return{id,adapter};return null}
document.addEventListener('click',e=>{
 const button=e.target instanceof Element?e.target.closest('#phaseEndBtn'):null;if(!button)return;
 if(replaying.has(button)){replaying.delete(button);return}
 const phaseId=activePhaseId(),found=adapterFor({button,phaseId,event:e});
 if(found){e.preventDefault();e.stopImmediatePropagation();void run({phaseId,button,source:found.id,celebrate:found.adapter.celebrate,commit:found.adapter.commit});return}
 if(button.classList.contains('show'))emit('awaiting-confirmation',{phaseId,source:'native-engine'});
},true);

function armObjectiveCompletionFallback(){
 clearTimeout(objectiveEndTimer);if(busy)return;
 objectiveEndTimer=setTimeout(()=>{
  const id=activePhaseId(),goal=$('goalText'),button=$('phaseEndBtn'),map=$('campaignMap');
  if(!(G?.runtimeOrder||[]).includes(id)||window.ARDUA_QUARKS?.isActive?.()||map?.classList.contains('show')||!button||button.classList.contains('show')||!dustEndButton(button)||!objectiveRatiosComplete(goal?.textContent))return;
  restoreObjectiveEndButton();const original=$('phaseEndBtn'),clone=original.cloneNode(true);objectiveEndOriginal=original;clone.dataset.objectiveCompletionFallback='1';clone.classList.add('show');original.replaceWith(clone);$('starBoard')?.classList.add('critical');emit('objective-ready',{phaseId:id,source:'objective-fallback'});
 },OBJECTIVE_END_FALLBACK_DELAY);
}
const goalText=$('goalText');if(goalText)new MutationObserver(armObjectiveCompletionFallback).observe(goalText,{childList:true,subtree:true,characterData:true});
window.addEventListener('ardua:victory-fanfare',()=>{if(!busy&&['awaiting-confirmation','objective-ready'].includes(status))emit('celebrating',{source:'native-engine'})});
window.addEventListener('ardua:phase-ended',e=>{if(!busy)emit('completed',{phaseId:e.detail?.id||activePhaseId(),source:'native-engine'})});
window.addEventListener('ardua:engine-phase',e=>{clearTimeout(objectiveEndTimer);restoreObjectiveEndButton();emit('playing',{phaseId:e.detail?.id||activePhaseId(),source:'engine-phase'});setTimeout(armObjectiveCompletionFallback,0)});
window.addEventListener('ardua:campaign-progress',()=>setTimeout(armObjectiveCompletionFallback,0));
setTimeout(armObjectiveCompletionFallback,400);

window.ARDUA_PHASE_COMPLETION=Object.freeze({
 run,registerAdapter,unregisterAdapter,replayButton,objectiveRatiosComplete,
 get status(){return status},get busy(){return busy},get activeRun(){return activeRun?{...activeRun}:null}
});
})();
