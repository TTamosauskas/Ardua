/* Ardua — exploration window for the campaign map. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN;
const map=document.getElementById('campaignMap');
if(!C||!map)return;

const editor=!!C.editor;
let frame=0,layoutFrame=0;

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
function setClass(el,name,enabled){
 if(!el||el.classList.contains(name)===enabled)return false;
 el.classList.toggle(name,enabled);return true;
}
function requestLayout(){
 if(layoutFrame)return;
 layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;window.dispatchEvent(new Event('resize'))});
}
function shownPhaseInside(host){return !!host?.querySelector('.phase-node[data-phase]:not(.exploration-hidden)')}
function updateStructures(){
 let changed=false;
 map.querySelectorAll('.branch-cluster').forEach(cluster=>{
  const reachable=[...cluster.querySelectorAll(':scope > .branch-spheres > .branch-choice')].some(s=>s.classList.contains('available')||s.classList.contains('current')||s.classList.contains('completed')||s.classList.contains('selected'));
  changed=setClass(cluster,'exploration-structure-hidden',!reachable&&!shownPhaseInside(cluster))||changed;
 });
 map.querySelectorAll('.portal').forEach(portal=>{changed=setClass(portal,'exploration-structure-hidden',!shownPhaseInside(portal))||changed});
 map.querySelectorAll('.cycle-panel').forEach(panel=>{changed=setClass(panel,'exploration-structure-hidden',!shownPhaseInside(panel))||changed});
 map.querySelectorAll('.cycle-grid').forEach(grid=>{changed=setClass(grid,'exploration-structure-hidden',![...grid.querySelectorAll(':scope > .cycle-panel')].some(p=>!p.classList.contains('exploration-structure-hidden')))||changed});
 const stellar=map.querySelector('.stellar-branches'),birth=map.querySelector('[data-junction="stellar-birth"]');
 if(birth)changed=setClass(birth,'exploration-structure-hidden',!!stellar?.classList.contains('exploration-structure-hidden'))||changed;
 map.querySelectorAll('.cycle-arrow').forEach(el=>{changed=setClass(el,'exploration-structure-hidden',!!el.previousElementSibling?.classList.contains('exploration-structure-hidden'))||changed});
 return changed;
}
function applyEditorWindow(){
 let changed=setClass(map,'exploration-editor',true);
 map.querySelectorAll('.phase-node[data-phase]').forEach(node=>{
  for(const cls of ['exploration-hidden','exploration-next','exploration-preview','exploration-preview-1','exploration-preview-2'])changed=setClass(node,cls,false)||changed;
 });
 map.querySelectorAll('.exploration-structure-hidden').forEach(el=>{changed=setClass(el,'exploration-structure-hidden',false)||changed});
 if(changed)requestLayout();
}
function applyExplorationWindow(){
 if(editor){applyEditorWindow();return}
 let changed=setClass(map,'exploration-editor',false);
 const state=C.getState(),done=new Set(state.completed||[]),active=state.activeId;
 const all=[...map.querySelectorAll('.phase-node[data-phase]')];
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
 const depth=new Map(horizon.map((node,index)=>[node,index]));
 all.forEach(node=>{
  const id=idOf(node),index=depth.has(node)?depth.get(node):-1,keep=selectedRoute(node)&&(done.has(id)||id===active||index>=0);
  changed=setClass(node,'exploration-hidden',!keep)||changed;
  changed=setClass(node,'exploration-next',index===0)||changed;
  changed=setClass(node,'exploration-preview',index>0)||changed;
  changed=setClass(node,'exploration-preview-1',index===1)||changed;
  changed=setClass(node,'exploration-preview-2',index===2)||changed;
 });
 changed=updateStructures()||changed;
 if(changed)requestLayout();
}
function schedule(){
 if(frame)return;
 frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;applyExplorationWindow()})});
}

if(editor){applyEditorWindow();return}
new MutationObserver(schedule).observe(map,{attributes:true,attributeFilter:['class']});
map.addEventListener('click',e=>{
 if(e.target.closest('.branch-choice,[data-phase],summary'))setTimeout(schedule,30);
});
map.addEventListener('toggle',schedule,true);
window.addEventListener('ardua:campaign-progress',schedule);
window.addEventListener('hashchange',schedule);
schedule();
})();
