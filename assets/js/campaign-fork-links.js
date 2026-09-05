/* Ardua — persistent fork connectors for Giants and Supergiants. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,A=window.ARDUA_REQUIRED_ATLAS,GI=window.ARDUA_GIANTS,SG=window.ARDUA_SUPERGIANTS;
const map=document.getElementById('campaignMap'),content=document.getElementById('campaignContent'),base=document.getElementById('campaignLinks');
if(!C||!A||!GI||!SG||!map||!content||!base)return;

const NS='http://www.w3.org/2000/svg';
let frame=0;

const style=document.createElement('style');
style.textContent='#campaignLinks .giant-link,#campaignLinks .sg-link{display:none!important}';
document.head.appendChild(style);

const layer=document.createElementNS(NS,'svg');
layer.id='campaignForkLinks';
layer.classList.add('campaign-links','campaign-fork-links');
layer.setAttribute('aria-hidden','true');
layer.style.zIndex='2';
layer.style.pointerEvents='none';
layer.style.overflow='visible';
content.appendChild(layer);

function visible(el){return !!el&&el.getClientRects().length>0}
function phase(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(visible)||null}
function cluster(group){return [...map.querySelectorAll(`.branch-cluster[data-branch-group="${group}"]`)].find(visible)||null}
function fork(group){return cluster(group)?.querySelector(`.branch-fork-node[data-branch-fork="${group}"]`)||null}
function sphere(group,key){return cluster(group)?.querySelector(`:scope > .branch-spheres > .branch-choice[data-branch-open="${key}"]`)||null}
function selected(group){return cluster(group)?.querySelector(':scope > .branch-spheres > .branch-choice.selected')?.dataset.branchOpen||null}
function portalSummary(key){return [...map.querySelectorAll(`[data-portal="${key}"] > summary`)].find(visible)||null}

function center(el,edge='center'){
 if(!visible(el))return null;
 const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();
 let y=r.top-c.top+r.height/2;
 if(edge==='top')y=r.top-c.top;
 if(edge==='bottom')y=r.bottom-c.top;
 return{x:r.left-c.left+r.width/2,y};
}
function pathD(from,to,bend=.5){
 const a=center(from,'bottom'),b=center(to,'top');if(!a||!b)return'';
 const dy=b.y-a.y,mid=a.y+dy*bend;
 return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}
function addPath(from,to,cls,bend=.5){
 const d=pathD(from,to,bend);if(!d)return;
 const p=document.createElementNS(NS,'path');
 p.setAttribute('d',d);p.setAttribute('class',`campaign-link ${cls}`);layer.appendChild(p);
}
function connectExpanded(ids,cls){
 const xs=A.expand(ids);
 for(let i=1;i<xs.length;i++)addPath(phase(xs[i-1]),phase(xs[i]),cls,.5);
}
function suppressBase(from,to,cls){
 const d=pathD(from,to,.5);if(!d)return;
 [...base.querySelectorAll(`.campaign-link.${cls}`)].forEach(p=>{if(p.getAttribute('d')===d)p.remove()});
}
function cleanLegacyCustom(){base.querySelectorAll('.giant-link,.sg-link').forEach(p=>p.remove())}

function drawGiant(){
 const c=cluster('giant'),f=fork('giant'),precursor=phase(A.tail(GI.precursor));
 if(!visible(c)||!visible(f)||!visible(precursor))return;
 addPath(precursor,f,'giant-link branch-fork giant',.52);
 for(const key of GI.routeOrder)addPath(f,sphere('giant',key),`giant-link branch ${GI.routeClasses[key]}`,.38);

 const key=selected('giant');if(!key)return;
 const ids=GI.routes[key],first=ids[0],last=ids[ids.length-1],cls=GI.routeClasses[key];
 if(key==='white')suppressBase(precursor,phase(first),'mid');
 if(key==='blue')suppressBase(phase(A.tail(last)),portalSummary('s'),'mid');
 addPath(sphere('giant',key),phase(first),`giant-link ${cls}`,.34);
 connectExpanded(ids,`giant-link ${cls}`);

 const core=[...map.querySelectorAll('[data-junction="giant-agb"]')].find(visible),label=[...map.querySelectorAll('.giant-after > .epoch-label')].find(visible),summary=portalSummary('s');
 if(!visible(core))return;
 addPath(phase(A.tail(last)),core,`giant-link ${cls}`,.55);
 if(visible(label)){addPath(core,label,'giant-link mid',.42);if(visible(summary))addPath(label,summary,'giant-link mid',.5)}
 else if(visible(summary))addPath(core,summary,'giant-link mid',.48);
}

function drawSupergiant(){
 const c=cluster('supergiant'),f=fork('supergiant'),precursor=phase(A.tail(SG.precursor));
 if(!visible(c)||!visible(f)||!visible(precursor))return;
 addPath(precursor,f,'sg-link branch-fork supergiant',.52);
 for(const key of SG.routeOrder)addPath(f,sphere('supergiant',key),`sg-link branch ${SG.routeClasses[key]}`,.38);

 const key=selected('supergiant');if(!key)return;
 const ids=SG.routes[key],first=ids[0],last=ids[ids.length-1],cls=SG.routeClasses[key];
 if(key==='red')suppressBase(precursor,phase(first),'high');
 addPath(sphere('supergiant',key),phase(first),`sg-link ${cls}`,.34);
 connectExpanded(ids,`sg-link ${cls}`);

 const core=[...map.querySelectorAll('[data-junction="advanced-core"]')].find(visible),sharedFirst=phase(SG.shared[0]);
 if(!visible(core))return;
 addPath(phase(A.tail(last)),core,`sg-link ${cls}`,.55);
 if(visible(sharedFirst)){
  if(key==='blue')suppressBase(phase(A.tail(last)),sharedFirst,'high');
  addPath(core,sharedFirst,'sg-link high',.45);
  connectExpanded(SG.shared,'sg-link high');
 }
}

function draw(){
 frame=0;
 const w=content.clientWidth,h=content.scrollHeight;
 layer.setAttribute('viewBox',`0 0 ${w} ${h}`);layer.setAttribute('width',w);layer.setAttribute('height',h);layer.innerHTML='';
 cleanLegacyCustom();
 if(!map.classList.contains('show')||!map.classList.contains('trail-revealed'))return;
 drawGiant();drawSupergiant();
}
function schedule(){
 if(frame)cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>requestAnimationFrame(draw));
}

new MutationObserver(schedule).observe(base,{childList:true});
new MutationObserver(schedule).observe(map,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
map.addEventListener('click',()=>setTimeout(schedule,35));
map.addEventListener('toggle',schedule,true);
window.addEventListener('resize',schedule);
window.addEventListener('ardua:campaign-progress',schedule);
schedule();
})();
