/* Ardua — custom quark-combination lesson between Big Bang and deuterium. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),SAVE_KEY='stellarForgeV1013';
const C=window.ARDUA_CAMPAIGN;if(!C)return;

window.ARDUA_PHASE_NAMES=Object.freeze({...(window.ARDUA_PHASE_NAMES||{}),quarks:'Quarks'});
window.ARDUA_PHASE_TIMELINE=Object.freeze({...(window.ARDUA_PHASE_TIMELINE||{}),quarks:'Primeiros microssegundos depois do Big Bang'});
if(!document.querySelector('link[data-ardua-quarks-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-quarks.css',document.baseURI).href;link.dataset.arduaQuarksStyle='1';document.head.appendChild(link);
}

const DISCOVERIES=['particle:quark','phenomenon:strongNuclearForce','particle:proton','particle:neutron'];
const SEED=Object.freeze([
 {id:'u1',type:'u',x:50,y:18},{id:'d1',type:'d',x:76,y:35},
 {id:'u2',type:'u',x:76,y:65},{id:'d2',type:'d',x:50,y:82},
 {id:'u3',type:'u',x:24,y:65},{id:'d3',type:'d',x:24,y:35}
]);
let active=false,stage=null,anchorId='',candidateIds=[],picked=new Set(),made={proton:0,neutron:0},snapshot=null,finishing=false;

function readSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(_e){return{}}}
function grantDiscoveries(){
 const data=readSave(),rewards=new Set(data.rewardDiscoveries||[]);let changed=false;
 for(const key of DISCOVERIES)if(!rewards.has(key)){rewards.add(key);changed=true}
 if(changed)localStorage.setItem(SAVE_KEY,JSON.stringify({...data,rewardDiscoveries:[...rewards]}));
}
function textState(id){const el=$(id);return el?el.textContent:null}
function captureSnapshot(){
 const end=$('phaseEndBtn');return{
  branchLabel:textState('branchLabel'),phaseTitle:textState('phaseTitle'),goalText:textState('goalText'),formulaText:textState('formulaText'),
  stageProgressLabel:textState('stageProgressLabel'),stageProgressText:textState('stageProgressText'),stageProgressWidth:$('stageProgress')?.style.width||'',
  endText:end?.textContent||'',endShow:!!end?.classList.contains('show')
 }
}
function setText(id,value){const el=$(id);if(el!=null&&value!=null)el.textContent=value}
function updateProgress(){
 const total=made.proton+made.neutron;
 setText('goalText',`Crie Prótons e Nêutrons — ${total}/2`);
 setText('formulaText','3 quarks → 1 próton ou nêutron');
 setText('stageProgressLabel','HÁDRONS');setText('stageProgressText',`${total}/2`);
 const bar=$('stageProgress');if(bar)bar.style.width=`${Math.min(100,total*50)}%`;
}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function quarkById(id){return SEED.find(q=>q.id===id)}
function liveButton(id){return stage?.querySelector(`.quark-piece[data-quark-id="${id}"]`)||null}
function resetSelection(){
 anchorId='';candidateIds=[];picked.clear();
 stage?.querySelectorAll('.quark-piece').forEach(el=>el.classList.remove('selected','candidate','picked','invalid'));
}
function selectAnchor(id){
 resetSelection();const q=quarkById(id),button=liveButton(id);if(!q||!button)return;
 anchorId=id;button.classList.add('selected');
 const complement=q.type==='u'?'d':'u';
 candidateIds=SEED.filter(x=>x.type===complement&&liveButton(x.id)).sort((a,b)=>distance(q,a)-distance(q,b)).slice(0,2).map(x=>x.id);
 candidateIds.forEach(candidate=>liveButton(candidate)?.classList.add('candidate'));
}
function baryonKind(ids){
 const types=ids.map(id=>quarkById(id)?.type).filter(Boolean),u=types.filter(x=>x==='u').length,d=types.filter(x=>x==='d').length;
 if(u===2&&d===1)return'proton';if(u===1&&d===2)return'neutron';return'';
}
function spawnBaryon(kind){
 if(!stage)return;const isProton=kind==='proton';
 const el=document.createElement('button');el.type='button';el.disabled=true;el.className=isProton?'atom quarks-baryon quarks-proton':'neutron quarks-baryon quarks-neutron';
 el.setAttribute('aria-label',isProton?'Próton formado':'Nêutron formado');
 if(isProton)el.innerHTML='<span class="sym">p⁺</span>';else el.textContent='n';
 const count=made.proton+made.neutron,x=isProton?(count?42:46):(count?58:54);el.style.left=`${x}%`;el.style.top='52%';stage.appendChild(el);
 requestAnimationFrame(()=>el.classList.add('formed'));
}
function completeIfReady(){
 if(made.proton!==1||made.neutron!==1)return;
 grantDiscoveries();
 const end=$('phaseEndBtn');if(end){end.textContent='Proxima fase';end.classList.add('show');end.removeAttribute('hidden')}
 stage?.classList.add('complete');
}
function fuse(){
 const ids=[anchorId,...candidateIds];const kind=baryonKind(ids);if(!kind)return;
 const buttons=ids.map(liveButton).filter(Boolean);buttons.forEach(b=>{b.classList.remove('selected','candidate','picked');b.classList.add('reacting');b.style.left='50%';b.style.top='50%'});
 anchorId='';candidateIds=[];picked.clear();
 setTimeout(()=>{
  buttons.forEach(b=>b.remove());made[kind]++;spawnBaryon(kind);updateProgress();completeIfReady();
 },330);
}
function onQuarkClick(e){
 const button=e.target.closest('.quark-piece');if(!button||!stage?.contains(button))return;
 const id=button.dataset.quarkId;if(!anchorId){selectAnchor(id);return}
 if(id===anchorId){resetSelection();return}
 if(candidateIds.includes(id)){
  if(picked.has(id)){picked.delete(id);button.classList.remove('picked');return}
  picked.add(id);button.classList.add('picked');
  if(candidateIds.every(candidate=>picked.has(candidate)))fuse();
  return;
 }
 selectAnchor(id);
}
function buildStage(){
 const board=$('starBoard');if(!board)return null;
 const host=document.createElement('div');host.className='quarks-stage';host.setAttribute('aria-label','Área de combinação de quarks');
 host.innerHTML='<div class="quarks-field" aria-hidden="true"></div><div class="quarks-hint">Selecione um quark. Combine <b>uud</b> para formar um próton ou <b>udd</b> para formar um nêutron.</div>';
 for(const q of SEED){
  const b=document.createElement('button');b.type='button';b.className=`quark-piece quark-${q.type}`;b.dataset.quarkId=q.id;b.dataset.quarkType=q.type;b.style.left=`${q.x}%`;b.style.top=`${q.y}%`;b.setAttribute('aria-label',`Quark ${q.type}`);b.innerHTML=`<span>${q.type}</span>`;host.appendChild(b);
 }
 host.addEventListener('click',onQuarkClick);board.appendChild(host);return host;
}
function hideMap(){
 const map=$('campaignMap');if(!map)return;map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
}
function start(){
 if(active)return;active=true;finishing=false;snapshot=captureSnapshot();made={proton:0,neutron:0};anchorId='';candidateIds=[];picked.clear();
 C.setActive?.('quarks');hideMap();document.body.classList.add('quarks-phase-active');
 setText('branchLabel','Universo primordial');setText('phaseTitle','Quarks');updateProgress();
 const end=$('phaseEndBtn');if(end){end.classList.remove('show');end.textContent='Proxima fase'}
 stage=buildStage();window.dispatchEvent(new CustomEvent('ardua:quarks-phase-start'));
}
function cleanup(){
 if(!active)return;active=false;document.body.classList.remove('quarks-phase-active');stage?.remove();stage=null;resetSelection();
 if(snapshot){
  setText('branchLabel',snapshot.branchLabel);setText('phaseTitle',snapshot.phaseTitle);setText('goalText',snapshot.goalText);setText('formulaText',snapshot.formulaText);
  setText('stageProgressLabel',snapshot.stageProgressLabel);setText('stageProgressText',snapshot.stageProgressText);const bar=$('stageProgress');if(bar)bar.style.width=snapshot.stageProgressWidth;
  const end=$('phaseEndBtn');if(end){end.textContent=snapshot.endText;end.classList.toggle('show',snapshot.endShow)}
 }
 snapshot=null;window.dispatchEvent(new CustomEvent('ardua:quarks-phase-stop'));
}
function polishPreview(){
 const preview=$('campaignPhasePreview');if(!preview||preview.dataset.phaseId!=='quarks')return;
 const segment=preview.querySelector('[data-phase-segment]'),time=preview.querySelector('[data-phase-time]'),title=preview.querySelector('[data-phase-title]'),art=preview.querySelector('[data-phase-art]');
 if(segment)segment.textContent='Universo Primordial - Primeiros Instantes';if(time)time.textContent='Primeiros microssegundos depois do Big Bang';if(title)title.textContent='QUARKS';if(art)art.className='stellar-art bigBang';
}
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null,button=target?.closest('#campaignPhasePreview [data-phase-preview-launch]');if(!button)return;
 const preview=$('campaignPhasePreview');if(preview?.dataset.phaseId!=='quarks')return;
 e.preventDefault();e.stopImmediatePropagation();preview.classList.remove('show');preview.setAttribute('aria-hidden','true');start();
},true);

window.addEventListener('load',()=>{
 const preview=$('campaignPhasePreview');if(preview){new MutationObserver(polishPreview).observe(preview,{attributes:true,subtree:true,childList:true});polishPreview()}
 const end=$('phaseEndBtn');if(end)end.addEventListener('click',e=>{
  if(!active||C.getState?.().activeId!=='quarks')return;finishing=true;e.preventDefault();e.stopImmediatePropagation();cleanup();
 },true);
 const map=$('campaignMap');if(map)new MutationObserver(()=>{if(active&&map.classList.contains('show'))cleanup()}).observe(map,{attributes:true,attributeFilter:['class']});
},{once:true});

window.ARDUA_QUARKS=Object.freeze({start,isActive:()=>active,recipe:Object.freeze({proton:'uud',neutron:'udd'}),seed:Object.freeze(SEED.map(x=>Object.freeze({...x}))) });
})();
