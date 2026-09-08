const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graph=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const discoveries=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const sources=JSON.parse(fs.readFileSync('assets/data/phenomenon-sources.json','utf8'));
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const requiredEngine=[
 "id:'solar_wind'","title:'Vento Solar'","meta:'H + e⁻ → p⁺ + 2e⁻'",
 "id:'stellar_ionization'","meta:'Átomo + e⁻ → Íon⁺ + 2e⁻'",
 "id:'stellar_recombination'","meta:'Íon⁺ + e⁻ → Átomo + γ'",
 'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',
 'function stellarIonizationKnowledge(s=phase())','function stellarRecombinationKnowledge(s=phase())',
 "!stellarIonizationKnowledge(s)||!neutralStellarAtom(p)","!stellarRecombinationKnowledge(s)||!positiveStellarIon(p)",
 'function triggerSolarWind()','solarWindEligibleParticles().length<10',
 "for(const kind of ['p','e','n'])","state.stellarIonizations>=s.target&&state.solarWindEvents>=1",
 'Ionize átomos de Hidrogênio ${state.stellarIonizations}/${s.target}',
 'Ionize átomos ${state.stellarIonizations}/${s.target}',
 'Recombine íons ${state.stellarRecombinations}/${s.target}',
 "registerRewardDiscovery('phenomenon:solarWind'",'stellarAtomicSnapshot(next.id)',
 "if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}",
 "if(stellarAtomicMode(s))return;"
];
for(const token of requiredEngine)if(!engine.includes(token))throw new Error(`Contrato de plasma ausente: ${token}`);
const order=['he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro'];
let last=-1;for(const id of order){const at=graph.indexOf(`\"${id}\"`);if(at<0||at<=last)throw new Error(`Ordem de campanha inválida em ${id}`);last=at}
for(const token of ['"solar_wind":{"allOf":["he_yellow"]}','"stellar_ionization":{"allOf":["solar_wind"]}','"stellar_recombination":{"allOf":["stellar_ionization"]}','"coulomb_intro":{"allOf":["stellar_recombination"]}'])if(!graph.includes(token))throw new Error(`Pré-requisito ausente: ${token}`);
if(!discoveries.includes("key:'phenomenon:solarWind'")||!discoveries.includes("title:'Vento Solar'"))throw new Error('Vento Solar ausente de Fenômenos');
if(!sources['Vento Solar']?.imagePath||!sources['Vento Solar']?.wikiUrl)throw new Error('Fonte local de Vento Solar incompleta');
if(!campaign.includes('version:11')||!campaign.includes("next.activeId='solar_wind'"))throw new Error('Migração v11 da campanha ausente');
console.log('Stellar plasma phases contract OK');
