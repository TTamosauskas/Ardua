import fs from 'node:fs';

function replaceOnce(path, from, to) {
  const src = fs.readFileSync(path, 'utf8');
  const count = src.split(from).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path, src.replace(from, to));
}

const enginePath='assets/js/ardua.js';
const cssPath='assets/css/ardua.css';
const validatorPath='scripts/validate-movement-chain-particles.js';

replaceOnce(enginePath,
` });existing.forEach(el=>el.remove())\n}\nasync function decayFloatingNeutron`,
` });existing.forEach(el=>el.remove());\n dom.pieces.classList.toggle('selection-foreground',!!dom.pieces.querySelector('.atom.selected'))\n}\nasync function decayFloatingNeutron`);

const css=fs.readFileSync(cssPath,'utf8');
if(css.includes('.pieces.selection-foreground'))throw new Error('foreground CSS already present');
fs.appendFileSync(cssPath,`\n\n/* Selected atoms and their valid atom partners rise to the visual foreground. */\n.pieces.selection-foreground{z-index:60}\n.pieces.selection-foreground .atom.candidate{z-index:110}\n.pieces.selection-foreground .atom.selected{z-index:120}\n`);

const validator=fs.readFileSync(validatorPath,'utf8');
const marker="console.log('Movement animation, campaign return and strict chain knowledge OK.');";
if(!validator.includes(marker))throw new Error('validator anchor missing');
const checks=`if(!engine.includes(\"dom.pieces.classList.toggle('selection-foreground',!!dom.pieces.querySelector('.atom.selected'))\"))fail('Camada de peças não acompanha seleção atômica');\nconst foregroundCss=fs.readFileSync('assets/css/ardua.css','utf8');\nfor(const token of ['.pieces.selection-foreground{z-index:60}', '.pieces.selection-foreground .atom.candidate{z-index:110}', '.pieces.selection-foreground .atom.selected{z-index:120}'])if(!foregroundCss.includes(token))fail('Contrato de primeiro plano da seleção ausente: '+token);\n`;
fs.writeFileSync(validatorPath,validator.replace(marker,checks+marker));

console.log('Atom selection foreground patch applied.');
