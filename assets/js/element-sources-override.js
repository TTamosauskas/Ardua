/* Ardua — canonical Wikipedia/local-image/Periodic Videos sources for element discoveries. */
(()=>{
'use strict';
const detail=document.getElementById('elementDiscoveryDetail')||null,modal=document.getElementById('menuModal');
if(!modal)return;
const API='https://pt.wikipedia.org/w/api.php',DATA_URL=new URL('assets/data/element-sources.json',document.baseURI).href;
let dataPromise=null,serial=0;
const data=()=>dataPromise??=fetch(DATA_URL,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('element sources unavailable'))).catch(()=>({}));
function stripDelimited(text,re){let out=String(text||''),prev='';for(let i=0;i<8&&out!==prev;i++){prev=out;out=out.replace(re,' ')}return out}
function clean(text){
 let out=String(text||'').replace(/\r/g,' ').trim();
 out=stripDelimited(out,/\([^()]*\)/g);out=stripDelimited(out,/\[[^\[\]]*\]/g);out=stripDelimited(out,/\{[^{}]*\}/g);
 return out.replace(/<[^>]*>/g,' ').replace(/\bnota\s*\d+\b/gi,' ').replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+(?=\s|[.,;:!?]|$)/g,'').replace(/\s+([,.;:!?])/g,'$1').replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g,'$1 ').replace(/\s{2,}/g,' ').trim();
}
function firstParagraph(html){
 try{const doc=new DOMParser().parseFromString(String(html||''),'text/html'),p=[...doc.querySelectorAll('.mw-parser-output > p')].find(x=>String(x.textContent||'').replace(/\s+/g,' ').trim().length>40);if(!p)return'';p.querySelectorAll('sup,.reference,.mw-ref,.mw-editsection,.mw-valign-text-top,.mw-valign-text-bottom').forEach(x=>x.remove());return clean(p.textContent||'')}catch(_e){return''}
}
function fallback(title){return`https://pt.wikipedia.org/wiki/${encodeURIComponent(String(title||'').trim().replace(/\s+/g,'_'))}`}
function anchor(body,label){return[...body.querySelectorAll('.element-source-btn')].find(a=>a.textContent.trim()===label)||null}
async function canonicalIntro(title){
 const q=new URLSearchParams({origin:'*',action:'parse',format:'json',formatversion:'2',redirects:'1',prop:'text',page:title});
 try{const r=await fetch(`${API}?${q}`,{mode:'cors'});if(!r.ok)return'';const j=await r.json();return firstParagraph(j?.parse?.text||'')}catch(_e){return''}
}
async function syncDetail(){
 const host=document.getElementById('elementDiscoveryDetail');if(!host||host.hidden||!host.dataset.sym)return;
 const run=++serial,sym=host.dataset.sym,sources=await data(),cfg=sources[sym];if(run!==serial||!cfg)return;
 const body=document.getElementById('elementDiscoveryBody');if(!body)return;
 const wiki=anchor(body,'Wikipedia'),periodic=anchor(body,'Periodic Videos');
 if(wiki)wiki.href=cfg.wikiUrl||fallback(cfg.wikiTitle);
 if(periodic&&cfg.periodicVideoId)periodic.href=`https://www.youtube.com/watch?v=${cfg.periodicVideoId}`;
 const image=body.querySelector('.element-wiki-image');
 if(image&&cfg.imagePath){image.src=new URL(cfg.imagePath,document.baseURI).href;image.removeAttribute('referrerpolicy')}
 const intro=await canonicalIntro(cfg.wikiTitle);if(run!==serial||host.hidden||host.dataset.sym!==sym)return;
 const p=body.querySelector('.element-wiki-copy p');if(p&&intro)p.textContent=intro;
 if(wiki)wiki.href=cfg.wikiUrl||fallback(cfg.wikiTitle);
 if(periodic&&cfg.periodicVideoId)periodic.href=`https://www.youtube.com/watch?v=${cfg.periodicVideoId}`;
 const refreshed=body.querySelector('.element-wiki-image');if(refreshed&&cfg.imagePath){refreshed.src=new URL(cfg.imagePath,document.baseURI).href;refreshed.removeAttribute('referrerpolicy')}
}
const observer=new MutationObserver(()=>queueMicrotask(syncDetail));observer.observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-sym']});
modal.addEventListener('click',()=>setTimeout(syncDetail,0),true);window.addEventListener('ardua:campaign-progress',()=>setTimeout(syncDetail,0));setTimeout(syncDetail,0);
})();
