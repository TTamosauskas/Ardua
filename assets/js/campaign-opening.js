/* Ardua — Big Bang is the opening ritual for every campaign session. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,map=document.getElementById('campaignMap'),trail=document.getElementById('campaignTrail'),detail=document.getElementById('mapDetail');
if(!C||!map||!trail||!detail)return;
const root=map.querySelector('.singularity-map'),rootSection=root?.closest('.cosmos-root'),label=rootSection?.querySelector('.singularity-map-label');
if(!root||!rootSection)return;
const MUSIC_AFTER_BURST_MS=90;
const EXPLOSION_MS=4600;
const loadState=C.getState();
const firstCosmicRun=!loadState.introduced;
const resumeActive=loadState.activeId&&loadState.activeId!=='bigbang'?loadState.activeId:'primordial_d';
let started=false,finished=false;

function ensurePrompt(){
 let prompt=rootSection.querySelector('.bigbang-start-prompt');
 if(!prompt){prompt=document.createElement('div');prompt.className='bigbang-start-prompt';rootSection.appendChild(prompt)}
 prompt.innerHTML='<strong>BIG BANG</strong><span>toque para iniciar</span>';
 prompt.setAttribute('aria-hidden','true');
 if(label)label.hidden=true;
}
function setOpeningState(){
 if(C.editor){
  document.documentElement.classList.remove('ardua-awaiting-bigbang');
  map.classList.remove('awaiting-bigbang','bigbang-expanding');
  map.classList.add('bigbang-complete');
  if(label)label.hidden=false;
  return;
 }
 if(finished)return;
 ensurePrompt();
 document.documentElement.classList.add('ardua-awaiting-bigbang');
 map.classList.add('awaiting-bigbang');
 map.classList.remove('trail-revealed','bigbang-complete','bigbang-revealing');
 trail.setAttribute('aria-hidden','true');
 detail.classList.remove('show');detail.innerHTML='';
 root.setAttribute('aria-label','Big Bang — toque para iniciar');
}
function makeBurst(){
 const scene=document.createElement('div'),rr=root.getBoundingClientRect(),sr=rootSection.getBoundingClientRect();
 scene.className='campaign-bigbang-scene';scene.setAttribute('aria-hidden','true');
 scene.style.left=`${rr.left-sr.left+rr.width/2}px`;scene.style.top=`${rr.top-sr.top+rr.height/2}px`;
 for(let i=0;i<3;i++){const wave=document.createElement('b');wave.className=`bigbang-shockwave wave-${i+1}`;scene.appendChild(wave)}
 const glow=document.createElement('b');glow.className='bigbang-afterglow';scene.appendChild(glow);
 const total=108;
 for(let i=0;i<total;i++){
  const p=document.createElement('i'),angle=(360/total)*i+(Math.random()*10-5),band=i%3,
        distance=(band===0?190:band===1?300:410)+Math.random()*(band===0?90:band===1?130:180),
        size=1.6+Math.random()*4.8,delay=220+band*720+Math.random()*900,duration=1900+band*520+Math.random()*650;
  p.className=`campaign-bigbang-particle band-${band+1}`;
  p.style.setProperty('--angle',`${angle.toFixed(2)}deg`);p.style.setProperty('--distance',`${distance.toFixed(0)}px`);p.style.setProperty('--size',`${size.toFixed(1)}px`);p.style.setProperty('--delay',`${delay.toFixed(0)}ms`);p.style.setProperty('--duration',`${duration.toFixed(0)}ms`);scene.appendChild(p);
 }
 rootSection.appendChild(scene);setTimeout(()=>scene.remove(),EXPLOSION_MS+900);
}
function openTrailWithBurst(){
 map.classList.add('bigbang-revealing','trail-revealed','bigbang-expanding');
 trail.setAttribute('aria-hidden','false');
 trail.classList.remove('trail-arrive');void trail.offsetWidth;trail.classList.add('trail-arrive');
 makeBurst();
 window.dispatchEvent(new Event('resize'));
}
function finishBigBang(){
 if(firstCosmicRun){
  C.setIntroduced(true);C.setActive('primordial_d');C.markCompleted('bigbang');
 }else{
  const done=new Set(C.getState().completed||[]);if(!done.has('bigbang'))C.markCompleted('bigbang');C.setActive(resumeActive);
 }
 finished=true;root.setAttribute('data-state','completed');
 document.documentElement.classList.remove('ardua-awaiting-bigbang');
 map.classList.remove('awaiting-bigbang','bigbang-expanding','bigbang-revealing');
 map.classList.add('bigbang-complete','trail-revealed');
 trail.setAttribute('aria-hidden','false');
 detail.classList.remove('show');detail.innerHTML='';
 if(label){label.hidden=false;label.querySelector('strong').textContent='Big Bang'}
 window.dispatchEvent(new Event('resize'));
}
function beginBigBang(e){
 if(C.editor||started||finished)return;
 started=true;e.preventDefault();e.stopImmediatePropagation();
 detail.classList.remove('show');detail.innerHTML='';
 root.setAttribute('aria-label','Big Bang em expansão');
 openTrailWithBurst();
 setTimeout(()=>{window.ARDUA_MUSIC?.play?.();window.ARDUA_MUSIC?.sync?.()},MUSIC_AFTER_BURST_MS);
 setTimeout(finishBigBang,EXPLOSION_MS);
}

root.addEventListener('click',beginBigBang,true);
setOpeningState();
setTimeout(setOpeningState,0);
})();
