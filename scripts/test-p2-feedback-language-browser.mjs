import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const campaign={version:14,introduced:true,activeId:'primordial_d',completed:['bigbang','quarks'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}};
const engine={phaseId:'primordial_d',phaseIndex:0,version:'10.80',discovered:['H'],ignited:false,productLessons:[],rewardDiscoveries:['particle:quark','particle:proton','particle:neutron'],rewardAchievements:[],signatureSeen:[]};
await context.addInitScript(({campaign,engine})=>{
 localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
 localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
 localStorage.setItem('arduaRotationEnabledV2','0');
 sessionStorage.setItem('__arduaE2ESeeded','1');
},{campaign,engine});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});

try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_FEEDBACK_LANGUAGE&&window.ARDUA_AUDIO_POLISH&&window.ARDUA_RECIPE_AUDIO_SYNC&&window.ARDUA_SURFACE_COORDINATOR);
 await page.evaluate(()=>{
  for(const id of ['stellarIntro','campaignPhasePreview','menuModal','discoveryUnlockModal','phaseQuickMenu','campaignVictoryReward']){const el=document.getElementById(id);el?.classList.remove('show');el?.setAttribute('aria-hidden','true')}
  const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');
  const ambient=document.getElementById('ambientBanner');ambient?.classList.remove('show','micro','signature','discovery','completion');
  window.__p22={feedback:[],audio:[]};
  window.addEventListener('ardua:feedback-language',e=>window.__p22.feedback.push({...e.detail}));
  window.addEventListener('ardua:feedback-audio-cue',e=>window.__p22.audio.push({...e.detail}));
  /* The product must reuse an already-existing gameplay context. The test creates one
     only to exercise that bridge deterministically in headless Chromium. */
  const Ctx=window.AudioContext||window.webkitAudioContext;window.__p22Context=Ctx?new Ctx():null;window.__p22Context?.createGain();
  window.ARDUA_SURFACE_COORDINATOR.sync();
 });
 assert.equal(await page.evaluate(()=>window.ARDUA_AUDIO_POLISH.feedbackContextReady()),true,'P2.2 did not capture the existing AudioContext');

 const profiles=await page.evaluate(()=>Object.fromEntries(Object.entries(window.ARDUA_FEEDBACK_LANGUAGE.profiles).map(([k,v])=>[k,{level:v.level,audioOwner:v.audioOwner,cue:v.cue}])));
 assert.deepEqual(Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,v.level])),{selection:1,reaction:2,chain:3,discovery:4,milestone:5,victory:6},'semantic feedback ladder changed');
 assert.equal(profiles.chain.audioOwner,'engine-adaptive');
 assert.equal(profiles.victory.audioOwner,'victory-fanfare');

 await page.evaluate(()=>window.ARDUA_FEEDBACK_LANGUAGE.signal('selection',{source:'p2.2-test',key:'selection',audio:false,force:true,xPct:42,yPct:48}));
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='selection'));
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.arduaFeedbackKind),'selection','selection did not own the low feedback tier');

 await page.evaluate(()=>{const board=document.getElementById('starBoard');board.classList.add('reaction-reward-strong');setTimeout(()=>board.classList.remove('reaction-reward-strong'),80)});
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='reaction'));
 const reaction=await page.evaluate(()=>window.__p22.feedback.find(x=>x.kind==='reaction'));
 assert.equal(reaction.audioOwner,'engine-adaptive','reaction attempted to replace the engine audio owner');
 assert.equal(reaction.audioPlayed,false,'reaction produced a second semantic audio voice');

 const audioBeforeChain=await page.evaluate(()=>window.__p22.audio.length);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ardua:reaction-chain',{detail:{phaseId:'primordial_d',step:5,title:'CADEIA',tier:'major',automatic:true,at:performance.now()}})));
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='chain'&&x.step===5));
 const chain=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='chain'));
 assert.equal(chain.level,3);assert.equal(chain.tier,'major');assert.equal(chain.audioOwner,'engine-adaptive');
 assert.equal(await page.evaluate(()=>window.__p22.audio.length),audioBeforeChain,'chain added duplicate audio over the engine chain voice');

 await page.evaluate(()=>{
  const host=document.getElementById('discoveryUnlockModal'),title=document.getElementById('discoveryUnlockTitle');if(title)title.textContent='DEUTÉRIO DESCOBERTO';host?.classList.add('show');host?.setAttribute('aria-hidden','false');
 });
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='discovery'&&x.title.includes('DEUTÉRIO'))&&window.__p22.audio.some(x=>x.kind==='discovery'));
 const discovery=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='discovery'));
 assert.equal(discovery.audioOwner,'audio-polish');assert.equal(discovery.audioPlayed,true,'discovery gap did not use the reused audio context');
 assert.equal(await page.locator('#discoveryUnlockModal').getAttribute('data-ardua-feedback-language'),'discovery');

 await page.evaluate(()=>{const host=document.getElementById('discoveryUnlockModal');host?.classList.remove('show');host?.setAttribute('aria-hidden','true');window.ARDUA_SURFACE_COORDINATOR.sync()});
 const audioBeforeMilestone=await page.evaluate(()=>window.__p22.audio.length);
 await page.evaluate(()=>{
  const ambient=document.getElementById('ambientBanner'),k=document.getElementById('ambientKicker'),t=document.getElementById('ambientTitle');if(k)k.textContent='MARCO';if(t)t.textContent='CADEIA ESTELAR ESTÁVEL';ambient?.classList.remove('signature','discovery','completion');ambient?.classList.add('show','micro');
 });
 await page.waitForFunction(n=>window.__p22.feedback.some(x=>x.kind==='milestone'&&x.title==='CADEIA ESTELAR ESTÁVEL')&&window.__p22.audio.length>n,audioBeforeMilestone);
 const milestone=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='milestone'));
 assert.equal(milestone.audioOwner,'audio-polish');assert.equal(milestone.audioPlayed,true,'ordinary milestone did not fill the semantic audio gap');

 await page.evaluate(()=>{const ambient=document.getElementById('ambientBanner');ambient?.classList.remove('show','micro');});
 const audioBeforeSignature=await page.evaluate(()=>window.__p22.audio.length);
 await page.evaluate(()=>{
  const ambient=document.getElementById('ambientBanner'),k=document.getElementById('ambientKicker'),t=document.getElementById('ambientTitle');if(k)k.textContent='FENÔMENO';if(t)t.textContent='ASSINATURA CÓSMICA';ambient?.classList.add('show','signature');
 });
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='milestone'&&x.source==='scientific-signature'));
 const signature=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='milestone'));
 assert.equal(signature.audioOwner,'engine-adaptive','scientific signature did not preserve its native resolve owner');
 assert.equal(signature.audioPlayed,false);assert.equal(await page.evaluate(()=>window.__p22.audio.length),audioBeforeSignature,'scientific signature received duplicate milestone audio');

 await page.evaluate(()=>{const ambient=document.getElementById('ambientBanner');ambient?.classList.remove('show','signature');window.dispatchEvent(new CustomEvent('ardua:victory-fanfare',{detail:{startedAt:performance.now(),durationMs:1975,theme:'E'}}))});
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='victory'));
 const victory=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='victory'));
 assert.equal(victory.level,6);assert.equal(victory.audioOwner,'victory-fanfare');assert.equal(victory.audioPlayed,false,'victory semantic layer played a second fanfare');
 const audioAtVictory=await page.evaluate(()=>window.__p22.audio.length);
 await page.evaluate(()=>window.ARDUA_FEEDBACK_LANGUAGE.signal('selection',{source:'p2.2-priority',key:'after-victory',audio:false,force:true,xPct:50,yPct:50}));
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.arduaFeedbackKind),'victory','low-tier selection displaced active victory feedback');

 await page.evaluate(()=>{
  const host=document.getElementById('discoveryUnlockModal'),title=document.getElementById('discoveryUnlockTitle');host?.classList.remove('show');host?.setAttribute('aria-hidden','true');if(title)title.textContent='HÉLIO DESCOBERTO';void host?.offsetWidth;host?.classList.add('show');host?.setAttribute('aria-hidden','false');
 });
 await page.waitForFunction(()=>window.__p22.feedback.some(x=>x.kind==='discovery'&&x.title.includes('HÉLIO')));
 const blockedDiscovery=await page.evaluate(()=>window.__p22.feedback.findLast(x=>x.kind==='discovery'));
 assert.equal(blockedDiscovery.audioPlayed,false,'discovery stacked audio over the active victory fanfare window');
 assert.equal(await page.evaluate(()=>window.__p22.audio.length),audioAtVictory,'victory window allowed a competing semantic cue');

 const emittedKinds=await page.evaluate(()=>[...new Set(window.__p22.feedback.map(x=>x.kind))]);
 for(const kind of ['selection','reaction','chain','discovery','milestone','victory'])assert.ok(emittedKinds.includes(kind),`missing semantic feedback event: ${kind}`);
 assert.deepEqual(errors,[],`unexpected browser errors: ${errors.join(' | ')}`);
 console.log('P2.2 feedback language OK: semantic ladder, owner preservation, discovery/milestone gap cues, hierarchy and victory no-stack contract passed.');
}finally{
 await context.close();await browser.close();
}
