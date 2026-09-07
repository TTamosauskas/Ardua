/* Ardua — dedicated campaign phase preview using the native phase-modal visual language. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,GEN=window.ARDUA_GENERATIONS;
const map=$('campaignMap'),engineIntro=$('stellarIntro'),engineStart=$('stellarStartBtn');
if(!C||!G||!map)return;

const PHASE_TIME=Object.freeze({
 bigbang:'Instante inicial do Big Bang',primordial_d:'2 minutos depois do Big Bang',primordial_t:'3 minutos depois do Big Bang',primordial_he3:'3 minutos depois do Big Bang',primordial_he3d:'4 minutos depois do Big Bang',primordial_td:'4 minutos depois do Big Bang',primordial_li:'20 minutos depois do Big Bang',
 atomic_he:'380 mil anos depois do Big Bang',atomic_h:'380 mil anos depois do Big Bang',atomic_li:'380 mil anos depois do Big Bang',first_atomic_bonds:'100–400 mil anos depois do Big Bang',first_nebulae:'100 milhões de anos depois do Big Bang',brown_formation:'100–200 milhões de anos depois do Big Bang',brown:'100–200 milhões de anos depois do Big Bang',first_generation_formation:'200 milhões de anos depois do Big Bang',low_mass_formation:'200 milhões de anos depois do Big Bang',intermediate_mass_formation:'200 milhões de anos depois do Big Bang',high_mass_formation:'200 milhões de anos depois do Big Bang'
});
const EARLY_SEGMENTS=Object.freeze({
 primordial_d:'Universo Primordial - Primeiros Minutos',primordial_t:'Universo Primordial - Primeiros Minutos',primordial_he3:'Universo Primordial - Primeiros Minutos',primordial_he3d:'Universo Primordial - Primeiros Minutos',primordial_td:'Universo Primordial - Primeiros Minutos',primordial_li:'Universo Primordial - Primeiros Minutos',
 atomic_he:'Universo Primordial - Primeiros Átomos',atomic_h:'Universo Primordial - Primeiros Átomos',atomic_li:'Universo Primordial - Primeiros Átomos',
 first_atomic_bonds:'Universo Primordial - Primeiros Gases',first_nebulae:'Universo Primordial - Primeiros Gases',brown_formation:'Universo Primordial - Primeiros Gases',brown:'Universo Primordial - Primeiros Gases',
 first_generation_formation:'1ª Geração - Nascimento Estelar',low_mass_formation:'1ª Geração - Massa Inicial da Nova Estrela',intermediate_mass_formation:'1ª Geração - Massa Inicial da Nova Estrela',high_mass_formation:'1ª Geração - Massa Inicial da Nova Estrela'
});
const GEN_LABEL={first:'1ª Geração',second:'2ª Geração',third:'3ª Geração'};
let source=[];
function parseSource(text){
 const rows=[];for(const raw of String(text||'').split('\n')){if(!raw.includes("{id:'"))continue;const id=raw.match(/\bid:'([^']+)'/)?.[1],branch=raw.match(/\bbranch:'([^']*)'/)?.[1],visual=raw.match(/\bvisual:'([^']+)'/)?.[1],srcTitle=raw.match(/\btitle:'([^']*)'/)?.[1];if(id)rows.push({id,branch:branch||'',visual:visual||'',title:srcTitle||''})}return rows;
}
const sourceReady=fetch(new URL('assets/js/ardua.js',document.baseURI).href,{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(t=>{source=parseSource(t);return source}).catch(()=>[]);
function meta(id){return source.find(x=>x.id===id)||{id,branch:'',visual:'',title:''}}
function phaseName(id){return window.ARDUA_FORGE_NAMES?.[id]||window.ARDUA_PHASE_NAMES?.[id]||map.querySelector(`.phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||meta(id).title||id}
function timeFor(id){if(PHASE_TIME[id])return PHASE_TIME[id];const gen=GEN?.generationOf?.(id);if(gen==='first')return'Mais de 200 milhões de anos depois do Big Bang';if(gen==='second')return'Mais de 500 milhões de anos depois do Big Bang';if(gen==='third')return'Mais de 1 bilhão de anos depois do Big Bang';return'Eras cósmicas depois do Big Bang'}
function segmentFor(id){if(EARLY_SEGMENTS[id])return EARLY_SEGMENTS[id];const row=meta(id),gen=GEN?.generationOf?.(id),prefix=GEN_LABEL[gen];if(prefix&&row.branch)return`${prefix} - ${row.branch}`;return row.branch||prefix||'Campanha Cósmica'}
function visualFor(id){const v=meta(id).visual;if(v)return v;if(id==='bigbang')return'bigBang';if(id.startsWith('primordial_'))return id==='primordial_li'?'primordialLi':(id.includes('he')?'primordialHe':'primordialH');if(id.startsWith('atomic_'))return id==='atomic_li'?'primordialLi':(id==='atomic_he'?'primordialHe':'primordialH');return'nebula'}
function completed(id){return new Set(C.getState?.().completed||[]).has(id)}
function unlocked(id){return !!C.isUnlocked?.(id)}

let preview=$('campaignPhasePreview');
if(!preview){
 preview=document.createElement('div');preview.id='campaignPhasePreview';preview.className='stellar-intro campaign-phase-preview';preview.setAttribute('aria-modal','true');preview.setAttribute('role','dialog');preview.setAttribute('aria-hidden','true');
 preview.innerHTML=`<div class="stellar-card campaign-phase-preview-card">
  <div class="intro-kicker" data-phase-segment></div>
  <h2 data-phase-title></h2>
  <p class="intro-sub" data-phase-time></p>
  <div class="stellar-portrait" aria-hidden="true"><div class="stellar-art nebula" data-phase-art></div></div>
  <div class="phase-modal-actions"><button type="button" class="phase-modal-close" data-phase-preview-close>FECHAR</button><button type="button" class="stellar-start" data-phase-preview-launch>EXPLORAR</button></div>
 </div>`;
 document.body.appendChild(preview);
}
const segment=preview.querySelector('[data-phase-segment]'),title=preview.querySelector('[data-phase-title]'),time=preview.querySelector('[data-phase-time]'),art=preview.querySelector('[data-phase-art]'),close=preview.querySelector('[data-phase-preview-close]'),launch=preview.querySelector('[data-phase-preview-launch]');
let previewId='',bypassMapPhase=false;
function renderPreview(id){if(!id)return;previewId=id;segment.textContent=segmentFor(id);title.textContent=phaseName(id).toUpperCase();time.textContent=timeFor(id);art.className=`stellar-art ${visualFor(id)}`;launch.textContent=completed(id)?'REVISITAR':'EXPLORAR';launch.disabled=!unlocked(id);preview.dataset.phaseId=id}
async function openPreview(id){renderPreview(id);preview.classList.add('show');preview.setAttribute('aria-hidden','false');await sourceReady;if(previewId===id)renderPreview(id)}
function closePreview(){previewId='';preview.classList.remove('show');preview.setAttribute('aria-hidden','true');delete preview.dataset.phaseId}
function visibleNode(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(el=>el.getClientRects().length)||map.querySelector(`.phase-node[data-phase="${id}"]`)}
function dismissEngineIntro(){if(engineIntro?.classList.contains('show'))setTimeout(()=>engineStart?.click(),0)}
function launchPreview(){
 const id=previewId;if(!id||!unlocked(id))return;closePreview();const node=visibleNode(id);if(!node)return;
 bypassMapPhase=true;node.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));bypassMapPhase=false;
 const hiddenLaunch=map.querySelector(`#mapDetail [data-launch="${id}"]`);hiddenLaunch?.click();setTimeout(dismissEngineIntro,35);setTimeout(dismissEngineIntro,140);
}
function activateButton(el,fn){if(!el)return;let lastPointer=0;el.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;lastPointer=performance.now();e.preventDefault();e.stopPropagation();fn()});el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(performance.now()-lastPointer<600)return;fn()})}
activateButton(close,closePreview);activateButton(launch,launchPreview);
preview.addEventListener('click',e=>{if(e.target===preview)closePreview()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&preview.classList.contains('show')){e.preventDefault();closePreview()}});
map.addEventListener('click',e=>{if(bypassMapPhase)return;const node=e.target instanceof Element?e.target.closest('.phase-node[data-phase]'):null;if(!node)return;e.preventDefault();e.stopImmediatePropagation();openPreview(node.dataset.phase)},true);

/* The map owns the screen whenever it is visible. */
function yieldEngineIntro(){if(map.classList.contains('show'))dismissEngineIntro()}
new MutationObserver(yieldEngineIntro).observe(map,{attributes:true,attributeFilter:['class']});
window.addEventListener('ardua:campaign-progress',()=>{if(previewId)renderPreview(previewId)});
window.addEventListener('ardua:forge-names',()=>{if(previewId)renderPreview(previewId)});
sourceReady.then(()=>{if(previewId)renderPreview(previewId);yieldEngineIntro()});
})();
