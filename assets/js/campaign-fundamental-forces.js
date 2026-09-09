/* Ardua — the remaining fundamental forces as campaign discoveries. */
(()=>{
'use strict';
const SAVE_KEY='stellarForgeV1013';
const C=window.ARDUA_CAMPAIGN,atlas=document.getElementById('discoveryAtlas'),modal=document.getElementById('menuModal');
if(!C||!atlas)return;

const FORCES=Object.freeze([
 Object.freeze({key:'phenomenon:electromagneticForce',title:'Força Eletromagnética',glyph:'⚡',group:'Forças fundamentais',phase:'atomic_he',text:'A força eletromagnética atua entre partículas com carga elétrica. Na formação dos primeiros átomos, ela permite que elétrons fiquem ligados aos núcleos.'}),
 Object.freeze({key:'phenomenon:gravitationalForce',title:'Força Gravitacional',glyph:'G',group:'Forças fundamentais',phase:'brown_formation',text:'A gravidade atrai matéria e, em grandes escalas, reúne gás e poeira até formar protoestrelas e outros corpos celestes.'}),
 Object.freeze({key:'phenomenon:weakNuclearForce',title:'Força Nuclear Fraca',glyph:'W',group:'Forças fundamentais',phase:'he_orange',text:'A força nuclear fraca permite transformar tipos de partículas. Na cadeia próton-próton, ela converte um próton em nêutron e produz um pósitron e um neutrino.'})
]);

const index={...(window.ARDUA_DISCOVERY_INDEX||{})};
for(const f of FORCES)index[f.key]=Object.freeze({key:f.key,title:f.title,group:f.group,glyph:f.glyph,text:f.text,type:'phenomenon'});
window.ARDUA_DISCOVERY_INDEX=Object.freeze(index);

const byPhase={};
for(const [id,entries] of Object.entries(window.ARDUA_PHASE_DISCOVERIES||{}))byPhase[id]=[...(entries||[])];
for(const f of FORCES){const list=byPhase[f.phase]||[];if(!list.some(x=>x?.key===f.key))list.push(Object.freeze({key:f.key,title:f.title,group:f.group}));byPhase[f.phase]=list}
window.ARDUA_PHASE_DISCOVERIES=Object.freeze(Object.fromEntries(Object.entries(byPhase).map(([id,entries])=>[id,Object.freeze(entries)])));

function readSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(_e){return{}}}
function earned(f,done,rewards){return C.editor||done.has(f.phase)||rewards.has(f.key)}
function grantEarned(){
 const data=readSave(),rewards=new Set(data.rewardDiscoveries||[]),done=new Set(C.getState?.().completed||[]);let changed=false;
 for(const f of FORCES)if(done.has(f.phase)&&!rewards.has(f.key)){rewards.add(f.key);changed=true}
 if(changed)localStorage.setItem(SAVE_KEY,JSON.stringify({...data,rewardDiscoveries:[...rewards]}));
 return{done,rewards:changed?new Set([...rewards]):rewards};
}
function panel(){return atlas.querySelector('[data-discovery-panel="phenomena"]')||atlas}
function makeCard(f){
 const b=document.createElement('button');b.type='button';b.className='discovery-card unlocked fundamental-force-discovery-card';b.dataset.discoveryKey=f.key;b.dataset.discoveryText=f.text;
 b.innerHTML=`<span class="discovery-glyph">${f.glyph}</span><span><strong>${f.title}</strong><small>${f.group}</small></span>`;return b;
}
function sync(){
 const host=panel(),{done,rewards}=grantEarned();
 for(const f of FORCES){
  const visible=earned(f,done,rewards);let card=host.querySelector(`[data-discovery-key="${f.key}"]`);
  if(visible&&!card){card=makeCard(f);host.appendChild(card)}
  if(card){card.hidden=!visible;card.dataset.discoveryText=f.text}
 }
 if(FORCES.some(f=>earned(f,done,rewards)))host.querySelectorAll('.discovery-empty').forEach(x=>x.remove());
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
new MutationObserver(schedule).observe(atlas,{childList:true,subtree:true});
if(modal)new MutationObserver(schedule).observe(modal,{attributes:true,attributeFilter:['class']});
window.addEventListener('ardua:campaign-progress',schedule);
window.addEventListener('ardua:discovery-unread-change',schedule);
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY)schedule()});
sync();
})();
