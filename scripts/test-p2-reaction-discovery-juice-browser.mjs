import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 localStorage.setItem('arduaCampaignGraphV1',JSON.stringify({version:14,introduced:true,activeId:'c',completed:['bigbang','quarks','first_generation_formation'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}));
 localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseId:'c',phaseIndex:0,version:'10.80',discovered:['H','He','C'],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}));
 localStorage.setItem('arduaRotationEnabledV2','0');sessionStorage.setItem('__arduaE2ESeeded','1');window.__p23=[];window.addEventListener('ardua:p23-juice',e=>window.__p23.push({...e.detail}));
});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ARDUA_REACTION_DISCOVERY_JUICE&&window.ARDUA_FEEDBACK_LANGUAGE&&window.ARDUA_VICTORY_REWARD&&document.querySelectorAll('#catalog .el-card').length>10);
 await page.evaluate(()=>{
  for(const id of ['stellarIntro','campaignPhasePreview','menuModal','discoveryUnlockModal','phaseQuickMenu','campaignVictoryReward']){const el=document.getElementById(id);el?.classList.remove('show');el?.setAttribute('aria-hidden','true')}
  const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open');window.ARDUA_SURFACE_COORDINATOR?.sync?.();
 });

 await page.evaluate(()=>window.ARDUA_FEEDBACK_LANGUAGE.signal('reaction',{source:'p2.3-test',key:'reaction',audio:false,force:true,xPct:31,yPct:44}));
 await page.waitForSelector('.p23-reaction-resolve[data-kind="reaction"]');
 const reaction=await page.locator('.p23-reaction-resolve[data-kind="reaction"]').evaluate(el=>({left:el.style.left,top:el.style.top,pointer:getComputedStyle(el).pointerEvents}));
 assert.equal(reaction.left,'31%');assert.equal(reaction.top,'44%');assert.equal(reaction.pointer,'none','reaction resolve must never steal touch input');

 await page.evaluate(()=>window.ARDUA_FEEDBACK_LANGUAGE.signal('chain',{source:'p2.3-test',key:'chain8',audio:false,force:true,xPct:63,yPct:38,step:8,tier:'cosmic'}));
 await page.waitForSelector('.p23-reaction-resolve[data-kind="chain"][data-tier="cosmic"]');
 const chainSize=await page.locator('.p23-reaction-resolve[data-kind="chain"][data-tier="cosmic"]').evaluate(el=>parseFloat(getComputedStyle(el).width));
 assert.ok(chainSize>=150,`cosmic chain resolve is not visibly stronger: ${chainSize}px`);

 await page.evaluate(()=>{const host=document.getElementById('discoveryUnlockModal'),title=document.getElementById('discoveryUnlockTitle');if(title)title.textContent='CARBONO DESCOBERTO';host?.classList.add('show');host?.setAttribute('aria-hidden','false')});
 await page.waitForFunction(()=>document.getElementById('discoveryUnlockModal')?.dataset.p23Collection==='elements');
 let collection=await page.evaluate(()=>({meta:document.querySelector('#discoveryUnlockModal .p23-collection-meta')?.textContent,mark:document.querySelector('#discoveryUnlockModal .p23-collection-mark')?.textContent}));
 assert.equal(collection.meta,'ADICIONADO A ELEMENTOS');assert.equal(collection.mark,'C');

 await page.evaluate(()=>{const host=document.getElementById('discoveryUnlockModal'),title=document.getElementById('discoveryUnlockTitle');host?.classList.remove('show');host?.setAttribute('aria-hidden','true');if(title)title.textContent='SUPERNOVA DESCOBERTA';void host?.offsetWidth;host?.classList.add('show');host?.setAttribute('aria-hidden','false')});
 await page.waitForFunction(()=>document.getElementById('discoveryUnlockModal')?.dataset.p23Collection==='atlas');
 collection=await page.evaluate(()=>({meta:document.querySelector('#discoveryUnlockModal .p23-collection-meta')?.textContent,mark:document.querySelector('#discoveryUnlockModal .p23-collection-mark')?.textContent}));
 assert.equal(collection.meta,'ADICIONADO AO ATLAS');assert.equal(collection.mark,'✦');

 await page.evaluate(()=>{const host=document.getElementById('discoveryUnlockModal');host?.classList.remove('show');host?.setAttribute('aria-hidden','true');window.ARDUA_SURFACE_COORDINATOR?.sync?.();window.ARDUA_VICTORY_REWARD.present({phaseId:'c',goal:'Forme Carbono — 1/1',name:'Carbono',wasCompleted:true,discoveries:['CARBONO DESCOBERTO']})});
 await page.waitForFunction(()=>document.getElementById('campaignVictoryReward')?.classList.contains('show')&&document.getElementById('campaignVictoryReward')?.dataset.p23Collection==='elements');
 const reward=await page.evaluate(()=>{const host=document.getElementById('campaignVictoryReward'),box=host.querySelector('[data-victory-discovery]'),r=box.getBoundingClientRect();return{meta:box.querySelector('.p23-collection-meta')?.textContent,mark:box.querySelector('.p23-collection-mark')?.textContent,title:box.querySelector('strong')?.textContent,handoff:host.classList.contains('p23-reaction-handoff'),inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,discoveryModal:document.getElementById('discoveryUnlockModal')?.classList.contains('show')}});
 assert.equal(reward.meta,'ADICIONADO A ELEMENTOS');assert.equal(reward.mark,'C');assert.equal(reward.title,'Carbono');assert.equal(reward.handoff,true);assert.equal(reward.inside,true,'collection arrival left the mobile viewport');assert.equal(reward.discoveryModal,false,'reward collection arrival stacked with the discovery modal');

 const events=await page.evaluate(()=>window.__p23);
 for(const kind of ['reaction','chain','discovery','reward-collection'])assert.ok(events.some(x=>x.kind===kind),`missing P2.3 event ${kind}`);
 assert.ok(events.every(x=>x.audioOwner==='existing'&&x.scienceChanged===false),'P2.3 claimed audio/science ownership');
 assert.deepEqual(errors,[],`unexpected browser errors: ${errors.join(' | ')}`);
 console.log('P2.3 browser E2E OK: reaction resolve, cosmic chain escalation, Atlas/Elements collection arrivals, reward continuity and mobile no-stack passed.');
}finally{await context.close();await browser.close()}
