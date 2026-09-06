const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>fs.writeFileSync(p,s);
function once(s,from,to,label){const n=s.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 anchor, got ${n}`);return s.replace(from,to)}

let graph=read('assets/js/campaign-graph.js');
graph=once(graph,'const G={version:2,baseOrder:','const G={version:3,baseOrder:','graph version');
graph=once(graph,'"pb","bi","eu","gd"','"pb","bi","binary_neutron_stars","kilonova","eu","gd"','kilonova base order');
graph=once(graph,'"generationTransitions":["first_enrichment","second_birth","second_enrichment","third_birth"]},prerequisites:','"generationTransitions":["first_enrichment","second_birth","second_enrichment","third_birth"],"kilonovaPrelude":["binary_neutron_stars","kilonova"]},prerequisites:','kilonova sequence');
graph=once(graph,'"eu":{"allOf":["neutron_star","second_birth"]}','"binary_neutron_stars":{"allOf":["neutron_star","second_birth"]},"kilonova":{"allOf":["binary_neutron_stars"]},"eu":{"allOf":["kilonova"]}','kilonova prerequisites');
write('assets/js/campaign-graph.js',graph);

let game=read('assets/js/ardua.js');
const prelude=`\n {id:'binary_neutron_stars',branch:'Segunda Geração · Sistemas compactos',title:'Sistema binário de estrelas de nêutrons',meta:'Duas estrelas de nêutrons perdem energia orbital e se aproximam até a fusão',new:'Fe',mode:'campaignMilestone',target:0,visual:'kilonova',fill:26,endEvent:'postTransition',endLabel:'FUNDIR<br>SISTEMA',menuTag:'BINÁRIO'},\n {id:'kilonova',branch:'Segunda Geração · Evento de enriquecimento',title:'Kilonova',meta:'A fusão lança matéria extremamente rica em nêutrons e abre o processo-r',new:'Eu',mode:'campaignMilestone',target:0,visual:'kilonova',fill:32,endEvent:'postTransition',endLabel:'INICIAR<br>PROCESSO-R',menuTag:'KILONOVA'},`;
game=once(game,"\n {id:'eu',mechanicPattern:'r-storm'",prelude+"\n {id:'eu',mechanicPattern:'r-storm'",'insert binary/kilonova phases');
game=once(game,"endLabel:'MUDAR PARA<br>PROCESSO-R',fusionTempMax:3.5e8}","endLabel:'FORMAR<br>SISTEMA BINÁRIO',fusionTempMax:3.5e8}",'bismuth transition label');
write('assets/js/ardua.js',game);

let map=read('assets/js/campaign-map.js');
map=once(map,"const neutronStarMembers=uniq([\n ...xseq(['neutron_star','pulsar','accretion']),...rpMembers,...rMembers,...decayMembers\n]);","const neutronStarMembers=uniq([\n ...xseq(['neutron_star','pulsar','accretion','binary_neutron_stars','kilonova']),...rpMembers,...rMembers,...decayMembers\n]);",'neutron star members');
map=once(map,"  r:uniq([...rMembers,...decayMembers])","  r:uniq([...xseq(['binary_neutron_stars','kilonova']),...rMembers,...decayMembers])",'r branch members');
map=once(map,"  {key:'r',label:'Kilonova',visual:'sphere-kilonova',image:'kilonova',content:`${structural('Sistema binário de estrelas de nêutrons','binary-junction')}${structural('Kilonova','kilonova-junction')}${portal('Processo-r',G.sequences.r,true,'r')}${ambientImage('kilonova','branch-bg branch-bg-left')}`}","  {key:'r',label:'Kilonova',visual:'sphere-kilonova',image:'kilonova',content:`${flow(['binary_neutron_stars','kilonova'],'kilonova-prelude-flow')}${portal('Processo-r',G.sequences.r,true,'r')}${ambientImage('kilonova','branch-bg branch-bg-left')}`} ",'real kilonova phases');
write('assets/js/campaign-map.js',map);

let giants=read('assets/js/campaign-giants-map.js');
giants=once(giants," const after=document.createElement('div');after.className='branch-after giant-after';after.dataset.afterGroup='giant';after.hidden=true;\n const core=document.createElement('div');core.className='convergence giant-agb';core.dataset.junction='giant-agb';core.textContent='Convergência AGB';"," const after=document.createElement('div');after.className='branch-after giant-after';after.dataset.afterGroup='giant';after.hidden=true;\n const core=document.createElement('div');core.className='convergence giant-agb';core.dataset.junction='giant-agb';core.textContent='Herança estelar';\n const generation=document.createElement('div');generation.className='generation-subchapter generation-second';generation.innerHTML='<span>2ª GERAÇÃO</span><strong>Nova estrela AGB</strong><small>Sementes produzidas pela Primeira Geração alimentam a captura lenta de nêutrons.</small>';",'AGB generation bridge');
giants=once(giants,' after.append(core,agb,portal,whiteFlow);',' after.append(core,generation,agb,portal,whiteFlow);','place AGB generation bridge');
write('assets/js/campaign-giants-map.js',giants);

let css=read('assets/css/campaign-generations.css');
css+=`\n.generation-subchapter{margin:16px auto 12px;max-width:560px;padding:11px 14px;border-top:1px solid rgba(190,163,237,.25);border-bottom:1px solid rgba(190,163,237,.15);text-align:center}\n.generation-subchapter>span{display:block;font-size:9px;font-weight:800;letter-spacing:.18em;color:#aa93d3}.generation-subchapter>strong{display:block;margin-top:3px;font-size:14px;color:#eef3ff}.generation-subchapter>small{display:block;margin:4px auto 0;max-width:460px;font-size:10px;line-height:1.4;color:#97a8c5}\n.kilonova-prelude-flow{margin-bottom:12px}\n`;
write('assets/css/campaign-generations.css',css);
