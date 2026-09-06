const fs=require('fs');

function read(path){return fs.readFileSync(path,'utf8')}
function write(path,s){fs.writeFileSync(path,s)}
function replaceOnce(src,oldText,newText,label){
  const count=src.split(oldText).length-1;
  if(count!==1)throw new Error(`${label}: esperado 1 match, encontrado ${count}`);
  return src.replace(oldText,newText);
}
function replaceRegexOnce(src,re,newText,label){
  const m=src.match(re);if(!m)throw new Error(`${label}: match ausente`);
  const rest=src.slice((m.index||0)+m[0].length);if(re.test(rest))throw new Error(`${label}: mais de um match`);
  return src.replace(re,newText);
}

// Engine: phase family + reusable geometry/state.
{
 const path='assets/js/ardua.js';let src=read(path);
 src=replaceOnce(src,"if(s.mode==='stellarFormation')return 3;","if(s.mode==='stellarFormation')return stellarFormationSpec(s).radius;",'phaseRadius formation');
 src=replaceOnce(src,"if(s.mode==='stellarFormation')return {r:3,factor:.94,max:540};","if(s.mode==='stellarFormation'){const r=stellarFormationSpec(s).radius;return{r,factor:r>=4?.995:r===3?.94:r===2?.90:.78,max:r>=4?600:r===3?540:r===2?470:360}}",'phaseGeometry formation');

 const oldPhaseBlock=` {id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 18 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'37 H',durationClass:'long'},\n {id:'brown',branch:'Nascimento estelar · massa muito baixa',title:'Anã marrom',meta:'Queima limitada de Deutério',new:'He3',mode:'fusion',target:4,visual:'brownDwarf',fill:7,pool:['D','H'],endLabel:'DEUTÉRIO<br>ESGOTADO',gravityDelay:190},\n {id:'he_red',branch:'Nova estrela · baixa massa',title:'Anã vermelha',meta:'Formação de Hélio estável',new:'He',mode:'fusion',target:6,visual:'redDwarf',fill:16,pool:['H'],gravityDelay:175},\n {id:'he_orange',branch:'Nova estrela · massa intermediária',title:'Anã laranja',meta:'Primeiros passos da cadeia próton-próton',new:'He3',mode:'fusion',target:5,visual:'orangeDwarf',fill:18,pool:['H','H','H','H','He'],gravityDelay:158,fusionTempMax:1.3e7},`;
 const newPhaseBlock=` {id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 18 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:4,target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'37 H',durationClass:'long'},\n {id:'brown_formation',branch:'Nascimento estelar · massa muito baixa',title:'Formação da Anã Marrom',meta:'Reúna 3 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:2,target:7,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'FORMAR<br>ANÃ MARROM',menuTag:'7 H',durationClass:'quick'},\n {id:'brown',branch:'Nascimento estelar · massa muito baixa',title:'Anã marrom',meta:'Queima limitada de Deutério',new:'He3',mode:'fusion',target:4,visual:'brownDwarf',fill:7,pool:['D','H'],endLabel:'DEUTÉRIO<br>ESGOTADO',gravityDelay:190},\n {id:'low_mass_formation',branch:'Nascimento estelar · baixa massa',title:'Formação da Estrela de Baixa Massa',meta:'Reúna 3 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:2,target:7,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'FORMAR<br>ANÃ VERMELHA',menuTag:'7 H',durationClass:'quick'},\n {id:'he_red',branch:'Nova estrela · baixa massa',title:'Anã vermelha',meta:'Formação de Hélio estável',new:'He',mode:'fusion',target:6,visual:'redDwarf',fill:16,pool:['H'],gravityDelay:175},\n {id:'intermediate_mass_formation',branch:'Nascimento estelar · massa intermediária',title:'Formação da Estrela de Massa Intermediária',meta:'Reúna 9 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:3,target:19,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'FORMAR<br>ANÃ LARANJA',menuTag:'19 H',durationClass:'short'},\n {id:'he_orange',branch:'Nova estrela · massa intermediária',title:'Anã laranja',meta:'Primeiros passos da cadeia próton-próton',new:'He3',mode:'fusion',target:5,visual:'orangeDwarf',fill:18,pool:['H','H','H','H','He'],gravityDelay:158,fusionTempMax:1.3e7},`;
 src=replaceOnce(src,oldPhaseBlock,newPhaseBlock,'phase insertion brown low mid');

 const oldStellarLi=` {id:'stellar_li',branch:'Gigante vermelha · mecanismo Cameron–Fowler',title:'Produção estelar de Lítio',meta:'³He + ⁴He → ⁷Be + γ · transporte → ⁷Li + νₑ',new:'Li',mode:'fusion',target:4,visual:'redGiant',fill:36,pool:['H','H','H','He','He'],gravityDelay:142,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'⁷Li',endLabel:'ACENDER<br>TRIPLO-ALFA'},\n {id:'fragile',`;
 const newStellarLi=` {id:'stellar_li',branch:'Gigante vermelha · mecanismo Cameron–Fowler',title:'Produção estelar de Lítio',meta:'³He + ⁴He → ⁷Be + γ · transporte → ⁷Li + νₑ',new:'Li',mode:'fusion',target:4,visual:'redGiant',fill:36,pool:['H','H','H','He','He'],gravityDelay:142,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'⁷Li',endLabel:'ACENDER<br>TRIPLO-ALFA'},\n {id:'giant_formation',branch:'Nascimento estelar · bifurcação das gigantes',title:'Formação das Gigantes',meta:'Reúna 18 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:4,target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'ESCOLHER<br>GIGANTE',menuTag:'37 H',durationClass:'long'},\n {id:'fragile',`;
 src=replaceOnce(src,oldStellarLi,newStellarLi,'giant formation phase');

 const carbonLine=` {id:'carbon_burn',branch:'Estrela massiva · queima de Carbono',title:'Queima de Carbono',meta:'Carbono + Carbono → Neônio + Hélio',new:'Ne',mode:'fusion',target:5,visual:'massive',fill:48,pool:['H','He','C','C','O'],gravityDelay:124,fusionTempMax:9e8,menuTag:'C+C'},`;
 const carbonInsert=` {id:'high_mass_formation',branch:'Nascimento estelar · alta massa',title:'Formação da Estrela de Alta Massa',meta:'Reúna 30 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',formationLayers:5,target:61,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'INICIAR<br>QUEIMA DE CARBONO',menuTag:'61 H',durationClass:'epic'},\n${carbonLine}`;
 src=replaceOnce(src,carbonLine,carbonInsert,'high mass formation phase');

 const formationBlock=/\/\/ Formation of the first stellar generation\.[\s\S]*?function stellarFormationSeedLayout\(count\)\{if\(count<=1\)return\[\{x:0,y:0\}\];const d=stellarFormationSeedBondDistance\(\);return\[\{x:-d\/2,y:0\},\{x:d\/2,y:0\}\]\}/;
 const generalized=`// Reusable stellar-formation family. Visible H-H pairs provide every slot except\n// the final one; the last H remains hidden until a single vacancy is left.\nfunction stellarFormationSpec(s=phase()){\n const layers=Math.max(2,Math.min(5,Number(s?.formationLayers||4))),radius=layers-1,total=1+3*radius*(radius+1),visibleTotal=total-1,pairCount=visibleTotal/2;\n return{layers,radius,total,visibleTotal,pairCount,initialGroups:pairCount};\n}\nfunction stellarFormationCells(spec=stellarFormationSpec()){\n const ringCells=ring=>(byRing[ring]||[]).slice().sort((a,b)=>Math.atan2(coords[a].r*1.5,Math.sqrt(3)*(coords[a].q+coords[a].r/2))-Math.atan2(coords[b].r*1.5,Math.sqrt(3)*(coords[b].q+coords[b].r/2)));\n const out=[...(byRing[0]||[])];\n for(let ring=1;ring<=spec.radius;ring++){const pool=ringCells(ring),chosen=[];while(pool.length){let best=0,bestScore=-1;if(chosen.length){for(let i=0;i<pool.length;i++){const a=Math.atan2(coords[pool[i]].r*1.5,Math.sqrt(3)*(coords[pool[i]].q+coords[pool[i]].r/2));let min=Infinity;for(const c of chosen){const b=Math.atan2(coords[c].r*1.5,Math.sqrt(3)*(coords[c].q+coords[c].r/2)),d=Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));min=Math.min(min,d)}if(min>bestScore){bestScore=min;best=i}}}chosen.push(pool.splice(best,1)[0])}out.push(...chosen)}\n return out.slice(0,spec.total);\n}\nfunction stellarFormationLayout(n,spec=stellarFormationSpec()){\n const scale=cellSize()*.58,ids=stellarFormationCells(spec).slice(0,Math.max(1,Math.min(spec.total,n))),pts=ids.map(i=>{const c=coords[i];return{x:scale*Math.sqrt(3)*(c.q+c.r/2),y:scale*1.5*c.r,cell:i}}),cx=pts.reduce((a,p)=>a+p.x,0)/pts.length,cy=pts.reduce((a,p)=>a+p.y,0)/pts.length;return pts.map(p=>({x:p.x-cx,y:p.y-cy,cell:p.cell}));\n}\nfunction stellarFormationFiveLayerAtomSize(){return Math.max(36,Math.min(72,starSize()*.88/(2*4+1)))}\nfunction stellarFormationSeedBondDistance(){return stellarFormationFiveLayerAtomSize()}\nfunction stellarFormationSeedLayout(count){if(count<=1)return[{x:0,y:0}];const d=stellarFormationSeedBondDistance();return[{x:-d/2,y:0},{x:d/2,y:0}]}`;
 src=replaceRegexOnce(src,formationBlock,generalized,'generalize formation geometry');

 src=replaceOnce(src,"if(!f||f.complete||f.stabilizing||g.members.length!==STELLAR_FORMATION_VISIBLE_TOTAL)return;","if(!f||f.complete||f.stabilizing||g.members.length!==f.spec.visibleTotal)return;",'autofill visible total');
 src=replaceOnce(src,"g.angle=0;const targets=stellarFormationLayout(STELLAR_FORMATION_TOTAL);","g.angle=0;const targets=stellarFormationLayout(f.spec.total,f.spec);",'autofill targets');
 src=replaceOnce(src,"const target=targets[STELLAR_FORMATION_TOTAL-1],id=f.nextAtomId++","const target=targets[f.spec.total-1],id=f.nextAtomId++",'autofill last target');
 src=replaceOnce(src,"if(mass===STELLAR_FORMATION_VISIBLE_TOTAL)stellarFormationAutoComplete(f,g);","if(mass===f.spec.visibleTotal)stellarFormationAutoComplete(f,g);",'merge completion');
 src=replaceOnce(src,"function stellarFormationRandomPoint(existing,size){","function stellarFormationRandomPoint(existing,size,spec=stellarFormationSpec()){",'random point signature');
 src=replaceOnce(src,"const angle=existing.length*2.399963229728653,radius=maxR*Math.sqrt((existing.length+.5)/STELLAR_FORMATION_INITIAL_GROUPS);","const angle=existing.length*2.399963229728653,radius=maxR*Math.sqrt((existing.length+.5)/Math.max(1,spec.initialGroups));",'random point group count');

 const startRe=/function startStellarFormationStage\(\)\{[\s\S]*?\n\}\nfunction resizeStellarFormation\(\)/;
 const newStart=`function startStellarFormationStage(){\n removeStellarFormation();\n const spec=stellarFormationSpec(),size=starSize(),layer=document.createElement('div'),fields=document.createElement('div'),atomsLayer=document.createElement('div');\n layer.className='stellar-formation-layer';layer.setAttribute('aria-label',\`${'${spec.pairCount}'} duplas de Hidrogênio formando um hexágono de ${'${spec.layers}'} camadas\`);layer.style.setProperty('--formationAtomSize',stellarFormationFiveLayerAtomSize()+'px');fields.className='formation-fields';atomsLayer.className='formation-atoms';layer.append(fields,atomsLayer);dom.star.appendChild(layer);dom.star.classList.add('stellar-formation-mode');\n const f={layer,fields,atomsLayer,atoms:new Map(),groups:new Map(),selectedGroup:null,nextGroupId:spec.initialGroups+1,nextAtomId:spec.visibleTotal+1,raf:0,lastTime:performance.now(),compatibilityAt:0,stabilizing:false,complete:false,size,spec};state.stellarFormation=f;\n const seedCounts=[...Array(spec.pairCount).fill(2)],points=[];let atomId=1;\n seedCounts.forEach((count,i)=>{const gid=i+1,pt=stellarFormationRandomPoint(points,size,spec);points.push(pt);const driftAngle=Math.random()*Math.PI*2,drift=.018+Math.random()*.025,angle=Math.random()*Math.PI*2,local=stellarFormationSeedLayout(count),g={id:gid,members:[],x:pt.x,y:pt.y,vx:Math.cos(driftAngle)*drift,vy:Math.sin(driftAngle)*drift,angle,omega:(i%2?1:-1)*(.00022+Math.random()*.00018),reorgStart:0,fieldEl:null},ca=Math.cos(angle),sa=Math.sin(angle);\n   local.forEach(offset=>{const id=atomId++,x=pt.x+offset.x*ca-offset.y*sa,y=pt.y+offset.x*sa+offset.y*ca,atom={id,sym:'H',groupId:gid,x,y,toLocal:{...offset},fromLocal:null,el:null},el=document.createElement('button');el.type='button';el.className='formation-atom formation-pair';el.dataset.formationAtom=String(id);el.style.background=elementStyle('H');el.textContent=stellarFormationElementLabel('H');el.setAttribute('aria-label','Hidrogênio em dupla H₂');el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();stellarFormationSelectAtom(id)});atom.el=el;atomsLayer.appendChild(el);f.atoms.set(id,atom);g.members.push(id)});\n   f.groups.set(g.id,g);stellarFormationMakeField(f,g)\n });\n stellarFormationUpdateHud(f);stellarFormationRefreshCompatibility(f);f.raf=requestAnimationFrame(t=>stellarFormationRenderFrame(f,t));\n}\nfunction resizeStellarFormation()`;
 src=replaceRegexOnce(src,startRe,newStart,'generalize start formation');

 src=replaceOnce(src,"const memberAtoms=group.members.map(id=>f.atoms.get(id)).filter(Boolean),cells=stellarFormationCells();","const memberAtoms=group.members.map(id=>f.atoms.get(id)).filter(Boolean),cells=stellarFormationCells(f.spec);",'advance formation cells');

 const oldHud="const formationLargest=s.mode==='stellarFormation'&&state.stellarFormation?Math.max(0,...[...state.stellarFormation.groups.values()].map(g=>g.members.length)):0;\n const p=s.mode==='stellarFormation'?Math.min(100,formationLargest/STELLAR_FORMATION_TOTAL*100):currentProgress(),flowTarget=Math.max(0,s.flowTarget||0);";
 const newHud="const formationSpec=s.mode==='stellarFormation'?stellarFormationSpec(s):null,formationLargest=s.mode==='stellarFormation'&&state.stellarFormation?Math.max(0,...[...state.stellarFormation.groups.values()].map(g=>g.members.length)):0;\n const p=s.mode==='stellarFormation'?Math.min(100,formationLargest/formationSpec.total*100):currentProgress(),flowTarget=Math.max(0,s.flowTarget||0);";
 src=replaceOnce(src,oldHud,newHud,'formation HUD total');
 src=replaceOnce(src,"if(s.mode==='stellarFormation')$('stageProgressText').textContent=`${formationLargest}/${STELLAR_FORMATION_TOTAL}`;","if(s.mode==='stellarFormation')$('stageProgressText').textContent=`${formationLargest}/${formationSpec.total}`;",'formation HUD text');

 const oldObjective="if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna 18 duplas de H — maior aglomerado ${largest}/${STELLAR_FORMATION_TOTAL}`;setFormula('Una duplas e aglomerados quando seus campos g se sobrepuserem');return}";
 const newObjective="if(s.mode==='stellarFormation'){const spec=stellarFormationSpec(s),f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna ${spec.pairCount} duplas de H — maior aglomerado ${largest}/${spec.total}`;setFormula('Una duplas e aglomerados quando seus campos g se sobrepuserem');return}";
 src=replaceOnce(src,oldObjective,newObjective,'formation objective');

 const oldComplete="if(s.mode==='stellarFormation')announce('MATÉRIA REUNIDA','PRIMEIRA GERAÇÃO PRONTA','Os 37 átomos de Hidrogênio formam um hexágono de 4 camadas. Faça nascer a nova estrela.');";
 const newComplete="if(s.mode==='stellarFormation'){const spec=stellarFormationSpec(s);announce('MATÉRIA REUNIDA',s.id==='first_generation_formation'?'PRIMEIRA GERAÇÃO PRONTA':'FORMAÇÃO CONCLUÍDA',`Os ${spec.total} átomos de Hidrogênio formam um hexágono de ${spec.layers} camadas.`);}";
 src=replaceOnce(src,oldComplete,newComplete,'formation completion message');

 if(src.includes('STELLAR_FORMATION_'))throw new Error('constantes antigas de formação ainda presentes');
 write(path,src);
}

// Canonical graph: expose each formation as the gateway of its stellar trail.
{
 const path='assets/js/campaign-graph.js';let src=read(path);
 src=replaceOnce(src,'const G={version:6,','const G={version:7,','graph version');
 src=replaceOnce(src,'"first_generation_formation","brown","he_red","he_orange"','"first_generation_formation","brown_formation","brown","low_mass_formation","he_red","intermediate_mass_formation","he_orange"','graph base branch formations');
 src=replaceOnce(src,'"stellar_li","fragile"','"stellar_li","giant_formation","fragile"','graph giant formation order');
 src=replaceOnce(src,'"spallation_be","spallation","carbon_burn"','"spallation_be","spallation","high_mass_formation","carbon_burn"','graph high formation order');
 src=replaceOnce(src,'"brown":["brown"],"red":["he_red"],"mid":["he_orange","he_yellow","coulomb_intro","stellar_convection","stellar_li","fragile","c","n","o"]','"brown":["brown_formation","brown"],"red":["low_mass_formation","he_red"],"mid":["intermediate_mass_formation","he_orange","he_yellow","coulomb_intro","stellar_convection","stellar_li","giant_formation","fragile","c","n","o"]','graph sequences low mid');
 src=replaceOnce(src,'"high":["carbon_burn"','"high":["high_mass_formation","carbon_burn"','graph high sequence');
 src=replaceOnce(src,'"brown":{"allOf":["first_generation_formation"]},"he_red":{"allOf":["first_generation_formation"]},"he_orange":{"allOf":["first_generation_formation"]},"carbon_burn":{"allOf":["first_generation_formation"]}','"brown_formation":{"allOf":["first_generation_formation"]},"brown":{"allOf":["brown_formation"]},"low_mass_formation":{"allOf":["first_generation_formation"]},"he_red":{"allOf":["low_mass_formation"]},"intermediate_mass_formation":{"allOf":["first_generation_formation"]},"he_orange":{"allOf":["intermediate_mass_formation"]},"high_mass_formation":{"allOf":["first_generation_formation"]},"carbon_burn":{"allOf":["high_mass_formation"]}','graph formation prerequisites');
 src=replaceOnce(src,'"stellar_li":{"allOf":["stellar_convection"]},"fragile"','"stellar_li":{"allOf":["stellar_convection"]},"giant_formation":{"allOf":["stellar_li"]},"fragile"','graph giant prerequisite');
 write(path,src);
}

// Giant fork: formation is the final precursor before choosing the giant route.
{
 const path='assets/js/campaign-giants.js';let src=read(path);
 src=replaceOnce(src,"const precursor='stellar_li';","const precursor='giant_formation';",'giant precursor');
 write(path,src);
}
{
 const path='assets/js/campaign-giants-map.js';let src=read(path);
 src=replaceOnce(src,"moveNodes(['he_orange','he_yellow','coulomb_intro','stellar_convection',S.precursor],precursorFlow);","moveNodes(['intermediate_mass_formation','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li',S.precursor],precursorFlow);",'giant map precursor flow');
 write(path,src);
}

// Generation semantics: all added stages are formation, not production.
{
 const path='assets/js/campaign-generations.js';let src=read(path);
 src=replaceOnce(src,"const formations=new Set(['first_generation_formation']);","const formations=new Set(['first_generation_formation','brown_formation','low_mass_formation','intermediate_mass_formation','giant_formation','high_mass_formation']);",'generation formation roles');
 write(path,src);
}

// Save migration: players already beyond a new gateway keep their progress.
{
 const path='assets/js/campaign-mode.js';let src=read(path);
 src=replaceOnce(src,'function defaults(){return{version:8,','function defaults(){return{version:9,','campaign defaults version');
 src=replaceOnce(src,'...x,version:8,completed,','...x,version:9,completed,','campaign normalized version');
 const anchor="if(previousVersion<8){const cutoff=G?.runtimeIndex?.first_generation_formation??Infinity,passed=[...seen].some(id=>Number.isInteger(G?.runtimeIndex?.[id])&&G.runtimeIndex[id]>=cutoff);if(passed)next.completed=uniq([...next.completed,'first_atomic_bonds','first_nebulae'])}";
 const migration=`${anchor}\n if(previousVersion<9){\n  const add=[];\n  if(['brown'].some(id=>seen.has(id)))add.push('brown_formation');\n  if(['he_red'].some(id=>seen.has(id)))add.push('low_mass_formation');\n  if(['he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o'].some(id=>seen.has(id)))add.push('intermediate_mass_formation');\n  if(['fragile','c','n','o','rb','sr','y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm','pb','bi'].some(id=>seen.has(id)))add.push('giant_formation');\n  if(['carbon_burn','ne','proton_capture','na','carbon_oxygen','mg','al','oxygen_burn','si','p','s','cl','ar','k','ca','sc','ti','v','cr','mn','cr_alpha_fe','fe','ni_fusion','co','neutronize','final_collapse'].some(id=>seen.has(id)))add.push('high_mass_formation');\n  if(add.length)next.completed=uniq([...next.completed,...add]);\n }`;
 src=replaceOnce(src,anchor,migration,'campaign v9 migration');
 write(path,src);
}

// Keep the stylesheet description aligned with the now-reusable mechanic.
{
 const path='assets/css/stellar-formation.css';let src=read(path);
 src=replaceOnce(src,'/* Stellar formation prototype — 18 H-H pairs + 1 isolated H assemble into a 37-cell stellar hexagon. */','/* Reusable stellar formation — H-H pairs assemble into 2–5-layer centered stellar hexagons; the final H enters automatically. */','formation CSS comment');
 write(path,src);
}

console.log('stellar formation family patch applied');
