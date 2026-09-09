const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const graph=read('assets/js/campaign-quarks-graph.js');
const game=read('assets/js/campaign-quarks.js');
const map=read('assets/js/campaign-map.js');
const mapBridge=read('assets/js/campaign-quarks-map.js');
const discoveries=read('assets/js/campaign-quarks-discoveries.js');
const notifications=read('assets/js/campaign-discovery-notifications.js');
const index=read('index.html');

function expect(condition,message){if(!condition)throw new Error(`Quarks validation: ${message}`)}
function before(a,b){return index.indexOf(a)>=0&&index.indexOf(b)>=0&&index.indexOf(a)<index.indexOf(b)}

expect(graph.includes("G.prerequisites.quarks={allOf:['bigbang']}"),'Quarks must unlock from Big Bang');
expect(graph.includes("G.prerequisites.primordial_d={allOf:['quarks']}"),'deuterium must require Quarks');
expect(!graph.includes('A.expand=function'),'Quarks trail placement must not depend on monkey-patching Atlas expansion');
expect(graph.includes("i>=dIndex")&&graph.includes("activeIndex>dIndex"),'advanced saves must inherit Quarks without skipping it for saves parked at deuterium');
expect(graph.includes("INBOX_KEY='arduaDiscoveryInboxV1'")&&graph.includes('unread.delete(key)'),'advanced saves must baseline the four Quarks discoveries as read');
expect(!graph.includes('runtimeOrder.push')&&!graph.includes('runtimeOrder.splice'),'custom phase must not shift the native engine runtime order');

for(const id of ['u1','u2','u3'])expect(game.includes(`id:'${id}',type:'u'`),`missing initial ${id}`);
for(const id of ['d1','d2','d3'])expect(game.includes(`id:'${id}',type:'d'`),`missing initial ${id}`);
expect(game.includes("if(u===2&&d===1)return'proton'"),'uud must produce a proton');
expect(game.includes("if(u===1&&d===2)return'neutron'"),'udd must produce a neutron');
expect(game.includes("made.proton!==1||made.neutron!==1"),'completion must require one proton and one neutron');
expect(game.includes("eligible.slice(0,2)"),'selecting a quark must expose exactly two complementary candidates');
expect(game.includes("if(eligible.length<2)"),'remaining opposite-composition trio must reject the wrong anchor without deadlocking');
expect(game.includes("Crie Prótons e Nêutrons — ${total}/2"),'objective counter must be 0/2 through 2/2');
expect(game.includes("3 quarks → 1 próton ou nêutron"),'objective formula must explain the three-quark result');
expect(game.includes("end.textContent='Proxima fase'"),'final central button must say exactly Proxima fase');
expect(game.includes("className=isProton?'atom quarks-baryon quarks-proton':'neutron quarks-baryon quarks-neutron'"),'formed baryons must reuse native proton/atom and neutron visual classes');
expect(game.includes("returnActiveId=C.getState?.().activeId||''"),'Quarks must remember the campaign phase that owned the map before launch');
expect(game.includes("const next=returnActiveId&&returnActiveId!=='quarks'?returnActiveId:'primordial_d'"),'first completion must hand the current map state to deuterium while revisits return to their previous campaign position');
expect(game.includes("source:'quarks-complete'"),'completion handoff must refresh campaign state after the native map opens');
expect(game.includes('finishToMap()'),'the central final button must execute the synchronized map handoff');
expect(game.includes("function setPreviewText(el,value){if(el&&el.textContent!==value)")&&game.includes("function setPreviewClass(el,value){if(el&&el.className!==value)"),'Quarks preview mutations must be idempotent to avoid MutationObserver feedback loops');
expect(map.includes("phaseEnd.addEventListener('click',()=>{const id=C.getState().activeId;if(id&&id!=='bigbang')C.markCompleted(id)")&&map.includes('showMap({required:true,focusCurrent:true,instant:true})'),'native phase-end listener must complete Quarks and open the required map before the custom handoff refreshes it');

for(const key of ['particle:quark','phenomenon:strongNuclearForce','particle:proton','particle:neutron']){
 expect(game.includes(`'${key}'`),`phase reward missing ${key}`);
 expect(discoveries.includes(key),`atlas mapping missing ${key}`);
}
expect(discoveries.includes("title:'Quarks'")&&discoveries.includes("title:'Força Nuclear Forte'"),'new discovery names must remain stable');
expect(discoveries.includes("entry?.key!==PROTON&&entry?.key!==NEUTRON"),'proton and neutron discovery ownership must move out of older phases');
expect(discoveries.includes("card.hidden=!baryonsUnlocked"),'proton and neutron cards must stay gated until Quarks');
expect(discoveries.includes('glúons e pares quark-antiquark'),'Quarks article must preserve the valence-model caveat');
expect(discoveries.includes('cromodinâmica quântica'),'strong-force article must retain its scientific explanation');
expect(notifications.includes('JATOS|QUARKS')&&notifications.includes('PLATINA|FORÇA'),'discovery modal grammar must support Quarks and Força Nuclear Forte');

expect(mapBridge.includes("quarks.dataset.phase='quarks'")&&mapBridge.includes("deuterium.parentElement.insertBefore(quarks,deuterium)"),'Quarks node must be inserted explicitly immediately before deuterium');
expect(mapBridge.includes('quarks-root-link')&&mapBridge.includes('add(singularity,quarks);add(quarks,deuterium)'),'map bridge must render Big Bang → Quarks → Deuterium');
expect(mapBridge.includes("C.setActive?.('quarks')")&&mapBridge.includes("st.activeId!=='primordial_d'"),'after Big Bang, campaign focus must be redirected from deuterium to Quarks');
expect(mapBridge.includes("source:'quarks-trail'"),'Big Bang redirect must publish a campaign refresh for the explicit Quarks node');

expect(before('assets/js/campaign-required-atlas.js','assets/js/campaign-quarks-graph.js'),'Quarks graph patch must load after the required Atlas');
expect(before('assets/js/campaign-quarks-graph.js','assets/js/campaign-mode.js'),'Quarks graph patch must load before campaign state');
expect(before('assets/js/campaign-phase-names.js','assets/js/campaign-quarks.js'),'Quarks runtime must extend phase names after base names load');
expect(before('assets/js/campaign-quarks.js','assets/js/campaign-map.js'),'Quarks name/runtime must exist before map construction');
expect(before('assets/js/campaign-map.js','assets/js/campaign-quarks-map.js'),'Quarks trail module must load after map construction');
expect(before('assets/js/campaign-discoveries.js','assets/js/campaign-quarks-discoveries.js'),'Quarks discoveries must extend the base catalog');
expect(before('assets/js/campaign-quarks-discoveries.js','assets/js/campaign-discovery-notifications.js'),'Quarks discovery keys must exist before unread inbox initialization');

console.log('Quarks phase validation passed: explicit trail node, stable preview, Big Bang focus and deuterium gate verified.');
