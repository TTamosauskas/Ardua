const fs=require('fs');
function patch(path,re,replace,label){let s=fs.readFileSync(path,'utf8');const matches=s.match(re);if(!matches)throw new Error('missing anchor: '+label);s=s.replace(re,replace);fs.writeFileSync(path,s)}

patch('assets/js/campaign-map.js',/function drawHigh\(\)\{[\s\S]*?\n\}\n\nfunction drawLinks\(\)\{/,
`function drawHigh(){
 connectTrail(G.sequences.high,'high');
 addPath(byPhase(tail('co')),byPhase('neutronize'),'high');
 connectTrail(G.sequences.collapse,'high');
 const collapse=byPhase(tail('final_collapse'));connectBranchJunction(collapse,'supernova',{nu:'high',enrichment:'interstellar',ns:'compact',bh:'compact'});
 const s=activeBranch('supernova');
 if(s==='nu'){connectActiveSphere('supernova','nu_f','high');connectIds(expanded(['nu_f']),'high')}
 if(s==='enrichment'){
  connectActiveSphere('supernova','first_enrichment','interstellar');
  connectIds(expanded(['first_enrichment','second_birth']),'interstellar');
  const secondHub=[...map.querySelectorAll('[data-junction="generation-two-birth"]')].find(isVisible);addPath(byPhase('second_birth'),secondHub,'interstellar',.55);
 }
 if(s==='bh'){
  const sphere=branchSphereEl('supernova','bh'),junction=[...map.querySelectorAll('.blackhole-junction')].find(isVisible),bh=byPhase('black_hole');
  addPath(sphere,junction,'compact',.35);addPath(junction,bh,'compact',.5);
 }
 if(s==='ns')connectActiveSphere('supernova','neutron_star','compact');
}

function drawSecondGeneration(){
 const hub=[...map.querySelectorAll('[data-junction="generation-two-birth"]')].find(isVisible);if(!hub)return;
 connectBranchJunction(hub,'secondgen',{weak:'high',s:'mid',gamma:'r',spallation:'interstellar'});
 const branch=activeBranch('secondgen');
 if(branch==='weak'){
  const sphere=branchSphereEl('secondgen','weak'),portal=portalSummary('weak-s');addPath(sphere,portal,'high',.34);
  if(portalOpen('weak-s')){addPath(portal,portalFirst('weak-s'),'high');connectTrail(G.sequences.weakS,'high')}
 }
 if(branch==='s'){
  const sphere=branchSphereEl('secondgen','s'),portal=portalSummary('s-second');addPath(sphere,portal,'mid',.34);
  if(portalOpen('s-second')){addPath(portal,portalFirst('s-second'),'mid');connectTrail(G.sequences.sprocess,'mid');addPath(portalLast('s-second'),byPhase('second_enrichment'),'mid',.55)}
 }
 if(branch==='gamma')connectActiveSphere('secondgen','gamma_process','r');
 if(branch==='spallation'){
  const sphere=branchSphereEl('secondgen','spallation');connectBranchJunction(sphere,'spallation',{be:'interstellar',b:'interstellar'});
  const sp=activeBranch('spallation');
  if(sp==='be')connectActiveSphere('spallation','spallation_be','interstellar');
  if(sp==='b')connectActiveSphere('spallation','spallation','interstellar');
 }
 connectIds(expanded(['second_enrichment','third_birth']),'converge');
}

function drawThirdGeneration(){
 const entry=byPhase('third_birth'),junction=[...map.querySelectorAll('.third-generation-junction')].find(isVisible);if(!junction)return;
 addPath(entry,junction,'compact',.55);
 connectBranchJunction(junction,'neutron',{pulsar:'compact',accretion:'compact',r:'r'});
 const branch=activeBranch('neutron');
 if(branch==='pulsar')connectActiveSphere('neutron','pulsar','compact');
 if(branch==='accretion'){
  connectActiveSphere('neutron','accretion','compact');
  const rpPortal=portalSummary('rp');addPath(byPhase(tail('accretion')),rpPortal,'compact');
  if(portalOpen('rp')){addPath(rpPortal,portalFirst('rp'),'compact');connectTrail(G.sequences.rp,'compact')}
 }
 if(branch==='r'){
  const sphere=branchSphereEl('neutron','r'),binary=byPhase('binary_neutron_stars'),kilo=byPhase('kilonova'),rPortal=portalSummary('r');
  addPath(sphere,binary,'r',.34);addPath(binary,kilo,'r');addPath(kilo,rPortal,'r');
  if(portalOpen('r')){addPath(rPortal,portalFirst('r'),'r');connectTrail(G.sequences.r,'r')}
  const firstDecay=byPhase('decay_pa');if(firstDecay){addPath(portalLast('r'),firstDecay,'radio',.55);connectTrail(G.sequences.decay,'radio')}
 }
}

function drawLinks(){`, 'draw functions');

patch('assets/js/campaign-map.js',/\n connectTrail\(G\.sequences\.decay,'radio'\);[\s\S]*?\n\}\nfunction scheduleLinks/,
`\n drawSecondGeneration();
 drawThirdGeneration();
}
function scheduleLinks`, 'drawLinks tail');

patch('assets/css/campaign-map.css',/\.stellar-branches>\.branch-spheres\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\);max-width:690px;align-items:end\}/,
`.stellar-branches>.branch-spheres{grid-template-columns:repeat(4,minmax(0,1fr));max-width:690px;align-items:end}
.second-generation-branches>.branch-spheres{grid-template-columns:repeat(4,minmax(0,1fr));max-width:690px;align-items:end}`, 'second generation desktop grid');

patch('assets/css/campaign-map.css',/\.supernova-branches,\.neutron-branches\{margin-top:18px;margin-bottom:8px\}\.supernova-branches>\.branch-panels,\.neutron-branches>\.branch-panels\{max-width:560px\}/,
`.supernova-branches,.neutron-branches,.second-generation-branches{margin-top:18px;margin-bottom:8px}.supernova-branches>.branch-panels,.neutron-branches>.branch-panels{max-width:560px}.second-generation-branches>.branch-panels{max-width:600px}`, 'second generation cluster sizing');

patch('assets/css/campaign-map.css',/\.stellar-branches>\.branch-spheres\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\);max-width:100%\}\.primordial-branches>/,
`.stellar-branches>.branch-spheres,.second-generation-branches>.branch-spheres{grid-template-columns:repeat(4,minmax(0,1fr));max-width:100%}.primordial-branches>`, 'second generation mobile grid');
