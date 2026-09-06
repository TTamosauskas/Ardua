const fs=require('fs');
const path='scripts/patch-stellar-formation-family.js';
let src=fs.readFileSync(path,'utf8');
const re=/ const oldObjective=.*?;\n const newObjective=.*?;\n/s;
const replacement=` const oldObjective="if(s.mode==='stellarFormation'){const f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=\\\`Reúna as 18 duplas de H — maior aglomerado \\${Math.min(largest,STELLAR_FORMATION_VISIBLE_TOTAL)}/\\${STELLAR_FORMATION_VISIBLE_TOTAL}\\\`;setFormula('O último H permanece oculto e completa automaticamente a vaga final');return}";\n const newObjective="if(s.mode==='stellarFormation'){const spec=stellarFormationSpec(s),f=state.stellarFormation,largest=f?Math.max(0,...[...f.groups.values()].map(g=>g.members.length)):0;$('goalText').textContent=\\\`Reúna as \\${spec.pairCount} duplas de H — maior aglomerado \\${Math.min(largest,spec.visibleTotal)}/\\${spec.visibleTotal}\\\`;setFormula('O último H permanece oculto e completa automaticamente a vaga final');return}";\n`;
if(!re.test(src))throw new Error('objective definition block not found');
src=src.replace(re,replacement);
fs.writeFileSync(path,src);
