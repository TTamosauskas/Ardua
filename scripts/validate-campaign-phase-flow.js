const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const opening=fs.readFileSync('assets/js/campaign-opening.js','utf8');
const music=fs.readFileSync('assets/js/music.js','utf8');
const mode=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const must=["Leve o Hélio até o núcleo estelar. — ${done}/${s.target}","Clique no átomo e avance um espaço por vez","window.dispatchEvent(new CustomEvent('ardua:phase-ended'","const stellarDustEnd=!isPrimordial(s)"];
for(const x of must)if(!engine.includes(x))throw new Error('Contrato de fluxo ausente: '+x);
if(map.includes('Evolução de longa vida'))throw new Error('Título removido voltou ao mapa');
if(modal.includes('Descobertas da fase:')||modal.includes('phase-preview-discoveries'))throw new Error('Modal voltou a revelar descobertas');
if(!map.includes("if(group!=='neutron')addPath(from,fork,`branch-fork ${group}`,.46)"))throw new Error('Linha neutron removida voltou ao mapa');
for(const token of ["launch.textContent='CONTINUAR'","st.activeId===id||done.has(id)||C.isUnlocked?.(id)","const id=previewId,node=previewNode;if(!id||!phaseAccessible(id))return","openPreview(id,node)","function nativeLaunchFromMap(id,node)","node.click()","#mapDetail [data-launch]","button.click()","new MutationObserver(dismissEngineIntro).observe(engineIntro","function shouldDismissEngineIntro(){return map.classList.contains('show')||"]){if(!modal.includes(token))throw new Error('Fluxo de modal de fase perdeu contrato: '+token)}
if(modal.includes('function enginePhaseButton(id)'))throw new Error('Modal voltou a lançar fase pelo menu interno do motor');
if(modal.includes("C.setActive?.(id);\n map.classList.remove('show')"))throw new Error('Modal voltou a contornar o lançador nativo do mapa');
if(modal.includes("launch.textContent=completed(id)?'REVISITAR':'EXPLORAR'"))throw new Error('Modal de fase voltou ao fluxo antigo Explorar/Revisitar');

if(opening.includes('openCurrentPhaseDetail')||opening.includes('PRÓXIMA FASE'))throw new Error('Big Bang voltou a abrir automaticamente o modal/detalhe da próxima fase');
for(const token of ["const MUSIC_AFTER_BURST_MS=90","function openTrailWithBurst()","map.classList.add('bigbang-revealing','trail-revealed','bigbang-expanding')","makeBurst();","detail.classList.remove('show');detail.innerHTML=''","setTimeout(()=>{window.ARDUA_MUSIC?.play?.();window.ARDUA_MUSIC?.sync?.()},MUSIC_AFTER_BURST_MS)"]){if(!opening.includes(token))throw new Error('Ordem audiovisual do Big Bang perdeu contrato: '+token)}
const burstStart=opening.indexOf('openTrailWithBurst();'),musicStart=opening.indexOf("setTimeout(()=>{window.ARDUA_MUSIC?.play?.()");
if(burstStart<0||musicStart<0||burstStart>=musicStart)throw new Error('A música deve iniciar somente depois de a animação do Big Bang ser disparada');
for(const token of ["audio.autoplay=false","function holdForBigBang()","if(!map)return true","map.classList.contains('awaiting-bigbang')","if(holdForBigBang()){armUnlock();return}"]){if(!music.includes(token))throw new Error('Bloqueio musical antes do Big Bang perdeu contrato: '+token)}
for(const token of ["function suppressLegacyBigBangIntro()","if(EDITOR_MODE||graphState.introduced||graphState.activeId!=='bigbang')return","new MutationObserver(hide)","intro.classList.remove('show')","window.addEventListener('ardua:campaign-progress',release)","suppressLegacyBigBangIntro();"]){if(!mode.includes(token))throw new Error('Supressão do modal legado de Big Bang perdeu contrato: '+token)}

console.log('Campaign phase flow UX OK: Big Bang anima antes da música, mapa abre limpo e popup legado não pisca no carregamento.');
