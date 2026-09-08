from pathlib import Path

engine_path = Path('assets/js/ardua.js')
engine = engine_path.read_text(encoding='utf-8')

old_listener = '''function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('pointerdown',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   if(convectionConfirmationIsUiControl(ev.target))return;
   ev.preventDefault();ev.stopPropagation();const path=[...(state.convectionPathCells||[])];state.convectionConfirmPending=false;performConvection(path);
 },true);
}'''
new_listener = '''function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('click',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   const atom=ev.target?.closest?.('.atom[data-id]');if(!atom)return;
   const p=state.pieces.get(Number(atom.dataset.id)),path=[...(state.convectionPathCells||[])];
   ev.preventDefault();ev.stopPropagation();
   if(!p||p.free||p.cell===null||p.cell===undefined||!path.includes(p.cell)){toast('Toque em um átomo com borda vermelha para executar a Convecção.');return}
   state.convectionConfirmPending=false;performConvection(path);
 },true);
}'''
if old_listener not in engine:
    raise SystemExit('listener antigo de confirmação não encontrado')
engine = engine.replace(old_listener, new_listener, 1)

old_handle = '''function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const s=phase(),cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionArmed=false;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);
 if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}
 state.convectionConfirmPending=true;render();toast('Coluna convectiva marcada · toque novamente para iniciar.');return true;
}'''
new_handle = '''function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionArmed=false;state.convectionConfirmPending=true;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);
 render();toast('Linha convectiva marcada · toque em qualquer átomo com borda vermelha para executar.');return true;
}'''
if old_handle not in engine:
    raise SystemExit('handleConvectionTap antigo não encontrado')
engine = engine.replace(old_handle, new_handle, 1)

old_tap = "function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(s.coronalJetTutorial&&state.convectionArmed&&handleConvectionTap(p))return;if(handleStellarAtomicTap(p,s))return;if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;"
new_tap = "function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(state.convectionArmed&&handleConvectionTap(p))return;if(handleStellarAtomicTap(p,s))return;if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);"
if old_tap not in engine:
    raise SystemExit('prioridade antiga de tapAtom não encontrada')
engine = engine.replace(old_tap, new_tap, 1)

engine_path.write_text(engine, encoding='utf-8')

convection_validator = r'''const fs=require('fs');
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
'''
Path('scripts/validate-convection-regression.js').write_text(convection_validator, encoding='utf-8')

coronal_path = Path('scripts/validate-coronal-jets.js')
coronal = coronal_path.read_text(encoding='utf-8')
old_coronal = '''// Polimento da interação: em Jatos a Convecção vence a química atômica quando armada
need(engine,"s.coronalJetTutorial&&state.convectionArmed&&handleConvectionTap(p)",'Íon superficial ainda é interceptado pela química antes da Convecção');
need(engine,"if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}",'Jatos Coronais ainda exige um segundo toque para executar a Convecção');'''
new_coronal = '''// Interação cumulativa: a Convecção vence a química atômica quando armada e usa a mesma confirmação em três passos
need(engine,"state.convectionArmed&&handleConvectionTap(p)",'Convecção armada não tem prioridade sobre a química atômica');
need(engine,"state.convectionConfirmPending=true",'Jatos Coronais deve primeiro marcar a linha antes de executar');
need(engine,"path.includes(p.cell)",'Jatos Coronais deve confirmar somente ao clicar em um átomo da linha vermelha');
if(engine.includes("if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}"))fail('Jatos Coronais ainda executa imediatamente no primeiro átomo da linha');'''
if old_coronal not in coronal:
    raise SystemExit('asserts antigos de Jatos não encontrados')
coronal = coronal.replace(old_coronal, new_coronal, 1)
coronal_path.write_text(coronal, encoding='utf-8')

print('patched explicit convection confirmation flow')
