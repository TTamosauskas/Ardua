import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const failures=[];

async function inspect(id,width=390,height=844){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  await context.addInitScript(phaseId=>{
    localStorage.setItem('arduaCampaignGraphV1',JSON.stringify({version:14,introduced:true,activeId:phaseId,completed:[],generation:0,heritage:{level:0,seeds:[],sourceGeneration:0}}));
    localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseId,phaseIndex:0,version:'10.80',discovered:[],ignited:false,productLessons:[],rewardDiscoveries:[],rewardAchievements:[],signatureSeen:[]}));
  },id);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('starBoard')&&window.ARDUA_CAMPAIGN?.getState);
  await page.waitForTimeout(900);
  const data=await page.evaluate(()=>{
    const app=document.querySelector('.app'),shell=document.querySelector('.star-shell'),board=document.getElementById('starBoard'),core=document.getElementById('starCore'),info=document.getElementById('infoPanel');
    const rect=e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right}};
    const as=getComputedStyle(app),bs=getComputedStyle(board),is=getComputedStyle(info);
    const ar=rect(app),sr=rect(shell),br=rect(board),cr=rect(core),ir=rect(info);
    return {
      activeId:window.ARDUA_CAMPAIGN.getState().activeId,
      title:document.getElementById('phaseTitle')?.textContent?.trim(),
      app:ar,shell:sr,board:br,core:cr,info:ir,
      gapBelowInfo:ar.bottom-parseFloat(as.paddingBottom)-ir.bottom,
      boardCss:{aspectRatio:bs.aspectRatio,flexShrink:bs.flexShrink,maxWidth:bs.maxWidth},
      infoMarginTop:is.marginTop,
      rootStarSize:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--starSize')),
      shellClientWidth:shell.clientWidth,
      errors
    };
  });
  try{
    assert.equal(data.activeId,id,`${id}: fase ativa inesperada`);
    assert.ok(data.board.width>0&&data.board.height>0,`${id}: estrela sem dimensões`);
    assert.ok(Math.abs(data.board.width-data.board.height)<=0.75,`${id}: estrela oval (${data.board.width.toFixed(2)} × ${data.board.height.toFixed(2)})`);
    assert.ok(Math.abs(data.core.width-data.core.height)<=0.75,`${id}: núcleo visual oval (${data.core.width.toFixed(2)} × ${data.core.height.toFixed(2)})`);
    assert.ok(data.board.width<=data.shell.width+0.75,`${id}: estrela excede a largura disponível`);
    assert.ok(data.rootStarSize<=data.shellClientWidth+0.75,`${id}: --starSize excede o shell (${data.rootStarSize}>${data.shellClientWidth})`);
    assert.ok(Math.abs(data.gapBelowInfo)<=1.25,`${id}: box não está no fim da página; sobra ${data.gapBelowInfo.toFixed(2)}px`);
    assert.equal(data.boardCss.flexShrink,'0',`${id}: estrela ainda pode ser comprimida de forma não uniforme`);
    assert.equal(data.boardCss.maxWidth,'100%',`${id}: estrela não está limitada ao shell`);
    assert.deepEqual(data.errors,[],`${id}: erros JavaScript: ${data.errors.join(' | ')}`);
  }catch(e){failures.push(`${width}x${height} ${e.message}`)}
  console.log(`LAYOUT ${id} ${width}x${height}: board ${data.board.width.toFixed(1)}×${data.board.height.toFixed(1)}, footerGap ${data.gapBelowInfo.toFixed(1)}px`);
  await context.close();
}

for(const id of ['brown','c','o','carbon_burn','weak_s_cu','au']){
  await inspect(id,390,844);
  await inspect(id,360,800);
}
await browser.close();

if(failures.length){console.error(failures.map((x,i)=>`${i+1}. ${x}`).join('\n'));process.exit(1)}
console.log('Browser OK: info panel anchored to page bottom and stellar boards remain circular from dwarf through giant/heavy-element phases.');
