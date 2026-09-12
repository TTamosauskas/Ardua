/* Ardua — P2.2 unified semantic feedback language without changing gameplay eligibility. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),board=$('starBoard'),ambient=$('ambientBanner'),discovery=$('discoveryUnlockModal');
if(!board)return;
const PIECES='.atom,.primordial-particle,.cosmic-ray,.neutron,.quark-piece,.quarks-baryon';
const PROFILES=Object.freeze({
 selection:Object.freeze({level:1,duration:180,audioOwner:'engine-native',cue:null}),
 reaction:Object.freeze({level:2,duration:300,audioOwner:'engine-adaptive',cue:null}),
 chain:Object.freeze({level:3,duration:520,audioOwner:'engine-adaptive',cue:null}),
 discovery:Object.freeze({level:4,duration:720,audioOwner:'audio-polish',cue:'discovery'}),
 milestone:Object.freeze({level:5,duration:840,audioOwner:'audio-polish',cue:'milestone'}),
 victory:Object.freeze({level:6,duration:2200,audioOwner:'victory-fanfare',cue:null})
});
let serial=0,visualSerial=0,visualTimer=0,activeVisual={kind:'',level:0,until:0,serial:0},victoryUntil=0,lastAmbientKey='',lastDiscoveryKey='',reactionActive=false;
const dedupe=new Map(),selectionBefore=new WeakMap();

let pulse=board.querySelector('.feedback-language-pulse');
if(!pulse){pulse=document.createElement('div');pulse.className='feedback-language-pulse';pulse.setAttribute('aria-hidden','true');board.appendChild(pulse)}

function phaseId(){return document.documentElement.dataset.arduaEnginePhase||window.ARDUA_CAMPAIGN?.getState?.().activeId||''}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true}
function profile(kind){return PROFILES[kind]||null}
function dedupeKey(kind,detail){return`${kind}|${detail.key||detail.title||detail.step||detail.tier||''}`}
function shouldDedupe(kind,detail,at){
 const key=dedupeKey(kind,detail),last=dedupe.get(key)||0,windowMs=kind==='victory'?1900:kind==='selection'?70:150;
 if(at-last<windowMs)return true;dedupe.set(key,at);return false;
}
function audioBlocked(){return performance.now()<victoryUntil||!!window.ARDUA_VICTORY_REWARD?.active||!!window.ARDUA_VICTORY_REWARD?.pending}
function clearSurfaceMarks(){
 discovery?.removeAttribute('data-ardua-feedback-language');ambient?.removeAttribute('data-ardua-feedback-language');$('campaignVictoryReward')?.removeAttribute('data-ardua-feedback-language');
}
function clearVisual(expected=0){
 if(expected&&activeVisual.serial!==expected)return;
 clearTimeout(visualTimer);visualTimer=0;activeVisual={kind:'',level:0,until:0,serial:0};
 delete document.documentElement.dataset.arduaFeedbackKind;delete document.documentElement.dataset.arduaFeedbackLevel;
 board.removeAttribute('data-ardua-feedback-language');pulse.classList.remove('run');pulse.removeAttribute('data-kind');pulse.removeAttribute('data-variant');clearSurfaceMarks();
}
function pulsePosition(detail={}){
 if(Number.isFinite(detail.xPct)&&Number.isFinite(detail.yPct))return{x:detail.xPct,y:detail.yPct};
 return{x:50,y:50};
}
function applyVisual(payload,p){
 const now=performance.now();if(activeVisual.until>now&&payload.level<activeVisual.level)return false;
 clearTimeout(visualTimer);clearSurfaceMarks();const token=++visualSerial,until=now+(reducedMotion()?Math.min(220,p.duration):p.duration);activeVisual={kind:payload.kind,level:payload.level,until,serial:token};
 document.documentElement.dataset.arduaFeedbackKind=payload.kind;document.documentElement.dataset.arduaFeedbackLevel=String(payload.level);board.dataset.arduaFeedbackLanguage=payload.kind;
 if(['selection','reaction','chain'].includes(payload.kind)){
  const pos=pulsePosition(payload);pulse.style.setProperty('--feedback-x',`${Math.max(0,Math.min(100,pos.x))}%`);pulse.style.setProperty('--feedback-y',`${Math.max(0,Math.min(100,pos.y))}%`);pulse.dataset.kind=payload.kind;pulse.dataset.variant=payload.tier||'';pulse.classList.remove('run');void pulse.offsetWidth;pulse.classList.add('run');
 }
 if(payload.kind==='discovery')discovery?.setAttribute('data-ardua-feedback-language','discovery');
 if(payload.kind==='milestone')ambient?.setAttribute('data-ardua-feedback-language','milestone');
 if(payload.kind==='victory')$('campaignVictoryReward')?.setAttribute('data-ardua-feedback-language','victory');
 visualTimer=setTimeout(()=>clearVisual(token),Math.max(80,until-performance.now()));return true;
}
function signal(kind,detail={}){
 const p=profile(kind);if(!p)return false;const at=performance.now();if(!detail.force&&shouldDedupe(kind,detail,at))return false;
 if(kind==='victory')victoryUntil=Math.max(victoryUntil,at+(Number(detail.durationMs)||p.duration));
 let audioPlayed=false;const requestedAudio=detail.audio!==false&&!!p.cue&&!audioBlocked();
 if(requestedAudio)audioPlayed=!!window.ARDUA_AUDIO_POLISH?.playFeedbackCue?.(p.cue,{strength:detail.strength||1,source:detail.source||kind});
 const payload=Object.freeze({kind,level:p.level,tier:detail.tier||'',phaseId:detail.phaseId||phaseId(),source:detail.source||'feedback-language',title:detail.title||'',step:Number(detail.step)||0,audioOwner:detail.audioOwner||p.audioOwner,audioPlayed,hapticOwner:detail.hapticOwner||'existing-owner',at,serial:++serial,xPct:detail.xPct,yPct:detail.yPct});
 applyVisual(payload,p);window.dispatchEvent(new CustomEvent('ardua:feedback-language',{detail:payload}));return payload;
}
function centerOf(el){
 const a=el?.getBoundingClientRect(),b=board.getBoundingClientRect();if(!a||!b.width||!b.height)return{xPct:50,yPct:50};return{xPct:((a.left+a.width/2-b.left)/b.width)*100,yPct:((a.top+a.height/2-b.top)/b.height)*100};
}

document.addEventListener('pointerdown',e=>{const el=e.target instanceof Element?e.target.closest(PIECES):null;if(el&&board.contains(el))selectionBefore.set(el,el.classList.contains('selected'))},{capture:true,passive:true});
document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target.closest(PIECES):null;if(!el||!board.contains(el))return;const was=selectionBefore.get(el)===true;setTimeout(()=>{if(!el.isConnected||was)return;if(el.classList.contains('selected')||el.classList.contains('candidate'))signal('selection',{...centerOf(el),source:'piece-selection',key:el.dataset.id||el.textContent?.trim()||'piece',audio:false})},0);
},true);

new MutationObserver(()=>{
 const active=board.classList.contains('reaction-reward')||board.classList.contains('reaction-reward-strong');if(active&&!reactionActive)signal('reaction',{source:'engine-reaction',key:String(serial+1),strength:board.classList.contains('reaction-reward-strong')?2:1,audio:false});reactionActive=active;
}).observe(board,{attributes:true,attributeFilter:['class']});

window.addEventListener('ardua:reaction-chain',e=>{
 const d=e.detail||{};signal('chain',{source:'reaction-chain',key:`${d.phaseId||phaseId()}:${d.step||0}`,phaseId:d.phaseId||'',step:d.step||0,tier:d.tier||'',audio:false,audioOwner:'engine-adaptive'});
});

function syncDiscovery(){
 if(!discovery?.classList.contains('show')||discovery.getAttribute('aria-hidden')==='true'){lastDiscoveryKey='';return}
 const title=$('discoveryUnlockTitle')?.textContent?.trim()||'Descoberta',key=title;if(key===lastDiscoveryKey)return;lastDiscoveryKey=key;
 signal('discovery',{source:'discovery-modal',key,title,audio:!audioBlocked()});
}
if(discovery)new MutationObserver(syncDiscovery).observe(discovery,{attributes:true,attributeFilter:['class','aria-hidden'],childList:true,subtree:true});

function syncAmbient(){
 if(!ambient?.classList.contains('show')){lastAmbientKey='';return}
 if(ambient.classList.contains('discovery')||ambient.classList.contains('completion'))return;
 const title=$('ambientTitle')?.textContent?.trim()||'',kicker=$('ambientKicker')?.textContent?.trim().toUpperCase()||'',signature=ambient.classList.contains('signature');
 if(!signature&&kicker!=='MARCO'&&!ambient.classList.contains('micro'))return;
 const key=`${signature?'signature':'milestone'}:${title}`;if(key===lastAmbientKey)return;lastAmbientKey=key;
 signal('milestone',{source:signature?'scientific-signature':'ambient-milestone',key,title,audio:!signature&&!audioBlocked(),audioOwner:signature?'engine-adaptive':'audio-polish'});
}
if(ambient)new MutationObserver(syncAmbient).observe(ambient,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});

window.addEventListener('ardua:victory-fanfare',e=>signal('victory',{source:'victory-fanfare',key:'phase-victory',durationMs:e.detail?.durationMs||2200,audio:false,audioOwner:'victory-fanfare'}));
window.addEventListener('ardua:victory-reward-feedback',()=>{$('campaignVictoryReward')?.setAttribute('data-ardua-feedback-language','victory')});
window.addEventListener('ardua:engine-phase',()=>{lastAmbientKey='';lastDiscoveryKey='';reactionActive=false;if(activeVisual.level<4)clearVisual()});

window.ARDUA_FEEDBACK_LANGUAGE=Object.freeze({signal,profile,state:()=>({serial,active:{...activeVisual},victoryUntil}),profiles:PROFILES});
syncDiscovery();syncAmbient();
})();
