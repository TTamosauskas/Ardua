/* Ardua — inserts the Quarks lesson between Big Bang and primordial deuterium. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,INBOX_KEY='arduaDiscoveryInboxV1';
if(!G)return;

G.prerequisites.quarks={allOf:['bigbang']};
G.prerequisites.primordial_d={allOf:['quarks']};

/* Quarks stays outside the native engine runtime order. Its map node is rendered explicitly
   by campaign-quarks-map.js, while the graph owns only progression and migration rules. */

/* Existing campaigns that already passed deuterium inherit Quarks as completed,
   while saves parked at the old deuterium gate are invited to play the new lesson. */
window.addEventListener('DOMContentLoaded',()=>{
 const C=window.ARDUA_CAMPAIGN;if(!C||C.editor)return;
 const st=C.getState?.()||{},done=new Set(st.completed||[]);if(done.has('quarks'))return;
 const dIndex=G.runtimeIndex?.primordial_d;
 if(!Number.isInteger(dIndex))return;
 const completedPastDeuterium=[...done].some(id=>{
  const i=G.runtimeIndex?.[id];return Number.isInteger(i)&&i>=dIndex;
 });
 const activeIndex=G.runtimeIndex?.[st.activeId],activePastDeuterium=Number.isInteger(activeIndex)&&activeIndex>dIndex;
 if(!(completedPastDeuterium||activePastDeuterium))return;
 C.markCompleted('quarks');
 try{
  const historical=['particle:quark','phenomenon:strongNuclearForce','particle:proton','particle:neutron'];
  const inbox=JSON.parse(localStorage.getItem(INBOX_KEY)||'{}')||{},known=new Set(inbox.known||[]),unread=new Set(inbox.unread||[]);
  historical.forEach(key=>{known.add(key);unread.delete(key)});
  const next=JSON.stringify({...inbox,version:1,known:[...known],unread:[...unread]});localStorage.setItem(INBOX_KEY,next);
  let event;
  try{event=new StorageEvent('storage',{key:INBOX_KEY,newValue:next,storageArea:localStorage})}
  catch(_e){event=new Event('storage');Object.defineProperties(event,{key:{value:INBOX_KEY},newValue:{value:next}})}
  window.dispatchEvent(event);
 }catch(_e){}
},{once:true});
})();
