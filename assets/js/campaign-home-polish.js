/* Ardua — final campaign-home behavior: compact chrome, immediate states, progressive chapters and cosmic time. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,GEN=window.ARDUA_GENERATIONS;
const map=$('campaignMap'),head=map?.querySelector('.campaign-head'),actions=head?.querySelector('.campaign-head-actions'),dataBtn=$('campaignData'),closeBtn=$('campaignClose');
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
   <button type="button" id="campaignHomeDiscoveries"><span>Descobertas</span><small>Reações, elementos e fenômenos</small></button>
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
soundBtn?.addEventListener('click',()=>applySound(!soundtrackEnabled()));
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

const EARLY_TIME=Object.freeze({
 bigbang:'instante inicial',
 primordial_d:'≈ 2 minutos depois',
 primordial_t:'≈ 3 minutos depois',
 primordial_he3:'≈ 3 minutos depois',
 primordial_he3d:'≈ 4 minutos depois',
 primordial_td:'≈ 4 minutos depois',
 primordial_li:'≈ 20 minutos depois',
 atomic_he:'≈ 380 mil anos depois',
 atomic_h:'≈ 380 mil anos depois',
 atomic_li:'≈ 380 mil anos depois',
 first_atomic_bonds:'≈ 100–400 mil anos depois',
 first_nebulae:'≈ 100 milhões de anos depois',
 brown_formation:'≈ 100–200 milhões de anos depois',
 brown:'≈ 100–200 milhões de anos depois',
 first_generation_formation:'≈ 200 milhões de anos depois',
 low_mass_formation:'≈ 200 milhões de anos depois',
 intermediate_mass_formation:'≈ 200 milhões de anos depois',
 high_mass_formation:'≈ 200 milhões de anos depois'
});
function nextPlayableId(){
 const st=C.getState(),done=new Set(st.completed||[]);
 if(!st.introduced)return'bigbang';
 if(st.activeId&&st.activeId!=='bigbang'&&!done.has(st.activeId)&&C.isUnlocked(st.activeId))return st.activeId;
 return (G.runtimeOrder||[]).find(id=>id!=='bigbang'&&!done.has(id)&&C.isUnlocked(id))||st.activeId||'bigbang';
}
function timeFor(id){
 if(EARLY_TIME[id])return EARLY_TIME[id];
 const generation=GEN?.generationOf?.(id);
 if(generation==='first')return'≥ 200 milhões de anos depois';
 if(generation==='second')return'≥ 500 milhões de anos depois';
 if(generation==='third')return'≥ 1 bilhão de anos depois';
 return'eras cósmicas depois';
}
let footer=$('campaignTimeFooter');
if(!footer){footer=document.createElement('div');footer.id='campaignTimeFooter';footer.className='campaign-time-footer';footer.setAttribute('aria-live','polite');map.appendChild(footer)}
function syncTimeFooter(){const id=nextPlayableId(),text=timeFor(id);footer.dataset.phaseTime=id;footer.innerHTML=`<strong>${text}</strong>`}

let syncFrame=0;
function syncAll(){syncFrame=0;syncPhaseStates();syncChapterVisibility();syncTimeFooter();syncReturn()}
function scheduleSync(){if(syncFrame)cancelAnimationFrame(syncFrame);syncFrame=requestAnimationFrame(syncAll)}
window.addEventListener('ardua:campaign-progress',scheduleSync);
window.addEventListener('resize',scheduleSync);
map.addEventListener('click',()=>setTimeout(scheduleSync,0));
new MutationObserver(scheduleSync).observe(map,{subtree:true,childList:true});
setTimeout(syncAll,0);setTimeout(syncAll,180);
})();
