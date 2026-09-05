/* Ardua — expose the Quasar recipe and phenomenon in Discoveries. */
(()=>{
'use strict';
const Q=window.ARDUA_QUASAR,C=window.ARDUA_CAMPAIGN;
if(!Q||!C)return;
const $=id=>document.getElementById(id);
function open(){return C.editor||C.getState().completed.includes(Q.id)}
function sync(){
 const atlas=$('discoveryAtlas'),detail=$('discoveryDetail');if(!atlas||!open())return;
 atlas.querySelector('[data-quasar-discovery]')?.remove();
 const group=document.createElement('div');group.className='discovery-group';group.dataset.quasarDiscovery='group';group.textContent='Eventos cósmicos';
 const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked';b.dataset.quasarDiscovery='card';b.innerHTML='<span class="discovery-glyph">Q</span><span><strong>Quasar</strong><small>Eventos cósmicos</small></span>';
 b.addEventListener('click',()=>{if(detail)detail.innerHTML='<strong>Quasar</strong><span>Núcleo galáctico ativo</span><p>Um buraco negro supermassivo alimentado por um disco de acreção pode converter energia gravitacional em radiação extrema.</p>'});
 atlas.append(group,b);
 const reactions=$('trailReactionCatalog');if(reactions){
  [...reactions.querySelectorAll('.trail-reaction')].filter(x=>x.textContent.trim()==='Quasar').forEach(x=>x.remove());
  reactions.querySelector('[data-quasar-recipe]')?.remove();
  const chip=document.createElement('span');chip.className='reaction-chip trail-reaction';chip.dataset.quasarRecipe='true';chip.textContent=Q.recipe;reactions.appendChild(chip);
 }
}
$('campaignData')?.addEventListener('click',()=>requestAnimationFrame(()=>requestAnimationFrame(sync)));
window.addEventListener('ardua:campaign-progress',()=>setTimeout(sync,0));
setTimeout(sync,0);
})();
