/* Ardua — persistent unread discoveries, centered discovery acknowledgements and menu badges. */
(()=>{
'use strict';
const SAVE_KEY='stellarForgeV1013',INBOX_KEY='arduaDiscoveryInboxV1';
const $=id=>document.getElementById(id);
const SPECIAL_BASE=Object.freeze({D:'H',T:'H',He3:'He',HeU:'He',Be7:'Be',Be8:'Be',C13:'C',Ne22:'Ne',FeU:'Fe'});
const SPECIAL_NAMES=Object.freeze({D:'Deutério',T:'Trítio',He3:'Hélio-3',HeU:'Hélio instável',Be7:'Berílio-7',Be8:'Berílio-8',C13:'Carbono-13',Ne22:'Neônio-22',FeU:'Ferro instável'});
const TITLE_OVERRIDES=Object.freeze({'phenomenon:coronalJet':'Ejeção de Massa Coronal'});
const STRUCTURAL_ELEMENT_MODES=new Set(['opening','campaignMilestone']);
const queue=[],queued=new Set();let current=null,renderFrame=0;
function parse(raw,fallback={}){try{return raw?JSON.parse(raw):fallback}catch(_e){return fallback}}
function saveData(){return parse(localStorage.getItem(SAVE_KEY),{})}
function currentDiscoveryKeys(){const data=saveData(),keys=new Set(data.rewardDiscoveries||[]);for(const sym of data.discovered||[])keys.add(`element:${sym}`);return keys}
function discoveryIndex(){return window.ARDUA_DISCOVERY_INDEX||{}}
function elementCard(sym){return [...document.querySelectorAll('#catalog .el-card')].find(card=>card.querySelector('.s')?.textContent?.trim()===sym)||null}
function catalogElementSymbols(){return new Set([...document.querySelectorAll('#catalog .el-card .s')].map(el=>el.textContent?.trim()).filter(Boolean))}
function baseElementSymbol(sym){return SPECIAL_BASE[sym]||sym}
function itemKeyFor(rawKey){const key=String(rawKey||'');if(key.startsWith('element:'))return`element:${baseElementSymbol(key.slice(8))}`;return discoveryIndex()[key]?key:null}
function elementName(sym){const card=elementCard(baseElementSymbol(sym));return SPECIAL_NAMES[sym]||card?.querySelector('.nm')?.textContent?.trim()||sym}
function displayTitle(rawKey){const key=String(rawKey||'');if(TITLE_OVERRIDES[key])return TITLE_OVERRIDES[key];if(key.startsWith('element:'))return elementName(key.slice(8));return discoveryIndex()[key]?.title||key.split(':').pop()||'Descoberta'}
function discoveryWord(title){
 const u=String(title||'').trim().toLocaleUpperCase('pt-BR');
 const femininePlural=/^(ERUPÇÕES|ONDAS|ESTRELAS)/.test(u),masculinePlural=/^(PRÓTONS|NÊUTRONS|ELÉTRONS|NEUTRINOS|ANTINEUTRINOS|PÓSITRONS|RAIOS|JATOS|QUARKS)/.test(u);
 const feminine=/^(ANÃ|GIGANTE|SUPERGIGANTE|ESTRELA|NUCLEOSSÍNTESE|RECOMBINAÇÃO|IONIZAÇÃO|BARREIRA|CONVECÇÃO|RECONEXÃO|PRESSÃO|ESPALAÇÃO|NEUTRONIZAÇÃO|CAPTURA|FOTODESINTEGRAÇÃO|SUPERNOVA|KILONOVA|RADIAÇÃO|EJEÇÃO|CADEIA|PRATA|PLATINA|FORÇA)/.test(u);
 if(femininePlural)return'DESCOBERTAS';if(masculinePlural)return'DESCOBERTOS';return feminine?'DESCOBERTA':'DESCOBERTO';
}
function modalTitle(rawKey){const title=displayTitle(rawKey);return`${title.toLocaleUpperCase('pt-BR')} ${discoveryWord(title)}`}
function historicalKnown(){
 const keys=currentDiscoveryKeys(),completed=new Set(window.ARDUA_CAMPAIGN?.getState?.().completed||[]),byPhase=window.ARDUA_PHASE_DISCOVERIES||{};
 for(const id of completed)for(const entry of byPhase[id]||[])if(entry?.key)keys.add(entry.key);
 return keys;
}
let inbox=parse(localStorage.getItem(INBOX_KEY),null);
if(!inbox||inbox.version!==1){inbox={version:1,known:[...historicalKnown()],unread:[]};localStorage.setItem(INBOX_KEY,JSON.stringify(inbox))}
let known=new Set(inbox.known||[]),unread=new Set(inbox.unread||[]);
function persist(){inbox={version:1,known:[...known],unread:[...unread]};localStorage.setItem(INBOX_KEY,JSON.stringify(inbox))}
function ensureModal(){let host=$('discoveryUnlockModal');if(host)return host;host=document.createElement('div');host.id='discoveryUnlockModal';host.className='discovery-unlock-modal';host.setAttribute('aria-hidden','true');host.innerHTML='<section class="discovery-unlock-card" role="dialog" aria-modal="true" aria-labelledby="discoveryUnlockTitle"><strong id="discoveryUnlockTitle"></strong><p>Confira suas descobertas no menu.</p><button type="button" id="discoveryUnlockContinue">CONTINUAR</button></section>';document.body.appendChild(host);$('discoveryUnlockContinue')?.addEventListener('click',dismissModal);return host}
function showNext(){if(current||!queue.length)return;current=queue.shift();queued.delete(current);const host=ensureModal();$('discoveryUnlockTitle').textContent=modalTitle(current);host.classList.add('show');host.setAttribute('aria-hidden','false');requestAnimationFrame(()=>$('discoveryUnlockContinue')?.focus())}
function dismissModal(){const host=ensureModal();host.classList.remove('show');host.setAttribute('aria-hidden','true');current=null;setTimeout(showNext,90)}
function enqueue(rawKey){if(current===rawKey||queued.has(rawKey))return;queued.add(rawKey);queue.push(rawKey);showNext()}
function scheduleRender(){if(renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;renderIndicators()})}
function uniqueEls(xs){return [...new Set(xs.filter(Boolean))]}

/* Only discoveries that currently belong to a visible player collection may keep the
   global unread badge alive. Isotopes can still receive their own acknowledgement,
   but they do not leave a hidden H/He/Be/etc. badge before that base element has
   actually entered the Elements collection. */
function collectionItemKeys(){
 const data=saveData(),items=new Set();
 for(const rawKey of data.rewardDiscoveries||[]){const item=itemKeyFor(rawKey);if(item)items.add(item)}
 for(const sym of data.discovered||[]){if(baseElementSymbol(sym)!==sym||!elementCard(sym))continue;items.add(`element:${sym}`)}
 return items;
}
function reconcileUnread(){
 const owned=collectionItemKeys();let changed=false;
 for(const item of [...unread]){if(owned.has(item))continue;unread.delete(item);changed=true}
 if(changed)persist();return changed;
}
function renderIndicators(){
 reconcileUnread();
 const count=unread.size,data=saveData(),discovered=new Set(data.discovered||[]);
 for(const menu of uniqueEls([$('campaignHomeMenuBtn'),$('menuOpenBtn')]))menu.classList.toggle('discovery-has-unread',count>0);
 for(const quick of uniqueEls([$('campaignHomeDiscoveries'),$('phaseQuickDiscoveries')])){
  quick.classList.toggle('discovery-has-unread',count>0);
  if(count>0)quick.dataset.unreadCount=String(count);else quick.removeAttribute('data-unread-count');
 }
 document.querySelectorAll('#catalog .el-card').forEach(card=>{
  const sym=card.querySelector('.s')?.textContent?.trim()||'',collected=!!sym&&discovered.has(sym);
  if(collected)card.dataset.discoveryCollected='1';else delete card.dataset.discoveryCollected;
  card.classList.toggle('discovery-unread',collected&&unread.has(`element:${sym}`));
 });
 document.querySelectorAll('#discoveryAtlas .discovery-card[data-discovery-key]').forEach(card=>card.classList.toggle('discovery-unread',unread.has(card.dataset.discoveryKey||'')));
 window.dispatchEvent(new CustomEvent('ardua:discovery-inbox',{detail:{count,unread:[...unread]}}));
}
function ingest(keys,announce){let changed=false;for(const rawKey of keys){if(known.has(rawKey))continue;known.add(rawKey);changed=true;const item=itemKeyFor(rawKey);if(item)unread.add(item);if(announce&&item)enqueue(rawKey)}if(changed){persist();scheduleRender()}}
function checkSavedDiscoveries(announce=true){const all=currentDiscoveryKeys(),fresh=[...all].filter(key=>!known.has(key));if(fresh.length)ingest(fresh,announce)}
function markRead(itemKey){if(!itemKey||!unread.delete(itemKey))return;persist();scheduleRender()}

/* Audit the engine's real first creation phase for every periodic-table element. The
   graph order is authoritative, while structural opening/milestone phases are skipped
   because they may name an element without creating it. */
const firstElementPhaseBySymbol=new Map();let firstElementAuditReady=false;
function parseFirstElementCreationPhases(text){
 const rows=new Map();
 for(const line of String(text||'').split('\n')){
  if(!line.includes("{id:'"))continue;
  const id=line.match(/\bid:'([^']+)'/)?.[1],newSym=line.match(/\bnew:'([^']+)'/)?.[1],mode=line.match(/\bmode:'([^']+)'/)?.[1]||'';
  if(id&&newSym)rows.set(id,{id,newSym,mode});
 }
 const symbols=catalogElementSymbols(),order=window.ARDUA_CAMPAIGN_GRAPH?.baseOrder||window.ARDUA_CAMPAIGN_GRAPH?.runtimeOrder||[...rows.keys()];
 for(const id of order){const row=rows.get(id);if(!row||!symbols.has(row.newSym)||STRUCTURAL_ELEMENT_MODES.has(row.mode)||firstElementPhaseBySymbol.has(row.newSym))continue;firstElementPhaseBySymbol.set(row.newSym,id)}
 firstElementAuditReady=true;
 window.ARDUA_ELEMENT_DISCOVERY_AUDIT=Object.freeze({ready:true,count:firstElementPhaseBySymbol.size,firstPhaseFor:sym=>firstElementPhaseBySymbol.get(sym)||''});
}
fetch(new URL('assets/js/ardua.js',document.baseURI).href,{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(parseFirstElementCreationPhases).catch(()=>{firstElementAuditReady=true});

/* The engine updates state.discovered at the exact creation moment, but several fusion
   paths only serialize the save when the phase completes. Identify that specific Set by
   matching it to the persisted discovered array and serialize just the new element after
   the creation animation. This lets the existing discovery modal/unread system react to
   first creation instead of phase completion. */
const pendingElementSaves=[];
function scheduleImmediateElementSave(sym){
 if(pendingElementSaves.includes(sym))return;pendingElementSaves.push(sym);
 setTimeout(()=>{
  const at=pendingElementSaves.indexOf(sym);if(at>=0)pendingElementSaves.splice(at,1);
  const data=saveData(),list=Array.isArray(data.discovered)?[...data.discovered]:[];if(list.includes(sym))return;
  list.push(sym);localStorage.setItem(SAVE_KEY,JSON.stringify({...data,discovered:list}));
 },420);
}
function activeCampaignPhase(){return window.ARDUA_CAMPAIGN?.getState?.().activeId||''}
function setMatchesSavedDiscoveries(set,saved){if(set.size!==saved.length)return false;for(const value of set)if(!saved.includes(value))return false;return true}
const nativeSetAdd=Set.prototype.add;
Set.prototype.add=function(value){
 const sym=typeof value==='string'?value:'',expected=firstElementAuditReady?firstElementPhaseBySymbol.get(sym):'',active=expected?activeCampaignPhase():'',data=expected&&active===expected?saveData():null,saved=Array.isArray(data?.discovered)?data.discovered:[],capture=!!expected&&active===expected&&!saved.includes(sym)&&setMatchesSavedDiscoveries(this,saved);
 const result=nativeSetAdd.apply(this,arguments);if(capture)scheduleImmediateElementSave(sym);return result;
};

const previousSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){const result=previousSet.apply(this,arguments);if(this===localStorage&&key===SAVE_KEY)checkSavedDiscoveries(true);return result};
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null;if(!target)return;
 const element=target.closest('#catalog .el-card');
 if(element){
  /* A freshly created element can be CSS-visible before the legacy phase-completion
     gate clears its hidden property. Clear it in capture phase so the existing element
     detail handler sees the card as actionable on this same click. */
  if(element.dataset.discoveryCollected==='1'&&element.hidden)element.hidden=false;
  const sym=element.querySelector('.s')?.textContent?.trim();if(sym)markRead(`element:${sym}`);
 }
 const phenomenon=target.closest('#discoveryAtlas .discovery-card[data-discovery-key]');if(phenomenon)markRead(phenomenon.dataset.discoveryKey||'');
},true);
const menuModal=$('menuModal'),discoveryAtlas=$('discoveryAtlas');let discoveryAtlasSnapshot='';
function syncDiscoveryAtlasOwnership(){
 if(!menuModal?.classList.contains('discoveries-view')||!discoveryAtlas)return;
 const keyed=discoveryAtlas.querySelectorAll('.discovery-card[data-discovery-key]');
 if(keyed.length){discoveryAtlasSnapshot=discoveryAtlas.innerHTML;return}
 if(!discoveryAtlasSnapshot)return;
 const legacy=discoveryAtlas.querySelector('.discovery-card:not([data-discovery-key])');
 if(!legacy&&discoveryAtlas.childElementCount>0)return;
 discoveryAtlas.innerHTML=discoveryAtlasSnapshot;scheduleRender();
}
if(menuModal)new MutationObserver(()=>{scheduleRender();queueMicrotask(syncDiscoveryAtlasOwnership)}).observe(menuModal,{childList:true,subtree:true});
$('campaignData')?.addEventListener('click',()=>requestAnimationFrame(syncDiscoveryAtlasOwnership));syncDiscoveryAtlasOwnership();
const campaignMap=$('campaignMap');if(campaignMap)new MutationObserver(scheduleRender).observe(campaignMap,{childList:true,subtree:true});
const ambient=$('ambientBanner');
function clearLegacyReward(){if(!ambient?.classList.contains('show'))return;if(ambient.classList.contains('discovery')||ambient.classList.contains('completion'))queueMicrotask(()=>$('ambientContinueBtn')?.click())}
if(ambient)new MutationObserver(clearLegacyReward).observe(ambient,{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY)checkSavedDiscoveries(false);if(e.key===INBOX_KEY){const next=parse(e.newValue,null);if(next?.version===1){known=new Set(next.known||[]);unread=new Set(next.unread||[]);scheduleRender()}}});
window.addEventListener('ardua:campaign-progress',()=>{checkSavedDiscoveries(true);syncDiscoveryAtlasOwnership();scheduleRender()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&ensureModal().classList.contains('show')){e.preventDefault();dismissModal()}});
checkSavedDiscoveries(false);ensureModal();scheduleRender();clearLegacyReward();
})();