const fs=require('fs');
const path='assets/js/ardua.js';
let src=fs.readFileSync(path,'utf8');
const oldText="function stellarFormationAtomSize(spec=stellarFormationSpec()){const minCell=spec.radius>=5?28:36;return Math.max(minCell,Math.min(72,starSize()*.88/(2*spec.radius+1)))}";
const newText="function stellarFormationAtomSize(spec=stellarFormationSpec(),s=phase()){const radius=s?.id==='first_generation_formation'?4:spec.radius,minCell=radius>=5?28:36;return Math.max(minCell,Math.min(72,starSize()*.88/(2*radius+1)))}";
const count=src.split(oldText).length-1;if(count!==1)throw new Error(`atom size matcher: ${count}`);
src=src.replace(oldText,newText);
fs.writeFileSync(path,src);
console.log('first-generation scale preserved');
