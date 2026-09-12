const fs=require('fs');
const fail=m=>{throw new Error(m)};
const director=fs.readFileSync('assets/js/feedback-language.js','utf8');
const audio=fs.readFileSync('assets/js/audio-polish.js','utf8');
const css=fs.readFileSync('assets/css/feedback-language.css','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const token of [
 "selection:Object.freeze({level:1","reaction:Object.freeze({level:2","chain:Object.freeze({level:3",
 "discovery:Object.freeze({level:4","milestone:Object.freeze({level:5","victory:Object.freeze({level:6",
 "new CustomEvent('ardua:feedback-language'","ardua:reaction-chain","ardua:victory-fanfare",
 "ARDUA_AUDIO_POLISH?.playFeedbackCue","audioBlocked()","window.ARDUA_FEEDBACK_LANGUAGE=Object.freeze"
])if(!director.includes(token))fail('P2.2 feedback director missing: '+token);

for(const forbidden of ['new AudioContext','new webkitAudioContext','playVictoryFanfare?.(','AdaptiveAudio.reaction','adaptiveAudioReaction']){
 if(director.includes(forbidden))fail('P2.2 director must not create or steal an existing audio owner: '+forbidden);
}

for(const token of [
 "function playFeedbackCue(kind='discovery'","['discovery','milestone'].includes(cue)","lastAudioContext",
 "__arduaFeedbackVoice","ardua:feedback-audio-cue","feedbackOwner:'audio-polish'","feedbackContextReady:()=>!!lastAudioContext"
])if(!audio.includes(token))fail('P2.2 audio bridge missing: '+token);
if(/new\s+(?:window\.)?(?:AudioContext|webkitAudioContext)\s*\(/.test(audio))fail('audio-polish must reuse an existing AudioContext instead of creating another one');

for(const token of ['.feedback-language-pulse','data-kind="selection"','data-kind="reaction"','data-kind="chain"','data-ardua-feedback-language="discovery"','data-ardua-feedback-language="milestone"','data-ardua-feedback-language="victory"','@media(prefers-reduced-motion:reduce)']){
 if(!css.includes(token))fail('P2.2 feedback visual grammar missing: '+token);
}

if(!index.includes('assets/css/feedback-language.css?v=20260912-p2-2-1'))fail('P2.2 feedback CSS missing or not cache-busted');
if(!index.includes('assets/js/audio-polish.js?v=20260912-p2-2-1'))fail('P2.2 audio bridge missing or not cache-busted');
if(!index.includes('assets/js/feedback-language.js?v=20260912-p2-2-1'))fail('P2.2 feedback director missing or not cache-busted');
const chainPos=index.indexOf('assets/js/reaction-chain-feedback.js'),rewardPos=index.indexOf('assets/js/campaign-victory-reward.js'),completionPos=index.indexOf('assets/js/campaign-phase-completion.js'),surfacePos=index.indexOf('assets/js/mobile-surface-coordinator.js'),directorPos=index.indexOf('assets/js/feedback-language.js');
if([chainPos,rewardPos,completionPos,surfacePos,directorPos].some(x=>x<0)||directorPos<chainPos||directorPos<rewardPos||directorPos<completionPos||directorPos<surfacePos)fail('P2.2 director must observe the existing chain, reward, P0 and surface owners rather than replacing them');

console.log('P2.2 feedback contract OK: one semantic ladder from selection to victory, existing reaction/recipe/victory owners preserved, and only discovery/milestone gaps use the reused audio-polish context.');
