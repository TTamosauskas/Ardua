import fs from 'node:fs';

function replaceOnce(path, from, to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

const elements='assets/js/campaign-discoveries-elements.js';
replaceOnce(elements,
`catalog.addEventListener('click',e=>{\n const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;\n showElementDetail(el);\n});`,
`let elementOpenTimer=0,lastElementPointerUp=0;\nfunction scheduleElementDetailOpen(el){\n if(!el||el.hidden)return;clearTimeout(elementOpenTimer);elementOpenTimer=setTimeout(()=>{if(el.isConnected&&!el.hidden)showElementDetail(el)},0);\n}\ncatalog.addEventListener('pointerup',e=>{\n const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;lastElementPointerUp=performance.now();scheduleElementDetailOpen(el);\n});\ncatalog.addEventListener('click',e=>{\n const el=e.target instanceof Element?e.target.closest('.el-card'):null;if(!el||el.hidden)return;if(performance.now()-lastElementPointerUp<650)return;scheduleElementDetailOpen(el);\n});`
);

replaceOnce('index.html',
  'assets/js/campaign-discoveries-elements.js?v=20260910-element-detail-restore-1',
  'assets/js/campaign-discoveries-elements.js?v=20260910-element-detail-tap-2'
);

const validator='scripts/validate-instant-discovery-details.js';
let v=fs.readFileSync(validator,'utf8');
v=v.replace(
  "assert(!elements.includes('setTimeout(()=>showElementDetail(el),0)'),'Elemento ainda adia clique para outro task');",
  "assert(elements.includes(\"catalog.addEventListener('pointerup'\"),'Elemento sem fallback de pointerup para toque');\nassert(elements.includes('scheduleElementDetailOpen(el)'),'Elemento sem abertura diferida após o gesto');\nassert(elements.includes('if(performance.now()-lastElementPointerUp<650)return'),'Elemento sem deduplicação pointer/click');"
);
v=v.replace(
  "assert(index.includes('campaign-discoveries-elements.js?v=20260910-element-detail-restore-1'),'Módulo de detalhes sem cache-busting da correção');",
  "assert(index.includes('campaign-discoveries-elements.js?v=20260910-element-detail-tap-2'),'Módulo de detalhes sem cache-busting da correção de toque');"
);
fs.writeFileSync(validator,v);
console.log('Patched reliable deferred element detail opening.');
