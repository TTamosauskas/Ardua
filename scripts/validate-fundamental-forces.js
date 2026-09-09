const fs=require('fs');
const force=fs.readFileSync('assets/js/campaign-fundamental-forces.js','utf8');
const phenomena=fs.readFileSync('assets/js/campaign-discoveries-phenomena.js','utf8');
const elements=fs.readFileSync('assets/js/campaign-discoveries-elements.js','utf8');
const preamble=fs.readFileSync('assets/js/campaign-preamble-map.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}
const specs=[
 ['phenomenon:electromagneticForce','Força Eletromagnética','atomic_he'],
 ['phenomenon:gravitationalForce','Força Gravitacional','brown_formation'],
 ['phenomenon:weakNuclearForce','Força Nuclear Fraca','he_orange']
];
for(const [key,title,phase] of specs){assert(force.includes(key),`${key} ausente`);assert(force.includes(title),`${title} ausente`);assert(force.includes(`phase:'${phase}'`),`${title} ligado à fase errada`)}
assert(force.includes('rewardDiscoveries:[...rewards]'),'Forças precisam entrar no save como descobertas reais');
assert(force.includes('window.ARDUA_PHASE_DISCOVERIES'),'Forças precisam participar do ownership por fase');
assert(index.indexOf('campaign-fundamental-forces.js')>index.indexOf('campaign-quarks-discoveries.js'),'Catálogo de forças precisa vir depois de Quarks');
assert(index.indexOf('campaign-fundamental-forces.js')<index.indexOf('campaign-discovery-notifications.js'),'Catálogo de forças precisa existir antes do inbox');
for(const title of ['Força Eletromagnética','Força Gravitacional','Força Nuclear Fraca'])assert(phenomena.includes(title),`${title} sem detalhe curto`);
for(const target of ["'Força Eletromagnética':'Força eletromagnética'","'Força Gravitacional':'Gravidade'","'Força Nuclear Fraca':'Interação fraca'"])assert(phenomena.includes(target),`Wikipedia alias ausente: ${target}`);
assert(engine.includes("D:{ing:['H','H'],out:'D',emissions:['positron','neutrino'],pp:true}"),'A fase escolhida para a força fraca perdeu a reação p+p do pp-chain');
assert(engine.includes("{id:'he_orange'")&&engine.includes("meta:'Primeiros passos da cadeia próton-próton'"),'A força fraca precisa continuar ancorada na primeira fase explícita da cadeia pp');
assert(elements.includes("data.discovered||[]"),'Elementos precisam depender da coleção realmente descoberta');
assert(elements.includes('Elementos descobertos no jogo aparecerão aqui.'),'Estado vazio de Elementos incorreto');
assert(!elements.includes('Os elementos aparecem aqui depois que sua primeira fase de criação é concluída.'),'Texto antigo do estado vazio voltou');
assert(preamble.includes('Do plasma quente aos primeiros corpos celestes.'),'Texto do Universo Primordial não foi atualizado');
console.log('Fundamental forces OK: EM@atomic_he, gravity@brown_formation, weak@he_orange; element collection gate and preamble copy verified.');
