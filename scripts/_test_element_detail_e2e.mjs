import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',err=>{pageErrors.push(String(err));console.log('PAGE ERROR:',String(err),err.stack||'')});
await page.goto('http://127.0.0.1:8000/index.html#editor',{waitUntil:'domcontentloaded'});
await page.waitForTimeout(900);

const intro=page.locator('#stellarIntro');
if(await intro.isVisible().catch(()=>false))await page.locator('#stellarStartBtn').tap().catch(()=>{});
await page.waitForTimeout(250);
const preview=page.locator('#campaignPhasePreview.show');
if(await preview.isVisible().catch(()=>false)){
  await preview.locator('[data-phase-preview-close]').tap();
  await page.waitForTimeout(650);
}
const menu=page.locator('#campaignHomeMenuBtn');
if(!(await menu.isVisible().catch(()=>false)))throw new Error('Menu principal da campanha não está visível');
await menu.tap();
await page.waitForTimeout(250);
const discoveries=page.locator('#campaignHomeDiscoveries');
if(!(await discoveries.isVisible().catch(()=>false)))throw new Error('Entrada Descobertas não está visível');
await discoveries.tap();
await page.waitForTimeout(500);
const modal=page.locator('#menuModal');
if(!String(await modal.getAttribute('class')).includes('discoveries-view'))throw new Error('Descobertas não abriu');
const elementsTab=page.locator('[data-discovery-tab="elements"]');
if(!(await elementsTab.isVisible().catch(()=>false)))throw new Error('Aba Elementos não está visível');
await elementsTab.tap();
await page.waitForTimeout(300);
const card=page.locator('#catalog .el-card:not([hidden])').first();
if(!(await card.isVisible().catch(()=>false)))throw new Error('Nenhum cartão de elemento está visível');
console.log('Tapping element:',String(await card.textContent()).trim());
await card.tap();
await page.waitForTimeout(900);
const detail=page.locator('#elementDiscoveryDetail');
const body=page.locator('#elementDiscoveryBody');
const state={
 hidden:await detail.getAttribute('hidden'),
 open:await detail.getAttribute('data-open'),
 display:await detail.evaluate(el=>getComputedStyle(el).display),
 rect:await detail.boundingBox(),
 text:String(await body.textContent()).trim(),
 hasImage:(await body.locator('.element-wiki-image').count())>0,
 hasModel:(await body.locator('.element-bohr-preview,.element-atomic-square').count())>0,
 sourceLinks:await body.locator('.element-source-btn').count()
};
console.log('DETAIL:',JSON.stringify({...state,text:state.text.slice(0,260)}));
console.log('PAGE_ERRORS:',JSON.stringify(pageErrors));
if(state.hidden!==null||state.open!=='1'||state.display==='none'||!state.rect)throw new Error('Detalhe não ficou visível');
if(!state.text||!state.hasImage||!state.hasModel||state.sourceLinks<2)throw new Error('Detalhe abriu sem as informações finais esperadas');
if(pageErrors.length)throw new Error(`Erros JavaScript durante o fluxo: ${pageErrors.join(' | ')}`);
console.log('E2E PASS: Menu > Descobertas > Elementos > toque abre conteúdo final visível sem erro JavaScript.');
await browser.close();
