const fs=require('fs');
const ui=fs.readFileSync('assets/js/campaign-discovery-notifications.js','utf8');
const css=fs.readFileSync('assets/css/campaign-discovery-notifications.css','utf8');
const discoveries=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const elementDetails=fs.readFileSync('assets/js/campaign-discoveries-elements.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graph=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const elementSources=JSON.parse(fs.readFileSync('assets/data/element-sources.json','utf8'));
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const token of ['arduaDiscoveryInboxV1','Confira suas descobertas no menu.','discovery-has-unread','discovery-unread','markRead(`element:${sym}`)','dataset.unreadCount','function historicalKnown()','function currentDiscoveryKeys()','window.ARDUA_PHASE_DISCOVERIES','for(const sym of data.discovered||[])',"$('campaignHomeMenuBtn')","$('campaignHomeDiscoveries')",'new MutationObserver(scheduleRender).observe(campaignMap'])if(!ui.includes(token))throw new Error('Discovery inbox perdeu contrato: '+token);
for(const token of ['function collectionItemKeys()','function reconcileUnread()','quick.removeAttribute(\'data-unread-count\')',"baseElementSymbol(sym)!==sym",'card.dataset.discoveryCollected=\'1\'','collected&&unread.has(`element:${sym}`)'])if(!ui.includes(token))throw new Error('Badge de não-lidos precisa refletir somente a coleção viva: '+token);
for(const token of ['STRUCTURAL_ELEMENT_MODES','function parseFirstElementCreationPhases(text)','const nativeSetAdd=Set.prototype.add','Set.prototype.add=function(value)','function scheduleImmediateElementSave(sym)','setMatchesSavedDiscoveries(this,saved)','list.push(sym);localStorage.setItem(SAVE_KEY','firstElementPhaseBySymbol'])if(!ui.includes(token))throw new Error('Primeira criação de elementos perdeu persistência imediata: '+token);
for(const token of ['function syncDiscoveryAtlasOwnership()','discoveryAtlasSnapshot',".discovery-card[data-discovery-key]",".discovery-card:not([data-discovery-key])",'discoveryAtlas.innerHTML=discoveryAtlasSnapshot',"$('campaignData')?.addEventListener('click',()=>requestAnimationFrame(syncDiscoveryAtlasOwnership))",'checkSavedDiscoveries(true);syncDiscoveryAtlasOwnership();scheduleRender()'])if(!ui.includes(token))throw new Error('Proteção do Atlas de Fenômenos perdeu contrato: '+token);
for(const token of ["content:'★'",'.discovery-unlock-modal','place-items:center','.reward-banner.discovery','.reward-banner.completion','#campaignHomeMenuBtn.discovery-has-unread::after','#campaignHomeDiscoveries.discovery-has-unread::after','[data-discovery-collected="1"][hidden]{display:flex!important}'])if(!css.includes(token))throw new Error('Discovery inbox CSS perdeu contrato: '+token);

/* Every periodic-table element from H through U must have a catalog card, rich detail
   source and a real first creation phase. Structural phases may mention an element but
   do not count as its first creation. */
const orderMatch=engine.match(/const ORDER=\[([^\]]+)\]/);
if(!orderMatch)throw new Error('ORDER de elementos não encontrado no motor');
const elementOrder=[...orderMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(elementOrder.length!==92||elementOrder[0]!=='H'||elementOrder.at(-1)!=='U')throw new Error(`Catálogo periódico incompleto: ${elementOrder.length} elementos`);
for(const sym of elementOrder)if(!elementSources[sym])throw new Error(`Fonte/modal de elemento ausente: ${sym}`);
if(Object.keys(elementSources).length!==92)throw new Error(`Fontes de elementos divergentes: ${Object.keys(elementSources).length}`);
for(const token of ['function showElementDetail(elementCard)','catalog.addEventListener(\'click\'','elementSources()','data-element-detail-title'])if(!elementDetails.includes(token))throw new Error('Detalhe reutilizável de Elementos perdeu contrato: '+token);

const rows=new Map();
for(const line of engine.split('\n')){
 const id=line.match(/\bid:'([^']+)'/)?.[1],newSym=line.match(/\bnew:'([^']+)'/)?.[1],mode=line.match(/\bmode:'([^']+)'/)?.[1]||'';
 if(id&&newSym)rows.set(id,{id,newSym,mode});
}
const baseOrderMatch=graph.match(/baseOrder:(\[[^\]]+\])/);
if(!baseOrderMatch)throw new Error('baseOrder não encontrado no grafo');
const baseOrder=JSON.parse(baseOrderMatch[1]),structural=new Set(['opening','campaignMilestone']),symbols=new Set(elementOrder),firstCreation=new Map();
for(const id of baseOrder){const row=rows.get(id);if(!row||!symbols.has(row.newSym)||structural.has(row.mode)||firstCreation.has(row.newSym))continue;firstCreation.set(row.newSym,id)}
const missingCreation=elementOrder.filter(sym=>!firstCreation.has(sym));
if(missingCreation.length)throw new Error('Elementos sem fase real de primeira criação: '+missingCreation.join(', '));
if(firstCreation.get('H')!=='atomic_h')throw new Error(`H deve nascer em atomic_h, não em ${firstCreation.get('H')}`);
if(firstCreation.get('Eu')!=='eu')throw new Error(`Eu deve nascer em eu, não em ${firstCreation.get('Eu')}`);
if(firstCreation.get('U')!=='u')throw new Error(`U deve nascer em u, não em ${firstCreation.get('U')}`);

if(!discoveries.includes('window.ARDUA_DISCOVERY_INDEX='))throw new Error('Índice público de descobertas ausente');
if(!discoveries.includes('b.dataset.discoveryKey=entry.key'))throw new Error('Cards de fenômenos precisam preservar a chave da descoberta');
if(map.includes('returnTimer=setTimeout(()=>showMap({required:true,focusCurrent:true}),1500)'))throw new Error('Retorno ao mapa voltou a esperar 1,5 s');
if(!map.includes('showMap({required:true,focusCurrent:true,instant:true})'))throw new Error('Fim de fase precisa abrir o mapa imediatamente');
if(!modal.includes("becameVisible=visible&&!mapWasVisible")||!modal.includes("if(!becameVisible)return;closePreview()"))throw new Error('Mapa precisa assumir o preview apenas na transição real de volta à tela');
if(!modal.includes("function shouldDismissEngineIntro(){return map.classList.contains('show')||"))throw new Error('Intro tardio de fase precisa ser fechado com o mapa visível');
if(!index.includes('campaign-discovery-notifications.js')||!index.includes('campaign-discovery-notifications.css'))throw new Error('Discovery inbox fora do index');
console.log(`Discovery inbox OK: badges zeram corretamente e ${elementOrder.length}/92 elementos H–U têm fonte, detalhe e fase real de primeira criação.`);
