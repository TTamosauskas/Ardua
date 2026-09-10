import { chromium } from 'playwright';

const base=process.env.ARDUA_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});

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
  await page.waitForTimeout(1000);
  const data=await page.evaluate(()=>{
    const app=document.querySelector('.app'),shell=document.querySelector('.star-shell'),board=document.getElementById('starBoard'),core=document.getElementById('starCore'),info=document.getElementById('infoPanel');
    const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left}};
    const bs=getComputedStyle(board),as=getComputedStyle(app);
    return {
      activeId:window.ARDUA_CAMPAIGN.getState().activeId,
      title:document.getElementById('phaseTitle')?.textContent?.trim(),
      app:rect(app),shell:rect(shell),board:rect(board),core:rect(core),info:rect(info),
      boardCss:{width:bs.width,height:bs.height,aspectRatio:bs.aspectRatio,flexShrink:bs.flexShrink,transform:bs.transform,borderRadius:bs.borderRadius},
      rootStarSize:getComputedStyle(document.documentElement).getPropertyValue('--starSize').trim(),
      appPaddingBottom:as.paddingBottom,
      gapBelowInfo:rect(app).bottom-parseFloat(as.paddingBottom)-rect(info).bottom,
      classes:board.className,
      documentHeight:document.documentElement.scrollHeight,
      innerHeight:innerHeight
    };
  });
  console.log('LAYOUT '+id+' '+width+'x'+height+' '+JSON.stringify({...data,errors}));
  await context.close();
}

for(const id of ['brown','c','o','carbon_burn','weak_s_cu','au']){
  await inspect(id,390,844);
  await inspect(id,360,800);
}
await browser.close();
