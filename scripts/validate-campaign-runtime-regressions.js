const fs=require('fs');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const inbox=fs.readFileSync('assets/js/campaign-discovery-notifications.js','utf8');
const css=fs.readFileSync('assets/css/campaign-discovery-notifications.css','utf8');
const home=fs.readFileSync('assets/js/campaign-home-polish.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const exploration=fs.readFileSync('assets/js/campaign-exploration.js','utf8');
const runtimeSync=fs.readFileSync('assets/js/campaign-runtime-sync.js','utf8');
const quarksMap=fs.readFileSync('assets/js/campaign-quarks-map.js','utf8');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const index=fs.readFileSync('index.html','utf8');

function assert(ok,msg){if(!ok)throw new Error(msg)}

// 1. Em campanha normal todo nó reage ao clique. O modal só apresenta a fase;
//    CONTINUAR devolve o controle ao lançador nativo do mapa.
assert(modal.includes("const id=node.dataset.phase;e.preventDefault();e.stopImmediatePropagation();openPreview(id,node)"),'Clique em nó de fase ainda depende de #editor/desbloqueio');
assert(modal.includes("launch.disabled=!phaseAccessible(id)"),'CONTINUAR precisa refletir o desbloqueio da fase');
assert(modal.includes("const id=previewId,node=previewNode;if(!id||!phaseAccessible(id))return"),'Lançamento precisa continuar bloqueando fases indisponíveis');
assert(modal.includes('function nativeLaunchFromMap(id,node)'),'Modal precisa entregar o lançamento ao mapa');
assert(modal.includes('node.click()')&&modal.includes("#mapDetail [data-launch]")&&modal.includes('button.click()'),'Handoff precisa passar pelo detalhe/launcher real do mapa');
assert(!modal.includes('function enginePhaseButton(id)'),'Atalho pelo menu interno do motor voltou a ser usado');
assert(map.includes("function launch(id){if(!C.isUnlocked(id))return;const idx=C.runtimeIndex(id),btn=phaseButtons[idx];if(!btn)return;C.setActive(id);mapRequired=false;hideMap(true);btn.click();refresh()}"),'Lançador nativo do mapa mudou: rever contrato');

// O mapa recebe mutações de classe enquanto continua visível. Isso jamais pode fechar
// o modal da fase; ele só é fechado quando há uma transição real de fase -> mapa.
assert(modal.includes("let mapWasVisible=map.classList.contains('show')"),'Falta memória do estado anterior de visibilidade do mapa');
assert(modal.includes("becameVisible=visible&&!mapWasVisible"),'Fechamento do modal precisa depender da transição para mapa visível');
assert(modal.includes("if(!becameVisible)return;closePreview()"),'Preview ainda pode ser fechado por atualização cosmética do mapa');
assert(!modal.includes("function yieldEngineIntro(){if(!map.classList.contains('show'))return;closePreview()"),'Regressão: qualquer mutation de classe do mapa volta a fechar o preview');

// 2. Os indicadores apontam para os controles realmente visíveis e sobrevivem à ordem de carga.
for(const id of ['campaignHomeMenuBtn','campaignHomeDiscoveries'])assert(home.includes(id),`Interface atual perdeu ${id}`);
for(const token of ["$('campaignHomeMenuBtn')","$('campaignHomeDiscoveries')","function currentDiscoveryKeys()","data.discovered||[]","data.rewardDiscoveries||[]","new MutationObserver(scheduleRender).observe(campaignMap"])assert(inbox.includes(token),`Inbox não cobre contrato real: ${token}`);
for(const token of ['#campaignHomeMenuBtn.discovery-has-unread::after','#campaignHomeDiscoveries.discovery-has-unread::after'])assert(css.includes(token),`CSS de não lido perdeu seletor visível: ${token}`);
const inboxPos=index.indexOf('campaign-discovery-notifications.js'),homePos=index.indexOf('campaign-home-polish.js');
assert(inboxPos>=0&&homePos>=0&&inboxPos<homePos,'Ordem de scripts mudou: teste precisa ser revisto');

// 3. Se o mapa voltou à tela, intro tardio do motor é consumido mesmo após launchingId zerar.
assert(modal.includes("function shouldDismissEngineIntro(){return map.classList.contains('show')||"),'Fechamento pós-fase precisa considerar o mapa visível');
assert(modal.includes("if(engineIntro?.classList.contains('show'))engineStart?.click()"),'Intro interno precisa ser consumido');
assert(modal.includes("new MutationObserver(dismissEngineIntro).observe(engineIntro"),'Intro tardio precisa ser observado');
assert(map.includes('showMap({required:true,focusCurrent:true,instant:true})'),'Fim de fase precisa retornar imediatamente ao mapa');

// 4. O estado visual do mapa deve estabilizar. Renderizadores auxiliares não podem
//    remover/recolocar as mesmas classes a cada redraw das linhas ou resize sintético.
assert(home.includes("const STATE_CLASSES=['locked','revealed','available','completed','current']"),'Home precisa compartilhar um conjunto explícito de classes de estado');
assert(home.includes("if(el.classList.contains(name)===enabled)continue"),'Home precisa alterar classe de estado somente quando necessário');
assert(home.includes('function structureMutation(records)'),'Observer do home precisa ignorar redraws SVG sem mudança estrutural da trilha');
assert(!home.includes("window.addEventListener('resize',scheduleSync)"),'Resize de linhas não pode reprocessar todas as classes de fase');
assert(exploration.includes('function setClass(el,name,enabled)')&&exploration.includes('if(changed)requestLayout()'),'Janela de exploração precisa ser idempotente e recalcular layout só quando algo mudou');
assert(!exploration.includes('function clearFog(node)'),'Exploração não pode mais remover e recolocar todas as classes em cada passagem');
assert(quarksMap.includes("if(done.has(id))return'completed';\n if(st.activeId===id)return'current'"),'Quarks concluída deve priorizar completed sobre current');
assert(quarksMap.includes('setStateClass(quarks,phaseState(\'quarks\'))'),'Nó Quarks precisa atualizar estado de forma idempotente');

// 5. O título interno do motor fica propositalmente obsoleto enquanto o mapa está visível
//    e durante a fase customizada Quarks; runtime-sync não pode recuar activeId nesses estados.
assert(runtimeSync.includes("map?.classList.contains('show')"),'Runtime sync precisa respeitar a posse do mapa');
assert(runtimeSync.includes('window.ARDUA_QUARKS?.isActive?.()'),'Runtime sync precisa respeitar a posse da fase customizada Quarks');

// 6. No primeiro núcleo primordial, p e n convergem no centro do motivo visual.
//    O Deutério deve nascer e permanecer nesse mesmo ponto, sem voltar ao ponto médio
//    anterior à animação.
const pairStart=engine.indexOf('async function reactPrimordialParticlePair(r,a,b){');
const pairEnd=engine.indexOf('\nasync function reactPrimordialMixed',pairStart);
assert(pairStart>=0&&pairEnd>pairStart,'Reação primordial p+n não encontrada');
const pairBody=engine.slice(pairStart,pairEnd);
for(const token of [
 "const reactionPoint=r.id==='pn_d'&&motif?{x:motif.center,y:motif.center}:{x,y}",
 'createParticleReactionProduct(r.out,reactionPoint.x,reactionPoint.y',
 'objectiveInteractionRevealPiece(motif,out,reactionPoint)',
 'burst(reactionPoint.x,reactionPoint.y)'
])assert(pairBody.includes(token),`Deutério primordial perdeu o ponto real de encontro: ${token}`);

console.log('Campaign runtime regressions OK: native launch, phase preview, unread badges, Quarks handoff, primordial deuterium origin and stable map state ownership.');
