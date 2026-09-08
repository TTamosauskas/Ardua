/* Ardua — final campaign-home behavior: compact chrome, immediate states, progressive chapters and cosmic time. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,GEN=window.ARDUA_GENERATIONS;
const map=$('campaignMap'),head=map?.querySelector('.campaign-head'),actions=head?.querySelector('.campaign-head-actions'),dataBtn=$('campaignData'),closeBtn=$('campaignClose'),detail=$('mapDetail');
if(!C||!G||!map||!head||!actions)return;
const SOUND_KEY='arduaSoundtrackEnabledV1';

/* Keep legacy controls alive as behavior bridges while the surface shows one hamburger. */
let trigger=$('campaignHomeMenuBtn');
if(!trigger){
 trigger=document.createElement('button');trigger.type='button';trigger.id='campaignHomeMenuBtn';trigger.className='campaign-home-menu-trigger';
 trigger.innerHTML='<span class="hamburger-icon" aria-hidden="true"><i></i><i></i><i></i></span>';
 trigger.setAttribute('aria-label','Abrir menu');trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');actions.appendChild(trigger);
}
let menu=$('campaignHomeMenu');
if(!menu){
 menu=document.createElement('div');menu.id='campaignHomeMenu';menu.className='campaign-home-menu';menu.setAttribute('aria-hidden','true');
 menu.innerHTML=`<div class="campaign-home-menu-backdrop" data-home-close></div>
 <section class="campaign-home-menu-card" role="dialog" aria-modal="true" aria-labelledby="campaignHomeMenuTitle">
  <header><strong id="campaignHomeMenuTitle">Menu</strong><button type="button" class="campaign-home-menu-close" data-home-close aria-label="Fechar menu">×</button></header>
  <div class="campaign-home-menu-actions">
   <button type="button" id="campaignHomeDiscoveries"><span>Descobertas</span><small>Elementos e fenômenos</small></button>
   <button type="button" id="campaignHomeReturn"><span>Voltar à fase</span><small>Retorna à atividade em andamento</small></button>
   <button type="button" id="campaignHomeSound"><span></span><small>Controla somente a trilha sonora</small></button>
  </div>
 </section>`;
 map.appendChild(menu);
}
const returnBtn=$('campaignHomeReturn'),soundBtn=$('campaignHomeSound'),soundLabel=soundBtn?.querySelector('span');
function soundtrackEnabled(){try{return localStorage.getItem(SOUND_KEY)!=='0'}catch(_e){return true}}
function updateSoundLabel(){if(soundLabel)soundLabel.textContent=soundtrackEnabled()?'Desligar Trilha Sonora':'Ligar Trilha Sonora'}
function applySound(enabled){const audio=$('arduaSoundtrack');if(audio)audio.muted=!enabled;try{localStorage.setItem(SOUND_KEY,enabled?'1':'0')}catch(_e){}if(enabled)window.ARDUA_MUSIC?.play?.();updateSoundLabel()}
function syncReturn(){if(returnBtn)returnBtn.disabled=!!closeBtn?.disabled}
function openMenu(){syncReturn();updateSoundLabel();menu.classList.add('show');menu.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');requestAnimationFrame(()=>$('campaignHomeDiscoveries')?.focus())}
function closeMenu(returnFocus=true){menu.classList.remove('show');menu.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');if(returnFocus)trigger.focus()}
trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMenu()});
menu.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-home-close]'))closeMenu()});
$('campaignHomeDiscoveries')?.addEventListener('click',()=>{closeMenu(false);dataBtn?.click()});
returnBtn?.addEventListener('click',()=>{if(returnBtn.disabled)return;closeMenu(false);closeBtn?.click()});
soundBtn?.addEventListener('click',()=>{applySound(!soundtrackEnabled());closeMenu(false)});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('show')){e.preventDefault();closeMenu()}});
updateSoundLabel();syncReturn();

function phaseState(id){
 const st=C.getState(),done=new Set(st.completed||[]);
 if(done.has(id))return'completed';
 if(st.activeId===id)return'current';
 if(C.isUnlocked(id))return'available';
 const rule=G.prerequisites?.[id],parents=[...(rule?.allOf||[]),...(rule?.anyOf||[]).flat()];
 return parents.some(p=>done.has(p))?'revealed':'locked';
}
function setStateClass(el,state){el.classList.remove('locked','revealed','available','completed','current');el.classList.add(state)}
function syncPhaseStates(){
 map.querySelectorAll('.phase-node[data-phase]').forEach(el=>setStateClass(el,phaseState(el.dataset.phase)));
 const root=map.querySelector('.singularity-map'),rootState=phaseState('bigbang');if(root)root.dataset.state=rootState;
}
function idsFromGroup(el){return String(el?.dataset.phaseGroup||'').split(',').map(x=>x.trim()).filter(Boolean)}
function groupReached(ids){const st=C.getState(),done=new Set(st.completed||[]);return ids.some(id=>done.has(id)||st.activeId===id||C.isUnlocked(id))}
function phaseNodesAfterLabel(label){
 const out=[];let cur=label.nextElementSibling,steps=0;
 while(cur&&steps++<5){
  if(cur.classList?.contains('epoch-label')||cur.classList?.contains('generation-banner')||cur.classList?.contains('convergence')||cur.classList?.contains('stellar-birth'))break;
  if(cur.matches?.('.phase-node[data-phase]'))out.push(cur);
  cur.querySelectorAll?.('.phase-node[data-phase]').forEach(n=>out.push(n));
  if(out.length)break;
  cur=cur.nextElementSibling;
 }
 return out;
}
function syncChapterVisibility(){
 let changed=false;
 map.querySelectorAll('.preamble-chapter[data-phase-group]').forEach(label=>{const show=groupReached(idsFromGroup(label));if(label.hidden===show){label.hidden=!show;changed=true}});
 map.querySelectorAll('.epoch-label:not(.preamble-chapter):not([data-always-visible])').forEach(label=>{
  const nodes=phaseNodesAfterLabel(label);if(!nodes.length)return;
  const show=nodes.some(n=>{const s=phaseState(n.dataset.phase);return s==='available'||s==='current'||s==='completed'});
  if(label.hidden===show){label.hidden=!show;changed=true}
 });
 if(changed)requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}

const PHASE_TIME=Object.freeze({
 bigbang:'Instante inicial do Big Bang',
 primordial_d:'2 minutos depois do Big Bang',
 primordial_t:'3 minutos depois do Big Bang',
 primordial_he3:'3 minutos depois do Big Bang',
 primordial_he3d:'4 minutos depois do Big Bang',
 primordial_td:'4 minutos depois do Big Bang',
 primordial_li:'20 minutos depois do Big Bang',
 atomic_he:'380 mil anos depois do Big Bang',
 atomic_h:'380 mil anos depois do Big Bang',
 atomic_li:'380 mil anos depois do Big Bang',
 first_atomic_bonds:'100–400 mil anos depois do Big Bang',
 first_nebulae:'100 milhões de anos depois do Big Bang',
 brown_formation:'100–200 milhões de anos depois do Big Bang',
 brown:'100–200 milhões de anos depois do Big Bang',
 first_generation_formation:'200 milhões de anos depois do Big Bang',
 low_mass_formation:'200 milhões de anos depois do Big Bang',
 intermediate_mass_formation:'200 milhões de anos depois do Big Bang',
 high_mass_formation:'200 milhões de anos depois do Big Bang'
});
function timeFor(id){
 if(PHASE_TIME[id])return PHASE_TIME[id];
 const generation=GEN?.generationOf?.(id);
 if(generation==='first')return'Mais de 200 milhões de anos depois do Big Bang';
 if(generation==='second')return'Mais de 500 milhões de anos depois do Big Bang';
 if(generation==='third')return'Mais de 1 bilhão de anos depois do Big Bang';
 return'Eras cósmicas depois do Big Bang';
}
$('campaignTimeFooter')?.remove();
let detailPhaseId='';
function syncDetailTime(){
 if(!detail||!detail.classList.contains('show')||!detailPhaseId)return;
 const title=detail.querySelector(':scope > h3'),actionsEl=detail.querySelector(':scope > .detail-actions');if(!title||!actionsEl)return;
 let time=detail.querySelector(':scope > .phase-cosmic-time');
 if(!time){time=document.createElement('div');time.className='phase-cosmic-time';actionsEl.before(time)}
 const text=timeFor(detailPhaseId);if(time.dataset.phase===detailPhaseId&&time.textContent===text)return;
 time.dataset.phase=detailPhaseId;time.textContent=text;
}

let syncFrame=0;
function syncAll(){syncFrame=0;syncPhaseStates();syncChapterVisibility();syncReturn();syncDetailTime()}
function scheduleSync(){if(syncFrame)cancelAnimationFrame(syncFrame);syncFrame=requestAnimationFrame(syncAll)}
window.addEventListener('ardua:campaign-progress',scheduleSync);
window.addEventListener('resize',scheduleSync);
map.addEventListener('click',e=>{
 const phase=e.target instanceof Element?e.target.closest('.phase-node[data-phase]'):null;
 if(phase){detailPhaseId=phase.dataset.phase||'';setTimeout(syncDetailTime,0)}
 setTimeout(scheduleSync,0);
});
new MutationObserver(scheduleSync).observe(map,{subtree:true,childList:true});
new MutationObserver(scheduleSync).observe(map,{attributes:true,attributeFilter:['class']});
setTimeout(syncAll,0);setTimeout(syncAll,180);
})();
