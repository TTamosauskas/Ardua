/* Ardua — use the existing phase portrait modal as the campaign phase preview. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH,GEN=window.ARDUA_GENERATIONS;
const map=$('campaignMap'),intro=$('stellarIntro'),card=intro?.querySelector('.stellar-card'),engineStart=$('stellarStartBtn'),kicker=$('introKicker'),title=$('introTitle'),sub=$('introSub'),line=$('introLine'),art=$('stellarArt');
if(!C||!G||!map||!intro||!card||!engineStart||!kicker||!title||!sub||!art)return;

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
function phaseName(id){return window.ARDUA_PHASE_NAMES?.[id]||window.ARDUA_FORGE_NAMES?.[id]||map.querySelector(`.phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||meta(id).title||id}
function timeFor(id){if(PHASE_TIME[id])return PHASE_TIME[id];const gen=GEN?.generationOf?.(id);if(gen==='first')return'Mais de 200 milhões de anos depois do Big Bang';if(gen==='second')return'Mais de 500 milhões de anos depois do Big Bang';if(gen==='third')return'Mais de 1 bilhão de anos depois do Big Bang';return'Eras cósmicas depois do Big Bang'}
function segmentFor(id){if(EARLY_SEGMENTS[id])return EARLY_SEGMENTS[id];const row=meta(id),gen=GEN?.generationOf?.(id),prefix=GEN_LABEL[gen];if(prefix&&row.branch)return`${prefix} - ${row.branch}`;return row.branch||prefix||'Campanha Cósmica'}
function visualFor(id){const v=meta(id).visual;if(v)return v;if(id==='bigbang')return'bigBang';if(id.startsWith('primordial_'))return id==='primordial_li'?'primordialLi':(id.includes('he')?'primordialHe':'primordialH');if(id.startsWith('atomic_'))return id==='atomic_li'?'primordialLi':(id==='atomic_he'?'primordialHe':'primordialH');return'nebula'}

/* Keep the engine's original start button alive off-DOM so its private close handler remains callable. */
const actionStart=engineStart.cloneNode(true);engineStart.replaceWith(actionStart);
const actions=document.createElement('div');actions.className='phase-modal-actions';actionStart.replaceWith(actions);
const close=document.createElement('button');close.type='button';close.className='phase-modal-close';close.textContent='FECHAR';actions.append(close,actionStart);
if(line){line.textContent='';line.hidden=true}
let previewId='',bypassMapPhase=false,autoDismissEngine=false,lastTap=0;
function completed(id){return new Set(C.getState?.().completed||[]).has(id)}
function unlocked(id){return !!C.isUnlocked?.(id)}
function renderModal(id,preview){if(!id)return;const can=unlocked(id),done=completed(id);kicker.textContent=segmentFor(id);title.textContent=phaseName(id).toUpperCase();sub.textContent=timeFor(id);if(line){line.textContent='';line.hidden=true}art.className=`stellar-art ${visualFor(id)}`;actionStart.textContent=done?'REVISITAR':'EXPLORAR';actionStart.disabled=preview&&!can;intro.dataset.phaseModalId=id;intro.dataset.phasePreview=preview?'1':'0'}
async function openPreview(id){previewId=id;renderModal(id,true);intro.classList.add('show');intro.setAttribute('aria-hidden','false');await sourceReady;if(previewId===id)renderModal(id,true)}
function closePreview(){previewId='';intro.classList.remove('show');intro.setAttribute('aria-hidden','true');delete intro.dataset.phasePreview}
function visibleNode(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(el=>el.getClientRects().length)||map.querySelector(`.phase-node[data-phase="${id}"]`)}
function launchPreview(){
 const id=previewId;if(!id||!unlocked(id))return;closePreview();const node=visibleNode(id);if(!node)return;
 bypassMapPhase=true;node.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));bypassMapPhase=false;
 const launch=map.querySelector(`#mapDetail [data-launch="${id}"]`);if(!launch)return;autoDismissEngine=true;launch.click();setTimeout(()=>{if(autoDismissEngine&&intro.classList.contains('show')){autoDismissEngine=false;engineStart.click()}},35);
}
function bindTap(el,fn){el.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;lastTap=performance.now();e.preventDefault();e.stopPropagation();fn()},true);el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(performance.now()-lastTap<500)return;fn()},true)}
bindTap(close,()=>{if(previewId)closePreview();else engineStart.click()});
bindTap(actionStart,()=>{if(previewId)launchPreview();else engineStart.click()});
map.addEventListener('click',e=>{if(bypassMapPhase)return;const node=e.target instanceof Element?e.target.closest('.phase-node[data-phase]'):null;if(!node)return;e.preventDefault();e.stopImmediatePropagation();openPreview(node.dataset.phase)},true);

/* Engine-generated phase intros use the same compact information layout. */
function syncEngineModal(){if(!intro.classList.contains('show')||previewId)return;const id=C.getState?.().activeId;if(!id)return;renderModal(id,false);if(autoDismissEngine){autoDismissEngine=false;setTimeout(()=>engineStart.click(),0)}}
function yieldToMap(){if(map.classList.contains('show')&&intro.classList.contains('show')&&!previewId){autoDismissEngine=false;engineStart.click()}}
new MutationObserver(syncEngineModal).observe(intro,{attributes:true,attributeFilter:['class']});
new MutationObserver(yieldToMap).observe(map,{attributes:true,attributeFilter:['class']});
window.addEventListener('ardua:campaign-progress',()=>{if(previewId)renderModal(previewId,true);else syncEngineModal()});
window.addEventListener('ardua:forge-names',()=>{if(previewId)renderModal(previewId,true);else syncEngineModal()});
sourceReady.then(()=>{if(previewId)renderModal(previewId,true);else syncEngineModal();yieldToMap()});
})();
