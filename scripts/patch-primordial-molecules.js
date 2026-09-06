const fs=require('fs');

function read(path){return fs.readFileSync(path,'utf8')}
function write(path,text){fs.writeFileSync(path,text)}
function replaceOnce(text,from,to,label){
  if(!text.includes(from))throw new Error(`marker missing: ${label}`);
  return text.replace(from,to);
}
function replaceRegex(text,re,to,label){
  if(!re.test(text))throw new Error(`regex marker missing: ${label}`);
  return text.replace(re,to);
}

// Engine + gameplay.
{
  const path='assets/js/ardua.js';
  let s=read(path);

  if(!s.includes("'HeH+':{")){
    s=replaceOnce(s,"\n Be7:{",`\n 'HeH+':{n:0,symbol:'HeH⁺',name:'Hidreto de Hélio',origin:'Química molecular primordial',process:'Íon molecular muito simples usado aqui como ponte didática entre os primeiros átomos e a química primordial.',c:['#f7fbff','#cfe8ff','#86afd4']},\n H2:{n:0,symbol:'H₂',name:'Hidrogênio molecular',origin:'Química molecular primordial',process:'O H₂ tornou-se um refrigerante importante do gás primordial e ajudou nuvens de matéria a perder energia antes da formação das primeiras estrelas.',c:['#f7feff','#b9e8ff','#6eb7e7']},\n Be7:{`,'pseudo molecular entries');
  }

  s=replaceRegex(s,/ \{id:'atomic_li',[^\n]+\n/,` {id:'atomic_li',branch:'Era atômica · recombinação do Lítio',title:'Forme átomos de Lítio',meta:'⁷Li³⁺ + 3e⁻ → Li',new:'Li',mode:'atomicRecombination',atomicTarget:'Li',target:4,visual:'primordialLi',primordial:true,endLabel:'PRIMEIRAS<br>LIGAÇÕES',menuTag:'Li'},\n {id:'first_atomic_bonds',branch:'Química primordial · primeiras ligações',title:'Primeiras Ligações Atômicas',meta:'He + H → HeH⁺',new:'HeH+',mode:'primordialMolecule',target:6,visual:'primordialHe',primordial:true,endLabel:'CRIAR<br>GÁS PRIMORDIAL',menuTag:'HeH⁺'},\n {id:'first_nebulae',branch:'Química primordial · primeiras nebulosas',title:'Primeiras Nebulosas',meta:'HeH⁺ + H → H₂',new:'H2',mode:'primordialMolecule',target:6,visual:'primordialH',primordial:true,endLabel:'FORMAR<br>PRIMEIRA GERAÇÃO',menuTag:'H₂'},\n`,'phase insertion');

  s=replaceOnce(s," set('atomic_li',4,12);", " set('atomic_li',4,12);\n set('first_atomic_bonds',6,6);set('first_nebulae',6,6);",'phase flow tuning');
  s=replaceOnce(s," setClass(['atomic_li','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection'],'short');", " setClass(['atomic_li','first_atomic_bonds','first_nebulae','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection'],'short');",'duration class');

  s=replaceOnce(s,'primordialTransfer:null,bigBangStarted:false',"primordialTransfer:null,primordialMolecules:new Map(),nextPrimordialMoleculeId:1,primordialMoleculeTimer:null,bigBangStarted:false",'molecule state');
  s=replaceOnce(s,"function clearBoard(){state.board=Array(coords.length).fill(null);state.pieces.clear();state.selected=[];state.freeSelected=[];state.created={};dom.lines.innerHTML='';dom.pieces.innerHTML=''\}","function clearBoard(){stopPrimordialMoleculeDrift();state.primordialMolecules?.clear();state.board=Array(coords.length).fill(null);state.pieces.clear();state.selected=[];state.freeSelected=[];state.created={};dom.lines.innerHTML='';dom.pieces.innerHTML=''}",'clear molecule state');

  s=replaceOnce(s," if(transfer?.particles)restorePrimordialParticles(transfer.particles);\n if(s.mode==='primordialNuclear'){",` if(transfer?.particles)restorePrimordialParticles(transfer.particles);\n if(s.mode==='primordialMolecule'){\n   // Cada fase molecular começa com o conjunto mínimo pedido. O restante precisa ser\n   // reconstruído com as receitas nucleares e de recombinação já aprendidas.\n   clearPrimordialParticles();state.primordialMolecules.clear();state.freeSelected=[];\n   ensurePrimordialParticleMix({p:12,e:18,n:10});\n   const atom=(sym,x=null,y=null)=>createFreePiece(sym,x,y,{matterState:'atom',boundElectrons:Number(E[sym]?.n||0),massNumber:primordialMassForSym(sym)});\n   if(s.id==='first_atomic_bonds'){atom('H');atom('He')}\n   else if(s.id==='first_nebulae'){const pt=freePoint(72),he=atom('He',pt.x-24,pt.y),hBond=atom('H',pt.x+24,pt.y);atom('H');createPrimordialMolecule('HeH+',he,hBond,{credit:false,silent:true})}\n   renderPieces();renderPrimordialParticles();syncPrimordialMoleculeVisuals();startPrimordialDrift();startPrimordialMoleculeDrift();return;\n }\n if(s.mode==='primordialNuclear'){`,'molecular stage setup');

  s=replaceOnce(s,"  if(isPrimordial(s))return;", "  if(isPrimordial(s)){if(s.mode==='primordialMolecule')ensurePrimordialParticleMix({p:10,e:16,n:8});return;}",'molecular particle replenishment');

  const moleculeCode=`\nfunction primordialMoleculeById(id){return state.primordialMolecules?.get(Number(id))||null}\nfunction primordialMoleculeForPiece(piece){return piece?.moleculeId?primordialMoleculeById(piece.moleculeId):null}\nfunction primordialNeutralAtom(piece,sym=null){return !!piece&&piece.free&&!piece.moleculeId&&(!sym||piece.sym===sym)&&piece.matterState==='atom'&&pieceCharge(piece)===0}\nfunction primordialMoleculeBondDistance(){return Math.max(42,Math.min(54,cellSize()*.82))}\nfunction syncPrimordialMoleculeVisuals(){\n const live=new Set();for(const m of state.primordialMolecules?.values?.()||[]){for(const id of m.members){const el=dom.pieces.querySelector(\`[data-id="\${id}"]\`);if(el){el.dataset.molecule=m.type;live.add(el)}}}\n dom.pieces.querySelectorAll('[data-molecule]').forEach(el=>{if(!live.has(el))delete el.dataset.molecule});\n}\nfunction positionPrimordialMolecule(m){const a=state.pieces.get(m.members[0]),b=state.pieces.get(m.members[1]);if(!a||!b)return;const d=primordialMoleculeBondDistance(),dx=Math.cos(m.angle)*d/2,dy=Math.sin(m.angle)*d/2;a.x=m.x-dx;a.y=m.y-dy;b.x=m.x+dx;b.y=m.y+dy}\nfunction createPrimordialMolecule(type,a,b,{credit=true,silent=false}={}){\n if(!a||!b)return null;const id=state.nextPrimordialMoleculeId++,m={id,type,members:[a.id,b.id],x:(a.x+b.x)/2,y:(a.y+b.y)/2,angle:Math.atan2(b.y-a.y,b.x-a.x)||Math.random()*Math.PI*2};\n for(const p of [a,b]){p.moleculeId=id;p.moleculeType=type;p.matterState='atom'}state.primordialMolecules.set(id,m);positionPrimordialMolecule(m);\n if(credit){state.created[type]=(state.created[type]||0)+1;recordFlow(1)}renderPieces();syncPrimordialMoleculeVisuals();if(!silent){burst(m.x,m.y);captureTag(m.x,m.y,type==='HeH+'?'HeH⁺':'H₂');tone(type==='HeH+'?520:390,.12,'triangle',.035)}startPrimordialMoleculeDrift();return m;\n}\nfunction dissolvePrimordialMolecule(m){if(!m)return;state.primordialMolecules.delete(m.id);for(const id of m.members){const p=state.pieces.get(id);if(p){delete p.moleculeId;delete p.moleculeType}}syncPrimordialMoleculeVisuals()}\nfunction selectedPrimordialMolecule(){for(const id of state.freeSelected||[]){const p=state.pieces.get(id),m=primordialMoleculeForPiece(p);if(m)return m}return null}\nfunction tapPrimordialMolecule(id){const m=primordialMoleculeById(id);if(!m||state.locked||state.phaseDone)return;const selected=m.members.every(pid=>state.freeSelected.includes(pid));state.freeSelected=selected?[]:[...m.members];tone(selected?240:340,.045,'sine',.022);render();syncPrimordialMoleculeVisuals()}\nfunction primordialHeHBondAllowed(s=phase()){return s.mode==='primordialMolecule'&&(s.id==='first_atomic_bonds'||campaignKnowledgeReached('first_atomic_bonds'))}\nfunction canCreatePrimordialHeH(a,b,s=phase()){return primordialHeHBondAllowed(s)&&primordialNeutralAtom(a)&&primordialNeutralAtom(b)&&same([a.sym,b.sym],['He','H'])}\nasync function formPrimordialHeH(a,b){\n if(state.locked||!canCreatePrimordialHeH(a,b))return;state.locked=true;state.freeSelected=[];const x=(a.x+b.x)/2,y=(a.y+b.y)/2;a.x=x;a.y=y;b.x=x;b.y=y;renderPieces();await wait(170);createPrimordialMolecule('HeH+',a,b,{credit:true});state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();\n}\nasync function reactPrimordialHeHWithHydrogen(m,h){\n const s=phase();if(s.id!=='first_nebulae'||state.locked||m?.type!=='HeH+'||!primordialNeutralAtom(h,'H'))return;const members=m.members.map(id=>state.pieces.get(id)).filter(Boolean),he=members.find(p=>p.sym==='He'),bondH=members.find(p=>p.sym==='H');if(!he||!bondH)return;\n state.locked=true;state.freeSelected=[];const x=(m.x+h.x)/2,y=(m.y+h.y)/2;h.x=m.x;h.y=m.y;renderPieces();await wait(170);dissolvePrimordialMolecule(m);const a=Math.random()*Math.PI*2;he.x=x+Math.cos(a)*74;he.y=y+Math.sin(a)*74;bondH.x=x;bondH.y=y;h.x=x;h.y=y;createPrimordialMolecule('H2',bondH,h,{credit:true,silent:true});burst(x,y);captureTag(x,y,'H₂ + He');tone(420,.14,'triangle',.038);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();\n}\nfunction stopPrimordialMoleculeDrift(){if(state.primordialMoleculeTimer){clearInterval(state.primordialMoleculeTimer);state.primordialMoleculeTimer=null}}\nfunction startPrimordialMoleculeDrift(){\n stopPrimordialMoleculeDrift();if(!state.primordialMolecules?.size)return;state.primordialMoleculeTimer=setInterval(()=>{const s=phase();if(s.mode!=='primordialMolecule'||state.phaseDone||state.locked)return;const size=starSize(),pad=Math.max(62,size*.13),selected=selectedPrimordialMolecule();for(const m of state.primordialMolecules.values()){if(selected?.id===m.id)continue;const step=12+Math.random()*13,a=Math.random()*Math.PI*2;m.x=Math.max(pad,Math.min(size-pad,m.x+Math.cos(a)*step));m.y=Math.max(pad,Math.min(size-pad,m.y+Math.sin(a)*step));m.angle+=(Math.random()-.5)*.28;positionPrimordialMolecule(m)}renderPieces();syncPrimordialMoleculeVisuals()},720);\n}\nfunction resizePrimordialMolecules(){const size=starSize(),pad=Math.max(62,size*.13);for(const m of state.primordialMolecules?.values?.()||[]){m.x=Math.max(pad,Math.min(size-pad,m.x));m.y=Math.max(pad,Math.min(size-pad,m.y));positionPrimordialMolecule(m)}syncPrimordialMoleculeVisuals()}\n`;
  s=replaceOnce(s,"function tapFreeAtom(id){",moleculeCode+"\nfunction tapFreeAtom(id){",'molecule mechanics insertion');

  s=replaceOnce(s,"function tapFreeAtom(id){\n const p=state.pieces.get(id);if(!p||!p.free||state.locked||state.phaseDone)return;const particle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;",`function tapFreeAtom(id){\n const p=state.pieces.get(id);if(!p||!p.free||state.locked||state.phaseDone)return;const s=phase();\n if(s.mode==='primordialMolecule'){\n   if(p.moleculeId)return tapPrimordialMolecule(p.moleculeId);\n   const selectedMol=selectedPrimordialMolecule();if(selectedMol){if(s.id==='first_nebulae'&&selectedMol.type==='HeH+'&&primordialNeutralAtom(p,'H'))return reactPrimordialHeHWithHydrogen(selectedMol,p);state.freeSelected=[id];tone(320,.04);render();return}\n   if(state.freeSelected.length===1){const first=state.pieces.get(state.freeSelected[0]);if(canCreatePrimordialHeH(first,p,s))return formPrimordialHeH(first,p)}\n }\n const particle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;`,'tap molecule routing');

  const tapMarker="}if(s.mode==='opening'||state.locked||state.phaseDone)return;const p=state.primordialParticles.get(id);if(!p||p.reacting||p.dragging)return;\n const selectedPiece=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null;";
  s=replaceOnce(s,tapMarker,tapMarker+"\n if(selectedPiece?.moleculeId){state.freeSelected=[];invalidPrimordial(id);render();return}",'protect bonded atoms from particle recipes');

  s=replaceOnce(s," if(s.mode==='primordialNuclear'){const made=primordialGoalCount(s);",` if(s.mode==='primordialMolecule'){const made=primordialGoalCount(s);if(s.id==='first_atomic_bonds')$('goalText').textContent=\`Forme Hidreto de Hélio \${made}/\${s.target}\`;else $('goalText').textContent='Crie gás primordial';setFormula(conciseRecipeLine(s));return}\n if(s.mode==='primordialNuclear'){const made=primordialGoalCount(s);`,'molecular objectives');

  s=replaceOnce(s," if(s.id==='atomic_li')return '⁷Li³⁺ + 3e⁻ → Li';",` if(s.id==='atomic_li')return '⁷Li³⁺ + 3e⁻ → Li';\n if(s.id==='first_atomic_bonds')return 'He + H → HeH⁺';\n if(s.id==='first_nebulae')return 'HeH⁺ + H → H₂';`,'molecular formula lines');

  s=replaceOnce(s," if(s.id==='coulomb_intro')return 'Tente fundir os Hélios-3 da periferia e descubra como a posição muda a reação';",` if(s.id==='first_atomic_bonds')return 'Selecione um Hélio e um Hidrogênio neutros para formar uma dupla ligada';\n if(s.id==='first_nebulae')return 'Selecione uma dupla HeH⁺ e depois um Hidrogênio isolado';\n if(s.id==='coulomb_intro')return 'Tente fundir os Hélios-3 da periferia e descubra como a posição muda a reação';`,'molecular guidance');

  s=replaceOnce(s," if(s.mode==='stellarFormation')$('stageProgressText').textContent=`${formationLargest}/61`;\n else if(s.id==='brown')",` if(s.mode==='stellarFormation')$('stageProgressText').textContent=\`\${formationLargest}/61\`;\n else if(s.mode==='primordialMolecule')$('stageProgressText').textContent=\`\${primordialGoalCount(s)}/\${s.target}\`;\n else if(s.id==='brown')`,'molecular progress counter');
  s=replaceOnce(s," $('stageProgressLabel').textContent=s.mode==='stellarFormation'?(state.readyToAdvance?'ESTRELA PRONTA':'AGLOMERAÇÃO'):"," $('stageProgressLabel').textContent=s.mode==='stellarFormation'?(state.readyToAdvance?'ESTRELA PRONTA':'AGLOMERAÇÃO'):s.mode==='primordialMolecule'?(state.readyToAdvance?'CONCLUÍDA':'QUÍMICA PRIMORDIAL'):",'molecular progress label');

  s=replaceOnce(s,' "atomic_li":"Um átomo neutro de Lítio possui três elétrons porque seu núcleo possui três prótons.",',` "atomic_li":"Um átomo neutro de Lítio possui três elétrons porque seu núcleo possui três prótons.",\n "first_atomic_bonds":"O HeH⁺ é um dos íons moleculares mais simples da química primordial. Na natureza, sua formação envolve canais iônicos e emissão de fótons; esta fase condensa a rede para manter H e He visíveis como peças ligadas.",\n "first_nebulae":"O H₂ tornou-se um refrigerante decisivo do gás primordial. A rede real passa por intermediários como H₂⁺ e H⁻; o jogo resume essa química em uma transferência direta para mostrar o nascimento do gás molecular.",`,'science notes');

  s=replaceRegex(s,/async function advancePrimordial\(\)\{[\s\S]*?\n\}\nasync function scatterStage/,`async function advancePrimordial(){\n const s=phase();if(!state.phaseDone)return;$('phaseEndBtn').classList.remove('show');state.locked=true;stopPrimordialDrift();stopPrimordialMoleculeDrift();dom.star.classList.add('primordial-transition');\n if(s.id==='primordial_li'){tone(165,.35,'sine',.035);await wait(420);await decayPrimordialTritiumForAtomicEra();announce('CENTENAS DE MILHARES DE ANOS DEPOIS','COMEÇA A ERA ATÔMICA','Os núcleos sobreviventes agora encontram elétrons em um Universo muito mais frio.');await wait(520)}\n const transfer={particles:snapshotPrimordialParticles(),pieces:snapshotFreePieces()};\n if(['atomic_li','first_atomic_bonds','first_nebulae'].includes(s.id))state.primordialTransfer=null;else state.primordialTransfer=transfer;\n if(s.id==='first_nebulae'){announce('O GÁS PRIMORDIAL SE RESFRIA','A MATÉRIA PODE SE CONCENTRAR','Moléculas leves ajudam o gás primordial a perder energia; muito depois, a gravidade reúne matéria para formar as primeiras estrelas.');tone(140,.42,'sine',.04);await wait(850)}else if(s.id!=='primordial_li'){tone(250,.18,'triangle',.03);await wait(330)}\n dom.star.classList.remove('primordial-transition');advancePhase()\n}\nasync function scatterStage`,'advance primordial transition');

  s=replaceOnce(s,"resizeStellarFormation();render()});", "resizePrimordialMolecules();resizeStellarFormation();render()});",'resize molecules');

  write(path,s);
}

// Styling: bonded atoms remain literal circles, just touching and moving as one pair.
{
  const path='assets/css/ardua.css';let s=read(path);
  const marker='/* Primordial molecular pairs */';
  if(!s.includes(marker))s+=`\n\n${marker}\n.star-board.primordial-mode .atom[data-molecule]{animation:none!important;margin-top:0!important;transition:left .48s ease,top .48s ease,box-shadow .18s ease,filter .18s ease;filter:brightness(1.04)}\n.star-board.primordial-mode .atom[data-molecule="HeH+"]{box-shadow:inset 0 0 18px rgba(255,255,255,.18),0 0 16px rgba(147,220,255,.24),0 7px 15px rgba(0,0,0,.22)}\n.star-board.primordial-mode .atom[data-molecule="H2"]{box-shadow:inset 0 0 18px rgba(255,255,255,.18),0 0 18px rgba(190,238,255,.28),0 7px 15px rgba(0,0,0,.22)}\n`;
  write(path,s);
}

// Campaign graph.
{
  const path='assets/js/campaign-graph.js';let s=read(path);
  s=replaceOnce(s,'const G={version:5,','const G={version:6,','graph version');
  s=replaceOnce(s,'"atomic_li","first_generation_formation"','"atomic_li","first_atomic_bonds","first_nebulae","first_generation_formation"','base order');
  s=replaceOnce(s,'"atomic":["primordial_li","atomic_he","atomic_h","atomic_li"],','"atomic":["primordial_li","atomic_he","atomic_h","atomic_li"],"molecular":["first_atomic_bonds","first_nebulae"],','molecular sequence');
  s=replaceOnce(s,'"atomic_li":{"allOf":["atomic_h"]},"first_generation_formation":{"allOf":["atomic_li"]}', '"atomic_li":{"allOf":["atomic_h"]},"first_atomic_bonds":{"allOf":["atomic_li"]},"first_nebulae":{"allOf":["first_atomic_bonds"]},"first_generation_formation":{"allOf":["first_nebulae"]}','molecular prerequisites');
  write(path,s);
}

// Prologue membership.
{
 const path='assets/js/campaign-generations.js';let s=read(path);
 s=replaceOnce(s,"const prologue=uniq(['bigbang','primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td',...seq('atomic')]);","const prologue=uniq(['bigbang','primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td',...seq('atomic'),...seq('molecular')]);",'prologue molecules');
 write(path,s);
}

// Map: explicit molecular mini-era and guide lines.
{
 const path='assets/js/campaign-map.js';let s=read(path);
 s=replaceOnce(s,"     ${flow(G.sequences.atomic)}\n     ${structural('Era Atômica')}\n     ${flow(['first_generation_formation'],'generation-formation-flow')}","     ${flow(G.sequences.atomic)}\n     ${structural('Primeiras moléculas')}\n     ${flow(G.sequences.molecular,'molecular-primordial-flow')}\n     ${structural('Era Atômica')}\n     ${flow(['first_generation_formation'],'generation-formation-flow')}",'map molecular flow');
 s=replaceOnce(s," connectTrail(G.sequences.atomic,'primordial');\n\n const formation=byPhase('first_generation_formation'),birth=[...map.querySelectorAll('[data-junction=\"stellar-birth\"]')].find(isVisible);addPath(byPhase(tail('atomic_li')),formation,'birth');addPath(formation,birth,'birth');",` connectTrail(G.sequences.atomic,'primordial');\n addPath(byPhase(tail('atomic_li')),byPhase('first_atomic_bonds'),'primordial');connectTrail(G.sequences.molecular,'primordial');\n\n const formation=byPhase('first_generation_formation'),birth=[...map.querySelectorAll('[data-junction="stellar-birth"]')].find(isVisible);addPath(byPhase(tail('first_nebulae')),formation,'birth');addPath(formation,birth,'birth');`,'map molecule connectors');
 write(path,s);
}

// Save migration: old players already beyond stellar birth should not be gated by new prologue phases.
{
 const path='assets/js/campaign-mode.js';let s=read(path);
 s=s.replace(/version:7/g,'version:8');
 const marker=" if(previousVersion<7&&['brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o','carbon_burn','ne','fe','final_collapse','first_enrichment','second_birth','second_enrichment','third_birth','neutron_star','black_hole'].some(id=>seen.has(id)))next.completed=uniq([...next.completed,'first_generation_formation']);";
 s=replaceOnce(s,marker,marker+`\n if(previousVersion<8){const cutoff=G?.runtimeIndex?.first_generation_formation??Infinity,passed=[...seen].some(id=>Number.isInteger(G?.runtimeIndex?.[id])&&G.runtimeIndex[id]>=cutoff);if(passed)next.completed=uniq([...next.completed,'first_atomic_bonds','first_nebulae'])}`,'save v8 migration');
 write(path,s);
}

console.log('primordial molecule patch applied');
