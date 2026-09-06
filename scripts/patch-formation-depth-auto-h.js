const fs=require('fs');
const path='assets/js/ardua.js';
let src=fs.readFileSync(path,'utf8');
function replaceOnce(before,after,label){
  if(!src.includes(before))throw new Error(`Trecho não encontrado: ${label}`);
  src=src.replace(before,after);
}

replaceOnce(
"{id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 18 duplas de H e 1 H isolado em um hexágono de 4 camadas',new:'H',mode:'stellarFormation',target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'37 H',durationClass:'long'},",
"{id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 18 duplas de H; o último H completa automaticamente a vaga final',new:'H',mode:'stellarFormation',target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'37 H',durationClass:'long'},",
'fase formação');

replaceOnce(
"// Formation of the first stellar generation. Eighteen literal H-H pairs plus one\n// isolated H make 37 gameplay atoms. Their packing uses the same radius-3 hex\n// coordinates as the stellar board; each g-field abstracts a much larger gas cloud.\nconst STELLAR_FORMATION_PAIR_COUNT=18;\nconst STELLAR_FORMATION_TOTAL=STELLAR_FORMATION_PAIR_COUNT*2+1;\nconst STELLAR_FORMATION_INITIAL_GROUPS=STELLAR_FORMATION_PAIR_COUNT+1;",
"// Formation of the first stellar generation. Eighteen visible H-H pairs supply\n// 36 gameplay atoms. The 37th H stays hidden until one vacancy remains, then it\n// enters automatically. Each g-field abstracts a much larger gas cloud.\nconst STELLAR_FORMATION_PAIR_COUNT=18;\nconst STELLAR_FORMATION_VISIBLE_TOTAL=STELLAR_FORMATION_PAIR_COUNT*2;\nconst STELLAR_FORMATION_TOTAL=STELLAR_FORMATION_VISIBLE_TOTAL+1;\nconst STELLAR_FORMATION_INITIAL_GROUPS=STELLAR_FORMATION_PAIR_COUNT;",
'constantes formação');

replaceOnce(
"function stellarFormationSeedBondDistance(){return Math.max(39,Math.min(49,window.innerWidth*.097))}",
"function stellarFormationFiveLayerAtomSize(){return Math.max(36,Math.min(72,starSize()*.88/(2*4+1)))}\nfunction stellarFormationSeedBondDistance(){return stellarFormationFiveLayerAtomSize()}",
'escala de H');

replaceOnce(
"function stellarFormationRefreshCompatibility(f){if(!f)return;const selected=f.groups.get(f.selectedGroup),compatible=new Set();if(selected)for(const g of f.groups.values())if(g.id!==selected.id&&stellarFormationOverlap(selected,g))compatible.add(g.id);for(const g of f.groups.values()){g.fieldEl?.classList.toggle('selected',g.id===f.selectedGroup);g.fieldEl?.classList.toggle('compatible',compatible.has(g.id))}for(const a of f.atoms.values()){const el=a.el;el?.classList.toggle('selected',a.groupId===f.selectedGroup);el?.classList.toggle('compatible',compatible.has(a.groupId))}}",
"function stellarFormationRefreshCompatibility(f){\n if(!f)return;const selected=f.groups.get(f.selectedGroup),compatible=new Set();if(selected)for(const g of f.groups.values())if(g.id!==selected.id&&stellarFormationOverlap(selected,g))compatible.add(g.id);\n for(const g of f.groups.values()){const pair=g.members.length===2;g.fieldEl?.classList.toggle('formation-pair',pair);g.fieldEl?.classList.toggle('formation-cluster',!pair);g.fieldEl?.classList.toggle('selected',g.id===f.selectedGroup);g.fieldEl?.classList.toggle('compatible',compatible.has(g.id))}\n for(const a of f.atoms.values()){const el=a.el,g=f.groups.get(a.groupId),pair=g?.members.length===2;el?.classList.toggle('formation-pair',!!pair);el?.classList.toggle('formation-cluster',!pair);el?.classList.toggle('selected',a.groupId===f.selectedGroup);el?.classList.toggle('compatible',compatible.has(a.groupId))}\n}",
'profundidade visual');

replaceOnce(
"function stellarFormationMerge(a,b){",
"function stellarFormationAutoComplete(f,g){\n if(!f||f.complete||f.stabilizing||g.members.length!==STELLAR_FORMATION_VISIBLE_TOTAL)return;\n f.stabilizing=true;f.selectedGroup=null;g.vx=0;g.vy=0;g.omega=0;g.angle=0;const targets=stellarFormationLayout(STELLAR_FORMATION_TOTAL);\n g.members.forEach((aid,i)=>{const atom=f.atoms.get(aid);if(!atom)return;atom.fromLocal={x:(atom.x??g.x)-g.x,y:(atom.y??g.y)-g.y};atom.toLocal={x:targets[i].x,y:targets[i].y}});\n const target=targets[STELLAR_FORMATION_TOTAL-1],id=f.nextAtomId++,atom={id,sym:'H',groupId:g.id,x:g.x+target.x,y:g.y+target.y,toLocal:{x:target.x,y:target.y},fromLocal:null,el:null},el=document.createElement('button');\n el.type='button';el.className='formation-atom formation-cluster formation-auto-h';el.dataset.formationAtom=String(id);el.style.background=elementStyle('H');el.textContent=stellarFormationElementLabel('H');el.setAttribute('aria-label','Hidrogênio que completa automaticamente o hexágono');atom.el=el;f.atomsLayer.appendChild(el);f.atoms.set(id,atom);g.members.push(id);g.reorgStart=performance.now();stellarFormationRefreshCompatibility(f);stellarFormationUpdateHud(f);tone(410,.16,'triangle',.032);vibrate(8);\n setTimeout(()=>{const cur=state.stellarFormation;if(cur!==f||!f.groups.has(g.id))return;g.reorgStart=0;for(const aid of g.members){const a=f.atoms.get(aid);if(a)a.fromLocal=null}tone(220,.28,'triangle',.032);\n  setTimeout(()=>{const latest=state.stellarFormation;if(latest!==f||!f.groups.has(g.id))return;g.x=starSize()/2;g.y=starSize()/2;g.angle=0;f.stabilizing=false;f.complete=true;f.layer.classList.add('complete');dom.star.classList.add('formation-stabilized');stellarFormationUpdateHud(f);tone(330,.40,'sine',.025);checkComplete()},960);\n },620);\n}\nfunction stellarFormationMerge(a,b){",
'auto H helper');

replaceOnce(
" if(mass===STELLAR_FORMATION_TOTAL){\n  g.vx=0;g.vy=0;\n  setTimeout(()=>{const cur=state.stellarFormation;if(cur!==f||!f.groups.has(newId))return;f.stabilizing=true;g.reorgStart=0;for(const aid of g.members){const atom=f.atoms.get(aid);atom.fromLocal=null}tone(220,.28,'triangle',.032);\n   setTimeout(()=>{const latest=state.stellarFormation;if(latest!==f||!f.groups.has(newId))return;g.x=starSize()/2;g.y=starSize()/2;g.angle=0;f.stabilizing=false;f.complete=true;f.layer.classList.add('complete');dom.star.classList.add('formation-stabilized');stellarFormationUpdateHud(f);tone(330,.40,'sine',.025);checkComplete()},960);\n  },620);\n }",
" if(mass===STELLAR_FORMATION_VISIBLE_TOTAL)stellarFormationAutoComplete(f,g);",
'conclusão automática');

const startBefore=`function startStellarFormationStage(){
 removeStellarFormation();
 const size=starSize(),layer=document.createElement('div'),fields=document.createElement('div'),atomsLayer=document.createElement('div');
 layer.className='stellar-formation-layer';layer.setAttribute('aria-label','18 duplas de Hidrogênio e 1 átomo isolado em formação estelar');fields.className='formation-fields';atomsLayer.className='formation-atoms';layer.append(fields,atomsLayer);dom.star.appendChild(layer);dom.star.classList.add('stellar-formation-mode');
 const f={layer,fields,atomsLayer,atoms:new Map(),groups:new Map(),selectedGroup:null,nextGroupId:STELLAR_FORMATION_INITIAL_GROUPS+1,raf:0,lastTime:performance.now(),compatibilityAt:0,stabilizing:false,complete:false,size};state.stellarFormation=f;
 const seedCounts=[...Array(STELLAR_FORMATION_PAIR_COUNT).fill(2),1].sort(()=>Math.random()-.5),points=[];let atomId=1;
 seedCounts.forEach((count,i)=>{const gid=i+1,pt=stellarFormationRandomPoint(points,size);points.push(pt);const driftAngle=Math.random()*Math.PI*2,drift=.018+Math.random()*.025,angle=Math.random()*Math.PI*2,local=stellarFormationSeedLayout(count),g={id:gid,members:[],x:pt.x,y:pt.y,vx:Math.cos(driftAngle)*drift,vy:Math.sin(driftAngle)*drift,angle,omega:(i%2?1:-1)*(.00022+Math.random()*.00018),reorgStart:0,fieldEl:null},ca=Math.cos(angle),sa=Math.sin(angle);
   local.forEach(offset=>{const id=atomId++,x=pt.x+offset.x*ca-offset.y*sa,y=pt.y+offset.x*sa+offset.y*ca,atom={id,sym:'H',groupId:gid,x,y,toLocal:{...offset},fromLocal:null,el:null},el=document.createElement('button');el.type='button';el.className='formation-atom';el.dataset.formationAtom=String(id);el.style.background=elementStyle('H');el.textContent=stellarFormationElementLabel('H');el.setAttribute('aria-label',count===2?'Hidrogênio em dupla H₂':'Hidrogênio isolado');el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();stellarFormationSelectAtom(id)});atom.el=el;atomsLayer.appendChild(el);f.atoms.set(id,atom);g.members.push(id)});
   f.groups.set(g.id,g);stellarFormationMakeField(f,g)
 });
 stellarFormationUpdateHud(f);stellarFormationRefreshCompatibility(f);f.raf=requestAnimationFrame(t=>stellarFormationRenderFrame(f,t));
}`;
const startAfter=`function startStellarFormationStage(){
 removeStellarFormation();
 const size=starSize(),layer=document.createElement('div'),fields=document.createElement('div'),atomsLayer=document.createElement('div');
 layer.className='stellar-formation-layer';layer.setAttribute('aria-label','18 duplas de Hidrogênio em formação estelar');layer.style.setProperty('--formationAtomSize',stellarFormationFiveLayerAtomSize()+'px');fields.className='formation-fields';atomsLayer.className='formation-atoms';layer.append(fields,atomsLayer);dom.star.appendChild(layer);dom.star.classList.add('stellar-formation-mode');
 const f={layer,fields,atomsLayer,atoms:new Map(),groups:new Map(),selectedGroup:null,nextGroupId:STELLAR_FORMATION_INITIAL_GROUPS+1,nextAtomId:STELLAR_FORMATION_VISIBLE_TOTAL+1,raf:0,lastTime:performance.now(),compatibilityAt:0,stabilizing:false,complete:false,size};state.stellarFormation=f;
 const seedCounts=[...Array(STELLAR_FORMATION_PAIR_COUNT).fill(2)],points=[];let atomId=1;
 seedCounts.forEach((count,i)=>{const gid=i+1,pt=stellarFormationRandomPoint(points,size);points.push(pt);const driftAngle=Math.random()*Math.PI*2,drift=.018+Math.random()*.025,angle=Math.random()*Math.PI*2,local=stellarFormationSeedLayout(count),g={id:gid,members:[],x:pt.x,y:pt.y,vx:Math.cos(driftAngle)*drift,vy:Math.sin(driftAngle)*drift,angle,omega:(i%2?1:-1)*(.00022+Math.random()*.00018),reorgStart:0,fieldEl:null},ca=Math.cos(angle),sa=Math.sin(angle);
   local.forEach(offset=>{const id=atomId++,x=pt.x+offset.x*ca-offset.y*sa,y=pt.y+offset.x*sa+offset.y*ca,atom={id,sym:'H',groupId:gid,x,y,toLocal:{...offset},fromLocal:null,el:null},el=document.createElement('button');el.type='button';el.className='formation-atom formation-pair';el.dataset.formationAtom=String(id);el.style.background=elementStyle('H');el.textContent=stellarFormationElementLabel('H');el.setAttribute('aria-label','Hidrogênio em dupla H₂');el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();stellarFormationSelectAtom(id)});atom.el=el;atomsLayer.appendChild(el);f.atoms.set(id,atom);g.members.push(id)});
   f.groups.set(g.id,g);stellarFormationMakeField(f,g)
 });
 stellarFormationUpdateHud(f);stellarFormationRefreshCompatibility(f);f.raf=requestAnimationFrame(t=>stellarFormationRenderFrame(f,t));
}`;
replaceOnce(startBefore,startAfter,'inicialização das 18 duplas');

replaceOnce(
"function resizeStellarFormation(){const f=state.stellarFormation;if(!f)return;const next=starSize(),ratio=next/Math.max(1,f.size||next);for(const g of f.groups.values()){g.x*=ratio;g.y*=ratio}f.size=next;f.lastTime=performance.now()}",
"function resizeStellarFormation(){const f=state.stellarFormation;if(!f)return;const next=starSize(),ratio=next/Math.max(1,f.size||next);for(const g of f.groups.values()){g.x*=ratio;g.y*=ratio}f.size=next;f.layer?.style.setProperty('--formationAtomSize',stellarFormationFiveLayerAtomSize()+'px');f.lastTime=performance.now()}",
'resize formação');

replaceOnce(
"if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna 18 duplas de H + 1 H — maior aglomerado ${largest}/${STELLAR_FORMATION_TOTAL}`;setFormula('Una duplas e aglomerados quando seus campos g se sobrepuserem');return}",
"if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna as 18 duplas de H — maior aglomerado ${Math.min(largest,STELLAR_FORMATION_VISIBLE_TOTAL)}/${STELLAR_FORMATION_VISIBLE_TOTAL}`;setFormula('O último H permanece oculto e completa automaticamente a vaga final');return}",
'objetivo formação');

replaceOnce(
"if(s.mode==='stellarFormation')return '18 duplas de H + 1 H → hexágono de 37 H → estrela';",
"if(s.mode==='stellarFormation')return '18 duplas de H → 1 vaga final → H automático → hexágono de 37 H';",
'modal primário');
replaceOnce(
"if(s.mode==='stellarFormation')return 'Selecione duas duplas, aglomerados ou o H isolado quando seus campos g se sobrepuserem. Cada união reorganiza todos os H na forma mais próxima de um hexágono.';",
"if(s.mode==='stellarFormation')return 'Selecione duplas e aglomerados quando seus campos g se sobrepuserem. As duplas vagam à frente dos hexágonos em formação; ao restar uma vaga, o H final entra automaticamente.';",
'modal secundário');

fs.writeFileSync(path,src);
