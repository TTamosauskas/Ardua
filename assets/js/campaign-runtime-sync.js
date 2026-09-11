/* Ardua — keep campaign activeId synchronized with the phase actually loaded by the engine. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,phaseTitle=document.getElementById('phaseTitle'),branchLabel=document.getElementById('branchLabel'),map=document.getElementById('campaignMap');
if(!C||!G||!phaseTitle)return;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
let source=[];
function parse(text){
 const rows=[];
 for(const line of String(text||'').split('\n')){
  if(!line.includes("{id:'"))continue;
  const id=line.match(/\bid:'([^']+)'/)?.[1],title=line.match(/\btitle:'([^']*)'/)?.[1],branch=line.match(/\bbranch:'([^']*)'/)?.[1];
  if(id)rows.push({id,title:title||'',branch:branch||''});
 }
 return rows;
}
const sourceReady=fetch(new URL('assets/js/ardua.js',document.baseURI).href,{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(text=>{source=parse(text);sync()}).catch(()=>{});
function candidatesFor(id){
 const row=source.find(x=>x.id===id),mapTitle=document.querySelector(`.phase-node[data-phase="${id}"] strong`)?.textContent||'',menuTitle=document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${id}"] strong`)?.textContent||'';
 return [row?.title,window.ARDUA_PHASE_NAMES?.[id],window.ARDUA_FORGE_NAMES?.[id],mapTitle,menuTitle].filter(Boolean).map(norm);
}
function branchesFor(id){
 const row=source.find(x=>x.id===id),menuBranch=document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${id}"] small`)?.textContent||'';
 return [row?.branch,menuBranch].filter(Boolean).map(norm);
}
function resolve(){
 const t=norm(phaseTitle.textContent),b=norm(branchLabel?.textContent),ids=G.runtimeOrder||[];
 if(b){
  const branchMatches=ids.filter(id=>branchesFor(id).includes(b));
  if(branchMatches.length===1)return branchMatches[0];
  if(branchMatches.length>1){const exact=branchMatches.filter(id=>candidatesFor(id).includes(t));if(exact.length===1)return exact[0]}
 }
 const titleMatches=ids.filter(id=>candidatesFor(id).includes(t));
 if(titleMatches.length===1)return titleMatches[0];
 if(titleMatches.length>1&&b){const exact=titleMatches.filter(id=>branchesFor(id).includes(b));if(exact.length===1)return exact[0]}
 if(b){const sourceMatch=source.filter(row=>norm(row.branch)===b&&norm(row.title)===t);if(sourceMatch.length===1)return sourceMatch[0].id}
 return source.find(row=>norm(row.title)===t)?.id||'';
}
let busy=false;
function sync(){
 /* The engine title is stale while the campaign map owns the screen, and Quarks is a
    custom phase outside runtimeOrder. Neither state may be inferred from that title. */
 if(busy||map?.classList.contains('show')||window.ARDUA_QUARKS?.isActive?.())return;
 const engineId=document.documentElement.dataset.arduaEnginePhase||'';const id=(G.runtimeOrder||[]).includes(engineId)?engineId:resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;
 busy=true;try{C.setActive(id);document.documentElement.dataset.arduaActivePhase=id;window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:C.getState?.(),source:'runtime-sync'}}))}finally{busy=false}
}
new MutationObserver(sync).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
if(branchLabel)new MutationObserver(sync).observe(branchLabel,{childList:true,subtree:true,characterData:true});
function syncFromEngine(e){
 const id=e?.detail?.id||document.documentElement.dataset.arduaEnginePhase||'';
 if(window.ARDUA_QUARKS?.isActive?.()||!(G.runtimeOrder||[]).includes(id))return;
 const st=C.getState?.();if(!st||st.activeId===id){document.documentElement.dataset.arduaActivePhase=id;return}
 busy=true;try{C.setActive(id);document.documentElement.dataset.arduaActivePhase=id;window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:C.getState?.(),source:'runtime-sync'}}))}finally{busy=false}
}
window.addEventListener('ardua:engine-phase',syncFromEngine);
window.addEventListener('ardua:forge-names',sync);
window.addEventListener('ardua:campaign-progress',e=>{if(e.detail?.source!=='runtime-sync')setTimeout(sync,0)});
setTimeout(sync,0);setTimeout(sync,250);void sourceReady;

// Visible objective completion is authoritative. The engine normally arms the round
// button within 720 ms; this bridge only activates when that normal path stayed stuck.
const OBJECTIVE_END_FALLBACK_DELAY=980;
let objectiveEndTimer=0,objectiveEndBusy=false,objectiveEndOriginal=null;
function objectiveRatiosComplete(text){
 const ratios=[...String(text||'').matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 return ratios.length>0&&ratios.every(([done,target])=>target>0&&done>=target);
}
function dustEndButton(btn){const label=norm(btn?.textContent||'');return label.includes('espalhar')&&label.includes('poeira estelar')}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function restoreObjectiveEndButton(){
 const current=document.getElementById('phaseEndBtn');
 if(current?.dataset.objectiveCompletionFallback==='1'&&objectiveEndOriginal){current.replaceWith(objectiveEndOriginal)}
 objectiveEndOriginal=null;
}
async function fallbackStellarScatter(){
 const board=document.getElementById('starBoard'),pieces=document.getElementById('pieces'),layer=document.getElementById('explosion');
 if(!board||!pieces||!layer)return;
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
async function completeWithFallback(button){
 if(objectiveEndBusy)return;objectiveEndBusy=true;button.classList.remove('show');
 try{window.ARDUA_RECIPE_AUDIO_SYNC?.playVictoryFanfare?.()}catch(_e){}
 try{await fallbackStellarScatter()}finally{
  const original=objectiveEndOriginal;restoreObjectiveEndButton();
  if(original){original.classList.remove('show');original.addEventListener('click',e=>e.stopImmediatePropagation(),{capture:true,once:true});original.click()}
  objectiveEndBusy=false;
 }
}
function armObjectiveCompletionFallback(){
 clearTimeout(objectiveEndTimer);if(objectiveEndBusy)return;
 objectiveEndTimer=setTimeout(()=>{
  const id=document.documentElement.dataset.arduaEnginePhase||C.getState?.().activeId||'',goal=document.getElementById('goalText'),button=document.getElementById('phaseEndBtn');
  if(!(G.runtimeOrder||[]).includes(id)||window.ARDUA_QUARKS?.isActive?.()||map?.classList.contains('show')||!button||button.classList.contains('show')||!dustEndButton(button)||!objectiveRatiosComplete(goal?.textContent))return;
  restoreObjectiveEndButton();const original=document.getElementById('phaseEndBtn'),clone=original.cloneNode(true);objectiveEndOriginal=original;clone.dataset.objectiveCompletionFallback='1';clone.classList.add('show');original.replaceWith(clone);document.getElementById('starBoard')?.classList.add('critical');clone.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();void completeWithFallback(clone)},{once:true});
 },OBJECTIVE_END_FALLBACK_DELAY);
}
const goalText=document.getElementById('goalText');if(goalText)new MutationObserver(armObjectiveCompletionFallback).observe(goalText,{childList:true,subtree:true,characterData:true});
window.addEventListener('ardua:engine-phase',()=>{clearTimeout(objectiveEndTimer);restoreObjectiveEndButton();objectiveEndBusy=false;setTimeout(armObjectiveCompletionFallback,0)});
window.addEventListener('ardua:campaign-progress',()=>setTimeout(armObjectiveCompletionFallback,0));
setTimeout(armObjectiveCompletionFallback,400);
})();
