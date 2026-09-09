const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const graph=read('assets/js/campaign-quarks-graph.js');
const game=read('assets/js/campaign-quarks.js');
const css=read('assets/css/campaign-quarks.css');
const coreCss=read('assets/css/ardua.css');
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
expect(game.includes("if(eligible.length<2&&live.length===3)")&&game.includes("baryonKind([id,...remainder.map(x=>x.id)])"),'when only the final valid trio remains, any of its quarks must expose the other two without deadlocking');
expect(game.includes("if(candidateIds.includes(id)){fuse();return}"),'one click on either highlighted partner must execute the three-quark recipe');
expect(!game.includes('picked=new Set')&&!game.includes('candidateIds.every'),'Quarks recipe must not require a third click');
expect(game.includes("Crie Prótons e Nêutrons — ${total}/2"),'objective counter must be 0/2 through 2/2');
expect(game.includes("3 quarks → 1 próton ou nêutron"),'objective formula must explain the three-quark result');
expect(game.includes("end.textContent='Proxima fase'"),'final central button must say exactly Proxima fase');
expect(game.includes("primordial-particle ${isProton?'proton':'neutronfree'} quarks-baryon"),'formed baryons must reuse the native free proton/neutron visual classes from primordial gameplay');
expect(game.includes("returnActiveId=C.getState?.().activeId||''"),'Quarks must remember the campaign phase that owned the map before launch');
expect(game.includes("const next=returnActiveId&&returnActiveId!=='quarks'?returnActiveId:'primordial_d'"),'first completion must hand the current map state to deuterium while revisits return to their previous campaign position');
expect(game.includes("source:'quarks-complete'"),'completion handoff must refresh campaign state after the native map opens');
expect(game.includes('finishToMap()'),'the central final button must execute the synchronized map handoff');
expect(game.includes("function setPreviewText(el,value){if(el&&el.textContent!==value)")&&game.includes("function setPreviewClass(el,value){if(el&&el.className!==value)"),'Quarks preview mutations must be idempotent to avoid MutationObserver feedback loops');

expect(game.includes('function renderQuarksInfo()'),'Quarks must use the standard information panel below the board');
expect(game.includes("setText('infoName','Quarks')")&&game.includes('Força Nuclear Forte mantém os quarks ligados'),'the information panel must explain Quarks and the strong nuclear force');
expect(game.includes('uud → próton')&&game.includes('udd → nêutron'),'the information panel must show both baryon combinations');
expect(!game.includes('quarks-hint')&&!game.includes('quarks-field'),'the obsolete instruction box and decorative field must not be rendered inside the board');
expect(!css.includes('.quarks-hint')&&!css.includes('.quarks-field'),'no obsolete text box or circular field styling may remain');
expect(game.includes("board?.classList.add('primordial-mode','quarks-free-mode')"),'Quarks must use the open primordial board mode rather than a stellar grid');
expect(css.includes('.quarks-stage{position:absolute;inset:0;z-index:42;overflow:visible'),'Quarks play area must stay open with no clipped circular arena');
expect(!css.includes('.quarks-stage{position:absolute;inset:0;z-index:42;border-radius:50%'),'Quarks stage must not delimit play with a circular boundary');

expect(game.includes('function rotationMotionEnabled(){return window.ARDUA_ROTATION?.enabled?.()!==false}'),'Quarks particle drift must follow the global rotation preference');
expect(game.includes("window.addEventListener('ardua:rotation-change'"),'Quarks movement must react to rotation toggles');
expect(game.includes('motionFrameId=requestAnimationFrame(moveParticles)'),'Quarks must keep a free-particle drift loop');
expect(game.includes('addMotion(`baryon-${kind}`'),'formed protons and neutrons must also participate in free drift');

expect(game.includes("b.classList.add('quark-reaction-source','aligning')"),'recipe animation must visibly align the three selected quarks');
expect(game.includes('playFrequency(root*1.25)')&&game.includes('playFrequency(root*1.5,true)'),'recipe animation must play the intermediate selection/alignment notes');
expect(game.includes('playChord(root)')&&game.includes('playFinalAccent(root)'),'recipe union must end with the chord and final accent');
expect(css.includes('.quark-piece.quark-reaction-source')&&css.includes('.quarks-union-burst'),'alignment, convergence and union effects must have dedicated visual states');
expect(game.includes("focus.className='objective-motif-stage quarks-recipe-focus'"),'Quarks recipe must reuse the native objective-motif focus circle shown by primordial recipes');
expect(coreCss.includes('.objective-motif-stage::before'),'native recipe focus circle contract must still exist in the core stylesheet');
expect(css.includes('width:clamp(72px,calc(var(--cellSize)*1.72),112px)')&&css.includes('font-size:clamp(30px,calc(var(--cellSize)*.82),58px)'),'reacting quarks must enlarge to the same visual scale as native recipe particles');
expect(game.includes('focusXs=[w*.24,w*.5,w*.76]'),'the three enlarged quarks must spread across the focus circle before converging');
expect(game.includes('retireRecipeFocus(focus)')&&css.includes('.quarks-recipe-focus.leaving{opacity:0}'),'the recipe focus circle must disappear after the union');
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

console.log('Quarks phase validation passed: free primordial field, two-click recipe, native focus circle, enlarged reactants, movement and audiovisual cadence verified.');
