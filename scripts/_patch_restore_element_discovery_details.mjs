import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

const elements='assets/js/campaign-discoveries-elements.js';
replaceOnce(elements,
  " const url=new URL('assets/js/ardua.js',document.baseURI).href;",
  " const loaded=[...document.scripts].find(s=>/\\/assets\\/js\\/ardua\\.js(?:\\?|$)/.test(s.src));\n const url=loaded?.src||new URL('assets/js/ardua.js',document.baseURI).href;"
);
replaceOnce(elements,
  "function elementDetailMarkup(elementCard,d,src={},sources={}){\n const cfg=sources?.[d.sym]||{},gradient=elementGradient(elementCard,d,src),weight=src?.weights?.[d.sym]||'—',phases=src?.phases?.length?relatedPhases(d.sym,src.phases):[],imageSrc=cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'';\n if(imageSrc)preloadElementImage(imageSrc);\n const image=imageSrc?`<img class=\"element-wiki-image\" src=\"${esc(imageSrc)}\" alt=\"${esc(d.name)}\" loading=\"eager\" decoding=\"async\" fetchpriority=\"high\">`:`<div class=\"element-wiki-image-placeholder\">${esc(d.sym)}</div>`;\n const intro=d.fact||d.origin||`${d.name} faz parte dos elementos registrados na sua coleção.`;\n const wikiUrl=cfg.wikiUrl||wikiFallbackUrl(cfg.wikiTitle||d.name);",
  "function elementDetailMarkup(elementCard,d,src={},sources={},wiki=null){\n const cfg=sources?.[d.sym]||{},gradient=elementGradient(elementCard,d,src),weight=src?.weights?.[d.sym]||'—',phases=src?.phases?.length?relatedPhases(d.sym,src.phases):[],localImage=cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'',imageSrc=wiki?.image||localImage;\n if(imageSrc)preloadElementImage(imageSrc);\n const image=imageSrc?`<img class=\"element-wiki-image\" src=\"${esc(imageSrc)}\" alt=\"${esc(d.name)}\" loading=\"eager\" decoding=\"async\" fetchpriority=\"high\">`:`<div class=\"element-wiki-image-placeholder\">${esc(d.sym)}</div>`;\n const intro=wiki?.intro||d.fact||d.origin||`${d.name} faz parte dos elementos registrados na sua coleção.`;\n const wikiUrl=wiki?.url||cfg.wikiUrl||wikiFallbackUrl(cfg.wikiTitle||d.name);"
);
replaceOnce(elements,
  "function showElementDetail(elementCard){\n const d=detailData(elementCard),host=ensureDetail(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;\n setDetailMode(true);host.dataset.open='1';host.dataset.sym=d.sym;host.hidden=false;host.removeAttribute('aria-busy');const title=host.querySelector('[data-element-detail-title]');if(title)title.textContent=d.name;\n const render=()=>{if(host.hidden||host.dataset.sym!==d.sym)return;body.innerHTML=elementDetailMarkup(elementCard,d,sourceMetaResolved||{},elementSourcesResolved||{});host.scrollTop=0};\n render();card.scrollTo({top:0,behavior:'auto'});\n if(!elementSourcesResolved)elementSources().then(render);\n if(!sourceMetaResolved)sourceMeta().then(meta=>{sourceMetaResolved=meta;render()});\n}",
  "function showElementDetail(elementCard){\n const d=detailData(elementCard),host=ensureDetail(),body=$('elementDiscoveryBody');if(!d.sym||!body)return;\n setDetailMode(true);host.dataset.open='1';host.dataset.sym=d.sym;host.hidden=false;host.removeAttribute('aria-busy');const title=host.querySelector('[data-element-detail-title]');if(title)title.textContent=d.name;\n const render=(wiki=null)=>{if(host.hidden||host.dataset.sym!==d.sym)return;body.innerHTML=elementDetailMarkup(elementCard,d,sourceMetaResolved||{},elementSourcesResolved||{},wiki);host.scrollTop=0};\n /* Keep the local-first instant paint, then enrich the same view asynchronously. */\n render();card.scrollTo({top:0,behavior:'auto'});\n Promise.all([elementSources(),sourceMeta(),wikiData(d)]).then(([sources,meta,wiki])=>{\n  elementSourcesResolved=sources||{};sourceMetaResolved=meta||{};render(wiki);\n }).catch(()=>{});\n}"
);

replaceOnce('index.html',
  '<script src="assets/js/campaign-discoveries-elements.js"></script>',
  '<script src="assets/js/campaign-discoveries-elements.js?v=20260910-element-detail-restore-1"></script>'
);

const validator='scripts/validate-instant-discovery-details.js';
replaceOnce(validator,
  "assert(!es.includes('await ')&&!es.includes('wikiData('),'Abertura de elemento ainda espera Wikipédia/metadados');\nassert(es.indexOf('render();')>=0,'Elemento não renderiza sincronamente');",
  "assert(!es.includes('await '),'Abertura de elemento voltou a bloquear em await');\nassert(es.indexOf('render();')>=0,'Elemento não renderiza sincronamente');\nassert(es.includes('wikiData(d)'),'Detalhe de elemento deixou de enriquecer com Wikipédia');\nassert(es.indexOf('render();')<es.indexOf('wikiData(d)'),'Wikipédia deve enriquecer somente depois do primeiro render local');"
);
replaceOnce(validator,
  "assert(!elements.includes('setTimeout(()=>showElementDetail(el),0)'),'Elemento ainda adia clique para outro task');\nconsole.log('Instant discovery details OK: local-first render, local image prewarm, no Wikipedia wait in element click path.');",
  "assert(!elements.includes('setTimeout(()=>showElementDetail(el),0)'),'Elemento ainda adia clique para outro task');\nconst index=fs.readFileSync('index.html','utf8');\nassert(index.includes('campaign-discoveries-elements.js?v=20260910-element-detail-restore-1'),'Módulo de detalhes sem cache-busting da correção');\nconsole.log('Instant discovery details OK: local-first render plus asynchronous Wikipedia enrichment.');"
);

console.log('Restored asynchronous Wikipedia enrichment for element discovery details.');
