const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
function fail(msg){throw new Error(msg)}
function need(hay,token,msg){if(!hay.includes(token))fail(msg||`Ausente: ${token}`)}
const start=engine.indexOf('async function performConvection(path){');
const end=engine.indexOf('function handleConvectionTap(p){',start);
if(start<0||end<0)fail('Rotina de Convecção não encontrada');
const block=engine.slice(start,end);
need(block,"Number(state.convectionCharge||0)<1",'Convecção não valida a carga antes de executar');
need(block,'await maybeEjectCoronalJet(path,s);','Jato Coronal não é avaliado antes da Convecção');
need(block,'occupied=path.filter(cell=>state.board[cell]);','Linha não é recalculada depois da ejeção');
need(block,'releaseConvectionGamma(path);','Efeito gamma da Convecção recebe argumento incorreto');
need(block,'reversed=[...ids].reverse()','A linha convectiva precisa ser invertida');
if(block.includes('dest=occupied.map'))fail('Convecção voltou a usar rotação cíclica em vez de inversão');
need(block,"await teachProductOnce('convection'",'Tooltip original da primeira Convecção não foi preservado');
need(block,'finally{','Convecção precisa liberar o estado mesmo quando uma animação falha');
need(block,'state.locked=false','Convecção pode deixar o jogo permanentemente travado');
const jet=block.indexOf('await maybeEjectCoronalJet(path,s);');
const reorder=block.indexOf('reversed=[...ids].reverse()');
if(!(jet>=0&&reorder>jet))fail('O Jato deve acontecer antes da inversão da linha');

const handleStart=engine.indexOf('function handleConvectionTap(p){');
const handleEnd=engine.indexOf('\nfunction fusionCandidateCells()',handleStart);
const handle=engine.slice(handleStart,handleEnd);
need(handle,'state.convectionPathCells=path','Primeiro toque não registra a linha convectiva');
need(handle,'state.convectionConfirmPending=true','Primeiro toque precisa apenas marcar a linha para confirmação');
if(handle.includes('performConvection('))fail('Primeiro átomo selecionado está executando a Convecção cedo demais');
need(handle,'borda vermelha','A orientação da linha marcada não informa a borda vermelha');

const listenerStart=engine.indexOf('function ensureConvectionConfirmationListener(){');
const listenerEnd=engine.indexOf('\nfunction ensureConvectionControl(){',listenerStart);
const listener=engine.slice(listenerStart,listenerEnd);
need(listener,"document.addEventListener('click'",'Confirmação deve ocorrer no clique em um átomo');
need(listener,".atom[data-id]",'Confirmação não está limitada a átomos');
need(listener,'path.includes(p.cell)','Somente átomos da linha vermelha podem confirmar a Convecção');
need(listener,'state.convectionConfirmPending=false;performConvection(path);','Clique na linha vermelha não executa a Convecção');
if(listener.includes("document.addEventListener('pointerdown'"))fail('Listener antigo ainda confirma por pointerdown genérico');

const tapStart=engine.indexOf('function tapAtom(id){');
const tapEnd=engine.indexOf('\n const armedProton=',tapStart);
const tap=engine.slice(tapStart,tapEnd);
const convectionPriority=tap.indexOf('state.convectionArmed&&handleConvectionTap(p)');
const chemistry=tap.indexOf('handleStellarAtomicTap(p,s)');
if(!(convectionPriority>=0&&chemistry>convectionPriority))fail('Convecção armada precisa ter prioridade sobre Ionização/Recombinação em todas as fases');
if(tap.includes('s.coronalJetTutorial&&state.convectionArmed'))fail('Prioridade da Convecção continua restrita ao tutorial de Jatos');

console.log('Convection regression OK: ↕ arma, primeiro átomo marca a linha, segundo átomo vermelho confirma, Jato precede a inversão.');
