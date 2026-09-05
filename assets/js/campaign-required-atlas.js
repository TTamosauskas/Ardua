/* Ardua — promote reaction Atlas phases into mandatory campaign trail steps. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;
if(!G)return;

const byAnchor={};
for(const item of G.atlas){
 (byAnchor[item.anchor]||(byAnchor[item.anchor]=[])).push(item.id);
 item.required=true;
}
const tail=id=>{
 const group=byAnchor[id];
 return group?.length?group[group.length-1]:id;
};

// Every exit from an anchor now leaves from the end of its reaction chain.
for(const [id,rule] of Object.entries(G.prerequisites)){
 if(G.atlasById[id])continue;
 if(rule.allOf)rule.allOf=rule.allOf.map(tail);
 if(rule.anyOf)rule.anyOf=rule.anyOf.map(group=>group.map(tail));
}

// Reaction phases themselves form a mandatory linear chain after their anchor.
for(const [anchor,ids] of Object.entries(byAnchor)){
 ids.forEach((id,index)=>{
  G.prerequisites[id]={allOf:[index?ids[index-1]:anchor]};
 });
}

window.ARDUA_REQUIRED_ATLAS={byAnchor,tail,expand(ids){return ids.flatMap(id=>[id,...(byAnchor[id]||[])])}};
})();
