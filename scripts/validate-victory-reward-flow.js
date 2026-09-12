const fs=require('fs');
const fail=m=>{throw new Error(m)};
const reward=fs.readFileSync('assets/js/campaign-victory-reward.js','utf8');
const intent=fs.readFileSync('assets/js/campaign-victory-intent.js','utf8');
const forkLinks=fs.readFileSync('assets/js/campaign-fork-links.js','utf8');
const css=fs.readFileSync('assets/css/campaign-victory-reward.css','utf8');
const completion=fs.readFileSync('assets/js/campaign-phase-completion.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const token of ["ardua:phase-completion-intent","ardua:victory-reward-state","function nextOptions(id)","function routeFor(snapshot)","kind:'continue'","kind:'choose'","wasCompleted","function suppressMap()","function suppressDiscoveryModal()","function handoffNext(current)","function handoffMap(current)","function openMapSurface()","campaignPhasePreview","data-phase-preview-launch","victory-revisit-return","window.ARDUA_VICTORY_REWARD=Object.freeze"]){if(!reward.includes(token))fail('Victory reward contract missing: '+token)}
for(const token of ["const HERO_MOMENTS=Object.freeze","first_generation_formation:{headline:'A primeira estrela nasceu'","he_red:{headline:'Hélio-4 se acumulou no núcleo'","function resultCopy(snapshot)","function rewardFeedback(snapshot)","ardua:victory-reward-feedback","audioOwner:'victory-fanfare'","navigator.vibrate","function transitionOut(current)","classList.add('leaving')","has-discovery","data-victory-consequence","resultCopy,"]){if(!reward.includes(token))fail('P1.5 reward polish missing: '+token)}
for(const token of ["new CustomEvent('ardua:phase-completion-intent'","reward.pending||reward.active","closest('#phaseEndBtn')"]){if(!intent.includes(token))fail('Completion intent bridge missing: '+token)}
for(const token of ["$('phaseQuickMap')?.addEventListener('click'","window.ARDUA_VICTORY_REWARD","reward?.openMap","closeQuickMenu(false)"]){if(!forkLinks.includes(token))fail('Phase menu Map bridge missing: '+token)}
if(forkLinks.includes("$('phaseQuickMap')?.addEventListener('click',()=>{closeQuickMenu(false);trigger.click()})"))fail('Phase menu Map must not depend on the legacy trigger click');
for(const token of ["registerAdapter('quarks'","registerAdapter('quasar'","registerAdapter('objective-fallback'"]){if(!completion.includes(token))fail('P1.5 must preserve the P0 completion adapters: '+token)}
for(const token of ['.campaign-victory-reward.show','.campaign-victory-reward.heroic','.campaign-victory-reward.leaving','.victory-reward-consequence','.victory-reward-discovery::before','@keyframes victoryRewardRing','@keyframes victoryRewardGlow','[data-tone="stellar"]','prefers-reduced-motion'])if(!css.includes(token))fail('P1.5 victory reward CSS missing: '+token);
if(!index.includes('campaign-victory-reward.css?v=20260912-p1-5-1'))fail('P1.5 victory reward CSS is not cache-busted in index');
if(!index.includes('campaign-victory-intent.js?v=20260911-p1-1'))fail('Victory intent bridge cache-bust unexpectedly changed');
const NAV_VERSION='20260912-map-nav-2';
for(const asset of ['campaign-map.js','campaign-fork-links.js','campaign-victory-reward.js','campaign-phase-modal.js']){
 if(!index.includes(`${asset}?v=${NAV_VERSION}`))fail(`Map navigation asset must share cache version ${NAV_VERSION}: ${asset}`);
 if(index.includes(`<script src="assets/js/${asset}"></script>`))fail(`Unversioned Map navigation asset can create a mixed stale navigation session: ${asset}`);
}
const rewardPos=index.indexOf('assets/js/campaign-victory-reward.js'),intentPos=index.indexOf('assets/js/campaign-victory-intent.js'),completionPos=index.indexOf('assets/js/campaign-phase-completion.js'),modalPos=index.indexOf('assets/js/campaign-phase-modal.js');
if(rewardPos<0||intentPos<0||completionPos<0||modalPos<0||rewardPos>intentPos||intentPos>completionPos||completionPos>modalPos)fail('P1.5 reward + intent bridge must listen before P0 completion and reuse the later canonical phase preview launcher');
console.log('P1.5 victory reward contract OK: P0 remains canonical; the Map navigation bundle is coherent and cache-busted; scientific hero copy, discovery hierarchy, cosmic visual tones, subtle haptics and handoff transition remain layered only on the reward interstitial.');
