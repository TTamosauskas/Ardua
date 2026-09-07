/* Ardua — discoveries element detail as an in-place view with Wikipedia context and related phases. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const modal=$('menuModal'),catalog=$('catalog'),catalogDetail=$('catalogDetail'),card=modal?.querySelector('.card'),heading=card?.querySelector(':scope > h2');
if(!C||!G||!modal||!catalog||!card)return;

if(!document.querySelector('link[data-ardua-element-detail-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-discoveries-elements.css',document.baseURI).href;link.dataset.arduaElementDetailStyle='1';document.head.appendChild(link);
}

const WIKI_API='https://pt.wikipedia.org/w/api.php';
const PERIODIC_PLAYLIST='PL7A1F4CF36C085DE1';
const PERIODIC_VIDEO_IDS=Object.freeze({
 H:'6rdmpx39PRk',
 He:'M6xZZiaLOV4',
 Li:'LfS10ArXTBA',
 Be:'qy8JyQShZRA',
 B:'JzqdHkpXuy4',
 O:'WuG5WTId-IY',
 F:'vtWp45Eewtw',
 Na:'7IT2I3LtlNE',
 Mg:'FKkWdizutxI',
 Cl:'BXCfBl4rmh0',
 K:'pPdevJTGAYY',
 Br:'Slt3_5upuSs',
 I:'JUBsJLRSM64',
 U:'B8vVZTvJNGk'
});
const WIKI_TITLES=Object.freeze({H:'Hidrogénio'});
const wikiCache=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
 const chunks=String(text||'').replace(/\r/g,'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 let intro=chunks.find(x=>x.length>60)||chunks[0]||'';
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
function wikiFallbackUrl(name){return `https://pt.wikipedia.org/wiki/${encodeURIComponent(String(name||'').trim().replace(/\s+/g,'_'))}`}
async function wikiData(d){
 const key=d.sym;if(wikiCache.has(key))return wikiCache.get(key);
 const title=WIKI_TITLES[d.sym]||d.name;
 const params=new URLSearchParams({
  origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',
  prop:'extracts|pageimages|info',inprop:'url',exintro:'1',explaintext:'1',
  piprop:'thumbnail',pithumbsize:'900',titles:title
 });
 const promise=fetch(`${WIKI_API}?${params.toString()}`,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject(new Error('wiki unavailable'))).then(json=>{
  const page=json?.query?.pages?.[0]||{};
  return{
   title:page.title||title,
   url:page.fullurl||wikiFallbackUrl(page.title||title),
   image:page.thumbnail?.source||'',
   intro:cleanWikiIntro(page.extract)||d.fact||''
  };
 }).catch(()=>({title,url:wikiFallbackUrl(title),image:'',intro:d.fact||''}));
 wikiCache.set(key,promise);return promise;
}
function periodicVideoUrl(d){
 const id=PERIODIC_VIDEO_IDS[d.sym];
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
 detail.innerHTML=`<header class="element-discovery-head"><strong>Elemento</strong><button type="button" class="element-detail-back" data-element-detail-back><span aria-hidden="true">←</span> Voltar</button></header><div id="elementDiscoveryBody"></div>`;
 const tabs=$('discoveriesTabs');
 (tabs||heading)?.insertAdjacentElement('afterend',detail);
 detail.addEventListener('click',e=>{
  const back=e.target instanceof Element?e.target.closest('[data-element-detail-back]'):null;
  if(back){e.preventDefault();leaveElementDetail();return}
  const phase=e.target instanceof Element?e.target.closest('[data-element-phase]'):null;
  if(phase){e.preventDefault();openPhase(phase.dataset.elementPhase)}
 });
 return detail;
}
function setDetailMode(on){
 const tabs=$('discoveriesTabs');
 if(tabs)tabs.hidden=on;
 modal.classList.toggle('element-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{
  if(on)panel.hidden=true;
 });
 if(!on){
  const elementBtn=tabs?.querySelector('[data-discovery-tab="elements"]');
  if(elementBtn)elementBtn.click();
 }
}
function leaveElementDetail(){
 const host=ensureDetail();host.hidden=true;host.removeAttribute('data-open');delete host.dataset.sym;setDetailMode(false);requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
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
function loadingMarkup(d,gradient,weight){
 return`<div class="element-wiki-loading">
  <div class="element-wiki-image-shell"><div class="element-wiki-image-placeholder">WIKIPÉDIA</div></div>
  <div class="info-panel discovery-element-info element-wiki-info">
   <div class="info-tile" style="background:${gradient}"><span class="info-z">${esc(d.z)}</span><strong class="info-symbol">${esc(d.sym)}</strong><span class="info-name">${esc(d.name)}</span><span class="info-mass">${esc(weight)}</span></div>
   <div class="element-wiki-copy"><h3>${esc(d.name)}</h3><p>Carregando o texto do artigo…</p></div>
  </div>
 </div>`;
}
function phaseMarkup(phases){
 if(!phases.length)return'<span class="element-phase-empty">A trilha irá revelar fases relacionadas a este elemento conforme a campanha avança.</span>';
 return phases.map(p=>`<button type="button" class="element-phase-chip" data-element-phase="${esc(p.id)}"><strong>${esc(phaseTitle(p.id,p.title))}</strong>${p.meta?`<small>${esc(p.meta)}</small>`:''}</button>`).join('');
}
async function showElementDetail(elementCard){
 const d=detailData(elementCard),host=ensureDetail(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;
 const src=await sourceMeta(),colors=src.colors[d.sym]||['#f7fbff','#b9cbe1','#667b94'],weight=src.weights[d.sym]||'—',phases=relatedPhases(d.sym,src.phases),gradient=`radial-gradient(circle at 30% 20%,${colors[0]},${colors[1]} 46%,${colors[2]} 100%)`;
 setDetailMode(true);host.dataset.open='1';host.dataset.sym=d.sym;host.hidden=false;host.setAttribute('aria-busy','true');body.innerHTML=loadingMarkup(d,gradient,weight);card.scrollTo({top:0,behavior:'auto'});
 const wiki=await wikiData(d);
 if(host.hidden||host.dataset.sym!==d.sym)return;
 host.removeAttribute('aria-busy');
 const image=wiki.image?`<img class="element-wiki-image" src="${esc(wiki.image)}" alt="${esc(d.name)} — imagem do artigo da Wikipédia" loading="eager" referrerpolicy="no-referrer">`:`<div class="element-wiki-image-placeholder">${esc(d.sym)}</div>`;
 body.innerHTML=`<figure class="element-wiki-figure">${image}<figcaption>Imagem do artigo da Wikipédia</figcaption></figure>
  <div class="info-panel discovery-element-info element-wiki-info">
   <div class="info-tile" style="background:${gradient}"><span class="info-z">${esc(d.z)}</span><strong class="info-symbol">${esc(d.sym)}</strong><span class="info-name">${esc(d.name)}</span><span class="info-mass">${esc(weight)}</span></div>
   <div class="element-wiki-copy"><h3>${esc(d.name)}</h3><p>${esc(wiki.intro)}</p></div>
  </div>
  <div class="element-related-phases"><strong>Aparece em:</strong><div>${phaseMarkup(phases)}</div></div>
  <div class="element-source-actions">
   <a class="element-source-btn" href="${esc(wiki.url)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
   <a class="element-source-btn" href="${esc(periodicVideoUrl(d))}" target="_blank" rel="noopener noreferrer">Periodic Videos</a>
  </div>`;
 host.scrollTop=0;
}

catalog.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;
 setTimeout(()=>showElementDetail(el),0);
});
modal.addEventListener('click',e=>{
 const tab=e.target instanceof Element?e.target.closest('[data-discovery-tab]'):null;
 if(tab&&detail&&!detail.hidden)leaveElementDetail();
});
$('closeMenu')?.addEventListener('click',()=>{if(detail&&!detail.hidden){detail.hidden=true;detail.removeAttribute('data-open');delete detail.dataset.sym;detail.removeAttribute('aria-busy');setDetailMode(false)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail&&!detail.hidden){e.preventDefault();e.stopImmediatePropagation();leaveElementDetail()}},true);
})();
