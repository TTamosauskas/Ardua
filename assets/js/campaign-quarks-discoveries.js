/* Ardua — discovery catalog additions introduced by the Quarks phase. */
(()=>{
'use strict';
const SAVE_KEY='stellarForgeV1013';
const C=window.ARDUA_CAMPAIGN,atlas=document.getElementById('discoveryAtlas'),modal=document.getElementById('menuModal');
if(!C||!atlas)return;

const QUARK='particle:quark',FORCE='phenomenon:strongNuclearForce',PROTON='particle:proton',NEUTRON='particle:neutron';
const LOCAL_TEXT=Object.freeze({
 [QUARK]:'Quarks são partículas elementares. Prótons e nêutrons são bárions formados por três quarks de valência, embora sua estrutura real também envolva glúons e pares quark-antiquark.',
 [FORCE]:'A Força Nuclear Forte mantém quarks ligados dentro de prótons e nêutrons; sua interação residual entre núcleons contribui para manter os núcleos atômicos ligados.'
});
const INDEX={...(window.ARDUA_DISCOVERY_INDEX||{}),
 [QUARK]:{title:'Quarks',type:'phenomenon',text:LOCAL_TEXT[QUARK]},
 [FORCE]:{title:'Força Nuclear Forte',type:'phenomenon',text:LOCAL_TEXT[FORCE]}
};
window.ARDUA_DISCOVERY_INDEX=Object.freeze(INDEX);
const PHASE_DISCOVERIES={};
for(const [id,entries] of Object.entries(window.ARDUA_PHASE_DISCOVERIES||{})){
 PHASE_DISCOVERIES[id]=Object.freeze((entries||[]).filter(entry=>entry?.key!==PROTON&&entry?.key!==NEUTRON));
}
PHASE_DISCOVERIES.quarks=Object.freeze([
 {key:QUARK,title:'Quarks',type:'phenomenon'},
 {key:FORCE,title:'Força Nuclear Forte',type:'phenomenon'},
 {key:PROTON,title:'Próton',type:'phenomenon'},
 {key:NEUTRON,title:'Nêutron',type:'phenomenon'}
]);
window.ARDUA_PHASE_DISCOVERIES=Object.freeze(PHASE_DISCOVERIES);

const readSave=()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(_e){return{}}};
function knownNow(){
 const data=readSave(),rewards=new Set(data.rewardDiscoveries||[]),done=new Set(C.getState?.().completed||[]);
 return{rewards,unlocked:C.editor||done.has('quarks')||rewards.has(QUARK)||rewards.has(FORCE)};
}
function makeCard(key,title,glyph,group){
 const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked quarks-discovery-card';b.dataset.discoveryKey=key;b.dataset.discoveryText=LOCAL_TEXT[key]||'';
 b.innerHTML=`<span class="discovery-glyph">${glyph}</span><span><strong>${title}</strong><small>${group}</small></span>`;
 return b;
}
function panel(){return atlas.querySelector('[data-discovery-panel="phenomena"]')||atlas}
function sync(){
 const host=panel(),{rewards,unlocked}=knownNow(),visible=unlocked||rewards.has(QUARK)||rewards.has(FORCE);
 const specs=[
  [QUARK,'Quarks','q','Partículas'],
  [FORCE,'Força Nuclear Forte','✦','Processos nucleares']
 ];
 for(const [key,title,glyph,group] of specs){
  let card=host.querySelector(`[data-discovery-key="${key}"]`);
  if(visible&&!card){card=makeCard(key,title,glyph,group);host.appendChild(card)}
  if(card)card.hidden=!visible;
 }
 const baryonsUnlocked=unlocked||rewards.has(PROTON)||rewards.has(NEUTRON);
 for(const key of [PROTON,NEUTRON]){
  const card=host.querySelector(`[data-discovery-key="${key}"]`);if(card)card.hidden=!baryonsUnlocked;
 }
 if(visible)host.querySelectorAll('.discovery-empty').forEach(x=>x.remove());
}
function polishDetail(){
 const detail=document.getElementById('phenomenonDiscoveryDetail'),title=detail?.dataset.title,body=document.getElementById('phenomenonDiscoveryBody');
 if(!detail||detail.hidden||!body||!body.querySelector('.phenomenon-source-actions'))return;
 const copy=body.querySelector('.phenomenon-wiki-copy'),link=body.querySelector('.phenomenon-source-btn');if(!copy)return;
 if(title==='Quarks'){
  if(copy.dataset.quarksCopy!=='quarks'){
   copy.dataset.quarksCopy='quarks';
   copy.innerHTML='<p><strong>Quarks</strong> são partículas elementares. Nesta fase usamos os quarks de valência: dois <strong>u</strong> e um <strong>d</strong> formam um próton (<strong>uud</strong>), enquanto um <strong>u</strong> e dois <strong>d</strong> formam um nêutron (<strong>udd</strong>). A estrutura real dos hádrons também envolve glúons e pares quark-antiquark.</p>';
  }
  if(link)link.href='https://pt.wikipedia.org/wiki/Quark';
 }else if(title==='Força Nuclear Forte'){
  if(copy.dataset.quarksCopy!=='strong-force'){
   copy.dataset.quarksCopy='strong-force';
   copy.innerHTML='<p>A <strong>Força Nuclear Forte</strong> é a interação fundamental descrita pela cromodinâmica quântica. Ela mantém os quarks ligados em prótons e nêutrons; a interação forte residual entre núcleons contribui para manter os núcleos atômicos ligados.</p>';
  }
  if(link)link.href='https://pt.wikipedia.org/wiki/Intera%C3%A7%C3%A3o_forte';
 }
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();polishDetail()})}
new MutationObserver(schedule).observe(atlas,{childList:true,subtree:true});
if(modal)new MutationObserver(schedule).observe(modal,{childList:true,subtree:true});
window.addEventListener('ardua:campaign-progress',schedule);
window.addEventListener('ardua:discovery-unread-change',schedule);
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY)schedule()});
sync();
})();
