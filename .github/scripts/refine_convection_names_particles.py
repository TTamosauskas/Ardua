from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)

# Engine
p = Path('assets/js/ardua.js')
text = p.read_text(encoding='utf-8')

text = replace_once(
    text,
    "if(s.mode==='convection')return 'Faça uma reação no centro ou camada 1; ative CONVECÇÃO; escolha um núcleo interno e depois um núcleo externo na coluna destacada';",
    "if(s.mode==='convection')return '';",
    'remove convection modal instruction'
)

text = replace_once(
    text,
    "   if(p.reacting||p.dragging||p.throwing||state.primordialSelected===p.id)return;\n     let step=7+Math.random()*9,a=Math.random()*Math.PI*2;",
    "   if(p.reacting||p.dragging||p.throwing||state.primordialSelected===p.id)return;\n     if(stellar&&advanceCoreOrbitParticle(p))return;\n     let step=7+Math.random()*9,a=Math.random()*Math.PI*2;",
    'stellar core orbit drift hook'
)

anchor = "function stellarParticleDriftDelay(s=phase()){return isPrimordial(s)?920:720}\n"
insert = anchor + """function stellarCoreAnchor(){
 const centerCell=(byRing[0]||[])[0];
 if(centerCell===undefined)return{x:starSize()/2,y:starSize()/2,cell:null,piece:null};
 const id=state.board[centerCell],piece=id?state.pieces.get(id):null;
 if(piece&&!piece.free)return{x:piece.x,y:piece.y,cell:centerCell,piece};
 const q=pos(coords[centerCell]);return{x:q.x,y:q.y,cell:centerCell,piece:null};
}
function coreOrbitRadius(kind,id){return Math.max(22,cellSize()*.60)+(id%3)*4+(kind==='e'?5:0)}
function primeCoreOrbitParticle(p,anchor=stellarCoreAnchor()){
 if(!p||!anchor)return false;const dx=p.x-anchor.x,dy=p.y-anchor.y;p.coreOrbiting=true;p.coreOrbitAngle=Math.atan2(dy||1,dx||1);p.coreOrbitRadius=coreOrbitRadius(p.kind,p.id);p.x=anchor.x+Math.cos(p.coreOrbitAngle)*p.coreOrbitRadius;p.y=anchor.y+Math.sin(p.coreOrbitAngle)*p.coreOrbitRadius;return true;
}
function advanceCoreOrbitParticle(p){
 if(isPrimordial()||!p||!['p','n','e'].includes(p.kind))return false;const anchor=stellarCoreAnchor(),dx=p.x-anchor.x,dy=p.y-anchor.y,d=Math.hypot(dx,dy),threshold=Math.max(30,cellSize()*.78);
 if(!p.coreOrbiting&&d>threshold)return false;if(!p.coreOrbiting)primeCoreOrbitParticle(p,anchor);p.coreOrbitAngle=(p.coreOrbitAngle||0)+(p.kind==='e'?.34:p.kind==='p'?.18:.14);p.coreOrbitRadius=p.coreOrbitRadius||coreOrbitRadius(p.kind,p.id);p.x=anchor.x+Math.cos(p.coreOrbitAngle)*p.coreOrbitRadius;p.y=anchor.y+Math.sin(p.coreOrbitAngle)*p.coreOrbitRadius;return true;
}
"""
text = replace_once(text, anchor, insert, 'insert core orbit helpers')

old = "function createPrimordialParticle(kind,x=null,y=null,target=null){const pt=(x===null||y===null)?freePoint(25):{x,y},id=state.nextPrimordialId++,p={id,kind,x:pt.x,y:pt.y,reacting:false};if(kind==='n'){p.unstable=!primordialNeutronsStable();p.bornRound=state.nuclearRound;p.lifetimeRounds=primordialNeutronLifetime()}if(target){p.targetX=target.x;p.targetY=target.y}state.primordialParticles.set(id,p);return p}"
new = "function createPrimordialParticle(kind,x=null,y=null,target=null){const pt=(x===null||y===null)?freePoint(25):{x,y},id=state.nextPrimordialId++,p={id,kind,x:pt.x,y:pt.y,reacting:false};if(kind==='n'){p.unstable=!primordialNeutronsStable();p.bornRound=state.nuclearRound;p.lifetimeRounds=primordialNeutronLifetime()}if(target){p.targetX=target.x;p.targetY=target.y}if(!isPrimordial()&&['p','n','e'].includes(kind)){const a=stellarCoreAnchor(),d=Math.hypot(p.x-a.x,p.y-a.y);if(d<Math.max(30,cellSize()*.78))primeCoreOrbitParticle(p,a)}state.primordialParticles.set(id,p);return p}"
text = replace_once(text, old, new, 'prime newly-created core particle')

old = "function spawnFloatingParticle(kind,x=null,y=null){\n const start=(x===null||y===null)?freePoint(25):{x,y},dest=freePoint(30),p=createPrimordialParticle(kind,start.x,start.y);p.reacting=true;renderPrimordialParticles();\n requestAnimationFrame(()=>{p.x=dest.x;p.y=dest.y;renderPrimordialParticles()});\n setTimeout(()=>{const q=state.primordialParticles.get(p.id);if(q){q.reacting=false;renderPrimordialParticles();startPrimordialDrift()}},420);return p\n}"
new = "function spawnFloatingParticle(kind,x=null,y=null){\n const start=(x===null||y===null)?freePoint(25):{x,y},p=createPrimordialParticle(kind,start.x,start.y),dest=p.coreOrbiting?{x:p.x,y:p.y}:freePoint(30);p.reacting=true;renderPrimordialParticles();\n requestAnimationFrame(()=>{if(!p.coreOrbiting){p.x=dest.x;p.y=dest.y}renderPrimordialParticles()});\n setTimeout(()=>{const q=state.primordialParticles.get(p.id);if(q){q.reacting=false;renderPrimordialParticles();startPrimordialDrift()}},420);return p\n}"
text = replace_once(text, old, new, 'spawn particle orbit preservation')

needle = " state.primordialParticles.forEach((p,id)=>{let el=existing.get(id);"
insert = """ const foregroundFree=new Set();
 if(!isPrimordial(s))for(const kind of ['p','n','e']){const free=[...state.primordialParticles.values()].filter(p=>p.kind===kind&&!p.reacting).sort((a,b)=>((b.id===state.primordialSelected)-(a.id===state.primordialSelected))||a.id-b.id);free.slice(0,2).forEach(p=>foregroundFree.add(p.id))}
 state.primordialParticles.forEach((p,id)=>{let el=existing.get(id);"""
text = replace_once(text, needle, insert, 'stellar foreground particle slots')

old = "   el.className=`primordial-particle ${cls}${p.kind==='n'&&p.unstable?' unstable':''}${state.primordialSelected===id?' selected':''}${candidate?' candidate':''}${p.reacting?' reacting':''}${p.dragging?' dragging':''}${p.throwing?' throwing':''}${p.coulombDeflect?' coulomb-deflect':''}${p.tunneling?' tunneling':''}`;el.textContent=label;el.style.pointerEvents='auto';el.dataset.mechanical=interactive?'1':'0';el.style.left=p.x+'px';el.style.top=p.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())"
new = "   const reserve=!isPrimordial(s)&&['p','n','e'].includes(p.kind)&&!p.reacting&&!foregroundFree.has(id);el.className=`primordial-particle ${cls}${p.kind==='n'&&p.unstable?' unstable':''}${state.primordialSelected===id?' selected':''}${candidate?' candidate':''}${p.reacting?' reacting':''}${p.dragging?' dragging':''}${p.throwing?' throwing':''}${p.coulombDeflect?' coulomb-deflect':''}${p.tunneling?' tunneling':''}${reserve?' particle-reserve':''}`;el.textContent=label;el.style.pointerEvents=reserve?'none':'auto';el.setAttribute('aria-hidden',reserve?'true':'false');el.dataset.mechanical=interactive&&!reserve?'1':'0';el.style.left=p.x+'px';el.style.top=p.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())"
text = replace_once(text, old, new, 'reserve primordial render state')

old = "function spawnGeneratedNeutron(x,y){\n  if(!['neutronize','neutron'].includes(phase().mode))return;\n  const id=state.nextN++,a=Math.random()*Math.PI*2,speed=1.0+Math.random()*.8;\n  state.neutrons.set(id,{id,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,generated:true});\n  renderNeutrons();\n}"
new = "function placeNeutronOnCoreOrbit(n,force=false){\n const anchor=stellarCoreAnchor(),dx=n.x-anchor.x,dy=n.y-anchor.y,d=Math.hypot(dx,dy),threshold=Math.max(30,cellSize()*.78);if(!force&&!n.coreOrbiting&&d>threshold)return false;if(!n.coreOrbiting){n.coreOrbiting=true;n.coreOrbitAngle=Math.atan2(dy||1,dx||1);n.coreOrbitRadius=Math.max(23,cellSize()*.62)+(n.id%3)*4}n.coreOrbitAngle=(n.coreOrbitAngle||0)+.16;n.x=anchor.x+Math.cos(n.coreOrbitAngle)*n.coreOrbitRadius;n.y=anchor.y+Math.sin(n.coreOrbitAngle)*n.coreOrbitRadius;return true;\n}\nfunction spawnGeneratedNeutron(x,y){\n  if(!['neutronize','neutron'].includes(phase().mode))return;\n  const id=state.nextN++,a=Math.random()*Math.PI*2,speed=1.0+Math.random()*.8,n={id,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,generated:true};\n  const anchor=stellarCoreAnchor();if(Math.hypot(x-anchor.x,y-anchor.y)<Math.max(30,cellSize()*.78))placeNeutronOnCoreOrbit(n,true);state.neutrons.set(id,n);\n  renderNeutrons();\n}"
text = replace_once(text, old, new, 'generated neutron core orbit')

old = "function moveNeutrons(){\n const s=phase();if(!['neutron','neutronize'].includes(s.mode))return;const c=starSize()/2,limit=starSize()*.44;\n for(const n of state.neutrons.values()){\n   n.x+=(n.vx||0);n.y+=(n.vy||0);"
new = "function moveNeutrons(){\n const s=phase();if(!['neutron','neutronize'].includes(s.mode))return;const c=starSize()/2,limit=starSize()*.44;\n for(const n of state.neutrons.values()){\n   if(placeNeutronOnCoreOrbit(n))continue;\n   n.x+=(n.vx||0);n.y+=(n.vy||0);"
text = replace_once(text, old, new, 'moving neutron core orbit')

old = "function renderNeutrons(){const s=phase();if(!['neutron','neutronize'].includes(s.mode)){dom.neutrons.innerHTML='';return}const sp=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null,partner=s.mode==='neutron'&&(neutronEligible(sp,s)||universalNeutronCaptureEligible(sp));const existing=new Map([...dom.neutrons.querySelectorAll('.neutron')].map(el=>[+el.dataset.id,el]));state.neutrons.forEach((n,id)=>{let el=existing.get(id);if(!el){el=document.createElement('button');el.dataset.id=id;el.textContent='n';el.addEventListener('click',ev=>{ev.stopPropagation();captureNeutron(id)});dom.neutrons.appendChild(el)}const selected=state.selectedNeutron===id;el.className='neutron'+(selected?' selected':partner?' candidate':'')+(s.mode==='neutronize'?' passive':'');el.style.left=n.x+'px';el.style.top=n.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())}"
new = "function renderNeutrons(){const s=phase();if(!['neutron','neutronize'].includes(s.mode)){dom.neutrons.innerHTML='';return}const sp=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null,partner=s.mode==='neutron'&&(neutronEligible(sp,s)||universalNeutronCaptureEligible(sp)),visible=new Set([...state.neutrons.values()].sort((a,b)=>((b.id===state.selectedNeutron)-(a.id===state.selectedNeutron))||a.id-b.id).slice(0,2).map(n=>n.id));const existing=new Map([...dom.neutrons.querySelectorAll('.neutron')].map(el=>[+el.dataset.id,el]));state.neutrons.forEach((n,id)=>{let el=existing.get(id);if(!el){el=document.createElement('button');el.dataset.id=id;el.textContent='n';el.addEventListener('click',ev=>{ev.stopPropagation();captureNeutron(id)});dom.neutrons.appendChild(el)}const selected=state.selectedNeutron===id,reserve=!visible.has(id);el.className='neutron'+(selected?' selected':partner?' candidate':'')+(s.mode==='neutronize'?' passive':'')+(reserve?' particle-reserve':'');el.style.pointerEvents=reserve?'none':'auto';el.setAttribute('aria-hidden',reserve?'true':'false');el.style.left=n.x+'px';el.style.top=n.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())}"
text = replace_once(text, old, new, 'neutron foreground slots')

p.write_text(text, encoding='utf-8')

# Campaign map: always prefer the distinct scientific phase name source.
p = Path('assets/js/campaign-map.js')
text = p.read_text(encoding='utf-8')
text = replace_once(
    text,
    "phaseButtons.forEach((b,i)=>{const id=G.runtimeOrder[i];if(!id)return;b.dataset.phaseId=id;phaseMeta[id]={branch:b.querySelector('small')?.textContent||'',title:b.querySelector('strong')?.textContent||id}});",
    "phaseButtons.forEach((b,i)=>{const id=G.runtimeOrder[i];if(!id)return;b.dataset.phaseId=id;phaseMeta[id]={branch:b.querySelector('small')?.textContent||'',title:window.ARDUA_PHASE_NAMES?.[id]||b.querySelector('strong')?.textContent||id}});",
    'campaign phase metadata naming'
)
text = replace_once(
    text,
    "function node(id,extra=''){return `<button type=\"button\" class=\"phase-node ${phaseState(id)} ${extra}\" data-phase=\"${id}\"><strong>${phaseMeta[id]?.title||id}</strong></button>`}",
    "function node(id,extra=''){const title=window.ARDUA_PHASE_NAMES?.[id]||phaseMeta[id]?.title||id;return `<button type=\"button\" class=\"phase-node ${phaseState(id)} ${extra}\" data-phase=\"${id}\"><strong>${title}</strong></button>`}",
    'campaign node live naming'
)
p.write_text(text, encoding='utf-8')

# Visual reserve layer: state keeps moving while the extra particles wait behind the active presentation.
p = Path('assets/css/ardua.css')
text = p.read_text(encoding='utf-8')
marker = ".primordial-layer.active{pointer-events:none}\n"
addition = marker + ".primordial-particle.particle-reserve,.neutron.particle-reserve{opacity:0!important;visibility:hidden!important;pointer-events:none!important;z-index:-1!important}\n"
text = replace_once(text, marker, addition, 'particle reserve css')
p.write_text(text, encoding='utf-8')

print('refinements applied')
