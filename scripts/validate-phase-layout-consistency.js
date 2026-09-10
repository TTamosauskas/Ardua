const fs=require('fs');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const css=fs.readFileSync('assets/css/phase-layout-consistency.css','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');

assert(css.includes('.app > .info-panel{margin-top:auto}'),'Box de informações não está ancorado ao fim da página');
assert(css.includes('max-width:100%'),'Estrela não está limitada à largura do shell');
assert(css.includes('aspect-ratio:1 / 1'),'Estrela não força proporção circular');
assert(css.includes('flex-shrink:0'),'Estrela ainda pode sofrer compressão horizontal desigual');
assert(engine.includes("dom.star?.parentElement?.clientWidth"),'Geometria não mede a largura disponível do shell');
assert(engine.includes('Math.min(desired,shellWidth||desired)'),'Geometria não limita --starSize à largura disponível');
assert(index.includes('phase-layout-consistency.css?v=20260910-phase-layout-1'),'CSS de consistência não está versionado no index');
assert(index.indexOf('phase-layout-consistency.css')>index.indexOf('phase-goal-layout.css'),'CSS de consistência precisa carregar depois do layout de objetivos');
assert(pages.includes('node scripts/validate-phase-layout-consistency.js'),'Pages não valida o posicionamento do box e a forma estelar');
console.log('Phase layout consistency OK: footer anchored and stellar geometry constrained to a 1:1 board.');
