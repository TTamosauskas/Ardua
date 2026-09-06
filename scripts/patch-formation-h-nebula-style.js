const fs=require('fs');
const path='assets/js/ardua.js';
let src=fs.readFileSync(path,'utf8');
const before="function stellarFormationSeedBondDistance(){return Math.max(30,Math.min(42,window.innerWidth*.08))}";
const after="function stellarFormationSeedBondDistance(){return Math.max(39,Math.min(49,window.innerWidth*.097))}";
if(!src.includes(before))throw new Error('stellarFormationSeedBondDistance original não encontrado');
src=src.replace(before,after);
fs.writeFileSync(path,src);
