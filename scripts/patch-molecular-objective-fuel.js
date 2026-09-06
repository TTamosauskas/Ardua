const fs=require('fs');
const path='assets/js/ardua.js';
let s=fs.readFileSync(path,'utf8');
function rep(oldText,newText,label){
  if(!s.includes(oldText)){
    if(s.includes(newText)){console.log('already applied:',label);return;}
    throw new Error('missing source: '+label);
  }
  s=s.replace(oldText,newText);
}
rep("if(s.mode==='primordialMolecule'){const made=primordialGoalCount(s);if(s.id==='first_atomic_bonds')$('goalText').textContent=`Forme Hidreto de Hélio ${made}/${s.target}`;else $('goalText').textContent='Crie gás primordial';setFormula(conciseRecipeLine(s));return}",
    "if(s.mode==='primordialMolecule'){const made=primordialGoalCount(s);if(s.id==='first_atomic_bonds')$('goalText').textContent=`Forme Hidreto de Hélio ${made}/${s.target}`;else $('goalText').textContent=`Crie gás primordial ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}",
    'molecular counters');
rep("   ensurePrimordialParticleMix({p:12,e:18,n:10});",
    "   const molecularFuel=s.id==='first_atomic_bonds'?{p:9,e:9,n:6}:{p:6,e:6,n:0};ensurePrimordialParticleMix(molecularFuel);",
    'exact molecular fuel');
rep("  if(isPrimordial(s)){if(s.mode==='primordialMolecule')ensurePrimordialParticleMix({p:10,e:16,n:8});return;}",
    "  if(isPrimordial(s))return;",
    'disable molecular replenishment');
fs.writeFileSync(path,s);
