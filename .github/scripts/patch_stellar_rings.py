from pathlib import Path

path = Path('assets/js/ardua.js')
text = path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    text = text.replace(old, new, 1)


replace_once('const MAX_RADIUS=4;', 'const MAX_RADIUS=5;', 'MAX_RADIUS')

replace_once(
    "return{id:`phase_${sp.id}`,branch:`Atlas de fusões · ${info.label.toLowerCase()}`,title:`Reação ${E[sp.a]?.name||sp.a}–${E[sp.b]?.name||sp.b}`,meta:sp.label,new:sp.mainSym,mode:'reactionExplore',atlasId:sp.id,target:sp.target,flowTarget:sp.target,visual:atlasVisualFor(sp),fill:0,micro:true,continueAfterComplete:true,fusionTempMax:Math.min(3.2e9,Math.max(1e8,sp.barrier*2e7)),menuTag:`${sp.a}+${sp.b}`,endLabel:'PRÓXIMA<br>REAÇÃO'};",
    "return{id:`phase_${sp.id}`,branch:`Atlas de fusões · ${info.label.toLowerCase()}`,title:`Reação ${E[sp.a]?.name||sp.a}–${E[sp.b]?.name||sp.b}`,meta:sp.label,new:sp.mainSym,mode:'reactionExplore',atlasId:sp.id,anchorId:sp.anchorId||sp.existingPhaseId||null,target:sp.target,flowTarget:sp.target,visual:atlasVisualFor(sp),fill:0,micro:true,continueAfterComplete:true,fusionTempMax:Math.min(3.2e9,Math.max(1e8,sp.barrier*2e7)),menuTag:`${sp.a}+${sp.b}`,endLabel:'PRÓXIMA<br>REAÇÃO'};",
    'Atlas anchor context',
)

old_radius = """function phaseRadius(s=phase()){
  if(isPrimordial(s))return 3;
  if(s.mode==='whiteCompact')return 3;
  if(s.mode==='collapseFinal')return 2;
  if(['remnant','pulsar','accretion','blackhole'].includes(s.mode))return 3;
  if(s.visual==='brownDwarf'||s.visual==='whiteDwarf')return 1;
  if(s.visual==='nebula'||s.visual==='redDwarf'||s.visual==='orangeDwarf')return 2;
  if(s.visual==='yellowDwarf'||s.visual==='agb')return 3;
  return 4;
}"""

new_radius = """const SUPERGIANT_RADIUS_VISUALS=new Set(['massive','supergiant','advanced','ironCore','kilonova','xrayBurst']);
const SUPERGIANT_RADIUS_MODES=new Set(['collapseFinal','remnant','pulsar','accretion','blackhole','guidedDecay']);
const SUPERGIANT_ATLAS_ANCHORS=new Set(['nu_f','ne','na','mg','al','si','p','s','cl','ar','k','ca','sc','ti','v','cr','mn','fe']);
function phaseRadius(s=phase()){
  if(isPrimordial(s))return 3;
  if(s.id==='brown'||s.visual==='brownDwarf')return 1;
  if(s.id==='he_red'||s.visual==='redDwarf')return 2;
  if(s.id==='he_orange'||s.id==='he_yellow'||s.mode==='whiteCompact'||s.visual==='whiteDwarf')return 3;
  // Queima de Carbono é o precursor imediato do fork de Supergigantes.
  if(s.id==='carbon_burn')return 4;
  // Microfases Atlas acompanham a escala física do ponto da trilha em que vivem.
  if(s.mode==='reactionExplore'&&s.anchorId)return SUPERGIANT_ATLAS_ANCHORS.has(s.anchorId)?5:4;
  if(SUPERGIANT_RADIUS_MODES.has(s.mode)||SUPERGIANT_RADIUS_VISUALS.has(s.visual))return 5;
  if(s.visual==='redGiant'||s.visual==='agb')return 4;
  if(s.visual==='nebula')return 2;
  return 4;
}"""
replace_once(old_radius, new_radius, 'phaseRadius')

replace_once(
    """  else if(s.visual==='redGiant'){factor=.98;max=560}
  else if(r===3){factor=.90;max=470}
  else {factor=.985;max=555}""",
    """  else if(s.visual==='redGiant'){factor=.98;max=560}
  else if(r===5){factor=.995;max=600}
  else if(r===3){factor=.90;max=470}
  else {factor=.985;max=555}""",
    'phaseGeometry ring 5',
)

replace_once(
    '  const c=Math.max(36,Math.min(72,px*.88/(2*g.r+1)));',
    '  const minCell=g.r>=5?28:36,c=Math.max(minCell,Math.min(72,px*.88/(2*g.r+1)));',
    'applyGeometry cell size',
)

replace_once(
    'function cellSize(){const g=phaseGeometry();return Math.max(36,Math.min(72,starSize()*.88/(2*g.r+1)))}',
    'function cellSize(){const g=phaseGeometry(),minCell=g.r>=5?28:36;return Math.max(minCell,Math.min(72,starSize()*.88/(2*g.r+1)))}',
    'runtime cell size',
)

replace_once(
    'const COULOMB_BLOCK_CHANCE_BY_RING=Object.freeze({0:0,1:0,2:.5,3:.6,4:.8});',
    'const COULOMB_BLOCK_CHANCE_BY_RING=Object.freeze({0:0,1:0,2:.10,3:.20,4:.40,5:.50});',
    'Coulomb probabilities',
)

replace_once(
    ' const ring=Math.max(0,Math.min(4,Number(coords[cell]?.ring)||0));',
    ' const ring=Math.max(0,Math.min(5,Number(coords[cell]?.ring)||0));',
    'Coulomb ring clamp',
)

checks = [
    'const MAX_RADIUS=5;',
    "const COULOMB_EXEMPT_SYMS=new Set(['H','D','T']);",
    'const COULOMB_BLOCK_CHANCE_BY_RING=Object.freeze({0:0,1:0,2:.10,3:.20,4:.40,5:.50});',
    "if(s.id==='brown'||s.visual==='brownDwarf')return 1;",
    "if(s.id==='he_red'||s.visual==='redDwarf')return 2;",
    "if(s.id==='he_orange'||s.id==='he_yellow'||s.mode==='whiteCompact'||s.visual==='whiteDwarf')return 3;",
    "if(s.id==='carbon_burn')return 4;",
    "if(s.mode==='reactionExplore'&&s.anchorId)return SUPERGIANT_ATLAS_ANCHORS.has(s.anchorId)?5:4;",
    "if(SUPERGIANT_RADIUS_MODES.has(s.mode)||SUPERGIANT_RADIUS_VISUALS.has(s.visual))return 5;",
    "if(s.id==='coulomb_intro')return ring<=2?0:1;",
]
for check in checks:
    if check not in text:
        raise SystemExit(f'validation missing: {check}')

path.write_text(text, encoding='utf-8')
print('stellar ring migration applied')
