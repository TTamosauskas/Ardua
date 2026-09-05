/* Ardua — Quasar campaign graph extension. Loaded before campaign-mode. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;
if(!G||G.runtimeOrder.includes('quasar'))return;
const id='quasar';
G.baseOrder.push(id);
G.runtimeOrder.push(id);
G.baseIndex[id]=G.baseOrder.length-1;
G.runtimeIndex[id]=G.runtimeOrder.length-1;
G.prerequisites[id]={allOf:['black_hole']};
G.sequences.quasar=[id];
window.ARDUA_QUASAR=Object.freeze({
 id,
 prerequisite:'black_hole',
 title:'Quasar',
 branch:'Núcleo galáctico ativo',
 target:6,
 recipe:'Gás orbital + Gás orbital → Gás em acreção + radiação'
});
})();
