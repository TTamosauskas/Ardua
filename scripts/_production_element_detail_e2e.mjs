import { chromium } from 'playwright';

const PROD='https://ttamosauskas.github.io/Ardua/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',err=>{pageErrors.push(String(err));console.log('PAGE ERROR:',String(err),err.stack||'')});
page.on('console',msg=>{if(msg.type()==='error')console.log('CONSOLE ERROR:',msg.text())});

const url=`${PROD}?e2e=${Date.now()}#editor`;
await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(1400);

const elementScript=await page.locator('script[src*="campaign-discoveries-elements.js"]').getAttribute('src');
console.log('ELEMENT SCRIPT:',elementScript);
if(!String(elementScript).includes('v=20260910-element-detail-render-3'))throw new Error(`Produção ainda não serviu o módulo corrigido: ${elementScript}`);

const intro=page.locator('#stellarIntro');
if(await intro.isVisible().catch(()=>false))await page.locator('#stellarStartBtn').tap().catch(()=>{});
await page.waitForTimeout(300);
const preview=page.locator('#campaignPhasePreview.show');
if(await preview.isVisible().catch(()=>false)){
  await preview.locator('[data-phase-preview-close]').tap();
  await page.waitForTimeout(700);
}
const menu=page.locator('#campaignHomeMenuBtn');
if(!(await menu.isVisible().catch(()=>false)))throw new Error('Menu principal não está visível em produção');
await menu.tap();
await page.waitForTimeout(300);
const discoveries=page.locator('#campaignHomeDiscoveries');
if(!(await discoveries.isVisible().catch(()=>false)))throw new Error('Descobertas não está visível em produção');
await discoveries.tap();
await page.waitForTimeout(600);
const modal=page.locator('#menuModal');
if(!String(await modal.getAttribute('class')).includes('discoveries-view'))throw new Error('Descobertas não abriu em produção');

const elementsTab=page.locator('[data-discovery-tab="elements"]');
if(!(await elementsTab.isVisible().catch(()=>false)))throw new Error('Aba Elementos não está visível em produção');
await elementsTab.tap();
await page.waitForTimeout(350);
const first=page.locator('#catalog .el-card:not([hidden])').first();
if(!(await first.isVisible().catch(()=>false)))throw new Error('Nenhum elemento visível em produção');
console.log('TAPPING:',String(await first.textContent()).trim());
await first.tap();
await page.waitForTimeout(1200);

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
console.log('PRODUCTION DETAIL:',JSON.stringify({...state,text:state.text.slice(0,280)}));
console.log('PAGE_ERRORS:',JSON.stringify(pageErrors));
if(state.hidden!==null||state.open!=='1'||state.display==='none'||!state.rect)throw new Error('Detalhe não ficou visível em produção');
if(!state.text||!state.hasImage||!state.hasModel||state.sourceLinks<2)throw new Error('Detalhe abriu sem informações finais em produção');
if(pageErrors.length)throw new Error(`Erros JavaScript em produção: ${pageErrors.join(' | ')}`);
console.log('PRODUCTION E2E PASS: Menu > Descobertas > Elementos > toque abre detalhe completo, visível e sem erro JS.');
await browser.close();
