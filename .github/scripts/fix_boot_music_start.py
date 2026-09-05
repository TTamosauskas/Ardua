from pathlib import Path

ROOT = Path('.')


def replace_once(path, old, new, label):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match in {path}, found {count}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')
    print(f'patched {label}: {path}')

# 1) index.html: music is created from the head, and initial UI is masked until the campaign map is ready.
replace_once(
    'index.html',
    '<title>Ardua — Astrofísica Nuclear</title>\n<link rel="preconnect" href="https://raw.githubusercontent.com" crossorigin/>\n<link rel="preload" href="https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a" as="audio" type="audio/mp4" crossorigin="anonymous"/>',
    '<title>Ardua — Astrofísica Nuclear</title>\n<script>document.documentElement.classList.add(\'ardua-map-boot\');setTimeout(()=>document.documentElement.classList.remove(\'ardua-map-boot\'),5000)</script>\n<link rel="preconnect" href="https://raw.githubusercontent.com"/>\n<link rel="preload" href="https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a" as="audio" type="audio/mp4"/>\n<script src="assets/js/music.js"></script>\n<style>html.ardua-map-boot body>.app,html.ardua-map-boot .stellar-intro{visibility:hidden!important}</style>',
    'head soundtrack bootstrap'
)
replace_once(
    'index.html',
    '<audio id="arduaSoundtrack" src="https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a" preload="auto" autoplay loop playsinline crossorigin="anonymous" hidden></audio>\n<script src="assets/js/music.js"></script>\n',
    '',
    'remove body audio bootstrap'
)
replace_once(
    'index.html',
    '<script src="assets/js/ardua.js"></script>\n<script src="assets/js/stellar-intro-input.js"></script>',
    '<script src="assets/js/ardua.js"></script>',
    'remove external start helper include'
)

# 2) Dedicated soundtrack controller: starts loading in the head, never hooks gameplay buttons/gestures.
music = r'''/* Ardua — continuous background soundtrack, independent from game controls. */
(()=>{
'use strict';
const RAW_SRC='https://raw.githubusercontent.com/TTamosauskas/Ardua/main/assets/AaronCopland.m4a';
const LOCAL_FALLBACK='assets/AaronCopland.m4a';
const MAP_VOLUME=.50;
const PHASE_VOLUME=.15;
const FADE_MS=950;
const audio=new Audio();
let fadeFrame=0;
let fallbackUsed=false;
let observer=null;

audio.preload='auto';
audio.autoplay=true;
audio.loop=true;
audio.playsInline=true;
audio.controls=false;
audio.muted=false;
audio.defaultMuted=false;
audio.volume=MAP_VOLUME;
audio.src=RAW_SRC;

function wantedVolume(){
 const body=document.body;
 if(!body||document.documentElement.classList.contains('ardua-map-boot'))return MAP_VOLUME;
 return body.classList.contains('campaign-map-open')?MAP_VOLUME:PHASE_VOLUME;
}
function stopFade(){if(fadeFrame){cancelAnimationFrame(fadeFrame);fadeFrame=0}}
function fadeTo(target,duration=FADE_MS){
 target=Math.max(0,Math.min(1,target));stopFade();
 const from=audio.volume,start=performance.now(),delta=target-from;
 if(Math.abs(delta)<.002||duration<=0){audio.volume=target;return}
 const step=now=>{const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);audio.volume=Math.max(0,Math.min(1,from+delta*ease));if(t<1)fadeFrame=requestAnimationFrame(step);else fadeFrame=0};
 fadeFrame=requestAnimationFrame(step);
}
function sync(immediate=false){const target=wantedVolume();if(immediate){stopFade();audio.volume=target}else fadeTo(target)}
function tryPlay(){
 sync(true);
 if(!audio.paused&&!audio.ended)return;
 try{const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_e){}
}
function observeBody(){
 if(!document.body||observer)return;
 observer=new MutationObserver(()=>sync(false));
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 sync(true);
}
function useLocalFallback(){
 if(fallbackUsed)return;fallbackUsed=true;
 audio.src=LOCAL_FALLBACK;audio.load();tryPlay();
}

audio.addEventListener('loadedmetadata',tryPlay);
audio.addEventListener('loadeddata',tryPlay);
audio.addEventListener('canplay',tryPlay);
audio.addEventListener('error',useLocalFallback);

document.addEventListener('DOMContentLoaded',()=>{observeBody();tryPlay()},{once:true});
window.addEventListener('load',tryPlay,{once:true});
window.addEventListener('pageshow',tryPlay);
window.addEventListener('focus',tryPlay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);tryPlay()}});

audio.load();
tryPlay();

window.ARDUA_MUSIC=Object.freeze({audio,source:RAW_SRC,mapVolume:MAP_VOLUME,phaseVolume:PHASE_VOLUME,sync:()=>sync(false),play:tryPlay});
})();
'''
(ROOT / 'assets/js/music.js').write_text(music, encoding='utf-8')
print('rewrote soundtrack controller')

# 3) Engine-owned start handler: direct pointerdown -> closeStellarPopup, with stale-state healing.
replace_once(
    'assets/js/ardua.js',
    "function closeStellarPopup(){\n if(!state.popupOpen)return;$('stellarIntro').classList.remove('show');state.popupOpen=false;state.popupKind=null;$('stellarStartBtn').textContent='COMEÇAR';",
    "function closeStellarPopup(){\n const intro=$('stellarIntro');if(!state.popupOpen&&!intro?.classList.contains('show'))return;intro?.classList.remove('show');state.popupOpen=false;state.popupKind=null;$('stellarStartBtn').textContent='COMEÇAR';",
    'heal stellar popup close state'
)
old_bind = """function bindReliableTap(el,action){
 if(!el||typeof action!=='function')return;let lastPointerUp=0;
 el.addEventListener('pointerup',ev=>{lastPointerUp=performance.now();ev.preventDefault();ev.stopPropagation();action()},true);
 el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(performance.now()-lastPointerUp<650)return;action()},true);
}
"""
new_bind = old_bind + """function bindPhaseStart(el){
 if(!el)return;let lastActivation=0;
 el.style.touchAction='manipulation';el.style.pointerEvents='auto';el.style.position='relative';el.style.zIndex='24';
 const activate=ev=>{
  const intro=$('stellarIntro');if(!state.popupOpen&&!intro?.classList.contains('show'))return;
  if(ev?.pointerType==='mouse'&&Number.isFinite(ev.button)&&ev.button!==0)return;
  const now=performance.now();if(now-lastActivation<450)return;lastActivation=now;
  ev?.preventDefault?.();ev?.stopPropagation?.();closeStellarPopup();
 };
 el.addEventListener('pointerdown',activate,true);
 el.addEventListener('click',activate,true);
 if(!window.PointerEvent)el.addEventListener('touchstart',activate,{capture:true,passive:false});
}
"""
replace_once('assets/js/ardua.js', old_bind, new_bind, 'engine phase start binding')
replace_once(
    'assets/js/ardua.js',
    "bindReliableTap($('stellarStartBtn'),closeStellarPopup);",
    "bindPhaseStart($('stellarStartBtn'));",
    'use engine phase start binding'
)

# 4) CSS makes COMEÇAR its own top interaction surface.
replace_once(
    'assets/css/ardua.css',
    '.stellar-start{width:100%;border:0;border-radius:16px;padding:14px;background:linear-gradient(135deg,#8bdcff,#bba8ff);color:#07111f;font-weight:950;cursor:pointer}',
    '.stellar-start{position:relative;z-index:24;pointer-events:auto;touch-action:manipulation;width:100%;border:0;border-radius:16px;padding:14px;background:linear-gradient(135deg,#8bdcff,#bba8ff);color:#07111f;font-weight:950;cursor:pointer}',
    'stellar start interaction surface'
)

# 5) Campaign always boots into the visible trail; the engine bootstrap modal is dismissed underneath it.
replace_once(
    'assets/js/campaign-map.js',
    " const introduced=C.getState().introduced||C.editor;setTrailVisible(introduced,!!opts.reveal);",
    " setTrailVisible(true,!!opts.reveal);",
    'always show campaign trail'
)
replace_once(
    'assets/js/campaign-map.js',
    "const initial=C.getState();\nif(C.editor||initial.introduced)setTimeout(()=>showMap({required:true,focusCurrent:true}),0);\nelse setTimeout(()=>showMap({required:true,rootOnly:true,instant:true}),0);",
    "const initial=C.getState();\nsetTimeout(()=>{\n const intro=$('stellarIntro');if(intro?.classList.contains('show'))$('stellarStartBtn')?.click();\n showMap({required:true,focusCurrent:!!initial.introduced,rootOnly:!initial.introduced,instant:true});\n document.documentElement.classList.remove('ardua-map-boot');\n window.ARDUA_MUSIC?.sync?.();\n},0);",
    'campaign-first boot'
)

# Remove the obsolete helper after its behavior moved into the engine.
legacy = ROOT / 'assets/js/stellar-intro-input.js'
if legacy.exists():
    legacy.unlink()
    print('removed obsolete stellar intro helper')

print('all patches applied')
