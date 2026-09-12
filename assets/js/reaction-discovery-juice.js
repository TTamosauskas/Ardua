/* Ardua — P2.3 presentation-only reaction resolve + collection arrival. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),board=$('starBoard'),fx=$('fx');
if(!board||!window.ARDUA_FEEDBACK_LANGUAGE)return;
const PIECES='.atom,.primordial-particle,.cosmic-ray,.neutron,.quark-piece,.quarks-baryon';
let serial=0,lastPoint={xPct:50,yPct:50,at:0},rewardObserver=null,discoveryObserver=null;

function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true}
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Number(v)||0))}
function pointFromElement(el){
 const a=el?.getBoundingClientRect(),b=board.getBoundingClientRect();
 if(!a||!b.width||!b.height)return null;
 return{xPct:clamp(((a.left+a.width/2-b.left)/b.width)*100),yPct:clamp(((a.top+a.height/2-b.top)/b.height)*100)};
}
function latestReactionPoint(detail={}){
 if(Number.isFinite(detail.xPct)&&Number.isFinite(detail.yPct))return{xPct:clamp(detail.xPct),yPct:clamp(detail.yPct)};
 const chain=fx?.querySelector('.chain-callout.visible'),chainPoint=pointFromElement(chain);if(chainPoint)return chainPoint;
 const sparks=[...(fx?.querySelectorAll('.reward-spark')||[])],sparkPoint=pointFromElement(sparks.at(-1));if(sparkPoint)return sparkPoint;
 const selected=[...board.querySelectorAll(`${PIECES}.selected,${PIECES}.candidate`)],points=selected.map(pointFromElement).filter(Boolean);
 if(points.length)return{xPct:points.reduce((n,p)=>n+p.xPct,0)/points.length,yPct:points.reduce((n,p)=>n+p.yPct,0)/points.length};
 return lastPoint.at?{xPct:lastPoint.xPct,yPct:lastPoint.yPct}:{xPct:50,yPct:50};
}
function emit(kind,detail={}){window.dispatchEvent(new CustomEvent('ardua:p23-juice',{detail:{kind,serial:++serial,audioOwner:'existing',scienceChanged:false,...detail}}))}
function spawnResolve(kind,detail={}){
 if(!['reaction','chain'].includes(kind))return false;
 const point=latestReactionPoint(detail),el=document.createElement('i'),tier=String(detail.tier||'');
 lastPoint={...point,at:performance.now()};document.documentElement.style.setProperty('--p23-last-x',`${point.xPct}%`);document.documentElement.style.setProperty('--p23-last-y',`${point.yPct}%`);
 el.className='p23-reaction-resolve';el.dataset.kind=kind;if(tier)el.dataset.tier=tier;el.setAttribute('aria-hidden','true');el.style.left=`${point.xPct}%`;el.style.top=`${point.yPct}%`;board.appendChild(el);
 const life=reducedMotion()?180:kind==='chain'?760:520;setTimeout(()=>el.remove(),life+80);emit(kind,{tier,xPct:point.xPct,yPct:point.yPct,step:Number(detail.step)||0});return true;
}

function normalized(text){return String(text||'').trim().toLocaleUpperCase('pt-BR')}
function cleanDiscoveryTitle(text){return String(text||'').trim().replace(/\s+(DESCOBERTA|DESCOBERTO|DESCOBERTAS|DESCOBERTOS)$/iu,'').trim()}
function elementEntries(){
 return [...document.querySelectorAll('#catalog .el-card')].map(card=>({symbol:card.querySelector('.s')?.textContent?.trim()||'',name:card.querySelector('.nm')?.textContent?.trim()||''})).filter(x=>x.symbol&&x.name);
}
function collectionFor(title){
 const cleaned=cleanDiscoveryTitle(title),key=normalized(cleaned),match=elementEntries().find(x=>normalized(x.name)===key||normalized(x.symbol)===key);
 if(match)return{kind:'elements',label:'ADICIONADO A ELEMENTOS',mark:match.symbol,name:match.name};
 return{kind:'atlas',label:'ADICIONADO AO ATLAS',mark:'✦',name:cleaned||'Descoberta'};
}
function ensureCollectionChrome(card){
 if(!card)return null;let mark=card.querySelector('.p23-collection-mark'),meta=card.querySelector('.p23-collection-meta');
 if(!mark){mark=document.createElement('span');mark.className='p23-collection-mark';mark.setAttribute('aria-hidden','true');card.prepend(mark)}
 if(!meta){meta=document.createElement('small');meta.className='p23-collection-meta';const title=card.querySelector('strong');if(title)card.insertBefore(meta,title);else card.appendChild(meta)}
 return{mark,meta};
}
function decorateDiscoveryModal(){
 const host=$('discoveryUnlockModal'),card=host?.querySelector('.discovery-unlock-card'),title=$('discoveryUnlockTitle');if(!host||!card||!title||!host.classList.contains('show'))return false;
 const info=collectionFor(title.textContent),chrome=ensureCollectionChrome(card);if(!chrome)return false;
 host.dataset.p23Collection=info.kind;chrome.mark.textContent=info.mark;chrome.meta.textContent=info.label;card.classList.remove('p23-collection-arrival');void card.offsetWidth;card.classList.add('p23-collection-arrival');emit('discovery',{collection:info.kind,title:info.name});return true;
}
function decorateReward(){
 const host=$('campaignVictoryReward'),box=host?.querySelector('[data-victory-discovery]'),strong=box?.querySelector('strong');if(!host||!box||!strong||box.hidden||!host.classList.contains('show'))return false;
 const raw=strong.textContent?.trim()||'',countMatch=raw.match(/^(\d+)\s+descobertas/i),info=countMatch?{kind:'collection',label:'ADICIONADAS À COLEÇÃO',mark:`+${countMatch[1]}`,name:raw}:collectionFor(raw),chrome=ensureCollectionChrome(box);if(!chrome)return false;
 host.dataset.p23Collection=info.kind;chrome.mark.textContent=info.mark;chrome.meta.textContent=info.label;
 if(!countMatch&&/(DESCOBERTA|DESCOBERTO)$/iu.test(raw))strong.textContent=info.name;
 box.classList.remove('p23-collection-arrival');void box.offsetWidth;box.classList.add('p23-collection-arrival');host.classList.add('p23-reaction-handoff');emit('reward-collection',{collection:info.kind,title:info.name});return true;
}
function observeSurfaces(){
 const discovery=$('discoveryUnlockModal');if(discovery&&!discoveryObserver){discoveryObserver=new MutationObserver(decorateDiscoveryModal);discoveryObserver.observe(discovery,{attributes:true,attributeFilter:['class','aria-hidden'],childList:true,subtree:true})}
 const reward=$('campaignVictoryReward');if(reward&&!rewardObserver){rewardObserver=new MutationObserver(decorateReward);rewardObserver.observe(reward,{attributes:true,attributeFilter:['class','aria-hidden'],childList:true,subtree:true})}
 decorateDiscoveryModal();decorateReward();
}

window.addEventListener('ardua:feedback-language',e=>{const d=e.detail||{};if(d.kind==='reaction'||d.kind==='chain')spawnResolve(d.kind,d)});
window.addEventListener('ardua:victory-reward-state',e=>{if(e.detail?.state==='rewarding')queueMicrotask(decorateReward)});
window.addEventListener('ardua:engine-phase',()=>{board.querySelectorAll('.p23-reaction-resolve').forEach(el=>el.remove())});
observeSurfaces();setTimeout(observeSurfaces,0);
window.ARDUA_REACTION_DISCOVERY_JUICE=Object.freeze({spawnResolve,collectionFor,decorateDiscoveryModal,decorateReward,state:()=>({serial,lastPoint:{...lastPoint}})});
})();
