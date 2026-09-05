/* Ardua — exploration window for the campaign map. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN;
const map=document.getElementById('campaignMap');
if(!C||!map)return;

const editor=!!C.editor;
let frame=0;

function idOf(node){return node?.dataset?.phase||''}
function selectedRoute(node){
 let p=node;
 while(p&&p!==map){
  if(p.hidden)return false;
  if(p.classList?.contains('branch-panel')&&p.hidden)return false;
  if(p.classList?.contains('branch-after')&&p.hidden)return false;
  p=p.parentElement;
 }
 return true;
}
function clearFog(node){
 node.classList.remove('exploration-hidden','exploration-next','exploration-preview','exploration-preview-1','exploration-preview-2');
}
function shownPhaseInside(host){return !!host?.querySelector('.phase-node[data-phase]:not(.exploration-hidden)')}
function updateStructures(){
 map.querySelectorAll('.branch-cluster').forEach(cluster=>{
  const reachable=[...cluster.querySelectorAll(':scope > .branch-spheres > .branch-choice')].some(s=>s.classList.contains('available')||s.classList.contains('current')||s.classList.contains('completed')||s.classList.contains('selected'));
  cluster.classList.toggle('exploration-structure-hidden',!reachable&&!shownPhaseInside(cluster));
 });
 map.querySelectorAll('.portal').forEach(portal=>{
  portal.classList.toggle('exploration-structure-hidden',!shownPhaseInside(portal));
 });
 map.querySelectorAll('.cycle-panel').forEach(panel=>panel.classList.toggle('exploration-structure-hidden',!shownPhaseInside(panel)));
 map.querySelectorAll('.cycle-grid').forEach(grid=>grid.classList.toggle('exploration-structure-hidden',![...grid.querySelectorAll(':scope > .cycle-panel')].some(p=>!p.classList.contains('exploration-structure-hidden'))));
 const stellar=map.querySelector('.stellar-branches'),birth=map.querySelector('[data-junction="stellar-birth"]');
 if(birth)birth.classList.toggle('exploration-structure-hidden',stellar?.classList.contains('exploration-structure-hidden'));
 map.querySelectorAll('.cycle-arrow').forEach(el=>el.classList.toggle('exploration-structure-hidden',!!el.previousElementSibling?.classList.contains('exploration-structure-hidden')));
}
function applyExplorationWindow(){
 if(editor){
  map.classList.add('exploration-editor');
  map.querySelectorAll('.phase-node[data-phase]').forEach(clearFog);
  map.querySelectorAll('.exploration-structure-hidden').forEach(el=>el.classList.remove('exploration-structure-hidden'));
  window.dispatchEvent(new Event('resize'));
  return;
 }
 map.classList.remove('exploration-editor');
 const state=C.getState(),done=new Set(state.completed||[]),active=state.activeId;
 const all=[...map.querySelectorAll('.phase-node[data-phase]')];
 all.forEach(clearFog);
 const route=all.filter(selectedRoute);
 const next=route.find(node=>{const id=idOf(node);return id&&!done.has(id)&&C.isUnlocked(id)});
 const horizon=[];
 if(next){
  const start=route.indexOf(next);
  for(let i=start;i<route.length&&horizon.length<3;i++){
   const node=route[i],id=idOf(node);
   if(!id||done.has(id))continue;
   horizon.push(node);
  }
 }
 const horizonSet=new Set(horizon);
 all.forEach(node=>{
  const id=idOf(node),keep=selectedRoute(node)&&(done.has(id)||id===active||horizonSet.has(node));
  node.classList.toggle('exploration-hidden',!keep);
 });
 horizon.forEach((node,index)=>{
  if(index===0)node.classList.add('exploration-next');
  else node.classList.add('exploration-preview',`exploration-preview-${index}`);
 });
 updateStructures();
 window.dispatchEvent(new Event('resize'));
}
function schedule(){
 if(frame)cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>requestAnimationFrame(()=>{frame=0;applyExplorationWindow()}));
}

if(editor){applyExplorationWindow();return}
new MutationObserver(schedule).observe(map,{attributes:true,attributeFilter:['class']});
map.addEventListener('click',e=>{
 if(e.target.closest('.branch-choice,[data-phase],summary'))setTimeout(schedule,30);
});
map.addEventListener('toggle',schedule,true);
window.addEventListener('ardua:campaign-progress',schedule);
window.addEventListener('hashchange',schedule);
schedule();
})();
