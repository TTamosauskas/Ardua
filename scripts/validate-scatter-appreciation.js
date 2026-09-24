const fs=require('fs');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const token of [
  'let maxMotionMs=0',
  'maxMotionMs=Math.max(maxMotionMs,dur)',
  'const appreciationHold=rewardReducedMotion()?160:(supernova?900:700)',
  'await wait(Math.ceil(maxMotionMs+appreciationHold));advancePhase()'
])assert(engine.includes(token),'Contrato de apreciação da dispersão ausente: '+token);
assert((engine.match(/maxMotionMs=Math\.max\(maxMotionMs,dur\)/g)||[]).length>=2,'Duração máxima não acompanha partículas e átomos');
assert(!engine.includes('await wait(supernova?1050:900);advancePhase()'),'Tempo fixo antigo de dispersão voltou');
assert(engine.includes("if(raw.includes('ESPALHAR')&&raw.includes('POEIRA'))return'ESPALHAR<br>POEIRA ESTELAR'"),'Exceção explícita do botão Espalhar Poeira Estelar ausente');
assert(engine.includes("if(s.endEvent==='postTransition')return compactAdvance();return scatterStage()"),'Fases estelares comuns perderam o fluxo de dispersão');
assert(engine.includes("const s=phase(),supernova=s.endEvent==='supernova'"),'Supernova não usa o mesmo fluxo de dispersão');
assert(index.includes('ardua.js?v=20260924-reverse-drag-1'),'Engine sem cache bust atual da pausa de apreciação');
console.log('Stellar dispersal appreciation OK: dust and supernova wait for the longest motion plus a viewing pause before campaign return.');
