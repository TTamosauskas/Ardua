const fs=require('fs');

const modePath='assets/js/campaign-mode.js';
const namesPath='assets/js/campaign-phase-names.js';
let mode=fs.readFileSync(modePath,'utf8');
let names=fs.readFileSync(namesPath,'utf8');

function replaceOnce(src,oldText,newText,label){
  const count=src.split(oldText).length-1;
  if(count!==1)throw new Error(`${label}: esperado 1 match, encontrado ${count}`);
  return src.replace(oldText,newText);
}

mode=replaceOnce(
  mode,
  "function defaults(){return{version:9,introduced:false,activeId:'bigbang',completed:[],generation:0,heritage:heritageDefaults()}}",
  "function defaults(){return{version:10,introduced:false,activeId:'bigbang',completed:[],generation:0,heritage:heritageDefaults()}}",
  'defaults v10'
);
mode=replaceOnce(
  mode,
  "const x=rawState||{},completed=uniq(x.completed||[]),previousVersion=Number(x.version||0),next={...defaults(),...x,version:9,completed,generation:Number(x.generation||0),heritage:{...heritageDefaults(),...(x.heritage||{}),seeds:uniq(x.heritage?.seeds||[])}};",
  "const x=rawState||{},completed=uniq(x.completed||[]),previousVersion=Number(x.version||0),next={...defaults(),...x,version:10,completed,generation:Number(x.generation||0),heritage:{...heritageDefaults(),...(x.heritage||{}),seeds:uniq(x.heritage?.seeds||[])}};",
  'normalize v10'
);

const marker=" if(inferHistorical||previousVersion<3){";
const recovery=` if(previousVersion<10){\n  // v9 marcou a formação de Alta Massa como concluída em saves que já haviam passado\n  // por Queima de Carbono. A geometria agora tem núcleo + 5 camadas (91 H), então\n  // reabrimos essa fase uma única vez para que ela apareça e possa ser jogada.\n  const highRouteEvidence=['carbon_burn','ne','proton_capture','na','carbon_oxygen','mg','al','oxygen_burn','si','p','s','cl','ar','k','ca','sc','ti','v','cr','mn','cr_alpha_fe','fe','ni_fusion','co','neutronize','final_collapse'];\n  if(next.completed.includes('high_mass_formation')&&highRouteEvidence.some(id=>seen.has(id))){\n   next.completed=next.completed.filter(id=>id!=='high_mass_formation');\n   if(next.activeId==='carbon_burn')next.activeId='high_mass_formation';\n  }\n }\n`;
if(mode.includes(recovery.trim()))throw new Error('recovery já aplicado');
if(!mode.includes(marker))throw new Error('ponto de inserção v10 ausente');
mode=mode.replace(marker,recovery+marker);

names=replaceOnce(
  names,
  " spallation:'Espalação: Boro',\n ne:'Forja de Neônio',",
  " spallation:'Espalação: Boro',\n high_mass_formation:'Formação da Estrela de Alta Massa',\n ne:'Forja de Neônio',",
  'nome explícito alta massa'
);

fs.writeFileSync(modePath,mode);
fs.writeFileSync(namesPath,names);
console.log('high-mass formation visibility patched');
