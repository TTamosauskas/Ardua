import fs from 'node:fs';

const discoveriesPath='assets/js/campaign-discoveries.js';
let src=fs.readFileSync(discoveriesPath,'utf8');
const mustReplace=(from,to,label)=>{if(!src.includes(from))throw new Error(`Âncora ausente: ${label}`);src=src.replace(from,to)};

mustReplace(
"const PHENOMENA=[\n {key:'particle:proton'",
"const PHENOMENA=[\n {key:'phenomenon:bigBang',glyph:'◎',title:'Big Bang',group:'Cosmologia',text:'A expansão inicial do Universo marca o começo da história térmica e da formação de toda a matéria observada na campanha.',phases:['bigbang'],infer:['bigbang']},\n {key:'phenomenon:primordialNucleosynthesis',glyph:'BBN',title:'Nucleossíntese primordial',group:'Cosmologia',text:'Nos primeiros minutos do Universo, prótons e nêutrons formaram principalmente Deutério, Hélio e pequenas quantidades de Lítio.',phases:['primordial_d'],infer:['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li']},\n {key:'phenomenon:cosmicRecombination',glyph:'e⁻',title:'Recombinação cósmica',group:'Cosmologia',text:'Quando o Universo esfriou, elétrons passaram a se ligar aos núcleos e formaram os primeiros átomos neutros.',phases:['atomic_he'],infer:['atomic_he','atomic_h','atomic_li']},\n\n {key:'particle:proton'",
'cosmologia');

mustReplace(
" {key:'particle:electron',glyph:'e⁻',title:'Elétrons',group:'Partículas',text:'Partículas de carga negativa que formam a nuvem eletrônica dos átomos e tornam possível a química da matéria.',phases:['atomic_he'],infer:['atomic_he','atomic_h','atomic_li']},\n\n {key:'star:brownDwarf'",
" {key:'particle:electron',glyph:'e⁻',title:'Elétrons',group:'Partículas',text:'Partículas de carga negativa que formam a nuvem eletrônica dos átomos e tornam possível a química da matéria.',phases:['atomic_he'],infer:['atomic_he','atomic_h','atomic_li']},\n {key:'particle:neutrino',glyph:'νₑ',title:'Neutrinos',group:'Partículas',text:'Partículas eletricamente neutras e de interação extremamente fraca, produzidas em reações nucleares e em grande quantidade durante o colapso de estrelas massivas.',phases:['nu_f','neutronize'],infer:['nu_f','neutronize']},\n {key:'particle:positron',glyph:'e⁺',title:'Pósitrons',group:'Partículas',text:'Antipartículas do elétron emitidas em processos da interação fraca, como etapas da cadeia próton-próton.',phases:['he_orange'],infer:['he_orange','he_yellow']},\n {key:'particle:antineutrino',glyph:'ν̄ₑ',title:'Antineutrinos',group:'Partículas',text:'Antipartículas dos neutrinos eletrônicos que acompanham decaimentos β− e transportam energia para fora do núcleo.',phases:['co'],infer:['co']},\n {key:'particle:cosmicRay',glyph:'CR',title:'Raios cósmicos',group:'Partículas',text:'Partículas de altíssima energia que atravessam o meio interestelar e podem fragmentar núcleos mais pesados por espalação.',phases:['spallation_be'],infer:['spallation_be','spallation']},\n\n {key:'star:brownDwarf'",
'partículas adicionais');

mustReplace(
" {key:'phenomenon:coulombBarrier',glyph:'Z₁Z₂',title:'Barreira de Coulomb',group:'Processos estelares',text:'A repulsão elétrica entre núcleos positivos precisa ser vencida ou atravessada por tunelamento quântico para a fusão ocorrer.',phases:['coulomb_intro'],infer:['coulomb_intro']},\n {key:'phenomenon:stellarConvection'",
" {key:'phenomenon:coulombBarrier',glyph:'Z₁Z₂',title:'Barreira de Coulomb',group:'Processos estelares',text:'A repulsão elétrica entre núcleos positivos precisa ser vencida ou atravessada por tunelamento quântico para a fusão ocorrer.',phases:['coulomb_intro'],infer:['coulomb_intro']},\n {key:'phenomenon:quantumTunneling',glyph:'ψ',title:'Tunelamento quântico',group:'Processos estelares',text:'A natureza quântica permite que núcleos atravessem probabilisticamente a barreira elétrica e alcancem distâncias onde a força nuclear pode uni-los.',phases:['coulomb_intro'],infer:['coulomb_intro']},\n {key:'phenomenon:stellarConvection'",
'tunelamento');

mustReplace(
" {key:'phenomenon:stellarConvection',glyph:'↕',title:'Convecção Estelar',group:'Processos estelares',text:'Correntes de plasma transportam matéria e energia entre diferentes regiões da estrela.',phases:['stellar_convection'],infer:['stellar_convection']},\n\n {key:'phenomenon:tripleAlpha'",
" {key:'phenomenon:stellarConvection',glyph:'↕',title:'Convecção Estelar',group:'Processos estelares',text:'Correntes de plasma transportam matéria e energia entre diferentes regiões da estrela.',phases:['stellar_convection'],infer:['stellar_convection']},\n {key:'phenomenon:electronDegeneracy',glyph:'e⁻e⁻',title:'Pressão de degenerescência eletrônica',group:'Processos estelares',text:'Em matéria extremamente comprimida, o princípio de exclusão de Pauli gera uma pressão quântica capaz de sustentar uma anã branca.',phases:['white'],infer:['white']},\n {key:'phenomenon:gravitationalCollapse',glyph:'↓G',title:'Colapso gravitacional',group:'Processos estelares',text:'A gravidade concentra matéria durante o nascimento de estrelas e, em estrelas massivas evoluídas, pode provocar o colapso final do núcleo.',phases:['first_generation_formation','final_collapse'],infer:['first_generation_formation','final_collapse']},\n\n {key:'phenomenon:tripleAlpha'",
'processos estelares adicionais');

mustReplace(
" {key:'phenomenon:decay',glyph:'β',title:'Decaimento',group:'Processos nucleares',text:'Núcleos instáveis transformam-se espontaneamente em estados mais estáveis, emitindo partículas ou radiação.',phases:['decay_pa'],infer:['decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at']},\n {key:'process:s'",
" {key:'phenomenon:decay',glyph:'β',title:'Decaimento',group:'Processos nucleares',text:'Núcleos instáveis transformam-se espontaneamente em estados mais estáveis, emitindo partículas ou radiação.',phases:['decay_pa'],infer:['decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at']},\n {key:'phenomenon:neutronization',glyph:'e⁻p',title:'Neutronização / captura eletrônica',group:'Processos nucleares',text:'Sob compressão extrema, elétrons podem ser capturados por prótons, formando nêutrons e emitindo neutrinos eletrônicos.',phases:['neutronize'],infer:['neutronize']},\n {key:'phenomenon:photodisintegration',glyph:'γ,n',title:'Fotodesintegração',group:'Processos nucleares',text:'Fótons muito energéticos podem remover partículas de núcleos e redirecionar redes de nucleossíntese em ambientes quentes.',phases:['gamma_process'],infer:['gamma_mo','gamma_ru','gamma_process']},\n {key:'phenomenon:explosiveNucleosynthesis',glyph:'SN',title:'Nucleossíntese explosiva',group:'Processos nucleares',text:'Choques, temperaturas extremas e expansão rápida durante uma supernova abrem rotas nucleares que produzem e redistribuem elementos pesados.',phases:['ni_fusion','final_collapse'],infer:['ni_fusion','final_collapse']},\n {key:'process:s'",
'processos nucleares adicionais');

fs.writeFileSync(discoveriesPath,src);

const validation=`import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const discoveries=await fs.readFile(path.join(root,'assets/js/campaign-discoveries.js'),'utf8');
const modal=await fs.readFile(path.join(root,'assets/js/campaign-phase-modal.js'),'utf8');

const expected=Object.freeze({
 'Anã Marrom':['brown'], 'Anã Vermelha':['he_red'], 'Anã Branca':['white'], 'Anã Laranja':['he_orange'], 'Anã Amarela':['he_yellow'],
 'Gigante Vermelha':['c'], 'Gigante Amarela':['n'], 'Gigante Azul':['o'], 'Gigante Branca':['fragile'],
 'Supergigante Vermelha':['ne'], 'Supergigante Amarela':['oxygen_burn'], 'Supergigante Azul':['cl'], 'Estrela AGB':['rb'],
 'Espalação':['spallation_be'], 'Prótons':['primordial_d'], 'Disco de acreção':['accretion'], 'Nêutrons':['primordial_d'], 'Elétrons':['atomic_he'],
 'Convecção Estelar':['stellar_convection'], 'Barreira de Coulomb':['coulomb_intro'], 'Pulsar':['pulsar'], 'Raios X':['accretion'], 'Decaimento':['decay_pa'], 'Kilonova':['kilonova'], 'Raios gama':['gamma_process'],
 'Big Bang':['bigbang'], 'Nucleossíntese primordial':['primordial_d'], 'Recombinação cósmica':['atomic_he'],
 'Neutrinos':['nu_f','neutronize'], 'Pósitrons':['he_orange'], 'Antineutrinos':['co'], 'Raios cósmicos':['spallation_be'],
 'Tunelamento quântico':['coulomb_intro'], 'Neutronização / captura eletrônica':['neutronize'], 'Pressão de degenerescência eletrônica':['white'],
 'Fotodesintegração':['gamma_process'], 'Colapso gravitacional':['first_generation_formation','final_collapse'], 'Nucleossíntese explosiva':['ni_fusion','final_collapse']
});

for(const [title,phases] of Object.entries(expected)){
 const titleToken=\`title:'\${title}'\`;
 const titleAt=discoveries.indexOf(titleToken);
 if(titleAt<0)throw new Error(\`Descoberta ausente: \${title}\`);
 const lineStart=discoveries.lastIndexOf('\\n',titleAt)+1,lineEnd=discoveries.indexOf('\\n',titleAt);
 const entry=discoveries.slice(lineStart,lineEnd<0?undefined:lineEnd);
 for(const phase of phases)if(!entry.includes(\`'\${phase}'\`))throw new Error(\`\${title}: fase esperada \${phase}\`);
}

for(const token of ['Cosmologia','Partículas','Estrelas','Processos estelares','Processos nucleares','Radiação','Remanescentes e eventos']){
 if(!discoveries.includes(\`group:'\${token}'\`))throw new Error(\`Grupo ausente: \${token}\`);
}
if(!discoveries.includes('window.ARDUA_PHASE_DISCOVERIES='))throw new Error('Mapa público de descobertas por fase ausente');
if(!modal.includes('data-phase-discoveries'))throw new Error('Modal de fase sem área de descobertas');
if(!modal.includes('window.ARDUA_PHASE_DISCOVERIES?.[id]'))throw new Error('Modal de fase sem leitura do mapa de descobertas');

console.log(\`Phenomena discoveries OK: \${Object.keys(expected).length} descobertas vinculadas às fases e exibidas no modal.\`);
`;
fs.writeFileSync('scripts/validate-phenomena-discoveries.mjs',validation);

console.log('Expansão de fenômenos aplicada.');
