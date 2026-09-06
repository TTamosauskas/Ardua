const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}function write(p,s){fs.writeFileSync(p,s)}
function once(s,from,to,label){const n=s.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 anchor, got ${n}`);return s.replace(from,to)}

let graph=read('assets/js/campaign-graph.js');
graph=once(graph,'const G={version:1,baseOrder:','const G={version:2,baseOrder:','graph version');
graph=once(graph,'"final_collapse","neutron_star"','"final_collapse","first_enrichment","second_birth","second_enrichment","third_birth","neutron_star"','generation base order');
graph=once(graph,'"interstellar":["spallation_be","spallation"]},prerequisites:','"interstellar":["spallation_be","spallation"],"generationTransitions":["first_enrichment","second_birth","second_enrichment","third_birth"]},prerequisites:','generation sequence');
graph=once(graph,'"rb":{"allOf":["o"]}','"rb":{"allOf":["o","second_birth"]}','gate s process');
graph=once(graph,'"final_collapse":{"allOf":["neutronize"]},"nu_f"','"final_collapse":{"allOf":["neutronize"]},"first_enrichment":{"allOf":["final_collapse"]},"second_birth":{"allOf":["first_enrichment"]},"second_enrichment":{"allOf":["second_birth"],"anyOf":[["bi"],["u"],["spallation"]]},"third_birth":{"allOf":["second_enrichment"]},"nu_f"','generation prerequisites');
graph=once(graph,'"pulsar":{"allOf":["neutron_star"]},"accretion":{"allOf":["neutron_star"]}','"pulsar":{"allOf":["neutron_star","third_birth"]},"accretion":{"allOf":["neutron_star","third_birth"]}','gate compact third generation');
graph=once(graph,'"eu":{"allOf":["neutron_star"]}','"eu":{"allOf":["neutron_star","second_birth"]}','gate r process');
graph=once(graph,'"spallation_be":{"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]},"spallation":{"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]}','"spallation_be":{"allOf":["second_birth"],"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]},"spallation":{"allOf":["second_birth"],"anyOf":[["c"],["n"],["o"],["final_collapse"],["white"],["u"]]}','gate spallation');
write('assets/js/campaign-graph.js',graph);

let game=read('assets/js/ardua.js');
const milestones=`\n {id:'first_enrichment',branch:'Primeira Geração · Supernova',title:'Primeiro Enriquecimento',meta:'A supernova dispersa C, O, Si, Fe e outras sementes para o meio interestelar',new:'Fe',mode:'campaignMilestone',target:0,visual:'interstellar',fill:18,endEvent:'postTransition',endLabel:'FORMAR<br>SEGUNDA GERAÇÃO',menuTag:'1ª → 2ª'},\n {id:'second_birth',branch:'Segunda Geração · Nascimento estelar',title:'Segunda Geração',meta:'Uma nova estrela nasce de matéria já enriquecida pela Primeira Geração',new:'C',mode:'campaignMilestone',target:0,visual:'nebula',fill:16,endEvent:'postTransition',endLabel:'EXPLORAR<br>SEGUNDA GERAÇÃO',menuTag:'2ª GERAÇÃO'},\n {id:'second_enrichment',branch:'Segunda Geração · Herança química',title:'Segundo Enriquecimento',meta:'AGB, espalação e eventos ricos em nêutrons ampliam o inventário químico disponível',new:'Fe',mode:'campaignMilestone',target:0,visual:'interstellar',fill:20,endEvent:'postTransition',endLabel:'FORMAR<br>TERCEIRA GERAÇÃO',menuTag:'2ª → 3ª'},\n {id:'third_birth',branch:'Terceira Geração · Universo enriquecido',title:'Terceira Geração',meta:'Sistemas tardios nascem depois de múltiplos ciclos de enriquecimento estelar',new:'Fe',mode:'campaignMilestone',target:0,visual:'nebula',fill:18,endEvent:'postTransition',endLabel:'EXPLORAR<br>TERCEIRA GERAÇÃO',menuTag:'3ª GERAÇÃO'},`;
game=once(game,"\n {id:'neutron_star',branch:'Remanescente da Supernova'",milestones+"\n {id:'neutron_star',branch:'Remanescente da Supernova'",'insert milestone phases');
game=once(game," enriched:[['H',8600],['He',1100],['O',90],['C',60],['N',28],['Ne',25],['Mg',16],['Si',14],['S',8],['Fe',7],['Na',5],['Al',4],['Ca',2]],\n agb:"," enriched:[['H',8600],['He',1100],['O',90],['C',60],['N',28],['Ne',25],['Mg',16],['Si',14],['S',8],['Fe',7],['Na',5],['Al',4],['Ca',2]],\n mature:[['H',8200],['He',1250],['O',130],['C',90],['N',36],['Ne',30],['Mg',22],['Si',20],['S',10],['Fe',10],['Sr',1.2],['Ba',.45],['Eu',.12],['Au',.06]],\n agb:",'mature abundance');
game=once(game,'function phaseAbundance(s=phase()){\n  // Na Anã Branca','function phaseAbundance(s=phase()){\n  const campaignHeritage=window.ARDUA_CAMPAIGN?.getState?.().heritage?.level||0,generation=window.ARDUA_GENERATIONS?.generationOf?.(s.id);\n  if(campaignHeritage>=2&&generation===\'third\')return ABUNDANCE.mature;\n  if(campaignHeritage>=1&&generation===\'second\')return ABUNDANCE.enriched;\n  // Na Anã Branca','heritage abundance');
game=once(game,'function objectiveSatisfied(s=phase()){\n if(s.mode===\'convection\')','function objectiveSatisfied(s=phase()){\n if(s.mode===\'campaignMilestone\')return true;\n if(s.mode===\'convection\')','milestone objective');
game=once(game,"const flowDone=s.id==='brown'||s.mode==='whiteCompact'||state.flow>=Math.max(0,s.flowTarget||0);","const flowDone=s.mode==='campaignMilestone'||s.id==='brown'||s.mode==='whiteCompact'||state.flow>=Math.max(0,s.flowTarget||0);",'milestone flow');
game=once(game,'save();render()}\nfunction modalPrimaryLine','save();render();if(s.mode===\'campaignMilestone\')setTimeout(checkComplete,80)}\nfunction modalPrimaryLine','milestone auto complete');
game=once(game,"function modalPrimaryLine(s=phase()){\n if(s.mode==='reactionExplore')","function modalPrimaryLine(s=phase()){\n if(s.mode==='campaignMilestone')return s.meta;\n if(s.mode==='reactionExplore')",'milestone primary');
game=once(game,"function modalSecondaryLine(s=phase()){\n if(s.mode==='reactionExplore')","function modalSecondaryLine(s=phase()){\n if(s.mode==='campaignMilestone')return 'Observe a herança química e prossiga para a próxima geração';\n if(s.mode==='reactionExplore')",'milestone secondary');
game=once(game,"function phaseFamily(p){\n if(p.mode==='reactionExplore')","function phaseFamily(p){\n if(p.mode==='campaignMilestone')return p.branch;\n if(p.mode==='reactionExplore')",'milestone family');
write('assets/js/ardua.js',game);

let map=read('assets/js/campaign-map.js');
map=once(map," supernova:{\n  nu:xseq(['nu_f']),"," supernova:{\n  enrichment:xseq(['first_enrichment','second_birth']),\n  nu:xseq(['nu_f']),",'supernova enrichment members');
map=once(map,"  {key:'gamma',label:'Processo γ',visual:'sphere-gamma',image:'supernova',content:flow(['gamma_process'])},\n  {key:'ns'","  {key:'gamma',label:'Processo γ',visual:'sphere-gamma',image:'supernova',content:flow(['gamma_process'])},\n  {key:'enrichment',label:'Enriquecimento',visual:'sphere-enrichment',image:'supernova',content:flow(['first_enrichment','second_birth'])},\n  {key:'ns'",'supernova enrichment branch');
map=once(map,'      </section>\n      <div class="cycle-arrow">Ciclo cósmico</div>','      </section>\n      ${flow([\'second_enrichment\',\'third_birth\'],\'generation-transition-flow\')}\n      <div class="cycle-arrow">Ciclo cósmico</div>','second to third transition');
write('assets/js/campaign-map.js',map);

let css=read('assets/css/campaign-generations.css');
css+='\n.generation-transition-flow{margin:18px auto 8px;max-width:620px}.branch-choice.sphere-enrichment .branch-sphere-art{box-shadow:inset 0 0 0 1px rgba(214,190,134,.32),0 0 24px rgba(214,190,134,.12)}\n';
write('assets/css/campaign-generations.css',css);
