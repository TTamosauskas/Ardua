import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

const elements='assets/js/campaign-discoveries-elements.js';
replaceOnce(elements,
  'let elementSourcesPromise=null,elementSourcesResolved=null,sourceMetaResolved=null;',
  'let elementSourcesPromise=null,elementSourcesResolved=null,sourceMetaPromise=null,sourceMetaResolved=null;'
);
replaceOnce(elements,
`function sourceMeta(){
 if(window.ARDUA_PHASE_SOURCE_META_PROMISE)return window.ARDUA_PHASE_SOURCE_META_PROMISE;
 const loaded=[...document.scripts].find(s=>/\\/assets\\/js\\/ardua\\.js(?:\\?|$)/.test(s.src));
 const url=loaded?.src||new URL('assets/js/ardua.js',document.baseURI).href;
 window.ARDUA_PHASE_SOURCE_META_PROMISE=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parseSource).catch(()=>({phases:[],colors:{},weights:{}})).then(meta=>(sourceMetaResolved=meta,meta));
 return window.ARDUA_PHASE_SOURCE_META_PROMISE;
}`,
`function sourceMeta(){
 if(sourceMetaPromise)return sourceMetaPromise;
 const loaded=[...document.scripts].find(s=>/\\/assets\\/js\\/ardua\\.js(?:\\?|$)/.test(s.src));
 const url=loaded?.src||new URL('assets/js/ardua.js',document.baseURI).href;
 /* Element details own this cache: other discovery modules use different metadata shapes. */
 sourceMetaPromise=fetch(url,{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject(new Error('engine source unavailable'))).then(parseSource).catch(()=>({phases:[],colors:{},weights:{}})).then(meta=>(sourceMetaResolved=meta,meta));
 return sourceMetaPromise;
}`
);
replaceOnce(elements,
`function relatedPhases(sym,phases){
 const st=C.getState(),done=new Set(st.completed||[]);
 return phases.filter(p=>p.meta.includes('→')&&recipeTokens(p.meta).includes(sym)&&(C.isUnlocked(p.id)||done.has(p.id)||st.activeId===p.id));
}`,
`function relatedPhases(sym,phases){
 const st=C.getState(),done=new Set(st.completed||[]);
 return (Array.isArray(phases)?phases:[]).filter(p=>{
  const meta=String(p?.meta||''),id=String(p?.id||'');
  return !!id&&meta.includes('→')&&recipeTokens(meta).includes(sym)&&(C.isUnlocked(id)||done.has(id)||st.activeId===id);
 });
}`
);
replaceOnce('index.html',
  'campaign-discoveries-elements.js?v=20260910-element-detail-open-2',
  'campaign-discoveries-elements.js?v=20260910-element-detail-render-3'
);
const validator='scripts/validate-instant-discovery-details.js';
replaceOnce(validator,
  "assert(elements.includes('elementSourcesResolved')&&elements.includes('sourceMetaResolved')&&elements.includes('prewarmVisibleElements'),'Elementos sem caches locais/preload');",
  "assert(elements.includes('elementSourcesResolved')&&elements.includes('sourceMetaResolved')&&elements.includes('prewarmVisibleElements'),'Elementos sem caches locais/preload');\nassert(elements.includes('sourceMetaPromise')&&!elements.includes('window.ARDUA_PHASE_SOURCE_META_PROMISE'),'Metadados de Elementos ainda compartilham cache global incompatível');\nassert(elements.includes(\"const meta=String(p?.meta||'')\"),'Fases relacionadas não toleram metadados ausentes');"
);
replaceOnce(validator,
  "assert(index.includes('campaign-discoveries-elements.js?v=20260910-element-detail-open-2'),'Módulo de detalhes sem cache-busting da correção de abertura');",
  "assert(index.includes('campaign-discoveries-elements.js?v=20260910-element-detail-render-3'),'Módulo de detalhes sem cache-busting da correção de renderização');"
);
console.log('Patched element detail metadata isolation and defensive phase filtering.');
