const fs=require('fs');

const enginePath='assets/js/ardua.js';
const cssPath='assets/css/stellar-formation.css';
let src=fs.readFileSync(enginePath,'utf8');
let css=fs.readFileSync(cssPath,'utf8');

function once(oldText,newText,label){
  const count=src.split(oldText).length-1;
  if(count!==1)throw new Error(`${label}: esperado 1 match, encontrado ${count}`);
  src=src.replace(oldText,newText);
}
function replacePhase(id,{pairs,layers,target,menuTag}){
  const re=new RegExp(`^ \\{id:'${id}'[^\\n]*$`,'m');
  const match=src.match(re)?.[0];
  if(!match)throw new Error(`fase ausente: ${id}`);
  const next=match
    .replace(/meta:'Reúna \d+ duplas de H; o último H completa automaticamente a vaga final'/,`meta:'Reúna ${pairs} duplas de H; o último H completa automaticamente a vaga final'`)
    .replace(/formationLayers:\d+,target:\d+/,`formationLayers:${layers},target:${target}`)
    .replace(/menuTag:'\d+ H'/,`menuTag:'${menuTag} H'`);
  if(next===match)throw new Error(`fase sem alteração: ${id}`);
  src=src.replace(match,next);
}

// Nas novas trilhas, “camadas” são anéis externos e o núcleo central fica fora da contagem.
// Primeira Geração e Anã Marrom preservam a geometria legada já aprovada.
replacePhase('low_mass_formation',{pairs:9,layers:2,target:19,menuTag:19});
replacePhase('intermediate_mass_formation',{pairs:18,layers:3,target:37,menuTag:37});
replacePhase('giant_formation',{pairs:30,layers:4,target:61,menuTag:61});
replacePhase('high_mass_formation',{pairs:45,layers:5,target:91,menuTag:91});

const oldSpec=[
  'function stellarFormationSpec(s=phase()){',
  ' const layers=Math.max(2,Math.min(5,Number(s?.formationLayers||4))),radius=layers-1,total=1+3*radius*(radius+1),visibleTotal=total-1,pairCount=visibleTotal/2;',
  ' return{layers,radius,total,visibleTotal,pairCount,initialGroups:pairCount};',
  '}'
].join('\n');
const newSpec=[
  'function stellarFormationSpec(s=phase()){',
  " const layers=Math.max(2,Math.min(5,Number(s?.formationLayers||4))),layersOutsideCore=!['first_generation_formation','brown_formation'].includes(s?.id),radius=layersOutsideCore?layers:layers-1,total=1+3*radius*(radius+1),visibleTotal=total-1,pairCount=visibleTotal/2;",
  ' return{layers,layersOutsideCore,radius,total,visibleTotal,pairCount,initialGroups:pairCount};',
  '}',
  "function stellarFormationLayerDescription(spec=stellarFormationSpec()){return spec.layersOutsideCore?'núcleo + '+spec.layers+' camadas':spec.layers+' camadas'}"
].join('\n');
once(oldSpec,newSpec,'camadas externas ao núcleo');

once(
  "function removeStellarFormation(){const f=state.stellarFormation;if(!f)return;if(f.raf)cancelAnimationFrame(f.raf);f.layer?.remove();state.stellarFormation=null;dom.star.classList.remove('stellar-formation-mode','formation-materializing','formation-birth-flash','formation-stabilized')}",
  "function removeStellarFormation(){const f=state.stellarFormation;if(f?.raf)cancelAnimationFrame(f.raf);f?.layer?.remove();state.stellarFormation=null;dom.star.parentElement?.classList.remove('formation-ready-shell');dom.star.classList.remove('stellar-formation-mode','formation-materializing','formation-birth-flash','formation-stabilized')}",
  'cleanup shell de formação'
);

once(
  "layer.className='stellar-formation-layer';layer.setAttribute('aria-label',`${spec.pairCount} duplas de Hidrogênio formando um hexágono de ${spec.layers} camadas`);layer.style.setProperty('--formationAtomSize',stellarFormationAtomSize(spec)+'px');",
  "layer.className='stellar-formation-layer';layer.setAttribute('aria-label',`${spec.pairCount} duplas de Hidrogênio formando um hexágono com ${stellarFormationLayerDescription(spec)}`);layer.style.setProperty('--formationAtomSize',stellarFormationAtomSize(spec)+'px');",
  'aria da formação'
);

once(
  "state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);",
  "state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;if(s.mode==='stellarFormation')dom.star.parentElement?.classList.add('formation-ready-shell');save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);",
  'botão externo ao hexágono'
);

once(
  "if(s.mode==='stellarFormation'){const spec=stellarFormationSpec(s);announce('MATÉRIA REUNIDA',s.id==='first_generation_formation'?'PRIMEIRA GERAÇÃO PRONTA':'FORMAÇÃO CONCLUÍDA',`Os ${spec.total} átomos de Hidrogênio formam um hexágono de ${spec.layers} camadas.`);}",
  "if(s.mode==='stellarFormation'){const spec=stellarFormationSpec(s);announce('MATÉRIA REUNIDA',s.id==='first_generation_formation'?'PRIMEIRA GERAÇÃO PRONTA':'FORMAÇÃO CONCLUÍDA',`Os ${spec.total} átomos de Hidrogênio formam um hexágono com ${stellarFormationLayerDescription(spec)}.`);}",
  'anúncio das camadas'
);

fs.writeFileSync(enginePath,src);

const marker='/* Formation completion action stays outside the finished hexagon. */';
if(!css.includes(marker)){
  css += '\n\n'+[
    marker,
    '.star-shell.formation-ready-shell{min-height:calc(var(--starSize) + 70px);align-items:flex-start}',
    '.star-board.stellar-formation-mode.formation-stabilized{overflow:visible}',
    '.star-board.stellar-formation-mode.formation-stabilized .center-action.stage-end{top:auto;bottom:-58px;width:min(78%,300px);height:48px;border-radius:999px;padding:8px 18px;transform:translate(-50%,0) scale(.94)}',
    '.star-board.stellar-formation-mode.formation-stabilized .center-action.stage-end.show{transform:translate(-50%,0) scale(1)}'
  ].join('\n')+'\n';
}
fs.writeFileSync(cssPath,css);
console.log('formation rings outside core patched');
