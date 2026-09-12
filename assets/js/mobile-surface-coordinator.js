/* Ardua — P2.1 mobile surface ownership: one interactive protagonist at a time. */
(()=>{
'use strict';
const SPECS=Object.freeze([
 {key:'reward',id:'campaignVictoryReward',priority:100},
 {key:'discovery',id:'discoveryUnlockModal',priority:90},
 {key:'phase-preview',id:'campaignPhasePreview',priority:82},
 {key:'phase-intro',id:'stellarIntro',priority:78},
 {key:'event',id:'eventTooltip',priority:70},
 {key:'quick-menu',id:'phaseQuickMenu',priority:62},
 {key:'menu',id:'menuModal',priority:60},
 {key:'map',id:'campaignMap',priority:20}
]);
const observed=new WeakSet();let frame=0,lastTop='';
const byId=id=>document.getElementById(id);
function isActive(spec,el){
 if(!el)return false;
 if(spec.key==='event')return el.classList.contains('show')&&el.getAttribute('aria-hidden')!=='true';
 return el.classList.contains('show')&&el.getAttribute('aria-hidden')!=='true';
}
function setOwnedInert(el,on){
 if(!el)return;
 if(on){if(!el.inert){el.inert=true;el.dataset.arduaSurfaceInert='1'}}
 else if(el.dataset.arduaSurfaceInert==='1'){el.inert=false;delete el.dataset.arduaSurfaceInert}
}
function clearPresentation(el){
 if(!el)return;delete el.dataset.arduaSurfaceSuppressed;delete el.dataset.arduaSurfaceBackground;setOwnedInert(el,false);
}
function snapshot(){
 const active=SPECS.map(spec=>({spec,el:byId(spec.id)})).filter(x=>isActive(x.spec,x.el)).sort((a,b)=>b.spec.priority-a.spec.priority);
 return{top:active[0]?.spec.key||'',active:active.map(x=>x.spec.key),count:active.length};
}
function sync(){
 frame=0;const active=SPECS.map(spec=>({spec,el:byId(spec.id)})).filter(x=>isActive(x.spec,x.el)).sort((a,b)=>b.spec.priority-a.spec.priority),top=active[0]||null;
 const activeKeys=new Set(active.map(x=>x.spec.key)),allowMapBackdrop=!!top&&['phase-preview','phase-intro'].includes(top.spec.key);
 for(const spec of SPECS){
  const el=byId(spec.id);if(!el)continue;clearPresentation(el);
  if(!activeKeys.has(spec.key)||!top||spec.key===top.spec.key)continue;
  if(spec.key==='map'&&allowMapBackdrop){el.dataset.arduaSurfaceBackground='1';setOwnedInert(el,true)}
  else{el.dataset.arduaSurfaceSuppressed='1';setOwnedInert(el,true)}
 }
 /* Quick/legacy menus already own a full-screen backdrop. Keep the app focusable there so
    their synchronous close handlers can return focus to the menu trigger before this
    coordinator's next frame; higher modal surfaces still inert gameplay underneath. */
 const app=document.querySelector('.app'),blockApp=!!top&&!['event','quick-menu','menu'].includes(top.spec.key);setOwnedInert(app,blockApp);
 document.body.classList.toggle('ardua-surface-lock',!!top);
 if(top){document.documentElement.dataset.arduaSurface=top.spec.key;document.documentElement.dataset.arduaSurfaceCount=String(active.length)}
 else{delete document.documentElement.dataset.arduaSurface;delete document.documentElement.dataset.arduaSurfaceCount}
 const key=top?.spec.key||'';
 if(key!==lastTop){lastTop=key;window.dispatchEvent(new CustomEvent('ardua:surface-change',{detail:{top:key,active:active.map(x=>x.spec.key)}}))}
}
function schedule(){if(frame)return;frame=requestAnimationFrame(sync)}
function attach(el){
 if(!el||observed.has(el))return;observed.add(el);
 new MutationObserver(schedule).observe(el,{attributes:true,attributeFilter:['class','aria-hidden','hidden']});
}
function scan(){for(const spec of SPECS)attach(byId(spec.id));schedule()}
scan();
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element){for(const spec of SPECS){if(node.id===spec.id)attach(node);else attach(node.querySelector?.(`#${spec.id}`))}}schedule()}).observe(document.body,{childList:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
window.ARDUA_SURFACE_COORDINATOR=Object.freeze({sync:()=>{sync();return snapshot()},snapshot,get top(){return snapshot().top},get active(){return snapshot().active}});
})();
