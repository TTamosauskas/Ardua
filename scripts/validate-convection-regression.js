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
need(block,'const ids=path.map(cell=>state.board[cell]||null)','A linha completa, incluindo a vaga central, deve participar da Convecção');
need(block,'releaseConvectionGamma(path);','Efeito gamma da Convecção recebe argumento incorreto');
need(block,'reversed=[...ids].reverse()','A linha convectiva precisa ser invertida');
if(block.includes('dest=occupied.map')||block.includes('occupied.map(cell=>state.board[cell])'))fail('Convecção voltou a ignorar a vaga central reservada');
need(block,"await teachProductOnce('convection'",'Tooltip original da primeira Convecção não foi preservado');
need(block,'finally{','Convecção precisa liberar o estado mesmo quando uma animação falha');
need(block,'state.locked=false','Convecção pode deixar o jogo permanentemente travado');
const jet=block.indexOf('await maybeEjectCoronalJet(path,s);');
const reorder=block.indexOf('reversed=[...ids].reverse()');
if(!(jet>=0&&reorder>jet))fail('O Jato deve acontecer antes da inversão da linha');

const reserveStart=engine.indexOf('function convectionCoreCell(){');
const reserveEnd=engine.indexOf('function convectionChargePhaseAllows',reserveStart);
if(reserveStart<0||reserveEnd<0)fail('Reserva do núcleo durante a carga convectiva não encontrada');
const reserve=engine.slice(reserveStart,reserveEnd);
need(reserve,"Number(state.convectionCharge||0)>0&&!state.phaseDone",'Reserva central deve durar exatamente enquanto o ↕ está carregado');
need(reserve,'function convectionCoreCellReserved(cell,s=phase())','Reserva central precisa ser consultável por qualquer mecânica');
need(reserve,'function enforceConvectionCoreVacancy(s=phase())','Núcleo carregado precisa expulsar qualquer átomo que chegue ao centro');
need(reserve,'state.board[center]=null;state.board[destination]=id','Átomo central não é deslocado para uma casa livre');

need(engine,"state.board[n]===null&&!convectionCoreCellReserved(n,s)",'Movimento manual deve excluir o centro reservado');
need(engine,"if(convectionCoreCellReserved(cell,phase())){const alternate=convectionCoreVacancyDestination(phase());if(alternate!==null)cell=alternate}",'Novos produtos não podem nascer no centro enquanto o ↕ estiver visível');
need(engine,'function renderPieces(){\n enforceConvectionCoreVacancy();','Renderização deve reaplicar a invariável de núcleo vazio contra qualquer caminho de reposicionamento');
need(engine,"state.board[n]===null&&!convectionCoreCellReserved(n,s)&&!(coords[n].ring===0&&coreRelocationAutoProtected(p))",'Estratificação não pode recolocar matéria sob o ↕');
need(engine,"coords[n].ring<coords[p.cell].ring&&state.board[n]===null&&!convectionCoreCellReserved(n,s)",'Gravidade comum não pode recolocar matéria sob o ↕');
need(engine,"state.board[i]===null&&!convectionCoreCellReserved(i,s)",'Reposição de matéria não pode usar o centro reservado');
need(block,'path.forEach(cell=>state.board[cell]=null)','Convecção deve liberar a linha completa antes de inverter');

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

console.log('Convection regression OK: ↕ reserva o núcleo vazio, bloqueia reentrada e libera o centro somente ao executar a linha convectiva.');
