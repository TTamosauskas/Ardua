/* Ardua — interactive Crystarium-like campaign map. Loaded after the engine. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN;
if(!G||!C)return;
const $=id=>document.getElementById(id);
let phaseButtons=[],phaseMeta={},selectedId=null,bigBangPending=false,mapRequired=false,returnTimer=0,legacyMenuPass=false,linkFrame=0;

function bootstrapPhaseLauncher(){
 const opener=$('menuOpenBtn'),modal=$('menuModal');if(!opener||!modal)return;
 opener.click();
 phaseButtons=[...document.querySelectorAll('#phaseMenu .phase-jump')];
 phaseButtons.forEach((b,i)=>{const id=G.runtimeOrder[i];if(!id)return;b.dataset.phaseId=id;phaseMeta[id]={branch:b.querySelector('small')?.textContent||'',title:b.querySelector('strong')?.textContent||id}});
 modal.classList.remove('show');
 if(phaseButtons.length!==G.runtimeOrder.length)console.warn(`Ardua map: ${phaseButtons.length}/${G.runtimeOrder.length} runtime phases mapped.`);
}
bootstrapPhaseLauncher();

const ATLAS_BY_ANCHOR=G.atlas.reduce((acc,item)=>{(acc[item.anchor]||(acc[item.anchor]=[])).push(item.id);return acc},{});

function phaseState(id){
 const st=C.getState(),done=new Set(st.completed),current=st.activeId===id,available=C.isUnlocked(id);if(current)return'current';if(done.has(id))return'completed';if(available)return'available';
 const atlas=G.atlasById[id],rule=G.prerequisites[id],parents=atlas?[atlas.anchor]:[...(rule?.allOf||[]),...(rule?.anyOf||[]).flat()];return parents.some(p=>done.has(p))?'revealed':'locked';
}
function stateLabel(state){return{current:'Fase atual',completed:'Concluída',available:'Disponível',revealed:'Revelada',locked:'Bloqueada'}[state]||state}
function node(id,extra=''){
 const state=phaseState(id),optional=!!G.atlasById[id];
 return `<button type="button" class="phase-node ${state}${optional?' optional':''} ${extra}" data-phase="${id}"><strong>${phaseMeta[id]?.title||id}</strong></button>`;
}
function atlasBranch(anchor){
 const ids=ATLAS_BY_ANCHOR[anchor];if(!ids?.length)return'';
 return `<details class="atlas-branch" data-atlas-anchor="${anchor}"><summary aria-label="Reações opcionais desta fase"><i></i><span>Atlas</span><b>${ids.length}</b></summary><div class="atlas-branch-body">${ids.map(id=>node(id)).join('')}</div></details>`;
}
function flow(ids,cls=''){return `<div class="cosmos-flow ${cls}">${ids.map(id=>node(id)+atlasBranch(id)).join('')}</div>`}
function structural(title,extra=''){return `<div class="epoch-label ${extra}"><strong>${title}</strong></div>`}
function ambientImage(key,cls=''){const im=G.images[key];return im?`<img class="phenomenon-bg ${cls}" loading="lazy" referrerpolicy="no-referrer" src="${im.url}" alt="" aria-hidden="true">`:''}
function portal(title,ids,open=false,key=''){return `<details class="portal" ${open?'open':''} ${key?`data-portal="${key}"`:''}><summary>${title}</summary><div class="portal-body">${flow(ids)}</div></details>`}

function buildMap(){
 const editor=C.editor;
 const host=document.createElement('div');host.id='campaignMap';host.className='campaign-map';host.setAttribute('aria-hidden','true');
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
    <div class="primordial-fork">${flow(G.sequences.primordialLeft)}${flow(G.sequences.primordialRight)}</div>
    <div class="convergence" data-junction="primordial-he4">Hélio-4</div>
    ${flow(G.sequences.atomic)}
    ${structural('Era Atômica')}
    <div class="stellar-birth" data-junction="stellar-birth"><i></i><strong>Nascimento das estrelas</strong></div>
    ${ambientImage('birth','birth-bg')}
   </section>

   <section class="stellar-grid" data-branch-zone="stellar">
    <article class="stellar-lane sub">${ambientImage('brown','lane-bg lane-bg-left')}<h2>Massa muito baixa</h2>${flow(G.sequences.brown)}</article>
    <article class="stellar-lane low"><h2>Baixa massa</h2>${flow(G.sequences.red)}${structural('Evolução de longa vida')}</article>
    <article class="stellar-lane mid"><h2>Massa intermediária</h2>${flow(G.sequences.mid)}${structural('Estrela AGB')}${portal('Processo-s',G.sequences.sprocess,false,'s')}${flow(['white'])}</article>
    <article class="stellar-lane high">${ambientImage('supernova','lane-bg lane-bg-right')}<h2>Alta massa</h2>${flow(G.sequences.high)}${portal('Processo-s fraco',G.sequences.weakS,false,'weak-s')}${flow(G.sequences.collapse)}${structural('Supernova')}${flow(G.sequences.supernovaSide)}</article>
   </section>

   <section class="compact-section">
    <article class="compact-panel blue">${ambientImage('supernova','compact-bg compact-bg-left')}<h2>Remanescentes compactos</h2>${flow(G.sequences.remnant)}${structural('Explosão de raios X')}${portal('rp-process',G.sequences.rp,false,'rp')}${ambientImage('blackhole','compact-bg compact-bg-bottom')}</article>
    <article class="compact-panel violet">${ambientImage('kilonova','compact-bg compact-bg-right')}<h2>Kilonova · Processo-r</h2>${structural('Sistema binário de estrelas de nêutrons','binary-junction')}${structural('Kilonova','kilonova-junction')}${portal('Processo-r',G.sequences.r,true,'r')}</article>
   </section>

   <section class="cycle-grid">
    <article class="cycle-panel interstellar"><h2>Meio interestelar</h2>${structural('Raios cósmicos')}${flow(G.sequences.interstellar)}</article>
    <article class="cycle-panel radio"><h2>Radioatividade</h2>${flow(G.sequences.decay)}</article>
   </section>
   <div class="cycle-arrow">Ciclo cósmico</div>
  </div>
 </main></div>
 <aside class="map-detail" id="mapDetail" aria-live="polite"></aside>`;
 document.body.appendChild(host);return host;
}
const map=buildMap(),detail=$('mapDetail'),closeBtn=$('campaignClose'),dataBtn=$('campaignData'),content=$('campaignContent'),trail=$('campaignTrail'),links=$('campaignLinks'),shell=$('campaignShell');

function refresh(){
 const st=C.getState(),done=new Set(st.completed);
 map.querySelectorAll('[data-phase]').forEach(el=>{const id=el.dataset.phase;if(el.classList.contains('singularity-map'))return;el.classList.remove('locked','revealed','available','completed','current');el.classList.add(phaseState(id))});
 map.querySelector('.singularity-map')?.setAttribute('data-state',phaseState('bigbang'));
 map.querySelectorAll('.atlas-branch').forEach(branch=>{
   const ready=C.editor||done.has(branch.dataset.atlasAnchor);branch.classList.toggle('atlas-ready',ready);
   if(!ready)branch.open=false;
 });
 const activeAtlas=G.atlasById[st.activeId];
 if(activeAtlas){const branch=map.querySelector(`.atlas-branch[data-atlas-anchor="${activeAtlas.anchor}"]`);if(branch?.classList.contains('atlas-ready'))branch.open=true}
 if(selectedId)showDetail(selectedId);
 scheduleLinks();
}
function setTrailVisible(visible,animate=false){
 map.classList.toggle('trail-revealed',visible);trail.setAttribute('aria-hidden',visible?'false':'true');
 if(visible&&animate){trail.classList.remove('trail-arrive');requestAnimationFrame(()=>trail.classList.add('trail-arrive'))}
 scheduleLinks();
}
function showMap(opts={}){
 mapRequired=!!opts.required;refresh();map.classList.add('show');map.setAttribute('aria-hidden','false');document.body.classList.add('campaign-map-open');closeBtn.disabled=mapRequired;closeBtn.textContent=mapRequired?'Escolha uma fase':'Voltar';
 const introduced=C.getState().introduced||C.editor;setTrailVisible(introduced,!!opts.reveal);
 setTimeout(()=>{const focus=opts.rootOnly?map.querySelector('.singularity-map'):map.querySelector('.phase-node.current');focus?.scrollIntoView({block:'center',inline:'center',behavior:opts.instant?'auto':'smooth'});scheduleLinks()},90)
}
function hideMap(force=false){if(mapRequired&&!force)return;map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');detail.classList.remove('show')}
function prereqText(id){const r=G.prerequisites[id];if(!r)return'';const labels=x=>(phaseMeta[x]?.title||x);if(r.allOf?.length)return`Complete ${r.allOf.map(labels).join(' + ')}`;if(r.anyOf?.length)return`${r.anyOf.map(g=>g.map(labels).join(' + ')).join(' ou ')}`;return''}
function showDetail(id){
 selectedId=id;const st=phaseState(id),available=C.isUnlocked(id),meta=phaseMeta[id],done=new Set(C.getState().completed).has(id),lockedHint=available?'':prereqText(id);
 detail.innerHTML=`<div class="detail-kicker">${stateLabel(st)}</div><h3>${meta?.title||id}</h3>${lockedHint?`<p>${lockedHint}</p>`:''}<div class="detail-actions"><button type="button" data-detail-close>Fechar</button><button type="button" class="primary" data-launch="${id}" ${available?'':'disabled'}>${done?'Revisitar':'Explorar'}</button></div>`;detail.classList.add('show')
}
function launch(id){if(!C.isUnlocked(id))return;const idx=C.runtimeIndex(id),btn=phaseButtons[idx];if(!btn)return;C.setActive(id);mapRequired=false;hideMap(true);btn.click();refresh()}

function centerOf(el,edge='center'){
 if(!el||!content)return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();
 const x=r.left-c.left+r.width/2;let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x,y}
}
function addPath(from,to,cls='main',bend=.5){
 if(!from||!to)return;const a=centerOf(from,'bottom'),b=centerOf(to,'top');if(!a||!b)return;const dy=b.y-a.y,mid=a.y+dy*bend;
 const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);p.setAttribute('class',`campaign-link ${cls}`);links.appendChild(p)
}
function addAtlasPath(from,to){
 if(!from||!to)return;const a=centerOf(from,'center'),b=centerOf(to,'center');if(!a||!b)return;
 const direction=b.x>=a.x?1:-1,span=Math.max(26,Math.abs(b.x-a.x)*.46),p=document.createElementNS('http://www.w3.org/2000/svg','path');
 p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x+span*direction).toFixed(1)} ${a.y.toFixed(1)}, ${(b.x-span*.35*direction).toFixed(1)} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
 p.setAttribute('class','campaign-link atlas');links.appendChild(p)
}
function byPhase(id){return map.querySelector(`.phase-node[data-phase="${id}"]`)}
function connectSequence(ids,cls='main'){for(let i=1;i<ids.length;i++)addPath(byPhase(ids[i-1]),byPhase(ids[i]),cls)}
function portalSummary(key){return map.querySelector(`[data-portal="${key}"] > summary`)}
function portalFirst(key){return map.querySelector(`[data-portal="${key}"] .phase-node`)}
function portalLast(key){const xs=[...map.querySelectorAll(`[data-portal="${key}"] .phase-node`)];return xs[xs.length-1]||null}
function drawAtlasLinks(){
 map.querySelectorAll('.atlas-branch[open].atlas-ready').forEach(branch=>{
  const anchor=byPhase(branch.dataset.atlasAnchor);branch.querySelectorAll('.atlas-branch-body > .phase-node').forEach(n=>addAtlasPath(anchor,n))
 })
}
function drawLinks(){
 cancelAnimationFrame(linkFrame);linkFrame=0;if(!map.classList.contains('show')||!map.classList.contains('trail-revealed')){links.innerHTML='';return}
 const w=content.scrollWidth,h=content.scrollHeight;links.setAttribute('viewBox',`0 0 ${w} ${h}`);links.setAttribute('width',w);links.setAttribute('height',h);links.innerHTML='';
 addPath(map.querySelector('.singularity-map'),byPhase('primordial_d'),'root');
 addPath(byPhase('primordial_d'),byPhase('primordial_t'),'primordial');addPath(byPhase('primordial_d'),byPhase('primordial_he3'),'primordial');
 connectSequence(G.sequences.primordialLeft,'primordial');connectSequence(G.sequences.primordialRight,'primordial');
 addPath(byPhase('primordial_td'),byPhase('primordial_li'),'primordial');addPath(byPhase('primordial_he3d'),byPhase('primordial_li'),'primordial');
 connectSequence(G.sequences.atomic,'primordial');
 const birth=map.querySelector('[data-junction="stellar-birth"]');addPath(byPhase('atomic_li'),birth,'birth');
 [['brown','sub'],['he_red','low'],['he_orange','mid'],['carbon_burn','high']].forEach(([id,cls])=>addPath(birth,byPhase(id),`branch ${cls}`,.38));
 connectSequence(G.sequences.brown,'sub');connectSequence(G.sequences.red,'low');connectSequence(G.sequences.mid,'mid');connectSequence(G.sequences.high,'high');
 const sPortal=portalSummary('s');addPath(byPhase('o'),sPortal,'mid');if(map.querySelector('[data-portal="s"]')?.open){addPath(sPortal,portalFirst('s'),'mid');connectSequence(G.sequences.sprocess,'mid');addPath(portalLast('s'),byPhase('white'),'mid')}else addPath(sPortal,byPhase('white'),'mid');
 addPath(byPhase('he_red'),byPhase('white'),'converge',.64);
 const weakPortal=portalSummary('weak-s');addPath(byPhase('co'),weakPortal,'high');if(map.querySelector('[data-portal="weak-s"]')?.open){addPath(weakPortal,portalFirst('weak-s'),'high');connectSequence(G.sequences.weakS,'high');addPath(portalLast('weak-s'),byPhase('neutronize'),'high')}else addPath(weakPortal,byPhase('neutronize'),'high');connectSequence(G.sequences.collapse,'high');
 addPath(byPhase('final_collapse'),byPhase('nu_f'),'high',.42);addPath(byPhase('final_collapse'),byPhase('gamma_process'),'high',.42);
 addPath(byPhase('final_collapse'),byPhase('neutron_star'),'compact',.38);connectSequence(G.sequences.remnant,'compact');
 const rpPortal=portalSummary('rp');addPath(byPhase('accretion'),rpPortal,'compact');if(map.querySelector('[data-portal="rp"]')?.open){addPath(rpPortal,portalFirst('rp'),'compact');connectSequence(G.sequences.rp,'compact')}
 const binary=map.querySelector('.binary-junction'),kilo=map.querySelector('.kilonova-junction'),rPortal=portalSummary('r');addPath(byPhase('neutron_star'),binary,'r',.42);addPath(binary,kilo,'r');addPath(kilo,rPortal,'r');
 if(map.querySelector('[data-portal="r"]')?.open){addPath(rPortal,portalFirst('r'),'r');connectSequence(G.sequences.r,'r');addPath(portalLast('r'),byPhase('decay_pa'),'radio',.55)}else addPath(rPortal,byPhase('decay_pa'),'radio',.55);
 connectSequence(G.sequences.interstellar,'interstellar');connectSequence(G.sequences.decay,'radio');addPath(byPhase('o'),byPhase('spallation_be'),'interstellar',.68);
 drawAtlasLinks()
}
function scheduleLinks(){if(linkFrame)cancelAnimationFrame(linkFrame);linkFrame=requestAnimationFrame(()=>requestAnimationFrame(drawLinks))}

map.addEventListener('click',e=>{
 const root=e.target.closest('.singularity-map');if(root){e.preventDefault();
  if(C.getState().introduced||C.editor){setTrailVisible(true,true);scheduleLinks();return}
  bigBangPending=true;C.setActive('bigbang');hideMap(true);$('singularityBtn')?.click();return
 }
 const atlasSummary=e.target.closest('.atlas-branch > summary');if(atlasSummary){
  const branch=atlasSummary.parentElement;if(!branch.classList.contains('atlas-ready')){e.preventDefault();return}
 }
 const phase=e.target.closest('.phase-node[data-phase]');if(phase){e.preventDefault();showDetail(phase.dataset.phase);return}
 const launchBtn=e.target.closest('[data-launch]');if(launchBtn){launch(launchBtn.dataset.launch);return}
 if(e.target.closest('[data-detail-close]')){detail.classList.remove('show');selectedId=null;return}
});
closeBtn.addEventListener('click',()=>hideMap());
dataBtn?.addEventListener('click',()=>{legacyMenuPass=true;$('menuOpenBtn')?.click();legacyMenuPass=false;$('menuModal')?.classList.add('show')});
map.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mapRequired)hideMap()});
map.querySelectorAll('.atlas-branch').forEach(branch=>branch.addEventListener('toggle',()=>{
 if(branch.open){map.querySelectorAll('.atlas-branch[open]').forEach(other=>{if(other!==branch)other.open=false})}
 scheduleLinks()
}));
map.querySelectorAll('.portal').forEach(d=>d.addEventListener('toggle',scheduleLinks));
window.addEventListener('resize',scheduleLinks);
shell?.addEventListener('scroll',()=>{detail.classList.remove('show')},{passive:true});

const menuOpen=$('menuOpenBtn');if(menuOpen){menuOpen.textContent='Mapa';menuOpen.addEventListener('click',e=>{if(legacyMenuPass)return;e.preventDefault();e.stopImmediatePropagation();showMap({required:false,focusCurrent:true})},true)}

const phaseEnd=$('phaseEndBtn');if(phaseEnd)phaseEnd.addEventListener('click',()=>{const id=C.getState().activeId;if(id&&id!=='bigbang')C.markCompleted(id);clearTimeout(returnTimer);returnTimer=setTimeout(()=>showMap({required:true,focusCurrent:true}),1500)},true);

const phaseTitle=$('phaseTitle');if(phaseTitle)new MutationObserver(()=>{
 if(!bigBangPending)return;if((phaseTitle.textContent||'').trim()==='Big Bang')return;bigBangPending=false;C.markCompleted('bigbang');C.setIntroduced(true);C.setActive('primordial_d');setTimeout(()=>showMap({required:true,reveal:true}),120)
}).observe(phaseTitle,{childList:true,subtree:true,characterData:true});

window.addEventListener('ardua:campaign-progress',refresh);
const initial=C.getState();
if(C.editor||initial.introduced)setTimeout(()=>showMap({required:true,focusCurrent:true}),0);
else setTimeout(()=>showMap({required:true,rootOnly:true,instant:true}),0);
})();
