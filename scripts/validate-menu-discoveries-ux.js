const fs=require('fs');

const read=p=>fs.readFileSync(p,'utf8');
const menu=read('assets/js/campaign-fork-links.js');
const polish=read('assets/js/phase-polish.js');
const home=read('assets/js/campaign-home-polish.js');
const rotation=read('assets/js/rotation-polish.js');
const elements=read('assets/js/campaign-discoveries-elements.js');
const phenomena=read('assets/js/campaign-discoveries-phenomena.js');
const engine=read('assets/js/ardua.js');
const css=read('assets/css/phase-polish.css');

function requireToken(text,token,label){if(!text.includes(token))throw new Error(`${label}: ${token}`)}
function forbidToken(text,token,label){if(text.includes(token))throw new Error(`${label}: ${token}`)}

requireToken(menu,'<span>Recomeçar Fase</span>','Rótulo de reinício da fase ausente');
requireToken(menu,"const id=window.ARDUA_CAMPAIGN?.getState?.().activeId",'Recomeçar Fase deve resolver a fase ativa');
requireToken(menu,'if(button)button.click()','Recomeçar Fase deve reentrar pela fase ativa');
requireToken(menu,"applySound(!soundtrackEnabled(),true);closeQuickMenu(false)",'Trilha sonora deve fechar o menu da fase');
forbidToken(polish,'window.location.reload()','Recomeçar Fase não pode recarregar o jogo inteiro');

requireToken(home,"applySound(!soundtrackEnabled());closeMenu(false)",'Trilha sonora deve fechar também o menu do mapa');
requireToken(rotation,"if(id==='phaseQuickRotation')document.querySelector('#phaseQuickMenu .phase-quick-close')?.click()",'Rotação deve fechar o menu da fase');
requireToken(rotation,"else if(id==='campaignHomeRotation')document.querySelector('#campaignHomeMenu .campaign-home-menu-close')?.click()",'Rotação deve fechar o menu do mapa');
requireToken(rotation,'const pivot=points.reduce','Rotação deve usar a célula central real como pivô');
requireToken(rotation,'geometry={key,cx:pivot.x,cy:pivot.y,hull}','Pivô da órbita deve coincidir com a célula central');
requireToken(rotation,'if(r<1)return{x:g.cx,y:g.cy}','Átomo central deve permanecer fixo');

requireToken(engine,'const open=discoveryUnlocked(entry);if(!open)continue','Atlas deve ignorar entradas ainda não descobertas');
requireToken(css,'#menuModal.discoveries-view .discovery-card.locked{display:none!important}','DOM legado não pode exibir cartões bloqueados');

for(const [text,name,back] of [[elements,'Elementos','data-element-detail-back'],[phenomena,'Fenômenos','data-phenomenon-detail-back']]){
  forbidToken(text,back,`${name}: botão de voltar não deve existir`);
  forbidToken(text,'tabs.hidden=on',`${name}: abas não podem desaparecer no detalhe`);
  requireToken(text,"if(tabs)tabs.hidden=false",`${name}: abas devem permanecer visíveis`);
  requireToken(text,"insertAdjacentElement('afterend',detail)",`${name}: detalhe deve abrir abaixo das abas`);
}
requireToken(elements,'leaveElementDetail(false)','Elementos: troca de aba deve encerrar detalhe sem reverter a aba escolhida');
requireToken(phenomena,'leaveDetail(false)','Fenômenos: troca de aba deve encerrar detalhe sem reverter a aba escolhida');

for(const token of [
 "title!=='PROCESSO COMPLETO'||kicker!=='MARCO'",
 "ambient.classList.contains('show')",
 "ambient.classList.contains('awaiting-continue')",
 "ambientContinue&&!ambientContinue.hidden",
 'new MutationObserver(suppressGenericPhaseComplete)'
])requireToken(polish,token,'O marco genérico PROCESSO COMPLETO não pode voltar a aparecer');

const history=[
 "'phenomenon:bigBang'",
 "'particle:quark'",
 "'phenomenon:strongNuclearForce'",
 "'particle:proton'",
 "'particle:neutron'",
 "'phenomenon:primordialNucleosynthesis'"
];
let previous=-1;
for(const token of history){
 const at=phenomena.indexOf(token);if(at<0||at<=previous)throw new Error(`Fenômenos perdeu a abertura cronológica: ${token}`);previous=at;
}
for(const token of [
 'const PHENOMENON_HISTORY_PREFIX=Object.freeze([',
 "const base=G?.baseOrder||G?.runtimeOrder||[]",
 'window.ARDUA_PHASE_DISCOVERIES||{}',
 'function sortCardsByHistory()',
 'sortCardsByHistory();',
 "'phenomenon:freezeout':'u'",
 "'phenomenon:hawkingRadiation':'black_hole'"
])requireToken(phenomena,token,'Fenômenos precisa permanecer em cronologia cosmológica/campanha');

console.log('Phase menu, discoveries detail, chronological phenomena, generic completion suppression and central rotation UX contract OK.');
