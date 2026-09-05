/* Ardua — render the intermediate-mass giant fork after stellar lithium. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,A=window.ARDUA_REQUIRED_ATLAS,S=window.ARDUA_GIANTS;
const map=document.getElementById('campaignMap'),content=document.getElementById('campaignContent'),links=document.getElementById('campaignLinks');
if(!C||!A||!S||!map||!content||!links)return;

const expanded=ids=>A.expand(ids);
const doneSet=()=>new Set(C.getState().completed||[]);
const routeMembers=Object.fromEntries(Object.entries(S.routes).map(([key,ids])=>[key,expanded(ids)]));
const routeTail=key=>A.tail(S.routes[key][S.routes[key].length-1]);
let lineTimer=0,syncTimer=0;

function visible(el){return !!el&&el.getClientRects().length>0}
function nodeById(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(visible)||null}
function midPanel(){return map.querySelector('.branch-panel[data-branch-group="stellar"][data-branch-panel="mid"]')}
function giantCluster(){return map.querySelector('.giant-branches')}
function giantPanel(key){return giantCluster()?.querySelector(`.branch-panel[data-branch-panel="${key}"]`)||null}
function giantSphere(key){return giantCluster()?.querySelector(`.branch-choice[data-branch-open="${key}"]`)||null}
function fork(){return giantCluster()?.querySelector('[data-branch-fork="giant"]')||null}
function agbCore(){return map.querySelector('[data-junction="giant-agb"]')}
function giantHub(){return map.querySelector('.giant-junction')}
function agbLabel(){return map.querySelector('.giant-after > .epoch-label')}
function sPortal(){return map.querySelector('.giant-after > .portal[data-portal="s"]')}

function makeFlow(className=''){
 const el=document.createElement('div');el.className=`cosmos-flow ${className}`.trim();return el;
}
function moveNodes(ids,target){
 for(const id of expanded(ids)){
  const el=map.querySelector(`.phase-node[data-phase="${id}"]`);if(el)target.appendChild(el);
 }
}
function sphereMarkup(key){
 const b=document.createElement('button');b.type='button';b.className=`branch-choice ${S.routeClasses[key]} locked`;b.dataset.branchGroup='giant';b.dataset.branchOpen=key;b.setAttribute('aria-pressed','false');b.setAttribute('aria-expanded','false');
 b.innerHTML=`<span class="branch-sphere-art"></span><strong>${S.routeLabels[key]}</strong>`;return b;
}
function buildFork(){
 const host=midPanel();if(!host||giantCluster())return;
 const mainFlow=[...host.children].find(el=>el.classList?.contains('cosmos-flow'));if(!mainFlow)return;
 const agb=[...host.children].find(el=>el.classList?.contains('epoch-label'));
 const portal=[...host.children].find(el=>el.matches?.('.portal[data-portal="s"]'));
 const whiteFlow=portal?.nextElementSibling;
 if(!agb||!portal||!whiteFlow)return;

 const precursorFlow=makeFlow('giant-precursor');
 moveNodes(['he_orange','he_yellow','coulomb_intro',S.precursor],precursorFlow);

 const hub=document.createElement('div');hub.className='epoch-label giant-junction';hub.innerHTML='<strong>Gigante</strong>';
 const cluster=document.createElement('section');cluster.className='branch-cluster giant-branches';cluster.dataset.branchGroup='giant';
 const f=document.createElement('span');f.className='branch-fork-node';f.dataset.branchFork='giant';f.setAttribute('aria-hidden','true');
 const spheres=document.createElement('div');spheres.className='branch-spheres';
 const panels=document.createElement('div');panels.className='branch-panels';
 for(const key of S.routeOrder){
  spheres.appendChild(sphereMarkup(key));
  const panel=document.createElement('div');panel.className='branch-panel giant-route';panel.dataset.branchGroup='giant';panel.dataset.branchPanel=key;panel.hidden=true;
  const flow=makeFlow(`giant-flow route-${key}`);moveNodes(S.routes[key],flow);panel.appendChild(flow);panels.appendChild(panel);
 }
 cluster.append(f,spheres,panels);

 const after=document.createElement('div');after.className='branch-after giant-after';after.dataset.afterGroup='giant';after.hidden=true;
 const core=document.createElement('div');core.className='convergence giant-agb';core.dataset.junction='giant-agb';core.textContent='Convergência AGB';
 mainFlow.replaceWith(precursorFlow);
 after.append(core,agb,portal,whiteFlow);
 precursorFlow.after(hub,cluster,after);

 const atomicFlow=map.querySelector('.phase-node[data-phase="atomic_li"]')?.closest('.cosmos-flow');
 atomicFlow?.classList.add('atomic-era-flow');
 syncAll();
}

function routeState(key){
 if(C.editor)return'available';
 const st=C.getState(),done=doneSet(),members=routeMembers[key];
 if(members.includes(st.activeId))return'current';
 if(members.length&&members.every(id=>done.has(id)))return'completed';
 if(members.some(id=>C.isUnlocked(id)&&!done.has(id)))return'available';
 if(members.some(id=>done.has(id)))return'revealed';
 return'locked';
}
function syncSphereStates(){
 const names=['locked','revealed','available','completed','current'];
 for(const key of S.routeOrder){
  const b=giantSphere(key);if(!b)continue;
  const state=routeState(key);b.classList.remove(...names);b.classList.add(state);
 }
}
function selectRoute(key,{scroll=false}={}){
 const cluster=giantCluster();if(!cluster||!S.routes[key])return;
 cluster.querySelectorAll(':scope > .branch-spheres > .branch-choice').forEach(b=>{
  const on=b.dataset.branchOpen===key;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-expanded',on?'true':'false');
 });
 cluster.querySelectorAll(':scope > .branch-panels > .branch-panel').forEach(p=>p.hidden=p.dataset.branchPanel!==key);
 const after=map.querySelector('.giant-after');if(after)after.hidden=false;
 syncSphereStates();scheduleLines();
 if(scroll)setTimeout(()=>giantPanel(key)?.scrollIntoView({block:'nearest',behavior:'smooth'}),45);
}
function inferRoute(){
 const st=C.getState(),done=doneSet();
 for(const key of S.routeOrder)if(routeMembers[key].includes(st.activeId))return key;
 if(st.activeId===S.convergence||done.has(S.convergence)||done.has('bi')||st.activeId==='white'){
  for(const key of S.routeOrder)if(done.has(routeTail(key)))return key;
 }
 return null;
}
function syncSelection(){
 const selected=giantCluster()?.querySelector(':scope > .branch-spheres > .branch-choice.selected')?.dataset.branchOpen;
 if(selected){const after=map.querySelector('.giant-after');if(after)after.hidden=false;return}
 const inferred=inferRoute();if(inferred)selectRoute(inferred);
}
function syncAll(){syncSphereStates();syncSelection();scheduleLines()}
function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(syncAll,35)}

function center(el,edge='center'){
 if(!visible(el))return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x:r.left-c.left+r.width/2,y};
}
function lineD(from,to,bend=.5){
 const a=center(from,'bottom'),b=center(to,'top');if(!a||!b)return'';const dy=b.y-a.y,mid=a.y+dy*bend;return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}
function addLine(from,to,cls='mid',bend=.5){
 const d=lineD(from,to,bend);if(!d)return;const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',`campaign-link giant-link ${cls}`);links.appendChild(p);
}
function suppressLegacyShortcut(from,to){
 const d=lineD(from,to,.5);if(!d)return;[...links.querySelectorAll('.campaign-link.mid:not(.giant-link)')].find(p=>p.getAttribute('d')===d)?.remove();
}
function drawLines(){
 clearTimeout(lineTimer);lineTimer=0;links.querySelectorAll('.giant-link').forEach(p=>p.remove());
 if(!map.classList.contains('show')||!map.classList.contains('trail-revealed'))return;
 const cluster=giantCluster(),f=fork();if(!visible(cluster)||!visible(f))return;
 const precursorTail=nodeById(A.tail(S.precursor));
 addLine(precursorTail,f,'branch-fork giant',.52);
 for(const key of S.routeOrder)addLine(f,giantSphere(key),`branch ${S.routeClasses[key]}`,.38);
 const selected=cluster.querySelector(':scope > .branch-spheres > .branch-choice.selected')?.dataset.branchOpen;if(!selected)return;
 const first=S.routes[selected][0],last=routeTail(selected);
 if(selected==='white')suppressLegacyShortcut(precursorTail,nodeById(first));
 if(selected==='blue')suppressLegacyShortcut(nodeById(last),sPortal());
 addLine(giantSphere(selected),nodeById(first),S.routeClasses[selected],.34);
 const core=agbCore(),label=agbLabel(),portal=sPortal();if(!visible(core)||!visible(portal))return;
 addLine(nodeById(last),core,S.routeClasses[selected],.55);
 if(visible(label)){addLine(core,label,'mid',.42);addLine(label,portal,'mid',.5)}else addLine(core,portal,'mid',.48);
}
function scheduleLines(){clearTimeout(lineTimer);lineTimer=setTimeout(drawLines,90)}
function isCustomCampaignLine(node){
 return node?.nodeType===1&&(node.classList?.contains('giant-link')||node.classList?.contains('sg-link'));
}

buildFork();
map.addEventListener('click',e=>{const sphere=e.target.closest('.giant-branches .branch-choice[data-branch-open]');if(sphere)setTimeout(()=>{selectRoute(sphere.dataset.branchOpen,{scroll:true});scheduleSync()},0)},false);
window.addEventListener('ardua:campaign-progress',scheduleSync);
window.addEventListener('resize',scheduleLines);
map.addEventListener('toggle',scheduleLines,true);
new MutationObserver(muts=>{
 if(muts.some(m=>m.type==='attributes'&&(m.attributeName==='hidden'||m.attributeName==='class'))){scheduleSync();scheduleLines()}
}).observe(map,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
new MutationObserver(muts=>{
 const baseLayerChanged=muts.some(m=>[...m.addedNodes,...m.removedNodes].some(node=>node.nodeType===1&&!isCustomCampaignLine(node)));
 if(baseLayerChanged)scheduleLines();
}).observe(links,{childList:true});
scheduleSync();
})();
