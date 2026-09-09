/* Ardua — inserts the Quarks lesson between Big Bang and primordial deuterium. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,A=window.ARDUA_REQUIRED_ATLAS;
if(!G||!A)return;

G.prerequisites.quarks={allOf:['bigbang']};
G.prerequisites.primordial_d={allOf:['quarks']};

/* The engine runtime order remains untouched. The map alone receives the custom phase. */
const nativeExpand=A.expand.bind(A);
A.expand=function(ids){
 const source=Array.isArray(ids)?ids:[],out=nativeExpand(source);
 if(source.length===1&&source[0]==='primordial_d'&&!out.includes('quarks'))return['quarks',...out];
 return out;
};

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
 window.dispatchEvent(new CustomEvent('ardua:discovery-inbox-baseline',{detail:{keys:['particle:quark','phenomenon:strongNuclearForce','particle:proton','particle:neutron']}}));
},{once:true});
})();
