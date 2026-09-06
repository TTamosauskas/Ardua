/* Ardua — generation landmarks and phase annotations for the campaign map. */
(()=>{
'use strict';
const GEN=window.ARDUA_GENERATIONS,map=document.getElementById('campaignMap');if(!GEN||!map)return;
function banner(key,subtitle=''){
 const d=GEN.defs[key],el=document.createElement('section');el.className=`generation-banner generation-${key}`;el.dataset.generationBanner=key;
 const birth=d.birthSymbols?.length?`<div class="generation-context"><b>NASCE COM</b><span>${d.birthSymbols.join(' · ')}</span></div>`:'';
 const production=d.productionSummary?`<div class="generation-context generation-production"><b>PRODUÇÃO ENSINADA NESTE CAPÍTULO</b><span>${d.productionSummary}</span></div>`:'';
 const note=key==='first'?`<div class="generation-model-note">${GEN.modelNote}</div>`:'';
 el.innerHTML=`<span>${d.number?`${d.number}ª GERAÇÃO`:'PRÓLOGO'}</span><strong>${d.title}</strong><small>${subtitle||d.description}</small>${birth}${production}${note}`;return el;
}
function ensureBefore(target,key,subtitle=''){
 if(!target||map.querySelector(`[data-generation-banner="${key}"]`))return;target.before(banner(key,subtitle));
}
function annotate(){
 map.querySelectorAll('.phase-node[data-phase]').forEach(el=>{const id=el.dataset.phase,key=GEN.generationOf(id),role=GEN.roleOf(id);if(key)el.dataset.generation=key;else delete el.dataset.generation;el.dataset.generationRole=role});
 const stellar=[...map.querySelectorAll('.branch-cluster[data-branch-group="stellar"]')].find(el=>el.getClientRects().length)||map.querySelector('.branch-cluster[data-branch-group="stellar"]');
 ensureBefore(stellar,'first','A primeira estrela nasce quase só com H, He e Li e precisa fabricar as sementes pesadas que o Universo ainda não possui.');
 const second=map.querySelector('.second-generation-branches');
 ensureBefore(second,'second','Metais produzidos pela Primeira Geração passam a existir desde o nascimento e tornam capturas sobre sementes pesadas uma nova possibilidade.');
 const third=map.querySelector('.third-generation-zone')||map.querySelector('.neutron-branches');
 ensureBefore(third,'third','Depois do enriquecimento por estrelas AGB e outros canais, sistemas compactos reciclam matéria em condições extremas.');
}
annotate();new MutationObserver(annotate).observe(map,{subtree:true,childList:true});
})();
