/* Ardua — standardize the first playable creation of each element/species as “Forjar …”. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,map=document.getElementById('campaignMap'),phaseMenu=document.getElementById('phaseMenu'),detail=document.getElementById('mapDetail');
if(!C||!G)return;
const EXCLUDED=new Set(['Plus','HeU','FeU','Be7','Be8','C13','Ne22','HeH+','H2']);
const SPECIAL={D:'Deutério',T:'Trítio',He3:'Hélio-3'};
let lastDetailPhase='',applying=false;
if(map)map.addEventListener('click',e=>{const node=e.target instanceof Element?e.target.closest('.phase-node[data-phase]'):null;if(node){lastDetailPhase=node.dataset.phase||'';setTimeout(syncDetail,0)}});

function parsePhases(text){
 const phases=[];for(const line of String(text||'').split('\n'))if(line.includes("{id:'")){
  const id=line.match(/\bid:'([^']+)'/)?.[1],newSym=line.match(/\bnew:'([^']+)'/)?.[1],target=Number(line.match(/\btarget:(\d+)/)?.[1]||0);
  if(id)phases.push({id,newSym:newSym||'',target});
 }
 return{phases,colors:{},weights:{}};
}
function sourceMeta(){
 if(window.ARDUA_PHASE_SOURCE_META_PROMISE)return window.ARDUA_PHASE_SOURCE_META_PROMISE;
 const url=new URL('assets/js/ardua.js',document.baseURI).href;
 window.ARDUA_PHASE_SOURCE_META_PROMISE=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parsePhases).catch(()=>({phases:[],colors:{},weights:{}}));
 return window.ARDUA_PHASE_SOURCE_META_PROMISE;
}
function elementNames(){
 const names={...SPECIAL};
 document.querySelectorAll('#catalog .el-card').forEach(card=>{const sym=card.querySelector('.s')?.textContent?.trim(),name=card.querySelector('.nm')?.textContent?.trim();if(sym&&name)names[sym]=name});
 return names;
}
function setText(el,text){if(el&&text&&el.textContent!==text)el.textContent=text}
function applyForgeNames(names){
 if(applying)return;applying=true;
 try{
  window.ARDUA_FORGE_NAMES=Object.freeze({...names});
  window.ARDUA_PHASE_NAMES=Object.freeze({...window.ARDUA_PHASE_NAMES,...names});
  for(const [id,name] of Object.entries(names)){
   map?.querySelectorAll(`.phase-node[data-phase="${id}"] strong`).forEach(el=>setText(el,name));
   phaseMenu?.querySelectorAll(`.phase-jump[data-phase-id="${id}"] strong`).forEach(el=>setText(el,name));
  }
  const active=C.getState?.().activeId,name=names[active];
  setText(document.getElementById('phaseTitle'),name);
  setText(document.getElementById('introTitle'),name?.toUpperCase());
  syncDetail();
 }finally{applying=false}
}
function syncDetail(){if(!lastDetailPhase||!detail?.classList.contains('show'))return;const name=window.ARDUA_FORGE_NAMES?.[lastDetailPhase],h=detail.querySelector(':scope > h3');setText(h,name)}
async function build(){
 const src=await sourceMeta(),byId=new Map((src.phases||[]).map(p=>[p.id,p])),namesBySym=elementNames(),seen=new Set(),forge={};
 for(const id of G.runtimeOrder||[]){
  const p=byId.get(id);if(!p?.newSym)continue;
  const first=!seen.has(p.newSym);seen.add(p.newSym);
  if(!first||p.target<=0||EXCLUDED.has(p.newSym))continue;
  const elementName=namesBySym[p.newSym];if(elementName)forge[id]=`Forjar ${elementName}`;
 }
 applyForgeNames(forge);
 window.dispatchEvent(new CustomEvent('ardua:forge-names',{detail:{names:forge}}));
}
build();
new MutationObserver(()=>{if(window.ARDUA_FORGE_NAMES&&!applying)applyForgeNames(window.ARDUA_FORGE_NAMES)}).observe(phaseMenu||document.body,{childList:true,subtree:true});
window.addEventListener('ardua:campaign-progress',()=>{if(window.ARDUA_FORGE_NAMES)applyForgeNames(window.ARDUA_FORGE_NAMES)});
})();
