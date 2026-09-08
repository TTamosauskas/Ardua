/* Ardua — discoveries element detail as an in-place view with canonical Wikipedia/local-image/Periodic Videos sources. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const modal=$('menuModal'),catalog=$('catalog'),catalogDetail=$('catalogDetail'),card=modal?.querySelector('.card'),heading=card?.querySelector(':scope > h2');
if(!C||!G||!modal||!catalog||!card)return;

if(!document.querySelector('link[data-ardua-element-detail-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-discoveries-elements.css',document.baseURI).href;link.dataset.arduaElementDetailStyle='1';document.head.appendChild(link);
}

const WIKI_API='https://pt.wikipedia.org/w/api.php';
const ELEMENT_SOURCES_URL=new URL('assets/data/element-sources.json',document.baseURI).href;
const PERIODIC_PLAYLIST='PL7A1F4CF36C085DE1';
const wikiCache=new Map();
let elementSourcesPromise=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function elementSources(){
 if(elementSourcesPromise)return elementSourcesPromise;
 elementSourcesPromise=fetch(ELEMENT_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('element sources unavailable'))).catch(()=>({}));
 return elementSourcesPromise;
}

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
elementSources();

function firstCreationPhases(phases){
 const byId=new Map((phases||[]).map(p=>[p.id,p])),first=new Map(),order=G.baseOrder||G.runtimeOrder||[];
 for(const id of order){const p=byId.get(id);if(p?.newSym&&!first.has(p.newSym))first.set(p.newSym,[id])}
 if(byId.has('primordial_he3d')&&byId.has('primordial_td'))first.set('He',['primordial_he3d','primordial_td']);
 return first;
}
let creationGateSerial=0;
async function enforceElementCreationGate(){
 if(!modal.classList.contains('discoveries-view'))return;
 const serial=++creationGateSerial,src=await sourceMeta();if(serial!==creationGateSerial)return;
 const first=firstCreationPhases(src.phases),done=new Set(C.getState?.().completed||[]),editor=!!C.editor;let visible=0;
 catalog.querySelectorAll('.el-card').forEach(elementCard=>{
  const sym=elementCard.querySelector('.s')?.textContent?.trim()||'',required=first.get(sym)||[],show=editor||required.some(id=>done.has(id)),shouldHide=!show;
  if(elementCard.hidden!==shouldHide)elementCard.hidden=shouldHide;
  if(show)visible++;
 });
 const empties=[...catalog.querySelectorAll(':scope > .discovery-empty')];
 if(visible)empties.forEach(el=>el.remove());
 else if(!empties.length){const empty=document.createElement('div');empty.className='discovery-empty';empty.textContent='Os elementos aparecem aqui depois que sua primeira fase de criação é concluída.';catalog.appendChild(empty)}
}

function enforceTwoTabs(){
 const tabs=$('discoveriesTabs');if(!tabs)return;
 tabs.querySelector('[data-discovery-tab="reactions"]')?.remove();
 const reactionPanel=modal.querySelector('[data-discovery-panel="reactions"]');if(reactionPanel)reactionPanel.hidden=true;
 const elementBtn=tabs.querySelector('[data-discovery-tab="elements"]'),phenomenaBtn=tabs.querySelector('[data-discovery-tab="phenomena"]');
 if(!elementBtn||!phenomenaBtn)return;
 if(!elementBtn.classList.contains('active')&&!phenomenaBtn.classList.contains('active'))elementBtn.click();
}
function scheduleTabs(){requestAnimationFrame(()=>requestAnimationFrame(()=>{enforceTwoTabs();enforceElementCreationGate()}))}
new MutationObserver(scheduleTabs).observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
$('campaignData')?.addEventListener('click',scheduleTabs);
window.addEventListener('ardua:campaign-progress',scheduleTabs);
setTimeout(()=>{enforceTwoTabs();enforceElementCreationGate()},0);

const supers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
function recipeTokens(text){
 let s=String(text||'');
 s=s.replace(/²H/g,' D ').replace(/³H/g,' T ').replace(/³He/g,' He3 ').replace(/⁷Be/g,' Be7 ').replace(/⁸Be/g,' Be8 ').replace(/¹³C/g,' C13 ').replace(/²²Ne/g,' Ne22 ');
 s=s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>supers[c]||'');
 return s.match(/He3|Be7|Be8|C13|Ne22|\bD\b|\bT\b|[A-Z][a-z]?/g)||[];
}
function phaseTitle(id,fallback=''){return window.ARDUA_PHASE_NAMES?.[id]||mapTitle(id)||fallback||id}
const cssEsc=s=>window.CSS?.escape?CSS.escape(String(s)):String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
function mapTitle(id){const q=cssEsc(id);return document.querySelector(`.phase-node[data-phase="${q}"] strong`)?.textContent?.trim()||document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${q}"] strong`)?.textContent?.trim()||''}
function relatedPhases(sym,phases){
 const st=C.getState(),done=new Set(st.completed||[]);
 return phases.filter(p=>p.meta.includes('→')&&recipeTokens(p.meta).includes(sym)&&(C.isUnlocked(p.id)||done.has(p.id)||st.activeId===p.id));
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

function stripDelimited(text,re){
 let out=String(text||''),prev='';
 for(let i=0;i<8&&out!==prev;i++){prev=out;out=out.replace(re,' ')}
 return out;
}
function cleanWikiIntro(text){
 let intro=String(text||'').replace(/\r/g,' ').trim();
 intro=stripDelimited(intro,/\([^()]*\)/g);
 intro=stripDelimited(intro,/\[[^\[\]]*\]/g);
 intro=stripDelimited(intro,/\{[^{}]*\}/g);
 intro=intro
  .replace(/<[^>]*>/g,' ')
  .replace(/\bnota\s*\d+\b/gi,' ')
  .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+(?=\s|[.,;:!?]|$)/g,'')
  .replace(/\s+([,.;:!?])/g,'$1')
  .replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g,'$1 ')
  .replace(/\s{2,}/g,' ')
  .trim();
 return intro;
}
function firstWikiParagraph(html){
 try{
  const doc=new DOMParser().parseFromString(String(html||''),'text/html');
  const candidates=[...doc.querySelectorAll('.mw-parser-output > p')];
  const paragraph=candidates.find(p=>String(p.textContent||'').replace(/\s+/g,' ').trim().length>40);
  if(!paragraph)return'';
  paragraph.querySelectorAll('sup,.reference,.mw-ref,.mw-editsection,.mw-valign-text-top,.mw-valign-text-bottom').forEach(el=>el.remove());
  return cleanWikiIntro(paragraph.textContent||'');
 }catch(_e){return''}
}
function firstExtractParagraph(text){
 const first=String(text||'').replace(/\r/g,'').split(/\n\s*\n/).map(x=>x.trim()).find(x=>x.length>40)||'';
 return cleanWikiIntro(first);
}
function wikiFallbackUrl(name){return `https://pt.wikipedia.org/wiki/${encodeURIComponent(String(name||'').trim().replace(/\s+/g,'_'))}`}
async function wikiData(d){
 const key=d.sym;if(wikiCache.has(key))return wikiCache.get(key);
 const promise=elementSources().then(async sources=>{
  const cfg=sources[d.sym]||{},title=cfg.wikiTitle||d.name;
  const parseParams=new URLSearchParams({origin:'*',action:'parse',format:'json',formatversion:'2',redirects:'1',prop:'text|displaytitle',page:title});
  const metaParams=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',prop:'info|extracts',inprop:'url',exintro:'1',explaintext:'1',titles:title});
  const parseReq=fetch(`${WIKI_API}?${parseParams.toString()}`,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject(new Error('wiki parse unavailable'))).catch(()=>null);
  const metaReq=fetch(`${WIKI_API}?${metaParams.toString()}`,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject(new Error('wiki metadata unavailable'))).catch(()=>null);
  const [parsed,meta]=await Promise.all([parseReq,metaReq]),page=meta?.query?.pages?.[0]||{},resolvedTitle=cfg.wikiResolvedTitle||page.title||parsed?.parse?.title||title;
  return{
   title:resolvedTitle,
   url:cfg.wikiUrl||page.fullurl||wikiFallbackUrl(resolvedTitle),
   image:cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'',
   intro:firstWikiParagraph(parsed?.parse?.text)||firstExtractParagraph(page.extract)||d.fact||''
  };
 }).catch(()=>({title:d.name,url:wikiFallbackUrl(d.name),image:'',intro:d.fact||''}));
 wikiCache.set(key,promise);return promise;
}
function periodicVideoUrl(d,sources){
 const id=sources?.[d.sym]?.periodicVideoId;
 if(id)return`https://www.youtube.com/watch?v=${id}`;
 const z=Math.max(1,Number(String(d.z).replace(/\D/g,''))||1);
 return`https://www.youtube.com/embed/videoseries?list=${PERIODIC_PLAYLIST}&index=${Math.max(0,z-1)}`;
}

let detail=$('elementDiscoveryDetail');
function ensureDetail(){
 document.getElementById('elementDiscoveryOverlay')?.remove();
 if(detail)return detail;
 detail=document.createElement('section');
 detail.id='elementDiscoveryDetail';
 detail.className='element-discovery-detail';
 detail.hidden=true;
 detail.innerHTML=`<header class="element-discovery-head"><strong data-element-detail-title></strong></header><div id="elementDiscoveryBody"></div>`;
 const tabs=$('discoveriesTabs');
 (tabs||heading)?.insertAdjacentElement('afterend',detail);
 detail.addEventListener('click',e=>{
  const phase=e.target instanceof Element?e.target.closest('[data-element-phase]'):null;
  if(phase){e.preventDefault();openPhase(phase.dataset.elementPhase)}
 });
 return detail;
}
function setDetailMode(on){
 const tabs=$('discoveriesTabs');
 if(tabs)tabs.hidden=false;
 modal.classList.toggle('element-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
}
function leaveElementDetail(restoreTab=true){
 const host=ensureDetail();host.hidden=true;host.removeAttribute('data-open');delete host.dataset.sym;setDetailMode(false);
 if(restoreTab)$('discoveriesTabs')?.querySelector('[data-discovery-tab="elements"]')?.click();
 requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}
function openPhase(id){
 if(!id)return;
 leaveElementDetail();
 const q=cssEsc(id),jump=document.querySelector(`#phaseMenu .phase-jump[data-phase-id="${q}"]`);
 $('closeMenu')?.click();
 setTimeout(()=>{
  if(jump){C.setActive(id);jump.click();return}
  const nodes=[...document.querySelectorAll(`#campaignMap .phase-node[data-phase="${q}"]`)],visible=nodes.find(n=>n.getClientRects().length);
  (visible||nodes[0])?.click();
 },40);
}
function atomicTile(d,gradient,weight){
 return`<div class="info-tile element-atomic-square" style="background:${gradient}"><span class="info-z">${esc(d.z)}</span><strong class="info-symbol">${esc(d.sym)}</strong><span class="info-mass">${esc(weight)}</span></div>`;
}
function loadingMarkup(d,gradient,weight){
 return`<div class="element-wiki-loading">
  <div class="element-wiki-image-shell"><div class="element-wiki-image-placeholder">WIKIPÉDIA</div></div>
  <div class="info-panel discovery-element-info element-wiki-info">
   ${atomicTile(d,gradient,weight)}
   <div class="element-wiki-copy"><p>Carregando o primeiro parágrafo do artigo…</p></div>
  </div>
 </div>`;
}
function phaseMarkup(phases){
 if(!phases.length)return'<span class="element-phase-empty">A trilha irá revelar fases relacionadas a este elemento conforme a campanha avança.</span>';
 return phases.map(p=>`<button type="button" class="element-phase-chip" data-element-phase="${esc(p.id)}">${esc(phaseTitle(p.id,p.title))}</button>`).join('');
}
async function showElementDetail(elementCard){
 const d=detailData(elementCard),host=ensureDetail(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;
 const [src,sources]=await Promise.all([sourceMeta(),elementSources()]),colors=src.colors[d.sym]||['#f7fbff','#b9cbe1','#667b94'],weight=src.weights[d.sym]||'—',phases=relatedPhases(d.sym,src.phases),gradient=`radial-gradient(circle at 30% 20%,${colors[0]},${colors[1]} 46%,${colors[2]} 100%)`;
 setDetailMode(true);host.dataset.open='1';host.dataset.sym=d.sym;host.hidden=false;host.setAttribute('aria-busy','true');const title=host.querySelector('[data-element-detail-title]');if(title)title.textContent=d.name;body.innerHTML=loadingMarkup(d,gradient,weight);card.scrollTo({top:0,behavior:'auto'});
 const wiki=await wikiData(d);
 if(host.hidden||host.dataset.sym!==d.sym)return;
 host.removeAttribute('aria-busy');
 const image=wiki.image?`<img class="element-wiki-image" src="${esc(wiki.image)}" alt="${esc(d.name)}" loading="eager">`:`<div class="element-wiki-image-placeholder">${esc(d.sym)}</div>`;
 body.innerHTML=`<figure class="element-wiki-figure">${image}</figure>
  <div class="info-panel discovery-element-info element-wiki-info">
   ${atomicTile(d,gradient,weight)}
   <div class="element-wiki-copy"><p>${esc(wiki.intro)}</p></div>
  </div>
  <div class="element-related-phases"><strong>Aparece em:</strong><div>${phaseMarkup(phases)}</div></div>
  <div class="element-source-actions">
   <a class="element-source-btn" href="${esc(wiki.url)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
   <a class="element-source-btn" href="${esc(periodicVideoUrl(d,sources))}" target="_blank" rel="noopener noreferrer">Periodic Videos</a>
  </div>`;
 host.scrollTop=0;
}

catalog.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;
 setTimeout(()=>showElementDetail(el),0);
});
modal.addEventListener('click',e=>{
 const tab=e.target instanceof Element?e.target.closest('[data-discovery-tab]'):null;
 if(tab&&detail&&!detail.hidden)leaveElementDetail(false);
});
$('closeMenu')?.addEventListener('click',()=>{if(detail&&!detail.hidden){detail.hidden=true;detail.removeAttribute('data-open');delete detail.dataset.sym;detail.removeAttribute('aria-busy');setDetailMode(false)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail&&!detail.hidden){e.preventDefault();e.stopImmediatePropagation();leaveElementDetail()}},true);
})();
