/* Ardua — interactive Bohr atom models for Descobertas > Elementos. */
(()=>{
'use strict';

const $=id=>document.getElementById(id);
if(!document.querySelector('link[data-ardua-element-bohr-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-element-bohr.css',document.baseURI).href;link.dataset.arduaElementBohrStyle='1';document.head.appendChild(link);
}
const TWO_PI=Math.PI*2;
const ORBITALS=[
 [1,2],[2,2],[2,6],[3,2],[3,6],[4,2],[3,10],[4,6],[5,2],[4,10],[5,6],
 [6,2],[4,14],[5,10],[6,6],[7,2],[5,14],[6,10],[7,6]
];
// Ground-state exceptions that change the population of principal shells.
const SHELL_EXCEPTIONS=new Map([
 [24,[2,8,13,1]],[29,[2,8,18,1]],
 [41,[2,8,18,12,1]],[42,[2,8,18,13,1]],[44,[2,8,18,15,1]],[45,[2,8,18,16,1]],[46,[2,8,18,18]],[47,[2,8,18,18,1]],
 [57,[2,8,18,18,9,2]],[58,[2,8,18,19,9,2]],[64,[2,8,18,25,9,2]],[78,[2,8,18,32,17,1]],[79,[2,8,18,32,18,1]],
 [89,[2,8,18,32,18,9,2]],[90,[2,8,18,32,18,10,2]],[91,[2,8,18,32,20,9,2]],[92,[2,8,18,32,21,9,2]],[93,[2,8,18,32,22,9,2]],[96,[2,8,18,32,25,9,2]],
 [103,[2,8,18,32,32,8,3]]
]);

function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function shellsFor(value){
 const z=clamp(Math.round(Number(value)||1),1,118),special=SHELL_EXCEPTIONS.get(z);if(special)return special.slice();
 const shells=[];let remaining=z;
 for(const [n,capacity] of ORBITALS){
  if(remaining<=0)break;
  const take=Math.min(capacity,remaining);shells[n-1]=(shells[n-1]||0)+take;remaining-=take;
 }
 while(shells.length&&!shells[shells.length-1])shells.pop();
 return shells;
}
function parseMass(text,z){
 const raw=String(text||'').replace(',','.').match(/\d+(?:\.\d+)?/)?.[0],mass=Number(raw);
 if(Number.isFinite(mass)&&mass>=z)return Math.max(z,Math.round(mass));
 return Math.max(z,Math.round(z*(z<20?2:2.45)));
}
function paletteFrom(tile){
 const colors=String(tile?.style?.background||'').match(/#[0-9a-f]{3,8}/ig)||[];
 return [colors[0]||'#e8f6ff',colors[1]||'#75c9ef',colors[2]||'#315c83'];
}
function atomFrom(tile,host){
 const z=Math.max(1,Number(String(tile?.querySelector('.info-z')?.textContent||'1').replace(/\D/g,''))||1);
 const symbol=String(tile?.querySelector('.info-symbol')?.textContent||host?.dataset?.sym||'H').trim();
 const name=String(host?.querySelector('[data-element-detail-title]')?.textContent||symbol).trim();
 const mass=parseMass(tile?.querySelector('.info-mass')?.textContent,z);
 return{z,symbol,name,mass,neutrons:Math.max(0,mass-z),shells:shellsFor(z),palette:paletteFrom(tile)};
}
function hash01(i,salt=0){
 let x=((i+1)*0x9e3779b1+(salt+1)*0x85ebca6b)>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return(x>>>0)/4294967296;
}
function nucleusPoints(atom){
 const count=Math.max(1,atom.mass),points=[],protonRatio=atom.z/count;
 for(let i=0;i<count;i++){
  const u=hash01(i,1),v=hash01(i,2),w=hash01(i,3),r=Math.cbrt(u),theta=TWO_PI*v,cosPhi=2*w-1,sinPhi=Math.sqrt(Math.max(0,1-cosPhi*cosPhi));
  points.push({x:r*sinPhi*Math.cos(theta),y:r*sinPhi*Math.sin(theta),z:r*cosPhi,proton:hash01(i,7)<protonRatio});
 }
 // Force the rendered composition to contain exactly Z protons.
 points.sort((a,b)=>Number(b.proton)-Number(a.proton));
 let protons=points.reduce((sum,p)=>sum+(p.proton?1:0),0);
 if(protons>atom.z){for(let i=points.length-1;i>=0&&protons>atom.z;i--)if(points[i].proton){points[i].proton=false;protons--}}
 if(protons<atom.z){for(let i=0;i<points.length&&protons<atom.z;i++)if(!points[i].proton){points[i].proton=true;protons++}}
 return points;
}
function rotatePoint(point,yaw,pitch,roll=0){
 let{x,y,z}=point;
 const cr=Math.cos(roll),sr=Math.sin(roll),rx=x*cr-y*sr,ry=x*sr+y*cr;x=rx;y=ry;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),yx=x*cy+z*sy,yz=-x*sy+z*cy;x=yx;z=yz;
 const cp=Math.cos(pitch),sp=Math.sin(pitch),py=y*cp-z*sp,pz=y*sp+z*cp;y=py;z=pz;
 return{x,y,z};
}
function project(point,cx,cy,scale){
 const perspective=1/(1-point.z*.18);return{x:cx+point.x*scale*perspective,y:cy+point.y*scale*perspective,z:point.z,k:perspective};
}
function hexToRgba(hex,alpha){
 const h=String(hex||'').replace('#','');let r=117,g=201,b=239;
 if(h.length===3){r=parseInt(h[0]+h[0],16);g=parseInt(h[1]+h[1],16);b=parseInt(h[2]+h[2],16)}
 else if(h.length>=6){r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16)}
 return`rgba(${r},${g},${b},${alpha})`;
}

const views=new Set();let raf=0,lastFrame=performance.now();
function automaticMotion(){
 const global=window.ARDUA_ROTATION?.enabled?.();
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 return(global===undefined?true:!!global)&&!reduced;
}
function schedule(){if(!raf&&views.size){lastFrame=performance.now();raf=requestAnimationFrame(frame)}}
function frame(now){
 raf=0;const dt=Math.min(40,Math.max(0,now-lastFrame));lastFrame=now;
 for(const view of [...views]){if(!view.canvas.isConnected){view.destroy();continue}view.step(dt)}
 if(views.size)raf=requestAnimationFrame(frame);
}
window.addEventListener('ardua:rotation-change',schedule);

class BohrView{
 constructor(canvas,atom,{interactive=false,compact=false}={}){
  this.canvas=canvas;this.atom=atom;this.interactive=interactive;this.compact=compact;this.ctx=canvas.getContext('2d');this.yaw=.52;this.pitch=-.34;this.phase=.2;this.vYaw=0;this.vPitch=0;this.drag=null;this.points=nucleusPoints(atom);this.resizeObserver=new ResizeObserver(()=>this.resize());
  this.resizeObserver.observe(canvas);this.resize();
  if(interactive)this.bind();views.add(this);schedule();
 }
 bind(){
  this.canvas.addEventListener('pointerdown',e=>{
   if(e.button!==undefined&&e.button!==0)return;e.preventDefault();this.canvas.setPointerCapture?.(e.pointerId);this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};this.vYaw=0;this.vPitch=0;this.canvas.classList.add('is-dragging');
  });
  this.canvas.addEventListener('pointermove',e=>{
   if(!this.drag||e.pointerId!==this.drag.id)return;e.preventDefault();const now=performance.now(),dt=Math.max(8,now-this.drag.t),dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y,sensitivity=.008;
   this.yaw+=dx*sensitivity;this.pitch=clamp(this.pitch+dy*sensitivity,-1.42,1.42);this.vYaw=(dx*sensitivity)/dt;this.vPitch=(dy*sensitivity)/dt;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:now};
  });
  const end=e=>{if(!this.drag||e.pointerId!==this.drag.id)return;this.drag=null;this.canvas.classList.remove('is-dragging')};
  this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
 }
 resize(){
  const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.dpr=dpr;this.draw();
 }
 step(dt){
  if(automaticMotion()){this.phase=(this.phase+dt*(this.compact?.00052:.00042))%TWO_PI;if(!this.drag)this.yaw=(this.yaw+dt*.00012)%TWO_PI}
  if(!this.drag&&(Math.abs(this.vYaw)>.00001||Math.abs(this.vPitch)>.00001)){
   this.yaw+=this.vYaw*dt;this.pitch=clamp(this.pitch+this.vPitch*dt,-1.42,1.42);const decay=Math.pow(.93,dt/16.67);this.vYaw*=decay;this.vPitch*=decay;
  }
  this.draw();
 }
 draw(){
  const ctx=this.ctx;if(!ctx)return;const w=this.canvas.width,h=this.canvas.height,dpr=this.dpr||1,cx=w/2,cy=h/2,short=Math.min(w,h),maxShell=Math.max(1,this.atom.shells.length),outer=short*(this.compact?.35:.36),nucleusR=short*(this.compact?.075:.082),palette=this.atom.palette;
  ctx.clearRect(0,0,w,h);ctx.save();
  // Orbit shells.
  for(let shell=0;shell<maxShell;shell++){
   const r=outer*((shell+1)/(maxShell+.08)),tilt=(shell%2?1:-1)*(.08+shell*.025),roll=shell*.13;ctx.beginPath();
   for(let i=0;i<=96;i++){
    const a=TWO_PI*i/96,local=rotatePoint({x:Math.cos(a)*r/outer,y:Math.sin(a)*r/outer,z:0},0,tilt,roll),world=rotatePoint(local,this.yaw,this.pitch),p=project(world,cx,cy,outer);
    if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
   }
   ctx.lineWidth=Math.max(1,dpr*(this.compact?.75:1));ctx.strokeStyle=hexToRgba(palette[0],this.compact?.24:.31);ctx.stroke();
  }
  // Nucleus particles.
  const nucleusScale=nucleusR*(this.atom.mass>160?.82:this.atom.mass>80?.9:1),particleBase=clamp(nucleusScale/(Math.cbrt(this.atom.mass)+1.4),1.15*dpr,4.6*dpr),nucleons=this.points.map((raw,i)=>{
   const world=rotatePoint(raw,this.yaw*.72,this.pitch*.72,this.phase*.12),p=project(world,cx,cy,nucleusScale);return{...p,proton:raw.proton,i};
  }).sort((a,b)=>a.z-b.z);
  for(const p of nucleons){
   const radius=particleBase*clamp(p.k,.76,1.22);ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TWO_PI);ctx.fillStyle=p.proton?'rgba(255,126,116,.92)':'rgba(125,191,244,.88)';ctx.fill();
  }
  // Electrons, one evenly distributed set per principal shell.
  const electrons=[];
  this.atom.shells.forEach((count,shell)=>{
   const r=outer*((shell+1)/(maxShell+.08)),tilt=(shell%2?1:-1)*(.08+shell*.025),roll=shell*.13,speed=1+shell*.075;
   for(let i=0;i<count;i++){
    const a=this.phase*speed+TWO_PI*i/count+(shell*.41),local=rotatePoint({x:Math.cos(a)*r/outer,y:Math.sin(a)*r/outer,z:0},0,tilt,roll),world=rotatePoint(local,this.yaw,this.pitch),p=project(world,cx,cy,outer);electrons.push(p);
   }
  });
  electrons.sort((a,b)=>a.z-b.z);
  const er=Math.max(1.7*dpr,short*(this.compact?.0095:.0105));
  for(const p of electrons){
   const rr=er*clamp(p.k,.8,1.2),glow=ctx.createRadialGradient(p.x-rr*.25,p.y-rr*.25,rr*.12,p.x,p.y,rr*2.5);glow.addColorStop(0,hexToRgba(palette[0],1));glow.addColorStop(.34,hexToRgba(palette[1],.98));glow.addColorStop(1,hexToRgba(palette[1],0));ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,rr*2.5,0,TWO_PI);ctx.fill();ctx.fillStyle=palette[0];ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TWO_PI);ctx.fill();
  }
  ctx.restore();
 }
 destroy(){views.delete(this);this.resizeObserver?.disconnect();this.canvas.classList.remove('is-dragging')}
}

const figureState=new WeakMap();
function previewMarkup(atom){
 const button=document.createElement('button');button.type='button';button.className='element-bohr-preview';button.setAttribute('aria-label',`Ampliar modelo de Bohr de ${atom.name}`);button.style.setProperty('--bohr-a',atom.palette[0]);button.style.setProperty('--bohr-b',atom.palette[1]);button.style.setProperty('--bohr-c',atom.palette[2]);
 const canvas=document.createElement('canvas');canvas.className='element-bohr-canvas element-bohr-canvas-preview';canvas.setAttribute('aria-hidden','true');
 const label=document.createElement('span');label.className='element-bohr-preview-label';label.innerHTML=`<strong>${atom.symbol}</strong><small>MODELO DE BOHR</small>`;button.append(canvas,label);new BohrView(canvas,atom,{compact:true});return button;
}
function restoreFigure(figure){
 const state=figureState.get(figure);if(!state)return;state.view?.destroy();figure.classList.remove('element-bohr-stage-active');figure.replaceChildren(...state.original.map(node=>node.cloneNode(true)));figureState.delete(figure);
}
function activateFigure(figure,atom){
 if(!figure||figureState.has(figure))return;
 const original=[...figure.childNodes].map(node=>node.cloneNode(true));figure.classList.add('element-bohr-stage-active');figure.replaceChildren();
 const stage=document.createElement('div');stage.className='element-bohr-stage';stage.style.setProperty('--bohr-a',atom.palette[0]);stage.style.setProperty('--bohr-b',atom.palette[1]);stage.style.setProperty('--bohr-c',atom.palette[2]);
 const canvas=document.createElement('canvas');canvas.className='element-bohr-canvas element-bohr-canvas-stage';canvas.setAttribute('aria-label',`Modelo de Bohr interativo de ${atom.name}. Arraste para girar.`);canvas.setAttribute('role','img');
 const top=document.createElement('div');top.className='element-bohr-stage-top';top.innerHTML=`<span><strong>${atom.symbol}</strong> ${atom.name}</span><small>ARRASTE PARA GIRAR</small>`;
 const bottom=document.createElement('div');bottom.className='element-bohr-stage-bottom';const shells=document.createElement('span');shells.textContent=`Camadas: ${atom.shells.join(' · ')}`;const restore=document.createElement('button');restore.type='button';restore.className='element-bohr-restore';restore.textContent='Ver imagem';bottom.append(shells,restore);stage.append(canvas,top,bottom);figure.append(stage);
 const view=new BohrView(canvas,atom,{interactive:true});figureState.set(figure,{original,view});restore.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();restoreFigure(figure)});
}
function enhance(host){
 if(!host||host.hidden)return;const body=host.querySelector('#elementDiscoveryBody'),tile=body?.querySelector('.element-atomic-square');if(!tile||tile.dataset.bohrConsumed==='1')return;
 tile.dataset.bohrConsumed='1';const atom=atomFrom(tile,host),preview=previewMarkup(atom),figure=body.querySelector('.element-wiki-figure');
 tile.replaceWith(preview);if(figure)preview.addEventListener('click',()=>activateFigure(figure,atom));else{preview.disabled=true;preview.setAttribute('aria-disabled','true')}
}
function scan(){const host=$('elementDiscoveryDetail');if(host)enhance(host)}
const modal=$('menuModal');if(!modal)return;
new MutationObserver(()=>requestAnimationFrame(scan)).observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-open']});
modal.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('[data-discovery-tab],#closeMenu'):null;if(!target)return;for(const figure of modal.querySelectorAll('.element-wiki-figure.element-bohr-stage-active'))restoreFigure(figure)});
setTimeout(scan,0);
window.ARDUA_BOHR=Object.freeze({shellsFor});
})();
