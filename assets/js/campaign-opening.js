/* Ardua — Big Bang is the first required campaign action. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,map=document.getElementById('campaignMap'),trail=document.getElementById('campaignTrail'),detail=document.getElementById('mapDetail');
if(!C||!map||!trail||!detail)return;
const root=map.querySelector('.singularity-map'),rootSection=root?.closest('.cosmos-root'),label=rootSection?.querySelector('.singularity-map-label');
if(!root||!rootSection)return;
const EXPLOSION_MS=4600;
let started=false;

function introduced(){return C.editor||!!C.getState().introduced}
function ensurePrompt(){
 let prompt=rootSection.querySelector('.bigbang-start-prompt');
 if(!prompt){prompt=document.createElement('div');prompt.className='bigbang-start-prompt';rootSection.appendChild(prompt)}
 prompt.innerHTML='<strong>BIG BANG</strong><span>toque para iniciar</span>';
 prompt.setAttribute('aria-hidden','true');
 if(label)label.hidden=true;
}
function setOpeningState(){
 if(introduced()){
  document.documentElement.classList.remove('ardua-awaiting-bigbang');
  map.classList.remove('awaiting-bigbang','bigbang-expanding');
  map.classList.add('bigbang-complete');
  if(label)label.hidden=false;
  return;
 }
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
function showNextPhase(){
 const node=map.querySelector('.phase-node[data-phase="primordial_d"]'),title=node?.querySelector('strong')?.textContent?.trim()||'Forme Deutério';
 detail.innerHTML=`<div class="detail-kicker">PRÓXIMA FASE</div><h3>${title}</h3><p>O Universo primordial está em expansão. Inicie a primeira etapa jogável da nucleossíntese.</p><div class="detail-actions"><button type="button" data-detail-close>Fechar</button><button type="button" class="primary" data-launch="primordial_d">Explorar</button></div>`;
 detail.classList.add('show');
 setTimeout(()=>node?.scrollIntoView({block:'center',behavior:'smooth'}),120);
}
function finishBigBang(){
 C.setIntroduced(true);C.setActive('primordial_d');C.markCompleted('bigbang');
 root.setAttribute('data-state','completed');
 document.documentElement.classList.remove('ardua-awaiting-bigbang');
 map.classList.remove('awaiting-bigbang','bigbang-expanding');
 map.classList.add('bigbang-complete','bigbang-revealing','trail-revealed');
 trail.setAttribute('aria-hidden','false');trail.classList.remove('trail-arrive');
 if(label){label.hidden=false;label.querySelector('strong').textContent='Big Bang'}
 window.dispatchEvent(new Event('resize'));
 setTimeout(()=>map.classList.remove('bigbang-revealing'),1250);
 setTimeout(showNextPhase,720);
}
function beginBigBang(e){
 if(introduced()||started)return;
 started=true;e.preventDefault();e.stopImmediatePropagation();
 window.ARDUA_MUSIC?.play?.();window.ARDUA_MUSIC?.sync?.();
 detail.classList.remove('show');
 map.classList.add('bigbang-expanding');
 root.setAttribute('aria-label','Big Bang em expansão');
 makeBurst();
 setTimeout(finishBigBang,EXPLOSION_MS);
}

root.addEventListener('click',beginBigBang,true);
setOpeningState();
setTimeout(setOpeningState,0);
})();
