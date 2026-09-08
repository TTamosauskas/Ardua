const fs=require('fs');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const inbox=fs.readFileSync('assets/js/campaign-discovery-notifications.js','utf8');
const css=fs.readFileSync('assets/css/campaign-discovery-notifications.css','utf8');
const home=fs.readFileSync('assets/js/campaign-home-polish.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const index=fs.readFileSync('index.html','utf8');

function assert(ok,msg){if(!ok)throw new Error(msg)}

// 1. Em campanha normal todo nó reage ao clique. A permissão controla apenas CONTINUAR.
assert(modal.includes("const id=node.dataset.phase;e.preventDefault();e.stopImmediatePropagation();openPreview(id)"),'Clique em nó de fase ainda depende de #editor/desbloqueio');
assert(modal.includes("launch.disabled=!phaseAccessible(id)"),'CONTINUAR precisa refletir o desbloqueio da fase');
assert(modal.includes("const id=previewId;if(!id||!phaseAccessible(id))return"),'Lançamento precisa continuar bloqueando fases indisponíveis');

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

console.log('Campaign runtime regressions OK: map clicks, live unread badges, element/phenomenon tracking and post-phase modal dismissal.');
