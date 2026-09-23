import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});

function campaignState(activeId){return{version:14,introduced:true,activeId,completed:['bigbang'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}}
function engineState(phaseId){return{phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}}

async function openPhase(activeId){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(({campaign,engine})=>{
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2','0');
 },{campaign:campaignState(activeId),engine:engineState(activeId)});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(id=>document.documentElement.dataset.arduaEnginePhase===id,activeId,{timeout:5000});
 await page.waitForTimeout(420);
 if(await page.locator('#stellarIntro').evaluate(el=>el.classList.contains('show'))){
  await page.locator('#stellarStartBtn').click();
  await page.waitForFunction(()=>!document.getElementById('stellarIntro')?.classList.contains('show'),undefined,{timeout:2500});
 }
 await page.evaluate(()=>{const map=document.getElementById('campaignMap');map?.classList.remove('show');map?.setAttribute('aria-hidden','true');document.body.classList.remove('campaign-map-open')});
 return{context,page,errors};
}

async function testPrimordialParticleDrop(){
 const {context,page,errors}=await openPhase('primordial_d');
 try{
  await page.waitForFunction(()=>document.querySelector('.primordial-particle.proton')&&document.querySelector('.primordial-particle.neutronfree'),undefined,{timeout:3000});
  const proton=page.locator('.primordial-particle.proton').first(),neutron=page.locator('.primordial-particle.neutronfree').first();
  const pb=await proton.boundingBox(),nb=await neutron.boundingBox();assert.ok(pb&&nb,'Deutério: partículas iniciais não possuem geometria');
  await page.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2);
  await page.mouse.down();
  const nb2=await neutron.boundingBox();assert.ok(nb2,'Deutério: nêutron desapareceu antes do drop');
  await page.mouse.move(pb.x+pb.width/2+10,pb.y+pb.height/2,{steps:2});
  await page.waitForFunction(()=>!!document.querySelector('.primordial-particle.proton.dragging'),undefined,{timeout:900});
  await page.mouse.move(nb2.x+nb2.width/2,nb2.y+nb2.height/2,{steps:5});
  await page.waitForFunction(()=>!!document.querySelector('.primordial-particle.neutronfree.drop-target'),undefined,{timeout:1200});
  await page.mouse.up();
  await page.waitForFunction(()=>[...document.querySelectorAll('#pieces .atom .sym')].some(el=>el.textContent?.trim()==='²H'),undefined,{timeout:5000});
  assert.deepEqual(errors,[],`Deutério drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarFormationDrag(){
 const {context,page,errors}=await openPhase('first_generation_formation');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('.stellar-formation-layer .formation-g-field').length===4&&document.querySelectorAll('.stellar-formation-layer .formation-atom').length===8,undefined,{timeout:3000});
  const ids=await page.evaluate(()=>[...document.querySelectorAll('.stellar-formation-layer .formation-g-field')].slice(0,2).map(el=>el.dataset.group));
  assert.equal(ids.length,2,'Formação: não há dois grupos iniciais para o teste');
  const source=page.locator(`.formation-atom[data-formation-group="${ids[0]}"]`).first(),target=page.locator(`.formation-g-field[data-group="${ids[1]}"]`);
  const sb=await source.boundingBox(),tb=await target.boundingBox();assert.ok(sb&&tb,'Formação: grupos iniciais não possuem geometria');
  assert.equal(await source.evaluate(el=>getComputedStyle(el).touchAction),'none','Formação: drag móvel deve reservar o gesto de ponteiro');
  await page.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);
  await page.mouse.down();
  await page.mouse.move(tb.x+tb.width/2,tb.y+tb.height/2,{steps:7});
  await page.waitForFunction(id=>document.querySelector(`.formation-g-field[data-group="${id}"]`)?.classList.contains('drag-target'),ids[1],{timeout:1500});
  await page.mouse.up();
  await page.waitForFunction(()=>document.querySelectorAll('.formation-atom.formation-cluster').length>=4,undefined,{timeout:1800});
  const state=await page.evaluate(()=>({
   clusterAtoms:document.querySelectorAll('.formation-atom.formation-cluster').length,
   dragging:document.querySelectorAll('.formation-atom.dragging').length,
   target:document.querySelectorAll('.formation-g-field.drag-target').length
  }));
  assert.ok(state.clusterAtoms>=4,'Formação: soltar um grupo compatível não criou aglomerado');
  assert.equal(state.dragging,0,'Formação: estado dragging permaneceu após pointerup');
  assert.equal(state.target,0,'Formação: destaque de alvo permaneceu após pointerup');
  assert.deepEqual(errors,[],`Formação drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

try{
 await testPrimordialParticleDrop();
 await testStellarFormationDrag();
 console.log('Drag interactions OK: primordial particle drop reacts and stellar groups merge by pointer drag.');
}finally{
 await browser.close();
}
