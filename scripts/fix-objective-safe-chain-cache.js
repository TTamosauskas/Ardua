const fs=require('fs');const old='20260910-quarks-audio-1',next='20260911-objective-safe-chain-1';
let p='index.html',s=fs.readFileSync(p,'utf8');s=s.split(old).join(next);fs.writeFileSync(p,s);
p='scripts/validate-recipe-audio-cadence.js';s=fs.readFileSync(p,'utf8');if(!s.includes("const version='"+old+"';")&&!s.includes("const version='"+next+"';"))throw new Error('audio cache validator version not found');s=s.replace("const version='"+old+"';","const version='"+next+"';");fs.writeFileSync(p,s);
console.log('Coordinated musical cache token and validator updated.');
