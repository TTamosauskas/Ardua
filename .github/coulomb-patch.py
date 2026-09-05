from pathlib import Path
import hashlib

path=Path('assets/js/ardua.js')
s=path.read_text()

repls=[
("const route=protonCaptureRoute(target,s),key=String(target.id),blocked=coulombCellBlocked(cell,s,target.sym)&&coulombRollBlocks(s);state.protonCaptureAttempts[key]=(state.protonCaptureAttempts[key]||0)+1;",
 "const route=protonCaptureRoute(target,s),key=String(target.id),blocked=coulombRollBlocks(cell,s,target.sym);state.protonCaptureAttempts[key]=(state.protonCaptureAttempts[key]||0)+1;"),
("""const COULOMB_EXEMPT_SYMS=new Set(['H','D','T']);
function coulombMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('coulomb_intro');return intro!==undefined&&state.phaseIndex>=intro;
}
function coulombCellBlocked(cell,s=phase(),sym=null){
 if(!coulombMechanicUnlocked(s)||cell===null||cell===undefined||Number(coords[cell]?.ring)<=2)return false;
 if(sym&&COULOMB_EXEMPT_SYMS.has(sym))return false;
 return true;
}
function coulombRollBlocks(s=phase()){
 // O tutorial é determinístico. Depois dele, tentar na periferia é uma aposta de 50%.
 return s.id==='coulomb_intro'||Math.random()<.5;
}
""",
"""const COULOMB_EXEMPT_SYMS=new Set(['H','D','T']);
const COULOMB_BLOCK_CHANCE_BY_RING=Object.freeze({0:0,1:0,2:.5,3:.6,4:.8});
function coulombMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('coulomb_intro');return intro!==undefined&&state.phaseIndex>=intro;
}
function coulombBlockChance(cell,s=phase(),sym=null){
 if(!coulombMechanicUnlocked(s)||cell===null||cell===undefined)return 0;
 if(sym&&COULOMB_EXEMPT_SYMS.has(sym))return 0;
 const ring=Math.max(0,Math.min(4,Number(coords[cell]?.ring)||0));
 if(s.id==='coulomb_intro')return ring<=2?0:1;
 return Number(COULOMB_BLOCK_CHANCE_BY_RING[ring]||0);
}
function coulombCellBlocked(cell,s=phase(),sym=null){
 return coulombBlockChance(cell,s,sym)>0;
}
function coulombRollBlocks(cell,s=phase(),sym=null){
 const chance=coulombBlockChance(cell,s,sym);return chance>0&&Math.random()<chance;
}
"""),
(""" const blocked=[...cells].filter(c=>{const id=state.board[c],p=id?state.pieces.get(id):null;return !!p&&coulombCellBlocked(c,s,p.sym)}).sort((a,b)=>(coords[b]?.ring??0)-(coords[a]?.ring??0));
 if(!blocked.length||!coulombRollBlocks(s))return true;
 const blockedCell=blocked[0],blockedId=state.board[blockedCell],blockedPiece=blockedId?state.pieces.get(blockedId):null,t=blockedPiece?{x:blockedPiece.x,y:blockedPiece.y}:pos(coords[blockedCell]);
 await showCoulombTooltip(t.x,t.y);if(blockedPiece)showCoulombBarrier(blockedPiece);state.coulombRepulsions++;captureTag(t.x,t.y,'barreira de Coulomb');tone(165,.10,'sawtooth',.028);vibrate(7);await wait(300);state.selected=[blockedCell];render();return false;
""",
""" const blocked=[...cells].filter(c=>{const id=state.board[c],p=id?state.pieces.get(id):null;return !!p&&coulombCellBlocked(c,s,p.sym)}).sort((a,b)=>(coords[b]?.ring??0)-(coords[a]?.ring??0));
 if(!blocked.length)return true;
 const blockedCell=blocked[0],blockedId=state.board[blockedCell],blockedPiece=blockedId?state.pieces.get(blockedId):null;
 if(!blockedPiece||!coulombRollBlocks(blockedCell,s,blockedPiece.sym))return true;
 const t={x:blockedPiece.x,y:blockedPiece.y};
 await showCoulombTooltip(t.x,t.y);showCoulombBarrier(blockedPiece);state.coulombRepulsions++;captureTag(t.x,t.y,'barreira de Coulomb');tone(165,.10,'sawtooth',.028);vibrate(7);await wait(300);state.selected=[blockedCell];render();return false;
""")]

for old,new in repls:
    count=s.count(old)
    if count!=1:
        raise SystemExit(f'expected exactly one replacement, found {count}')
    s=s.replace(old,new)

expected='3580d4fcbb8a0c9aebcb856f2ddb7c1b14d78eb65f590511ec7e5ef4172e9a0a'
actual=hashlib.sha256(s.encode()).hexdigest()
if actual!=expected:
    raise SystemExit(f'sha256 mismatch: {actual} != {expected}')
path.write_text(s)
print(actual)
