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
let active=false,stage=null,anchorId='',candidateIds=[],made={proton:0,neutron:0},snapshot=null,returnActiveId='',reactionLocked=false;
let motionFrameId=0,lastMotionTime=0,sfxContext=null;
const motion=new Map();

function readSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(_e){return{}}}
function grantDiscoveries(){
 const data=readSave(),rewards=new Set(data.rewardDiscoveries||[]);let changed=false;
 for(const key of DISCOVERIES)if(!rewards.has(key)){rewards.add(key);changed=true}
 if(changed)localStorage.setItem(SAVE_KEY,JSON.stringify({...data,rewardDiscoveries:[...rewards]}));
}
function textState(id){const el=$(id);return el?el.textContent:null}
function captureInfoSnapshot(){
 const tile=$('infoTile'),panel=$('infoPanel');if(!panel)return null;
 return{tileClass:tile?.className||'',z:textState('infoZ'),symbol:textState('infoSymbol'),name:textState('infoName'),mass:textState('infoMass'),context:textState('infoContext'),fact:textState('infoFact'),recipesTitle:panel.querySelector('.info-recipes-title')?.textContent||'',recipesHTML:$('infoRecipes')?.innerHTML||''};
}
function captureSnapshot(){
 const end=$('phaseEndBtn'),board=$('starBoard');return{
  branchLabel:textState('branchLabel'),phaseTitle:textState('phaseTitle'),goalText:textState('goalText'),formulaText:textState('formulaText'),
  stageProgressLabel:textState('stageProgressLabel'),stageProgressText:textState('stageProgressText'),stageProgressWidth:$('stageProgress')?.style.width||'',
  endText:end?.textContent||'',endShow:!!end?.classList.contains('show'),boardPrimordial:!!board?.classList.contains('primordial-mode'),info:captureInfoSnapshot()
 }
}
function setText(id,value){const el=$(id);if(el!=null&&value!=null&&el.textContent!==value)el.textContent=value}
function renderQuarksInfo(){
 const panel=$('infoPanel'),tile=$('infoTile'),recipes=$('infoRecipes');if(!panel)return;
 if(tile)tile.className='info-tile particle quarks-info-tile';
 setText('infoZ','FUNDAMENTAL');setText('infoSymbol','u d');setText('infoName','Quarks');setText('infoMass','up · down');
 setText('infoContext','Partículas fundamentais');
 setText('infoFact','Quarks são partículas fundamentais. Dois quarks up e um down formam um próton (uud); um up e dois down formam um nêutron (udd). A Força Nuclear Forte mantém os quarks ligados dentro desses bárions.');
 const title=panel.querySelector('.info-recipes-title');if(title)title.textContent='Combinações';
 if(recipes)recipes.innerHTML='<span class="info-recipe">uud → próton</span><span class="info-recipe">udd → nêutron</span>';
}
function restoreInfoSnapshot(info){
 if(!info)return;const tile=$('infoTile'),panel=$('infoPanel'),recipes=$('infoRecipes');if(tile)tile.className=info.tileClass;
 setText('infoZ',info.z);setText('infoSymbol',info.symbol);setText('infoName',info.name);setText('infoMass',info.mass);setText('infoContext',info.context);setText('infoFact',info.fact);
 const title=panel?.querySelector('.info-recipes-title');if(title)title.textContent=info.recipesTitle;if(recipes)recipes.innerHTML=info.recipesHTML;
}
function updateProgress(){
 const total=made.proton+made.neutron;
 setText('goalText',`Crie Prótons e Nêutrons — ${total}/2`);
 setText('formulaText','3 quarks → 1 próton ou nêutron');
 setText('stageProgressLabel','HÁDRONS');setText('stageProgressText',`${total}/2`);
 const bar=$('stageProgress');if(bar)bar.style.width=`${Math.min(100,total*50)}%`;
}
function quarkById(id){return SEED.find(q=>q.id===id)}
function liveButton(id){const root=stage||$('starBoard');return root?.querySelector(`.quark-piece[data-quark-id="${id}"]`)||null}
function currentPoint(id){const m=motion.get(id);if(m)return{x:m.x,y:m.y};const el=liveButton(id);return{x:el?.offsetLeft||0,y:el?.offsetTop||0}}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function randomVelocity(){const a=Math.random()*Math.PI*2,s=.012+Math.random()*.012;return{vx:Math.cos(a)*s,vy:Math.sin(a)*s}}
function addMotion(id,el,x,y){const v=randomVelocity();motion.set(id,{id,el,x,y,...v});el.dataset.motionId=id;el.style.left=`${x}px`;el.style.top=`${y}px`}
function rotationMotionEnabled(){return window.ARDUA_ROTATION?.enabled?.()!==false}
function stopMotion(){if(motionFrameId){cancelAnimationFrame(motionFrameId);motionFrameId=0}lastMotionTime=0}
function startMotion(){if(!active||motionFrameId)return;lastMotionTime=performance.now();motionFrameId=requestAnimationFrame(moveParticles)}
function moveParticles(now){
 motionFrameId=0;if(!active||!stage)return;const dt=Math.min(42,Math.max(0,now-lastMotionTime||16));lastMotionTime=now;
 if(rotationMotionEnabled()){
  const w=stage.clientWidth||$('starBoard')?.clientWidth||500,h=stage.clientHeight||$('starBoard')?.clientHeight||500,pad=24;
  for(const [id,m] of [...motion]){
   if(!m.el?.isConnected){motion.delete(id);continue}
   if(m.el.classList.contains('selected')||m.el.classList.contains('quark-reaction-source'))continue;
   m.vx+=(Math.random()-.5)*.000015*dt;m.vy+=(Math.random()-.5)*.000015*dt;
   let speed=Math.hypot(m.vx,m.vy);if(speed>.027){m.vx=m.vx/speed*.027;m.vy=m.vy/speed*.027;speed=.027}else if(speed<.008){const v=randomVelocity();m.vx=v.vx;m.vy=v.vy}
   m.x+=m.vx*dt;m.y+=m.vy*dt;
   if(m.x<pad){m.x=pad;m.vx=Math.abs(m.vx)}else if(m.x>w-pad){m.x=w-pad;m.vx=-Math.abs(m.vx)}
   if(m.y<pad){m.y=pad;m.vy=Math.abs(m.vy)}else if(m.y>h-pad){m.y=h-pad;m.vy=-Math.abs(m.vy)}
   m.el.style.left=`${m.x.toFixed(2)}px`;m.el.style.top=`${m.y.toFixed(2)}px`;
  }
 }
 motionFrameId=requestAnimationFrame(moveParticles);
}
function resetSelection(){
 anchorId='';candidateIds=[];
 stage?.querySelectorAll('.quark-piece').forEach(el=>el.classList.remove('selected','candidate','invalid'));
}
function baryonKind(ids){
 const types=ids.map(id=>quarkById(id)?.type).filter(Boolean),u=types.filter(x=>x==='u').length,d=types.filter(x=>x==='d').length;
 if(u===2&&d===1)return'proton';if(u===1&&d===2)return'neutron';return'';
}
function kindForAnchor(type){return type==='d'?'proton':'neutron'}
function audio(){
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;sfxContext??=new Ctx();if(sfxContext.state==='suspended')sfxContext.resume().catch(()=>{});return sfxContext}catch(_e){return null}
}
function tone(freq=440,duration=.24,type='triangle',gain=.074){
 const ctx=audio();if(!ctx)return;const play=()=>{try{const osc=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;g.__arduaRecipeReplica=true;osc.type=type;osc.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(Math.max(.0001,gain),t);osc.connect(g);g.connect(ctx.destination);osc.start(t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.stop(t+duration+.02)}catch(_e){}};
 if(ctx.state==='suspended')ctx.resume().then(play).catch(()=>{});else play();
}
function playFrequency(freq,strong=false){const d=strong?.28:.24,g=strong?.086:.074;tone(freq,d,'triangle',g);tone(freq*2,d*.82,'sine',g*.30)}
function playChord(root){for(const ratio of [1,1.25,1.5]){const f=root*ratio;tone(f,.52,'triangle',.040);tone(f*2,.42,'sine',.014)}}
function playFinalAccent(root){tone(root*2,.56,'triangle',.022)}
function rootForKind(kind){return kind==='proton'?220:247}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function selectAnchor(id){
 if(reactionLocked)return;resetSelection();const q=quarkById(id),button=liveButton(id);if(!q||!button)return;
 const complement=q.type==='u'?'d':'u',origin=currentPoint(id),live=SEED.filter(x=>liveButton(x.id));
 let eligible=live.filter(x=>x.type===complement).sort((a,b)=>distance(origin,currentPoint(a.id))-distance(origin,currentPoint(b.id)));
 if(eligible.length<2&&live.length===3){
  const remainder=live.filter(x=>x.id!==id);if(remainder.length===2&&baryonKind([id,...remainder.map(x=>x.id)]))eligible=remainder;
 }
 if(eligible.length<2){button.classList.add('invalid');setTimeout(()=>button.classList.remove('invalid'),260);return}
 anchorId=id;button.classList.add('selected');candidateIds=eligible.slice(0,2).map(x=>x.id);candidateIds.forEach(candidate=>liveButton(candidate)?.classList.add('candidate'));
 playFrequency(rootForKind(baryonKind([id,...candidateIds])||kindForAnchor(q.type)));
}
function spawnUnionBurst(x,y){
 if(!stage)return;const burst=document.createElement('div');burst.className='quarks-union-burst';burst.style.left=`${x}px`;burst.style.top=`${y}px`;stage.appendChild(burst);setTimeout(()=>burst.remove(),720);
}
function spawnBaryon(kind,x,y){
 if(!stage)return null;const isProton=kind==='proton',el=document.createElement('button');el.type='button';el.tabIndex=-1;
 el.className=`primordial-particle ${isProton?'proton':'neutronfree'} quarks-baryon`;el.textContent=isProton?'+':'n';el.setAttribute('aria-label',isProton?'Próton formado':'Nêutron formado');stage.appendChild(el);
 addMotion(`baryon-${kind}`,el,x,y);requestAnimationFrame(()=>el.classList.add('formed'));return el;
}
function completeIfReady(){
 if(made.proton!==1||made.neutron!==1)return;grantDiscoveries();const end=$('phaseEndBtn');if(end){end.textContent='Proxima fase';end.classList.add('show');end.removeAttribute('hidden')}stage?.classList.add('complete');
}
async function fuse(){
 if(reactionLocked||!anchorId||candidateIds.length!==2)return;const ids=[anchorId,...candidateIds],kind=baryonKind(ids);if(!kind)return;
 const buttons=ids.map(liveButton).filter(Boolean);if(buttons.length!==3)return;reactionLocked=true;const root=rootForKind(kind),w=stage?.clientWidth||500,h=stage?.clientHeight||500,cx=w/2,cy=h/2,spread=Math.min(58,w*.12);
 anchorId='';candidateIds=[];buttons.forEach(b=>{b.classList.remove('selected','candidate');b.classList.add('quark-reaction-source','aligning')});
 playFrequency(root*1.25);
 buttons.forEach((b,i)=>{const m=motion.get(b.dataset.quarkId);if(m){m.x=cx+(i-1)*spread;m.y=cy}b.style.left=`${cx+(i-1)*spread}px`;b.style.top=`${cy}px`});
 await wait(150);if(!active)return;buttons.forEach(b=>b.classList.add('aligned'));playFrequency(root*1.5,true);
 await wait(230);if(!active)return;buttons.forEach(b=>{b.classList.remove('aligning');b.classList.add('converging');const m=motion.get(b.dataset.quarkId);if(m){m.x=cx;m.y=cy}b.style.left=`${cx}px`;b.style.top=`${cy}px`});playChord(root);try{navigator.vibrate?.([5,8,5])}catch(_e){}
 await wait(360);if(!active)return;for(const id of ids){motion.delete(id);liveButton(id)?.remove()}made[kind]++;spawnUnionBurst(cx,cy);spawnBaryon(kind,cx,cy);playFinalAccent(root);updateProgress();completeIfReady();reactionLocked=false;
}
function onQuarkClick(e){
 const button=e.target.closest('.quark-piece');if(!button||!stage?.contains(button)||reactionLocked)return;const id=button.dataset.quarkId;
 if(!anchorId){selectAnchor(id);return}if(id===anchorId){resetSelection();return}if(candidateIds.includes(id)){fuse();return}selectAnchor(id);
}
function buildStage(){
 const board=$('starBoard');if(!board)return null;const host=document.createElement('div');host.className='quarks-stage';host.setAttribute('aria-label','Área livre de combinação de quarks');
 for(const q of SEED){const b=document.createElement('button');b.type='button';b.className=`quark-piece quark-${q.type}`;b.dataset.quarkId=q.id;b.dataset.quarkType=q.type;b.style.left=`${q.x}%`;b.style.top=`${q.y}%`;b.setAttribute('aria-label',`Quark ${q.type}`);b.innerHTML=`<span>${q.type}</span>`;host.appendChild(b)}
 host.addEventListener('click',onQuarkClick);board.appendChild(host);const w=host.clientWidth||board.clientWidth||500,h=host.clientHeight||board.clientHeight||500;for(const q of SEED){const b=liveButton(q.id);if(b)addMotion(q.id,b,w*q.x/100,h*q.y/100)}return host;
}
function hideMap(){const map=$('campaignMap');if(!map)return;map.classList.remove('show');map.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open')}
function start(){
 if(active)return;active=true;returnActiveId=C.getState?.().activeId||'';snapshot=captureSnapshot();made={proton:0,neutron:0};anchorId='';candidateIds=[];reactionLocked=false;motion.clear();
 C.setActive?.('quarks');hideMap();document.body.classList.add('quarks-phase-active');const board=$('starBoard');board?.classList.add('primordial-mode','quarks-free-mode');
 setText('branchLabel','Universo primordial');setText('phaseTitle','Quarks');updateProgress();renderQuarksInfo();const end=$('phaseEndBtn');if(end){end.classList.remove('show');end.textContent='Proxima fase'}
 stage=buildStage();startMotion();window.dispatchEvent(new CustomEvent('ardua:quarks-phase-start'));
}
function cleanup(){
 if(!active)return;active=false;reactionLocked=false;stopMotion();motion.clear();document.body.classList.remove('quarks-phase-active');stage?.remove();stage=null;resetSelection();const board=$('starBoard');board?.classList.remove('quarks-free-mode');
 if(snapshot){if(!snapshot.boardPrimordial)board?.classList.remove('primordial-mode');setText('branchLabel',snapshot.branchLabel);setText('phaseTitle',snapshot.phaseTitle);setText('goalText',snapshot.goalText);setText('formulaText',snapshot.formulaText);setText('stageProgressLabel',snapshot.stageProgressLabel);setText('stageProgressText',snapshot.stageProgressText);const bar=$('stageProgress');if(bar)bar.style.width=snapshot.stageProgressWidth;const end=$('phaseEndBtn');if(end){end.textContent=snapshot.endText;end.classList.toggle('show',snapshot.endShow)}restoreInfoSnapshot(snapshot.info)}
 snapshot=null;window.dispatchEvent(new CustomEvent('ardua:quarks-phase-stop'));
}
function restoreMapActive(next){if(!next)return;C.setActive?.(next);window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id:next,state:C.getState?.(),source:'quarks-complete'}}))}
function finishToMap(){const next=returnActiveId&&returnActiveId!=='quarks'?returnActiveId:'primordial_d';cleanup();returnActiveId='';restoreMapActive(next)}
function setPreviewText(el,value){if(el&&el.textContent!==value)el.textContent=value}
function setPreviewClass(el,value){if(el&&el.className!==value)el.className=value}
function polishPreview(){
 const preview=$('campaignPhasePreview');if(!preview||preview.dataset.phaseId!=='quarks')return;const segment=preview.querySelector('[data-phase-segment]'),time=preview.querySelector('[data-phase-time]'),title=preview.querySelector('[data-phase-title]'),art=preview.querySelector('[data-phase-art]');
 setPreviewText(segment,'Universo Primordial - Primeiros Instantes');setPreviewText(time,'Primeiros microssegundos depois do Big Bang');setPreviewText(title,'QUARKS');setPreviewClass(art,'stellar-art bigBang');
}
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null,button=target?.closest('#campaignPhasePreview [data-phase-preview-launch]');if(!button)return;const preview=$('campaignPhasePreview');if(preview?.dataset.phaseId!=='quarks')return;
 e.preventDefault();e.stopImmediatePropagation();preview.classList.remove('show');preview.setAttribute('aria-hidden','true');start();
},true);
window.addEventListener('ardua:rotation-change',()=>{lastMotionTime=performance.now();if(active)startMotion()});
window.addEventListener('load',()=>{
 const preview=$('campaignPhasePreview');if(preview){new MutationObserver(polishPreview).observe(preview,{attributes:true,subtree:true,childList:true});polishPreview()}
 const end=$('phaseEndBtn');if(end)end.addEventListener('click',e=>{if(!active||C.getState?.().activeId!=='quarks')return;e.preventDefault();e.stopImmediatePropagation();finishToMap()},true);
 const map=$('campaignMap');if(map)new MutationObserver(()=>{if(!active||!map.classList.contains('show'))return;const back=returnActiveId&&returnActiveId!=='quarks'?returnActiveId:'';cleanup();returnActiveId='';restoreMapActive(back)}).observe(map,{attributes:true,attributeFilter:['class']});
},{once:true});
window.ARDUA_QUARKS=Object.freeze({start,isActive:()=>active,recipe:Object.freeze({proton:'uud',neutron:'udd'}),seed:Object.freeze(SEED.map(x=>Object.freeze({...x}))) });
})();
