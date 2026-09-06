const fs=require('fs');
const path='assets/js/ardua.js';
let src=fs.readFileSync(path,'utf8');
function once(oldText,newText,label){
 const count=src.split(oldText).length-1;
 if(count!==1)throw new Error(`${label}: esperado 1 match, encontrado ${count}`);
 src=src.replace(oldText,newText);
}

once(
"function stellarFormationFiveLayerAtomSize(){return Math.max(36,Math.min(72,starSize()*.88/(2*4+1)))}\nfunction stellarFormationSeedBondDistance(){return stellarFormationFiveLayerAtomSize()}\nfunction stellarFormationSeedLayout(count){if(count<=1)return[{x:0,y:0}];const d=stellarFormationSeedBondDistance();return[{x:-d/2,y:0},{x:d/2,y:0}]}",
"function stellarFormationAtomSize(spec=stellarFormationSpec()){const minCell=spec.radius>=5?28:36;return Math.max(minCell,Math.min(72,starSize()*.88/(2*spec.radius+1)))}\nfunction stellarFormationSeedBondDistance(spec=stellarFormationSpec()){return stellarFormationAtomSize(spec)}\nfunction stellarFormationSeedLayout(count,spec=stellarFormationSpec()){if(count<=1)return[{x:0,y:0}];const d=stellarFormationSeedBondDistance(spec);return[{x:-d/2,y:0},{x:d/2,y:0}]}",
'atom size by formation scale');

const oldCompat=`function stellarFormationRefreshCompatibility(f){
 if(!f)return;const selected=f.groups.get(f.selectedGroup),compatible=new Set();if(selected)for(const g of f.groups.values())if(g.id!==selected.id&&stellarFormationOverlap(selected,g))compatible.add(g.id);
 for(const g of f.groups.values()){const pair=g.members.length===2;g.fieldEl?.classList.toggle('formation-pair',pair);g.fieldEl?.classList.toggle('formation-cluster',!pair);g.fieldEl?.classList.toggle('selected',g.id===f.selectedGroup);g.fieldEl?.classList.toggle('compatible',compatible.has(g.id))}
 for(const a of f.atoms.values()){const el=a.el,g=f.groups.get(a.groupId),pair=g?.members.length===2;el?.classList.toggle('formation-pair',!!pair);el?.classList.toggle('formation-cluster',!pair);el?.classList.toggle('selected',a.groupId===f.selectedGroup);el?.classList.toggle('compatible',compatible.has(a.groupId))}
}`;
const newCompat=`function stellarFormationRefreshCompatibility(f){
 if(!f)return;const selected=f.groups.get(f.selectedGroup),compatible=new Set();
 if(selected){const candidates=[...f.groups.values()].filter(g=>g.id!==selected.id&&stellarFormationOverlap(selected,g)).sort((a,b)=>Math.hypot(selected.x-a.x,selected.y-a.y)-Math.hypot(selected.x-b.x,selected.y-b.y));if(candidates[0])compatible.add(candidates[0].id)}
 for(const g of f.groups.values()){const pair=g.members.length===2;g.fieldEl?.classList.toggle('formation-pair',pair);g.fieldEl?.classList.toggle('formation-cluster',!pair);g.fieldEl?.classList.toggle('selected',g.id===f.selectedGroup);g.fieldEl?.classList.toggle('compatible',compatible.has(g.id))}
 for(const a of f.atoms.values()){const el=a.el,g=f.groups.get(a.groupId),pair=g?.members.length===2;el?.classList.toggle('formation-pair',!!pair);el?.classList.toggle('formation-cluster',!pair);el?.classList.toggle('selected',a.groupId===f.selectedGroup);el?.classList.toggle('compatible',compatible.has(a.groupId))}
}`;
once(oldCompat,newCompat,'limit green groups');

once("layer.style.setProperty('--formationAtomSize',stellarFormationFiveLayerAtomSize()+'px')","layer.style.setProperty('--formationAtomSize',stellarFormationAtomSize(spec)+'px')",'initial atom size');
once("local=stellarFormationSeedLayout(count)","local=stellarFormationSeedLayout(count,spec)",'seed spacing');
once("f.layer?.style.setProperty('--formationAtomSize',stellarFormationFiveLayerAtomSize()+'px')","f.layer?.style.setProperty('--formationAtomSize',stellarFormationAtomSize(f.spec)+'px')",'resize atom size');

fs.writeFileSync(path,src);
console.log('formation sizes/highlights patched');
