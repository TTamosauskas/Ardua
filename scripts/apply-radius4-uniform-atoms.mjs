import fs from 'node:fs';

function replaceOnce(path, from, to) {
  const src = fs.readFileSync(path, 'utf8');
  if (src.includes(to)) return false;
  const count = src.split(from).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path, src.replace(from, to));
  return true;
}

const enginePath = 'assets/js/ardua.js';
const cssPath = 'assets/css/ardua.css';
const validatorPath = 'scripts/validate-stellar-plasma.js';

replaceOnce(
  enginePath,
  "dom.star.classList.toggle('cumulative-shells',s.mode!=='fusion'&&s.mode!=='whiteCompact'&&fusionSandboxAllowed(s)&&stratificationStrength(s)>0);root.style.setProperty('--starA',a[0]);",
  "dom.star.classList.toggle('cumulative-shells',s.mode!=='fusion'&&s.mode!=='whiteCompact'&&fusionSandboxAllowed(s)&&stratificationStrength(s)>0);dom.star.classList.toggle('radius-four-uniform-atoms',phaseRadius(s)===4);root.style.setProperty('--starA',a[0]);"
);

replaceOnce(
  cssPath,
  ".atom.nucleus-piece{width:calc(var(--cellSize)*.78);height:calc(var(--cellSize)*.78)}\n.atom.atomic-piece{width:var(--cellSize);height:var(--cellSize);",
  ".atom.nucleus-piece{width:calc(var(--cellSize)*.78);height:calc(var(--cellSize)*.78)}\n.star-board.radius-four-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}\n.atom.atomic-piece{width:var(--cellSize);height:var(--cellSize);"
);

replaceOnce(
  validatorPath,
  "const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');",
  "const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');\nconst css=fs.readFileSync('assets/css/ardua.css','utf8');"
);

replaceOnce(
  validatorPath,
  "if(!engine.includes('const STELLAR_CONTINUITY_POPULATION=15'))fail('População de plasma deve caber no hexágono de 19 células');",
  "if(!engine.includes('const STELLAR_CONTINUITY_POPULATION=15'))fail('População de plasma deve caber no hexágono de 19 células');\nif(!engine.includes(\"classList.toggle('radius-four-uniform-atoms',phaseRadius(s)===4)\"))fail('Layout de raio 4 não ativa tamanho atômico uniforme');\nif(!css.includes('.star-board.radius-four-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}'))fail('Núcleos do layout de raio 4 não usam o tamanho grande');\nif(!css.includes('.atom.nucleus-piece{width:calc(var(--cellSize)*.78);height:calc(var(--cellSize)*.78)}'))fail('Tamanho compacto de núcleos deve permanecer nos demais layouts');"
);

console.log('Radius-4 stellar boards now render atoms and nuclei at the same large diameter.');
