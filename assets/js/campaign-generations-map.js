/* Ardua — generation landmarks and phase annotations for the campaign map. */
(()=>{
'use strict';
const GEN=window.ARDUA_GENERATIONS,map=document.getElementById('campaignMap');if(!GEN||!map)return;
function banner(key,subtitle=''){
 const d=GEN.defs[key],el=document.createElement('section');el.className=`generation-banner generation-${key}`;el.dataset.generationBanner=key;
 const birth=d.birthSymbols?.length?`<div class="generation-context"><b>NASCE COM</b><span>${d.birthSymbols.join(' · ')}</span></div>`:'';
 const production=d.productionSummary?`<div class="generation-context generation-production"><b>PRODUÇÃO ENSINADA NESTE CAPÍTULO</b><span>${d.productionSummary}</span></div>`:'';
 el.innerHTML=`<span>${d.number?`${d.number}ª GERAÇÃO`:'PRÓLOGO'}</span><strong>${d.title}</strong><small>${subtitle||d.description}</small>${birth}${production}`;return el;
}
function ensureBefore(target,key,subtitle=''){
 if(!target||map.querySelector(`[data-generation-banner="${key}"]`))return;target.before(banner(key,subtitle));
}
function annotate(){
 map.querySelectorAll('.phase-node[data-phase]').forEach(el=>{const id=el.dataset.phase,key=GEN.generationOf(id);if(key)el.dataset.generation=key;el.dataset.generationRole=GEN.roleOf(id)});
 const stellar=[...map.querySelectorAll('.branch-cluster[data-branch-group="stellar"]')].find(el=>el.getClientRects().length)||map.querySelector('.branch-cluster[data-branch-group="stellar"]');
 ensureBefore(stellar,'first','A estrela nasce quase só com H, He e Li; C, N, O e os elementos seguintes serão fabricados durante sua evolução.');
 const cycle=map.querySelector('.cycle-grid');ensureBefore(cycle,'second','Produtos antes fabricados passam a existir desde o nascimento: a herança química vira matéria-prima.');
 const rp=map.querySelector('.portal[data-portal="rp"]');ensureBefore(rp,'third','A matéria inicial já carrega produtos do processo-s e do processo-r de ciclos anteriores.');
}
annotate();new MutationObserver(annotate).observe(map,{subtree:true,childList:true});
})();
