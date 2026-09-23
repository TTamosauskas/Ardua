const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const rotation=fs.readFileSync('assets/js/rotation-polish.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const phaseMenu=fs.readFileSync('assets/js/campaign-fork-links.js','utf8');

const requiredRotation=[
  "const KEY='arduaRotationEnabledV2'",
  'let enabled=true',
  "value===null?true:value!=='0'",
  "window.ARDUA_ROTATION=Object.freeze",
  'phaseQuickRotation',
  'campaignHomeRotation',
  "'Desligar Rotação':'Ligar Rotação'",
  "pieces.querySelectorAll('.atom')",
  "cells.querySelectorAll('.cell')",
  'function applyOrbit(el,g,promote=false,followTransition=false)',
  'applyOrbit(cell,g,cell.classList.contains(\'move-target\'))',
  'applyOrbit(atom,g,true,true)',
  'function transitionPoint(el)',
  'phaseGameplayVisible()',
  "document.body.classList.contains('campaign-map-open')",
  "map?.classList.contains('show')",
  'function convexHull(points)',
  'function radialLimit(g,theta)',
  'function hexOrbitPoint(x,y,g,rotation)',
  'const ratio=Math.min(1,r/startLimit)',
  "document.querySelectorAll('#pieces .atom,#cells .cell')",
  'setTimeout(()=>{attachMenusDeferred();if(enabled)startFrame()},0)',
  'cancelAnimationFrame(raf)',
  'const interactions=new Set()',
  "function beginInteraction(key='interaction')",
  "function endInteraction(key='interaction')",
  'function interactionActive()',
  'function toLogicalPoint(x,y)',
  'hexOrbitPoint(x,y,geometryFor(board),-angle)',
  "atom.classList.contains('stellar-board-dragging')",
  "atom.style.removeProperty('translate')",
  'if(!interactionActive())angle=(angle+dt*SPEED)%(Math.PI*2)'
];
for(const token of requiredRotation){if(!rotation.includes(token))throw new Error(`Contrato de rotação ausente: ${token}`)}
if(rotation.includes('MutationObserver'))throw new Error('Regressão: controlador de rotação não pode observar o body durante o bootstrap');
if(rotation.includes('let enabled=false'))throw new Error('Regressão: rotação deve estar ligada por padrão; a tela inicial é excluída por contexto');
if(!rotation.includes('if(!phaseGameplayVisible()){resetFieldOffsets();last=now;return}'))throw new Error('Regressão: rotação não deve atuar no mapa/página inicial');
if(!rotation.includes("window.ARDUA_ROTATION=Object.freeze({enabled:()=>enabled,setEnabled,toggle,key:KEY,beginInteraction,endInteraction,toLogicalPoint,sync:syncNow,interactionActive})"))throw new Error('API de rotação precisa expor suspensão de interação e conversão visual→lógica');
if(!index.includes('<script src="assets/js/rotation-polish.js?v=20260923-rotation-drag-1"></script>'))throw new Error('rotation-polish.js não está carregado no index com a revisão atual');
if(index.indexOf('assets/js/rotation-polish.js')>index.indexOf('assets/js/ardua.js'))throw new Error('rotation-polish.js deve carregar antes do motor');
for(const token of ["id=\"phaseQuickRotation\"","rotationBtn?.addEventListener('click'","window.addEventListener('ardua:rotation-change',updateRotationLabel)","'Desligar Rotação':'Ligar Rotação'"])if(!phaseMenu.includes(token))throw new Error(`Menu de fase sem controle de Rotação: ${token}`);
if(!engine.includes("if(window.ARDUA_ROTATION?.enabled?.()!==false)g.angle+=g.omega*dt"))throw new Error('Formação estelar não respeita a opção de rotação');
for(const token of [
  'function stellarBoardLogicalPoint(x,y)',
  "window.ARDUA_ROTATION?.toLogicalPoint?.(x,y)",
  "window.ARDUA_ROTATION?.beginInteraction?.('stellar-board-drag')",
  "window.ARDUA_ROTATION?.endInteraction?.('stellar-board-drag')",
  'd.logicalX=logical.x;d.logicalY=logical.y',
  'stellarBoardDragTarget(d,d.logicalX,d.logicalY)',
  'window.ARDUA_ROTATION?.sync?.()'
])if(!engine.includes(token))throw new Error(`Contrato drag + rotação ausente: ${token}`);

const primordialMotion=[
  'function rotationMotionEnabled(){return window.ARDUA_ROTATION?.enabled?.()!==false}',
  "if(!rotationMotionEnabled()||s.mode==='opening'||!state.primordialParticles.size)return",
  "if(!rotationMotionEnabled()||s.mode!=='primordialMolecule'||state.phaseDone||state.locked)return",
  "window.addEventListener('ardua:rotation-change',ev=>",
  'stopPrimordialDrift();stopPrimordialMoleculeDrift()',
  'else{startPrimordialDrift();startPrimordialMoleculeDrift()}'
];
for(const token of primordialMotion){if(!engine.includes(token))throw new Error(`Contrato de movimento primordial ausente: ${token}`)}
if(!engine.includes("if(!rotationMotionEnabled()){p.throwing=false;p.throwVx=0;p.throwVy=0;renderPrimordialParticles();return}"))throw new Error('Partícula lançada não respeita Desligar Rotação');
console.log('Rotation option contract OK');
