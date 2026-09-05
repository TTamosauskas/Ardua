/* Ardua — Big Bang is the first required campaign action. */
(()=>{
'use strict';
const C=window.ARDUA_CAMPAIGN,map=document.getElementById('campaignMap'),trail=document.getElementById('campaignTrail'),detail=document.getElementById('mapDetail');
if(!C||!map||!trail||!detail)return;
const root=map.querySelector('.singularity-map'),rootSection=root?.closest('.cosmos-root'),label=rootSection?.querySelector('.singularity-map-label');
if(!root||!rootSection)return;
let started=false;

function introduced(){return C.editor||!!C.getState().introduced}
function setOpeningState(){
 if(introduced()){
  document.documentElement.classList.remove('ardua-awaiting-bigbang');
  map.classList.remove('awaiting-bigbang');
  map.classList.add('bigbang-complete');
  return;
 }
 document.documentElement.classList.add('ardua-awaiting-bigbang');
 map.classList.add('awaiting-bigbang');
 map.classList.remove('trail-revealed');
 trail.setAttribute('aria-hidden','true');
 root.setAttribute('aria-label','Iniciar o Big Bang e revelar a campanha');
 if(!rootSection.querySelector('.bigbang-start-prompt')){
  const prompt=document.createElement('div');prompt.className='bigbang-start-prompt';prompt.setAttribute('aria-hidden','true');rootSection.appendChild(prompt);
 }
}
function makeBurst(){
 const burst=document.createElement('div');burst.className='campaign-bigbang-burst';burst.setAttribute('aria-hidden','true');
 const total=54;
 for(let i=0;i<total;i++){
  const p=document.createElement('i'),angle=(360/total)*i+(Math.random()*8-4),distance=145+Math.random()*210,size=2+Math.random()*4,delay=Math.random()*170;
  p.className='campaign-bigbang-particle';p.style.setProperty('--angle',`${angle.toFixed(2)}deg`);p.style.setProperty('--distance',`${distance.toFixed(0)}px`);p.style.setProperty('--size',`${size.toFixed(1)}px`);p.style.setProperty('--delay',`${delay.toFixed(0)}ms`);burst.appendChild(p);
 }
 rootSection.appendChild(burst);setTimeout(()=>burst.remove(),1650);
}
function showNextPhase(){
 const node=map.querySelector('.phase-node[data-phase="primordial_d"]'),title=node?.querySelector('strong')?.textContent?.trim()||'Forme Deutério';
 detail.innerHTML=`<div class="detail-kicker">PRÓXIMA FASE</div><h3>${title}</h3><p>O Universo primordial já está em expansão. Inicie a primeira etapa jogável da nucleossíntese.</p><div class="detail-actions"><button type="button" data-detail-close>Fechar</button><button type="button" class="primary" data-launch="primordial_d">Explorar</button></div>`;
 detail.classList.add('show');
 setTimeout(()=>node?.scrollIntoView({block:'center',behavior:'smooth'}),90);
}
function revealCampaign(){
 document.documentElement.classList.remove('ardua-awaiting-bigbang');
 map.classList.remove('awaiting-bigbang');
 map.classList.add('bigbang-complete','bigbang-revealing','trail-revealed');
 trail.setAttribute('aria-hidden','false');
 trail.classList.remove('trail-arrive');
 window.dispatchEvent(new Event('resize'));
 setTimeout(()=>map.classList.remove('bigbang-revealing'),1050);
 setTimeout(showNextPhase,420);
}
function beginBigBang(e){
 if(introduced()||started)return;
 started=true;e.preventDefault();e.stopImmediatePropagation();
 window.ARDUA_MUSIC?.play?.();window.ARDUA_MUSIC?.sync?.();
 map.classList.add('bigbang-expanding');makeBurst();
 C.setIntroduced(true);C.setActive('primordial_d');C.markCompleted('bigbang');
 root.setAttribute('data-state','completed');
 if(label)label.querySelector('strong').textContent='Big Bang';
 setTimeout(revealCampaign,850);
 setTimeout(()=>map.classList.remove('bigbang-expanding'),1450);
}

root.addEventListener('click',beginBigBang,true);
setOpeningState();
setTimeout(setOpeningState,0);
})();
