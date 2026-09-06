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
`async function emitMolecularPhoton(x,y){
 const first=!state.productLessons.has('molecularPhoton');const d=document.createElement('div');d.className='molecular-photon';d.textContent='hν';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);
 const size=starSize(),c=size/2,base=Math.atan2(y-c,x-c)+(Math.random()-.5)*.65,dist=size*.68,side=Math.random()<.5?-1:1;const frames=[{transform:'translate(-50%,-50%) scale(.72)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:\`translate(calc(-50% + \${Math.cos(base+.18*side)*dist*.34}px),calc(-50% + \${Math.sin(base+.18*side)*dist*.34}px)) scale(.92)\`,opacity:1},{transform:\`translate(calc(-50% + \${Math.cos(base-.12*side)*dist*.68}px),calc(-50% + \${Math.sin(base-.12*side)*dist*.68}px)) scale(.72)\`,opacity:.78},{transform:\`translate(calc(-50% + \${Math.cos(base)*dist}px),calc(-50% + \${Math.sin(base)*dist}px)) scale(.42)\`,opacity:0}];
 const anim=d.animate(frames,{duration:980,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});tone(760,.08,'sine',.022);if(first){await wait(170);await teachProductOnce('molecularPhoton',x,y)}await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;d.remove();resolve()};anim.onfinish=finish;setTimeout(finish,1120)});return first
}`,
`async function emitMolecularPhoton(x,y){
 const first=!state.productLessons.has('molecularPhoton');const d=document.createElement('div');d.className='molecular-photon';d.textContent='hν';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);
 const size=starSize(),c=size/2,dx=x-c,dy=y-c,base=Math.atan2(dy,dx),orbit=27,frames=[];for(let i=0;i<=16;i++){const a=(i/16)*Math.PI*4,ox=Math.cos(a)*orbit,oy=Math.sin(a)*orbit;frames.push({transform:\`translate(calc(-50% + \${ox}px),calc(-50% + \${oy}px)) scale(\${.9+.12*Math.sin(a)})\`,opacity:1})}
 const exitA=base+(Math.random()-.5)*.7,dist=size*.78;frames.push({transform:\`translate(calc(-50% + \${Math.cos(exitA)*dist}px),calc(-50% + \${Math.sin(exitA)*dist}px)) scale(.45)\`,opacity:0});
 const animationDone=new Promise(resolve=>{const anim=d.animate(frames,{duration:1450,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});let done=false;const finish=()=>{if(done)return;done=true;d.remove();resolve()};anim.onfinish=finish;setTimeout(finish,1600)});tone(920,.11,'sine',.03);if(first){await wait(170);await teachProductOnce('molecularPhoton',x,y)}await animationDone;return first
}`,
'molecular photon animation');

js=rep(js,
`function canCreatePrimordialHeH(a,b,s=phase()){return primordialHeHBondAllowed(s)&&primordialNeutralAtom(a)&&primordialNeutralAtom(b)&&same([a.sym,b.sym],['He','H'])}`,
`function canCreatePrimordialHeH(a,b,s=phase()){return primordialHeHBondAllowed(s)&&primordialNeutralAtom(a)&&primordialNeutralAtom(b)&&same([a.sym,b.sym],['He','H'])}
function primordialHeHMoleculeTarget(piece,selected,s=phase()){const m=primordialMoleculeForPiece(piece);return s.id==='first_nebulae'&&primordialNeutralAtom(selected,'H')&&!!m&&!m.locked&&m.type==='HeH+'}`,
'HeH molecule candidate helper');

js=rep(js,
`primordialPieceTarget=primordial&&p.free&&selectedFree&&selectedFree.id!==p.id&&(primordialPossiblePieceRecipes([selectedFree.sym,p.sym]).length>0||canCreatePrimordialHeH(selectedFree,p,s)),selected=`,
`primordialPieceTarget=primordial&&p.free&&!p.moleculeId&&selectedFree&&selectedFree.id!==p.id&&(primordialPossiblePieceRecipes([selectedFree.sym,p.sym]).length>0||canCreatePrimordialHeH(selectedFree,p,s)),primordialMoleculeTarget=primordial&&primordialHeHMoleculeTarget(p,selectedFree,s),selected=`,
'candidate target split');

js=rep(js,
`const partner=(!primordial&&candidates.has(p.cell))||primordialParticleTarget||primordialPieceTarget||neutronPartner||particleTarget||stellarProtonTarget||blackHoleTarget;`,
`const partner=(!primordial&&candidates.has(p.cell))||primordialParticleTarget||primordialPieceTarget||primordialMoleculeTarget||neutronPartner||particleTarget||stellarProtonTarget||blackHoleTarget;`,
'candidate partner inclusion');

js=rep(js,
`   if(p.moleculeId)return tapPrimordialMolecule(p.moleculeId);`,
`   if(p.moleculeId){const m=primordialMoleculeForPiece(p),selectedAtom=state.freeSelected.length===1?state.pieces.get(state.freeSelected[0]):null;if(s.id==='first_nebulae'&&m?.type==='HeH+'&&!m.locked&&primordialNeutralAtom(selectedAtom,'H'))return reactPrimordialHeHWithHydrogen(m,selectedAtom);return tapPrimordialMolecule(p.moleculeId)}`,
'tap HeH from selected isolated H');

css=rep(css,
`.molecular-photon{position:absolute;z-index:43;width:34px;height:24px;border-radius:999px;display:grid;place-items:center;transform:translate(-50%,-50%);font-weight:950;font-size:13px;letter-spacing:-.04em;color:#effcff;background:radial-gradient(circle at 35% 32%,rgba(255,255,255,.96),rgba(147,229,255,.58) 46%,rgba(85,172,255,.12) 74%,transparent 100%);border:1px solid rgba(205,246,255,.72);box-shadow:0 0 10px rgba(219,250,255,.92),0 0 24px rgba(112,211,255,.68);pointer-events:none;will-change:transform,opacity}`,
`.molecular-photon{position:absolute;z-index:43;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;transform:translate(-50%,-50%);font-weight:950;font-size:13px;letter-spacing:-.04em;color:#3d3000;background:radial-gradient(circle at 34% 30%,#fffde0 0 18%,#ffe45c 42%,#ffb300 72%,rgba(255,179,0,.05) 100%);border:1px solid rgba(255,244,160,.88);box-shadow:0 0 12px #fff7a8,0 0 28px rgba(255,218,63,.95),0 0 52px rgba(255,174,0,.62);pointer-events:none;will-change:transform,opacity}`,
'yellow molecular photon');

css=rep(css,
`.star-board.primordial-mode.primordial-molecule-mode .atom:not([data-molecule]){z-index:2}
.star-board.primordial-mode.primordial-molecule-mode .atom[data-molecule]{z-index:1;animation:none!important;margin-top:0!important;transition:left .48s ease,top .48s ease,box-shadow .18s ease,filter .18s ease;filter:brightness(1.04)}`,
`.star-board.primordial-mode.primordial-molecule-mode .atom:not([data-molecule]){z-index:4}
.star-board.primordial-mode.primordial-molecule-mode .atom[data-molecule]{z-index:0;animation:none!important;margin-top:0!important;transition:left .48s ease,top .48s ease,box-shadow .18s ease,filter .18s ease;filter:brightness(1.04)}
.star-board.primordial-mode.primordial-molecule-mode .primordial-layer{z-index:18}`,
'molecule foreground layering');

fs.writeFileSync(jsPath,js);
fs.writeFileSync(cssPath,css);
