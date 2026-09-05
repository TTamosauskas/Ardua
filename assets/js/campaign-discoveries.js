/* Ardua — discoveries panel bridge for the campaign map. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const editor=!!C?.editor;
const dataBtn=$('campaignData'),closeBtn=$('campaignClose'),modal=$('menuModal'),closeMenu=$('closeMenu');
if(!dataBtn||!closeBtn||!modal)return;
const card=modal.querySelector('.card'),heading=card?.querySelector(':scope > h2'),mode=$('phaseMenuMode'),hint=$('phaseMenuHint'),phaseMenu=$('phaseMenu');
const firstSeparator=phaseMenu?.nextElementSibling?.classList?.contains('menu-sep')?phaseMenu.nextElementSibling:null;
let activeTab='reactions';

const PHENOMENA=[
 {key:'process:s',glyph:'s',title:'Processo-s',group:'Processos',text:'Capturas lentas de nêutrons intercaladas com decaimentos.',infer:['rb','sr','bi']},
 {key:'process:r',glyph:'r',title:'Processo-r',group:'Processos',text:'Capturas rápidas durante fluxos intensos de nêutrons.',infer:['eu','u']},
 {key:'process:rp',glyph:'p',title:'rp-process',group:'Processos',text:'Capturas rápidas de prótons em uma estrela de nêutrons em acreção.',infer:['rp_cu','rp_te']},
 {key:'phenomenon:tripleAlpha',glyph:'3α',title:'Triplo-alfa',group:'Fenômenos',text:'Berílio-8 instável recebe outro Hélio e forma Carbono.',infer:['c']},
 {key:'phenomenon:stellarConvection',glyph:'↕',title:'Convecção Estelar',group:'Fenômenos',text:'Correntes de plasma transportam matéria e energia entre diferentes regiões da estrela.'},
 {key:'phenomenon:waitingPoint',glyph:'β⁺',title:'Waiting point',group:'Fenômenos',text:'Um núcleo proton-rich interrompe temporariamente a sequência de capturas.'},
 {key:'phenomenon:freezeout',glyph:'n↓',title:'Freeze-out',group:'Fenômenos',text:'O fluxo de nêutrons cai e os decaimentos passam a dominar.'},
 {key:'phenomenon:supernova',glyph:'✦',title:'Supernova',group:'Eventos cósmicos',text:'Uma explosão estelar dispersa matéria enriquecida.',infer:['final_collapse']},
 {key:'phenomenon:neutronStar',glyph:'NS',title:'Estrela de Nêutrons',group:'Eventos cósmicos',text:'Remanescente compacto sustentado por matéria extremamente densa.',infer:['neutron_star']},
 {key:'phenomenon:blackHole',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.',infer:['black_hole']},
 {key:'phenomenon:plannedChain',glyph:'×',title:'Cadeia planejada',group:'Domínio',text:'Uma continuação nuclear já estava geometricamente preparada antes da reação inicial.'}
];

function saveData(){try{return JSON.parse(localStorage.getItem('stellarForgeV1013')||'{}')||{}}catch(e){return{}}}
function completedSet(){return new Set(C?.getState?.().completed||[])}
function keepMapLabels(){
 dataBtn.textContent='Descobertas';
 dataBtn.setAttribute('aria-label','Abrir descobertas');
 if(closeBtn.textContent!=='Voltar')closeBtn.textContent='Voltar';
}
function setPhaseChromeHidden(hidden){for(const el of [mode,hint,phaseMenu,firstSeparator])if(el)el.hidden=hidden}
function ensurePhaseIds(){
 [...(phaseMenu?.querySelectorAll('.phase-jump')||[])].forEach((b,i)=>{if(!b.dataset.phaseId&&G?.runtimeOrder?.[i])b.dataset.phaseId=G.runtimeOrder[i]});
}
function ensureTabs(){
 if(!card||$('discoveriesTabs'))return;
 const tabs=document.createElement('div');tabs.id='discoveriesTabs';tabs.className='discoveries-tabs';tabs.setAttribute('role','tablist');
 tabs.innerHTML=`<button type="button" role="tab" data-discovery-tab="reactions">Reações</button><button type="button" role="tab" data-discovery-tab="elements">Elementos</button><button type="button" role="tab" data-discovery-tab="phenomena">Fenômenos</button>`;
 heading?.insertAdjacentElement('afterend',tabs);
 const reaction=$('reactionCatalog')?.closest('.menu-section'),phenomena=$('discoveryAtlas')?.closest('.menu-section'),elements=$('catalog')?.closest('.menu-section');
 if(reaction){reaction.classList.add('discovery-panel');reaction.dataset.discoveryPanel='reactions'}
 if(elements){elements.classList.add('discovery-panel');elements.dataset.discoveryPanel='elements'}
 if(phenomena){phenomena.classList.add('discovery-panel');phenomena.dataset.discoveryPanel='phenomena'}
 tabs.addEventListener('click',e=>{const b=e.target.closest('[data-discovery-tab]');if(b)switchTab(b.dataset.discoveryTab)});
}
function switchTab(tab){
 activeTab=tab;
 modal.querySelectorAll('[data-discovery-tab]').forEach(b=>{const on=b.dataset.discoveryTab===tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
 modal.querySelectorAll('[data-discovery-panel]').forEach(p=>p.hidden=p.dataset.discoveryPanel!==tab);
}
function emptyState(host,text){
 let el=host?.querySelector(':scope > .discovery-empty');
 if(!el&&host){el=document.createElement('div');el.className='discovery-empty';host.appendChild(el)}
 if(el)el.textContent=text;
}
function clearEmpty(host){host?.querySelector(':scope > .discovery-empty')?.remove()}

function filterElements(data,completed){
 const host=$('catalog');if(!host)return;
 clearEmpty(host);
 const discovered=new Set(data.discovered||[]),completedNames=new Set();
 ensurePhaseIds();
 phaseMenu?.querySelectorAll('.phase-jump').forEach(b=>{if(completed.has(b.dataset.phaseId)){const name=b.querySelector('.new')?.textContent?.trim();if(name)completedNames.add(name)}});
 let visible=0;
 host.querySelectorAll('.el-card').forEach(card=>{
  const sym=card.querySelector('.s')?.textContent?.trim(),name=card.querySelector('.nm')?.textContent?.trim(),show=editor||discovered.has(sym)||completedNames.has(name);
  card.hidden=!show;if(show)visible++;
 });
 if(!visible)emptyState(host,'Os elementos aparecem aqui conforme são formados ou identificados na campanha.');
}
function knownElementSymbols(){return new Set([...($('catalog')?.querySelectorAll('.el-card .s')||[])].map(x=>x.textContent.trim()))}
function reactionIsDiscovered(text,discovered,knownSymbols){
 if(editor)return true;
 const rhs=String(text||'').split('→').pop()||'';
 const symbols=(rhs.match(/[A-Z][a-z]?/g)||[]).filter(s=>knownSymbols.has(s));
 return symbols.length===0||symbols.some(s=>discovered.has(s));
}
function filterEngineReactions(data){
 const discovered=new Set(data.discovered||[]),known=knownElementSymbols();
 for(const host of [$('reactionCatalog'),$('protonCaptureCatalog')]){
  if(!host)continue;
  host.querySelectorAll('.reaction-chip').forEach(chip=>chip.hidden=!reactionIsDiscovered(chip.textContent,discovered,known));
 }
}
function ensureTrailReactionHost(){
 const section=$('reactionCatalog')?.closest('.menu-section');if(!section)return null;
 let host=$('trailReactionCatalog');if(host)return host;
 const title=document.createElement('h3');title.className='trail-reaction-title';title.textContent=editor?'Reações da campanha':'Reações da trilha';
 host=document.createElement('div');host.id='trailReactionCatalog';host.className='reaction-catalog trail-reaction-catalog';
 section.append(title,host);return host;
}
function renderTrailReactions(completed){
 const host=ensureTrailReactionHost();if(!host)return;host.innerHTML='';ensurePhaseIds();
 const buttons=[...(phaseMenu?.querySelectorAll('.phase-jump')||[])];
 const structural=new Set(['bigbang','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','white','final_collapse','neutron_star','pulsar','accretion','stability','black_hole']);
 const chosen=buttons.filter(b=>{
  const id=b.dataset.phaseId||'';
  if(editor)return id&&!structural.has(id);
  return id.startsWith('atlas_')&&completed.has(id);
 });
 const seen=new Set();
 chosen.forEach(b=>{const label=b.querySelector('strong')?.textContent?.trim();if(!label||seen.has(label))return;seen.add(label);const chip=document.createElement('span');chip.className='reaction-chip trail-reaction';chip.textContent=label;host.appendChild(chip)});
 if(!host.childElementCount)emptyState(host,'As reações aparecem aqui conforme são concluídas na trilha.');
}
function phenomenonOpen(entry,rewards,completed){return editor||rewards.has(entry.key)||(entry.infer||[]).some(id=>completed.has(id))}
function renderPhenomena(data,completed){
 const host=$('discoveryAtlas'),detail=$('discoveryDetail');if(!host)return;host.innerHTML='';
 const rewards=new Set(data.rewardDiscoveries||[]);let group='',visible=0;
 for(const entry of PHENOMENA){if(!phenomenonOpen(entry,rewards,completed))continue;visible++;
  if(entry.group!==group){group=entry.group;const h=document.createElement('div');h.className='discovery-group';h.textContent=group;host.appendChild(h)}
  const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked';b.innerHTML=`<span class="discovery-glyph">${entry.glyph}</span><span><strong>${entry.title}</strong><small>${entry.group}</small></span>`;
  b.addEventListener('click',()=>{if(detail)detail.innerHTML=`<strong>${entry.title}</strong><span>${entry.group}</span><p>${entry.text}</p>`});host.appendChild(b);
 }
 if(!visible)emptyState(host,'Fenômenos e processos aparecem aqui depois de serem observados na campanha.');
 const h=host.closest('.menu-section')?.querySelector('h3');if(h)h.textContent='Fenômenos';
}
function prepareDiscoveries(){
 ensureTabs();ensurePhaseIds();
 const data=saveData(),completed=completedSet();
 filterElements(data,completed);filterEngineReactions(data);renderTrailReactions(completed);renderPhenomena(data,completed);switchTab(activeTab);
}
function openDiscoveries(){
 modal.classList.add('discoveries-view','show');modal.setAttribute('aria-label','Descobertas');
 if(heading)heading.textContent='Descobertas';setPhaseChromeHidden(true);$('mapDetail')?.classList.remove('show');
 prepareDiscoveries();requestAnimationFrame(()=>card?.scrollTo({top:0,behavior:'auto'}));
}
function leaveDiscoveriesView(){
 modal.classList.remove('discoveries-view');modal.removeAttribute('aria-label');if(heading)heading.textContent='Fases';setPhaseChromeHidden(false);
 modal.querySelectorAll('[data-discovery-panel]').forEach(p=>p.hidden=false);
}

keepMapLabels();new MutationObserver(keepMapLabels).observe(closeBtn,{childList:true,subtree:true});
dataBtn.addEventListener('click',()=>requestAnimationFrame(openDiscoveries));
closeMenu?.addEventListener('click',()=>setTimeout(leaveDiscoveriesView,0));
window.addEventListener('ardua:campaign-progress',()=>{if(modal.classList.contains('discoveries-view'))prepareDiscoveries()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('discoveries-view')){modal.classList.remove('show');leaveDiscoveriesView()}});
})();
