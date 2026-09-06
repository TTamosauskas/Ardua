/* Ardua — generation landmarks and phase annotations for the campaign map. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,map=document.getElementById('campaignMap');if(!G||!G.generations||!map)return;
function banner(key,subtitle=''){
 const d=G.generations[key],el=document.createElement('section');el.className=`generation-banner generation-${key}`;el.dataset.generationBanner=key;
 el.innerHTML=`<span>${d.number?`${d.number}ª GERAÇÃO`:'PRÓLOGO'}</span><strong>${d.title}</strong><small>${subtitle||d.description}</small>`;return el;
}
function ensureBefore(target,key,subtitle=''){
 if(!target||map.querySelector(`[data-generation-banner="${key}"]`))return;target.before(banner(key,subtitle));
}
function annotate(){
 map.querySelectorAll('.phase-node[data-phase]').forEach(el=>{const key=G.generationOf?.(el.dataset.phase);if(key)el.dataset.generation=key});
 const stellar=[...map.querySelectorAll('.branch-cluster[data-branch-group="stellar"]')].find(el=>el.getClientRects().length)||map.querySelector('.branch-cluster[data-branch-group="stellar"]');
 ensureBefore(stellar,'first','As primeiras estrelas abrem caminhos de massas e destinos diferentes.');
 const cycle=map.querySelector('.cycle-grid');ensureBefore(cycle,'second','O enriquecimento químico reorganiza os caminhos sem apagar as bifurcações estelares.');
 const rp=map.querySelector('.portal[data-portal="rp"]');ensureBefore(rp,'third','Sistemas compactos maduros reutilizam uma matéria que já atravessou múltiplos ciclos estelares.');
}
annotate();new MutationObserver(annotate).observe(map,{subtree:true,childList:true});
})();
