from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


def replace_between(text, start, end, new, label):
    i = text.find(start)
    if i < 0:
        raise SystemExit(f'{label}: start marker missing')
    j = text.find(end, i)
    if j < 0:
        raise SystemExit(f'{label}: end marker missing')
    return text[:i] + new + text[j:]


# 1) Canonical graph: turn sequential approximations into astrophysical alternatives.
graph_path = Path('assets/js/campaign-graph.js')
graph = graph_path.read_text(encoding='utf-8')
graph = replace_once(
    graph,
    '"he_yellow":{"allOf":["he_orange"]},"coulomb_intro":{"allOf":["he_yellow"]}',
    '"he_yellow":{"allOf":["atomic_li"]},"coulomb_intro":{"anyOf":[["he_orange"],["he_yellow"]]}',
    'main-sequence fork prerequisites',
)
graph = replace_once(
    graph,
    '"accretion":{"allOf":["pulsar"]}',
    '"accretion":{"allOf":["neutron_star"]}',
    'neutron-star accretion prerequisite',
)
graph = replace_once(
    graph,
    '"black_hole":{"allOf":["stability"]}',
    '"black_hole":{"anyOf":[["final_collapse"],["stability"]]}',
    'black-hole dual origin',
)
graph = replace_once(
    graph,
    '"spallation_be":{"anyOf":[["o"],["final_collapse"],["white"],["u"]]},"spallation":{"allOf":["spallation_be"]}',
    '"spallation_be":{"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]},"spallation":{"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]}',
    'spallation sibling products',
)
graph = replace_once(
    graph,
    '"rp_te","stability","black_hole"],"r"',
    '"rp_te","stability"],"r"',
    'rp sequence endpoint',
)
graph_path.write_text(graph, encoding='utf-8')


# 2) Campaign map: nested scientific forks + continuous open-process connectors.
map_path = Path('assets/js/campaign-map.js')
js = map_path.read_text(encoding='utf-8')

new_members = r'''const rpMembers=xseq(G.sequences.rp),rMembers=xseq(G.sequences.r),decayMembers=xseq(G.sequences.decay),quasarMembers=xseq(G.sequences.quasar||[]);
const stellarHighMembers=uniq([
 ...xseq(G.sequences.high),...xseq(G.sequences.weakS),...xseq(G.sequences.collapse),
 ...xseq(['nu_f','gamma_process','neutron_star','pulsar','accretion','black_hole']),
 ...rpMembers,...rMembers,...decayMembers,...quasarMembers
]);
const neutronStarMembers=uniq([
 ...xseq(['neutron_star','pulsar','accretion']),...rpMembers,...rMembers,...decayMembers
]);
const blackHoleMembers=uniq([...xseq(['black_hole']),...quasarMembers]);
const BRANCH_MEMBERS={
 primordial:{tritium:xseq(G.sequences.primordialLeft),helium3:xseq(G.sequences.primordialRight)},
 mainseq:{orange:xseq(['he_orange']),yellow:xseq(['he_yellow'])},
 stellar:{
  sub:xseq(G.sequences.brown),
  low:uniq([...xseq(G.sequences.red),'white']),
  mid:uniq([...xseq(G.sequences.mid),...xseq(G.sequences.sprocess),'white']),
  high:stellarHighMembers
 },
 supernova:{
  nu:xseq(['nu_f']),
  gamma:xseq(['gamma_process']),
  ns:neutronStarMembers,
  bh:blackHoleMembers
 },
 neutron:{
  pulsar:xseq(['pulsar']),
  accretion:uniq([...xseq(['accretion']),...rpMembers]),
  r:uniq([...rMembers,...decayMembers])
 },
 spallation:{be:xseq(['spallation_be']),b:xseq(['spallation'])}
};
const PORTAL_MEMBERS={
 s:xseq(G.sequences.sprocess),
 'weak-s':xseq(G.sequences.weakS),
 rp:rpMembers,
 r:rMembers
};
'''
js = replace_between(js, 'const stellarHighMembers=uniq([', '\n\nfunction phaseState', new_members, 'campaign branch members')

new_build = r'''function buildMap(){
 const editor=C.editor,host=document.createElement('div');host.id='campaignMap';host.className='campaign-map';host.setAttribute('aria-hidden','true');
 const primordial=branchCluster('primordial',[
  {key:'tritium',label:'Trítio',visual:'sphere-tritium',content:flow(G.sequences.primordialLeft)},
  {key:'helium3',label:'Hélio-3',visual:'sphere-helium',content:flow(G.sequences.primordialRight)}
 ],'primordial-branches');
 const mainseq=branchCluster('mainseq',[
  {key:'orange',label:'Anã laranja',visual:'sphere-orange',content:flow(['he_orange'])},
  {key:'yellow',label:'Anã amarela',visual:'sphere-yellow',content:flow(['he_yellow'])}
 ],'mainseq-branches');
 const neutron=branchCluster('neutron',[
  {key:'pulsar',label:'Pulsar',visual:'sphere-pulsar',image:'supernova',content:flow(['pulsar'])},
  {key:'accretion',label:'Acreção + raios X',visual:'sphere-accretion',image:'blackhole',content:`${flow(['accretion'])}${structural('Explosão de raios X')}${portal('rp-process',G.sequences.rp,false,'rp')}${ambientImage('blackhole','branch-bg branch-bg-right')}`},
  {key:'r',label:'Kilonova',visual:'sphere-kilonova',image:'kilonova',content:`${structural('Sistema binário de estrelas de nêutrons','binary-junction')}${structural('Kilonova','kilonova-junction')}${portal('Processo-r',G.sequences.r,true,'r')}${ambientImage('kilonova','branch-bg branch-bg-left')}`}
 ],'neutron-branches');
 const supernova=branchCluster('supernova',[
  {key:'nu',label:'Neutrinos',visual:'sphere-neutrino',image:'supernova',content:flow(['nu_f'])},
  {key:'gamma',label:'Processo γ',visual:'sphere-gamma',image:'supernova',content:flow(['gamma_process'])},
  {key:'ns',label:'Estrela de nêutrons',visual:'sphere-remnant',image:'supernova',content:`${flow(['neutron_star'])}${neutron}`},
  {key:'bh',label:'Buraco negro',visual:'sphere-blackhole',image:'blackhole',content:`${structural('Formação do buraco negro','blackhole-junction')}${flow(['black_hole'])}${ambientImage('blackhole','branch-bg branch-bg-right')}`}
 ],'supernova-branches');
 const stellar=branchCluster('stellar',[
  {key:'sub',label:'Anã marrom',visual:'sphere-brown',content:`${ambientImage('brown','branch-bg branch-bg-left')}${flow(G.sequences.brown)}`},
  {key:'low',label:'Baixa massa',visual:'sphere-red',content:`${flow(G.sequences.red)}${structural('Evolução de longa vida')}${flow(['white'])}`},
  {key:'mid',label:'Massa intermediária',visual:'sphere-gold',content:`${mainseq}<div class="convergence mainseq-convergence" data-junction="mainseq-convergence">Evolução estelar</div>${flow(['coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o'])}${structural('Estrela AGB')}${portal('Processo-s',G.sequences.sprocess,false,'s')}${flow(['white'])}`},
  {key:'high',label:'Alta massa',visual:'sphere-high',content:`${ambientImage('supernova','branch-bg branch-bg-right')}${flow(G.sequences.high)}${portal('Processo-s fraco',G.sequences.weakS,false,'weak-s')}${flow(G.sequences.collapse)}${structural('Supernova')}${supernova}`}
 ],'stellar-branches');
 const spallation=branchCluster('spallation',[
  {key:'be',label:'Berílio',visual:'sphere-spallation-be',content:flow(['spallation_be'])},
  {key:'b',label:'Boro',visual:'sphere-spallation-b',content:flow(['spallation'])}
 ],'spallation-branches');
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
       <article class="cycle-panel interstellar"><h2>Meio interestelar</h2>${structural('Raios cósmicos','cosmic-ray-junction')}${spallation}<div class="convergence interstellar-convergence" data-junction="spallation-convergence">Meio interestelar enriquecido</div></article>
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
'''
js = replace_between(js, 'function buildMap(){', 'const map=buildMap()', new_build, 'campaign map build')

new_infer = r'''function inferAncestorBranches(){
 const st=C.getState(),done=new Set(st.completed),active=st.activeId;
 if(!branchSelection.primordial){
  if(BRANCH_MEMBERS.primordial.tritium.includes(active))branchSelection.primordial='tritium';
  else if(BRANCH_MEMBERS.primordial.helium3.includes(active))branchSelection.primordial='helium3';
  else if(done.has(tail('primordial_he3d')))branchSelection.primordial='helium3';
  else if(done.has(tail('primordial_td')))branchSelection.primordial='tritium';
 }
 if(!branchSelection.mainseq){
  if(active==='he_yellow'||done.has('he_yellow'))branchSelection.mainseq='yellow';
  else if(active==='he_orange'||done.has('he_orange'))branchSelection.mainseq='orange';
 }
 if(!branchSelection.stellar){
  if(active==='white')branchSelection.stellar=done.has('bi')?'mid':'low';
  else if(stellarHighMembers.includes(active)||done.has('final_collapse'))branchSelection.stellar='high';
  else if(BRANCH_MEMBERS.stellar.mid.includes(active)||done.has('bi'))branchSelection.stellar='mid';
  else if(BRANCH_MEMBERS.stellar.low.includes(active)||done.has('he_red'))branchSelection.stellar='low';
  else if(BRANCH_MEMBERS.stellar.sub.includes(active)||done.has('brown'))branchSelection.stellar='sub';
 }
 if(!branchSelection.spallation){
  if(active==='spallation'||done.has('spallation'))branchSelection.spallation='b';
  else if(active==='spallation_be'||done.has('spallation_be'))branchSelection.spallation='be';
 }
}
'''
js = replace_between(js, 'function inferAncestorBranches(){', 'function syncBranchesToActive(){', new_infer, 'branch inference')
js = replace_once(
    js,
    " for(const group of ['primordial','stellar','supernova','neutron'])syncBranchAfter(group);",
    ' for(const group of Object.keys(BRANCH_MEMBERS))syncBranchAfter(group);',
    'branch-after synchronization',
)

js = replace_once(
    js,
    "function portalSummary(key){const el=[...map.querySelectorAll(`[data-portal=\"${key}\"] > summary`)].find(isVisible);return el||null}\nfunction portalFirst(key){",
    "function portalSummary(key){const root=[...map.querySelectorAll(`[data-portal=\"${key}\"]`)].find(isVisible);if(!root)return null;return root.querySelector(':scope > summary, :scope > .portal-heading')||root}\nfunction portalOpen(key){const root=[...map.querySelectorAll(`[data-portal=\"${key}\"]`)].find(isVisible);return !!root&&(root.classList.contains('open-trail')||!!root.open)}\nfunction portalFirst(key){",
    'open trail portal anchor',
)

new_draws = r'''function drawMid(){
 const midSphere=branchSphereEl('stellar','mid');
 connectBranchJunction(midSphere,'mainseq',{orange:'mid',yellow:'mid'});
 const m=activeBranch('mainseq'),convergence=[...map.querySelectorAll('[data-junction="mainseq-convergence"]')].find(isVisible);
 if(m==='orange'){connectActiveSphere('mainseq','he_orange','mid');addPath(byPhase(tail('he_orange')),convergence,'mid',.48)}
 if(m==='yellow'){connectActiveSphere('mainseq','he_yellow','mid');addPath(byPhase(tail('he_yellow')),convergence,'mid',.48)}
 if(convergence)addPath(convergence,byPhase('coulomb_intro'),'mid',.5);
 connectTrail(['coulomb_intro','stellar_convection','stellar_li'],'mid');
 const sPortal=portalSummary('s');
 if(portalOpen('s')){addPath(sPortal,portalFirst('s'),'mid');connectTrail(G.sequences.sprocess,'mid');addPath(portalLast('s'),byPhase('white'),'mid')}
}
function drawHigh(){
 connectTrail(G.sequences.high,'high');
 const weakPortal=portalSummary('weak-s');addPath(byPhase(tail('co')),weakPortal,'high');
 if(portalOpen('weak-s')){addPath(weakPortal,portalFirst('weak-s'),'high');connectTrail(G.sequences.weakS,'high');addPath(portalLast('weak-s'),byPhase('neutronize'),'high')}else addPath(weakPortal,byPhase('neutronize'),'high');
 connectTrail(G.sequences.collapse,'high');
 const collapse=byPhase(tail('final_collapse'));connectBranchJunction(collapse,'supernova',{nu:'high',gamma:'high',ns:'compact',bh:'compact'});
 const s=activeBranch('supernova');
 if(s==='nu'){connectActiveSphere('supernova','nu_f','high');connectIds(expanded(['nu_f']),'high')}
 if(s==='gamma')connectActiveSphere('supernova','gamma_process','high');
 if(s==='bh'){
  const sphere=branchSphereEl('supernova','bh'),junction=[...map.querySelectorAll('.blackhole-junction')].find(isVisible),bh=byPhase('black_hole');
  addPath(sphere,junction,'compact',.35);addPath(junction,bh,'compact',.5);
 }
 if(s==='ns'){
  connectActiveSphere('supernova','neutron_star','compact');
  const neutron=byPhase(tail('neutron_star'));connectBranchJunction(neutron,'neutron',{pulsar:'compact',accretion:'compact',r:'r'});
  const n=activeBranch('neutron');
  if(n==='pulsar')connectActiveSphere('neutron','pulsar','compact');
  if(n==='accretion'){
   connectActiveSphere('neutron','accretion','compact');
   const rpPortal=portalSummary('rp');addPath(byPhase(tail('accretion')),rpPortal,'compact');
   if(portalOpen('rp')){addPath(rpPortal,portalFirst('rp'),'compact');connectTrail(G.sequences.rp,'compact')}
  }
  if(n==='r'){
   const sphere=branchSphereEl('neutron','r'),binary=[...map.querySelectorAll('.binary-junction')].find(isVisible),kilo=[...map.querySelectorAll('.kilonova-junction')].find(isVisible),rPortal=portalSummary('r');
   addPath(sphere,binary,'r',.35);addPath(binary,kilo,'r');addPath(kilo,rPortal,'r');
   if(portalOpen('r')){addPath(rPortal,portalFirst('r'),'r');connectTrail(G.sequences.r,'r');addPath(portalLast('r'),byPhase('decay_pa'),'radio',.55)}else addPath(rPortal,byPhase('decay_pa'),'radio',.55);
  }
 }
}

'''
js = replace_between(js, 'function drawMid(){', 'function drawLinks(){', new_draws, 'campaign link drawers')

js = replace_once(
    js,
    " if(s==='mid'){connectActiveSphere('stellar','he_orange','mid');drawMid()}",
    " if(s==='mid')drawMid()",
    'mid branch entry connector',
)
old_interstellar = " connectTrail(G.sequences.interstellar,'interstellar');connectTrail(G.sequences.decay,'radio');\n const interstellarTarget=byPhase('spallation_be');\n for(const sourceId of ['o','final_collapse','white','u']){const source=byPhase(tail(sourceId));if(source){addPath(source,interstellarTarget,'interstellar',.68);break}}"
new_interstellar = " connectTrail(G.sequences.decay,'radio');\n const cosmic=[...map.querySelectorAll('.cosmic-ray-junction')].find(isVisible),spallationConvergence=[...map.querySelectorAll('[data-junction=\"spallation-convergence\"]')].find(isVisible);\n for(const sourceId of ['c','n','o','final_collapse','white','u']){const source=byPhase(tail(sourceId));if(source&&cosmic){addPath(source,cosmic,'interstellar',.68);break}}\n if(cosmic)connectBranchJunction(cosmic,'spallation',{be:'interstellar',b:'interstellar'});\n const sp=activeBranch('spallation');\n if(sp==='be'){connectActiveSphere('spallation','spallation_be','interstellar');addPath(byPhase('spallation_be'),spallationConvergence,'interstellar',.5)}\n if(sp==='b'){connectActiveSphere('spallation','spallation','interstellar');addPath(byPhase('spallation'),spallationConvergence,'interstellar',.5)}"
js = replace_once(js, old_interstellar, new_interstellar, 'spallation fork connectors')

map_path.write_text(js, encoding='utf-8')


# 3) Visual hierarchy for the new branch spheres.
css_path = Path('assets/css/campaign-map.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* Astrophysical fork refinement */'
if marker not in css:
    css += r'''

/* Astrophysical fork refinement */
.mainseq-branches>.branch-spheres{grid-template-columns:repeat(2,minmax(0,1fr));max-width:360px}
.spallation-branches>.branch-spheres{grid-template-columns:repeat(2,minmax(0,1fr));max-width:340px}
.supernova-branches>.branch-spheres{grid-template-columns:repeat(4,minmax(0,1fr));max-width:650px}
.neutron-branches>.branch-spheres{grid-template-columns:repeat(3,minmax(0,1fr));max-width:520px}
.mainseq-branches{margin-top:0;margin-bottom:10px}.mainseq-convergence{margin-top:2px;margin-bottom:8px}
.spallation-branches{margin:2px auto 8px}.interstellar-convergence{margin-top:3px}
.sphere-orange{--sphere:#ffac63;--sphere-size:76px}.sphere-orange .branch-sphere-art{background-image:radial-gradient(circle at 34% 29%,#fff5da 0 8%,#ffbd68 9% 25%,#d66b2c 48%,#2c1007 76%)}
.sphere-yellow{--sphere:#ffe77a;--sphere-size:84px}.sphere-yellow .branch-sphere-art{background-image:radial-gradient(circle at 34% 29%,#fff 0 8%,#ffe57a 9% 25%,#e39a32 48%,#321607 76%)}
.sphere-pulsar{--sphere:#8bdcff;--sphere-size:78px}.sphere-pulsar .branch-sphere-art{background-image:radial-gradient(circle at 50% 50%,#f5ffff 0 7%,#8adfff 8% 19%,#245e93 35%,#081528 62%,#02050b 78%)}
.sphere-blackhole{--sphere:#b58cff;--sphere-size:96px}.sphere-blackhole .branch-sphere-art{background-image:radial-gradient(circle at 50% 50%,#000 0 27%,#30104a 29%,#e5a0ff 34%,#fff 36%,#5aa8ff 40%,transparent 57%)}
.sphere-spallation-be{--sphere:#a8d88a;--sphere-size:68px}.sphere-spallation-be .branch-sphere-art{background-image:radial-gradient(circle at 34% 30%,#f8ffe9 0 8%,#b8df91 9% 25%,#547c48 49%,#0c1c14 76%)}
.sphere-spallation-b{--sphere:#e3c576;--sphere-size:72px}.sphere-spallation-b .branch-sphere-art{background-image:radial-gradient(circle at 34% 30%,#fff8df 0 8%,#e8c873 9% 25%,#8f6f29 49%,#211707 76%)}
@media(max-width:640px){
 .supernova-branches>.branch-spheres{max-width:100%;gap:12px 2px}.neutron-branches>.branch-spheres{max-width:100%;gap:12px 4px}
 .mainseq-branches>.branch-spheres,.spallation-branches>.branch-spheres{max-width:320px}
 .sphere-orange{--sphere-size:58px}.sphere-yellow{--sphere-size:64px}.sphere-pulsar{--sphere-size:58px}.sphere-blackhole{--sphere-size:70px}.sphere-spallation-be{--sphere-size:54px}.sphere-spallation-b{--sphere-size:56px}
 .supernova-branches .branch-choice strong,.neutron-branches .branch-choice strong{font-size:6.5px;max-width:72px}
}
'''
css_path.write_text(css, encoding='utf-8')

print('astrophysical campaign forks applied')
