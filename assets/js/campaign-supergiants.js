/* Ardua — supergiant branch rules. Loaded after required Atlas and before campaign mode. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,A=window.ARDUA_REQUIRED_ATLAS;
if(!G||!A)return;

const routes=Object.freeze({
 red:Object.freeze(['ne','proton_capture','na','carbon_oxygen','mg','al']),
 yellow:Object.freeze(['oxygen_burn','si','p','s']),
 blue:Object.freeze(['cl','ar','k','ca','sc','ti'])
});
const shared=Object.freeze(['v','cr','mn','cr_alpha_fe','fe','ni_fusion','co']);
const entry='high_mass_formation';
const precursor='carbon_burn';
const tail=id=>A.tail(id);

for(const ids of Object.values(routes)){
 ids.forEach((id,index)=>{
  G.prerequisites[id]={allOf:[index?tail(ids[index-1]):tail(precursor)]};
 });
}
G.prerequisites[shared[0]]={anyOf:Object.values(routes).map(ids=>[tail(ids[ids.length-1])])};

window.ARDUA_SUPERGIANTS=Object.freeze({
 entry,
 precursor,
 routes,
 shared,
 routeOrder:Object.freeze(['red','yellow','blue']),
 routeLabels:Object.freeze({red:'Supergigante Vermelha',yellow:'Supergigante Amarela',blue:'Supergigante Azul'}),
 routeClasses:Object.freeze({red:'supergiant-red',yellow:'supergiant-yellow',blue:'supergiant-blue'}),
 tail
});
})();
