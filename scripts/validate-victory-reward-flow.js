const fs=require('fs');
const fail=m=>{throw new Error(m)};
const reward=fs.readFileSync('assets/js/campaign-victory-reward.js','utf8');
const intent=fs.readFileSync('assets/js/campaign-victory-intent.js','utf8');
const css=fs.readFileSync('assets/css/campaign-victory-reward.css','utf8');
const completion=fs.readFileSync('assets/js/campaign-phase-completion.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const token of ["ardua:phase-completion-intent","ardua:victory-reward-state","function nextOptions(id)","function routeFor(snapshot)","kind:'continue'","kind:'choose'","wasCompleted","function suppressMap()","function suppressDiscoveryModal()","function handoffNext(current)","function handoffMap(current)","campaignPhasePreview","data-phase-preview-launch","victory-revisit-return","window.ARDUA_VICTORY_REWARD=Object.freeze"]){if(!reward.includes(token))fail('Victory reward contract missing: '+token)}
for(const token of ["new CustomEvent('ardua:phase-completion-intent'","reward.pending||reward.active","closest('#phaseEndBtn')"]){if(!intent.includes(token))fail('Completion intent bridge missing: '+token)}
for(const token of ["registerAdapter('quarks'","registerAdapter('quasar'","registerAdapter('objective-fallback'"]){if(!completion.includes(token))fail('P1 must preserve the P0 completion adapters: '+token)}
for(const token of ['.campaign-victory-reward.show','.victory-reward-actions','.victory-reward-primary','prefers-reduced-motion'])if(!css.includes(token))fail('Victory reward CSS missing: '+token);
if(!index.includes('campaign-victory-reward.css?v=20260911-p1-1'))fail('Victory reward CSS is not cache-busted in index');
if(!index.includes('campaign-victory-reward.js?v=20260911-p1-1'))fail('Victory reward JS is not cache-busted in index');
if(!index.includes('campaign-victory-intent.js?v=20260911-p1-1'))fail('Victory intent bridge is not cache-busted in index');
const rewardPos=index.indexOf('assets/js/campaign-victory-reward.js'),intentPos=index.indexOf('assets/js/campaign-victory-intent.js'),completionPos=index.indexOf('assets/js/campaign-phase-completion.js'),modalPos=index.indexOf('assets/js/campaign-phase-modal.js');
if(rewardPos<0||intentPos<0||completionPos<0||modalPos<0||rewardPos>intentPos||intentPos>completionPos||completionPos>modalPos)fail('P1 reward + intent bridge must listen before P0 completion and reuse the later canonical phase preview launcher');
console.log('P1 victory reward contract OK: P0 save/completion stays canonical, reward owns the interstitial, branches defer to the map and unique next phases reuse the canonical launcher.');
