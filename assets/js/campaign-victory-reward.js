/* Ardua — P1/P1.5 victory → reward → next without making the campaign map a mandatory interstitial. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
const $=id=>document.getElementById(id);
if(!C||!G)return;
const map=$('campaignMap');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const HERO_MOMENTS=Object.freeze({
 quarks:{headline:'Prótons e nêutrons tomaram forma',consequence:'A matéria bariônica agora pode construir os primeiros núcleos.',tone:'primordial'},
 primordial_he3d:{headline:'O primeiro Hélio-4 se formou',consequence:'Núcleos mais estáveis começam a dominar a matéria primordial.',tone:'primordial'},
 primordial_td:{headline:'O primeiro Hélio-4 se formou',consequence:'Núcleos mais estáveis começam a dominar a matéria primordial.',tone:'primordial'},
 first_nebulae:{headline:'O gás primordial se reuniu',consequence:'Nuvens densas de matéria preparam o nascimento das primeiras estrelas.',tone:'stellar'},
 first_generation_formation:{headline:'A primeira estrela nasceu',consequence:'A gravidade reuniu o gás primordial e inaugurou a era estelar.',tone:'stellar'},
 brown_formation:{headline:'Uma anã marrom tomou forma',consequence:'A matéria se contraiu, mas sem massa suficiente para sustentar a fusão do hidrogênio.',tone:'stellar'},
 low_mass_formation:{headline:'Uma estrela de baixa massa nasceu',consequence:'Uma estrela longeva começa sua história de fusão.',tone:'stellar'},
 intermediate_mass_formation:{headline:'Uma estrela intermediária nasceu',consequence:'Mais massa abre novos caminhos de fusão estelar.',tone:'stellar'},
 high_mass_formation:{headline:'Uma estrela massiva nasceu',consequence:'Temperaturas extremas permitirão forjar núcleos cada vez mais pesados.',tone:'stellar'},
 he_red:{headline:'Hélio-4 se acumulou no núcleo',consequence:'A fusão transformou hidrogênio em hélio e mudou o interior da estrela.',tone:'stellar'},
 c:{headline:'Carbono nasceu no núcleo estelar',consequence:'O triplo-alfa abriu o caminho para elementos mais pesados.',tone:'forge'},
 fe:{headline:'O núcleo alcançou o ferro',consequence:'A fusão já não sustenta a estrela como antes; o colapso se aproxima.',tone:'collapse'},
 final_collapse:{headline:'O núcleo entrou em colapso',consequence:'A estrela chegou ao limite e prepara uma transformação extrema.',tone:'collapse'},
 first_enrichment:{headline:'A matéria estelar voltou ao espaço',consequence:'Elementos forjados em estrelas agora enriquecem novas nuvens cósmicas.',tone:'discovery'},
 neutron_star:{headline:'Uma estrela de nêutrons nasceu',consequence:'A matéria foi comprimida a densidades extremas.',tone:'remnant'},
 kilonova:{headline:'Uma kilonova espalhou elementos pesados',consequence:'A colisão de estrelas de nêutrons lançou matéria rica em núcleos pesados.',tone:'remnant'},
 black_hole:{headline:'Um buraco negro se formou',consequence:'Um horizonte de eventos surgiu: da região interna, nem a luz escapa.',tone:'remnant'},
 quasar:{headline:'Um quasar despertou',consequence:'Matéria em queda alimenta um núcleo galáctico de brilho extremo.',tone:'quasar'}
});
let pending=null,reward=null,revisit=null,rewardSerial=0,suppressedMap=false;

function unique(xs){return[...new Set((xs||[]).filter(Boolean))]}
function cleanGoal(text){return String(text||'').replace(/\s*[—-]\s*\d+\s*\/\s*\d+\s*$/,'').trim()}
function phaseName(id){return window.ARDUA_FORGE_NAMES?.[id]||window.ARDUA_PHASE_NAMES?.[id]||map?.querySelector(`.phase-node[data-phase="${id}"] strong`)?.textContent?.trim()||id}
function resultText(goal,name){
 const base=cleanGoal(goal);if(!base)return`${name} concluída`;
 const rules=[[/^Crie\s+/i,'Você criou '],[/^Forme\s+/i,'Você formou '],[/^Produza\s+/i,'Você produziu '],[/^Ative\s+/i,'Você ativou '],[/^Complete\s+/i,'Você completou '],[/^Construa\s+/i,'Você construiu '],[/^Observe\s+/i,'Você observou '],[/^Leve\s+/i,'Objetivo concluído: ']];
 for(const [re,to] of rules)if(re.test(base))return base.replace(re,to);
 return base;
}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true}
function includesPhase(list,id){return Array.isArray(list)&&list.includes(id)}
function phaseTone(id){
 if(id==='quarks'||id==='bigbang'||id.startsWith('primordial_')||id.startsWith('atomic_')||['first_atomic_bonds','first_nebulae'].includes(id))return'primordial';
 if(['first_generation_formation','brown_formation','low_mass_formation','intermediate_mass_formation','high_mass_formation'].includes(id)||includesPhase(G.sequences?.red,id)||includesPhase(G.sequences?.mid,id))return'stellar';
 if(includesPhase(G.sequences?.collapse,id)||id==='final_collapse')return'collapse';
 if(['neutron_star','pulsar','accretion','black_hole','binary_neutron_stars','kilonova'].includes(id))return'remnant';
 if(includesPhase(G.sequences?.high,id)||includesPhase(G.sequences?.weakS,id)||includesPhase(G.sequences?.sprocess,id)||includesPhase(G.sequences?.r,id)||includesPhase(G.sequences?.rp,id))return'forge';
 return'cosmic';
}
function heroMoment(id){
 if(HERO_MOMENTS[id])return HERO_MOMENTS[id];
 if(window.ARDUA_QUASAR?.id===id)return HERO_MOMENTS.quasar;
 return null;
}
function resultCopy(snapshot){
 const hero=heroMoment(snapshot.phaseId);
 if(hero)return{...hero,heroic:true};
 return{headline:resultText(snapshot.goal,snapshot.name),consequence:'',tone:phaseTone(snapshot.phaseId),heroic:false};
}
function ruleMentions(rule,id){return !!rule&&(rule.allOf||[]).includes(id)||(rule?.anyOf||[]).some(group=>(group||[]).includes(id))}
function nextOptions(id){
 const st=C.getState?.()||{},done=new Set(st.completed||[]);
 return Object.keys(G.prerequisites||{}).filter(next=>next!==id&&!done.has(next)&&ruleMentions(G.prerequisites[next],id)&&C.isUnlocked?.(next));
}
function routeFor(snapshot){
 if(snapshot.wasCompleted)return{kind:'map',options:[]};
 const options=nextOptions(snapshot.phaseId);
 if(options.length===1)return{kind:'continue',options};
 if(options.length>1)return{kind:'choose',options};
 return{kind:'map',options:[]};
}
function emit(state,detail={}){
 document.documentElement.dataset.arduaRewardState=state;
 window.dispatchEvent(new CustomEvent('ardua:victory-reward-state',{detail:{state,phaseId:detail.phaseId||reward?.snapshot?.phaseId||pending?.phaseId||'',serial:detail.serial||reward?.serial||rewardSerial,route:detail.route||reward?.route?.kind||''}}));
}
function capture(phaseId,detail={}){
 const st=C.getState?.()||{},done=new Set(st.completed||[]),match=revisit?.id===phaseId?revisit:null;
 return{phaseId,source:detail.source||'completion',goal:$('goalText')?.textContent||'',name:phaseName(phaseId),wasCompleted:done.has(phaseId),activeIdBefore:st.activeId||'',revisitReturnId:match?.returnId||'',discoveries:[],capturedAt:performance.now()};
}
function shouldHoldMap(){return !!pending||!!reward}
function suppressMap(){
 if(!map?.classList.contains('show')||!shouldHoldMap())return;
 map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');suppressedMap=true;
}
if(map)new MutationObserver(suppressMap).observe(map,{attributes:true,attributeFilter:['class']});

function ensureHost(){
 let host=$('campaignVictoryReward');if(host)return host;
 host=document.createElement('div');host.id='campaignVictoryReward';host.className='campaign-victory-reward';host.setAttribute('aria-hidden','true');
 host.innerHTML=`<section class="campaign-victory-card" role="dialog" aria-modal="true" aria-labelledby="victoryRewardResult">
  <span class="victory-reward-kicker">FASE CONCLUÍDA</span>
  <h2 id="victoryRewardResult" data-victory-result></h2>
  <p class="victory-reward-consequence" data-victory-consequence hidden></p>
  <p class="victory-reward-phase" data-victory-phase></p>
  <div class="victory-reward-discovery" data-victory-discovery hidden><small>NOVA DESCOBERTA · ATLAS</small><strong></strong></div>
  <div class="victory-reward-next" data-victory-next hidden><small>A SEGUIR</small><strong></strong></div>
  <div class="victory-reward-actions"><button type="button" class="victory-reward-map" data-victory-map>VER MAPA</button><button type="button" class="victory-reward-primary" data-victory-primary>CONTINUAR</button></div>
 </section>`;
 document.body.appendChild(host);
 host.querySelector('[data-victory-map]')?.addEventListener('click',()=>{if(reward)void handoffMap(reward)});
 host.querySelector('[data-victory-primary]')?.addEventListener('click',()=>{if(!reward)return;reward.route.kind==='continue'?void handoffNext(reward):void handoffMap(reward)});
 return host;
}
function render(){
 if(!reward)return;const host=ensureHost(),{snapshot,route}=reward,copy=resultCopy(snapshot);
 host.dataset.tone=copy.tone;host.dataset.phaseId=snapshot.phaseId;host.classList.toggle('heroic',copy.heroic);
 host.querySelector('[data-victory-result]').textContent=copy.headline;
 const consequence=host.querySelector('[data-victory-consequence]');if(consequence){consequence.hidden=!copy.consequence;consequence.textContent=copy.consequence||''}
 host.querySelector('[data-victory-phase]').textContent=snapshot.name;
 const discovery=host.querySelector('[data-victory-discovery]'),discoveryStrong=discovery?.querySelector('strong'),titles=unique(snapshot.discoveries);
 if(discovery){discovery.hidden=!titles.length;if(discoveryStrong)discoveryStrong.textContent=titles.length===1?titles[0]:`${titles.length} descobertas adicionadas ao Atlas`}
 host.classList.toggle('has-discovery',titles.length>0);
 const next=host.querySelector('[data-victory-next]'),nextStrong=next?.querySelector('strong');
 if(next){next.hidden=route.kind!=='continue';if(nextStrong&&route.options[0])nextStrong.textContent=phaseName(route.options[0])}
 const actions=host.querySelector('.victory-reward-actions'),secondary=host.querySelector('[data-victory-map]'),primary=host.querySelector('[data-victory-primary]');
 if(primary)primary.textContent=route.kind==='continue'?'CONTINUAR':route.kind==='choose'?'ESCOLHER CAMINHO':'VER MAPA';
 if(secondary)secondary.hidden=route.kind!=='continue';actions?.classList.toggle('single',route.kind!=='continue');
}
function rewardFeedback(snapshot){
 const hero=!!heroMoment(snapshot.phaseId),canHaptic=!snapshot.wasCompleted&&!reducedMotion()&&typeof navigator.vibrate==='function';
 if(canHaptic){try{navigator.vibrate(hero?[18,28,24]:14)}catch(_e){}}
 window.dispatchEvent(new CustomEvent('ardua:victory-reward-feedback',{detail:{phaseId:snapshot.phaseId,heroic:hero,haptic:canHaptic,audioOwner:'victory-fanfare'}}));
}
function show(snapshot){
 if(reward)return false;const host=ensureHost(),route=routeFor(snapshot),serial=++rewardSerial;reward={snapshot,route,serial};pending=null;render();
 host.classList.remove('leaving');host.classList.add('show');host.setAttribute('aria-hidden','false');document.body.classList.add('victory-reward-open');emit('rewarding',{phaseId:snapshot.phaseId,serial,route:route.kind});rewardFeedback(snapshot);
 requestAnimationFrame(()=>host.querySelector('[data-victory-primary]')?.focus());return true;
}
function hide(){const host=ensureHost();host.classList.remove('show','leaving');host.setAttribute('aria-hidden','true');document.body.classList.remove('victory-reward-open')}
function setActionsDisabled(on){const host=ensureHost();host.querySelectorAll('button').forEach(btn=>btn.disabled=!!on)}
async function transitionOut(current){
 if(!current||reward!==current)return false;ensureHost().classList.add('leaving');await wait(reducedMotion()?35:150);return reward===current;
}
function restoreRevisit(snapshot){
 const target=snapshot?.revisitReturnId;if(!target)return;
 C.setActive?.(target);window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id:target,state:C.getState?.(),source:'victory-revisit-return'}}));
 if(revisit?.id===snapshot.phaseId)revisit=null;
}
function openMapSurface(){
 if(!map)return false;suppressedMap=false;
 map.classList.add('show','trail-revealed');map.setAttribute('aria-hidden','false');document.body.classList.add('campaign-map-open');
 const trail=$('campaignTrail');if(trail)trail.setAttribute('aria-hidden','false');
 const close=$('campaignClose');if(close){close.disabled=false;close.textContent='Voltar'}
 requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));return true;
}
function openMapNow(){return openMapSurface()}
async function handoffMap(current){
 if(!current||reward!==current)return;setActionsDisabled(true);emit('handing-off',{phaseId:current.snapshot.phaseId,route:current.route.kind});if(!await transitionOut(current))return;restoreRevisit(current.snapshot);
 const phaseId=current.snapshot.phaseId,serial=current.serial;reward=null;pending=null;hide();setActionsDisabled(false);emit('completed',{phaseId,serial,route:'map'});queueMicrotask(openMapNow);
}
async function launchNative(id){
 const node=map?.querySelector(`.phase-node[data-phase="${id}"]`);if(!node)return false;
 node.click();await wait(0);const preview=$('campaignPhasePreview'),launch=preview?.querySelector('[data-phase-preview-launch]');
 if(!preview?.classList.contains('show')||preview.dataset.phaseId!==id||!launch||launch.disabled)return false;
 launch.click();
 for(let i=0;i<24;i++){await wait(35);const st=C.getState?.()||{};if(st.activeId===id||document.documentElement.dataset.arduaEnginePhase===id)return true}
 return false;
}
async function launchNext(id){
 if(id==='quarks'&&window.ARDUA_QUARKS?.start){window.ARDUA_QUARKS.start();return true}
 if(window.ARDUA_QUASAR?.id===id&&window.ARDUA_QUASAR_GAME?.launch){C.setActive?.(id);window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:C.getState?.(),source:'victory-next'}}));window.ARDUA_QUASAR_GAME.launch();return true}
 return launchNative(id);
}
async function handoffNext(current){
 if(!current||reward!==current)return;const id=current.route.options[0];if(!id)return handoffMap(current);setActionsDisabled(true);emit('handing-off',{phaseId:current.snapshot.phaseId,route:'continue'});if(!await transitionOut(current))return;
 const ok=await launchNext(id);if(!ok){ensureHost().classList.remove('leaving');setActionsDisabled(false);return handoffMap(current)}
 const phaseId=current.snapshot.phaseId,serial=current.serial;reward=null;pending=null;suppressedMap=false;hide();setActionsDisabled(false);emit('completed',{phaseId,serial,route:'continue'});
}

function discoveryModal(){return $('discoveryUnlockModal')}
function suppressDiscoveryModal(){
 const host=discoveryModal();if(!host?.classList.contains('show')||!shouldHoldMap())return;
 const title=$('discoveryUnlockTitle')?.textContent?.trim();const target=reward?.snapshot||pending;if(title&&target&&!target.discoveries.includes(title))target.discoveries.push(title);if(reward)render();
 const button=$('discoveryUnlockContinue');if(button)queueMicrotask(()=>button.click());else{host.classList.remove('show');host.setAttribute('aria-hidden','true')}
}
function observeDiscoveryModal(){const host=discoveryModal();if(!host)return false;new MutationObserver(suppressDiscoveryModal).observe(host,{attributes:true,attributeFilter:['class']});return true}
if(!observeDiscoveryModal())setTimeout(observeDiscoveryModal,0);

window.addEventListener('ardua:phase-completion-intent',e=>{
 if(reward)return;const phaseId=e.detail?.phaseId||'';if(!phaseId)return;pending=capture(phaseId,e.detail);suppressedMap=false;suppressMap();suppressDiscoveryModal();emit('pending',{phaseId,route:''});
});
window.addEventListener('ardua:phase-completion-state',e=>{
 if(e.detail?.status!=='completed'||reward)return;const phaseId=e.detail?.phaseId||pending?.phaseId||'';if(!phaseId||!pending||pending.phaseId!==phaseId)return;
 if(window.__ARDUA_E2E&&!window.__ARDUA_P1_E2E){const snapshot=pending;pending=null;restoreRevisit(snapshot);queueMicrotask(openMapNow);return}
 queueMicrotask(()=>{if(pending?.phaseId===phaseId)show(pending)});
});

document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null,node=target?.closest('#campaignMap .phase-node[data-phase]');if(!node)return;
 const id=node.dataset.phase||'',st=C.getState?.()||{},done=new Set(st.completed||[]);if(id&&done.has(id)&&st.activeId&&st.activeId!==id)revisit={id,returnId:st.activeId};
},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&reward){e.preventDefault();void handoffMap(reward)}});

window.ARDUA_VICTORY_REWARD=Object.freeze({
 capture,present:snapshot=>show({...snapshot,discoveries:[...(snapshot?.discoveries||[])]}),nextOptions,openMap:()=>reward?handoffMap(reward):(openMapNow(),true),resultCopy,
 get active(){return !!reward},get pending(){return pending?{...pending,discoveries:[...pending.discoveries]}:null},get route(){return reward?{kind:reward.route.kind,options:[...reward.route.options]}:null}
});
ensureHost();
})();
