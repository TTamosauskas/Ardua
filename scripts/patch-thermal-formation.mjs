import fs from 'node:fs';

function patch(path,from,to){
  const src=fs.readFileSync(path,'utf8');
  const count=src.split(from).length-1;
  if(count!==1)throw new Error(`${path}: expected one anchor, found ${count}`);
  fs.writeFileSync(path,src.replace(from,to));
}

patch('assets/js/ardua.js',
`function ensureCumulativeThermalAtom(s=phase()){
 if(!thermalIonizationMechanicUnlocked(s)||s.mode==='stellarFormation')return false;if([...state.pieces.values()].some(p=>thermalIonizationEligible(p,s)))return false;`,
`function ensureCumulativeThermalAtom(s=phase()){
 dom.star?.classList.toggle('thermal-core-enabled',thermalIonizationMechanicUnlocked(s));
 if(!thermalIonizationMechanicUnlocked(s))return false;if([...state.pieces.values()].some(p=>thermalIonizationEligible(p,s)))return false;`);

fs.appendFileSync('assets/css/stellar-formation.css',`

/* Keep learned thermal-core ionization available during every later stellar-formation phase. */
.star-board.stellar-formation-mode.thermal-core-enabled .cells{opacity:1;z-index:20}
.star-board.stellar-formation-mode.thermal-core-enabled .pieces{opacity:1;z-index:21}
`);

patch('scripts/validate-thermal-ionization.js',
`if(!engine.includes('movementMechanicUnlocked(s)||thermalCoreMovementAllowed(s)')||!engine.includes("campaignKnowledgeReached('thermal_ionization')"))fail('mecânica cumulativa térmica ausente');`,
`if(!engine.includes('movementMechanicUnlocked(s)||thermalCoreMovementAllowed(s)')||!engine.includes("campaignKnowledgeReached('thermal_ionization')"))fail('mecânica cumulativa térmica ausente');
const thermalEnsure=engine.slice(engine.indexOf('function ensureCumulativeThermalAtom'),engine.indexOf('function armThermalIonizationAtCore'));
if(thermalEnsure.includes("s.mode==='stellarFormation'"))fail('formação estelar ainda exclui ionização térmica cumulativa');
if(!thermalEnsure.includes("classList.toggle('thermal-core-enabled'"))fail('estado visual cumulativo do núcleo térmico ausente');
const formationCss=fs.readFileSync('assets/css/stellar-formation.css','utf8');
if(!formationCss.includes('.stellar-formation-mode.thermal-core-enabled .cells')||!formationCss.includes('.stellar-formation-mode.thermal-core-enabled .pieces'))fail('formação estelar não expõe peças/células da ionização térmica');`);

console.log('Thermal ionization now remains available through later stellar-formation phases.');
