/* Ardua — giant branch rules after stellar lithium production. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,A=window.ARDUA_REQUIRED_ATLAS;
if(!G||!A)return;

const routes=Object.freeze({
 red:Object.freeze(['c']),
 yellow:Object.freeze(['n']),
 blue:Object.freeze(['o']),
 white:Object.freeze(['fragile'])
});
const precursor='giant_formation';
const convergence=G.sequences.sprocess[0];
const tail=id=>A.tail(id);

for(const ids of Object.values(routes)){
 ids.forEach((id,index)=>{
  G.prerequisites[id]={allOf:[index?tail(ids[index-1]):tail(precursor)]};
 });
}
G.prerequisites[convergence]={anyOf:Object.values(routes).map(ids=>[tail(ids[ids.length-1])])};

window.ARDUA_GIANTS=Object.freeze({
 precursor,
 routes,
 convergence,
 routeOrder:Object.freeze(['red','yellow','blue','white']),
 routeLabels:Object.freeze({
  red:'Gigante Vermelha',
  yellow:'Gigante Amarela',
  blue:'Gigante Azul',
  white:'Gigante Branca'
 }),
 routeClasses:Object.freeze({
  red:'giant-red',
  yellow:'giant-yellow',
  blue:'giant-blue',
  white:'giant-white'
 }),
 tail
});
})();
