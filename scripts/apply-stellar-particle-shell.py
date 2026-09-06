from pathlib import Path

JS_PATH = Path('assets/js/ardua.js')
CSS_PATH = Path('assets/css/ardua.css')

js = JS_PATH.read_text(encoding='utf-8')
css = CSS_PATH.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


def patch_between(text, start_marker, end_marker, replacements, label):
    start = text.index(start_marker)
    end = text.index(end_marker, start)
    block = text[start:end]
    for old, new, item_label in replacements:
        block = replace_once(block, old, new, f'{label}/{item_label}')
    return text[:start] + block + text[end:]


# 1) Matter created from stellar free-particle reactions becomes board matter when space exists.
create_free_anchor = "function createFreePiece(sym,x=null,y=null,opts={}){const pt=(x===null||y===null)?freePoint():{x,y},id=state.nextId++,piece={id,sym,cell:null,free:true,x:pt.x,y:pt.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive,lineage:normalizeMatterLineage(opts.lineage?.length?opts.lineage:freshMatterLineage())};armIntrinsicInstability(piece);state.pieces.set(id,piece);return piece}"

matter_helpers = r'''
function nearestOpenStellarCell(x,y){
 const open=activeCells().filter(i=>state.board[i]===null);if(!open.length)return null;
 return open.reduce((best,cell)=>{const a=pos(coords[best]),b=pos(coords[cell]);return Math.hypot(b.x-x,b.y-y)<Math.hypot(a.x-x,a.y-y)?cell:best},open[0])
}
function createParticleReactionProduct(sym,x,y,opts={}){
 if(isPrimordial())return{piece:createFreePiece(sym,x,y,opts),cell:null,ejected:false};
 const cell=nearestOpenStellarCell(x,y);
 if(cell===null){const piece=createFreePiece(sym,x,y,opts);piece.stellarEjecting=true;return{piece,cell:null,ejected:true}}
 const piece=createPiece(sym,cell,false,opts);piece.x=x;piece.y=y;return{piece,cell,ejected:false}
}
async function settleParticleReactionProduct(spawn){
 if(!spawn?.piece||isPrimordial())return spawn?.piece||null;const piece=spawn.piece;
 if(spawn.ejected){const c=starSize()/2,dx=piece.x-c,dy=piece.y-c,d=Math.hypot(dx,dy)||1,reach=Math.max(starSize()*1.30,Math.hypot(window.innerWidth,window.innerHeight)*.72);piece.x=c+dx/d*reach;piece.y=c+dy/d*reach;renderPieces();await wait(540);state.pieces.delete(piece.id);renderPieces();return null}
 const target=pos(coords[spawn.cell]);piece.x=target.x;piece.y=target.y;renderPieces();await wait(320);return piece
}
'''.strip('\n')

if 'function nearestOpenStellarCell(' not in js:
    js = replace_once(js, create_free_anchor, create_free_anchor + '\n' + matter_helpers, 'insert stellar product helpers')

js = patch_between(
    js,
    'async function reactPrimordialParticlePair(r,a,b){',
    '\nasync function reactPrimordialMixed(r,piece,particle){',
    [
        (
            "const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});",
            "const spawn=createParticleReactionProduct(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive}),out=spawn.piece;",
            'materialize pair product',
        ),
        (
            'await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});',
            'await handleReactionEmissions(r,out);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});',
            'settle pair product',
        ),
    ],
    'reactPrimordialParticlePair',
)

js = patch_between(
    js,
    'async function recombineHydrogenParticles(a,b){',
    '\nasync function bindElectronToPiece(piece,electron){',
    [
        (
            "const h=createFreePiece('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1});",
            "const spawn=createParticleReactionProduct('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1}),h=spawn.piece;",
            'materialize hydrogen',
        ),
        (
            'burst(x,y);await emitGamma(x,y);await afterNuclearAction({advanceRound:true});',
            'burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});',
            'settle hydrogen',
        ),
    ],
    'recombineHydrogenParticles',
)

js = patch_between(
    js,
    'async function reactCumulativeProcessNeutronWithProton(proton,n){',
    '\nasync function reactCumulativeBoardMixed(r,piece,particle){',
    [
        (
            "const out=createFreePiece('D',x,y,{massNumber:2});",
            "const spawn=createParticleReactionProduct('D',x,y,{massNumber:2}),out=spawn.piece;",
            'materialize cumulative deuterium',
        ),
        (
            'burst(x,y);await emitGamma(x,y);await afterNuclearAction({advanceRound:true});',
            'burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});',
            'settle cumulative deuterium',
        ),
    ],
    'reactCumulativeProcessNeutronWithProton',
)

# 2) Replace core-centric particle orbits with a moving stellar surface shell.
old_orbit_block = r'''function coreOrbitRadius(kind,id){return Math.max(22,cellSize()*.60)+(id%3)*4+(kind==='e'?5:0)}
function primeCoreOrbitParticle(p,anchor=stellarCoreAnchor()){
 if(!p||!anchor)return false;const dx=p.x-anchor.x,dy=p.y-anchor.y;p.coreOrbiting=true;p.coreOrbitAngle=Math.atan2(dy||1,dx||1);p.coreOrbitRadius=coreOrbitRadius(p.kind,p.id);p.x=anchor.x+Math.cos(p.coreOrbitAngle)*p.coreOrbitRadius;p.y=anchor.y+Math.sin(p.coreOrbitAngle)*p.coreOrbitRadius;return true;
}
function advanceCoreOrbitParticle(p){
 if(isPrimordial()||!p||!['p','n','e'].includes(p.kind))return false;const anchor=stellarCoreAnchor(),dx=p.x-anchor.x,dy=p.y-anchor.y,d=Math.hypot(dx,dy),threshold=Math.max(30,cellSize()*.78);
 if(!p.coreOrbiting&&d>threshold)return false;if(!p.coreOrbiting)primeCoreOrbitParticle(p,anchor);p.coreOrbitAngle=(p.coreOrbitAngle||0)+(p.kind==='e'?.34:p.kind==='p'?.18:.14);p.coreOrbitRadius=p.coreOrbitRadius||coreOrbitRadius(p.kind,p.id);p.x=anchor.x+Math.cos(p.coreOrbitAngle)*p.coreOrbitRadius;p.y=anchor.y+Math.sin(p.coreOrbitAngle)*p.coreOrbitRadius;return true;
}'''

new_orbit_block = r'''function stellarShellOrbitRadius(kind,id){const size=starSize(),jitter=((id%7)-3)*size*.0045,kindBias=kind==='e'?size*.010:kind==='n'?-size*.005:0;return Math.max(size*.435,Math.min(size*.495,size*.468+jitter+kindBias))}
function primeStellarShellParticle(p,kind=p?.kind||'n'){
 if(!p||!['p','n','e'].includes(kind))return false;const c=starSize()/2,dx=p.x-c,dy=p.y-c;p.shellOrbiting=true;p.shellOrbitAngle=Math.atan2(dy||1,dx||1);p.shellOrbitRadius=stellarShellOrbitRadius(kind,p.id);p.shellOrbitDirection=p.id%2?1:-1;return true;
}
function stellarShellTarget(p,kind=p?.kind||'n'){if(!p)return null;if(!p.shellOrbiting)primeStellarShellParticle(p,kind);const c=starSize()/2,a=p.shellOrbitAngle||0,r=p.shellOrbitRadius||stellarShellOrbitRadius(kind,p.id);return{x:c+Math.cos(a)*r,y:c+Math.sin(a)*r}}
function advanceStellarShellParticle(p,kind=p?.kind||'n',angularStep=null){
 if(isPrimordial()||!p||!['p','n','e'].includes(kind))return false;if(!p.shellOrbiting)primeStellarShellParticle(p,kind);const c=starSize()/2,dx=p.x-c,dy=p.y-c,d=Math.hypot(dx,dy)||1,targetR=stellarShellOrbitRadius(kind,p.id),currentA=Math.atan2(dy,dx),dir=p.shellOrbitDirection||1,step=angularStep??(kind==='e'?.12:kind==='p'?.075:.055),radial=d+(targetR-d)*.28;p.shellOrbitRadius=targetR;p.shellOrbitAngle=currentA+dir*step;p.x=c+Math.cos(p.shellOrbitAngle)*radial;p.y=c+Math.sin(p.shellOrbitAngle)*radial;return true;
}'''

if 'function coreOrbitRadius(' in js:
    js = replace_once(js, old_orbit_block, new_orbit_block, 'replace core orbit with stellar shell')

js = replace_once(
    js,
    "if(stellar&&advanceCoreOrbitParticle(p))return;",
    "if(stellar&&advanceStellarShellParticle(p))return;",
    'use shell movement in primordial drift',
)

old_create_particle = "function createPrimordialParticle(kind,x=null,y=null,target=null){const pt=(x===null||y===null)?freePoint(25):{x,y},id=state.nextPrimordialId++,p={id,kind,x:pt.x,y:pt.y,reacting:false};if(kind==='n'){p.unstable=!primordialNeutronsStable();p.bornRound=state.nuclearRound;p.lifetimeRounds=primordialNeutronLifetime()}if(target){p.targetX=target.x;p.targetY=target.y}if(!isPrimordial()&&['p','n','e'].includes(kind)){const a=stellarCoreAnchor(),d=Math.hypot(p.x-a.x,p.y-a.y);if(d<Math.max(30,cellSize()*.78))primeCoreOrbitParticle(p,a)}state.primordialParticles.set(id,p);return p}"
new_create_particle = "function createPrimordialParticle(kind,x=null,y=null,target=null){const pt=(x===null||y===null)?freePoint(25):{x,y},id=state.nextPrimordialId++,p={id,kind,x:pt.x,y:pt.y,reacting:false};if(kind==='n'){p.unstable=!primordialNeutronsStable();p.bornRound=state.nuclearRound;p.lifetimeRounds=primordialNeutronLifetime()}if(target){p.targetX=target.x;p.targetY=target.y}if(!isPrimordial()&&['p','n','e'].includes(kind))primeStellarShellParticle(p,kind);state.primordialParticles.set(id,p);return p}"
if old_create_particle in js:
    js = replace_once(js, old_create_particle, new_create_particle, 'initialize stellar shell metadata')

old_spawn_float = r'''function spawnFloatingParticle(kind,x=null,y=null){
 const start=(x===null||y===null)?freePoint(25):{x,y},p=createPrimordialParticle(kind,start.x,start.y),dest=p.coreOrbiting?{x:p.x,y:p.y}:freePoint(30);p.reacting=true;renderPrimordialParticles();
 requestAnimationFrame(()=>{if(!p.coreOrbiting){p.x=dest.x;p.y=dest.y}renderPrimordialParticles()});
 setTimeout(()=>{const q=state.primordialParticles.get(p.id);if(q){q.reacting=false;renderPrimordialParticles();startPrimordialDrift()}},420);return p
}'''
new_spawn_float = r'''function spawnFloatingParticle(kind,x=null,y=null){
 const start=(x===null||y===null)?freePoint(25):{x,y},p=createPrimordialParticle(kind,start.x,start.y),shell=!isPrimordial()&&['p','n','e'].includes(kind),dest=shell?stellarShellTarget(p,kind):freePoint(30);p.reacting=true;renderPrimordialParticles();
 requestAnimationFrame(()=>{p.x=dest.x;p.y=dest.y;renderPrimordialParticles()});
 setTimeout(()=>{const q=state.primordialParticles.get(p.id);if(q){q.reacting=false;renderPrimordialParticles();startPrimordialDrift()}},420);return p
}'''
if old_spawn_float in js:
    js = replace_once(js, old_spawn_float, new_spawn_float, 'send emitted particles toward shell')

old_neutron_orbit = r'''function placeNeutronOnCoreOrbit(n,force=false){
 const anchor=stellarCoreAnchor(),dx=n.x-anchor.x,dy=n.y-anchor.y,d=Math.hypot(dx,dy),threshold=Math.max(30,cellSize()*.78);if(!force&&!n.coreOrbiting&&d>threshold)return false;if(!n.coreOrbiting){n.coreOrbiting=true;n.coreOrbitAngle=Math.atan2(dy||1,dx||1);n.coreOrbitRadius=Math.max(23,cellSize()*.62)+(n.id%3)*4}n.coreOrbitAngle=(n.coreOrbitAngle||0)+.16;n.x=anchor.x+Math.cos(n.coreOrbitAngle)*n.coreOrbitRadius;n.y=anchor.y+Math.sin(n.coreOrbitAngle)*n.coreOrbitRadius;return true;
}'''
new_neutron_orbit = r'''function placeNeutronOnStellarShell(n,force=false){
 if(!n)return false;if(force&&!n.shellOrbiting)primeStellarShellParticle(n,'n');return advanceStellarShellParticle(n,'n',.012)
}'''
if old_neutron_orbit in js:
    js = replace_once(js, old_neutron_orbit, new_neutron_orbit, 'replace process neutron core orbit')

js = js.replace('placeNeutronOnCoreOrbit(n,true)', "placeNeutronOnStellarShell(n,true)")
js = js.replace('placeNeutronOnCoreOrbit(n))continue;', "placeNeutronOnStellarShell(n))continue;")

# Generated neutrons retain their birth position and migrate outward instead of snapping to a core orbit.
old_generated = "const anchor=stellarCoreAnchor();if(Math.hypot(x-anchor.x,y-anchor.y)<Math.max(30,cellSize()*.78))placeNeutronOnStellarShell(n,true);state.neutrons.set(id,n);"
new_generated = "primeStellarShellParticle(n,'n');state.neutrons.set(id,n);"
if old_generated in js:
    js = replace_once(js, old_generated, new_generated, 'generated neutron migration')

# Keep selected process neutrons steady enough to target comfortably.
old_move_loop = "for(const n of state.neutrons.values()){\n   if(placeNeutronOnStellarShell(n))continue;"
new_move_loop = "for(const n of state.neutrons.values()){\n   if(state.selectedNeutron===n.id)continue;\n   if(placeNeutronOnStellarShell(n))continue;"
if old_move_loop in js:
    js = replace_once(js, old_move_loop, new_move_loop, 'pause selected neutron')

# 3) Unified stellar particle visual hierarchy: smaller than atoms and translucent until active.
css_marker = '/* Stellar particle shell: small translucent free particles around the stellar surface. */'
css_patch = r'''

/* Stellar particle shell: small translucent free particles around the stellar surface. */
.star-board:not(.primordial-mode) .primordial-particle.proton,
.star-board:not(.primordial-mode) .primordial-particle.electron,
.star-board:not(.primordial-mode) .primordial-particle.neutronfree{
  width:clamp(14px,calc(var(--cellSize)*.42),18px);
  height:clamp(14px,calc(var(--cellSize)*.42),18px);
  font-size:clamp(9px,calc(var(--cellSize)*.27),12px);
  opacity:.40;
  border-color:rgba(255,255,255,.46);
}
.star-board:not(.primordial-mode) .primordial-particle.proton::after,
.star-board:not(.primordial-mode) .primordial-particle.electron::after,
.star-board:not(.primordial-mode) .primordial-particle.neutronfree::after,
.neutron::after{content:"";position:absolute;inset:-8px;border-radius:50%}
.star-board:not(.primordial-mode) .primordial-particle.selected,
.star-board:not(.primordial-mode) .primordial-particle.candidate,
.star-board:not(.primordial-mode) .primordial-particle.reacting,
.star-board:not(.primordial-mode) .primordial-particle.dragging{opacity:1}
.neutron{
  width:clamp(14px,calc(var(--cellSize)*.42),18px);
  height:clamp(14px,calc(var(--cellSize)*.42),18px);
  font-size:clamp(9px,calc(var(--cellSize)*.27),12px);
  opacity:.40;
}
.neutron.candidate,.neutron.selected,.star-board.neutron-active .neutron{opacity:1}
'''
if css_marker not in css:
    css = css.rstrip() + css_patch + '\n'

# Final guards: make accidental partial patches fail loudly in CI.
required_js = [
    'function nearestOpenStellarCell(',
    'function createParticleReactionProduct(',
    'function settleParticleReactionProduct(',
    'function stellarShellOrbitRadius(',
    'function advanceStellarShellParticle(',
    "createParticleReactionProduct('H'",
    "createParticleReactionProduct('D'",
    'settleParticleReactionProduct(spawn)',
    "primeStellarShellParticle(n,'n')",
]
for token in required_js:
    if token not in js:
        raise RuntimeError(f'missing expected JS token after patch: {token}')

if 'advanceCoreOrbitParticle' in js or 'placeNeutronOnCoreOrbit' in js:
    raise RuntimeError('legacy core-orbit implementation survived patch')

JS_PATH.write_text(js, encoding='utf-8')
CSS_PATH.write_text(css, encoding='utf-8')
print('stellar particle shell patch applied')
