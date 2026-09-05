/* Ardua — interactive Crystarium-like campaign map. Loaded after the engine. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN;
if(!G||!C)return;
const $=id=>document.getElementById(id);
let phaseButtons=[],phaseMeta={},selectedId=null,bigBangPending=false,mapRequired=false,returnTimer=0;

function bootstrapPhaseLauncher(){
 const opener=$('menuOpenBtn'),modal=$('menuModal');if(!opener||!modal)return;
 opener.click();
 phaseButtons=[...document.querySelectorAll('#phaseMenu .phase-jump')];
 phaseButtons.forEach((b,i)=>{const id=G.runtimeOrder[i];if(!id)return;b.dataset.phaseId=id;phaseMeta[id]={branch:b.querySelector('small')?.textContent||'',title:b.querySelector('strong')?.textContent||id}});
 modal.classList.remove('show');
 if(phaseButtons.length!==G.runtimeOrder.length)console.warn(`Ardua map: ${phaseButtons.length}/${G.runtimeOrder.length} runtime phases mapped.`);
}
bootstrapPhaseLauncher();

function phaseState(id){
 const st=C.getState(),done=new Set(st.completed),current=st.activeId===id,available=C.isUnlocked(id);if(current)return'current';if(done.has(id))return'completed';if(available)return'available';
 const atlas=G.atlasById[id],rule=G.prerequisites[id],parents=atlas?[atlas.anchor]:[...(rule?.allOf||[]),...(rule?.anyOf||[]).flat()];return parents.some(p=>done.has(p))?'revealed':'locked';
}
function stateLabel(state){return{current:'Fase atual',completed:'Concluída',available:'Disponível',revealed:'Caminho revelado',locked:'Caminho distante'}[state]||state}
function node(id,extra=''){
 const state=phaseState(id),meta=phaseMeta[id]?.branch||'',optional=!!G.atlasById[id];
 return `<button type="button" class="phase-node ${state}${optional?' optional':''} ${extra}" data-phase="${id}"><span><strong>${phaseMeta[id]?.title||id}</strong><small>${meta||stateLabel(state)}</small></span></button>`;
}
function flow(ids,cls=''){return `<div class="cosmos-flow ${cls}">${ids.map(id=>node(id)).join('')}</div>`}
function structural(title,note=''){return `<div class="epoch-label"><strong>${title}</strong>${note?`<span>${note}</span>`:''}</div>`}
function imageCard(key,caption){const im=G.images[key];return im?`<figure class="phenomenon-card"><img loading="lazy" referrerpolicy="no-referrer" src="${im.url}" alt=""><span>${caption}<br>${im.credit}</span></figure>`:''}
function portal(title,ids,open=false){return `<details class="portal" ${open?'open':''}><summary>${title} · ${ids.length} fases</summary><div class="portal-body">${flow(ids)}</div></details>`}
function atlasMarkup(){
 const groups={};for(const a of G.atlas)(groups[a.anchor]||(groups[a.anchor]=[])).push(a.id);
 const order=Object.keys(groups).sort((a,b)=>(G.runtimeIndex[a]??9999)-(G.runtimeIndex[b]??9999));
 return `<details class="atlas-zone"><summary>Atlas de reações opcionais · 133 fases ligadas às suas âncoras</summary><div class="atlas-groups">${order.map(anchor=>`<section class="atlas-group"><h3>Âncora · ${phaseMeta[anchor]?.title||anchor}</h3>${groups[anchor].map(id=>node(id)).join('')}</section>`).join('')}</div></details>`;
}
function buildMap(){
 const editor=C.editor;
 const host=document.createElement('div');host.id='campaignMap';host.className='campaign-map';host.setAttribute('aria-hidden','true');
 host.innerHTML=`<div class="campaign-shell" id="campaignShell">
 <header class="campaign-head"><div class="campaign-brand"><strong>ARDUA</strong><span>Mapa da campanha · do Big Bang aos elementos</span></div><div class="campaign-mode-chip">${editor?'Modo editor · cosmos completo':'Campanha · explore uma etapa por vez'}</div><button type="button" class="campaign-close" id="campaignClose">Voltar à fase</button></header>
 <main class="campaign-content">
  <section class="campaign-intro"><div><h1>Um Universo para explorar</h1><p>O Big Bang é a raiz da campanha. Cada núcleo luminoso representa uma fase jogável; bifurcações mostram histórias estelares distintas e portais abrem processos nucleares extensos.</p></div><div class="campaign-legend"><span><i></i> distante</span><span class="available"><i></i> disponível</span><span class="complete"><i></i> concluída</span></div></section>
  <section class="cosmos-root">
   <button type="button" class="singularity-map" data-phase="bigbang" aria-label="Big Bang"></button><div class="singularity-map-label"><strong>Big Bang</strong><span>Singularidade · raiz da campanha</span></div>
   ${flow(['primordial_d'])}
   ${structural('Universo primordial','Nucleossíntese primordial')}
   <div class="primordial-fork">${flow(G.sequences.primordialLeft)}${flow(G.sequences.primordialRight)}</div>
   <div class="convergence">Convergência · Hélio-4</div>
   ${flow(G.sequences.atomic)}
   ${structural('Era Atômica','Recombinação e formação de átomos neutros')}
   <article class="birth-card"><img loading="lazy" referrerpolicy="no-referrer" src="${G.images.birth.url}" alt=""><i class="birth-orb"></i><div><strong>Nascimento das estrelas</strong><span>Colapso de nuvens moleculares · a massa passa a definir caminhos distintos</span></div></article>
  </section>

  <section class="stellar-grid">
   <article class="stellar-lane sub"><h2>Massa muito baixa</h2><p>Objetos subestelares</p>${flow(G.sequences.brown)}${imageCard('brown','Destino subestelar · resfriamento prolongado')}<div class="lane-terminal">Destino · anã marrom fria</div></article>
   <article class="stellar-lane low"><h2>Baixa massa</h2><p>Anãs vermelhas</p>${flow(G.sequences.red)}${structural('Evolução de longa vida','Queima extremamente lenta de Hidrogênio')}<div class="crosslink-note">Em escalas cosmológicas, este caminho converge para uma anã branca. O mesmo destino jogável aparece no ramo intermediário abaixo.</div><button class="campaign-close" type="button" data-scroll="white">Ver convergência · Anã branca</button></article>
   <article class="stellar-lane mid"><h2>Massa intermediária</h2><p>Estrelas tipo Sol → gigantes → AGB</p>${flow(G.sequences.mid)}${structural('Estrela AGB','Pulsos térmicos e captura lenta de nêutrons')}${portal('Subárvore · Processo-s',G.sequences.sprocess)}${flow(['white'])}<div class="lane-terminal">Destino · anã branca</div></article>
   <article class="stellar-lane high"><h2>Alta massa</h2><p>Estrelas massivas e supergigantes</p>${flow(G.sequences.high)}${portal('Subárvore · Processo-s fraco',G.sequences.weakS)}${flow(G.sequences.collapse)}${imageCard('supernova','Supernova e remanescente · Nebulosa do Caranguejo')}${structural('Supernova','A explosão abre fenômenos laterais e remanescentes compactos')}${flow(G.sequences.supernovaSide)}</article>
  </section>

  <section class="compact-section">
   <article class="compact-panel blue"><h2>Remanescentes compactos</h2><p>Estrela de nêutrons → pulsar → acreção</p>${flow(G.sequences.remnant)}${imageCard('supernova','A Nebulosa do Caranguejo contém um pulsar em seu centro')}${structural('Explosão termonuclear de raios X','Portal do rp-process')}${portal('Subárvore · rp-process',G.sequences.rp)}${imageCard('blackhole','Destino da rota de colapso e acreção extrema')}</article>
   <article class="compact-panel violet"><h2>Binário · Kilonova · Processo-r</h2><p>Outro destino de sistemas com estrelas de nêutrons</p>${structural('Sistema binário de estrelas de nêutrons','Revelado a partir do remanescente compacto')}${imageCard('kilonova','Fusão de estrelas de nêutrons · kilonova')}${structural('Kilonova','Ambiente extremamente rico em nêutrons')}${portal('Subárvore · Processo-r',G.sequences.r,true)}</article>
  </section>

  <section class="cycle-grid">
   <article class="cycle-panel interstellar"><h2>Meio interestelar</h2><p>Matéria enriquecida e raios cósmicos</p>${structural('Raios cósmicos','Fragmentação de C, N e O')}${flow(G.sequences.interstellar)}<div class="lane-terminal">Be e B retornam ao reservatório de matéria para novas gerações estelares.</div></article>
   <article class="cycle-panel radio"><h2>Radioatividade</h2><p>Cadeias de decaimento de núcleos muito pesados</p>${flow(G.sequences.decay)}<div class="lane-terminal">Destino · núcleos estáveis e matéria reciclada</div></article>
  </section>
  <div class="cycle-arrow">Ciclo cósmico · matéria retorna ao meio interestelar</div>
  ${atlasMarkup()}
  <div class="map-credit">Imagens de referência científica: NASA / ESA / CSA / STScI e NASA Goddard. O mapa usa a topologia estrutural aprovada para a campanha; as imagens funcionam como marcos visuais ao longo dos caminhos.</div>
 </main></div>
 <aside class="map-detail" id="mapDetail" aria-live="polite"></aside>`;
 document.body.appendChild(host);return host;
}
const map=buildMap(),detail=$('mapDetail'),closeBtn=$('campaignClose');

function refresh(){
 map.querySelectorAll('[data-phase]').forEach(el=>{const id=el.dataset.phase;if(el.classList.contains('singularity-map'))return;el.classList.remove('locked','revealed','available','completed','current');el.classList.add(phaseState(id));const sm=el.querySelector('small');if(sm&&!phaseMeta[id]?.branch)sm.textContent=stateLabel(phaseState(id))});
 const rootState=phaseState('bigbang');map.querySelector('.singularity-map')?.setAttribute('data-state',rootState);
 if(selectedId)showDetail(selectedId);
}
function showMap(opts={}){mapRequired=!!opts.required;refresh();map.classList.add('show');map.setAttribute('aria-hidden','false');document.body.classList.add('campaign-map-open');closeBtn.disabled=mapRequired;closeBtn.textContent=mapRequired?'Escolha uma fase':'Voltar à fase';setTimeout(()=>{const current=map.querySelector('.phase-node.current');if(current&&opts.focusCurrent)current.scrollIntoView({block:'center',behavior:'smooth'})},80)}
function hideMap(){if(mapRequired)return;map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');detail.classList.remove('show')}
function prereqText(id){const r=G.prerequisites[id];if(!r)return'';const labels=x=>(phaseMeta[x]?.title||x);if(r.allOf?.length)return`Complete: ${r.allOf.map(labels).join(' + ')}`;if(r.anyOf?.length)return`Caminhos aceitos: ${r.anyOf.map(g=>g.map(labels).join(' + ')).join(' ou ')}`;return''}
function showDetail(id){selectedId=id;const st=phaseState(id),available=C.isUnlocked(id),meta=phaseMeta[id];detail.innerHTML=`<div class="detail-kicker">${stateLabel(st)} · ${id}</div><h3>${meta?.title||id}</h3><p>${meta?.branch||prereqText(id)||'Nó da campanha cosmológica.'}</p><div class="detail-actions"><button type="button" data-detail-close>Fechar</button><button type="button" class="primary" data-launch="${id}" ${available?'':'disabled'}>${new Set(C.getState().completed).has(id)?'Revisitar fase':'Explorar fase'}</button></div>`;detail.classList.add('show')}
function launch(id){if(!C.isUnlocked(id))return;const idx=C.runtimeIndex(id),btn=phaseButtons[idx];if(!btn)return;C.setActive(id);mapRequired=false;hideMap();btn.click();refresh()}

map.addEventListener('click',e=>{
 const phase=e.target.closest('[data-phase]');if(phase){e.preventDefault();showDetail(phase.dataset.phase);return}
 const launchBtn=e.target.closest('[data-launch]');if(launchBtn){launch(launchBtn.dataset.launch);return}
 if(e.target.closest('[data-detail-close]')){detail.classList.remove('show');selectedId=null;return}
 const scroll=e.target.closest('[data-scroll]');if(scroll){const target=map.querySelector(`[data-phase="${scroll.dataset.scroll}"]`);target?.scrollIntoView({behavior:'smooth',block:'center'});if(target)showDetail(scroll.dataset.scroll)}
});
closeBtn.addEventListener('click',hideMap);
map.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mapRequired)hideMap()});

// The engine's legacy list remains the launcher. The visible Menu button now opens the cosmological map.
const menuOpen=$('menuOpenBtn');if(menuOpen){menuOpen.textContent='Mapa';menuOpen.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showMap({required:false,focusCurrent:true})},true)}

// A completed phase returns to the map after the engine's own scatter / transition animation finishes.
const phaseEnd=$('phaseEndBtn');if(phaseEnd)phaseEnd.addEventListener('click',()=>{const id=C.getState().activeId;if(id&&id!=='bigbang')C.markCompleted(id);clearTimeout(returnTimer);returnTimer=setTimeout(()=>showMap({required:true,focusCurrent:true}),1500)},true);

// First Big Bang: preserve the engine's overture/ejecta, then reveal the map when the primordial phase loads beneath it.
const singularity=$('singularityBtn'),phaseTitle=$('phaseTitle');if(singularity)singularity.addEventListener('click',()=>{bigBangPending=true;C.setActive('bigbang')},true);
if(phaseTitle)new MutationObserver(()=>{if(!bigBangPending)return;if((phaseTitle.textContent||'').trim()==='Big Bang')return;bigBangPending=false;C.markCompleted('bigbang');C.setIntroduced(true);setTimeout(()=>showMap({required:true}),120)}).observe(phaseTitle,{childList:true,subtree:true,characterData:true});

window.addEventListener('ardua:campaign-progress',refresh);
const initial=C.getState();if(C.editor||initial.introduced)setTimeout(()=>showMap({required:true,focusCurrent:true}),0);
})();
