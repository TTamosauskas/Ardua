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
 {key:'phenomenon:bigBang',glyph:'◎',title:'Big Bang',group:'Cosmologia',text:'A expansão inicial do Universo marca o começo da história térmica e da formação de toda a matéria observada na campanha.',phases:['bigbang'],infer:['bigbang']},
 {key:'phenomenon:primordialNucleosynthesis',glyph:'BBN',title:'Nucleossíntese primordial',group:'Cosmologia',text:'Nos primeiros minutos do Universo, prótons e nêutrons formaram principalmente Deutério, Hélio e pequenas quantidades de Lítio.',phases:['primordial_d'],infer:['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li']},
 {key:'phenomenon:cosmicRecombination',glyph:'e⁻',title:'Recombinação cósmica',group:'Cosmologia',text:'Quando o Universo esfriou, elétrons passaram a se ligar aos núcleos e formaram os primeiros átomos neutros.',phases:['atomic_he'],infer:['atomic_he','atomic_h','atomic_li']},

 {key:'particle:proton',glyph:'p⁺',title:'Prótons',group:'Partículas',text:'Núcleos de Hidrogênio com carga elétrica positiva. São uma das matérias-primas fundamentais das reações de fusão.',phases:['primordial_d'],infer:['bigbang','primordial_d']},
 {key:'particle:neutron',glyph:'n',title:'Nêutrons',group:'Partículas',text:'Partículas eletricamente neutras do núcleo atômico. Participam da formação de isótopos e dos processos de captura de nêutrons.',phases:['primordial_d'],infer:['primordial_d']},
 {key:'particle:electron',glyph:'e⁻',title:'Elétrons',group:'Partículas',text:'Partículas de carga negativa que formam a nuvem eletrônica dos átomos e tornam possível a química da matéria.',phases:['atomic_he'],infer:['atomic_he','atomic_h','atomic_li']},
 {key:'particle:neutrino',glyph:'νₑ',title:'Neutrinos',group:'Partículas',text:'Partículas eletricamente neutras e de interação extremamente fraca, produzidas em reações nucleares e em grande quantidade durante o colapso de estrelas massivas.',phases:['nu_f','neutronize'],infer:['nu_f','neutronize']},
 {key:'particle:positron',glyph:'e⁺',title:'Pósitrons',group:'Partículas',text:'Antipartículas do elétron emitidas em processos da interação fraca, como etapas da cadeia próton-próton.',phases:['he_orange'],infer:['he_orange','he_yellow']},
 {key:'particle:antineutrino',glyph:'ν̄ₑ',title:'Antineutrinos',group:'Partículas',text:'Antipartículas dos neutrinos eletrônicos que acompanham decaimentos β− e transportam energia para fora do núcleo.',phases:['co'],infer:['co']},
 {key:'particle:cosmicRay',glyph:'CR',title:'Raios cósmicos',group:'Partículas',text:'Partículas de altíssima energia que atravessam o meio interestelar e podem fragmentar núcleos mais pesados por espalação.',phases:['spallation_be'],infer:['spallation_be','spallation']},

 {key:'star:brownDwarf',glyph:'BD',title:'Anã Marrom',group:'Estrelas',text:'Objeto subestelar com massa insuficiente para sustentar a fusão estável de Hidrogênio como uma estrela comum.',phases:['brown'],infer:['brown']},
 {key:'star:redDwarf',glyph:'M',title:'Anã Vermelha',group:'Estrelas',text:'Estrela de baixa massa, fria e longeva, capaz de consumir seu combustível de Hidrogênio muito lentamente.',phases:['he_red'],infer:['he_red']},
 {key:'star:orangeDwarf',glyph:'K',title:'Anã Laranja',group:'Estrelas',text:'Estrela de sequência principal de massa intermediária-baixa, mais quente que uma anã vermelha e mais fria que uma estrela semelhante ao Sol.',phases:['he_orange'],infer:['he_orange']},
 {key:'star:yellowDwarf',glyph:'G',title:'Anã Amarela',group:'Estrelas',text:'Estrela de sequência principal do tipo solar, sustentada pela fusão de Hidrogênio em seu núcleo.',phases:['he_yellow'],infer:['he_yellow']},
 {key:'star:whiteDwarf',glyph:'WD',title:'Anã Branca',group:'Estrelas',text:'Remanescente estelar compacto formado quando uma estrela de massa baixa ou intermediária encerra suas principais etapas de fusão.',phases:['white'],infer:['white']},
 {key:'star:redGiant',glyph:'RG',title:'Gigante Vermelha',group:'Estrelas',text:'Estrela evoluída com envelope muito expandido e superfície relativamente fria, após o esgotamento do Hidrogênio central.',phases:['c'],infer:['c']},
 {key:'star:yellowGiant',glyph:'YG',title:'Gigante Amarela',group:'Estrelas',text:'Estrela gigante de temperatura superficial intermediária, em uma etapa avançada de evolução estelar.',phases:['n'],infer:['n']},
 {key:'star:blueGiant',glyph:'BG',title:'Gigante Azul',group:'Estrelas',text:'Estrela gigante quente e luminosa, com elevada temperatura superficial e evolução relativamente rápida.',phases:['o'],infer:['o']},
 {key:'star:whiteGiant',glyph:'WG',title:'Gigante Branca',group:'Estrelas',text:'Ramo quente da fase gigante representado na campanha, associado a uma superfície de alta temperatura e evolução avançada.',phases:['fragile'],infer:['fragile']},
 {key:'star:redSupergiant',glyph:'RSG',title:'Supergigante Vermelha',group:'Estrelas',text:'Estrela massiva evoluída com raio enorme e envelope frio, capaz de avançar por sucessivas etapas de fusão nuclear.',phases:['ne'],infer:['ne']},
 {key:'star:yellowSupergiant',glyph:'YSG',title:'Supergigante Amarela',group:'Estrelas',text:'Estrela massiva e muito luminosa em uma faixa intermediária de temperatura superficial.',phases:['oxygen_burn'],infer:['oxygen_burn']},
 {key:'star:blueSupergiant',glyph:'BSG',title:'Supergigante Azul',group:'Estrelas',text:'Estrela massiva extremamente quente e luminosa, em uma fase avançada de evolução.',phases:['cl'],infer:['cl']},
 {key:'star:agb',glyph:'AGB',title:'Estrela AGB',group:'Estrelas',text:'Estrela do ramo assintótico das gigantes, com camadas de queima nuclear e ambiente favorável ao processo-s.',phases:['rb'],infer:['rb','sr']},

 {key:'phenomenon:solarWind',glyph:'↗',title:'Vento Solar',group:'Processos estelares',text:'Fluxo contínuo de plasma que escapa da coroa de uma estrela como o Sol, composto principalmente por prótons e elétrons e também por íons.',phases:['solar_wind'],infer:[]},
 {key:'phenomenon:stellarIonization',glyph:'e⁻',title:'Ionização',group:'Processos estelares',text:'Processo em que uma colisão suficientemente energética remove um elétron ligado de um átomo, formando um íon positivo e aumentando a população de elétrons livres.',phases:['stellar_ionization'],infer:['stellar_ionization']},
 {key:'phenomenon:coulombBarrier',glyph:'Z₁Z₂',title:'Barreira de Coulomb',group:'Processos estelares',text:'A repulsão elétrica entre núcleos positivos precisa ser vencida ou atravessada por tunelamento quântico para a fusão ocorrer.',phases:['coulomb_intro'],infer:['coulomb_intro']},
 {key:'phenomenon:quantumTunneling',glyph:'ψ',title:'Tunelamento quântico',group:'Processos estelares',text:'A natureza quântica permite que núcleos atravessem probabilisticamente a barreira elétrica e alcancem distâncias onde a força nuclear pode uni-los.',phases:['coulomb_intro'],infer:['coulomb_intro']},
 {key:'phenomenon:stellarConvection',glyph:'↕',title:'Convecção Estelar',group:'Processos estelares',text:'Correntes de plasma transportam matéria e energia entre diferentes regiões da estrela.',phases:['stellar_convection'],infer:['stellar_convection']},
 {key:'phenomenon:coronalJet',glyph:'↗',title:'Jatos Coronais',group:'Processos estelares',text:'Jatos estreitos e rápidos de plasma podem ser acelerados para fora da atmosfera estelar por reconexão magnética.',phases:['coronal_jets'],infer:['coronal_jets']},
 {key:'phenomenon:magneticReconnection',glyph:'⌁',title:'Reconexão Magnética',group:'Processos estelares',text:'Linhas de campo magnético podem mudar de conectividade e liberar energia, acelerando plasma ionizado na atmosfera estelar.',phases:['coronal_jets'],infer:['coronal_jets']},
 {key:'phenomenon:solarFlare',glyph:'☀',title:'Erupções Solares',group:'Processos estelares',text:'Erupções solares são explosões repentinas na superfície do Sol causadas por mudanças no seu campo magnético. Essas explosões liberam altos níveis de radiação e partículas a altas velocidades que estavam armazenados nas linhas de campo magnético. As linhas de campo magnético formam uma "sombra" na fotosfera do Sol, que são as manchas solares.',phases:['coronal_jets'],infer:['coronal_jets']},
 {key:'phenomenon:electronDegeneracy',glyph:'e⁻e⁻',title:'Pressão de degenerescência eletrônica',group:'Processos estelares',text:'Em matéria extremamente comprimida, o princípio de exclusão de Pauli gera uma pressão quântica capaz de sustentar uma anã branca.',phases:['white'],infer:['white']},
 {key:'phenomenon:gravitationalCollapse',glyph:'↓G',title:'Colapso gravitacional',group:'Processos estelares',text:'A gravidade concentra matéria durante o nascimento de estrelas e, em estrelas massivas evoluídas, pode provocar o colapso final do núcleo.',phases:['first_generation_formation','final_collapse'],infer:['first_generation_formation','final_collapse']},

 {key:'phenomenon:tripleAlpha',glyph:'3α',title:'Triplo-alfa',group:'Processos nucleares',text:'Berílio-8 instável recebe outro Hélio e forma Carbono.',phases:['c'],infer:['c']},
 {key:'phenomenon:spallation',glyph:'✧',title:'Espalação',group:'Processos nucleares',text:'Colisões energéticas fragmentam núcleos mais pesados e produzem núcleos leves, como Berílio e Boro.',phases:['spallation_be'],infer:['spallation_be','spallation']},
 {key:'phenomenon:decay',glyph:'β',title:'Decaimento',group:'Processos nucleares',text:'Núcleos instáveis transformam-se espontaneamente em estados mais estáveis, emitindo partículas ou radiação.',phases:['decay_pa'],infer:['decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at']},
 {key:'phenomenon:neutronization',glyph:'e⁻p',title:'Neutronização / captura eletrônica',group:'Processos nucleares',text:'Sob compressão extrema, elétrons podem ser capturados por prótons, formando nêutrons e emitindo neutrinos eletrônicos.',phases:['neutronize'],infer:['neutronize']},
 {key:'phenomenon:photodisintegration',glyph:'γ,n',title:'Fotodesintegração',group:'Processos nucleares',text:'Fótons muito energéticos podem remover partículas de núcleos e redirecionar redes de nucleossíntese em ambientes quentes.',phases:['gamma_process'],infer:['gamma_mo','gamma_ru','gamma_process']},
 {key:'phenomenon:explosiveNucleosynthesis',glyph:'SN',title:'Nucleossíntese explosiva',group:'Processos nucleares',text:'Choques, temperaturas extremas e expansão rápida durante uma supernova abrem rotas nucleares que produzem e redistribuem elementos pesados.',phases:['ni_fusion','final_collapse'],infer:['ni_fusion','final_collapse']},
 {key:'process:s',glyph:'s',title:'Processo-s',group:'Processos nucleares',text:'Capturas lentas de nêutrons intercaladas com decaimentos.',phases:['rb'],infer:['rb','sr','bi']},
 {key:'process:r',glyph:'r',title:'Processo-r',group:'Processos nucleares',text:'Capturas rápidas durante fluxos intensos de nêutrons.',phases:['eu'],infer:['eu','u']},
 {key:'process:rp',glyph:'p',title:'rp-process',group:'Processos nucleares',text:'Capturas rápidas de prótons em uma estrela de nêutrons em acreção.',phases:['rp_cu'],infer:['rp_cu','rp_te']},
 {key:'phenomenon:waitingPoint',glyph:'β⁺',title:'Waiting point',group:'Processos nucleares',text:'Um núcleo proton-rich interrompe temporariamente a sequência de capturas.',phases:['stability'],infer:['stability']},
 {key:'phenomenon:freezeout',glyph:'n↓',title:'Freeze-out',group:'Processos nucleares',text:'O fluxo de nêutrons cai e os decaimentos passam a dominar.',infer:['u','decay_pa']},

 {key:'radiation:xray',glyph:'X',title:'Raios X',group:'Radiação',text:'Radiação eletromagnética energética produzida em ambientes extremos, como matéria aquecida em torno de objetos compactos.',phases:['accretion'],infer:['accretion']},
 {key:'radiation:gamma',glyph:'γ',title:'Raios gama',group:'Radiação',text:'Fótons de energia muito alta emitidos por transições nucleares e por alguns dos eventos mais energéticos do Universo.',phases:['gamma_process'],infer:['gamma_process']},

 {key:'phenomenon:supernova',glyph:'✦',title:'Supernova',group:'Remanescentes e eventos',text:'Uma explosão estelar dispersa matéria enriquecida.',phases:['final_collapse'],infer:['final_collapse']},
 {key:'phenomenon:neutronStar',glyph:'NS',title:'Estrela de Nêutrons',group:'Remanescentes e eventos',text:'Remanescente compacto sustentado por matéria extremamente densa.',phases:['neutron_star'],infer:['neutron_star']},
 {key:'phenomenon:pulsar',glyph:'PSR',title:'Pulsar',group:'Remanescentes e eventos',text:'Estrela de nêutrons magnetizada em rápida rotação que produz feixes periódicos de radiação.',phases:['pulsar'],infer:['pulsar']},
 {key:'phenomenon:accretionDisk',glyph:'◎',title:'Disco de acreção',group:'Remanescentes e eventos',text:'Matéria em órbita perde energia e forma um disco aquecido enquanto espirala em direção a um objeto compacto.',phases:['accretion'],infer:['accretion']},
 {key:'phenomenon:kilonova',glyph:'KN',title:'Kilonova',group:'Remanescentes e eventos',text:'Transiente luminoso produzido pela fusão de objetos compactos, associado à síntese de muitos elementos pesados pelo processo-r.',phases:['kilonova'],infer:['kilonova']},
 {key:'phenomenon:blackHole',glyph:'●',title:'Buraco Negro',group:'Remanescentes e eventos',text:'Colapso extremo com formação de um horizonte de eventos.',phases:['black_hole'],infer:['black_hole']},
 {key:'phenomenon:hawkingRadiation',glyph:'hν',title:'Radiação Hawking',group:'Remanescentes e eventos',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos de um buraco negro.',infer:['black_hole']},
 {key:'phenomenon:plannedChain',glyph:'×',title:'Cadeia planejada',group:'Domínio',text:'Uma continuação nuclear já estava geometricamente preparada antes da reação inicial.'}
];

const phaseDiscoveryEntries=new Map();
for(const entry of PHENOMENA)for(const id of entry.phases||[]){const list=phaseDiscoveryEntries.get(id)||[];list.push(entry);phaseDiscoveryEntries.set(id,list)}
window.ARDUA_PHASE_DISCOVERIES=Object.freeze(Object.fromEntries([...phaseDiscoveryEntries].map(([id,entries])=>[id,Object.freeze(entries.map(({key,title,group})=>Object.freeze({key,title,group}))) ])));

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

function persistPhaseDiscoveries(completed){
 if(editor)return;
 const data=saveData(),rewards=new Set(data.rewardDiscoveries||[]);let changed=false;
 for(const entry of PHENOMENA){
  if(!(entry.phases||[]).some(id=>completed.has(id))||rewards.has(entry.key))continue;
  rewards.add(entry.key);changed=true;
 }
 if(!changed)return;
 try{localStorage.setItem('stellarForgeV1013',JSON.stringify({...data,rewardDiscoveries:[...rewards]}))}catch(_e){}
}

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
 const completed=completedSet();persistPhaseDiscoveries(completed);
 const data=saveData();
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
window.addEventListener('ardua:campaign-progress',()=>{const completed=completedSet();persistPhaseDiscoveries(completed);if(modal.classList.contains('discoveries-view'))prepareDiscoveries()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('discoveries-view')){modal.classList.remove('show');leaveDiscoveriesView()}});
})();
