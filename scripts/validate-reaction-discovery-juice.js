const fs=require('fs');
const fail=m=>{throw new Error(m)};
const js=fs.readFileSync('assets/js/reaction-discovery-juice.js','utf8');
const css=fs.readFileSync('assets/css/reaction-discovery-juice.css','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const token of ["window.addEventListener('ardua:feedback-language'","spawnResolve","collectionFor","ADICIONADO A ELEMENTOS","ADICIONADO AO ATLAS","ardua:p23-juice","audioOwner:'existing'","scienceChanged:false","window.ARDUA_REACTION_DISCOVERY_JUICE=Object.freeze"]){if(!js.includes(token))fail('P2.3 reaction/discovery contract missing: '+token)}
for(const forbidden of ['new AudioContext','new webkitAudioContext','createOscillator(','markCompleted(','setActive(','ARDUA_RECIPE_AUDIO_SYNC','playFeedbackCue(','navigator.vibrate'])if(js.includes(forbidden))fail('P2.3 presentation layer must not own audio/science/progression: '+forbidden);
for(const token of ['.p23-reaction-resolve','[data-kind="chain"]','.p23-collection-mark','.p23-collection-meta','.p23-collection-arrival','.p23-reaction-handoff','@media(prefers-reduced-motion:reduce)'])if(!css.includes(token))fail('P2.3 CSS contract missing: '+token);
if(!index.includes('reaction-discovery-juice.css?v=20260912-p2-3-1'))fail('P2.3 CSS is not cache-busted in index');
if(!index.includes('reaction-discovery-juice.js?v=20260912-p2-3-1'))fail('P2.3 JS is not cache-busted in index');
const feedback=index.indexOf('assets/js/feedback-language.js'),juice=index.indexOf('assets/js/reaction-discovery-juice.js');
if(feedback<0||juice<0||juice<feedback)fail('P2.3 must load after the P2.2 semantic feedback language');
console.log('P2.3 reaction/discovery juice contract OK: causal resolve visuals and collection arrivals are presentation-only and reuse P2.2 ownership.');
