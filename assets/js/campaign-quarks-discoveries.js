/* Ardua — discovery catalog additions introduced by the Quarks phase. */
(()=>{
'use strict';
const SAVE_KEY='stellarForgeV1013';
const C=window.ARDUA_CAMPAIGN,atlas=document.getElementById('discoveryAtlas');
if(!C||!atlas)return;

const QUARK='particle:quark',FORCE='phenomenon:strongNuclearForce',PROTON='particle:proton',NEUTRON='particle:neutron';
const INDEX={...(window.ARDUA_DISCOVERY_INDEX||{}),
 [QUARK]:{title:'Quarks',type:'phenomenon'},
 [FORCE]:{title:'Força Nuclear Forte',type:'phenomenon'}
};
window.ARDUA_DISCOVERY_INDEX=Object.freeze(INDEX);
window.ARDUA_PHASE_DISCOVERIES=Object.freeze({...(window.ARDUA_PHASE_DISCOVERIES||{}),quarks:Object.freeze([
 {key:QUARK,title:'Quarks',type:'phenomenon'},
 {key:FORCE,title:'Força Nuclear Forte',type:'phenomenon'},
 {key:PROTON,title:'Próton',type:'phenomenon'},
 {key:NEUTRON,title:'Nêutron',type:'phenomenon'}
])});

const readSave=()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(_e){return{}}};
function knownNow(){
 const data=readSave(),rewards=new Set(data.rewardDiscoveries||[]),done=new Set(C.getState?.().completed||[]);
 return{rewards,unlocked:C.editor||done.has('quarks')||rewards.has(QUARK)||rewards.has(FORCE)};
}
function makeCard(key,title,glyph,group){
 const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked quarks-discovery-card';b.dataset.discoveryKey=key;
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
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
new MutationObserver(schedule).observe(atlas,{childList:true,subtree:true});
window.addEventListener('ardua:campaign-progress',schedule);
window.addEventListener('ardua:discovery-unread-change',schedule);
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY)schedule()});
sync();
})();
