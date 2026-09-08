const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const rotation=fs.readFileSync('assets/js/rotation-polish.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');

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
  'function applyOrbit(el,g,promote=false)',
  'applyOrbit(cell,g,cell.classList.contains(\'move-target\'))',
  'applyOrbit(atom,g,true)',
  'phaseGameplayVisible()',
  "document.body.classList.contains('campaign-map-open')",
  "map?.classList.contains('show')",
  'function convexHull(points)',
  'function radialLimit(g,theta)',
  'function hexOrbitPoint(x,y,g,rotation)',
  'const ratio=Math.min(1,r/startLimit)',
  "document.querySelectorAll('#pieces .atom,#cells .cell')",
  'setTimeout(()=>{attachMenusDeferred();if(enabled)startFrame()},0)',
  'cancelAnimationFrame(raf)'
];
for(const token of requiredRotation){if(!rotation.includes(token))throw new Error(`Contrato de rotação ausente: ${token}`)}
if(rotation.includes('MutationObserver'))throw new Error('Regressão: controlador de rotação não pode observar o body durante o bootstrap');
if(rotation.includes('let enabled=false'))throw new Error('Regressão: rotação deve estar ligada por padrão; a tela inicial é excluída por contexto');
if(!rotation.includes('if(!phaseGameplayVisible()){resetFieldOffsets();last=now;return}'))throw new Error('Regressão: rotação não deve atuar no mapa/página inicial');
if(rotation.includes('freezeRotation')||rotation.includes('pauseRotationForMovement'))throw new Error('Regressão: a rotação não deve congelar durante a escolha de movimento');
if(!index.includes('<script src="assets/js/rotation-polish.js"></script>'))throw new Error('rotation-polish.js não está carregado no index');
if(index.indexOf('assets/js/rotation-polish.js')>index.indexOf('assets/js/ardua.js'))throw new Error('rotation-polish.js deve carregar antes do motor');
if(!engine.includes("if(window.ARDUA_ROTATION?.enabled?.()!==false)g.angle+=g.omega*dt"))throw new Error('Formação estelar não respeita a opção de rotação');

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
