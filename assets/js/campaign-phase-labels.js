/* Ardua — unified phase identity, compact objective headers, menu and map labels. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
if(!C||!G)return;
const $=id=>document.getElementById(id);
const sequence=name=>new Set(G.sequences?.[name]||[]);
const weakS=sequence('weakS'),sProcess=sequence('sprocess'),rProcess=sequence('r'),rpProcess=sequence('rp'),decays=sequence('decay');

const CONTEXT=Object.freeze({
 primordial_he3d:'HÉLIO-4 VIA HÉLIO-3',primordial_td:'HÉLIO-4 VIA TRÍTIO',
 first_atomic_bonds:'PRIMEIRAS LIGAÇÕES ATÔMICAS',first_nebulae:'PRIMEIRAS NEBULOSAS',
 first_generation_formation:'PRIMEIRA GERAÇÃO',brown_formation:'FORMAÇÃO DA ANÃ MARROM',brown:'ANÃ MARROM',
 low_mass_formation:'BAIXA MASSA',he_red:'ANÃ VERMELHA',stellar_movement:'MOVIMENTAÇÃO ESTELAR',
 solar_wind:'VENTO SOLAR',stellar_ionization:'IONIZAÇÃO ESTELAR',stellar_recombination:'RECOMBINAÇÃO ESTELAR',
 intermediate_mass_formation:'MASSA INTERMEDIÁRIA',he_orange:'ANÃ LARANJA',he_yellow:'ANÃ AMARELA',
 coulomb_intro:'BARREIRA DE COULOMB',stellar_convection:'CONVECÇÃO ESTELAR',coronal_jets:'JATOS CORONAIS',
 stellar_li:'CAMERON–FOWLER',giant_formation:'FORMAÇÃO DAS GIGANTES',fragile:'BERÍLIO-8 TRANSITÓRIO',
 c:'TRIPLO-ALFA',n:'ENRIQUECIMENTO EM NITROGÊNIO',o:'CAPTURA ALFA',
 spallation_be:'ESPALAÇÃO CÓSMICA',spallation:'ESPALAÇÃO CÓSMICA',high_mass_formation:'ALTA MASSA',
 carbon_burn:'QUEIMA DE CARBONO',proton_capture:'CAPTURA DE PRÓTONS',carbon_oxygen:'FUSÃO C–O',
 oxygen_burn:'QUEIMA DE OXIGÊNIO',cr_alpha_fe:'CADEIA ALFA DO FERRO',fe:'GRUPO DO FERRO',
 neutronize:'COLAPSO DO NÚCLEO',nu_f:'NEUTRINOS DA SUPERNOVA',gamma_process:'TEMPESTADE DE FÓTONS',
 white:'ANÃ BRANCA',final_collapse:'COLAPSO FINAL',neutron_star:'ESTRELA DE NÊUTRONS',pulsar:'PULSAR',
 accretion:'ACREÇÃO EXTREMA',stability:'LIMITE DE ESTABILIDADE',black_hole:'BURACO NEGRO'
});
const STATIC_GOAL=Object.freeze({
 bigbang:'Inicie o Big Bang',first_enrichment:'Primeiro Enriquecimento',second_birth:'Segunda Geração',
 second_enrichment:'Segundo Enriquecimento',third_birth:'Terceira Geração',
 binary_neutron_stars:'Sistema binário de estrelas de nêutrons',kilonova:'Kilonova',
 stability:'Supere o limite de estabilidade'
});
const MAP_OVERRIDE=Object.freeze({
 brown_formation:'Formação da Anã Marrom',coronal_jets:'Jatos Coronais',stellar_li:'Produção estelar de Lítio',
 carbon_burn:'Queima de Carbono',proton_capture:'Captura de Prótons',carbon_oxygen:'Fusão Carbono–Oxigênio',
 oxygen_burn:'Queima de Oxigênio',cr_alpha_fe:'Cadeia Alfa do Ferro',fe:'Núcleo do grupo do Ferro',
 neutronize:'Colapso do núcleo',co:'Formação de Cobalto',ni_fusion:'Formação de Níquel',nu_f:'Neutrinos da Supernova',
 white:'Anã branca',final_collapse:'Colapso final',first_enrichment:'Primeiro Enriquecimento',second_birth:'Segunda Geração',
 second_enrichment:'Segundo Enriquecimento',third_birth:'Terceira Geração',binary_neutron_stars:'Sistema binário de estrelas de nêutrons',
 kilonova:'Kilonova',neutron_star:'Estrela de nêutrons',pulsar:'Pulsar',accretion:'Acreção extrema',
 stability:'Limite de estabilidade',black_hole:'Buraco negro'
});
const MENU_IDENTITY=new Set([
 'bigbang','primordial_he3d','primordial_td','first_atomic_bonds','first_nebulae','first_generation_formation','brown_formation','brown',
 'low_mass_formation','he_red','stellar_movement','solar_wind','stellar_ionization','stellar_recombination','intermediate_mass_formation','he_orange','he_yellow',
 'coulomb_intro','stellar_convection','coronal_jets','stellar_li','giant_formation','fragile','c','n','o','spallation_be','spallation','high_mass_formation',
 'carbon_burn','proton_capture','carbon_oxygen','oxygen_burn','cr_alpha_fe','fe','neutronize','nu_f','gamma_process','white','final_collapse',
 'first_enrichment','second_birth','second_enrichment','third_birth','binary_neutron_stars','kilonova','neutron_star','pulsar','accretion','stability','black_hole'
]);
const WAITING_RP=new Set(['rp_ge','rp_se','rp_kr']);
let scientificNames={},forgeNames={},syncFrame=0,applying=false;

function activeId(){return C.getState?.().activeId||''}
function firstProgress(text){return String(text||'').match(/\b\d+\/\d+\b/)?.[0]||''}
function compactGoal(raw,id=activeId()){
 if(STATIC_GOAL[id])return STATIC_GOAL[id];
 const text=String(raw||'').replace(/\s+/g,' ').trim();
 if(!text)return'';
 if(id==='first_atomic_bonds')return `Forme HeH⁺${firstProgress(text)?' — '+firstProgress(text):''}`;
 if(id==='first_nebulae')return `Crie gás primordial${firstProgress(text)?' — '+firstProgress(text):''}`;
 if(id==='white'){
  const counts=[...text.matchAll(/\b[CO]\s+\d+\/\d+/g)].map(m=>m[0]);
  return `Forme C e O${counts.length?' — '+counts.join(' · '):''}`;
 }
 const progress=firstProgress(text);
 let base=text.split(/\s+—\s+/)[0].replace(/\s+·\s+observe\b.*$/i,'').trim();
 if(id==='solar_wind')base='Ionize Hidrogênio';
 else if(id==='stellar_movement')base='Leve Hélio ao núcleo';
 else if(id==='coronal_jets')base='Ejete matéria';
 else if(id==='stellar_li')base='Produza Lítio-7';
 else if(id==='brown')base='Queime Deutério';
 else if(id==='he_red'||id==='he_yellow'||id==='coulomb_intro')base='Forme Hélio-4';
 else if(id==='he_orange')base='Forme Hélio-3';
 else if(id==='fragile')base='Forme Berílio-8';
 else if(id==='neutron_star')base='Comprima matéria';
 else if(id==='pulsar')base='Incorpore matéria';
 else if(id==='accretion')base='Alimente o remanescente';
 else if(id==='black_hole')base='Atraia matéria';
 else if(/_formation$/.test(id)||id==='giant_formation'||id==='high_mass_formation'||id==='first_generation_formation')base='Reúna Hidrogênio';
 else if(/^atomic_/.test(id))base=base.replace(/^Forme\s+\d+\s+átomos?\s+de\s+/i,'Forme átomos de ');
 else {
  base=base
   .replace(/^Forme\s+\d+\s+núcleos?\s+de\s+/i,'Forme ')
   .replace(/^Crie\s+\d+\s+núcleos?\s+(?:estáveis\s+)?de\s+/i,'Forme ')
   .replace(/^Crie\s+\d+\s+átomos?\s+de\s+/i,'Forme ')
   .replace(/^Crie\s+\d+\s+/i,'Forme ')
   .replace(/^Produza\s+\d+\s+núcleos?\s+de\s+/i,'Produza ')
   .replace(/^Observe\s+\d+\s+formações\s+independentes\s+de\s+/i,'Forme ')
   .replace(/^Realize\s+\d+\s+correntes\s+convectivas/i,'Realize convecções')
   .replace(/^Realize\s+\d+\s+capturas\s+de\s+prótons/i,'Capture prótons')
   .replace(/^Realize\s+\d+\s+fotodesintegrações/i,'Realize fotodesintegrações')
   .replace(/^Descubra\s+\d+\s+descendentes/i,'Descubra descendentes')
   .replace(/^Comprima\s+\d+\s+núcleos\s+em\s+nêutrons/i,'Comprima núcleos')
   .replace(/^Comprima\s+\d+\s+núcleos/i,'Comprima matéria')
   .replace(/^Incorpore\s+\d+\s+núcleos/i,'Incorpore matéria')
   .replace(/^Atraia\s+\d+\s+átomos\s+ao\s+Buraco\s+Negro/i,'Atraia matéria')
   .replace(/^Teste\s+a\s+aproximação\s+\d+\s+vezes/i,'Teste a aproximação')
   .replace(/^Observe\s+\d+\s+fragmentações\s+completas/i,'Observe fragmentações')
   .replace(/^Complete\s+\d+\s+observações\s+desta\s+reação/i,'Observe a reação')
   .replace(/\s+por\s+(?:Fusão|decaimento)$/i,'')
   .replace(/\s+por\s+Fusão$/i,'');
 }
 base=base.replace(/\s+\d+\/\d+.*$/,'').trim();
 return progress?`${base} — ${progress}`:base;
}
function contextFor(id=activeId()){
 if(WAITING_RP.has(id))return'WAITING POINT · rp-PROCESS';
 if(id==='rp_te')return'CICLO TERMINAL · rp-PROCESS';
 if(rpProcess.has(id))return'rp-PROCESS';
 if(weakS.has(id))return'PROCESSO-S FRACO';
 if(id==='rb')return'RAMIFICAÇÃO DO PROCESSO-S';
 if(id==='sr')return'PRIMEIRO PICO-S';
 if(id==='pb')return'REGIÃO TERMINAL DO PROCESSO-S';
 if(id==='bi')return'LIMITE DO PROCESSO-S';
 if(sProcess.has(id))return'PROCESSO-S';
 if(id==='pt')return'TERCEIRO PICO-R';
 if(id==='au')return'FREEZE-OUT DO PROCESSO-R';
 if(id==='th')return'ACTINÍDEOS';
 if(id==='u')return'EXTREMO DO PROCESSO-R';
 if(rProcess.has(id))return'PROCESSO-R';
 if(decays.has(id))return'CADEIA RADIOATIVA';
 return CONTEXT[id]||'';
}
function originalText(strong){
 if(!strong)return'';
 if(!strong.dataset.phaseOriginalLabel)strong.dataset.phaseOriginalLabel=(strong.textContent||'').trim();
 return strong.dataset.phaseOriginalLabel||'';
}
function elementName(id,fallback=''){
 const candidates=[forgeNames[id],scientificNames[id],fallback].filter(Boolean);
 for(let text of candidates){
  text=String(text).trim().replace(/^Forme\s+/i,'').replace(/^Forjar\s+/i,'').replace(/^Formação\s+de\s+/i,'').replace(/^Síntese\s+de\s+/i,'').replace(/^Forja\s+de\s+/i,'');
  if(id==='rb')return'Rubídio';if(id==='sr')return'Estrôncio';
  if(/^Primeiro pico:\s*/i.test(text))text=text.replace(/^Primeiro pico:\s*/i,'');
  if(text&&!/^(Estrela|Supergigante|Gigante|Núcleo|Processo|Kilonova|Acreção|Colapso)/i.test(text))return text;
 }
 return fallback||id;
}
function mapName(id,fallback=''){
 const el=elementName(id,fallback);
 if(weakS.has(id))return`Processo-s fraco: ${el}`;
 if(id==='rb')return'Ramificação do Rubídio';
 if(id==='sr')return'Primeiro pico: Estrôncio';
 if(sProcess.has(id))return`Processo-s: ${el}`;
 if(id==='pt')return'Terceiro pico-r: Platina';
 if(rProcess.has(id))return`Processo-r: ${el}`;
 if(rpProcess.has(id))return`rp-process: ${el}${WAITING_RP.has(id)?' · waiting point':id==='rp_te'?' · ciclo terminal':''}`;
 if(decays.has(id))return`${el} · cadeia radioativa`;
 return MAP_OVERRIDE[id]||scientificNames[id]||forgeNames[id]||fallback||id;
}
function menuName(id,fallback=''){
 const el=elementName(id,fallback);
 if(weakS.has(id)||sProcess.has(id)||rProcess.has(id)||rpProcess.has(id)||decays.has(id))return`Forme ${el}`;
 if(MENU_IDENTITY.has(id))return MAP_OVERRIDE[id]||scientificNames[id]||fallback||mapName(id,fallback);
 if(forgeNames[id])return forgeNames[id].replace(/^Forjar\b/i,'Forme');
 if(/^Formação de /i.test(fallback))return`Forme ${fallback.replace(/^Formação de /i,'')}`;
 if(/^Síntese de /i.test(scientificNames[id]||''))return`Forme ${(scientificNames[id]||'').replace(/^Síntese de /i,'')}`;
 if(/^Forja de /i.test(scientificNames[id]||''))return`Forme ${(scientificNames[id]||'').replace(/^Forja de /i,'')}`;
 return scientificNames[id]||fallback||id;
}
function fitOneLine(el){
 if(!el)return;el.style.removeProperty('font-size');const max=17,min=10.5;if(!el.clientWidth)return;
 let size=max;el.style.fontSize=size+'px';while(size>min&&el.scrollWidth>el.clientWidth+.5){size-=.5;el.style.fontSize=size+'px'}
}
function syncCurrent(){
 const title=$('phaseTitle'),identity=$('branchLabel'),goal=$('goalText');if(!title||!identity||!goal)return;
 const id=activeId(),next=compactGoal(goal.textContent,id),context=contextFor(id);
 if(next&&title.textContent!==next)title.textContent=next;
 if(identity.textContent!==context)identity.textContent=context;
 identity.hidden=!context;document.body.classList.add('phase-goal-hierarchy');fitOneLine(title);
}
function syncCollections(){
 document.querySelectorAll('#campaignMap .phase-node[data-phase]').forEach(node=>{const id=node.dataset.phase||'',strong=node.querySelector('strong');if(!strong)return;const original=originalText(strong),next=mapName(id,original);if(next&&strong.textContent!==next)strong.textContent=next});
 document.querySelectorAll('#phaseMenu .phase-jump[data-phase-id]').forEach(button=>{const id=button.dataset.phaseId||'',strong=button.querySelector('strong');if(!strong)return;const original=originalText(strong),next=menuName(id,original);if(next&&strong.textContent!==next)strong.textContent=next});
}
function sync(){if(applying)return;applying=true;try{syncCurrent();syncCollections()}finally{applying=false}}
function schedule(){if(syncFrame)return;syncFrame=requestAnimationFrame(()=>{syncFrame=0;sync()})}
function registerScientificNames(names={}){scientificNames={...scientificNames,...names};schedule()}
function registerForgeNames(names={}){forgeNames={...names};schedule()}

const api=Object.freeze({sync,schedule,compactGoal,contextFor,mapName,menuName,registerScientificNames,registerForgeNames});
window.ARDUA_PHASE_LABELS=api;
const app=document.querySelector('.app');if(app)new MutationObserver(schedule).observe(app,{subtree:true,childList:true,characterData:true});
const map=$('campaignMap');if(map)new MutationObserver(schedule).observe(map,{subtree:true,childList:true,characterData:true});
const menu=$('phaseMenu');if(menu)new MutationObserver(schedule).observe(menu,{subtree:true,childList:true,characterData:true});
window.addEventListener('ardua:campaign-progress',schedule);window.addEventListener('ardua:forge-names',schedule);window.addEventListener('resize',schedule,{passive:true});
sync();setTimeout(sync,0);setTimeout(sync,180);
})();