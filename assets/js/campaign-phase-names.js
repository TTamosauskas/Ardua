/* Ardua — distinct scientific names for campaign phases and repeated stellar intros. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN,L=window.ARDUA_PHASE_LABELS;
if(!G||!C)return;

const NAMES=Object.freeze({
 solar_wind:'Vento Solar',
 stellar_ionization:'Ionização Estelar',
 stellar_recombination:'Recombinação Estelar',
 coronal_jets:'Jatos Coronais',
 primordial_he3d:'Hélio-4 via Hélio-3',
 primordial_td:'Hélio-4 via Trítio',
 brown_formation:'Formação da Anã Marrom',
 fragile:'Berílio-8 transitório',
 c:'Triplo-alfa: Carbono',
 n:'Enriquecimento em Nitrogênio',
 o:'Captura alfa: Oxigênio',
 spallation_be:'Espalação: Berílio',
 spallation:'Espalação: Boro',
 high_mass_formation:'Formação da Estrela de Alta Massa',
 ne:'Forja de Neônio',
 na:'Síntese de Sódio',
 mg:'Síntese de Magnésio',
 al:'Síntese de Alumínio',
 si:'Síntese de Silício',
 p:'Síntese de Fósforo',
 s:'Síntese de Enxofre',
 cl:'Síntese de Cloro',
 ar:'Síntese de Argônio',
 k:'Síntese de Potássio',
 ca:'Síntese de Cálcio',
 sc:'Síntese de Escândio',
 ti:'Síntese de Titânio',
 v:'Síntese de Vanádio',
 cr:'Síntese de Cromo',
 mn:'Síntese de Manganês',
 sr:'Primeiro pico: Estrôncio',
 accretion:'Acreção extrema'
});

const GENERIC_INTROS=new Set([
 'GIGANTE VERMELHA','ESTRELA MASSIVA','SUPERGIGANTE','PROCESSO-S FRACO','ESTRELA AGB',
 'KILONOVA','NÚCLEO DO GRUPO DO FERRO','COLAPSO DO NÚCLEO','JARDIM RADIOATIVO','RP-PROCESS'
]);

const weakS=new Set(G.sequences?.weakS||[]),sProcess=new Set(G.sequences?.sprocess||[]),rProcess=new Set(G.sequences?.r||[]),decays=new Set(G.sequences?.decay||[]),rpProcess=new Set(G.sequences?.rp||[]);
let applying=false;

function activeId(){return C.getState?.().activeId||''}
function menuButtons(){return [...document.querySelectorAll('#phaseMenu .phase-jump')]}
function menuTitleFor(id){
 const i=G.runtimeOrder?.indexOf(id)??-1;
 if(i<0)return'';
 return menuButtons()[i]?.querySelector('strong')?.textContent?.trim()||'';
}
function preferredName(id){return NAMES[id]||window.ARDUA_FORGE_NAMES?.[id]||''}
function displayName(id){return preferredName(id)||menuTitleFor(id)||id}
function applyMenuNames(){
 const buttons=menuButtons();
 buttons.forEach((button,index)=>{
  const id=G.runtimeOrder?.[index],name=preferredName(id);
  if(!name)return;
  const strong=button.querySelector('strong');if(strong&&strong.textContent!==name)strong.textContent=name;
 });
}
function applyCurrentName(){
 const id=activeId(),name=preferredName(id),el=document.getElementById('phaseTitle');
 if(name&&el&&el.textContent!==name)el.textContent=name;
}
function introName(id){
 const name=L?.mapName?.(id,displayName(id))||displayName(id);
 if(!name)return'';
 if(weakS.has(id))return `PROCESSO-S FRACO · ${name.replace(/^Processo-s fraco:\s*/i,'')}`;
 if(sProcess.has(id))return `PROCESSO-S · ${name.replace(/^Processo-s:\s*/i,'')}`;
 if(rProcess.has(id))return `PROCESSO-R · ${name.replace(/^Processo-r:\s*/i,'')}`;
 if(rpProcess.has(id))return `rp-PROCESS · ${name.replace(/^rp-process:\s*/i,'').replace(/\s+·\s+(?:waiting point|ciclo terminal)$/i,'')}`;
 if(decays.has(id))return `DECAIMENTO · ${name.replace(/\s+·\s+cadeia radioativa$/i,'')}`;
 return name.toUpperCase();
}
function applyIntroName(){
 const id=activeId(),el=document.getElementById('introTitle');if(!id||!el)return;
 const current=(el.textContent||'').trim().toUpperCase();
 const shouldRename=!!window.ARDUA_FORGE_NAMES?.[id]||GENERIC_INTROS.has(current)||weakS.has(id)||sProcess.has(id)||rProcess.has(id)||rpProcess.has(id)||decays.has(id)||Object.hasOwn(NAMES,id);
 if(!shouldRename)return;
 const next=introName(id);if(next&&el.textContent!==next)el.textContent=next;
}
function applyAll(){
 if(applying)return;applying=true;
 try{
  if(L){L.registerScientificNames?.(NAMES);L.sync?.();applyIntroName()}
  else{applyMenuNames();applyCurrentName();applyIntroName()}
 }finally{applying=false}
}

const menu=document.getElementById('phaseMenu'),phaseTitle=document.getElementById('phaseTitle'),introTitle=document.getElementById('introTitle'),intro=document.getElementById('stellarIntro');
if(!L&&menu)new MutationObserver(applyAll).observe(menu,{childList:true,subtree:true,characterData:true});
if(!L&&phaseTitle)new MutationObserver(applyAll).observe(phaseTitle,{childList:true,subtree:true,characterData:true});
if(introTitle)new MutationObserver(applyAll).observe(introTitle,{childList:true,subtree:true,characterData:true});
if(intro)new MutationObserver(applyAll).observe(intro,{attributes:true,attributeFilter:['class','aria-hidden']});
window.addEventListener('ardua:campaign-progress',applyAll);
window.addEventListener('ardua:forge-names',applyAll);
window.ARDUA_PHASE_NAMES=Object.freeze({...window.ARDUA_PHASE_NAMES,...NAMES});
L?.registerScientificNames?.(NAMES);
applyAll();setTimeout(applyAll,0);
window.ARDUA_PREPARE_PREAMBLE_MAP?.();
})();