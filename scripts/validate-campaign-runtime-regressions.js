const fs=require('fs');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const inbox=fs.readFileSync('assets/js/campaign-discovery-notifications.js','utf8');
const home=fs.readFileSync('assets/js/campaign-home-polish.js','utf8');

function assert(ok,msg){if(!ok)throw new Error(msg)}

// 1. Todo nó do mapa deve abrir o preview também em campanha normal;
//    a permissão deve bloquear apenas o CONTINUAR.
assert(modal.includes("const id=node.dataset.phase;e.preventDefault();e.stopImmediatePropagation();openPreview(id)"),'Clique em nó de fase ainda está condicionado ao #editor/desbloqueio');
assert(modal.includes("launch.disabled=!phaseAccessible(id)"),'CONTINUAR precisa refletir o desbloqueio da fase');
assert(!modal.includes("const id=node.dataset.phase;if(!phaseAccessible(id))return;\n e.preventDefault();e.stopImmediatePropagation();openPreview(id)"),'Guard antigo ainda impede abrir fases fora do #editor');

// 2. Os indicadores precisam apontar para os controles realmente visíveis do mapa atual.
for(const id of ['campaignHomeMenuBtn','campaignHomeDiscoveries'])assert(home.includes(`id=\"${id}\"`)||home.includes(`id='${id}'`)||home.includes(`id=\"${id}`)||home.includes(`id='${id}`)||home.includes(`id=\'${id}`)||home.includes(id),`Interface atual perdeu ${id}`);
for(const token of ["$('campaignHomeMenuBtn')","$('campaignHomeDiscoveries')","data.discovered||[]","rewardDiscoveries||[]"])assert(inbox.includes(token),`Inbox não cobre contrato real: ${token}`);

// 3. Se o mapa voltou à tela, qualquer intro do motor que apareça depois da conclusão
//    deve ser consumido mesmo sem launchingId.
assert(modal.includes("map.classList.contains('show')"),'Fechamento pós-fase precisa observar o mapa visível');
assert(modal.includes("if(engineIntro?.classList.contains('show'))engineStart?.click()"),'Intro interno precisa ser consumido');
assert(modal.includes("new MutationObserver(dismissEngineIntro).observe(engineIntro"),'Intro tardio precisa ser observado');

console.log('Campaign runtime regressions OK: map clicks, unread badges/discoveries and post-phase modal dismissal.');
