const fs=require('fs');

function replaceOnce(src,oldText,newText,label){
 const count=src.split(oldText).length-1;
 if(count!==1)throw new Error(`${label}: esperado 1 match, encontrado ${count}`);
 return src.replace(oldText,newText);
}

const mapPath='assets/js/campaign-map.js';
const sgMapPath='assets/js/campaign-supergiants-map.js';
const sgPath='assets/js/campaign-supergiants.js';
let map=fs.readFileSync(mapPath,'utf8');
let sgMap=fs.readFileSync(sgMapPath,'utf8');
let sg=fs.readFileSync(sgPath,'utf8');

map=replaceOnce(
 map,
 "if(s==='sub'){connectActiveSphere('stellar','brown','sub');connectTrail(G.sequences.brown,'sub')}",
 "if(s==='sub'){connectActiveSphere('stellar',G.sequences.brown[0],'sub');connectTrail(G.sequences.brown,'sub')}",
 'entrada anã marrom'
);
map=replaceOnce(
 map,
 "if(s==='low'){connectActiveSphere('stellar','he_red','low');connectTrail(G.sequences.red,'low');addPath(byPhase(tail('he_red')),byPhase('white'),'converge',.5)}",
 "if(s==='low'){connectActiveSphere('stellar',G.sequences.red[0],'low');connectTrail(G.sequences.red,'low');addPath(byPhase(tail('he_red')),byPhase('white'),'converge',.5)}",
 'entrada baixa massa'
);
map=replaceOnce(
 map,
 "addPath(midSphere,byPhase('he_orange'),'mid',.40);\n connectTrail(['he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li'],'mid');",
 "addPath(midSphere,byPhase(G.sequences.mid[0]),'mid',.40);\n connectTrail(G.sequences.mid.slice(0,6),'mid');",
 'entrada massa intermediária'
);
map=replaceOnce(
 map,
 "if(s==='high'){connectActiveSphere('stellar','carbon_burn','high');drawHigh()}",
 "if(s==='high'){connectActiveSphere('stellar',G.sequences.high[0],'high');drawHigh()}",
 'entrada alta massa'
);

sg=replaceOnce(
 sg,
 "const precursor='carbon_burn';",
 "const entry='high_mass_formation';\nconst precursor='carbon_burn';",
 'entrada supergigantes'
);
sg=replaceOnce(
 sg,
 " precursor,\n routes,",
 " entry,\n precursor,\n routes,",
 'exporta entrada supergigantes'
);

sgMap=replaceOnce(
 sgMap,
 "moveNodes([S.precursor],precursorFlow);",
 "moveNodes([S.entry,S.precursor],precursorFlow);",
 'preserva formação alta massa no mapa'
);

fs.writeFileSync(mapPath,map);
fs.writeFileSync(sgMapPath,sgMap);
fs.writeFileSync(sgPath,sg);
console.log('high-mass formation map entry patched');
