import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const discoveries=await fs.readFile(path.join(root,'assets/js/campaign-discoveries.js'),'utf8');
const modal=await fs.readFile(path.join(root,'assets/js/campaign-phase-modal.js'),'utf8');

const expected=Object.freeze({
 'Anã Marrom':'brown',
 'Anã Vermelha':'he_red',
 'Anã Branca':'white',
 'Anã Laranja':'he_orange',
 'Anã Amarela':'he_yellow',
 'Gigante Vermelha':'c',
 'Gigante Amarela':'n',
 'Gigante Azul':'o',
 'Gigante Branca':'fragile',
 'Supergigante Vermelha':'ne',
 'Supergigante Amarela':'oxygen_burn',
 'Supergigante Azul':'cl',
 'Estrela AGB':'rb',
 'Espalação':'spallation_be',
 'Prótons':'primordial_d',
 'Disco de acreção':'accretion',
 'Nêutrons':'primordial_d',
 'Elétrons':'atomic_he',
 'Convecção Estelar':'stellar_convection',
 'Barreira de Coulomb':'coulomb_intro',
 'Pulsar':'pulsar',
 'Raios X':'accretion',
 'Decaimento':'decay_pa',
 'Kilonova':'kilonova',
 'Raios gama':'gamma_process'
});

for(const [title,phase] of Object.entries(expected)){
 const titleToken=`title:'${title}'`;
 const phaseToken=`phases:['${phase}']`;
 const titleAt=discoveries.indexOf(titleToken);
 if(titleAt<0)throw new Error(`Descoberta ausente: ${title}`);
 const entryEnd=discoveries.indexOf('},',titleAt);
 const entry=discoveries.slice(titleAt,entryEnd<0?undefined:entryEnd+2);
 if(!entry.includes(phaseToken))throw new Error(`${title}: fase esperada ${phase}`);
}

for(const token of ['Partículas','Estrelas','Processos estelares','Processos nucleares','Radiação','Remanescentes e eventos']){
 if(!discoveries.includes(`group:'${token}'`))throw new Error(`Grupo ausente: ${token}`);
}
if(!discoveries.includes('window.ARDUA_PHASE_DISCOVERIES='))throw new Error('Mapa público de descobertas por fase ausente');
if(!modal.includes('data-phase-discoveries'))throw new Error('Modal de fase sem área de descobertas');
if(!modal.includes('window.ARDUA_PHASE_DISCOVERIES?.[id]'))throw new Error('Modal de fase sem leitura do mapa de descobertas');

console.log(`Phenomena discoveries OK: ${Object.keys(expected).length} descobertas vinculadas às fases e exibidas no modal.`);
