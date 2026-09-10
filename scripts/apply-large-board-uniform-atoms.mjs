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
  "classList.toggle('radius-four-uniform-atoms',phaseRadius(s)===4)",
  "classList.toggle('large-board-uniform-atoms',phaseRadius(s)>=4)"
);

replaceOnce(
  cssPath,
  '.star-board.radius-four-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}',
  '.star-board.large-board-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}'
);

replaceOnce(
  validatorPath,
  "if(!engine.includes(\"classList.toggle('radius-four-uniform-atoms',phaseRadius(s)===4)\"))fail('Layout de raio 4 não ativa tamanho atômico uniforme');\nif(!css.includes('.star-board.radius-four-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}'))fail('Núcleos do layout de raio 4 não usam o tamanho grande');",
  "if(!engine.includes(\"classList.toggle('large-board-uniform-atoms',phaseRadius(s)>=4)\"))fail('Layouts de raio 4 e 5 não ativam tamanho atômico uniforme');\nif(!css.includes('.star-board.large-board-uniform-atoms .atom.nucleus-piece{width:var(--cellSize);height:var(--cellSize)}'))fail('Núcleos dos layouts de raio 4 e 5 não usam o tamanho grande');"
);

console.log('Radius-4 and radius-5 stellar boards now render atoms and nuclei at the same large diameter.');
