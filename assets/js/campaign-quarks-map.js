/* Ardua — explicit campaign trail Big Bang → Quarks → Deuterium. */
(()=>{
'use strict';
const map=document.getElementById('campaignMap'),content=document.getElementById('campaignContent'),links=document.getElementById('campaignLinks'),C=window.ARDUA_CAMPAIGN;
if(!map||!content||!links||!C)return;
let frame=0,redirectTimer=0;
const STATE_CLASSES=['locked','revealed','available','completed','current'];

function phaseState(id){
 const st=C.getState?.()||{},done=new Set(st.completed||[]);
 if(done.has(id))return'completed';
 if(st.activeId===id)return'current';
 if(C.isUnlocked?.(id))return'available';
 return id==='quarks'&&done.has('bigbang')?'revealed':'locked';
}
function setStateClass(el,state){
 for(const name of STATE_CLASSES){const enabled=name===state;if(el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}
}
function ensureTrailNode(){
 const deuterium=map.querySelector('.phase-node[data-phase="primordial_d"]');if(!deuterium?.parentElement)return null;
 let quarks=map.querySelector('.phase-node[data-phase="quarks"]');
 if(!quarks){
  quarks=document.createElement('button');quarks.type='button';quarks.className='phase-node';quarks.dataset.phase='quarks';quarks.innerHTML='<strong>Quarks</strong>';
 }
 if(quarks.parentElement!==deuterium.parentElement||quarks.nextElementSibling!==deuterium)deuterium.parentElement.insertBefore(quarks,deuterium);
 setStateClass(quarks,phaseState('quarks'));
 return quarks;
}
function visible(el){return !!el&&el.getClientRects().length>0}
function point(el,edge='center'){
 if(!visible(el))return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();
 const x=r.left-c.left+r.width/2,y=edge==='top'?r.top-c.top:(edge==='bottom'?r.bottom-c.top:r.top-c.top+r.height/2);return{x,y};
}
function add(from,to){
 const a=point(from,'bottom'),b=point(to,'top');if(!a||!b)return;
 const dy=b.y-a.y,mid=a.y+dy*.5,p=document.createElementNS('http://www.w3.org/2000/svg','path');
 p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
 p.setAttribute('class','campaign-link root quarks-root-link');links.appendChild(p);
}
function sync(){
 frame=0;const quarks=ensureTrailNode();if(!map.classList.contains('show'))return;
 const singularity=map.querySelector('.singularity-map'),deuterium=map.querySelector('.phase-node[data-phase="primordial_d"]');
 if(!visible(singularity)||!visible(quarks)||!visible(deuterium))return;
 const native=[...links.querySelectorAll('.campaign-link.root:not(.quarks-root-link)')],custom=[...links.querySelectorAll('.quarks-root-link')];
 if(!native.length&&custom.length===2)return;
 native.forEach(x=>x.remove());custom.forEach(x=>x.remove());add(singularity,quarks);add(quarks,deuterium);
}
function schedule(){if(frame)return;frame=requestAnimationFrame(sync)}
function redirectBigBangToQuarks(e){
 if(e.detail?.id!=='bigbang'||e.detail?.source==='quarks-trail')return;
 clearTimeout(redirectTimer);redirectTimer=setTimeout(()=>{
  const st=C.getState?.()||{},done=new Set(st.completed||[]);
  if(!done.has('bigbang')||done.has('quarks')||st.activeId!=='primordial_d')return;
  C.setActive?.('quarks');
  window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id:'quarks',state:C.getState?.(),source:'quarks-trail'}}));
  schedule();
 },0);
}
new MutationObserver(schedule).observe(links,{childList:true});
new MutationObserver(schedule).observe(map,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('ardua:campaign-progress',e=>{ensureTrailNode();redirectBigBangToQuarks(e);schedule()});
ensureTrailNode();schedule();
})();
