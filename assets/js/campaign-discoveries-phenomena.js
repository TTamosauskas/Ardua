/* Ardua — square phenomenon atlas + in-place Wikipedia detail. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const G=window.ARDUA_CAMPAIGN_GRAPH;
const modal=$('menuModal'),atlas=$('discoveryAtlas'),card=modal?.querySelector('.card'),heading=card?.querySelector(':scope > h2');
if(!modal||!atlas||!card)return;

if(!document.querySelector('link[data-ardua-phenomena-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-discoveries-phenomena.css',document.baseURI).href;link.dataset.arduaPhenomenaStyle='1';document.head.appendChild(link);
}

const WIKI_API='https://pt.wikipedia.org/w/api.php';
const PHENOMENON_SOURCES_URL=new URL('assets/data/phenomenon-sources.json',document.baseURI).href;
const PHENOMENON_LABEL_OVERRIDES=Object.freeze({
 'Jatos Coronais':'Ejeção de Massa Coronal'
});
const PHENOMENON_FAST_SOURCE_OVERRIDES=Object.freeze({
 'Quarks':Object.freeze({wikiTitle:'Quark',wikiUrl:'https://pt.wikipedia.org/wiki/Quark',imagePath:'assets/images/phenomena/proton.png'}),
 'Força Nuclear Forte':Object.freeze({wikiTitle:'Interação forte',wikiUrl:'https://pt.wikipedia.org/wiki/Intera%C3%A7%C3%A3o_forte',imagePath:'assets/images/phenomena/proton.png'}),
 'Força Eletromagnética':Object.freeze({wikiTitle:'Eletromagnetismo',wikiUrl:'https://pt.wikipedia.org/wiki/Eletromagnetismo',imagePath:'assets/images/phenomena/electron.png'}),
 'Força Gravitacional':Object.freeze({wikiTitle:'Gravidade',wikiUrl:'https://pt.wikipedia.org/wiki/Gravidade',imagePath:'assets/images/phenomena/gravitational-collapse.png'}),
 'Força Nuclear Fraca':Object.freeze({wikiTitle:'Interação fraca',wikiUrl:'https://pt.wikipedia.org/wiki/Intera%C3%A7%C3%A3o_fraca',imagePath:'assets/images/phenomena/electron-capture.png'})
});
const PHENOMENON_INTRO_HTML_OVERRIDES=Object.freeze({
 'Ejeção de Massa Coronal':'<p><strong>Ejeções de massa coronal</strong> (<strong>EMC</strong>) são grandes erupções de gás ionizado a alta temperatura, provenientes da coroa solar. O gás expelido constitui parte do vento solar e, quando atinge o campo magnético terrestre, pode causar tempestades geomagnéticas, prejudicando os meios de comunicações e estações elétricas.</p>',
 'Força Eletromagnética':'<p>A <strong>Força Eletromagnética</strong> atua entre partículas com carga elétrica. Na formação dos primeiros átomos, ela mantém elétrons ligados aos núcleos e torna possível a estrutura atômica e a química.</p>',
 'Força Gravitacional':'<p>A <strong>Força Gravitacional</strong> atrai matéria. Em escalas astronômicas, ela reúne gás e poeira, comprime nuvens e conduz o nascimento de protoestrelas e outros corpos celestes.</p>',
 'Força Nuclear Fraca':'<p>A <strong>Força Nuclear Fraca</strong> permite transformações entre partículas. Na cadeia próton-próton, ela converte um próton em nêutron e produz um pósitron e um neutrino.</p>'
});

/* Fenômenos follows the chronology of the campaign rather than the old category order.
   The opening is pinned to the requested early-Universe narrative; everything after it
   is ranked by the first campaign phase that owns the discovery. */
const PHENOMENON_HISTORY_PREFIX=Object.freeze([
 'phenomenon:bigBang',
 'particle:quark',
 'phenomenon:strongNuclearForce',
 'particle:proton',
 'particle:neutron',
 'phenomenon:primordialNucleosynthesis'
]);
const UNPHASED_HISTORY_PHASE=Object.freeze({
 'phenomenon:freezeout':'u',
 'phenomenon:hawkingRadiation':'black_hole'
});
function historyPhases(){
 const base=G?.baseOrder||G?.runtimeOrder||[];
 return [...new Set(['bigbang','quarks',...base.filter(id=>id!=='bigbang'&&id!=='quarks')])];
}
function historyRank(key){
 const prefix=PHENOMENON_HISTORY_PREFIX.indexOf(key);if(prefix>=0)return prefix;
 const phases=historyPhases(),phaseDiscoveries=window.ARDUA_PHASE_DISCOVERIES||{};
 for(let i=0;i<phases.length;i++){
  const entries=phaseDiscoveries[phases[i]]||[],inside=entries.findIndex(entry=>entry?.key===key);
  if(inside>=0)return PHENOMENON_HISTORY_PREFIX.length+(i*100)+inside;
 }
 const fallback=UNPHASED_HISTORY_PHASE[key],fallbackIndex=fallback?phases.indexOf(fallback):-1;
 if(fallbackIndex>=0)return PHENOMENON_HISTORY_PREFIX.length+(fallbackIndex*100)+90;
 return Number.POSITIVE_INFINITY;
}
function sortCardsByHistory(){
 const cards=[...atlas.querySelectorAll(':scope > .discovery-card')];if(cards.length<2)return;
 const original=new Map(cards.map((el,index)=>[el,index]));
 const sorted=[...cards].sort((a,b)=>{
  const ar=historyRank(a.dataset.discoveryKey||''),br=historyRank(b.dataset.discoveryKey||'');
  return ar===br?(original.get(a)-original.get(b)):ar-br;
 });
 if(sorted.every((el,index)=>el===cards[index]))return;
 sorted.forEach(el=>atlas.appendChild(el));
}

let phenomenonSourcesPromise=null,phenomenonSourcesResolved=null;
function phenomenonSources(){
 if(phenomenonSourcesPromise)return phenomenonSourcesPromise;
 phenomenonSourcesPromise=fetch(PHENOMENON_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('phenomenon sources unavailable'))).catch(()=>({})).then(data=>(phenomenonSourcesResolved=data||{},phenomenonSourcesResolved));
 return phenomenonSourcesPromise;
}
phenomenonSources();
const cache=new Map(),preloadedPhenomenonImages=new Set();
function preloadPhenomenonImage(src){
 if(!src||preloadedPhenomenonImages.has(src))return;preloadedPhenomenonImages.add(src);const img=new Image();img.decoding='async';img.src=src;
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WIKI_ALIASES=Object.freeze({
 'Big Bang':'Big Bang',
 'Força Eletromagnética':'Força eletromagnética',
 'Força Gravitacional':'Gravidade',
 'Força Nuclear Fraca':'Interação fraca',
 'Nucleossíntese primordial':'Nucleossíntese primordial',
 'Recombinação cósmica':'Recombinação (cosmologia)',
 'Prótons':'Próton',
 'Nêutrons':'Nêutron',
 'Elétrons':'Elétron',
 'Neutrinos':'Neutrino',
 'Pósitrons':'Positron',
 'Antineutrinos':'Antineutrino',
 'Raios cósmicos':'Raio cósmico',
 'Vento Solar':'Vento solar',
 'Ionização':'Ionização',
 'Núcleo estelar':'Núcleo estelar',
 'Anã Marrom':'Anã marrom',
 'Anã Vermelha':'Anã vermelha',
 'Anã Laranja':'Anã laranja',
 'Anã Amarela':'Anã amarela',
 'Anã Branca':'Anã branca',
 'Gigante Vermelha':'Gigante vermelha',
 'Gigante Amarela':'Gigante amarela',
 'Gigante Azul':'Gigante azul',
 'Gigante Branca':'Estrela gigante',
 'Supergigante Vermelha':'Supergigante vermelha',
 'Supergigante Amarela':'Supergigante amarela',
 'Supergigante Azul':'Supergigante azul',
 'Estrela AGB':'Ramo gigante assimptótico',
 'Barreira de Coulomb':'Barreira de Coulomb',
 'Tunelamento quântico':'Efeito túnel',
 'Convecção Estelar':'Convecção',
 'Jatos Coronais':'Jato astrofísico',
 'Ejeção de Massa Coronal':'Ejeção de massa coronal',
 'Reconexão Magnética':'Reconexão magnética',
 'Erupções Solares':'Erupção solar',
 'Pressão de degenerescência eletrônica':'Matéria degenerada',
 'Colapso gravitacional':'Colapso gravitacional',
 'Triplo-alfa':'Processo triplo-alfa',
 'Espalação':'Espalação',
 'Decaimento':'Decaimento radioativo',
 'Neutronização / captura eletrônica':'Captura eletrônica',
 'Fotodesintegração':'Fotodesintegração',
 'Nucleossíntese explosiva':'Nucleossíntese em supernovas',
 'Processo-s':'Processo s',
 'Processo-r':'Processo r',
 'rp-process':'Processo rp',
 'Waiting point':'Processo rp',
 'Freeze-out':'Processo r',
 'Raios X':'Raios X',
 'Raios gama':'Radiação gama',
 'Supernova':'Supernova',
 'Estrela de Nêutrons':'Estrela de nêutrons',
 'Pulsar':'Pulsar',
 'Disco de acreção':'Disco de acreção',
 'Kilonova':'Kilonova',
 'Buraco Negro':'Buraco negro',
 'Radiação Hawking':'Radiação Hawking',
 'Cadeia planejada':'Reação em cadeia'
});

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
 return intro
  .replace(/<[^>]*>/g,' ')
  .replace(/\bnota\s*\d+\b/gi,' ')
  .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+(?=\s|[.,;:!?]|$)/g,'')
  .replace(/\s+([,.;:!?])/g,'$1')
  .replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g,'$1 ')
  .replace(/\s{2,}/g,' ')
  .trim();
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
function normalizeImage(src){
 const s=String(src||'').trim();if(!s)return'';
 if(s.startsWith('//'))return'https:'+s;
 try{return new URL(s,'https://pt.wikipedia.org').href}catch(_e){return''}
}
function firstArticleImage(html){
 try{
  const doc=new DOMParser().parseFromString(String(html||''),'text/html');
  const imgs=[...doc.querySelectorAll('.mw-parser-output img')];
  const img=imgs.find(x=>{
   const src=String(x.getAttribute('src')||''),w=Number(x.getAttribute('width')||0),alt=String(x.getAttribute('alt')||'');
   return src&&w>=120&&!/icon|logo|question_book|edit-clear|ambox|wikimedia/i.test(src+' '+alt);
  });
  return normalizeImage(img?.getAttribute('src')||'');
 }catch(_e){return''}
}
function wikiFallbackUrl(title){return`https://pt.wikipedia.org/wiki/${encodeURIComponent(String(title||'').trim().replace(/\s+/g,'_'))}`}
async function json(url){const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error('wiki request');return r.json()}
async function resolveTitle(title){
 const exact=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',prop:'info|pageprops',inprop:'url',titles:title});
 try{
  const data=await json(`${WIKI_API}?${exact}`),page=data?.query?.pages?.[0];
  if(page&&!page.missing&&!page.pageprops?.disambiguation)return page.title||title;
 }catch(_e){}
 const search=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',list:'search',srnamespace:'0',srlimit:'1',srsearch:title});
 try{return (await json(`${WIKI_API}?${search}`))?.query?.search?.[0]?.title||title}catch(_e){return title}
}
async function wikiData(title,glyph){
 if(cache.has(title))return cache.get(title);
 const promise=(async()=>{
  const sources=await phenomenonSources(),cfg=sources[title]||{},requested=cfg.wikiTitle||WIKI_ALIASES[title]||title,resolved=await resolveTitle(requested);
  const parseParams=new URLSearchParams({origin:'*',action:'parse',format:'json',formatversion:'2',redirects:'1',prop:'text',page:resolved});
  const metaParams=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',prop:'info|extracts|pageimages',inprop:'url',exintro:'1',explaintext:'1',piprop:'thumbnail',pithumbsize:'900',titles:resolved});
  const [parsed,meta]=await Promise.all([
   json(`${WIKI_API}?${parseParams}`).catch(()=>null),
   json(`${WIKI_API}?${metaParams}`).catch(()=>null)
  ]),page=meta?.query?.pages?.[0]||{},html=parsed?.parse?.text||'';
  return{
   title:page.title||parsed?.parse?.title||resolved,
   url:cfg.wikiUrl||page.fullurl||wikiFallbackUrl(resolved),
   image:cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:(normalizeImage(page.thumbnail?.source)||firstArticleImage(html)),
   intro:cfg.intro||firstWikiParagraph(html)||firstExtractParagraph(page.extract)||''
  };
 })().catch(async()=>{const sources=await phenomenonSources(),cfg=sources[title]||{};return{title,url:cfg.wikiUrl||wikiFallbackUrl(cfg.wikiTitle||WIKI_ALIASES[title]||title),image:cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'',intro:cfg.intro||'',glyph}});
 cache.set(title,promise);return promise;
}

function squareify(){
 atlas.classList.add('phenomena-square-grid');
 atlas.querySelectorAll('.discovery-group').forEach(x=>x.remove());
 atlas.querySelectorAll('.discovery-card').forEach(x=>{
  x.classList.add('phenomenon-square');
  const strong=x.querySelector('strong'),current=strong?.textContent?.trim()||'',replacement=PHENOMENON_LABEL_OVERRIDES[current];
  if(strong&&replacement)strong.textContent=replacement;
 });
 sortCardsByHistory();
}
let squareQueued=false;
function scheduleSquareify(){
 if(squareQueued)return;squareQueued=true;
 requestAnimationFrame(()=>{squareQueued=false;squareify()});
}
new MutationObserver(scheduleSquareify).observe(atlas,{childList:true,subtree:true});
scheduleSquareify();

let detail=$('phenomenonDiscoveryDetail'),requestSerial=0;
function ensureDetail(){
 if(detail)return detail;
 detail=document.createElement('section');
 detail.id='phenomenonDiscoveryDetail';
 detail.className='element-discovery-detail phenomenon-discovery-detail';
 detail.hidden=true;
 detail.innerHTML=`<header class="element-discovery-head"><strong data-phenomenon-detail-title></strong></header><div id="phenomenonDiscoveryBody"></div>`;
 const tabs=$('discoveriesTabs');
 (tabs||heading)?.insertAdjacentElement('afterend',detail);
 detail.addEventListener('click',()=>{});
 return detail;
}
function setDetailMode(on){
 const tabs=$('discoveriesTabs');if(tabs)tabs.hidden=false;
 modal.classList.toggle('phenomenon-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
}
function leaveDetail(restoreTab=true){
 requestSerial++;
 const host=ensureDetail();host.hidden=true;host.removeAttribute('aria-busy');delete host.dataset.title;setDetailMode(false);
 if(restoreTab)$('discoveriesTabs')?.querySelector('[data-discovery-tab="phenomena"]')?.click();
 requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}
function phenomenonText(button){
 const key=button.dataset.discoveryKey||'';return button.dataset.discoveryText||window.ARDUA_DISCOVERY_INDEX?.[key]?.text||'';
}
function phenomenonImage(cfg){return cfg?.imagePath?new URL(cfg.imagePath,document.baseURI).href:''}
function phenomenonConfig(title){return{...(PHENOMENON_FAST_SOURCE_OVERRIDES[title]||{}),...(phenomenonSourcesResolved?.[title]||{})}}
function phenomenonUrl(title,cfg,urlOverride=''){return urlOverride||cfg?.wikiUrl||wikiFallbackUrl(cfg?.wikiTitle||WIKI_ALIASES[title]||title)}
function phenomenonDetailMarkup(title,glyph,text,cfg={},imageOverride='',urlOverride=''){
 const src=imageOverride||phenomenonImage(cfg);if(src)preloadPhenomenonImage(src);
 const image=src?`<img class="phenomenon-wiki-image" src="${esc(src)}" alt="${esc(title)}" loading="eager" decoding="async" fetchpriority="high">`:`<div class="phenomenon-wiki-image-placeholder">${esc(glyph)}</div>`;
 const fallback=text||cfg?.intro||`Consulte o artigo ${cfg?.wikiResolvedTitle||cfg?.wikiTitle||title} na Wikipédia para esta descoberta.`;
 const copy=PHENOMENON_INTRO_HTML_OVERRIDES[title]||`<p>${esc(fallback)}</p>`;
 return`<figure class="phenomenon-wiki-figure">${image}</figure><div class="phenomenon-wiki-copy">${copy}</div><div class="phenomenon-source-actions"><a class="phenomenon-source-btn" href="${esc(phenomenonUrl(title,cfg,urlOverride))}" target="_blank" rel="noopener noreferrer">Wikipedia</a></div>`;
}
function prewarmVisiblePhenomena(){
 const sources=phenomenonSourcesResolved;if(!sources)return;
 for(const button of atlas.querySelectorAll('.discovery-card:not([hidden])')){
  if(!button.getClientRects().length)continue;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(phenomenonConfig(title));if(src)preloadPhenomenonImage(src);
 }
}
function schedulePhenomenonPrewarm(){
 const run=()=>prewarmVisiblePhenomena();if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:700});else setTimeout(run,0);
}
phenomenonSources().then(schedulePhenomenonPrewarm);
async function showDetail(button){
 const title=button.querySelector('strong')?.textContent?.trim()||'',glyph=button.querySelector('.discovery-glyph')?.textContent?.trim()||'✦';if(!title)return;
 const text=phenomenonText(button),host=ensureDetail(),body=$('phenomenonDiscoveryBody'),serial=++requestSerial;if(!body)return;
 setDetailMode(true);host.hidden=false;host.dataset.title=title;host.removeAttribute('aria-busy');host.querySelector('[data-phenomenon-detail-title]').textContent=title;
 const initialCfg=phenomenonConfig(title);body.innerHTML=phenomenonDetailMarkup(title,glyph,text,initialCfg);card.scrollTo({top:0,behavior:'auto'});
 if(initialCfg.imagePath)return;
 const sources=await phenomenonSources();if(serial!==requestSerial||host.hidden||host.dataset.title!==title)return;
 const cfg=phenomenonConfig(title);body.innerHTML=phenomenonDetailMarkup(title,glyph,text,cfg);
 if(cfg.imagePath)return;
 host.setAttribute('aria-busy','true');const wiki=await wikiData(title,glyph);if(serial!==requestSerial||host.hidden||host.dataset.title!==title)return;
 host.removeAttribute('aria-busy');body.innerHTML=phenomenonDetailMarkup(title,glyph,text||wiki.intro,cfg,wiki.image,wiki.url);
}


atlas.addEventListener('click',e=>{
 const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button||!atlas.contains(button))return;
 e.preventDefault();e.stopImmediatePropagation();showDetail(button);
},true);
atlas.addEventListener('pointerover',e=>{const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button)return;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(phenomenonConfig(title));if(src)preloadPhenomenonImage(src)},{passive:true});
atlas.addEventListener('pointerdown',e=>{const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button)return;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(phenomenonConfig(title));if(src)preloadPhenomenonImage(src)},{passive:true});
modal.addEventListener('click',e=>{
 const tab=e.target instanceof Element?e.target.closest('[data-discovery-tab]'):null;
 if(tab&&detail&&!detail.hidden)leaveDetail(false);
},true);
$('closeMenu')?.addEventListener('click',()=>{if(detail&&!detail.hidden){requestSerial++;detail.hidden=true;detail.removeAttribute('aria-busy');delete detail.dataset.title;setDetailMode(false)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail&&!detail.hidden){e.preventDefault();e.stopImmediatePropagation();leaveDetail()}},true);
})();
