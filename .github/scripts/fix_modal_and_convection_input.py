from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


path = Path('assets/js/ardua.js')
text = path.read_text(encoding='utf-8')

old = """function convectionConfirmationIsUiControl(target){
 const el=target instanceof Element?target:null;
 return !!el?.closest('button,a,input,select,textarea,[role=\"dialog\"],.modal,.stellar-intro,.event-tooltip,.ambient-banner');
}
"""
new = """function convectionConfirmationIsUiControl(target){
 const el=target instanceof Element?target:null;
 if(!el)return false;
 return !!el.closest('a,input,select,textarea,[role=\"dialog\"],.modal,.stellar-intro,.event-tooltip,.ambient-banner,#menuOpenBtn,#closeMenu,#phaseEndBtn,#stellarStartBtn,#eventTooltipBtn,#ambientContinueBtn,#convectionBtn');
}
"""
text = replace_once(text, old, new, 'convection UI filter')

old = """function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
"""
new = """function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
"""
text = replace_once(text, old, new, 'convection tap anchor')

old = """$('phaseEndBtn').addEventListener('click',endPhaseAction);$('eventTooltipBtn').addEventListener('click',closeEventTooltip);$('ambientContinueBtn').addEventListener('click',rewardDirectorDismiss);dom.singularity.addEventListener('click',launchBigBang);"""
new = """function bindReliableTap(el,action){
 if(!el||typeof action!=='function')return;let lastPointerUp=0;
 el.addEventListener('pointerup',ev=>{lastPointerUp=performance.now();ev.preventDefault();ev.stopPropagation();action()},true);
 el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(performance.now()-lastPointerUp<650)return;action()},true);
}
$('phaseEndBtn').addEventListener('click',endPhaseAction);bindReliableTap($('eventTooltipBtn'),closeEventTooltip);bindReliableTap($('ambientContinueBtn'),rewardDirectorDismiss);dom.singularity.addEventListener('click',launchBigBang);"""
text = replace_once(text, old, new, 'reliable continue buttons')

path.write_text(text, encoding='utf-8')
print('input flow patch applied')
