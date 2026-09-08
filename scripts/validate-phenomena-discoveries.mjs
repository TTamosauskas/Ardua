// Valida o catálogo expandido de descobertas científicas, suas fases e a interface visual da aba Fenômenos.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const discoveries=await fs.readFile(path.join(root,'assets/js/campaign-discoveries.js'),'utf8');
const modal=await fs.readFile(path.join(root,'assets/js/campaign-phase-modal.js'),'utf8');
const phenomenaUI=await fs.readFile(path.join(root,'assets/js/campaign-discoveries-phenomena.js'),'utf8');
const phenomenaCSS=await fs.readFile(path.join(root,'assets/css/campaign-discoveries-phenomena.css'),'utf8');
const index=await fs.readFile(path.join(root,'index.html'),'utf8');

const expected=Object.freeze({
 'Vento Solar':['solar_wind'], 'Ionização':['stellar_ionization'], 'Anã Marrom':['brown'], 'Anã Vermelha':['he_red'], 'Anã Branca':['white'], 'Anã Laranja':['he_orange'], 'Anã Amarela':['he_yellow'],
 'Gigante Vermelha':['c'], 'Gigante Amarela':['n'], 'Gigante Azul':['o'], 'Gigante Branca':['fragile'],
 'Supergigante Vermelha':['ne'], 'Supergigante Amarela':['oxygen_burn'], 'Supergigante Azul':['cl'], 'Estrela AGB':['rb'],
 'Espalação':['spallation_be'], 'Prótons':['primordial_d'], 'Disco de acreção':['accretion'], 'Nêutrons':['primordial_d'], 'Elétrons':['atomic_he'],
 'Convecção Estelar':['stellar_convection'], 'Jatos Coronais':['coronal_jets'], 'Reconexão Magnética':['coronal_jets'], 'Barreira de Coulomb':['coulomb_intro'], 'Pulsar':['pulsar'], 'Raios X':['accretion'], 'Decaimento':['decay_pa'], 'Kilonova':['kilonova'], 'Raios gama':['gamma_process'],
 'Big Bang':['bigbang'], 'Nucleossíntese primordial':['primordial_d'], 'Recombinação cósmica':['atomic_he'],
 'Neutrinos':['nu_f','neutronize'], 'Pósitrons':['he_orange'], 'Antineutrinos':['co'], 'Raios cósmicos':['spallation_be'],
 'Tunelamento quântico':['coulomb_intro'], 'Neutronização / captura eletrônica':['neutronize'], 'Pressão de degenerescência eletrônica':['white'],
 'Fotodesintegração':['gamma_process'], 'Colapso gravitacional':['first_generation_formation','final_collapse'], 'Nucleossíntese explosiva':['ni_fusion','final_collapse']
});

for(const [title,phases] of Object.entries(expected)){
 const titleToken=`title:'${title}'`;
 const titleAt=discoveries.indexOf(titleToken);
 if(titleAt<0)throw new Error(`Descoberta ausente: ${title}`);
 const lineStart=discoveries.lastIndexOf('\n',titleAt)+1,lineEnd=discoveries.indexOf('\n',titleAt);
 const entry=discoveries.slice(lineStart,lineEnd<0?undefined:lineEnd);
 for(const phase of phases)if(!entry.includes(`'${phase}'`))throw new Error(`${title}: fase esperada ${phase}`);
}

for(const token of ['Cosmologia','Partículas','Estrelas','Processos estelares','Processos nucleares','Radiação','Remanescentes e eventos']){
 if(!discoveries.includes(`group:'${token}'`))throw new Error(`Grupo de dados ausente: ${token}`);
}
if(!discoveries.includes('window.ARDUA_PHASE_DISCOVERIES='))throw new Error('Mapa público de descobertas por fase ausente');
// O mapa continua alimentando Descobertas, mas o preview da fase não pode antecipar a surpresa.
for(const token of ['data-phase-discoveries','window.ARDUA_PHASE_DISCOVERIES?.[id]','Descobertas da fase:']){
 if(modal.includes(token))throw new Error(`Modal de fase voltou a revelar descobertas: ${token}`);
}

for(const token of ['phenomena-square-grid','phenomenonDiscoveryDetail','firstWikiParagraph','pageimages','WIKI_ALIASES']){
 if(!phenomenaUI.includes(token))throw new Error(`Interface de Fenômenos perdeu: ${token}`);
}
for(const token of ['aspect-ratio:1/1','discovery-group{display:none','phenomenon-wiki-image','phenomenon-wiki-copy']){
 if(!phenomenaCSS.includes(token))throw new Error(`Estilo de Fenômenos perdeu: ${token}`);
}
if(!index.includes('assets/js/campaign-discoveries-phenomena.js'))throw new Error('Controlador visual de Fenômenos fora do index');

console.log(`Phenomena discoveries OK: ${Object.keys(expected).length} descobertas vinculadas às fases; surpresa do modal, grade quadrada e detalhe Wikipedia validados.`);
