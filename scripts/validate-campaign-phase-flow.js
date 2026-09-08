const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const must=["Leve o Hélio até o núcleo estelar. — ${done}/${s.target}","Clique no átomo e avance um espaço por vez","window.dispatchEvent(new CustomEvent('ardua:phase-ended'","const stellarDustEnd=!isPrimordial(s)"];
for(const x of must)if(!engine.includes(x))throw new Error('Contrato de fluxo ausente: '+x);
if(map.includes('Evolução de longa vida'))throw new Error('Título removido voltou ao mapa');
if(modal.includes('Descobertas da fase:')||modal.includes('phase-preview-discoveries'))throw new Error('Modal voltou a revelar descobertas');
if(!map.includes("if(group!=='neutron')addPath(from,fork,`branch-fork ${group}`,.46)"))throw new Error('Linha neutron removida voltou ao mapa');
for(const token of ["launch.textContent='CONTINUAR'","st.activeId===id||done.has(id)||C.isUnlocked?.(id)","const id=previewId,node=previewNode;if(!id||!phaseAccessible(id))return","openPreview(id,node)","function nativeLaunchFromMap(id,node)","node.click()","#mapDetail [data-launch]","button.click()","new MutationObserver(dismissEngineIntro).observe(engineIntro","function shouldDismissEngineIntro(){return map.classList.contains('show')||"]){if(!modal.includes(token))throw new Error('Fluxo de modal de fase perdeu contrato: '+token)}
if(modal.includes('function enginePhaseButton(id)'))throw new Error('Modal voltou a lançar fase pelo menu interno do motor');
if(modal.includes("C.setActive?.(id);\n map.classList.remove('show')"))throw new Error('Modal voltou a contornar o lançador nativo do mapa');
if(modal.includes("launch.textContent=completed(id)?'REVISITAR':'EXPLORAR'"))throw new Error('Modal de fase voltou ao fluxo antigo Explorar/Revisitar');
console.log('Campaign phase flow UX OK: CONTINUAR usa o lançador nativo do mapa.');
