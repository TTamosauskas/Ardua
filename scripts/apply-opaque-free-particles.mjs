import fs from 'node:fs';

function replaceOnce(path, from, to) {
  const src = fs.readFileSync(path, 'utf8');
  const count = src.split(from).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path, src.replace(from, to));
}

const cssPath='assets/css/ardua.css';
const validatorPath='scripts/validate-movement-chain-particles.js';

replaceOnce(cssPath,
`.neutron{opacity:.62}.neutron.candidate{opacity:1;outline:3px solid rgba(67,242,138,.92);outline-offset:1px;box-shadow:0 0 16px rgba(67,242,138,.28),0 4px 9px rgba(0,0,0,.2)}.neutron.selected{opacity:1;outline:5px solid #43f28a;outline-offset:1px;transform:translate(-50%,-50%);box-shadow:0 0 24px rgba(67,242,138,.48)}`,
`.neutron{opacity:1}.neutron.candidate{opacity:1;outline:3px solid rgba(67,242,138,.92);outline-offset:1px;box-shadow:0 0 16px rgba(67,242,138,.28),0 4px 9px rgba(0,0,0,.2)}.neutron.selected{opacity:1;outline:5px solid #43f28a;outline-offset:1px;transform:translate(-50%,-50%);box-shadow:0 0 24px rgba(67,242,138,.48)}`);

replaceOnce(cssPath,
`/* Stellar proton visual parity with free neutrons */\n.star-board:not(.primordial-mode) .primordial-particle.proton{width:22px;height:22px;font-size:13px;opacity:.62}\n.star-board:not(.primordial-mode) .primordial-particle.proton.candidate,.star-board:not(.primordial-mode) .primordial-particle.proton.selected{opacity:1}\n\n/* Stellar particle shell: small translucent free particles around the stellar surface. */`,
`/* Stellar proton visual parity with free neutrons */\n.star-board:not(.primordial-mode) .primordial-particle.proton{width:22px;height:22px;font-size:13px;opacity:1}\n.star-board:not(.primordial-mode) .primordial-particle.proton.candidate,.star-board:not(.primordial-mode) .primordial-particle.proton.selected{opacity:1}\n\n/* Stellar particle shell: small opaque free particles around the stellar surface. */`);

replaceOnce(cssPath,
`  opacity:.40;\n  border-color:rgba(255,255,255,.46);`,
`  opacity:1;\n  border-color:rgba(255,255,255,.46);`);

replaceOnce(cssPath,
`.star-board:not(.primordial-mode) .primordial-particle.candidate{opacity:.76}`,
`.star-board:not(.primordial-mode) .primordial-particle.candidate{opacity:1}`);

replaceOnce(cssPath,
`  font-size:clamp(9px,calc(var(--cellSize)*.27),12px);\n  opacity:.40;\n}\n.neutron.candidate{opacity:.76}.neutron.selected,.star-board.neutron-active .neutron{opacity:1}`,
`  font-size:clamp(9px,calc(var(--cellSize)*.27),12px);\n  opacity:1;\n}\n.neutron.candidate{opacity:1}.neutron.selected,.star-board.neutron-active .neutron{opacity:1}`);

const validator=fs.readFileSync(validatorPath,'utf8');
const marker="for(const token of ['function boardParticleTargetAvailable(p,s=phase())','function selectBoardParticleTarget(p)','boardParticleTargetAvailable(p,s)){selectBoardParticleTarget(p);return}','protonCaptureAvailable(s)&&protonCaptureRoute(board,s)','attemptProtonCapture(board.cell,p.id)'])if(!engine.includes(token))fail('Seleção átomo→partícula perdeu simetria: '+token);";
if(!validator.includes(marker))throw new Error('validator anchor missing');
const insert=`${marker}\nconst css=fs.readFileSync('assets/css/ardua.css','utf8');\nif(css.includes('small translucent free particles'))fail('Descrição visual ainda indica partículas livres translúcidas');\nif(css.includes('.star-board:not(.primordial-mode) .primordial-particle.candidate{opacity:.76}'))fail('Partículas candidatas ainda ficam translúcidas');\nif(/\\.neutron\\{[^}]*opacity:\\.(?:40|62)/.test(css))fail('Nêutrons livres ainda usam opacidade reduzida');\nconst shell=css.slice(css.indexOf('/* Stellar particle shell:'),css.indexOf('/* Primordial molecule scale:'));\nif(!shell.includes('opacity:1')||/opacity:\\.(?:40|62|76)/.test(shell))fail('Prótons, elétrons ou nêutrons livres ainda usam transparência no plasma estelar');`;
fs.writeFileSync(validatorPath,validator.replace(marker,insert));

console.log('Free protons, electrons and neutrons are fully opaque while visible.');
// validation trigger
