const fs=require('fs');
const OLD='20260911-phase-runtime-sync-1',VER='20260911-scatter-appreciation-1';
const p='assets/js/ardua.js';let s=fs.readFileSync(p,'utf8');
const re=/async function scatterStage\(\)\{[\s\S]*?\nasync function compactAdvance\(\)\{/;
const m=s.match(re);if(!m)throw new Error('scatterStage anchor not found');
const replacement=`async function scatterStage(){
 if(!state.phaseDone)return;
 const s=phase(),supernova=s.endEvent==='supernova';$('phaseEndBtn').classList.remove('show');
 if(supernova){await wait(rewardReducedMotion()?60:240);registerRewardDiscovery('phenomenon:supernova',{title:'SUPERNOVA',text:'Matéria enriquecida foi dispersa.',silent:true});playScientificSignature('supernova')}
 const layer=$('explosion');layer.innerHTML='';const size=starSize(),c=size/2,clones=[];let maxMotionMs=0;
 state.pieces.forEach((p,idx)=>{const el=document.createElement('div');el.className='atom '+((p.matterState||'nucleus')==='atom'?'atomic-piece':'nucleus-piece');el.style.background=elementStyle(p.sym);const shownSym=pieceDisplaySymbol(p);el.innerHTML=\`<span class="sym">\${shownSym}</span>\`;el.style.left=p.x+'px';el.style.top=p.y+'px';layer.appendChild(el);clones.push({el,p,idx})});
 for(let i=0;i<(supernova?78:34);i++){const d=document.createElement('i');d.className='dust-speck';layer.appendChild(d);const a=Math.random()*Math.PI*2,dist=size*((supernova?.72:.42)+Math.random()*(supernova?.70:.35)),dur=(supernova?430:520)+Math.random()*(supernova?520:420);maxMotionMs=Math.max(maxMotionMs,dur);requestAnimationFrame(()=>{d.style.transition=\`transform \${dur}ms ease-out,opacity \${dur}ms ease\`;d.style.transform=\`translate(calc(-50% + \${Math.cos(a)*dist}px),calc(-50% + \${Math.sin(a)*dist}px)) scale(\${supernova?.12:.25})\`;d.style.opacity='0'})}
 dom.pieces.classList.add('hidden');tone(supernova?92:170,supernova?.55:.32,supernova?'sawtooth':'sine',supernova?.075:.05);vibrate(supernova?[35,24,55,30,75]:[18,30,24]);
 clones.forEach(({el,p,idx})=>{const radial=Math.atan2(p.y-c,p.x-c),a=radial+(Math.random()-.5)*(supernova?1.15:.8),dist=size*((supernova?.92:.52)+Math.random()*(supernova?.60:.28)),dur=(supernova?520:620)+Math.random()*(supernova?380:280)+idx*3;maxMotionMs=Math.max(maxMotionMs,dur);requestAnimationFrame(()=>{el.style.transition=\`left \${dur}ms cubic-bezier(.15,.72,.2,1),top \${dur}ms cubic-bezier(.15,.72,.2,1),transform \${dur}ms ease,opacity \${dur*.9}ms ease\`;el.style.left=(c+Math.cos(a)*dist)+'px';el.style.top=(c+Math.sin(a)*dist)+'px';el.style.transform=\`translate(-50%,-50%) scale(\${supernova?.22:.45})\`;el.style.opacity='0'})});
 const appreciationHold=rewardReducedMotion()?160:(supernova?900:700);await wait(Math.ceil(maxMotionMs+appreciationHold));advancePhase()
}
async function compactAdvance(){`;
s=s.replace(re,replacement);fs.writeFileSync(p,s);
for(const file of ['index.html','scripts/validate-recipe-audio-cadence.js','scripts/validate-phase-runtime-sync.js','scripts/validate-phase-goal-hierarchy.js']){let x=fs.readFileSync(file,'utf8');if(!x.includes(OLD))throw new Error('version anchor missing in '+file);x=x.replaceAll(OLD,VER);fs.writeFileSync(file,x)}
console.log('Scatter appreciation patch applied.');
