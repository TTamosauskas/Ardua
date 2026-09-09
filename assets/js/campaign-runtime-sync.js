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
 const id=resolve();if(!id)return;const st=C.getState?.();if(!st||st.activeId===id)return;
 busy=true;try{C.setActive(id);document.documentElement.dataset.arduaActivePhase=id;window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:C.getState?.(),source:'runtime-sync'}}))}finally{busy=false}
}
new MutationObserver(sync).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
if(branchLabel)new MutationObserver(sync).observe(branchLabel,{childList:true,subtree:true,characterData:true});
window.addEventListener('ardua:forge-names',sync);
window.addEventListener('ardua:campaign-progress',e=>{if(e.detail?.source!=='runtime-sync')setTimeout(sync,0)});
setTimeout(sync,0);setTimeout(sync,250);void sourceReady;
})();
