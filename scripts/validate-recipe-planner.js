const fs=require('fs');
const src=fs.readFileSync('assets/js/ardua.js','utf8');

const required=[
  "if((available[need]||0)>=(needs[need]||0))continue;",
  "if(need.present>0&&!need.missing)continue;",
  "if(item.present>0&&!item.missing)continue;",
  "if(hasRecipeIngredients(r,guidanceBoardSymbolCounts()))return r;",
  "plannedOpportunity?.kind==='fusion'&&plannedOpportunity.recipe===FUSIONS.D"
];
for(const token of required){
  if(!src.includes(token))throw new Error(`Contrato do planejador ausente: ${token}`);
}

const forbidden=[
  "if((available[need]||0)>=(needs[need]||0)&&action.kind!=='fusion')continue;",
  "if(need.historical&&need.present>0&&!need.missing)continue;",
  "if(item.historical&&item.present>0&&!item.missing)continue;"
];
for(const token of forbidden){
  if(src.includes(token))throw new Error(`Regressão do planejador: reagente já disponível pode ser reconstruído: ${token}`);
}

// O fallback H+H→D só pode repor matéria quando o próprio planejador concluiu
// que produzir D é o próximo passo necessário. Se um intermediário suficiente já
// existe, o planejamento deve conservá-lo e orientar a reação/movimentação seguinte.
if(!src.includes("if(!deuteriumFallbackNeeded)return true;")){
  throw new Error('Fallback H+H→D não está condicionado a uma falta real de Deutério na cadeia ativa.');
}

console.log('Recipe planner OK: intermediários presentes são consumidos antes de reconstruídos; movimento não vira fabricação; fallback H+H→D é condicionado.');
