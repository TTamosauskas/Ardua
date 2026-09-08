const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graph=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const discoveries=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const phenomenaUI=fs.readFileSync('assets/js/campaign-discoveries-phenomena.js','utf8');
const phaseModal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const giantMap=fs.readFileSync('assets/js/campaign-giants-map.js','utf8');
const sources=JSON.parse(fs.readFileSync('assets/data/phenomenon-sources.json','utf8'));
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const requiredEngine=[
 "id:'solar_wind'","fill:28,pool:['H','H','H','H','H','He'],ionizationSpecies:['H']",
 "id:'stellar_ionization'","id:'stellar_recombination'","id:'coulomb_intro'",
 'const STELLAR_CONTINUITY_POPULATION=28',"const STELLAR_CONTINUITY_POOL=Object.freeze(['H','H','H','H','H','He'])",
 'fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION)',"fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION,['H','He','Li'])",
 "function stellarAtomicTransferTarget(s=phase())","s.id==='coulomb_intro'","stellarAtomicSnapshot(next.id)",
 'async function ionizeStellarAtom(piece,electron)','async function recombineStellarIon(piece,electron)',
 "solarWind:{title:'VENTO SOLAR'","stellarIonization:{title:'IONIZAÇÃO'",
 "await teachProductOnce('solarWind'","await teachProductOnce('stellarIonization'",
 'async function triggerSolarWind()','solarWindEligibleParticles().length<10','turns=Math.PI*4','duration:2700','steps=24',
 "for(const kind of ['p','e','n'])","state.stellarIonizations>=s.target&&state.solarWindEvents>=1",
 'Ionize átomos de Hidrogênio ${state.stellarIonizations}/${s.target}',
 'Ionize átomos ${state.stellarIonizations}/${s.target}','Recombine íons ${state.stellarRecombinations}/${s.target}',
 "registerRewardDiscovery('phenomenon:solarWind'","if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}","if(stellarAtomicMode(s))return;"
];
for(const token of requiredEngine)if(!engine.includes(token))throw new Error(`Contrato de plasma ausente: ${token}`);
const order=['he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection'];
let last=-1;for(const id of order){const at=graph.indexOf(`\"${id}\"`);if(at<0||at<=last)throw new Error(`Ordem de campanha inválida em ${id}`);last=at}
for(const token of ['"solar_wind":{"allOf":["he_yellow"]}','"stellar_ionization":{"allOf":["solar_wind"]}','"stellar_recombination":{"allOf":["stellar_ionization"]}','"coulomb_intro":{"allOf":["stellar_recombination"]}','"stellar_convection":{"allOf":["coulomb_intro"]}'])if(!graph.includes(token))throw new Error(`Pré-requisito ausente: ${token}`);
for(const id of ['solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection'])if(!giantMap.includes(`'${id}'`))throw new Error(`Mapa intermediário perdeu ${id}`);
if(!phaseModal.includes("if(id==='solar_wind')return[]"))throw new Error('Modal de Vento Solar ainda mostra resumo de descobertas');
if(!discoveries.includes("key:'phenomenon:solarWind'")||!discoveries.includes("title:'Vento Solar'"))throw new Error('Vento Solar ausente de Fenômenos');
if(!discoveries.includes("key:'phenomenon:stellarIonization'")||!discoveries.includes("title:'Ionização'"))throw new Error('Ionização ausente de Fenômenos');
if(!phenomenaUI.includes("'Ionização':'Ionização'"))throw new Error('Ionização sem alias de detalhe em Fenômenos');
for(const title of ['Vento Solar','Ionização'])if(!sources[title]?.imagePath||!sources[title]?.wikiUrl)throw new Error(`Fonte local incompleta: ${title}`);
if(!campaign.includes('version:11')||!campaign.includes("next.activeId='solar_wind'"))throw new Error('Migração v11 da campanha ausente');
console.log('Stellar plasma follow-up OK: continuity population, map, tooltips, wind animation and Ionization discovery.');
