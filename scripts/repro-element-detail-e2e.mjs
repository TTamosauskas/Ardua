import { chromium } from 'playwright';

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page = await context.newPage();
const consoleErrors=[];
const pageErrors=[];
page.on('console',msg=>{if(msg.type()==='error'){consoleErrors.push(msg.text());console.log('CONSOLE ERROR:',msg.text())}});
page.on('pageerror',err=>{pageErrors.push(String(err));console.log('PAGE ERROR:',String(err))});

await page.goto('http://127.0.0.1:8000/index.html#editor',{waitUntil:'domcontentloaded'});
await page.waitForTimeout(900);

const intro=page.locator('#stellarIntro');
if(await intro.count() && await intro.isVisible().catch(()=>false)){
  const start=page.locator('#stellarStartBtn');
  if(await start.count() && await start.isVisible().catch(()=>false)) await start.tap().catch(()=>{});
  await page.waitForTimeout(300);
}

const visibleMenu=page.locator('#campaignHomeMenuBtn:visible, #menuOpenBtn:visible').first();
if(!(await visibleMenu.count())) throw new Error('nenhum botão de menu visível');
console.log('opening menu with=',await visibleMenu.getAttribute('id'));
await visibleMenu.tap();
await page.waitForTimeout(350);

const buttons=await page.locator('button').evaluateAll(btns=>btns.map(b=>({id:b.id,text:(b.textContent||'').trim().replace(/\s+/g,' '),hidden:b.hidden,display:getComputedStyle(b).display,visibility:getComputedStyle(b).visibility})).filter(x=>x.id||x.text).slice(0,160));
console.log('BUTTONS AFTER MENU:',JSON.stringify(buttons));

const data=page.locator('#campaignData');
if(!(await data.count())) throw new Error('campaignData ausente após abrir menu');
console.log('campaignData visible=',await data.isVisible().catch(()=>false),'text=',await data.textContent());
if(!(await data.isVisible().catch(()=>false))) throw new Error('campaignData existe mas não está visível');
await data.tap();
await page.waitForTimeout(550);

const modal=page.locator('#menuModal');
console.log('modal classes=',await modal.getAttribute('class'));
if(!String(await modal.getAttribute('class')).includes('discoveries-view')) throw new Error('Descobertas não abriu');

const elementsTab=page.locator('[data-discovery-tab="elements"]');
if(!(await elementsTab.count())) throw new Error('aba Elementos ausente');
console.log('elements tab visible=',await elementsTab.isVisible().catch(()=>false));
await elementsTab.tap();
await page.waitForTimeout(350);

const cards=page.locator('#catalog .el-card:not([hidden])');
const count=await cards.count();
console.log('visible element cards=',count);
if(!count) throw new Error('nenhum elemento visível no modo editor');
const first=cards.first();
console.log('first card=',await first.textContent());
console.log('first box=',await first.boundingBox());
console.log('first visible=',await first.isVisible().catch(()=>false));

await first.tap();
await page.waitForTimeout(500);

const detail=page.locator('#elementDiscoveryDetail');
const state={
  exists:await detail.count(),
  hidden:await detail.count()?await detail.getAttribute('hidden'):null,
  open:await detail.count()?await detail.getAttribute('data-open'):null,
  display:await detail.count()?await detail.evaluate(el=>getComputedStyle(el).display):null,
  visibility:await detail.count()?await detail.evaluate(el=>getComputedStyle(el).visibility):null,
  rect:await detail.count()?await detail.boundingBox():null,
  body:await page.locator('#elementDiscoveryBody').count()?String(await page.locator('#elementDiscoveryBody').textContent()).trim().slice(0,300):null,
  modalClasses:await modal.getAttribute('class'),
  elementPanelHidden:await page.locator('[data-discovery-panel="elements"]').count()?await page.locator('[data-discovery-panel="elements"]').getAttribute('hidden'):null
};
console.log('DETAIL STATE AFTER REAL TAP:',JSON.stringify(state));
console.log('PAGE ERRORS:',JSON.stringify(pageErrors));
console.log('CONSOLE ERRORS:',JSON.stringify(consoleErrors));

if(!state.exists||state.hidden!==null||state.open!=='1'||state.display==='none'||!state.rect||!state.body){
  throw new Error('Falha reproduzida: detalhe de Elementos não está visivelmente aberto após o fluxo completo');
}

console.log('E2E PASS: detalhe abriu visivelmente após Menu > Descobertas > Elementos > tap real.');
await browser.close();
