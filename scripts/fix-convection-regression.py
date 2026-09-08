from pathlib import Path

path = Path('assets/js/ardua.js')
text = path.read_text(encoding='utf-8')
start = text.index('async function performConvection(path){')
end = text.index('function handleConvectionTap(p){', start)
replacement = r'''async function performConvection(path){
 const s=phase();if(state.locked||state.phaseDone||Number(state.convectionCharge||0)<1)return false;let occupied=path.filter(cell=>state.board[cell]);if(occupied.length<2)return false;
 const firstConvection=!state.productLessons.has('convection');
 state.locked=true;state.convectionCharge=0;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[...path];state.selected=[];state.contextRecipeKey=null;objectiveMotifCancelSelection();renderConvectionControl();
 let completed=false;
 try{
  // Jatos Coronais é uma consequência opcional da Convecção: ejeta primeiro o íon
  // que já ocupa a extremidade superficial e só então reorganiza o restante da linha.
  await maybeEjectCoronalJet(path,s);
  occupied=path.filter(cell=>state.board[cell]);
  releaseConvectionGamma(path);
  const ids=occupied.map(cell=>state.board[cell]),reversed=[...ids].reverse(),moves=[];occupied.forEach(cell=>state.board[cell]=null);
  occupied.forEach((cell,i)=>{const id=reversed[i],p=id?state.pieces.get(id):null;if(!p)return;const from=p.cell;state.board[cell]=id;p.cell=cell;p.convecting=true;if(from!==cell)moves.push({id,from,to:cell})});
  dom.star.classList.add('convection-active');renderPieces();[330,415,520,660].forEach((f,i)=>setTimeout(()=>tone(f,.11,'sine',.018+i*.004),i*85));vibrate([8,16,8]);
  requestAnimationFrame(()=>{for(const m of moves){const p=state.pieces.get(m.id);if(p){const q=pos(coords[m.to]);p.x=q.x;p.y=q.y}}renderPieces()});
  moves.forEach((m,i)=>setTimeout(()=>emitConvectionEnergyPulse(path,i,moves.length),110+i*55));await wait(720);
  for(const m of moves){const p=state.pieces.get(m.id);if(p)p.convecting=false}dom.star.classList.remove('convection-active');state.convectionMoves=(state.convectionMoves||0)+1;
  if(s.mode==='convection')recordFlow(1,{kind:'convection',x:starSize()/2,y:starSize()/2,label:'energia transportada'});
  captureTag(starSize()/2,starSize()*.18,`ENERGIA TRANSPORTADA · ${moves.length}`);
  if(firstConvection){registerRewardDiscovery('phenomenon:stellarConvection',{title:'CONVECÇÃO ESTELAR',text:'Correntes de plasma transportam matéria e energia entre regiões da estrela.',silent:true});await teachProductOnce('convection',starSize()/2,starSize()/2)}
  prepareCumulativeStellarAtomicMatter(s);ensureOpportunity();completed=true;return true;
 }catch(err){console.error('Falha ao executar Convecção Estelar',err);toast('A Convecção não pôde ser concluída. Tente novamente.');return false}
 finally{
  dom.star.classList.remove('convection-active');state.convectionPathCells=[];state.locked=false;render();if(completed)checkComplete();
 }
}
'''
text = text[:start] + replacement + text[end:]
path.write_text(text, encoding='utf-8')
print('patched assets/js/ardua.js')
