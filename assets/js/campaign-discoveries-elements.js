/* Ardua — element-first discoveries: two tabs, phase-style element overlay and related unlocked phases. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const modal=$('menuModal'),catalog=$('catalog'),catalogDetail=$('catalogDetail'),card=modal?.querySelector('.card');
if(!C||!G||!modal||!catalog||!card)return;

function parseSource(text){
 const phases=[],colors={},weights={};
 for(const line of String(text||'').split('\n')){
  if(line.includes("{id:'")){
   const id=line.match(/\bid:'([^']+)'/)?.[1],title=line.match(/\btitle:'([^']*)'/)?.[1],meta=line.match(/\bmeta:'([^']*)'/)?.[1],newSym=line.match(/\bnew:'([^']+)'/)?.[1],target=Number(line.match(/\btarget:(\d+)/)?.[1]||0);
   if(id)phases.push({id,title:title||id,meta:meta||'',newSym:newSym||'',target});
  }
  const em=line.match(/^\s*(?:'([^']+)'|([A-Za-z][A-Za-z0-9+]*)):\{n:(\d+).*?c:\['([^']+)','([^']+)','([^']+)'\]/);
  if(em)colors[em[1]||em[2]]=[em[4],em[5],em[6]];
 }
 const block=String(text||'').match(/const ATOMIC_WEIGHTS=\{([\s\S]*?)\n\};/i)?.[1]||'';
 for(const m of block.matchAll(/([A-Za-z][A-Za-z0-9]*):'([^']+)'/g))weights[m[1]]=m[2];
 return{phases,colors,weights};
}
function sourceMeta(){
 if(window.ARDUA_PHASE_SOURCE_META_PROMISE)return window.ARDUA_PHASE_SOURCE_META_PROMISE;
 const url=new URL('assets/js/ardua.js',document.baseURI).href;
 window.ARDUA_PHASE_SOURCE_META_PROMISE=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parseSource).catch(()=>({phases:[],colors:{},weights:{}}));
 return window.ARDUA_PHASE_SOURCE_META_PROMISE;
}
sourceMeta();

function enforceTwoTabs(){
 const tabs=$('discoveriesTabs');if(!tabs)return;
 tabs.querySelector('[data-discovery-tab="reactions"]')?.remove();
 const reactionPanel=modal.querySelector('[data-discovery-panel="reactions"]');if(reactionPanel)reactionPanel.hidden=true;
 const elementBtn=tabs.querySelector('[data-discovery-tab="elements"]'),phenomenaBtn=tabs.querySelector('[data-discovery-tab="phenomena"]');
 if(!elementBtn||!phenomenaBtn)return;
 if(!elementBtn.classList.contains('active')&&!phenomenaBtn.classList.contains('active'))elementBtn.click();
}
function scheduleTabs(){requestAnimationFrame(()=>requestAnimationFrame(enforceTwoTabs))}
new MutationObserver(scheduleTabs).observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
$('campaignData')?.addEventListener('click',scheduleTabs);
window.addEventListener('ardua:campaign-progress',scheduleTabs);
setTimeout(enforceTwoTabs,0);

const supers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
function recipeTokens(text,leftOnly=false){
 let s=String(text||'');if(leftOnly)s=s.split('→')[0]||s;
 s=s.replace(/²H/g,' D ').replace(/³H/g,' T ').replace(/³He/g,' He3 ').replace(/⁷Be/g,' Be7 ').replace(/⁸Be/g,' Be8 ').replace(/¹³C/g,' C13 ').replace(/²²Ne/g,' Ne22 ');
 s=s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>supers[c]||'');
 return s.match(/He3|Be7|Be8|C13|Ne22|\bD\b|\bT\b|[A-Z][a-z]?/g)||[];
}
function phaseTitle(id,fallback=''){
 return window.ARDUA_PHASE_NAMES?.[id]||mapTitle(id)||fallback||id;
}
function mapTitle(id){return document.querySelector(`.phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${id}"] strong`)?.textContent?.trim()||''}
function learnedRecipeLabels(sym,phases){
 const labels=new Set(),done=new Set(C.getState().completed||[]);
 for(const host of [$('reactionCatalog'),$('protonCaptureCatalog')])host?.querySelectorAll('.reaction-chip').forEach(chip=>{if(!chip.hidden&&recipeTokens(chip.textContent).includes(sym))labels.add(chip.textContent.trim())});
 for(const p of phases)if(done.has(p.id)&&p.meta.includes('→')&&recipeTokens(p.meta).includes(sym))labels.add(p.meta.trim());
 return [...labels].filter(Boolean);
}
function unlockedTargetPhases(sym,phases){
 const st=C.getState(),done=new Set(st.completed||[]);
 return phases.filter(p=>p.meta.includes('→')&&recipeTokens(p.meta,true).includes(sym)&&(C.isUnlocked(p.id)||done.has(p.id)||st.activeId===p.id));
}
function detailData(elementCard){
 const spans=[...(catalogDetail?.querySelectorAll(':scope > span')||[])],p=catalogDetail?.querySelector(':scope > p');
 return{
  sym:elementCard.querySelector('.s')?.textContent?.trim()||'',
  name:elementCard.querySelector('.nm')?.textContent?.trim()||'',
  z:elementCard.querySelector('.n')?.textContent?.trim()||'',
  origin:spans[0]?.textContent?.trim()||'',
  fact:p?.textContent?.trim()||''
 };
}
let overlay=$('elementDiscoveryOverlay');
function ensureOverlay(){
 if(overlay)return overlay;
 overlay=document.createElement('section');overlay.id='elementDiscoveryOverlay';overlay.className='element-discovery-overlay';overlay.hidden=true;
 overlay.innerHTML=`<header class="element-discovery-head"><strong>Elemento</strong><button type="button" data-element-overlay-close aria-label="Fechar elemento">×</button></header><div id="elementDiscoveryBody"></div>`;
 card.appendChild(overlay);
 overlay.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-element-overlay-close]')){overlay.hidden=true;overlay.removeAttribute('data-open')}});
 return overlay;
}
async function showElementOverlay(elementCard){
 const d=detailData(elementCard),host=ensureOverlay(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;
 const src=await sourceMeta(),colors=src.colors[d.sym]||['#f7fbff','#b9cbe1','#667b94'],weight=src.weights[d.sym]||'—',recipes=learnedRecipeLabels(d.sym,src.phases),phases=unlockedTargetPhases(d.sym,src.phases);
 const gradient=`radial-gradient(circle at 30% 20%,${colors[0]},${colors[1]} 46%,${colors[2]} 100%)`;
 body.innerHTML=`<div class="info-panel discovery-element-info">
  <div class="info-tile" style="background:${gradient}"><span class="info-z">${d.z}</span><strong class="info-symbol">${d.sym}</strong><span class="info-name">${d.name}</span><span class="info-mass">${weight}</span></div>
  <div class="info-copy"><div class="discovery-element-origin">${d.origin}</div><div class="info-fact">${d.fact}</div><div class="info-recipes-title">Receitas descobertas</div><div class="info-recipes">${recipes.length?recipes.map(x=>`<span class="info-recipe">${x}</span>`).join(''):'<span class="info-empty">Receitas surgem aqui conforme são descobertas.</span>'}</div></div>
 </div>
 <div class="element-related-phases"><strong>Fases desbloqueadas em que participa da receita alvo</strong><div>${phases.length?phases.map(p=>`<span class="element-phase-chip">${phaseTitle(p.id,p.title)}</span>`).join(''):'<span class="element-phase-empty">A trilha ainda irá revelar uma fase-alvo com este elemento.</span>'}</div></div>`;
 host.dataset.open='1';host.hidden=false;host.scrollTop=0;
}

/* Let the engine populate its scientific detail first; then lift that content into the phase-style overlay. */
catalog.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;
 setTimeout(()=>showElementOverlay(el),0);
});
modal.addEventListener('click',e=>{const tab=e.target instanceof Element?e.target.closest('[data-discovery-tab]'):null;if(tab&&tab.dataset.discoveryTab!=='elements'&&overlay)overlay.hidden=true});
})();
