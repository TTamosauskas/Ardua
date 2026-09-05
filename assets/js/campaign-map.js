/* Ardua — interactive Crystarium-like campaign map. Loaded after the engine. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN,A=window.ARDUA_REQUIRED_ATLAS;
if(!G||!C||!A)return;
const $=id=>document.getElementById(id);
let phaseButtons=[],phaseMeta={},selectedId=null,bigBangPending=false,mapRequired=false,returnTimer=0,legacyMenuPass=false,linkFrame=0;
const branchSelection={};

function bootstrapPhaseLauncher(){
 const opener=$('menuOpenBtn'),modal=$('menuModal');if(!opener||!modal)return;
 opener.click();
 phaseButtons=[...document.querySelectorAll('#phaseMenu .phase-jump')];
 phaseButtons.forEach((b,i)=>{const id=G.runtimeOrder[i];if(!id)return;b.dataset.phaseId=id;phaseMeta[id]={branch:b.querySelector('small')?.textContent||'',title:b.querySelector('strong')?.textContent||id}});
 modal.classList.remove('show');
 if(phaseButtons.length!==G.runtimeOrder.length)console.warn(`Ardua map: ${phaseButtons.length}/${G.runtimeOrder.length} runtime phases mapped.`);
}
bootstrapPhaseLauncher();

function expanded(ids){return A.expand(ids)}
function tail(id){return A.tail(id)}
const uniq=xs=>[...new Set(xs.filter(Boolean))];
const xseq=ids=>expanded(ids);
const stellarHighMembers=uniq([
 ...xseq(G.sequences.high),...xseq(G.sequences.weakS),...xseq(G.sequences.collapse),
 ...xseq(['nu_f']),...xseq(['gamma_process','neutron_star','pulsar','accretion']),
 ...xseq(G.sequences.rp),...xseq(G.sequences.r),...xseq(G.sequences.decay)
]);
const remnantMembers=uniq([
 ...xseq(['neutron_star','pulsar','accretion']),...xseq(G.sequences.rp),...xseq(G.sequences.r),...xseq(G.sequences.decay)
]);
const BRANCH_MEMBERS={
 primordial:{tritium:xseq(G.sequences.primordialLeft),helium3:xseq(G.sequences.primordialRight)},
 stellar:{
  sub:xseq(G.sequences.brown),
  low:uniq([...xseq(G.sequences.red),'white']),
  mid:uniq([...xseq(G.sequences.mid),...xseq(G.sequences.sprocess),'white']),
  high:stellarHighMembers
 },
 supernova:{
  nu:xseq(['nu_f']),
  gamma:xseq(['gamma_process']),
  remnant:remnantMembers
 },
 neutron:{
  pulse:uniq([...xseq(['pulsar','accretion']),...xseq(G.sequences.rp)]),
  r:uniq([...xseq(G.sequences.r),...xseq(G.sequences.decay)])
 }
};
const PORTAL_MEMBERS={
 s:xseq(G.sequences.sprocess),
 'weak-s':xseq(G.sequences.weakS),
 rp:xseq(G.sequences.rp),
 r:xseq(G.sequences.r)
};

function phaseState(id){
 const st=C.getState(),done=new Set(st.completed),current=st.activeId===id,available=C.isUnlocked(id);
 if(current)return'current';if(done.has(id))return'completed';if(available)return'available';
 const rule=G.prerequisites[id],parents=[...(rule?.allOf||[]),...(rule?.anyOf||[]).flat()];
 return parents.some(p=>done.has(p))?'revealed':'locked';
}
function stateLabel(state){return{current:'Fase atual',completed:'Concluída',available:'Disponível',revealed:'Revelada',locked:'Bloqueada'}[state]||state}
function node(id,extra=''){return `<button type="button" class="phase-node ${phaseState(id)} ${extra}" data-phase="${id}"><strong>${phaseMeta[id]?.title||id}</strong></button>`}
function flow(ids,cls=''){return `<div class="cosmos-flow ${cls}">${expanded(ids).map(id=>node(id)).join('')}</div>`}
function structural(title,extra=''){return `<div class="epoch-label ${extra}"><strong>${title}</strong></div>`}
function ambientImage(key,cls=''){const im=G.images[key];return im?`<img class="phenomenon-bg ${cls}" loading="lazy" referrerpolicy="no-referrer" src="${im.url}" alt="" aria-hidden="true">`:''}
function portal(title,ids,open=false,key=''){return `<details class="portal" ${open?'open':''} ${key?`data-portal="${key}"`:''}><summary>${title}</summary><div class="portal-body">${flow(ids)}</div></details>`}

function branchVisualState(group,key){
 const members=BRANCH_MEMBERS[group]?.[key]||[],st=C.getState(),done=new Set(st.completed);
 if(members.includes(st.activeId))return'current';
 if(members.length&&members.every(id=>done.has(id)))return'completed';
 if(members.some(id=>C.isUnlocked(id)&&!done.has(id)))return'available';
 if(members.some(id=>done.has(id)||phaseState(id)==='revealed'))return'revealed';
 return'locked';
}
function sphereImage(key){
 const im=G.images[key];return im?` style="background-image:url('${im.url.replace(/'/g,'%27')}')"`:'';
}
function branchSphere(group,key,label,visual='',imageKey=''){
 return `<button type="button" class="branch-choice ${branchVisualState(group,key)} ${visual}" data-branch-group="${group}" data-branch-open="${key}" aria-pressed="false" aria-expanded="false"><span class="branch-sphere-art"${sphereImage(imageKey)}></span><strong>${label}</strong></button>`;
}
function branchCluster(group,choices,extra=''){
 return `<section class="branch-cluster ${extra}" data-branch-group="${group}">
  <span class="branch-fork-node" data-branch-fork="${group}" aria-hidden="true"></span>
  <div class="branch-spheres">${choices.map(c=>branchSphere(group,c.key,c.label,c.visual||'',c.image||'')).join('')}</div>
  <div class="branch-panels">${choices.map(c=>`<div class="branch-panel" data-branch-group="${group}" data-branch-panel="${c.key}" hidden>${c.content}</div>`).join('')}</div>
 </section>`;
}

function buildMap(){
 const editor=C.editor,host=document.createElement('div');host.id='campaignMap';host.className='campaign-map';host.setAttribute('aria-hidden','true');
 const primordial=branchCluster('primordial',[
  {key:'tritium',label:'Trítio',visual:'sphere-tritium',content:flow(G.sequences.primordialLeft)},
  {key:'helium3',label:'Hélio-3',visual:'sphere-helium',content:flow(G.sequences.primordialRight)}
 ],'primordial-branches');
 const neutron=branchCluster('neutron',[
  {key:'pulse',label:'Pulsar e acreção',visual:'sphere-accretion',image:'blackhole',content:`${flow(['pulsar','accretion'])}${structural('Explosão de raios X')}${portal('rp-process',G.sequences.rp,false,'rp')}${ambientImage('blackhole','branch-bg branch-bg-right')}`},
  {key:'r',label:'Kilonova',visual:'sphere-kilonova',image:'kilonova',content:`${structural('Sistema binário de estrelas de nêutrons','binary-junction')}${structural('Kilonova','kilonova-junction')}${portal('Processo-r',G.sequences.r,true,'r')}${ambientImage('kilonova','branch-bg branch-bg-left')}`}
 ],'neutron-branches');
 const supernova=branchCluster('supernova',[
  {key:'nu',label:'Neutrinos',visual:'sphere-neutrino',image:'supernova',content:flow(['nu_f'])},
  {key:'gamma',label:'Processo γ',visual:'sphere-gamma',image:'supernova',content:flow(['gamma_process'])},
  {key:'remnant',label:'Estrela de nêutrons',visual:'sphere-remnant',image:'supernova',content:`${flow(['neutron_star'])}${neutron}`}
 ],'supernova-branches');
 const stellar=branchCluster('stellar',[
  {key:'sub',label:'Anã marrom',visual:'sphere-brown',content:`${ambientImage('brown','branch-bg branch-bg-left')}${flow(G.sequences.brown)}`},
  {key:'low',label:'Baixa massa',visual:'sphere-red',content:`${flow(G.sequences.red)}${structural('Evolução de longa vida')}${flow(['white'])}`},
  {key:'mid',label:'Massa intermediária',visual:'sphere-gold',content:`${flow(G.sequences.mid)}${structural('Estrela AGB')}${portal('Processo-s',G.sequences.sprocess,false,'s')}${flow(['white'])}`},
  {key:'high',label:'Alta massa',visual:'sphere-high',content:`${ambientImage('supernova','branch-bg branch-bg-right')}${flow(G.sequences.high)}${portal('Processo-s fraco',G.sequences.weakS,false,'weak-s')}${flow(G.sequences.collapse)}${structural('Supernova')}${supernova}`}
 ],'stellar-branches');
 host.innerHTML=`<div class="campaign-shell" id="campaignShell">
 <header class="campaign-head"><div class="campaign-brand"><strong>ARDUA</strong><span>Mapa da campanha</span></div><div class="campaign-mode-chip">${editor?'Editor':'Campanha'}</div><div class="campaign-head-actions"><button type="button" class="campaign-close" id="campaignData">Elementos</button><button type="button" class="campaign-close" id="campaignClose">Voltar</button></div></header>
 <main class="campaign-content" id="campaignContent">
  <svg class="campaign-links" id="campaignLinks" aria-hidden="true"></svg>
  <section class="cosmos-root">
   <button type="button" class="singularity-map" data-phase="bigbang" aria-label="Big Bang"></button><div class="singularity-map-label"><strong>Big Bang</strong></div>
  </section>
  <div class="campaign-trail" id="campaignTrail">
   <section class="cosmos-root primordial-zone">
    ${flow(['primordial_d'])}
    ${structural('Universo primordial')}
    ${primordial}
    <div class="branch-after" data-after-group="primordial" hidden>
     <div class="convergence" data-junction="primordial-he4">Hélio-4</div>
     ${flow(G.sequences.atomic)}
     ${structural('Era Atômica')}
     <div class="stellar-birth" data-junction="stellar-birth"><i></i><strong>Nascimento das estrelas</strong></div>
     ${ambientImage('birth','birth-bg')}
     ${stellar}
     <div class="branch-after" data-after-group="stellar" hidden>
      <section class="cycle-grid">
       <article class="cycle-panel interstellar"><h2>Meio interestelar</h2>${structural('Raios cósmicos')}${flow(G.sequences.interstellar)}</article>
       <article class="cycle-panel radio"><h2>Radioatividade</h2>${flow(G.sequences.decay)}</article>
      </section>
      <div class="cycle-arrow">Ciclo cósmico</div>
     </div>
    </div>
   </section>
  </div>
 </main></div>
 <aside class="map-detail" id="mapDetail" aria-live="polite"></aside>`;
 document.body.appendChild(host);return host;
}
const map=buildMap(),detail=$('mapDetail'),closeBtn=$('campaignClose'),dataBtn=$('campaignData'),content=$('campaignContent'),trail=$('campaignTrail'),links=$('campaignLinks'),shell=$('campaignShell');

function isVisible(el){return !!el&&el.getClientRects().length>0}
function byPhase(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(isVisible)||null}
function branchClusterEl(group){return [...map.querySelectorAll(`.branch-cluster[data-branch-group="${group}"]`)].find(isVisible)||map.querySelector(`.branch-cluster[data-branch-group="${group}"]`)}
function branchSphereEl(group,key){const cluster=branchClusterEl(group);return cluster?.querySelector(`.branch-choice[data-branch-open="${key}"]`)||null}
function branchPanel(group,key){const cluster=branchClusterEl(group);return cluster?.querySelector(`.branch-panel[data-branch-panel="${key}"]`)||null}
function branchForkEl(group){const cluster=branchClusterEl(group);return cluster?.querySelector(`.branch-fork-node[data-branch-fork="${group}"]`)||null}
function activeBranch(group){return branchSelection[group]||null}
function syncBranchAfter(group){
 const selected=!!activeBranch(group);
 map.querySelectorAll(`.branch-after[data-after-group="${group}"]`).forEach(el=>{el.hidden=!selected});
}

function activateBranch(group,key,scroll=false){
 const cluster=branchClusterEl(group);if(!cluster)return;
 branchSelection[group]=key;
 cluster.querySelectorAll(':scope > .branch-spheres > .branch-choice').forEach(btn=>{
  const active=btn.dataset.branchOpen===key;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',active?'true':'false');btn.setAttribute('aria-expanded',active?'true':'false');
 });
 cluster.querySelectorAll(':scope > .branch-panels > .branch-panel').forEach(panel=>{panel.hidden=panel.dataset.branchPanel!==key});
 syncBranchAfter(group);scheduleLinks();
 if(scroll)setTimeout(()=>branchPanel(group,key)?.scrollIntoView({block:'nearest',behavior:'smooth'}),40);
}

function inferAncestorBranches(){
 const st=C.getState(),done=new Set(st.completed),active=st.activeId;
 if(!branchSelection.primordial){
  if(BRANCH_MEMBERS.primordial.tritium.includes(active))branchSelection.primordial='tritium';
  else if(BRANCH_MEMBERS.primordial.helium3.includes(active))branchSelection.primordial='helium3';
  else if(done.has(tail('primordial_he3d')))branchSelection.primordial='helium3';
  else if(done.has(tail('primordial_td')))branchSelection.primordial='tritium';
 }
 if(!branchSelection.stellar){
  if(active==='white')branchSelection.stellar=done.has('bi')?'mid':'low';
  else if(stellarHighMembers.includes(active)||done.has('final_collapse'))branchSelection.stellar='high';
  else if(BRANCH_MEMBERS.stellar.mid.includes(active)||done.has('bi'))branchSelection.stellar='mid';
  else if(BRANCH_MEMBERS.stellar.low.includes(active)||done.has('he_red'))branchSelection.stellar='low';
  else if(BRANCH_MEMBERS.stellar.sub.includes(active)||done.has('brown'))branchSelection.stellar='sub';
 }
}
function syncBranchesToActive(){
 const active=C.getState().activeId,done=new Set(C.getState().completed);
 if(active==='white')branchSelection.stellar=done.has('bi')?'mid':'low';
 for(const [group,branches] of Object.entries(BRANCH_MEMBERS)){
  const found=Object.entries(branches).find(([,members])=>members.includes(active));
  if(found)branchSelection[group]=found[0];
 }
 inferAncestorBranches();
 for(const [group,key] of Object.entries(branchSelection))activateBranch(group,key,false);
 for(const group of ['primordial','stellar','supernova','neutron'])syncBranchAfter(group);
}
function refreshBranchStates(){
 map.querySelectorAll('.branch-choice').forEach(btn=>{
  const group=btn.dataset.branchGroup,key=btn.dataset.branchOpen,state=branchVisualState(group,key);
  btn.classList.remove('locked','revealed','available','completed','current');btn.classList.add(state);
 });
}
function syncPortals(){
 const active=C.getState().activeId;
 for(const [key,members] of Object.entries(PORTAL_MEMBERS)){
  const d=[...map.querySelectorAll(`[data-portal="${key}"]`)].find(isVisible);if(d&&members.includes(active))d.open=true;
 }
}
function refresh(){
 map.querySelectorAll('[data-phase]').forEach(el=>{const id=el.dataset.phase;if(el.classList.contains('singularity-map'))return;el.classList.remove('locked','revealed','available','completed','current');el.classList.add(phaseState(id))});
 map.querySelector('.singularity-map')?.setAttribute('data-state',phaseState('bigbang'));
 refreshBranchStates();syncBranchesToActive();syncPortals();
 if(selectedId)showDetail(selectedId);scheduleLinks();
}
function setTrailVisible(visible,animate=false){
 map.classList.toggle('trail-revealed',visible);trail.setAttribute('aria-hidden',visible?'false':'true');
 if(visible&&animate){trail.classList.remove('trail-arrive');requestAnimationFrame(()=>trail.classList.add('trail-arrive'))}
 scheduleLinks();
}
function visibleCurrent(){return [...map.querySelectorAll('.phase-node.current')].find(isVisible)||null}
function showMap(opts={}){
 mapRequired=!!opts.required;refresh();map.classList.add('show');map.setAttribute('aria-hidden','false');document.body.classList.add('campaign-map-open');closeBtn.disabled=mapRequired;closeBtn.textContent=mapRequired?'Escolha uma fase':'Voltar';
 const introduced=C.getState().introduced||C.editor;setTrailVisible(introduced,!!opts.reveal);
 setTimeout(()=>{const focus=opts.rootOnly?map.querySelector('.singularity-map'):visibleCurrent();focus?.scrollIntoView({block:'center',behavior:opts.instant?'auto':'smooth'});scheduleLinks()},90);
}
function hideMap(force=false){if(mapRequired&&!force)return;map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');detail.classList.remove('show')}
function prereqText(id){const r=G.prerequisites[id];if(!r)return'';const labels=x=>(phaseMeta[x]?.title||x);if(r.allOf?.length)return`Complete ${r.allOf.map(labels).join(' + ')}`;if(r.anyOf?.length)return`${r.anyOf.map(g=>g.map(labels).join(' + ')).join(' ou ')}`;return''}
function showDetail(id){
 selectedId=id;const st=phaseState(id),available=C.isUnlocked(id),meta=phaseMeta[id],done=new Set(C.getState().completed).has(id),lockedHint=available?'':prereqText(id);
 detail.innerHTML=`<div class="detail-kicker">${stateLabel(st)}</div><h3>${meta?.title||id}</h3>${lockedHint?`<p>${lockedHint}</p>`:''}<div class="detail-actions"><button type="button" data-detail-close>Fechar</button><button type="button" class="primary" data-launch="${id}" ${available?'':'disabled'}>${done?'Revisitar':'Explorar'}</button></div>`;detail.classList.add('show');
}
function launch(id){if(!C.isUnlocked(id))return;const idx=C.runtimeIndex(id),btn=phaseButtons[idx];if(!btn)return;C.setActive(id);mapRequired=false;hideMap(true);btn.click();refresh()}

function centerOf(el,edge='center'){
 if(!isVisible(el)||!content)return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();
 const x=r.left-c.left+r.width/2;let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x,y};
}
function addPath(from,to,cls='main',bend=.5){
 if(!from||!to)return;const a=centerOf(from,'bottom'),b=centerOf(to,'top');if(!a||!b)return;const dy=b.y-a.y,mid=a.y+dy*bend;
 const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);p.setAttribute('class',`campaign-link ${cls}`);links.appendChild(p);
}
function connectIds(ids,cls='main'){for(let i=1;i<ids.length;i++)addPath(byPhase(ids[i-1]),byPhase(ids[i]),cls)}
function connectTrail(ids,cls='main'){connectIds(expanded(ids),cls)}
function portalSummary(key){const el=[...map.querySelectorAll(`[data-portal="${key}"] > summary`)].find(isVisible);return el||null}
function portalFirst(key){return [...map.querySelectorAll(`[data-portal="${key}"] .phase-node`)].find(isVisible)||null}
function portalLast(key){const xs=[...map.querySelectorAll(`[data-portal="${key}"] .phase-node`)].filter(isVisible);return xs[xs.length-1]||null}
function connectBranchJunction(from,group,classes={}){
 const cluster=branchClusterEl(group),fork=branchForkEl(group);if(!isVisible(cluster)||!isVisible(fork))return;
 addPath(from,fork,`branch-fork ${group}`,.46);
 cluster.querySelectorAll(':scope > .branch-spheres > .branch-choice').forEach(btn=>addPath(fork,btn,`branch ${classes[btn.dataset.branchOpen]||group}`,.38));
}
function connectActiveSphere(group,firstId,cls){
 const key=activeBranch(group),sphere=key?branchSphereEl(group,key):null,target=firstId?byPhase(firstId):null;
 if(sphere&&target)addPath(sphere,target,cls,.34);
}

function drawMid(){
 connectTrail(G.sequences.mid,'mid');
 const sPortal=portalSummary('s');addPath(byPhase(tail('o')),sPortal,'mid');
 if(map.querySelector('[data-portal="s"]')?.open){addPath(sPortal,portalFirst('s'),'mid');connectTrail(G.sequences.sprocess,'mid');addPath(portalLast('s'),byPhase('white'),'mid')}else addPath(sPortal,byPhase('white'),'mid');
}
function drawHigh(){
 connectTrail(G.sequences.high,'high');
 const weakPortal=portalSummary('weak-s');addPath(byPhase(tail('co')),weakPortal,'high');
 if(map.querySelector('[data-portal="weak-s"]')?.open){addPath(weakPortal,portalFirst('weak-s'),'high');connectTrail(G.sequences.weakS,'high');addPath(portalLast('weak-s'),byPhase('neutronize'),'high')}else addPath(weakPortal,byPhase('neutronize'),'high');
 connectTrail(G.sequences.collapse,'high');
 const collapse=byPhase(tail('final_collapse'));connectBranchJunction(collapse,'supernova',{nu:'high',gamma:'high',remnant:'compact'});
 const s=activeBranch('supernova');
 if(s==='nu'){connectActiveSphere('supernova','nu_f','high');connectIds(expanded(['nu_f']),'high')}
 if(s==='gamma')connectActiveSphere('supernova','gamma_process','high');
 if(s==='remnant'){
  connectActiveSphere('supernova','neutron_star','compact');
  const neutron=byPhase(tail('neutron_star'));connectBranchJunction(neutron,'neutron',{pulse:'compact',r:'r'});
  const n=activeBranch('neutron');
  if(n==='pulse'){
   connectActiveSphere('neutron','pulsar','compact');connectTrail(['pulsar','accretion'],'compact');
   const rpPortal=portalSummary('rp');addPath(byPhase(tail('accretion')),rpPortal,'compact');
   if(map.querySelector('[data-portal="rp"]')?.open){addPath(rpPortal,portalFirst('rp'),'compact');connectTrail(G.sequences.rp,'compact')}
  }
  if(n==='r'){
   const sphere=branchSphereEl('neutron','r'),binary=[...map.querySelectorAll('.binary-junction')].find(isVisible),kilo=[...map.querySelectorAll('.kilonova-junction')].find(isVisible),rPortal=portalSummary('r');
   addPath(sphere,binary,'r',.35);addPath(binary,kilo,'r');addPath(kilo,rPortal,'r');
   if(map.querySelector('[data-portal="r"]')?.open){addPath(rPortal,portalFirst('r'),'r');connectTrail(G.sequences.r,'r');addPath(portalLast('r'),byPhase('decay_pa'),'radio',.55)}else addPath(rPortal,byPhase('decay_pa'),'radio',.55);
  }
 }
}

function drawLinks(){
 cancelAnimationFrame(linkFrame);linkFrame=0;if(!map.classList.contains('show')||!map.classList.contains('trail-revealed')){links.innerHTML='';return}
 const w=content.clientWidth,h=content.scrollHeight;links.setAttribute('viewBox',`0 0 ${w} ${h}`);links.setAttribute('width',w);links.setAttribute('height',h);links.innerHTML='';
 addPath(map.querySelector('.singularity-map'),byPhase('primordial_d'),'root');
 const pd=byPhase('primordial_d');connectBranchJunction(pd,'primordial',{tritium:'primordial',helium3:'primordial'});
 const p=activeBranch('primordial');
 if(p==='tritium'){connectActiveSphere('primordial','primordial_t','primordial');connectTrail(G.sequences.primordialLeft,'primordial');addPath(byPhase(tail('primordial_td')),byPhase('primordial_li'),'primordial')}
 if(p==='helium3'){connectActiveSphere('primordial','primordial_he3','primordial');connectTrail(G.sequences.primordialRight,'primordial');addPath(byPhase(tail('primordial_he3d')),byPhase('primordial_li'),'primordial')}
 connectTrail(G.sequences.atomic,'primordial');

 const birth=[...map.querySelectorAll('[data-junction="stellar-birth"]')].find(isVisible);addPath(byPhase(tail('atomic_li')),birth,'birth');
 connectBranchJunction(birth,'stellar',{sub:'sub',low:'low',mid:'mid',high:'high'});
 const s=activeBranch('stellar');
 if(s==='sub'){connectActiveSphere('stellar','brown','sub');connectTrail(G.sequences.brown,'sub')}
 if(s==='low'){connectActiveSphere('stellar','he_red','low');connectTrail(G.sequences.red,'low');addPath(byPhase(tail('he_red')),byPhase('white'),'converge',.5)}
 if(s==='mid'){connectActiveSphere('stellar','he_orange','mid');drawMid()}
 if(s==='high'){connectActiveSphere('stellar','carbon_burn','high');drawHigh()}

 connectTrail(G.sequences.interstellar,'interstellar');connectTrail(G.sequences.decay,'radio');
 const interstellarTarget=byPhase('spallation_be');
 for(const sourceId of ['o','final_collapse','white','u']){const source=byPhase(tail(sourceId));if(source){addPath(source,interstellarTarget,'interstellar',.68);break}}
}
function scheduleLinks(){if(linkFrame)cancelAnimationFrame(linkFrame);linkFrame=requestAnimationFrame(()=>requestAnimationFrame(drawLinks))}

map.addEventListener('click',e=>{
 const root=e.target.closest('.singularity-map');if(root){e.preventDefault();
  if(C.getState().introduced||C.editor){setTrailVisible(true,true);scheduleLinks();return}
  bigBangPending=true;C.setActive('bigbang');hideMap(true);$('singularityBtn')?.click();return;
 }
 const sphere=e.target.closest('.branch-choice[data-branch-open]');if(sphere){e.preventDefault();activateBranch(sphere.dataset.branchGroup,sphere.dataset.branchOpen,true);return}
 const phase=e.target.closest('.phase-node[data-phase]');if(phase){e.preventDefault();showDetail(phase.dataset.phase);return}
 const launchBtn=e.target.closest('[data-launch]');if(launchBtn){launch(launchBtn.dataset.launch);return}
 if(e.target.closest('[data-detail-close]')){detail.classList.remove('show');selectedId=null;return}
});
closeBtn.addEventListener('click',()=>hideMap());
dataBtn?.addEventListener('click',()=>{legacyMenuPass=true;$('menuOpenBtn')?.click();legacyMenuPass=false;$('menuModal')?.classList.add('show')});
map.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mapRequired)hideMap()});
map.querySelectorAll('.portal').forEach(d=>d.addEventListener('toggle',scheduleLinks));
window.addEventListener('resize',scheduleLinks);
shell?.addEventListener('scroll',()=>{detail.classList.remove('show')},{passive:true});

const menuOpen=$('menuOpenBtn');if(menuOpen){menuOpen.textContent='Mapa';menuOpen.addEventListener('click',e=>{if(legacyMenuPass)return;e.preventDefault();e.stopImmediatePropagation();showMap({required:false,focusCurrent:true})},true)}

const phaseEnd=$('phaseEndBtn');if(phaseEnd)phaseEnd.addEventListener('click',()=>{const id=C.getState().activeId;if(id&&id!=='bigbang')C.markCompleted(id);clearTimeout(returnTimer);returnTimer=setTimeout(()=>showMap({required:true,focusCurrent:true}),1500)},true);

const phaseTitle=$('phaseTitle');if(phaseTitle)new MutationObserver(()=>{
 if(!bigBangPending)return;if((phaseTitle.textContent||'').trim()==='Big Bang')return;bigBangPending=false;C.markCompleted('bigbang');C.setIntroduced(true);C.setActive('primordial_d');setTimeout(()=>showMap({required:true,reveal:true}),120);
}).observe(phaseTitle,{childList:true,subtree:true,characterData:true});

window.addEventListener('ardua:campaign-progress',refresh);
const initial=C.getState();
if(C.editor||initial.introduced)setTimeout(()=>showMap({required:true,focusCurrent:true}),0);
else setTimeout(()=>showMap({required:true,rootOnly:true,instant:true}),0);
})();
