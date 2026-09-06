const fs=require('fs');
const jsPath='assets/js/ardua.js';
const cssPath='assets/css/stellar-formation.css';
let js=fs.readFileSync(jsPath,'utf8');
let css=fs.readFileSync(cssPath,'utf8');
function rep(text,oldText,newText,label){
  if(!text.includes(oldText))throw new Error('Missing '+label);
  return text.replace(oldText,newText);
}

js=rep(js,
"{id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 61 átomos primordiais em um único aglomerado',new:'H',mode:'stellarFormation',target:61,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'61 ÁTOMOS',durationClass:'long'},",
"{id:'first_generation_formation',branch:'Nascimento estelar · Primeira Geração',title:'Formação da Primeira Geração',meta:'Reúna 18 duplas de H e 1 H isolado em um hexágono de 4 camadas',new:'H',mode:'stellarFormation',target:37,visual:'nebula',fill:0,endEvent:'stellarBirth',endLabel:'NASCE UMA<br>NOVA ESTRELA',menuTag:'37 H',durationClass:'long'},",
'formation phase definition');

js=rep(js,"if(s.mode==='stellarFormation')return 4;","if(s.mode==='stellarFormation')return 3;",'formation radius');
js=rep(js,"if(s.mode==='stellarFormation')return {r:4,factor:.94,max:540};","if(s.mode==='stellarFormation')return {r:3,factor:.94,max:540};",'formation geometry');

js=rep(js,"if(s.mode==='stellarFormation')$('stageProgressText').textContent=`${formationLargest}/61`;","if(s.mode==='stellarFormation')$('stageProgressText').textContent=`${formationLargest}/${STELLAR_FORMATION_TOTAL}`;",'formation progress text');
js=rep(js,
"if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna os 61 átomos primordiais — maior aglomerado ${largest}/61`;setFormula('Una dois grupos somente quando seus campos g se sobrepuserem');return}",
"if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=`Reúna 18 duplas de H + 1 H — maior aglomerado ${largest}/${STELLAR_FORMATION_TOTAL}`;setFormula('Una duplas e aglomerados quando seus campos g se sobrepuserem');return}",
'formation objective');

js=rep(js,
"// Formation of a stellar generation. The 61 literal gameplay atoms are a\n// representative sample; their hexagonal packing is the game's board language,\n// while the g-field abstracts the collective gravity of a much larger gas cloud.\nconst STELLAR_FORMATION_TOTAL=61;\nconst STELLAR_FORMATION_COMPOSITION=Object.freeze([...Array(54).fill('H'),...Array(5).fill('He'),'D','Li']);",
"// Formation of the first stellar generation. Eighteen literal H-H pairs plus one\n// isolated H make 37 gameplay atoms. Their packing uses the same radius-3 hex\n// coordinates as the stellar board; each g-field abstracts a much larger gas cloud.\nconst STELLAR_FORMATION_PAIR_COUNT=18;\nconst STELLAR_FORMATION_TOTAL=STELLAR_FORMATION_PAIR_COUNT*2+1;\nconst STELLAR_FORMATION_INITIAL_GROUPS=STELLAR_FORMATION_PAIR_COUNT+1;",
'formation constants');

js=rep(js,"for(let ring=1;ring<=4;ring++){","for(let ring=1;ring<=3;ring++){",'formation cell rings');

js=rep(js,
"function stellarFormationLayout(n){\n const scale=cellSize()*.58,ids=stellarFormationCells().slice(0,Math.max(1,Math.min(STELLAR_FORMATION_TOTAL,n))),pts=ids.map(i=>{const c=coords[i];return{x:scale*Math.sqrt(3)*(c.q+c.r/2),y:scale*1.5*c.r,cell:i}}),cx=pts.reduce((a,p)=>a+p.x,0)/pts.length,cy=pts.reduce((a,p)=>a+p.y,0)/pts.length;return pts.map(p=>({x:p.x-cx,y:p.y-cy,cell:p.cell}));\n}",
"function stellarFormationLayout(n){\n const scale=cellSize()*.58,ids=stellarFormationCells().slice(0,Math.max(1,Math.min(STELLAR_FORMATION_TOTAL,n))),pts=ids.map(i=>{const c=coords[i];return{x:scale*Math.sqrt(3)*(c.q+c.r/2),y:scale*1.5*c.r,cell:i}}),cx=pts.reduce((a,p)=>a+p.x,0)/pts.length,cy=pts.reduce((a,p)=>a+p.y,0)/pts.length;return pts.map(p=>({x:p.x-cx,y:p.y-cy,cell:p.cell}));\n}\nfunction stellarFormationSeedBondDistance(){return Math.max(30,Math.min(42,window.innerWidth*.08))}\nfunction stellarFormationSeedLayout(count){if(count<=1)return[{x:0,y:0}];const d=stellarFormationSeedBondDistance();return[{x:-d/2,y:0},{x:d/2,y:0}]}\n",
'formation seed layout');

js=rep(js,
"   setTimeout(()=>{const latest=state.stellarFormation;if(latest!==f||!f.groups.has(newId))return;g.angle=0;f.stabilizing=false;f.complete=true;f.layer.classList.add('complete');dom.star.classList.add('formation-stabilized');stellarFormationUpdateHud(f);tone(330,.40,'sine',.025);checkComplete()},960);",
"   setTimeout(()=>{const latest=state.stellarFormation;if(latest!==f||!f.groups.has(newId))return;g.x=starSize()/2;g.y=starSize()/2;g.angle=0;f.stabilizing=false;f.complete=true;f.layer.classList.add('complete');dom.star.classList.add('formation-stabilized');stellarFormationUpdateHud(f);tone(330,.40,'sine',.025);checkComplete()},960);",
'exact final centering');

js=rep(js,
" const center=size/2,pad=Math.max(32,size*.075),maxR=Math.max(30,center-pad),minGap=Math.max(22,Math.min(28,size*.06));",
" const center=size/2,pad=Math.max(32,size*.075),maxR=Math.max(30,center-pad),minGap=Math.max(42,Math.min(64,size*.12));",
'formation seed spacing');
js=rep(js,
" const angle=existing.length*2.399963229728653,radius=maxR*Math.sqrt((existing.length+.5)/STELLAR_FORMATION_TOTAL);",
" const angle=existing.length*2.399963229728653,radius=maxR*Math.sqrt((existing.length+.5)/STELLAR_FORMATION_INITIAL_GROUPS);",
'formation fallback spacing');

const oldStart=`function startStellarFormationStage(){
 removeStellarFormation();
 const size=starSize(),layer=document.createElement('div'),fields=document.createElement('div'),atomsLayer=document.createElement('div');
 layer.className='stellar-formation-layer';layer.setAttribute('aria-label','61 átomos primordiais em formação estelar');fields.className='formation-fields';atomsLayer.className='formation-atoms';layer.append(fields,atomsLayer);dom.star.appendChild(layer);dom.star.classList.add('stellar-formation-mode');
 const f={layer,fields,atomsLayer,atoms:new Map(),groups:new Map(),selectedGroup:null,nextGroupId:STELLAR_FORMATION_TOTAL+1,raf:0,lastTime:performance.now(),compatibilityAt:0,stabilizing:false,complete:false,size};state.stellarFormation=f;
 const composition=[...STELLAR_FORMATION_COMPOSITION].sort(()=>Math.random()-.5),points=[];
 composition.forEach((sym,i)=>{const pt=stellarFormationRandomPoint(points,size);points.push(pt);const driftAngle=Math.random()*Math.PI*2,drift=.018+Math.random()*.025,atom={id:i+1,sym,groupId:i+1,x:pt.x,y:pt.y,toLocal:{x:0,y:0},fromLocal:null,el:null},g={id:i+1,members:[i+1],x:pt.x,y:pt.y,vx:Math.cos(driftAngle)*drift,vy:Math.sin(driftAngle)*drift,angle:Math.random()*Math.PI*2,omega:(i%2?1:-1)*(.00022+Math.random()*.00018),reorgStart:0,fieldEl:null},el=document.createElement('button');el.type='button';el.className='formation-atom';el.dataset.formationAtom=String(atom.id);el.style.background=elementStyle(sym);el.textContent=stellarFormationElementLabel(sym);el.setAttribute('aria-label',\`Átomo de \${E[sym]?.name||sym}\`);el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();stellarFormationSelectAtom(atom.id)});atom.el=el;atomsLayer.appendChild(el);f.atoms.set(atom.id,atom);f.groups.set(g.id,g);stellarFormationMakeField(f,g)});
 stellarFormationUpdateHud(f);stellarFormationRefreshCompatibility(f);f.raf=requestAnimationFrame(t=>stellarFormationRenderFrame(f,t));
}`;
const newStart=`function startStellarFormationStage(){
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
js=rep(js,oldStart,newStart,'formation seeded pairs');

js=rep(js,"if(s.mode==='stellarFormation')return '61 átomos primordiais → aglomerados → estrela';","if(s.mode==='stellarFormation')return '18 duplas de H + 1 H → hexágono de 37 H → estrela';",'formation modal primary');
js=rep(js,
"if(s.mode==='stellarFormation')return 'Selecione dois átomos ou grupos quando seus campos g se sobrepuserem. Cada união reorganiza todos os membros em uma estrutura hexagonal maior.';",
"if(s.mode==='stellarFormation')return 'Selecione duas duplas, aglomerados ou o H isolado quando seus campos g se sobrepuserem. Cada união reorganiza todos os H na forma mais próxima de um hexágono.';",
'formation modal secondary');
js=rep(js,
"if(s.mode==='stellarFormation')announce('MATÉRIA REUNIDA','PRIMEIRA GERAÇÃO PRONTA','Os 61 átomos formam um único aglomerado. Faça nascer a nova estrela.');",
"if(s.mode==='stellarFormation')announce('MATÉRIA REUNIDA','PRIMEIRA GERAÇÃO PRONTA','Os 37 átomos de Hidrogênio formam um hexágono de 4 camadas. Faça nascer a nova estrela.');",
'formation completion announcement');

css=rep(css,
"/* Stellar formation prototype — 61 representative primordial atoms assemble into the future stellar board. */",
"/* Stellar formation prototype — 18 H-H pairs + 1 isolated H assemble into a 37-cell stellar hexagon. */",
'formation css comment');
css=rep(css,
".formation-atom{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;padding:0;border:1px solid rgba(255,255,255,.42);border-radius:50%;display:grid;place-items:center;color:#06111c;font:800 7px/1 Inter,system-ui,sans-serif;box-shadow:inset -5px -6px 9px rgba(0,0,0,.24),0 0 9px rgba(190,232,255,.16);pointer-events:auto;cursor:pointer;touch-action:manipulation;transition:box-shadow .16s ease,filter .16s ease,opacity .45s ease;z-index:4}",
".formation-atom{position:absolute;width:clamp(30px,8vw,42px);height:clamp(30px,8vw,42px);margin:0;padding:0;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.42);border-radius:50%;display:grid;place-items:center;color:#06111c;font:800 7px/1 Inter,system-ui,sans-serif;box-shadow:inset -5px -6px 9px rgba(0,0,0,.24),0 0 9px rgba(190,232,255,.16);pointer-events:auto;cursor:pointer;touch-action:manipulation;transition:width .55s ease,height .55s ease,box-shadow .16s ease,filter .16s ease,opacity .45s ease;z-index:4}",
'formation atom scale');
css=rep(css,
".stellar-formation-layer.complete .formation-atom{box-shadow:inset -5px -6px 9px rgba(0,0,0,.22),0 0 8px rgba(255,255,255,.42)}",
".stellar-formation-layer.complete .formation-atom{width:var(--cellSize);height:var(--cellSize);font-size:calc(var(--cellSize)*.18);box-shadow:inset -5px -6px 9px rgba(0,0,0,.22),0 0 8px rgba(255,255,255,.42)}",
'formation final atom scale');
css=rep(css,
"@media(max-width:520px){.formation-atom{width:19px;height:19px;margin:-9.5px 0 0 -9.5px;font-size:6px}}",
"@media(max-width:520px){.formation-atom{font-size:7px}}",
'formation responsive atom scale');

fs.writeFileSync(jsPath,js);
fs.writeFileSync(cssPath,css);
