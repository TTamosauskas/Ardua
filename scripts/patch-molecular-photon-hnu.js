const fs=require('fs');
const jsPath='assets/js/ardua.js';
const cssPath='assets/css/ardua.css';
let js=fs.readFileSync(jsPath,'utf8');
let css=fs.readFileSync(cssPath,'utf8');
function rep(text,oldText,newText,label){
  if(!text.includes(oldText))throw new Error('Missing '+label);
  return text.replace(oldText,newText);
}
js=rep(js,
" gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'},",
" gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'},\n molecularPhoton:{title:'FÓTON EMITIDO (hν)',text:'Na formação dessas moleculas energia precisa sair do sistema. Essas emissões resfriaram o plasma primordial.'},",
'molecular photon lesson');
js=rep(js,
"async function emitGammaPair(x,y,deferLesson=false){",
"async function emitMolecularPhoton(x,y){\n const first=!state.productLessons.has('molecularPhoton');const d=document.createElement('div');d.className='molecular-photon';d.textContent='hν';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);\n const size=starSize(),c=size/2,base=Math.atan2(y-c,x-c)+(Math.random()-.5)*.65,dist=size*.68,side=Math.random()<.5?-1:1;const frames=[{transform:'translate(-50%,-50%) scale(.72)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(base+.18*side)*dist*.34}px),calc(-50% + ${Math.sin(base+.18*side)*dist*.34}px)) scale(.92)`,opacity:1},{transform:`translate(calc(-50% + ${Math.cos(base-.12*side)*dist*.68}px),calc(-50% + ${Math.sin(base-.12*side)*dist*.68}px)) scale(.72)`,opacity:.78},{transform:`translate(calc(-50% + ${Math.cos(base)*dist}px),calc(-50% + ${Math.sin(base)*dist}px)) scale(.42)`,opacity:0}];\n const anim=d.animate(frames,{duration:980,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});tone(760,.08,'sine',.022);if(first){await wait(170);await teachProductOnce('molecularPhoton',x,y)}await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;d.remove();resolve()};anim.onfinish=finish;setTimeout(finish,1120)});return first\n}\nasync function emitGammaPair(x,y,deferLesson=false){",
'molecular photon emitter');
js=rep(js,
"const formed=createPrimordialMolecule('HeH+',a,b,{credit:true,silent:true});burst(x,y);captureTag(x,y,'HeH⁺');if(motif)await finishPrimordialMoleculeFormationMotif(motif,formed);else tone(520,.12,'triangle',.035);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();",
"const formed=createPrimordialMolecule('HeH+',a,b,{credit:true,silent:true});burst(x,y);captureTag(x,y,'HeH⁺');if(motif)await finishPrimordialMoleculeFormationMotif(motif,formed);else tone(520,.12,'triangle',.035);await emitMolecularPhoton(x,y);state.locked=false;ensureOpportunity();render();syncPrimordialMoleculeVisuals();checkComplete();",
'HeH photon call');
css=rep(css,
".gamma-emission{position:absolute;z-index:42;cursor:pointer;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;transform:translate(-50%,-50%);font-weight:950;font-size:18px;color:#3d3000;background:radial-gradient(circle at 34% 30%,#fffde0 0 18%,#ffe45c 42%,#ffb300 72%,rgba(255,179,0,.05) 100%);box-shadow:0 0 12px #fff7a8,0 0 28px rgba(255,218,63,.95),0 0 52px rgba(255,174,0,.62);pointer-events:auto;will-change:transform,opacity}",
".gamma-emission{position:absolute;z-index:42;cursor:pointer;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;transform:translate(-50%,-50%);font-weight:950;font-size:18px;color:#3d3000;background:radial-gradient(circle at 34% 30%,#fffde0 0 18%,#ffe45c 42%,#ffb300 72%,rgba(255,179,0,.05) 100%);box-shadow:0 0 12px #fff7a8,0 0 28px rgba(255,218,63,.95),0 0 52px rgba(255,174,0,.62);pointer-events:auto;will-change:transform,opacity}\n.molecular-photon{position:absolute;z-index:43;width:34px;height:24px;border-radius:999px;display:grid;place-items:center;transform:translate(-50%,-50%);font-weight:950;font-size:13px;letter-spacing:-.04em;color:#effcff;background:radial-gradient(circle at 35% 32%,rgba(255,255,255,.96),rgba(147,229,255,.58) 46%,rgba(85,172,255,.12) 74%,transparent 100%);border:1px solid rgba(205,246,255,.72);box-shadow:0 0 10px rgba(219,250,255,.92),0 0 24px rgba(112,211,255,.68);pointer-events:none;will-change:transform,opacity}",
'molecular photon css');
fs.writeFileSync(jsPath,js);
fs.writeFileSync(cssPath,css);
