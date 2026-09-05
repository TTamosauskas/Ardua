/* Ardua — place Quasar after the stellar black-hole endpoint in the campaign map. */
(()=>{
'use strict';
const Q=window.ARDUA_QUASAR,C=window.ARDUA_CAMPAIGN;
const map=document.getElementById('campaignMap'),content=document.getElementById('campaignContent');
if(!Q||!C||!map||!content)return;
const NS='http://www.w3.org/2000/svg';let frame=0,syncFrame=0,syncing=false;

function visible(el){return !!el&&el.getClientRects().length>0}
function blackHole(){return [...map.querySelectorAll('.phase-node[data-phase="black_hole"]')].find(visible)||map.querySelector('.phase-node[data-phase="black_hole"]')}
function quasar(){return map.querySelector('.phase-node[data-phase="quasar"]')}
function junction(){return map.querySelector('.quasar-galactic-junction')}
function state(){if(C.editor)return'available';const st=C.getState(),done=new Set(st.completed||[]);if(st.activeId===Q.id)return'current';if(done.has(Q.id))return'completed';if(C.isUnlocked(Q.id))return'available';return done.has('black_hole')?'revealed':'locked'}
function build(){
 if(quasar())return;
 const bh=blackHole(),flow=bh?.closest('.cosmos-flow');if(!bh||!flow)return;
 const j=document.createElement('div');j.className='epoch-label quasar-galactic-junction';j.innerHTML='<strong>Núcleo galáctico</strong>';
 const b=document.createElement('button');b.type='button';b.className=`phase-node quasar-map-node ${state()}`;b.dataset.phase=Q.id;b.innerHTML='<strong>Quasar</strong>';
 bh.after(j,b);sync();
}
function sync(){
 if(syncing)return;syncing=true;
 try{
  const b=quasar(),j=junction();if(!b)return;
  const st=C.getState(),done=st.completed||[],next=state(),states=['locked','revealed','available','completed','current'];
  if(!b.classList.contains(next)||states.some(x=>x!==next&&b.classList.contains(x))){b.classList.remove(...states);b.classList.add(next)}
  const horizon=b.classList.contains('exploration-next')||b.classList.contains('exploration-preview');
  const shouldShow=C.editor||C.isUnlocked(Q.id)||done.includes(Q.id)||st.activeId===Q.id||horizon;
  const hideJunction=!shouldShow||b.classList.contains('exploration-hidden');
  if(j&&j.hidden!==hideJunction)j.hidden=hideJunction;
  const rp=b.closest('.portal[data-portal="rp"]');if(rp&&(st.activeId===Q.id||done.includes(Q.id))&&rp.open!==true)rp.open=true;
  schedule();
 }finally{syncing=false}
}
function queueSync(){if(syncFrame)return;syncFrame=requestAnimationFrame(()=>{syncFrame=0;sync()})}

const layer=document.createElementNS(NS,'svg');layer.id='campaignQuasarLinks';layer.classList.add('campaign-links','campaign-quasar-links');layer.setAttribute('aria-hidden','true');layer.style.pointerEvents='none';layer.style.zIndex='1';content.appendChild(layer);
function center(el,edge='center'){if(!visible(el))return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x:r.left-c.left+r.width/2,y}}
function add(from,to,cls='compact',bend=.5){const a=center(from,'bottom'),b=center(to,'top');if(!a||!b)return;const mid=a.y+(b.y-a.y)*bend,p=document.createElementNS(NS,'http://www.w3.org/2000/svg');p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);p.setAttribute('class',`campaign-link quasar-link ${cls}`);layer.appendChild(p)}
function draw(){frame=0;const w=content.clientWidth,h=content.scrollHeight;layer.setAttribute('viewBox',`0 0 ${w} ${h}`);layer.setAttribute('width',w);layer.setAttribute('height',h);layer.innerHTML='';if(!map.classList.contains('show')||!map.classList.contains('trail-revealed'))return;const bh=blackHole(),j=junction(),q=quasar();if(visible(bh)&&visible(j))add(bh,j,'quasar',.48);if(visible(j)&&visible(q))add(j,q,'quasar',.5)}
function schedule(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>requestAnimationFrame(draw))}

build();
window.addEventListener('ardua:campaign-progress',sync);window.addEventListener('resize',schedule);map.addEventListener('toggle',schedule,true);map.addEventListener('click',()=>setTimeout(schedule,30));
new MutationObserver(queueSync).observe(map,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
sync();schedule();
})();
