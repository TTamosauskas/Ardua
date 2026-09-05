from pathlib import Path


def load(path):
    return Path(path).read_text(encoding='utf-8')


def save(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


# JS: protect modal/continue controls from the global convection confirmation gesture
path = 'assets/js/ardua.js'
text = load(path)
old = """function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('pointerdown',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   ev.preventDefault();ev.stopPropagation();const path=[...(state.convectionPathCells||[])];state.convectionConfirmPending=false;performConvection(path);
 },true);
}
"""
new = """function convectionConfirmationIsUiControl(target){
 const el=target instanceof Element?target:null;
 return !!el?.closest('button,a,input,select,textarea,[role=\"dialog\"],.modal,.stellar-intro,.event-tooltip,.ambient-banner');
}
function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('pointerdown',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   if(convectionConfirmationIsUiControl(ev.target))return;
   ev.preventDefault();ev.stopPropagation();const path=[...(state.convectionPathCells||[])];state.convectionConfirmPending=false;performConvection(path);
 },true);
}
"""
text = replace_once(text, old, new, 'convection confirmation UI guard')

old = """function renderConvectionControl(){
 const b=ensureConvectionControl(),available=convectionMechanicUnlocked(),charged=Number(state.convectionCharge||0)>0,armed=!!state.convectionArmed,pending=!!state.convectionConfirmPending,show=available&&charged&&!state.phaseDone;
 b.classList.toggle('show',show);b.classList.toggle('charged',show);b.classList.toggle('armed',armed);b.classList.toggle('pending',pending);b.disabled=!show||state.locked||pending;b.setAttribute('aria-pressed',armed?'true':'false');
 dom.star.classList.toggle('convection-core-charged',show);dom.star.classList.toggle('convection-confirm-pending',pending);
}
"""
new = """function renderConvectionControl(){
 const b=ensureConvectionControl(),available=convectionMechanicUnlocked(),charged=Number(state.convectionCharge||0)>0,armed=!!state.convectionArmed,pending=!!state.convectionConfirmPending,show=available&&charged&&!state.phaseDone;
 const centerCell=(byRing[0]||[])[0],centerId=centerCell===undefined?null:state.board[centerCell],centerPiece=centerId?state.pieces.get(centerId):null,anchor=centerPiece&&!centerPiece.free?{x:centerPiece.x,y:centerPiece.y}:(centerCell===undefined?null:pos(coords[centerCell]));
 if(anchor){b.style.left=anchor.x+'px';b.style.top=anchor.y+'px'}
 b.classList.toggle('show',show);b.classList.toggle('charged',show);b.classList.toggle('armed',armed);b.classList.toggle('pending',pending);b.disabled=!show||state.locked||pending;b.setAttribute('aria-pressed',armed?'true':'false');
 dom.star.classList.toggle('convection-core-charged',show);dom.star.classList.toggle('convection-confirm-pending',pending);
}
"""
text = replace_once(text, old, new, 'anchor convection control to ring zero')
save(path, text)

# CSS: make the diegetic trigger the same visual scale as a nucleus
path = 'assets/css/ardua.css'
text = load(path)
text = replace_once(
    text,
    ".convection-core-trigger{display:none;position:absolute;left:50%;top:50%;z-index:66;width:calc(var(--cellSize)*1.15);height:calc(var(--cellSize)*1.15);",
    ".convection-core-trigger{display:none;position:absolute;left:50%;top:50%;z-index:66;width:calc(var(--cellSize)*.80);height:calc(var(--cellSize)*.80);",
    'convection trigger nucleus size'
)
text = replace_once(
    text,
    ".convection-glyph{position:relative;z-index:3;font-size:calc(var(--cellSize)*.56);",
    ".convection-glyph{position:relative;z-index:3;font-size:calc(var(--cellSize)*.43);",
    'convection glyph size'
)
text = replace_once(
    text,
    ".convection-gamma-orbit{position:absolute;left:50%;top:50%;z-index:4;font-size:calc(var(--cellSize)*.27);",
    ".convection-gamma-orbit{position:absolute;left:50%;top:50%;z-index:4;font-size:calc(var(--cellSize)*.21);",
    'gamma orbit glyph size'
)
text = text.replace("translateX(calc(var(--cellSize)*.49))", "translateX(calc(var(--cellSize)*.34))")
text = text.replace("translateX(calc(var(--cellSize)*.42))", "translateX(calc(var(--cellSize)*.30))")
text = text.replace("translateX(calc(var(--cellSize)*.51))", "translateX(calc(var(--cellSize)*.35))")
text = text.replace("translateX(calc(var(--cellSize)*.40))", "translateX(calc(var(--cellSize)*.29))")
text = replace_once(
    text,
    "@media(max-width:430px){.convection-core-trigger{width:calc(var(--cellSize)*1.08);height:calc(var(--cellSize)*1.08)}.convection-glyph{font-size:calc(var(--cellSize)*.52)}}",
    "@media(max-width:430px){.convection-core-trigger{width:calc(var(--cellSize)*.80);height:calc(var(--cellSize)*.80)}.convection-glyph{font-size:calc(var(--cellSize)*.43)}}",
    'mobile convection trigger size'
)
save(path, text.rstrip()+'\n')

print('convection UI fixes applied')
