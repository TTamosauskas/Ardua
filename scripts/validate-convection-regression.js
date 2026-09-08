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
need(block,'reversed=[...ids].reverse()','Reordenação histórica da linha por inversão foi perdida');
if(block.includes('dest=occupied.map'))fail('Convecção foi alterada para rotação cíclica em vez da inversão histórica');
if(block.includes('teachConvectionOnce(')&&!engine.includes('function teachConvectionOnce('))fail('Convecção chama helper inexistente teachConvectionOnce');
need(block,"await teachProductOnce('convection'",'Tooltip original da primeira Convecção não foi preservado');
need(block,'finally{','Convecção precisa liberar o estado mesmo quando uma animação falha');
need(block,'state.locked=false','Convecção pode deixar o jogo permanentemente travado');
const jet=block.indexOf('await maybeEjectCoronalJet(path,s);');
const reorder=block.indexOf('reversed=[...ids].reverse()');
if(!(jet>=0&&reorder>jet))fail('O Jato deve acontecer antes da reordenação da linha');
need(engine,'if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}','Tutorial de Jatos deve executar a Convecção ao selecionar a linha');
need(engine,'if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;','Confirmação global de Convecção foi removida');
need(engine,'state.convectionConfirmPending=false;performConvection(path);','Segundo toque das fases normais não executa a Convecção');
console.log('Convection regression OK: execução global restaurada, Jato antes da inversão e lock recuperável.');
