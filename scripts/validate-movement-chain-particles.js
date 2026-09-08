const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graphSrc=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(graphSrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;

// Campaign position and migration.
const red=G.baseOrder.indexOf('he_red'),movement=G.baseOrder.indexOf('stellar_movement');
if(red<0||movement!==red+1)fail('Movimentação deve ficar imediatamente após Anã Vermelha no runtime');
if(JSON.stringify(G.prerequisites.stellar_movement)!==JSON.stringify({allOf:['he_red']}))fail('Movimentação deve depender de Anã Vermelha');
if(!G.sequences.red.includes('stellar_movement')||G.sequences.red.indexOf('stellar_movement')!==G.sequences.red.indexOf('he_red')+1)fail('Movimentação ausente da rota vermelha');
if(!JSON.stringify(G.prerequisites.white).includes('stellar_movement'))fail('Anã Branca deve respeitar a lição de movimentação na rota vermelha');
if(!campaign.includes('version:12')||!campaign.includes("activeId='stellar_movement'"))fail('Migração da campanha para Movimentação ausente');

// Tutorial board/objective/movement persistence.
for(const token of [
 "id:'stellar_movement'","mode:'movementTutorial'","meta:'Leve o Hélio até o núcleo estelar.'","flowTarget:0","visual:'redDwarf'",
 "const intro=phaseIndexById.get('stellar_movement')",'function movementMechanicUnlocked(s=phase())','function atomicMovementAllowed(s=phase()){return movementMechanicUnlocked(s)}',
 "if(s.mode==='movementTutorial'){\n    const center=(byRing[0]||[])[0]","createPiece('He',heCell,false)","(coords[n]?.ring??99)===1",
 "if(s.mode==='movementTutorial'){const center=(byRing[0]||[])[0]","return !!p&&p.sym==='He'",
 "if(s.mode==='movementTutorial')return 'Leve o Hélio até o núcleo estelar.'"
])if(!engine.includes(token))fail('Contrato da fase de movimentação ausente: '+token);

// New plasma phases use the standard scatter end instead of bypass transition.
for(const id of ['solar_wind','stellar_ionization','stellar_recombination']){
 const at=engine.indexOf(`id:'${id}'`),end=engine.indexOf('\n',at),line=engine.slice(at,end<0?undefined:end);
 if(at<0)fail('Fase ausente: '+id);
 if(line.includes("endEvent:'plasmaTransition'"))fail(id+' ainda ignora Espalhar Poeira Estelar');
 if(!line.includes("endLabel:'ESPALHAR<br>POEIRA ESTELAR'"))fail(id+' sem botão Espalhar Poeira Estelar');
}

// Automatic chain reactions may only use knowledge from completed phases.
for(const token of [
 'function campaignKnowledgeCompleted(id)',
 'function fusionAutoRecipePreviouslyLearned(r)',
 '!fusionAutoRecipePreviouslyLearned(r)',
 'function neutronAutoTargetPreviouslyLearned(p,s=phase())',
 '!neutronAutoTargetPreviouslyLearned(p,s)',
 'function protonAutoRoutePreviouslyLearned(s=phase())',
 '!protonAutoRoutePreviouslyLearned(s)'
])if(!engine.includes(token))fail('Regra de cadeia estrita ausente: '+token);
const completedStart=engine.indexOf('function campaignKnowledgeCompleted(id)'),completedEnd=engine.indexOf('function learnedPrimordialNuclearReactions',completedStart),completedBlock=engine.slice(completedStart,completedEnd);
if(!completedBlock.includes('gs.completed.includes(id)')||completedBlock.includes('gs.activeId===id'))fail('Conhecimento automático não pode considerar a fase ativa como aprendida');

// Particle/atom selection order is symmetric, including proton-capture routes.
for(const token of [
 'function boardParticleTargetAvailable(p,s=phase())',
 'function selectBoardParticleTarget(p)',
 'boardParticleTargetAvailable(p,s)){selectBoardParticleTarget(p);return}',
 "const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p);if(p.kind==='p')",
 'protonCaptureAvailable(s)&&protonCaptureRoute(board,s)',
 'attemptProtonCapture(board.cell,p.id)'
])if(!engine.includes(token))fail('Seleção átomo→partícula perdeu simetria: '+token);

console.log('Movement tutorial, strict auto-chain knowledge, stellar scatter endings and particle selection order OK.');
