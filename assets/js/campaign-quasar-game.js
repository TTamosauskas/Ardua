/* Ardua — Quasar gameplay: orbital gas interactions feed a luminous accretion disk. */
(()=>{
'use strict';
const Q=window.ARDUA_QUASAR,C=window.ARDUA_CAMPAIGN,G=window.ARDUA_CAMPAIGN_GRAPH;
if(!Q||!C||!G)return;
const $=id=>document.getElementById(id);
const board=$('starBoard'),phaseMenu=$('phaseMenu'),phaseEnd=$('phaseEndBtn'),menuModal=$('menuModal');
if(!board||!phaseMenu||!phaseEnd)return;
let layer=null,selected=null,created=0,complete=false,launching=false;

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
function updateProgress(){
 const ratio=Math.min(1,created/Q.target),pct=Math.round(ratio*100);
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
 setText('goalText',`Crie ${Q.target} unidades de Gás em Acreção — 0/${Q.target}`);setText('formulaText',Q.recipe);
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
  b.addEventListener('click',onGasClick);field.appendChild(b);
 });
 board.appendChild(layer);
}
function invalidPair(a,b){
 b.classList.add('invalid');setText('formulaText','Escolha duas parcelas em órbitas vizinhas');
 setTimeout(()=>{b.classList.remove('invalid');if(!complete)setText('formulaText',Q.recipe)},520);
}
function onGasClick(e){
 e.preventDefault();e.stopPropagation();if(complete)return;
 const b=e.currentTarget;if(b.classList.contains('spent')||b.classList.contains('reacting'))return;
 if(!selected){selected=b;b.classList.add('selected');return}
 if(selected===b){b.classList.remove('selected');selected=null;return}
 if(selected.dataset.pair!==b.dataset.pair){invalidPair(selected,b);return}
 const a=selected;selected=null;a.classList.remove('selected');react(a,b);
}
function reactionPoint(a,b){
 const ax=parseFloat(a.style.left),ay=parseFloat(a.style.top),bx=parseFloat(b.style.left),by=parseFloat(b.style.top);
 return{x:(ax+bx)/2,y:(ay+by)/2};
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
 complete=true;layer?.classList.add('complete');setText('formulaText','Acreção gravitacional → radiação extrema');setText('phaseMeta','QUASAR ATIVO · núcleo galáctico luminoso');
 updateProgress();phaseEnd.hidden=false;phaseEnd.style.display='';
}
function cleanup(){
 board.classList.remove('quasar-mode');layer?.remove();layer=null;selected=null;launching=false;
 phaseEnd.hidden=false;phaseEnd.style.display='';
}
function launch(){
 if(launching&&layer)return;launching=true;created=0;complete=false;selected=null;
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
