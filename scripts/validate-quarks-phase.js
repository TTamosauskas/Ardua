const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const graph=read('assets/js/campaign-quarks-graph.js');
const game=read('assets/js/campaign-quarks.js');
const discoveries=read('assets/js/campaign-quarks-discoveries.js');
const index=read('index.html');

function expect(condition,message){if(!condition)throw new Error(`Quarks validation: ${message}`)}
function before(a,b){return index.indexOf(a)>=0&&index.indexOf(b)>=0&&index.indexOf(a)<index.indexOf(b)}

expect(graph.includes("G.prerequisites.quarks={allOf:['bigbang']}"),'Quarks must unlock from Big Bang');
expect(graph.includes("G.prerequisites.primordial_d={allOf:['quarks']}"),'deuterium must require Quarks');
expect(graph.includes("return['quarks',...out]"),'campaign map must insert Quarks before deuterium');
expect(graph.includes("i>=dIndex")&&graph.includes("activeIndex>dIndex"),'advanced saves must inherit Quarks without skipping it for saves parked at deuterium');
expect(!graph.includes('runtimeOrder.push')&&!graph.includes('runtimeOrder.splice'),'custom phase must not shift the native engine runtime order');

for(const id of ['u1','u2','u3'])expect(game.includes(`id:'${id}',type:'u'`),`missing initial ${id}`);
for(const id of ['d1','d2','d3'])expect(game.includes(`id:'${id}',type:'d'`),`missing initial ${id}`);
expect(game.includes("if(u===2&&d===1)return'proton'"),'uud must produce a proton');
expect(game.includes("if(u===1&&d===2)return'neutron'"),'udd must produce a neutron');
expect(game.includes("made.proton!==1||made.neutron!==1"),'completion must require one proton and one neutron');
expect(game.includes("slice(0,2)"),'selecting a quark must expose exactly two complementary candidates');
expect(game.includes("Crie Prótons e Nêutrons — ${total}/2"),'objective counter must be 0/2 through 2/2');
expect(game.includes("3 quarks → 1 próton ou nêutron"),'objective formula must explain the three-quark result');
expect(game.includes("end.textContent='Proxima fase'"),'final central button must say exactly Proxima fase');
expect(game.includes("className=isProton?'atom quarks-baryon quarks-proton':'neutron quarks-baryon quarks-neutron'"),'formed baryons must reuse native proton/atom and neutron visual classes');

for(const key of ['particle:quark','phenomenon:strongNuclearForce','particle:proton','particle:neutron']){
 expect(game.includes(`'${key}'`),`phase reward missing ${key}`);
 expect(discoveries.includes(key),`atlas mapping missing ${key}`);
}
expect(discoveries.includes("title:'Quarks'")&&discoveries.includes("title:'Força Nuclear Forte'"),'new discovery names must remain stable');
expect(discoveries.includes("card.hidden=!baryonsUnlocked"),'proton and neutron cards must stay gated until Quarks');

expect(before('assets/js/campaign-required-atlas.js','assets/js/campaign-quarks-graph.js'),'Quarks graph patch must load after the required Atlas');
expect(before('assets/js/campaign-quarks-graph.js','assets/js/campaign-mode.js'),'Quarks graph patch must load before campaign state');
expect(before('assets/js/campaign-phase-names.js','assets/js/campaign-quarks.js'),'Quarks runtime must extend phase names after base names load');
expect(before('assets/js/campaign-quarks.js','assets/js/campaign-map.js'),'Quarks name/runtime must exist before map construction');
expect(before('assets/js/campaign-discoveries.js','assets/js/campaign-quarks-discoveries.js'),'Quarks discoveries must extend the base catalog');
expect(before('assets/js/campaign-quarks-discoveries.js','assets/js/campaign-discovery-notifications.js'),'Quarks discovery keys must exist before unread inbox initialization');

console.log('Quarks phase validation passed.');
