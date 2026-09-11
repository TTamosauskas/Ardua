/* Ardua — capture the player's first final-action intent before the P0 completion contract handles it. */
(()=>{
'use strict';
document.addEventListener('click',e=>{
 const button=e.target instanceof Element?e.target.closest('#phaseEndBtn'):null;if(!button)return;
 const reward=window.ARDUA_VICTORY_REWARD;if(!reward||reward.pending||reward.active)return;
 const C=window.ARDUA_CAMPAIGN,phaseId=window.ARDUA_QUARKS?.isActive?.()?'quarks':(C?.getState?.().activeId||document.documentElement.dataset.arduaEnginePhase||'');
 if(!phaseId)return;
 const visible=button.classList.contains('show')||(!button.hidden&&button.style.display!=='none');if(!visible)return;
 window.dispatchEvent(new CustomEvent('ardua:phase-completion-intent',{detail:{phaseId,source:'player-final-action',at:performance.now()}}));
},true);
})();
