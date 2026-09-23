/* Ardua — Quasar gameplay: orbital gas interactions feed a luminous accretion disk. */
(()=>{
'use strict';
const Q=window.ARDUA_QUASAR,C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
if(!Q||!C||!G)return;
const $=id=>document.getElementById(id);
const board=$('starBoard'),phaseMenu=$('phaseMenu'),phaseEnd=$('phaseEndBtn'),menuModal=$('menuModal');
if(!board||!phaseMenu||!phaseEnd)return;
let layer=null,selected=null,created=0,complete=false,launching=false,drag=null,suppressClickUntil=0;
const RECIPE_NAME=Q.recipe;
const RECIPE_SYMBOL='m₁ + m₂ → mₐcc + hν';

function menuButton(){return phaseMenu.querySelector('.phase-jump[data-quasar-phase]')}
function syncButtonState(){
 const b=menuButton();if(!b)return;
 const open=C.isUnlocked(Q.id),current=C.getState().activeId===Q.id;b.disabled=!open;b.classList.toggle('locked',!open);b.classList.toggle('available',open);
 b.classList.toggle('current',current);if(current)phaseMenu.querySelectorAll('.phase-jump.current').forEach(x=>{if(x!==b)x.classList.remove('current')});
}
function makeMenuButton(){
 let b=menuButton();if(b)return b;
 phaseMenu.querySelector('[data-quasar-family]')?.remove();
 b=document.createElement('button');b.type='button';b.className='phase-jump';b.dataset.quasarPhase='true';b.dataset.phaseId=Q.id;
 b.innerHTML=`<span class="idx">${G.runtimeOrder.indexOf(Q.id)+1}</span><span><strong>${Q.title}</strong><small>${Q.branch}</small></span><span class="new">AGN</span>`;
 const family=document.createElement('div');family.className='phase-family';family.dataset.quasarFamily='true';family.textContent='Núcleos galácticos';
 b.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();
  if(!C.isUnlocked(Q.id))return;
  menuModal?.classList.remove('show');C.setActive(Q.id);launch();
 });
 phaseMenu.append(family,b);syncButtonState();return b;
}
function ensureMenuButton(){if(!menuButton())makeMenuButton();else syncButtonState()}

function setText(id,text){const el=$(id);if(el)el.textContent=text}
function renderRecipe(name=RECIPE_NAME,symbol=RECIPE_SYMBOL){
 const el=$('formulaText');if(!el)return;const a=el.querySelector('.recipe-name-line'),b=el.querySelector('.recipe-symbol-line');if(a?.textContent===name&&b?.textContent===symbol)return;
 el.innerHTML=`<span class="recipe-name-line">${name}</span><span class="recipe-symbol-line">${symbol}</span>`;
}
function showProgress(){const progress=$('stageProgress')?.closest('.stage-progress');if(!progress)return;if(progress.hidden)progress.hidden=false;if(progress.style.visibility!=='visible')progress.style.visibility='visible';if(progress.style.display==='none')progress.style.display='';if(progress.getAttribute('aria-hidden')==='true')progress.removeAttribute('aria-hidden')}
function updateProgress(){
 const ratio=Math.min(1,created/Q.target),pct=Math.round(ratio*100);showProgress();
 setText('goalText',complete?`Quasar ativo — ${Q.target}/${Q.target}`:`Crie ${Q.target} unidades de Gás em Acreção — ${created}/${Q.target}`);
 setText('stageProgressText',`${created}/${Q.target}`);
 const bar=$('stageProgress');if(bar)bar.style.width=`${pct}%`;
 if(layer)layer.style.setProperty('--quasar-power',String(ratio));
}
function setInfo(){
 setText('infoZ','AGN');setText('infoSymbol','Q');setText('infoName','Quasar');setText('infoMass','buraco negro supermassivo · acreção');
 setText('infoContext','Selecione duas parcelas de gás em órbitas vizinhas');
 setText('infoFact','A matéria perde momento angular no disco, migra para dentro e converte energia gravitacional em calor e radiação.');
 const recipes=$('infoRecipes');if(recipes)recipes.innerHTML=`<span>${Q.recipe}</span>`;
}
function resetChrome(){
 setText('branchLabel',Q.branch);setText('phaseTitle',Q.title);setText('phaseMeta','Acreção gravitacional · radiação extrema');
 setText('goalText',`Crie ${Q.target} unidades de Gás em Acreção — 0/${Q.target}`);renderRecipe();showProgress();
 setText('stageProgressLabel','ACREÇÃO');setText('stageProgressText',`0/${Q.target}`);
 const bar=$('stageProgress');if(bar)bar.style.width='0%';setInfo();
 phaseEnd.innerHTML='ENCERRAR<br>QUASAR';phaseEnd.hidden=true;phaseEnd.style.display='none';
}
function positions(){
 return [
  [50,8],[57,11],[78,23],[82,30],[91,50],[87,57],
  [76,78],[69,83],[46,91],[39,87],[16,72],[12,64]
 ];
}
function buildLayer(){
 layer?.remove();layer=document.createElement('div');layer.className='quasar-layer';layer.setAttribute('aria-label','Disco de acreção de um quasar');
 layer.innerHTML=`
  <div class="quasar-galaxy" aria-hidden="true"></div>
  <div class="quasar-jet jet-top" aria-hidden="true"></div><div class="quasar-jet jet-bottom" aria-hidden="true"></div>
  <div class="quasar-disk disk-outer" aria-hidden="true"></div><div class="quasar-disk disk-inner" aria-hidden="true"></div>
  <div class="quasar-hole" aria-hidden="true"></div><div class="quasar-photon-ring" aria-hidden="true"></div>
  <div class="quasar-gas-field"></div><div class="quasar-products" aria-hidden="true"></div>`;
 const field=layer.querySelector('.quasar-gas-field'),pts=positions();
 pts.forEach(([x,y],i)=>{
  const b=document.createElement('button');b.type='button';b.className='quasar-gas';b.dataset.gasIndex=String(i);b.dataset.pair=String(Math.floor(i/2));
  b.style.left=`${x}%`;b.style.top=`${y}%`;b.setAttribute('aria-label',`Gás orbital ${i+1}`);b.innerHTML='<span></span>';
  b.addEventListener('pointerdown',ev=>armGasDrag(b,ev));b.addEventListener('click',onGasClick);field.appendChild(b);
 });
 board.appendChild(layer);
}
function invalidPair(a,b){
 b.classList.add('invalid');setText('phaseMeta','Escolha duas parcelas em órbitas vizinhas');
 setTimeout(()=>{b.classList.remove('invalid');if(!complete)setText('phaseMeta','Acreção gravitacional · radiação extrema')},520);
}
function onGasClick(e){
 e.preventDefault();e.stopPropagation();if(complete||performance.now()<suppressClickUntil)return;
 const b=e.currentTarget;if(b.classList.contains('spent')||b.classList.contains('reacting'))return;
 if(!selected){selected=b;b.classList.add('selected');return}
 if(selected===b){b.classList.remove('selected');selected=null;return}
 if(selected.dataset.pair!==b.dataset.pair){invalidPair(selected,b);return}
 const a=selected;selected=null;a.classList.remove('selected');react(a,b);
}
function gasPointerPoint(ev){const field=layer?.querySelector('.quasar-gas-field'),r=field?.getBoundingClientRect();if(!r)return null;return{x:Math.max(0,Math.min(r.width,ev.clientX-r.left)),y:Math.max(0,Math.min(r.height,ev.clientY-r.top)),width:r.width,height:r.height}}
function gasDragTarget(source,ev){const target=layer?.querySelector(`.quasar-gas[data-pair="${source.dataset.pair}"]:not([data-gas-index="${source.dataset.gasIndex}"])`);if(!target||target.classList.contains('spent')||target.classList.contains('reacting'))return null;const r=target.getBoundingClientRect(),dist=Math.hypot(ev.clientX-(r.left+r.width/2),ev.clientY-(r.top+r.height/2));return dist<=Math.max(44,r.width*1.6)?target:null}
function clearGasDragTarget(){layer?.querySelectorAll('.quasar-gas.drag-target').forEach(el=>el.classList.remove('drag-target'))}
function armGasDrag(source,ev){if(complete||source.classList.contains('spent')||source.classList.contains('reacting')||ev.pointerType==='mouse'&&ev.button!==0)return;const pt=gasPointerPoint(ev);if(!pt)return;drag={source,pointerId:ev.pointerId,active:false,startX:pt.x,startY:pt.y,originLeft:source.style.left,originTop:source.style.top,target:null};try{source.setPointerCapture(ev.pointerId)}catch(_e){}}
function moveGasDrag(source,ev){const d=drag;if(!d||d.source!==source||d.pointerId!==ev.pointerId||complete)return;const pt=gasPointerPoint(ev);if(!pt)return;if(!d.active&&Math.hypot(pt.x-d.startX,pt.y-d.startY)<7)return;if(!d.active){d.active=true;if(selected){selected.classList.remove('selected');selected=null}source.classList.add('dragging');window.ARDUA_ROTATION?.beginInteraction?.('quasar-drag')}
 ev.preventDefault();ev.stopPropagation();source.style.left=`${(pt.x/Math.max(1,pt.width)*100).toFixed(3)}%`;source.style.top=`${(pt.y/Math.max(1,pt.height)*100).toFixed(3)}%`;clearGasDragTarget();d.target=gasDragTarget(source,ev);d.target?.classList.add('drag-target')}
function finishGasDrag(source,ev,cancel=false){const d=drag;if(!d||d.source!==source||d.pointerId!==ev.pointerId)return false;const wasActive=d.active,target=!cancel?d.target:null;drag=null;try{source.releasePointerCapture(ev.pointerId)}catch(_e){};if(!wasActive)return false;ev.preventDefault();ev.stopPropagation();suppressClickUntil=performance.now()+520;source.classList.remove('dragging');clearGasDragTarget();window.ARDUA_ROTATION?.endInteraction?.('quasar-drag');if(target){react(source,target);return true}source.style.left=d.originLeft;source.style.top=d.originTop;return true}
function trackGasDrag(ev){
 const d=drag;if(!d||d.pointerId!==ev.pointerId)return;moveGasDrag(d.source,ev)
}
function releaseGasDrag(ev,cancel=false){
 const d=drag;if(!d||d.pointerId!==ev.pointerId)return;finishGasDrag(d.source,ev,cancel)
}
document.addEventListener('pointermove',trackGasDrag,{capture:true,passive:false});
document.addEventListener('pointerup',ev=>releaseGasDrag(ev,false),true);
document.addEventListener('pointercancel',ev=>releaseGasDrag(ev,true),true);
function reactionPoint(a,b){
 const lr=layer.getBoundingClientRect(),ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),x=((ar.left+ar.width/2+br.left+br.width/2)/2-lr.left)/Math.max(1,lr.width)*100,y=((ar.top+ar.height/2+br.top+br.height/2)/2-lr.top)/Math.max(1,lr.height)*100;
 return{x,y};
}
function react(a,b){
 a.classList.add('reacting');b.classList.add('reacting');a.disabled=true;b.disabled=true;
 const pt=reactionPoint(a,b),flash=document.createElement('span');flash.className='quasar-radiation-flash';flash.style.left=`${pt.x}%`;flash.style.top=`${pt.y}%`;layer.appendChild(flash);
 setTimeout(()=>{
  a.classList.add('spent');b.classList.add('spent');a.classList.remove('reacting');b.classList.remove('reacting');
  const product=document.createElement('span');product.className='quasar-product';product.style.setProperty('--angle',`${Math.atan2(pt.y-50,pt.x-50)}rad`);layer.querySelector('.quasar-products')?.appendChild(product);
  created++;updateProgress();
  if(created>=Q.target)finish();
 },430);
 setTimeout(()=>flash.remove(),760);
}
function finish(){
 complete=true;layer?.classList.add('complete');renderRecipe('Acreção gravitacional → radiação extrema','mₐcc → hν');setText('phaseMeta','QUASAR ATIVO · núcleo galáctico luminoso');
 updateProgress();phaseEnd.hidden=false;phaseEnd.style.display='';
}
function cleanup(){
 board.classList.remove('quasar-mode');if(drag?.active)window.ARDUA_ROTATION?.endInteraction?.('quasar-drag');drag=null;layer?.remove();layer=null;selected=null;launching=false;
 phaseEnd.hidden=false;phaseEnd.style.display='';
}
function launch(){
 if(launching&&layer)return;launching=true;created=0;complete=false;selected=null;drag=null;suppressClickUntil=0;
 board.classList.add('quasar-mode');resetChrome();buildLayer();updateProgress();
 requestAnimationFrame(()=>layer?.classList.add('ready'));
}

phaseEnd.addEventListener('click',e=>{
 if(C.getState().activeId!==Q.id)return;
 e.preventDefault();e.stopImmediatePropagation();if(!complete)return;
 C.markCompleted(Q.id);cleanup();setTimeout(()=>$('menuOpenBtn')?.click(),220);
},true);
phaseMenu.addEventListener('click',e=>{
 const b=e.target.closest('.phase-jump');if(b&&!b.matches('[data-quasar-phase]')&&board.classList.contains('quasar-mode'))cleanup();
},true);
$('menuOpenBtn')?.addEventListener('click',ensureMenuButton);
window.addEventListener('ardua:campaign-progress',syncButtonState);
new MutationObserver(()=>{if(!menuButton())ensureMenuButton()}).observe(phaseMenu,{childList:true});
ensureMenuButton();
if(C.getState().activeId===Q.id)setTimeout(launch,0);
window.ARDUA_QUASAR_GAME={launch,cleanup};
})();
