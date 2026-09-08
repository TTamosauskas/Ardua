/* Ardua — optional orbital rotation for playable atom fields. */
(()=>{
'use strict';
const KEY='arduaRotationEnabledV2';
const SPEED=.00028; // rad/ms: same order of magnitude as stellar-formation cluster rotation.
let enabled=true,angle=0,last=performance.now(),lastFormation=false,raf=0,geometry=null,offsetsApplied=false;

function readPreference(){
 try{const value=localStorage.getItem(KEY);return value===null?true:value!=='0'}catch(_e){return true}
}
function persistPreference(value){try{localStorage.setItem(KEY,value?'1':'0')}catch(_e){}}
enabled=readPreference();

function buttons(){return [...document.querySelectorAll('#phaseQuickRotation,#campaignHomeRotation')]}
function syncButtons(){
 const text=enabled?'Desligar Rotação':'Ligar Rotação';
 for(const button of buttons()){
  const label=button.querySelector('span')||button;
  if(label.textContent!==text)label.textContent=text;
  const pressed=enabled?'true':'false';
  if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);
  if(button.getAttribute('aria-label')!==text)button.setAttribute('aria-label',text);
 }
}
function resetFieldOffsets(){
 if(!offsetsApplied)return;
 document.querySelectorAll('#pieces .atom,#cells .cell').forEach(el=>{
  el.style.removeProperty('translate');
  el.style.removeProperty('will-change');
 });
 offsetsApplied=false;
}
function resetOrbit(){angle=0;last=performance.now();geometry=null;resetFieldOffsets()}
function stopFrame(){if(raf){cancelAnimationFrame(raf);raf=0}}
function startFrame(){if(enabled&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
function setEnabled(value,{persist=true}={}){
 const next=!!value;
 if(enabled===next){syncButtons();if(enabled)startFrame();return enabled}
 enabled=next;
 if(persist)persistPreference(enabled);
 resetOrbit();
 if(enabled)startFrame();else stopFrame();
 syncButtons();
 window.dispatchEvent(new CustomEvent('ardua:rotation-change',{detail:{enabled}}));
 return enabled;
}
function toggle(){return setEnabled(!enabled)}
window.ARDUA_ROTATION=Object.freeze({enabled:()=>enabled,setEnabled,toggle,key:KEY});

function makeMenuButton(id){
 const button=document.createElement('button');
 button.type='button';button.id=id;button.innerHTML='<span></span>';
 button.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();toggle();
  if(id==='phaseQuickRotation')document.querySelector('#phaseQuickMenu .phase-quick-close')?.click();
  else if(id==='campaignHomeRotation')document.querySelector('#campaignHomeMenu .campaign-home-menu-close')?.click();
 });
 return button;
}
function attachMenuButtons(){
 const phaseActions=document.querySelector('#phaseQuickMenu .phase-quick-actions');
 if(phaseActions&&!document.getElementById('phaseQuickRotation')){
  const button=makeMenuButton('phaseQuickRotation');
  const sound=document.getElementById('phaseQuickSound');
  phaseActions.insertBefore(button,sound||null);
 }
 const homeActions=document.querySelector('#campaignHomeMenu .campaign-home-menu-actions');
 if(homeActions&&!document.getElementById('campaignHomeRotation')){
  const button=makeMenuButton('campaignHomeRotation');
  const sound=document.getElementById('campaignHomeSound');
  homeActions.insertBefore(button,sound||null);
 }
 syncButtons();
 return !!document.getElementById('phaseQuickRotation')&&!!document.getElementById('campaignHomeRotation');
}
function attachMenusDeferred(attempt=0){
 if(attachMenuButtons()||attempt>=8)return;
 setTimeout(()=>attachMenusDeferred(attempt+1),120);
}

function phaseGameplayVisible(){
 const map=document.getElementById('campaignMap');
 return !document.body.classList.contains('campaign-map-open')&&!map?.classList.contains('show');
}
function point(el){
 const x=Number.parseFloat(el.style.left),y=Number.parseFloat(el.style.top);
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
function cross(o,a,b){return (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x)}
function convexHull(points){
 const pts=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);if(pts.length<=2)return pts;
 const lower=[];for(const p of pts){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p)}
 const upper=[];for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p)}
 lower.pop();upper.pop();return lower.concat(upper);
}
function geometryFor(board){
 const cells=[...document.querySelectorAll('#cells .cell')],key=`${board.clientWidth}x${board.clientHeight}:${cells.length}`;
 if(geometry?.key===key)return geometry;
 const points=cells.map(point).filter(Boolean),boardCx=board.clientWidth/2,boardCy=board.clientHeight/2;
 const pivot=points.reduce((best,p)=>Math.hypot(p.x-boardCx,p.y-boardCy)<Math.hypot(best.x-boardCx,best.y-boardCy)?p:best,points[0]||{x:boardCx,y:boardCy});
 const hull=convexHull(points);
 geometry={key,cx:pivot.x,cy:pivot.y,hull};return geometry;
}
function radialLimit(g,theta){
 if(!g||g.hull.length<3)return Infinity;
 const dx=Math.cos(theta),dy=Math.sin(theta),c={x:g.cx,y:g.cy};let best=Infinity;
 for(let i=0;i<g.hull.length;i++){
  const a=g.hull[i],b=g.hull[(i+1)%g.hull.length],ex=b.x-a.x,ey=b.y-a.y,den=dx*ey-dy*ex;
  if(Math.abs(den)<1e-8)continue;
  const acx=a.x-c.x,acy=a.y-c.y,t=(acx*ey-acy*ex)/den,u=(acx*dy-acy*dx)/den;
  if(t>=0&&u>=-1e-6&&u<=1+1e-6&&t<best)best=t;
 }
 return best;
}
function hexOrbitPoint(x,y,g,rotation){
 const dx=x-g.cx,dy=y-g.cy,r=Math.hypot(dx,dy);if(r<1)return{x:g.cx,y:g.cy};
 const start=Math.atan2(dy,dx),startLimit=radialLimit(g,start);if(!Number.isFinite(startLimit)||startLimit<=0)return{x,y};
 const ratio=Math.min(1,r/startLimit),theta=start+rotation,targetLimit=radialLimit(g,theta);if(!Number.isFinite(targetLimit)||targetLimit<=0)return{x,y};
 const targetR=ratio*targetLimit;
 return{x:g.cx+Math.cos(theta)*targetR,y:g.cy+Math.sin(theta)*targetR};
}
function applyOrbit(el,g,promote=false){
 const base=point(el);if(!base)return;
 const target=hexOrbitPoint(base.x,base.y,g,angle);
 el.style.translate=`${(target.x-base.x).toFixed(3)}px ${(target.y-base.y).toFixed(3)}px`;
 if(promote)el.style.willChange='translate';
}
function rotateNormalField(now){
 if(!enabled)return;
 const board=document.getElementById('starBoard'),pieces=document.getElementById('pieces'),cells=document.getElementById('cells');
 if(!board||!pieces||!cells)return;
 if(!phaseGameplayVisible()){resetFieldOffsets();last=now;return}
 const formation=board.classList.contains('stellar-formation-mode')||!!board.querySelector('.stellar-formation-layer');
 if(formation!==lastFormation){resetOrbit();lastFormation=formation}
 if(formation)return;
 const dt=Math.min(40,Math.max(0,now-last));last=now;angle=(angle+dt*SPEED)%(Math.PI*2);
 const g=geometryFor(board);
 // The logical grid never moves. Its visual cells and the atoms occupying them share
 // the same orbital projection, so movement targets remain under the correct touch point.
 for(const cell of cells.querySelectorAll('.cell'))applyOrbit(cell,g,cell.classList.contains('move-target'));
 for(const atom of pieces.querySelectorAll('.atom'))applyOrbit(atom,g,true);
 offsetsApplied=true;
}
function frame(now){
 raf=0;
 if(!enabled)return;
 rotateNormalField(now);
 raf=requestAnimationFrame(frame);
}

setTimeout(()=>{attachMenusDeferred();if(enabled)startFrame()},0);
window.addEventListener('storage',e=>{if(e.key===KEY)setEnabled(readPreference(),{persist:false})});
window.addEventListener('resize',()=>{geometry=null;resetFieldOffsets()});
window.addEventListener('ardua:phase-enter',()=>{resetOrbit();if(enabled)startFrame()});
})();
