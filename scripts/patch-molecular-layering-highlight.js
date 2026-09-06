const fs=require('fs');
const jsPath='assets/js/ardua.js';
const cssPath='assets/css/ardua.css';
let js=fs.readFileSync(jsPath,'utf8');
let css=fs.readFileSync(cssPath,'utf8');
function rep(text,oldText,newText,label){
  if(!text.includes(oldText))throw new Error('Missing '+label);
  return text.replace(oldText,newText);
}
js=rep(js,
"if(s.mode==='primordialMolecule'){const made=primordialGoalCount(s);if(s.id==='first_atomic_bonds')$('goalText').textContent=`Forme Hidreto de Hélio ${made}/${s.target}`;else $('goalText').textContent=`Crie gás primordial ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}",
"if(s.mode==='primordialMolecule'){const made=primordialGoalCount(s);if(s.id==='first_atomic_bonds')$('goalText').textContent=`Forme Moléculas ${made}/${s.target}`;else $('goalText').textContent=`Crie gás primordial ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}",
'objective label');
js=rep(js,
"primordialPieceTarget=primordial&&p.free&&selectedFree&&selectedFree.id!==p.id&&primordialPossiblePieceRecipes([selectedFree.sym,p.sym]).length>0",
"primordialPieceTarget=primordial&&p.free&&selectedFree&&selectedFree.id!==p.id&&(primordialPossiblePieceRecipes([selectedFree.sym,p.sym]).length>0||canCreatePrimordialHeH(selectedFree,p,s))",
'molecular candidate highlight');
css=rep(css,
".star-board.primordial-mode .atom[data-molecule]{animation:none!important;margin-top:0!important;transition:left .48s ease,top .48s ease,box-shadow .18s ease,filter .18s ease;filter:brightness(1.04)}",
".star-board.primordial-mode.primordial-molecule-mode .atom:not([data-molecule]){z-index:2}\n.star-board.primordial-mode.primordial-molecule-mode .atom[data-molecule]{z-index:1;animation:none!important;margin-top:0!important;transition:left .48s ease,top .48s ease,box-shadow .18s ease,filter .18s ease;filter:brightness(1.04)}",
'molecule layering');
fs.writeFileSync(jsPath,js);
fs.writeFileSync(cssPath,css);
