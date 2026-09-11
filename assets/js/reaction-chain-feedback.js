/* Ardua — public UX bridge for the engine's existing causal reaction chains. */
(()=>{
'use strict';
const fx=document.getElementById('fx'),board=document.getElementById('starBoard');
if(!fx||!board)return;
let lastSignature='',clearTimer=0;
const live=document.createElement('div');live.className='chain-feedback-live';live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');board.appendChild(live);
function phaseId(){return document.documentElement.dataset.arduaEnginePhase||window.ARDUA_CAMPAIGN?.getState?.().activeId||''}
function tierFor(step){return step>=8?'cosmic':step>=5?'major':step>=3?'strong':'chain'}
function clearBoard(){board.classList.remove('chain-feedback-active');delete board.dataset.chainTier;lastSignature=''}
function sync(){
 const callout=fx.querySelector('.chain-callout.visible');
 if(!callout){if(clearTimer)clearTimeout(clearTimer);clearTimer=setTimeout(clearBoard,80);return}
 const raw=callout.querySelector('strong')?.textContent||'',step=Math.max(2,Number(raw.replace(/\D/g,''))||2),title=(callout.querySelector('small')?.textContent||'CADEIA').trim(),tier=tierFor(step),signature=`${title}|${step}`;
 callout.dataset.chainStep=String(step);callout.dataset.chainTier=tier;board.dataset.chainTier=tier;board.classList.add('chain-feedback-active');
 if(clearTimer){clearTimeout(clearTimer);clearTimer=0}
 if(signature===lastSignature)return;lastSignature=signature;live.textContent=`${title}. Cadeia ${step}.`;
 window.dispatchEvent(new CustomEvent('ardua:reaction-chain',{detail:{phaseId:phaseId(),step,title,tier,automatic:true,at:performance.now()}}));
}
new MutationObserver(records=>{
 if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'&&String(r.oldValue||'').includes('visible')&&!String(r.target.className||'').includes('visible')))lastSignature='';
 sync();
}).observe(fx,{childList:true,subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
window.addEventListener('ardua:engine-phase',()=>{clearBoard();live.textContent=''});
sync();
window.ARDUA_CHAIN_FEEDBACK=Object.freeze({sync,tierFor});
})();
