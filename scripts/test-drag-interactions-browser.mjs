import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});

function campaignState(activeId){return{version:14,introduced:true,activeId,completed:['bigbang'],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}}
function engineState(phaseId){return{phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}}

async function openPhase(activeId,{rotation=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(({campaign,engine,rotation})=>{
  localStorage.setItem('arduaCampaignGraphV1',JSON.stringify(campaign));
  localStorage.setItem('stellarForgeV1013',JSON.stringify(engine));
  localStorage.setItem('arduaRotationEnabledV2',rotation?'1':'0');
 },{campaign:campaignState(activeId),engine:engineState(activeId),rotation});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{const text=m.text();if(m.type()==='error'&&!text.includes('net::ERR_CACHE_RACE'))errors.push(text)});
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
  await page.waitForFunction(()=>!!document.querySelector('.primordial-particle.proton.dragging'),undefined,{timeout:3500});
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

async function stellarBoardGeometry(page,{fusion=false}={}){
 return page.evaluate(({fusion})=>{
  const atoms=[...document.querySelectorAll('#pieces .atom[data-cell]')].filter(el=>el.dataset.cell!=='');
  const cells=[...document.querySelectorAll('#cells .cell')];
  const center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}};
  const cellPoints=cells.map(el=>({el,cell:el.dataset.cell,...center(el)}));
  let step=Infinity;
  for(let i=0;i<cellPoints.length;i++)for(let j=i+1;j<cellPoints.length;j++){const d=Math.hypot(cellPoints[i].x-cellPoints[j].x,cellPoints[i].y-cellPoints[j].y);if(d>1&&d<step)step=d}
  if(fusion){
   const hs=atoms.filter(el=>el.querySelector('.sym')?.textContent?.trim()==='H');
   let best=null;
   for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
    const a=center(hs[i]),b=center(hs[j]),d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<=step*1.12&&(!best||d<best.dist))best={sourceId:hs[i].dataset.id,targetId:hs[j].dataset.id,sourceCell:hs[i].dataset.cell,targetCell:hs[j].dataset.cell,source:a,target:b,dist:d,step};
   }
   return best
  }
  const occupied=new Set(atoms.map(el=>el.dataset.cell)),preferred=[...atoms].sort((a,b)=>{
   const as=a.querySelector('.sym')?.textContent?.trim(),bs=b.querySelector('.sym')?.textContent?.trim();
   return (['H','He'].includes(as)?0:1)-(['H','He'].includes(bs)?0:1)
  }),board=document.getElementById('starBoard')?.getBoundingClientRect();
  let best=null,fallback=null;
  for(const atom of preferred){
   const a=center(atom);
   for(const cell of cellPoints){
    if(occupied.has(cell.cell))continue;
    const d=Math.hypot(a.x-cell.x,a.y-cell.y);if(d>step*1.12)continue;
    const overshoot={x:cell.x+(cell.x-a.x)*.86,y:cell.y+(cell.y-a.y)*.86};
    const candidate={sourceId:atom.dataset.id,sourceCell:atom.dataset.cell,targetCell:cell.cell,source:a,target:cell,overshoot,dist:d,step};
    if(!fallback||d<fallback.dist)fallback=candidate;
    const safe=board&&overshoot.x>board.left+28&&overshoot.x<board.right-28&&overshoot.y>board.top+28&&overshoot.y<board.bottom-28;
    if(safe&&(!best||d<best.dist))best=candidate;
   }
   if(best)break
  }
  return best||fallback
 },{fusion})
}

async function findStellarSwapPair(page){
 const pairs=await page.evaluate(()=>{
  const atoms=[...document.querySelectorAll('#pieces .atom[data-cell]')].filter(el=>el.dataset.cell!==''&&!el.classList.contains('unstable')&&!el.classList.contains('radioactive-proof')&&!el.classList.contains('beta-waiting'));
  const cells=[...document.querySelectorAll('#cells .cell')],center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const pts=cells.map(center);let step=Infinity;
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d>1&&d<step)step=d}
  const out=[];
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
   const a=center(atoms[i]),b=center(atoms[j]),d=Math.hypot(a.x-b.x,a.y-b.y);if(d>step*1.12)continue;
   const sa=atoms[i].querySelector('.sym')?.textContent?.trim()||'',sb=atoms[j].querySelector('.sym')?.textContent?.trim()||'';
   out.push({sourceId:atoms[i].dataset.id,targetId:atoms[j].dataset.id,sourceCell:atoms[i].dataset.cell,targetCell:atoms[j].dataset.cell,sourceSym:sa,targetSym:sb,diff:sa===sb?1:0,dist:d});
  }
  return out.sort((a,b)=>a.diff-b.diff||a.dist-b.dist).slice(0,60)
 });
 for(const pair of pairs){
  const source=page.locator(`#pieces .atom[data-id="${pair.sourceId}"]`),target=page.locator(`#pieces .atom[data-id="${pair.targetId}"]`);
  await source.click({force:true});await page.waitForTimeout(24);
  const state=await page.evaluate(({sourceId,targetId})=>({
   selected:document.querySelector(`#pieces .atom[data-id="${sourceId}"]`)?.classList.contains('selected')||false,
   candidate:document.querySelector(`#pieces .atom[data-id="${targetId}"]`)?.classList.contains('candidate')||false
  }),pair);
  if(state.selected&&!state.candidate){await source.click({force:true});await page.waitForTimeout(20);return pair}
  if(state.selected){await source.click({force:true});await page.waitForTimeout(20)}
 }
 return null
}

async function stellarCenterGeometry(page){
 return page.evaluate(()=>{
  const board=document.getElementById('starBoard'),br=board.getBoundingClientRect(),bx=br.left+br.width/2,by=br.top+br.height/2;
  const centerOf=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const cells=[...document.querySelectorAll('#cells .cell')].map(el=>({cell:el.dataset.cell,...centerOf(el)}));
  const center=cells.sort((a,b)=>Math.hypot(a.x-bx,a.y-by)-Math.hypot(b.x-bx,b.y-by))[0];
  let step=Infinity;
  for(const c of cells){const d=Math.hypot(c.x-center.x,c.y-center.y);if(d>1&&d<step)step=d}
  const atoms=[...document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])')].map(el=>({id:el.dataset.id,cell:el.dataset.cell,sym:el.querySelector('.sym')?.textContent?.trim()||'',...centerOf(el)}));
  const centerAtom=atoms.find(a=>a.cell===center.cell)||null;
  const adjacent=atoms.filter(a=>a.cell!==center.cell&&Math.hypot(a.x-center.x,a.y-center.y)<=step*1.14);
  return{center,centerAtom,adjacent,step,board:{x:bx,y:by}}
 })
}

async function testCentralFusionProductRelocation(){
 const {context,page,errors}=await openPhase('brown');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length===7,undefined,{timeout:4000});
  const g=await stellarCenterGeometry(page);assert.ok(g.centerAtom,'Anã marrom: núcleo central sem átomo para testar retirada do produto');
  assert.equal(g.centerAtom.sym,'²H','Anã marrom: Deutério inicial deveria ocupar o núcleo central');
  const partner=g.adjacent.find(a=>a.sym==='H');assert.ok(partner,'Anã marrom: Hidrogênio inicial deveria tocar o Deutério central');
  const beforeIds=await page.locator('#pieces .atom[data-id]').evaluateAll(els=>els.map(el=>Number(el.dataset.id)).filter(Number.isFinite));
  await page.mouse.move(g.centerAtom.x,g.centerAtom.y);await page.mouse.down();
  await page.mouse.move((g.centerAtom.x+partner.x)/2,(g.centerAtom.y+partner.y)/2,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.centerAtom.id,{timeout:1400});
  await page.mouse.move(partner.x,partner.y,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-drop-target'),partner.id,{timeout:1400});
  await page.mouse.up();

  let product=null;
  for(let i=0;i<28&&!product;i++){
   await page.waitForTimeout(220);
   const tooltip=page.locator('#eventTooltip');
   if(await tooltip.evaluate(el=>el.classList.contains('show')))await page.locator('#eventTooltipBtn').click({force:true});
   product=await page.evaluate(({beforeIds,centerCell})=>{
    const prior=new Set(beforeIds),fresh=[...document.querySelectorAll('#pieces .atom[data-id][data-cell]:not([data-cell=""])')]
      .filter(el=>!prior.has(Number(el.dataset.id))).sort((a,b)=>Number(a.dataset.id)-Number(b.dataset.id));
    for(const product of fresh){
     const sym=product.querySelector('.sym')?.textContent?.trim()||'';if(sym!=='³He'||product.dataset.cell===centerCell)continue;
     return{id:Number(product.dataset.id),cell:product.dataset.cell,sym};
    }
    return null;
   },{beforeIds,centerCell:g.center.cell});
  }
  if(!product){
   const snapshot=await page.evaluate(({beforeIds,centerCell})=>({
    centerCell,
    tooltip:document.getElementById('eventTooltip')?.classList.contains('show')||false,
    atoms:[...document.querySelectorAll('#pieces .atom[data-id]')].map(el=>({id:Number(el.dataset.id),cell:el.dataset.cell,sym:el.querySelector('.sym')?.textContent?.trim()||'',fresh:!beforeIds.includes(Number(el.dataset.id)),classes:el.className}))
   }),{beforeIds,centerCell:g.center.cell});
   console.log('CORE_RELOCATION_SNAPSHOT',JSON.stringify(snapshot));
  }
  assert.ok(product,'Anã marrom: Hélio-3 formado no núcleo permaneceu na célula central após concluir a reação');
  assert.equal(product.sym,'³He','Anã marrom: reação central deveria produzir Hélio-3');
  assert.notEqual(product.cell,g.center.cell,'Produto ³He permaneceu na célula central sob o controle ↕');
  assert.deepEqual(errors,[],`Retirada do produto central: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function atlasReactionGeometry(page){
 return page.evaluate(()=>{
  const atoms=[...document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])')],center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const hs=atoms.filter(el=>el.querySelector('.sym')?.textContent?.trim()==='H'),bes=atoms.filter(el=>el.querySelector('.sym')?.textContent?.trim()==='Be');
  let best=null;
  for(const h of hs)for(const be of bes){const a=center(h),b=center(be),d=Math.hypot(a.x-b.x,a.y-b.y);if(!best||d<best.dist)best={sourceId:h.dataset.id,targetId:be.dataset.id,sourceCell:h.dataset.cell,targetCell:be.dataset.cell,source:a,target:b,dist:d}}
  return best
 })
}

async function testAtlasFusionDragWithoutPreclick(){
 const {context,page,errors}=await openPhase('phase_atlas_h_be');
 try{
  await page.waitForFunction(()=>[...document.querySelectorAll('#pieces .atom .sym')].some(el=>el.textContent?.trim()==='Be'),undefined,{timeout:4000});
  const g=await atlasReactionGeometry(page);assert.ok(g,'Atlas H + Be: par inicial não encontrado');
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`);
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move((g.source.x+g.target.x)/2,(g.source.y+g.target.y)/2,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1200});
  await page.mouse.move(g.target.x,g.target.y,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-drop-target'),g.targetId,{timeout:1200});
  await page.mouse.up();
  await page.waitForFunction(()=>document.getElementById('eventTooltip')?.classList.contains('show'),undefined,{timeout:2500});
  assert.equal(await page.locator(`#pieces .atom[data-id="${g.sourceId}"]`).evaluate(el=>el.classList.contains('selected')),true,'Atlas H + Be: drag direto não entrou no fluxo da reação');
  await page.locator('#eventTooltipBtn').click({force:true});
  assert.deepEqual(errors,[],`Atlas H + Be drag direto: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testWhiteCompactFusionDrag(){
 const {context,page,errors}=await openPhase('white');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>=10,undefined,{timeout:4000});
  const g=await stellarBoardGeometry(page,{fusion:true});assert.ok(g,'Anã branca: não foi encontrado par H + H adjacente para testar fusão cumulativa por drag');
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move((g.source.x+g.target.x)/2,(g.source.y+g.target.y)/2,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1400});
  await page.mouse.move(g.target.x,g.target.y,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-drop-target'),g.targetId,{timeout:1400});
  await page.mouse.up();
  await page.waitForFunction(({a,b})=>!document.querySelector(`#pieces .atom[data-id="${a}"]`)&&!document.querySelector(`#pieces .atom[data-id="${b}"]`),{a:g.sourceId,b:g.targetId},{timeout:6000});
  const movedTargets=await page.locator('#cells .cell.move-target').count();assert.equal(movedTargets,0,'Anã branca: habilitar drag de fusão não deve liberar movimento para casas vazias');
  assert.deepEqual(errors,[],`Anã branca fusão por drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarBoardMovementDrag(){
 const {context,page,errors}=await openPhase('c');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  const g=await stellarBoardGeometry(page);assert.ok(g,'Carbono: não foi encontrado átomo com casa vizinha vazia');
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`);
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move((g.source.x+g.target.x)/2,(g.source.y+g.target.y)/2,{steps:2});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1000});
  await page.mouse.move(g.target.x,g.target.y,{steps:4});
  await page.waitForFunction(cell=>document.querySelector(`#cells .cell[data-cell="${cell}"]`)?.classList.contains('stellar-drag-hover'),g.targetCell,{timeout:1200});
  assert.ok(g.overshoot,'Carbono movimento por drag: alvo sem ponto seguro para atravessar completamente');
  await page.mouse.move(g.overshoot.x,g.overshoot.y,{steps:4});
  await page.waitForFunction(()=>!document.querySelector('#cells .cell.stellar-drag-hover'),undefined,{timeout:1200});
  await page.mouse.up();
  await page.waitForFunction(({id,cell})=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.dataset.cell===cell,{id:g.sourceId,cell:g.targetCell},{timeout:2500});
  assert.deepEqual(errors,[],`Carbono movimento por drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarBoardFusionDrag(){
 const {context,page,errors}=await openPhase('c');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  await page.evaluate(()=>{Math.random=()=>.999});
  const g=await stellarBoardGeometry(page,{fusion:true});assert.ok(g,'Carbono: não foi encontrado par H + H adjacente para testar fusão por drag');
  const before=await page.locator('#pieces .atom .sym').evaluateAll(els=>els.filter(el=>el.textContent?.trim()==='²H').length);
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move((g.source.x+g.target.x)/2,(g.source.y+g.target.y)/2,{steps:2});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1000});
  await page.mouse.move(g.target.x,g.target.y,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-drop-target'),g.targetId,{timeout:1200});
  await page.mouse.up();
  await page.waitForFunction(before=>[...document.querySelectorAll('#pieces .atom .sym')].filter(el=>el.textContent?.trim()==='²H').length>before,before,{timeout:6000});
  assert.deepEqual(errors,[],`Carbono fusão por drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarBoardSwapByClick(){
 const {context,page,errors}=await openPhase('c');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  const g=await findStellarSwapPair(page);assert.ok(g,'Carbono: não foi encontrado par adjacente comum para troca por clique');
  const before=await page.evaluate(({sourceId,targetId})=>({
   source:document.querySelector(`#pieces .atom[data-id="${sourceId}"] .sym`)?.textContent||'',
   target:document.querySelector(`#pieces .atom[data-id="${targetId}"] .sym`)?.textContent||''
  }),g);
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`),target=page.locator(`#pieces .atom[data-id="${g.targetId}"]`);
  await source.click({force:true});
  assert.equal(await target.evaluate(el=>el.classList.contains('candidate')),false,'Carbono swap: núcleo comum recebeu destaque nuclear antes da troca');
  await target.click({force:true});
  await page.waitForFunction(({sourceId,targetId,sourceCell,targetCell})=>{
   const a=document.querySelector(`#pieces .atom[data-id="${sourceId}"]`),b=document.querySelector(`#pieces .atom[data-id="${targetId}"]`);
   return a?.dataset.cell===targetCell&&b?.dataset.cell===sourceCell
  },g,{timeout:3000});
  const after=await page.evaluate(({sourceId,targetId})=>({
   source:document.querySelector(`#pieces .atom[data-id="${sourceId}"] .sym`)?.textContent||'',
   target:document.querySelector(`#pieces .atom[data-id="${targetId}"] .sym`)?.textContent||'',
   selected:document.querySelectorAll('#pieces .atom.selected').length
  }),g);
  assert.deepEqual({source:after.source,target:after.target},before,'Carbono swap: identidades dos núcleos mudaram durante a troca');
  assert.equal(after.selected,0,'Carbono swap: seleção permaneceu armada após a troca');
  assert.deepEqual(errors,[],`Carbono swap por clique: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarBoardSwapByDrag(){
 const {context,page,errors}=await openPhase('c');
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  const g=await findStellarSwapPair(page);assert.ok(g,'Carbono: não foi encontrado par adjacente comum para troca por drag');
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`),target=page.locator(`#pieces .atom[data-id="${g.targetId}"]`),sb=await source.boundingBox(),tb=await target.boundingBox();
  assert.ok(sb&&tb,'Carbono swap drag: par perdeu geometria');
  const sx=sb.x+sb.width/2,sy=sb.y+sb.height/2,tx=tb.x+tb.width/2,ty=tb.y+tb.height/2;
  await page.mouse.move(sx,sy);await page.mouse.down();
  await page.mouse.move(sx+(tx-sx)*.32,sy+(ty-sy)*.32,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1200});
  await page.mouse.move(tx,ty,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-swap-target'),g.targetId,{timeout:1200});
  assert.equal(await target.evaluate(el=>el.classList.contains('stellar-board-drop-target')),false,'Carbono swap drag: alvo comum foi confundido com reação');
  await page.mouse.up();
  await page.waitForFunction(({sourceId,targetId,sourceCell,targetCell})=>{
   const a=document.querySelector(`#pieces .atom[data-id="${sourceId}"]`),b=document.querySelector(`#pieces .atom[data-id="${targetId}"]`);
   return a?.dataset.cell===targetCell&&b?.dataset.cell===sourceCell
  },g,{timeout:3000});
  assert.deepEqual(errors,[],`Carbono swap por drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function outerCellCenter(page){
 return page.evaluate(()=>{
  const board=document.getElementById('starBoard'),br=board.getBoundingClientRect(),cx=br.left+br.width/2,cy=br.top+br.height/2,cells=[...document.querySelectorAll('#cells .cell')];
  const center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  return cells.map(el=>({cell:el.dataset.cell,...center(el)})).sort((a,b)=>Math.hypot(b.x-cx,b.y-cy)-Math.hypot(a.x-cx,a.y-cy))[0]||null
 })
}

async function testStellarBoardMovementDragWithRotation(){
 const {context,page,errors}=await openPhase('c',{rotation:true});
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  await page.waitForTimeout(850);
  const g=await stellarBoardGeometry(page);assert.ok(g,'Carbono + rotação: não foi encontrado átomo com casa vizinha vazia');
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`);
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move(g.source.x+(g.target.x-g.source.x)*.28,g.source.y+(g.target.y-g.source.y)*.28,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1200});
  await page.waitForFunction(()=>window.ARDUA_ROTATION?.interactionActive?.()===true,undefined,{timeout:900});
  const targetCell=page.locator(`#cells .cell[data-cell="${g.targetCell}"]`),frozenA=await targetCell.boundingBox();assert.ok(frozenA,'Carbono + rotação: alvo perdeu geometria durante drag');
  await page.waitForTimeout(220);
  const frozenB=await targetCell.boundingBox();assert.ok(frozenB,'Carbono + rotação: alvo perdeu geometria após pausa');
  const ax=frozenA.x+frozenA.width/2,ay=frozenA.y+frozenA.height/2,bx=frozenB.x+frozenB.width/2,by=frozenB.y+frozenB.height/2;
  assert.ok(Math.hypot(ax-bx,ay-by)<1.25,'Carbono + rotação: campo continuou girando durante drag ativo');
  await page.mouse.move(bx,by,{steps:4});
  await page.waitForFunction(cell=>document.querySelector(`#cells .cell[data-cell="${cell}"]`)?.classList.contains('stellar-drag-hover'),g.targetCell,{timeout:1200});
  const dragged=await source.boundingBox();assert.ok(dragged,'Carbono + rotação: átomo arrastado perdeu geometria');
  assert.ok(Math.hypot(dragged.x+dragged.width/2-bx,dragged.y+dragged.height/2-by)<2.5,'Carbono + rotação: átomo recebeu offset orbital durante o arraste');
  await page.mouse.up();
  await page.waitForFunction(({id,cell})=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.dataset.cell===cell,{id:g.sourceId,cell:g.targetCell},{timeout:2500});
  await page.waitForFunction(()=>window.ARDUA_ROTATION?.interactionActive?.()===false,undefined,{timeout:900});
  const orbitA=await outerCellCenter(page);assert.ok(orbitA,'Carbono + rotação: célula externa ausente');
  await page.waitForFunction(({cell,x,y})=>{
   const el=document.querySelector(`#cells .cell[data-cell="${cell}"]`);if(!el)return false;const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   return Math.hypot(x-cx,y-cy)>1
  },{cell:orbitA.cell,x:orbitA.x,y:orbitA.y},{timeout:1400});
  assert.deepEqual(errors,[],`Carbono movimento por drag com rotação: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testStellarBoardFusionDragWithRotation(){
 const {context,page,errors}=await openPhase('c',{rotation:true});
 try{
  await page.waitForFunction(()=>document.querySelectorAll('#pieces .atom[data-cell]:not([data-cell=""])').length>10,undefined,{timeout:4000});
  await page.evaluate(()=>{Math.random=()=>.999});
  await page.waitForTimeout(850);
  const g=await stellarBoardGeometry(page,{fusion:true});assert.ok(g,'Carbono + rotação: não foi encontrado par H + H adjacente para fusão');
  const before=await page.locator('#pieces .atom .sym').evaluateAll(els=>els.filter(el=>el.textContent?.trim()==='²H').length);
  await page.mouse.move(g.source.x,g.source.y);await page.mouse.down();
  await page.mouse.move(g.source.x+(g.target.x-g.source.x)*.28,g.source.y+(g.target.y-g.source.y)*.28,{steps:3});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-dragging'),g.sourceId,{timeout:1200});
  const target=page.locator(`#pieces .atom[data-id="${g.targetId}"]`),tb=await target.boundingBox();assert.ok(tb,'Carbono + rotação: reagente-alvo perdeu geometria');
  const tx=tb.x+tb.width/2,ty=tb.y+tb.height/2;
  await page.mouse.move(tx,ty,{steps:4});
  await page.waitForFunction(id=>document.querySelector(`#pieces .atom[data-id="${id}"]`)?.classList.contains('stellar-board-drop-target'),g.targetId,{timeout:1200});
  const source=page.locator(`#pieces .atom[data-id="${g.sourceId}"]`),sb=await source.boundingBox();assert.ok(sb,'Carbono + rotação: reagente arrastado perdeu geometria');
  assert.ok(Math.hypot(sb.x+sb.width/2-tx,sb.y+sb.height/2-ty)<2.5,'Carbono + rotação: reagente arrastado ficou deslocado do ponteiro');
  await page.mouse.up();
  await page.waitForFunction(before=>[...document.querySelectorAll('#pieces .atom .sym')].filter(el=>el.textContent?.trim()==='²H').length>before,before,{timeout:6000});
  assert.deepEqual(errors,[],`Carbono fusão por drag com rotação: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

async function testQuasarDragAndChrome(){
 const {context,page,errors}=await openPhase('black_hole');
 try{
  await page.waitForFunction(()=>window.ARDUA_QUASAR_GAME?.launch&&window.ARDUA_CAMPAIGN,undefined,{timeout:3000});
  await page.evaluate(()=>{window.ARDUA_CAMPAIGN?.setActive?.('quasar');window.ARDUA_QUASAR_GAME.launch()});
  await page.waitForFunction(()=>document.getElementById('starBoard')?.classList.contains('quasar-mode')&&document.querySelectorAll('.quasar-gas').length===12,undefined,{timeout:2500});
  const chrome=await page.evaluate(()=>{
   const f=document.getElementById('formulaText'),p=document.querySelector('.stage-progress'),style=p?getComputedStyle(p):null;
   return{
    name:f?.querySelector('.recipe-name-line')?.textContent||'',
    symbol:f?.querySelector('.recipe-symbol-line')?.textContent||'',
    progressVisible:!!p&&!p.hidden&&style?.visibility!=='hidden'&&style?.display!=='none',
    progressLabel:document.getElementById('stageProgressLabel')?.textContent||'',
    progressText:document.getElementById('stageProgressText')?.textContent||'',
    width:document.getElementById('stageProgress')?.style.width||'',
    visualWidth:document.getElementById('stageProgress')?getComputedStyle(document.getElementById('stageProgress')).width:'',
    goal:document.getElementById('goalText')?.textContent||''
   };
  });
  assert.equal(chrome.name,'Gás orbital + Gás orbital → Gás em acreção + radiação','Quasar: primeira linha da receita ausente');
  assert.equal(chrome.symbol,'m₁ + m₂ → mₐcc + hν','Quasar: segunda linha simbólica ausente');
  assert.equal(chrome.progressVisible,true,'Quasar: barra de progresso oculta');
  assert.equal(chrome.progressLabel,'0 de 6','Quasar: meta inicial deveria ficar no início da barra');
  assert.equal(chrome.progressText,'0%','Quasar: porcentagem inicial deveria ficar no fim da barra');
  assert.ok(parseFloat(chrome.visualWidth)>=8,'Quasar: barra inicial deveria conservar preenchimento visual mínimo');
  assert.equal(chrome.goal,'Crie 6 unidades de Gás em Acreção','Quasar: objetivo não deveria repetir contador de progresso');

  const source=page.locator('.quasar-gas[data-gas-index="0"]'),target=page.locator('.quasar-gas[data-gas-index="1"]'),sb=await source.boundingBox(),tb=await target.boundingBox();
  assert.ok(sb&&tb,'Quasar: parcelas iniciais sem geometria');
  const sx=sb.x+sb.width/2,sy=sb.y+sb.height/2,tx=tb.x+tb.width/2,ty=tb.y+tb.height/2;
  const hit=await page.evaluate(({x,y})=>{const el=document.elementFromPoint(x,y);return{gas:!!el?.closest?.('.quasar-gas'),surface:!!el?.closest?.('.quasar-layer'),tag:el?.tagName||'',id:el?.id||'',cls:el?.className||''}},{x:sx,y:sy});
  assert.equal(hit.surface,true,`Quasar: ponto da parcela saiu da superfície interativa: ${JSON.stringify(hit)}`);
  await page.mouse.move(sx,sy);await page.mouse.down();
  const tb2=await target.boundingBox();assert.ok(tb2,'Quasar: alvo desapareceu durante drag');
  await page.mouse.move(tb2.x+tb2.width/2,tb2.y+tb2.height/2,{steps:6});
  await page.waitForFunction(()=>!!document.querySelector('.quasar-gas.dragging'),undefined,{timeout:1200});
  await page.waitForFunction(()=>!!document.querySelector('.quasar-gas.drag-target'),undefined,{timeout:1200});
  await page.mouse.up();
  await page.waitForFunction(()=>document.getElementById('stageProgressLabel')?.textContent==='1 de 6'&&document.getElementById('stageProgressText')?.textContent==='17%',undefined,{timeout:2200});
  const after=await page.evaluate(()=>({width:document.getElementById('stageProgress')?.style.width||'',dragging:document.querySelectorAll('.quasar-gas.dragging').length,target:document.querySelectorAll('.quasar-gas.drag-target').length}));
  assert.equal(after.width,'17%','Quasar: progresso visual após uma acreção deveria ser 17%');
  assert.equal(after.dragging,0,'Quasar: estado dragging permaneceu após pointerup');
  assert.equal(after.target,0,'Quasar: destaque drag-target permaneceu após pointerup');
  assert.deepEqual(errors,[],`Quasar drag: erros JavaScript: ${errors.join(' | ')}`);
 }finally{await context.close()}
}

try{
 await testCentralFusionProductRelocation();
 await testPrimordialParticleDrop();
 await testStellarFormationDrag();
 await testAtlasFusionDragWithoutPreclick();
 await testWhiteCompactFusionDrag();
 await testStellarBoardMovementDrag();
 await testStellarBoardFusionDrag();
 await testStellarBoardSwapByClick();
 await testStellarBoardSwapByDrag();
 await testStellarBoardMovementDragWithRotation();
 await testStellarBoardFusionDragWithRotation();
 await testQuasarDragAndChrome();
 console.log('Drag interactions OK: primordial reactions, Brown Dwarf/White Dwarf/Atlas fusion drag, stellar formation, persistent movement targets, fusion/swap and Quasar direct manipulation all pass.');
}finally{
 await browser.close();
}
