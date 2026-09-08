from pathlib import Path


def patch(path, old, new, label):
    p=Path(path)
    s=p.read_text(encoding='utf-8')
    if new in s:
        return
    if old not in s:
        raise SystemExit(f'{label}: anchor missing in {path}')
    p.write_text(s.replace(old,new,1),encoding='utf-8')

# 1) Phase menu: restart only current phase + sound closes the menu.
patch('assets/js/campaign-fork-links.js',
      '<button type="button" id="phaseQuickRestart"><span>Recomeçar</span><small>Reiniciar esta fase desde o início</small></button>',
      '<button type="button" id="phaseQuickRestart"><span>Recomeçar Fase</span><small>Reiniciar esta fase desde o início</small></button>',
      'restart label')
patch('assets/js/campaign-fork-links.js',
      "soundBtn?.addEventListener('click',()=>applySound(!soundtrackEnabled(),true));",
      "soundBtn?.addEventListener('click',()=>{applySound(!soundtrackEnabled(),true);closeQuickMenu(false)});",
      'phase sound closes menu')

# Remove the page reload interceptor. The existing phaseQuickRestart handler in
# campaign-fork-links clicks the active phase-jump, whose startPhase() resets
# only that phase's runtime state while preserving campaign progress.
p=Path('assets/js/phase-polish.js'); s=p.read_text(encoding='utf-8')
old="""/* Full-page phase restart: runtime phase state is rebuilt from the persisted campaign position. */
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target.closest('#phaseQuickRestart'):null;
 if(!target)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 try{history.scrollRestoration='manual'}catch(_e){}
 try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_e){}
 window.location.reload();
},true);

"""
new="""/* Phase restart is owned by the phase utility menu: it re-enters only the active phase. */

"""
if old in s:s=s.replace(old,new,1)
elif 'window.location.reload()' in s:raise SystemExit('phase restart reload anchor changed')
p.write_text(s,encoding='utf-8')

# Campaign-home toggles also close their own menu for consistent behavior.
patch('assets/js/campaign-home-polish.js',
      "soundBtn?.addEventListener('click',()=>applySound(!soundtrackEnabled()));",
      "soundBtn?.addEventListener('click',()=>{applySound(!soundtrackEnabled());closeMenu(false)});",
      'home sound closes menu')

# 2) Rotation: toggle closes the owning menu; use the actual central grid cell as
# pivot so the central atom is genuinely stationary.
patch('assets/js/rotation-polish.js',
      " button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle()});",
      """ button.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();toggle();
  if(id==='phaseQuickRotation')document.querySelector('#phaseQuickMenu .phase-quick-close')?.click();
  else if(id==='campaignHomeRotation')document.querySelector('#campaignHomeMenu .campaign-home-menu-close')?.click();
 });""",
      'rotation toggle closes menu')
patch('assets/js/rotation-polish.js',
      """ const cells=[...document.querySelectorAll('#cells .cell')],key=`${board.clientWidth}x${board.clientHeight}:${cells.length}`;
 if(geometry?.key===key)return geometry;
 const hull=convexHull(cells.map(point).filter(Boolean));
 geometry={key,cx:board.clientWidth/2,cy:board.clientHeight/2,hull};return geometry;""",
      """ const cells=[...document.querySelectorAll('#cells .cell')],key=`${board.clientWidth}x${board.clientHeight}:${cells.length}`;
 if(geometry?.key===key)return geometry;
 const points=cells.map(point).filter(Boolean),boardCx=board.clientWidth/2,boardCy=board.clientHeight/2;
 const pivot=points.reduce((best,p)=>Math.hypot(p.x-boardCx,p.y-boardCy)<Math.hypot(best.x-boardCx,best.y-boardCy)?p:best,points[0]||{x:boardCx,y:boardCy});
 const hull=convexHull(points);
 geometry={key,cx:pivot.x,cy:pivot.y,hull};return geometry;""",
      'central grid pivot')
patch('assets/js/rotation-polish.js',
      " const dx=x-g.cx,dy=y-g.cy,r=Math.hypot(dx,dy);if(r<.01)return{x,y};",
      " const dx=x-g.cx,dy=y-g.cy,r=Math.hypot(dx,dy);if(r<1)return{x:g.cx,y:g.cy};",
      'central atom lock')

# 3) Element detail remains below visible tabs; tabs replace the back arrow.
p=Path('assets/js/campaign-discoveries-elements.js'); s=p.read_text(encoding='utf-8')
repls=[
("detail.innerHTML=`<header class=\"element-discovery-head\"><strong data-element-detail-title></strong><button type=\"button\" class=\"element-detail-back\" data-element-detail-back aria-label=\"Voltar para elementos\"><span aria-hidden=\"true\">←</span></button></header><div id=\"elementDiscoveryBody\"></div>`;",
 "detail.innerHTML=`<header class=\"element-discovery-head\"><strong data-element-detail-title></strong></header><div id=\"elementDiscoveryBody\"></div>`;"),
(""" detail.addEventListener('click',e=>{
  const back=e.target instanceof Element?e.target.closest('[data-element-detail-back]'):null;
  if(back){e.preventDefault();leaveElementDetail();return}
  const phase=e.target instanceof Element?e.target.closest('[data-element-phase]'):null;
  if(phase){e.preventDefault();openPhase(phase.dataset.elementPhase)}
 });""",
 """ detail.addEventListener('click',e=>{
  const phase=e.target instanceof Element?e.target.closest('[data-element-phase]'):null;
  if(phase){e.preventDefault();openPhase(phase.dataset.elementPhase)}
 });"""),
("""function setDetailMode(on){
 const tabs=$('discoveriesTabs');
 if(tabs)tabs.hidden=on;
 modal.classList.toggle('element-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{
  if(on)panel.hidden=true;
 });
 if(!on){
  const elementBtn=tabs?.querySelector('[data-discovery-tab=\"elements\"]');
  if(elementBtn)elementBtn.click();
 }
}
function leaveElementDetail(){
 const host=ensureDetail();host.hidden=true;host.removeAttribute('data-open');delete host.dataset.sym;setDetailMode(false);requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}""",
 """function setDetailMode(on){
 const tabs=$('discoveriesTabs');
 if(tabs)tabs.hidden=false;
 modal.classList.toggle('element-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
}
function leaveElementDetail(restoreTab=true){
 const host=ensureDetail();host.hidden=true;host.removeAttribute('data-open');delete host.dataset.sym;setDetailMode(false);
 if(restoreTab)$('discoveriesTabs')?.querySelector('[data-discovery-tab=\"elements\"]')?.click();
 requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}"""),
("if(tab&&detail&&!detail.hidden)leaveElementDetail();","if(tab&&detail&&!detail.hidden)leaveElementDetail(false);")
]
for old,new in repls:
    if new in s: continue
    if old not in s: raise SystemExit('element detail anchor missing')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# 4) Phenomenon detail follows the same interaction.
p=Path('assets/js/campaign-discoveries-phenomena.js'); s=p.read_text(encoding='utf-8')
repls=[
("detail.innerHTML=`<header class=\"element-discovery-head\"><strong data-phenomenon-detail-title></strong><button type=\"button\" class=\"element-detail-back\" data-phenomenon-detail-back aria-label=\"Voltar para fenômenos\"><span aria-hidden=\"true\">←</span></button></header><div id=\"phenomenonDiscoveryBody\"></div>`;",
 "detail.innerHTML=`<header class=\"element-discovery-head\"><strong data-phenomenon-detail-title></strong></header><div id=\"phenomenonDiscoveryBody\"></div>`;"),
(""" detail.addEventListener('click',e=>{
  const back=e.target instanceof Element?e.target.closest('[data-phenomenon-detail-back]'):null;
  if(back){e.preventDefault();leaveDetail()}
 });""",
 """ detail.addEventListener('click',()=>{});"""),
("""function setDetailMode(on){
 const tabs=$('discoveriesTabs');if(tabs)tabs.hidden=on;
 modal.classList.toggle('phenomenon-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
 if(!on)tabs?.querySelector('[data-discovery-tab=\"phenomena\"]')?.click();
}
function leaveDetail(){
 requestSerial++;
 const host=ensureDetail();host.hidden=true;host.removeAttribute('aria-busy');delete host.dataset.title;setDetailMode(false);requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}""",
 """function setDetailMode(on){
 const tabs=$('discoveriesTabs');if(tabs)tabs.hidden=false;
 modal.classList.toggle('phenomenon-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
}
function leaveDetail(restoreTab=true){
 requestSerial++;
 const host=ensureDetail();host.hidden=true;host.removeAttribute('aria-busy');delete host.dataset.title;setDetailMode(false);
 if(restoreTab)$('discoveriesTabs')?.querySelector('[data-discovery-tab=\"phenomena\"]')?.click();
 requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}"""),
("if(tab&&detail&&!detail.hidden)leaveDetail();","if(tab&&detail&&!detail.hidden)leaveDetail(false);")
]
for old,new in repls:
    if new in s: continue
    if old not in s: raise SystemExit('phenomenon detail anchor missing')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# 5) Never render undiscovered atlas boxes in the engine. The CSS rule below is a
# defensive layer for any stale DOM that predates a render.
p=Path('assets/js/ardua.js'); s=p.read_text(encoding='utf-8')
old="for(const entry of DISCOVERY_ATLAS){if(entry.group!==group){"
new="for(const entry of DISCOVERY_ATLAS){const open=discoveryUnlocked(entry);if(!open)continue;if(entry.group!==group){"
if new not in s:
    if old not in s: raise SystemExit('discovery atlas loop anchor missing')
    s=s.replace(old,new,1)
old_decl="const open=discoveryUnlocked(entry),b=document.createElement('button');"
new_decl="const b=document.createElement('button');"
if old_decl in s:
    s=s.replace(old_decl,new_decl,1)
elif new not in s:
    raise SystemExit('discovery atlas open duplicate anchor missing')
p.write_text(s,encoding='utf-8')

p=Path('assets/css/phase-polish.css'); s=p.read_text(encoding='utf-8')
rule="\n/* Descobertas lists only entries that have actually been discovered. */\n#menuModal.discoveries-view .discovery-card.locked{display:none!important}\n"
if rule.strip() not in s:s+=rule
p.write_text(s,encoding='utf-8')

print('menu, discoveries and central-rotation UX updated')
