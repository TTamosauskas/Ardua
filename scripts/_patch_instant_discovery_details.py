from pathlib import Path

# Make every standard phenomenon carry its short local copy on the card/index.
p=Path('assets/js/campaign-discoveries.js'); text=p.read_text()
old="window.ARDUA_DISCOVERY_INDEX=Object.freeze(Object.fromEntries(PHENOMENA.map(({key,title,group,glyph})=>[key,Object.freeze({key,title,group,glyph})])));"
new="window.ARDUA_DISCOVERY_INDEX=Object.freeze(Object.fromEntries(PHENOMENA.map(({key,title,group,glyph,text})=>[key,Object.freeze({key,title,group,glyph,text})])));"
if old not in text and new not in text: raise SystemExit('discovery index anchor missing')
text=text.replace(old,new,1)
old="b.dataset.discoveryKey=entry.key;b.innerHTML=`<span class=\"discovery-glyph\">${entry.glyph}</span><span><strong>${entry.title}</strong><small>${entry.group}</small></span>`;"
new="b.dataset.discoveryKey=entry.key;b.dataset.discoveryText=entry.text;b.innerHTML=`<span class=\"discovery-glyph\">${entry.glyph}</span><span><strong>${entry.title}</strong><small>${entry.group}</small></span>`;"
if old not in text and new not in text: raise SystemExit('phenomenon card anchor missing')
text=text.replace(old,new,1)
p.write_text(text)

# Quarks/strong-force cards also need synchronous local copy.
p=Path('assets/js/campaign-quarks-discoveries.js'); text=p.read_text()
anchor="const QUARK='particle:quark',FORCE='phenomenon:strongNuclearForce',PROTON='particle:proton',NEUTRON='particle:neutron';\n"
local="""const LOCAL_TEXT=Object.freeze({
 [QUARK]:'Quarks são partículas elementares. Prótons e nêutrons são bárions formados por três quarks de valência, embora sua estrutura real também envolva glúons e pares quark-antiquark.',
 [FORCE]:'A Força Nuclear Forte mantém quarks ligados dentro de prótons e nêutrons; sua interação residual entre núcleons contribui para manter os núcleos atômicos ligados.'
});
"""
if 'const LOCAL_TEXT=Object.freeze({' not in text:
    if anchor not in text: raise SystemExit('quarks text anchor missing')
    text=text.replace(anchor,anchor+local,1)
text=text.replace("[QUARK]:{title:'Quarks',type:'phenomenon'},","[QUARK]:{title:'Quarks',type:'phenomenon',text:LOCAL_TEXT[QUARK]},",1)
text=text.replace("[FORCE]:{title:'Força Nuclear Forte',type:'phenomenon'}","[FORCE]:{title:'Força Nuclear Forte',type:'phenomenon',text:LOCAL_TEXT[FORCE]}",1)
old="const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked quarks-discovery-card';b.dataset.discoveryKey=key;"
new="const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked quarks-discovery-card';b.dataset.discoveryKey=key;b.dataset.discoveryText=LOCAL_TEXT[key]||'';"
if old not in text and new not in text: raise SystemExit('quarks card anchor missing')
text=text.replace(old,new,1)
p.write_text(text)

# Fundamental-force index should expose the same short text synchronously.
p=Path('assets/js/campaign-fundamental-forces.js'); text=p.read_text()
old="index[f.key]=Object.freeze({key:f.key,title:f.title,group:f.group,glyph:f.glyph,type:'phenomenon'});"
new="index[f.key]=Object.freeze({key:f.key,title:f.title,group:f.group,glyph:f.glyph,text:f.text,type:'phenomenon'});"
if old not in text and new not in text: raise SystemExit('force index anchor missing')
text=text.replace(old,new,1)
p.write_text(text)

# Phenomena: local source catalog at page load, local text immediately, local images first.
p=Path('assets/js/campaign-discoveries-phenomena.js'); text=p.read_text()
old="""let phenomenonSourcesPromise=null;
function phenomenonSources(){
 if(phenomenonSourcesPromise)return phenomenonSourcesPromise;
 phenomenonSourcesPromise=fetch(PHENOMENON_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('phenomenon sources unavailable'))).catch(()=>({}));
 return phenomenonSourcesPromise;
}
const cache=new Map();"""
new="""let phenomenonSourcesPromise=null,phenomenonSourcesResolved=null;
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
"""
if old not in text and 'phenomenonSourcesResolved' not in text: raise SystemExit('phenomenon sources anchor missing')
text=text.replace(old,new,1)
start=text.index('function loadingMarkup(glyph)')
end=text.index('\n\natlas.addEventListener',start)
replacement=r"""function phenomenonText(button){
 const key=button.dataset.discoveryKey||'';return button.dataset.discoveryText||window.ARDUA_DISCOVERY_INDEX?.[key]?.text||'';
}
function phenomenonImage(cfg){return cfg?.imagePath?new URL(cfg.imagePath,document.baseURI).href:''}
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
  if(!button.getClientRects().length)continue;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(sources[title]||{});if(src)preloadPhenomenonImage(src);
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
 const initialCfg=phenomenonSourcesResolved?.[title]||{};body.innerHTML=phenomenonDetailMarkup(title,glyph,text,initialCfg);card.scrollTo({top:0,behavior:'auto'});
 if(initialCfg.imagePath)return;
 const sources=await phenomenonSources();if(serial!==requestSerial||host.hidden||host.dataset.title!==title)return;
 const cfg=sources?.[title]||{};body.innerHTML=phenomenonDetailMarkup(title,glyph,text,cfg);
 if(cfg.imagePath)return;
 host.setAttribute('aria-busy','true');const wiki=await wikiData(title,glyph);if(serial!==requestSerial||host.hidden||host.dataset.title!==title)return;
 host.removeAttribute('aria-busy');body.innerHTML=phenomenonDetailMarkup(title,glyph,text||wiki.intro,cfg,wiki.image,wiki.url);
}
"""
text=text[:start]+replacement+text[end:]
anchor="""atlas.addEventListener('click',e=>{
 const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button||!atlas.contains(button))return;
 e.preventDefault();e.stopImmediatePropagation();showDetail(button);
},true);"""
addition=anchor+"""
atlas.addEventListener('pointerover',e=>{const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button)return;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(phenomenonSourcesResolved?.[title]||{});if(src)preloadPhenomenonImage(src)},{passive:true});
atlas.addEventListener('pointerdown',e=>{const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button)return;const title=button.querySelector('strong')?.textContent?.trim()||'',src=phenomenonImage(phenomenonSourcesResolved?.[title]||{});if(src)preloadPhenomenonImage(src)},{passive:true});"""
if "atlas.addEventListener('pointerdown'" not in text:
    if anchor not in text: raise SystemExit('phenomena click anchor missing')
    text=text.replace(anchor,addition,1)
p.write_text(text)

# Elements: remove Wikipedia and source parsing from the critical click path.
p=Path('assets/js/campaign-discoveries-elements.js'); text=p.read_text()
text=text.replace("const wikiCache=new Map();\nlet elementSourcesPromise=null;","const wikiCache=new Map(),preloadedElementImages=new Set();\nlet elementSourcesPromise=null,elementSourcesResolved=null,sourceMetaResolved=null;",1)
old="elementSourcesPromise=fetch(ELEMENT_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('element sources unavailable'))).catch(()=>({}));"
new="elementSourcesPromise=fetch(ELEMENT_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('element sources unavailable'))).catch(()=>({})).then(data=>(elementSourcesResolved=data||{},elementSourcesResolved));"
if old not in text and 'elementSourcesResolved=data' not in text: raise SystemExit('element sources anchor missing')
text=text.replace(old,new,1)
old="window.ARDUA_PHASE_SOURCE_META_PROMISE=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parseSource).catch(()=>({phases:[],colors:{},weights:{}}));\n return window.ARDUA_PHASE_SOURCE_META_PROMISE;"
new="window.ARDUA_PHASE_SOURCE_META_PROMISE=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parseSource).catch(()=>({phases:[],colors:{},weights:{}})).then(meta=>(sourceMetaResolved=meta,meta));\n return window.ARDUA_PHASE_SOURCE_META_PROMISE;"
if old not in text and 'sourceMetaResolved=meta' not in text: raise SystemExit('source meta anchor missing')
text=text.replace(old,new,1)
text=text.replace("sourceMeta();\nelementSources();","elementSources();\nconst warmSourceMeta=()=>sourceMeta().then(meta=>(sourceMetaResolved=meta,meta));\nif('requestIdleCallback'in window)requestIdleCallback(warmSourceMeta,{timeout:1200});else setTimeout(warmSourceMeta,120);",1)
start=text.index('function loadingMarkup(d,gradient,weight)')
end=text.index('\n\ncatalog.addEventListener',start)
replacement=r"""function preloadElementImage(src){
 if(!src||preloadedElementImages.has(src))return;preloadedElementImages.add(src);const img=new Image();img.decoding='async';img.src=src;
}
function elementGradient(elementCard,d,src){
 const colors=src?.colors?.[d.sym];if(colors)return`radial-gradient(circle at 30% 20%,${colors[0]},${colors[1]} 46%,${colors[2]} 100%)`;
 const computed=getComputedStyle(elementCard).backgroundImage;if(computed&&computed!=='none')return computed;
 return'radial-gradient(circle at 30% 20%,#f7fbff,#b9cbe1 46%,#667b94 100%)';
}
function phaseMarkup(phases){
 if(!phases.length)return'<span class="element-phase-empty">A trilha irá revelar fases relacionadas a este elemento conforme a campanha avança.</span>';
 return phases.map(p=>`<button type="button" class="element-phase-chip" data-element-phase="${esc(p.id)}">${esc(phaseTitle(p.id,p.title))}</button>`).join('');
}
function elementDetailMarkup(elementCard,d,src={},sources={}){
 const cfg=sources?.[d.sym]||{},gradient=elementGradient(elementCard,d,src),weight=src?.weights?.[d.sym]||'—',phases=src?.phases?.length?relatedPhases(d.sym,src.phases):[],imageSrc=cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'';
 if(imageSrc)preloadElementImage(imageSrc);
 const image=imageSrc?`<img class="element-wiki-image" src="${esc(imageSrc)}" alt="${esc(d.name)}" loading="eager" decoding="async" fetchpriority="high">`:`<div class="element-wiki-image-placeholder">${esc(d.sym)}</div>`;
 const intro=d.fact||d.origin||`${d.name} faz parte dos elementos registrados na sua coleção.`;
 const wikiUrl=cfg.wikiUrl||wikiFallbackUrl(cfg.wikiTitle||d.name);
 return`<figure class="element-wiki-figure">${image}</figure>
  <div class="info-panel discovery-element-info element-wiki-info">
   ${atomicTile(d,gradient,weight)}
   <div class="element-wiki-copy"><p>${esc(intro)}</p></div>
  </div>
  <div class="element-related-phases"><strong>Aparece em:</strong><div>${phaseMarkup(phases)}</div></div>
  <div class="element-source-actions">
   <a class="element-source-btn" href="${esc(wikiUrl)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
   <a class="element-source-btn" href="${esc(periodicVideoUrl(d,sources))}" target="_blank" rel="noopener noreferrer">Periodic Videos</a>
  </div>`;
}
function showElementDetail(elementCard){
 const d=detailData(elementCard),host=ensureDetail(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;
 setDetailMode(true);host.dataset.open='1';host.dataset.sym=d.sym;host.hidden=false;host.removeAttribute('aria-busy');const title=host.querySelector('[data-element-detail-title]');if(title)title.textContent=d.name;
 const render=()=>{if(host.hidden||host.dataset.sym!==d.sym)return;body.innerHTML=elementDetailMarkup(elementCard,d,sourceMetaResolved||{},elementSourcesResolved||{});host.scrollTop=0};
 render();card.scrollTo({top:0,behavior:'auto'});
 if(!elementSourcesResolved)elementSources().then(render);
 if(!sourceMetaResolved)sourceMeta().then(meta=>{sourceMetaResolved=meta;render()});
}
function prewarmVisibleElements(){
 const sources=elementSourcesResolved;if(!sources)return;
 for(const el of catalog.querySelectorAll('.el-card:not([hidden])')){
  if(!el.getClientRects().length)continue;const sym=el.querySelector('.s')?.textContent?.trim()||'',cfg=sources[sym]||{};if(cfg.imagePath)preloadElementImage(new URL(cfg.imagePath,document.baseURI).href);
 }
}
function scheduleElementPrewarm(){const run=()=>prewarmVisibleElements();if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:700});else setTimeout(run,0)}
elementSources().then(scheduleElementPrewarm);
"""
text=text[:start]+replacement+text[end:]
old="""catalog.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;
 setTimeout(()=>showElementDetail(el),0);
});"""
new="""catalog.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;
 showElementDetail(el);
});
catalog.addEventListener('pointerover',e=>{const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el)return;const sym=el.querySelector('.s')?.textContent?.trim()||'',cfg=elementSourcesResolved?.[sym]||{};if(cfg.imagePath)preloadElementImage(new URL(cfg.imagePath,document.baseURI).href)},{passive:true});
catalog.addEventListener('pointerdown',e=>{const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el)return;const sym=el.querySelector('.s')?.textContent?.trim()||'',cfg=elementSourcesResolved?.[sym]||{};if(cfg.imagePath)preloadElementImage(new URL(cfg.imagePath,document.baseURI).href)},{passive:true});"""
if old not in text and 'showElementDetail(el);' not in text: raise SystemExit('element click anchor missing')
text=text.replace(old,new,1)
p.write_text(text)

Path('scripts/validate-instant-discovery-details.js').write_text(r"""const fs=require('fs');
const base=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const quarks=fs.readFileSync('assets/js/campaign-quarks-discoveries.js','utf8');
const forces=fs.readFileSync('assets/js/campaign-fundamental-forces.js','utf8');
const phenomena=fs.readFileSync('assets/js/campaign-discoveries-phenomena.js','utf8');
const elements=fs.readFileSync('assets/js/campaign-discoveries-elements.js','utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}
assert(base.includes('glyph,text})')&&base.includes('dataset.discoveryText=entry.text'),'Fenômenos base sem cópia local síncrona');
assert(quarks.includes('LOCAL_TEXT')&&quarks.includes('dataset.discoveryText=LOCAL_TEXT[key]'),'Quarks/forte sem cópia local síncrona');
assert(forces.includes('text:f.text'),'Forças fundamentais sem texto no índice');
assert(phenomena.includes('phenomenonSourcesResolved')&&phenomena.includes('phenomenonDetailMarkup(title,glyph,text,initialCfg)'),'Fenômenos não abrem pelo cache local');
assert(phenomena.includes("phenomenonSources();\nconst cache")&&phenomena.includes('prewarmVisiblePhenomena'),'Fenômenos sem pré-aquecimento local');
assert(!phenomena.includes('function loadingMarkup(glyph)'),'Placeholder bloqueante de Fenômenos voltou');
const es=elements.slice(elements.indexOf('function showElementDetail'),elements.indexOf('function prewarmVisibleElements'));
assert(!/^async function showElementDetail/m.test(es),'Detalhe de elemento voltou a bloquear em async');
assert(!es.includes('await ')&&!es.includes('wikiData('),'Abertura de elemento ainda espera Wikipédia/metadados');
assert(es.indexOf('render();')>=0,'Elemento não renderiza sincronamente');
assert(elements.includes('elementSourcesResolved')&&elements.includes('sourceMetaResolved')&&elements.includes('prewarmVisibleElements'),'Elementos sem caches locais/preload');
assert(!elements.includes('setTimeout(()=>showElementDetail(el),0)'),'Elemento ainda adia clique para outro task');
console.log('Instant discovery details OK: local-first render, local image prewarm, no Wikipedia wait in element click path.');
""")
