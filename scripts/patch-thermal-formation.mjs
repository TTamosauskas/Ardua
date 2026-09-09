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

/* Learned thermal-core ionization remains interactive through every later stellar-formation phase. */
.star-board.stellar-formation-mode.thermal-core-enabled .cells{opacity:1;z-index:20}
.star-board.stellar-formation-mode.thermal-core-enabled .pieces{opacity:1;z-index:21}
.star-board.stellar-formation-mode.thermal-core-enabled .cell.move-target,
.star-board.stellar-formation-mode.thermal-core-enabled .atom{pointer-events:auto}
`);

patch('scripts/validate-thermal-ionization.js',
`if(!engine.includes('movementMechanicUnlocked(s)||thermalCoreMovementAllowed(s)')||!engine.includes("campaignKnowledgeReached('thermal_ionization')"))fail('mecânica cumulativa térmica ausente');`,
`if(!engine.includes('movementMechanicUnlocked(s)||thermalCoreMovementAllowed(s)')||!engine.includes("campaignKnowledgeReached('thermal_ionization')"))fail('mecânica cumulativa térmica ausente');
const thermalEnsure=engine.slice(engine.indexOf('function ensureCumulativeThermalAtom'),engine.indexOf('function armThermalIonizationAtCore'));
if(thermalEnsure.includes("s.mode==='stellarFormation'"))fail('formação estelar ainda exclui ionização térmica cumulativa');
if(!thermalEnsure.includes("classList.toggle('thermal-core-enabled'"))fail('estado visual cumulativo do núcleo térmico ausente');
const startPhaseBlock=engine.slice(engine.indexOf('function startPhase('),engine.indexOf('function modalPrimaryLine'));
if(startPhaseBlock.indexOf('ensureCumulativeThermalAtom(s)')<0||startPhaseBlock.indexOf('ensureCumulativeThermalAtom(s)')>startPhaseBlock.indexOf("if(s.mode==='stellarFormation')startStellarFormationStage()"))fail('átomo térmico precisa existir antes da camada especial de formação');
const formationCss=fs.readFileSync('assets/css/stellar-formation.css','utf8');
for(const token of ['.stellar-formation-mode.thermal-core-enabled .cells','.stellar-formation-mode.thermal-core-enabled .pieces','.stellar-formation-mode.thermal-core-enabled .cell.move-target','.stellar-formation-mode.thermal-core-enabled .atom'])if(!formationCss.includes(token))fail('formação estelar perdeu interatividade térmica: '+token);`);

console.log('Thermal ionization now remains available through later stellar-formation phases.');
