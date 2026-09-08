const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const rotation=fs.readFileSync('assets/js/rotation-polish.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');

const requiredRotation=[
  "const KEY='arduaRotationEnabledV2'",
  "let enabled=false",
  "window.ARDUA_ROTATION=Object.freeze",
  'phaseQuickRotation',
  'campaignHomeRotation',
  "'Desligar Rotação':'Ligar Rotação'",
  "pieces.querySelectorAll('.atom')",
  'atom.style.translate=',
  'const cx=board.clientWidth/2,cy=board.clientHeight/2',
  'if(label.textContent!==text)label.textContent=text',
  'setTimeout(()=>attachMenusDeferred(),0)',
  'if(enabled)startFrame()',
  'cancelAnimationFrame(raf)'
];
for(const token of requiredRotation){if(!rotation.includes(token))throw new Error(`Contrato de rotação ausente: ${token}`)}
if(rotation.includes('MutationObserver'))throw new Error('Regressão: controlador de rotação não pode observar o body durante o bootstrap');
if(rotation.includes('requestAnimationFrame(frame);\n})();')&&!rotation.includes('if(enabled)startFrame()'))throw new Error('Regressão: loop de rotação não deve iniciar incondicionalmente');
if(!index.includes('<script src="assets/js/rotation-polish.js"></script>'))throw new Error('rotation-polish.js não está carregado no index');
if(index.indexOf('assets/js/rotation-polish.js')>index.indexOf('assets/js/ardua.js'))throw new Error('rotation-polish.js deve carregar antes do motor');
if(!engine.includes("if(window.ARDUA_ROTATION?.enabled?.()!==false)g.angle+=g.omega*dt"))throw new Error('Formação estelar não respeita a opção de rotação');
console.log('Rotation option contract OK');
