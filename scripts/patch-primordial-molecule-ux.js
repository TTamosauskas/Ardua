const fs=require('fs');

function replaceOnce(src,from,to,label){
  const first=src.indexOf(from);
  if(first<0)throw new Error(`Trecho ausente: ${label}`);
  if(src.indexOf(from,first+from.length)>=0)throw new Error(`Trecho duplicado: ${label}`);
  return src.slice(0,first)+to+src.slice(first+from.length);
}

const jsPath='assets/js/ardua.js';
let js=fs.readFileSync(jsPath,'utf8');

js=replaceOnce(js,
"function primordialMoleculeBondDistance(){return Math.max(42,Math.min(54,cellSize()*.82))}",
"function primordialMoleculeBondDistance(){return Math.max(32,Math.min(40,cellSize()*.64))}",
'bond distance');

js=replaceOnce(js,
"if(el){el.dataset.molecule=m.type;live.add(el)}",
"if(el){el.dataset.molecule=m.type;el.classList.toggle('molecule-inert',!!m.locked);el.setAttribute('aria-disabled',m.locked?'true':'false');if(m.locked)el.tabIndex=-1;else el.removeAttribute('tabindex');live.add(el)}",
'molecule visual lock');

js=replaceOnce(js,
"if(!live.has(el))delete el.dataset.molecule",
"if(!live.has(el)){delete el.dataset.molecule;el.classList.remove('molecule-inert');el.removeAttribute('aria-disabled');el.removeAttribute('tabindex')}",
'molecule visual cleanup');

js=replaceOnce(js,
"const id=state.nextPrimordialMoleculeId++,m={id,type,members:[a.id,b.id],x:(a.x+b.x)/2,y:(a.y+b.y)/2,angle:Math.atan2(b.y-a.y,b.x-a.x)||Math.random()*Math.PI*2};",
"const id=state.nextPrimordialMoleculeId++,m={id,type,members:[a.id,b.id],x:(a.x+b.x)/2,y:(a.y+b.y)/2,angle:Math.atan2(b.y-a.y,b.x-a.x)||Math.random()*Math.PI*2,locked:!!(credit&&phase().mode==='primordialMolecule'&&type===phase().new)};",
'molecule target lock');

js=replaceOnce(js,
"function selectedPrimordialMolecule(){for(const id of state.freeSelected||[]){const p=state.pieces.get(id),m=primordialMoleculeForPiece(p);if(m)return m}return null}",
"function selectedPrimordialMolecule(){for(const id of state.freeSelected||[]){const p=state.pieces.get(id),m=primordialMoleculeForPiece(p);if(m&&!m.locked)return m}return null}",
'selected molecule lock');

js=replaceOnce(js,
"function tapPrimordialMolecule(id){const m=primordialMoleculeById(id);if(!m||state.locked||state.phaseDone)return;",
"function tapPrimordialMolecule(id){const m=primordialMoleculeById(id);if(!m||m.locked||state.locked||state.phaseDone)return;",
'tap molecule lock');

const oldRecipe=`function primordialNextRecipeLine(s=phase()){
 if(s.mode==='primordialNuclear')return primordialContextualReaction(s)?.label||s.meta||'';
 if(s.id==='atomic_h')return 'p + e⁻ → H + γ';
 if(s.id==='atomic_he'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='He'&&pieceCharge(p)>0);
   if(ion)return Number(ion.boundElectrons||0)===0?'⁴He²⁺ + e⁻ → He⁺ + γ':'He⁺ + e⁻ → He + γ';
   return primordialProducerToward('He')?.label||'Reconstrua um núcleo de ⁴He';
 }
 if(s.id==='atomic_li'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='Li'&&pieceCharge(p)>0);
   if(ion){const e=Number(ion.boundElectrons||0);return e===0?'⁷Li³⁺ + e⁻ → Li²⁺ + γ':e===1?'Li²⁺ + e⁻ → Li⁺ + γ':'Li⁺ + e⁻ → Li + γ'}
   return primordialProducerToward('Li')?.label||'Reconstrua um núcleo de ⁷Li';
 }
 return '';
}`;

const newRecipe=`function primordialAtomicCreationLine(sym){
 if(sym==='H')return 'p + e⁻ → H + γ';
 if(sym==='He'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='He'&&pieceCharge(p)>0);
   if(ion)return Number(ion.boundElectrons||0)===0?'⁴He²⁺ + e⁻ → He⁺ + γ':'He⁺ + e⁻ → He + γ';
   return primordialProducerToward('He')?.label||'Reconstrua um núcleo de ⁴He';
 }
 if(sym==='Li'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='Li'&&pieceCharge(p)>0);
   if(ion){const e=Number(ion.boundElectrons||0);return e===0?'⁷Li³⁺ + e⁻ → Li²⁺ + γ':e===1?'Li²⁺ + e⁻ → Li⁺ + γ':'Li⁺ + e⁻ → Li + γ'}
   return primordialProducerToward('Li')?.label||'Reconstrua um núcleo de ⁷Li';
 }
 return '';
}
function primordialMoleculeNextRecipeLine(s=phase()){
 const neutral=sym=>[...state.pieces.values()].find(p=>primordialNeutralAtom(p,sym)),h=neutral('H'),he=neutral('He');
 if(s.id==='first_atomic_bonds'){
   if(h&&he)return 'He + H → HeH⁺';
   if(!h)return primordialAtomicCreationLine('H');
   return primordialAtomicCreationLine('He');
 }
 if(s.id==='first_nebulae'){
   const heh=[...state.primordialMolecules.values()].find(m=>m.type==='HeH+'&&!m.locked);
   if(heh&&h)return 'HeH⁺ + H → H₂';
   if(!heh){
     if(!h)return primordialAtomicCreationLine('H');
     if(!he)return primordialAtomicCreationLine('He');
     return 'He + H → HeH⁺';
   }
   return primordialAtomicCreationLine('H');
 }
 return '';
}
function primordialNextRecipeLine(s=phase()){
 if(s.mode==='primordialNuclear')return primordialContextualReaction(s)?.label||s.meta||'';
 if(s.mode==='primordialMolecule')return primordialMoleculeNextRecipeLine(s);
 if(s.id==='atomic_h')return primordialAtomicCreationLine('H');
 if(s.id==='atomic_he')return primordialAtomicCreationLine('He');
 if(s.id==='atomic_li')return primordialAtomicCreationLine('Li');
 return '';
}`;
js=replaceOnce(js,oldRecipe,newRecipe,'primordial recipe guidance');

js=replaceOnce(js,
"dom.star.classList.toggle('primordial-mode',isPrimordial(s));dom.star.classList.toggle('spallation-mode'",
"dom.star.classList.toggle('primordial-mode',isPrimordial(s));dom.star.classList.toggle('primordial-molecule-mode',s.mode==='primordialMolecule');dom.star.classList.toggle('spallation-mode'",
'molecular mode visual class');

fs.writeFileSync(jsPath,js);

const cssPath='assets/css/ardua.css';
let css=fs.readFileSync(cssPath,'utf8');
const anchor='/* Primordial molecular pairs */';
if(!css.includes(anchor))throw new Error('CSS molecular anchor ausente');
const extra=`/* Primordial molecule scale: neutral atoms use the same footprint as the ⁴He nucleus shown in the atomic era. */
.star-board.primordial-mode.primordial-molecule-mode .atom.atomic-piece{width:clamp(39px,9.7vw,49px);height:clamp(39px,9.7vw,49px)}
.star-board.primordial-mode .atom.molecule-inert{pointer-events:none!important;cursor:default!important;outline:none!important}
.star-board.primordial-mode .atom.molecule-inert.selected,.star-board.primordial-mode .atom.molecule-inert.candidate{outline:none!important;box-shadow:inset 0 0 18px rgba(255,255,255,.18),0 0 16px rgba(147,220,255,.22),0 7px 15px rgba(0,0,0,.22)}

`;
if(!css.includes('primordial-molecule-mode .atom.atomic-piece'))css=css.replace(anchor,extra+anchor);
fs.writeFileSync(cssPath,css);
