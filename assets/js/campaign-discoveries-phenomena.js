/* Ardua — square phenomenon atlas + in-place Wikipedia detail. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const modal=$('menuModal'),atlas=$('discoveryAtlas'),card=modal?.querySelector('.card'),heading=card?.querySelector(':scope > h2');
if(!modal||!atlas||!card)return;

if(!document.querySelector('link[data-ardua-phenomena-style]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('assets/css/campaign-discoveries-phenomena.css',document.baseURI).href;link.dataset.arduaPhenomenaStyle='1';document.head.appendChild(link);
}

const WIKI_API='https://pt.wikipedia.org/w/api.php';
const cache=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WIKI_ALIASES=Object.freeze({
 'Big Bang':'Big Bang',
 'Nucleossíntese primordial':'Nucleossíntese primordial',
 'Recombinação cósmica':'Recombinação (cosmologia)',
 'Prótons':'Próton',
 'Nêutrons':'Nêutron',
 'Elétrons':'Elétron',
 'Neutrinos':'Neutrino',
 'Pósitrons':'Positron',
 'Antineutrinos':'Antineutrino',
 'Raios cósmicos':'Raio cósmico',
 'Anã Marrom':'Anã marrom',
 'Anã Vermelha':'Anã vermelha',
 'Anã Laranja':'Anã laranja',
 'Anã Amarela':'Anã amarela',
 'Anã Branca':'Anã branca',
 'Gigante Vermelha':'Gigante vermelha',
 'Gigante Amarela':'Gigante amarela',
 'Gigante Azul':'Gigante azul',
 'Gigante Branca':'Estrela gigante',
 'Supergigante Vermelha':'Supergigante vermelha',
 'Supergigante Amarela':'Supergigante amarela',
 'Supergigante Azul':'Supergigante azul',
 'Estrela AGB':'Ramo gigante assimptótico',
 'Barreira de Coulomb':'Barreira de Coulomb',
 'Tunelamento quântico':'Efeito túnel',
 'Convecção Estelar':'Convecção',
 'Pressão de degenerescência eletrônica':'Matéria degenerada',
 'Colapso gravitacional':'Colapso gravitacional',
 'Triplo-alfa':'Processo triplo-alfa',
 'Espalação':'Espalação',
 'Decaimento':'Decaimento radioativo',
 'Neutronização / captura eletrônica':'Captura eletrônica',
 'Fotodesintegração':'Fotodesintegração',
 'Nucleossíntese explosiva':'Nucleossíntese em supernovas',
 'Processo-s':'Processo s',
 'Processo-r':'Processo r',
 'rp-process':'Processo rp',
 'Waiting point':'Processo rp',
 'Freeze-out':'Processo r',
 'Raios X':'Raios X',
 'Raios gama':'Radiação gama',
 'Supernova':'Supernova',
 'Estrela de Nêutrons':'Estrela de nêutrons',
 'Pulsar':'Pulsar',
 'Disco de acreção':'Disco de acreção',
 'Kilonova':'Kilonova',
 'Buraco Negro':'Buraco negro',
 'Radiação Hawking':'Radiação Hawking',
 'Cadeia planejada':'Reação em cadeia'
});

function stripDelimited(text,re){
 let out=String(text||''),prev='';
 for(let i=0;i<8&&out!==prev;i++){prev=out;out=out.replace(re,' ')}
 return out;
}
function cleanWikiIntro(text){
 let intro=String(text||'').replace(/\r/g,' ').trim();
 intro=stripDelimited(intro,/\([^()]*\)/g);
 intro=stripDelimited(intro,/\[[^\[\]]*\]/g);
 intro=stripDelimited(intro,/\{[^{}]*\}/g);
 return intro
  .replace(/<[^>]*>/g,' ')
  .replace(/\bnota\s*\d+\b/gi,' ')
  .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+(?=\s|[.,;:!?]|$)/g,'')
  .replace(/\s+([,.;:!?])/g,'$1')
  .replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g,'$1 ')
  .replace(/\s{2,}/g,' ')
  .trim();
}
function firstWikiParagraph(html){
 try{
  const doc=new DOMParser().parseFromString(String(html||''),'text/html');
  const candidates=[...doc.querySelectorAll('.mw-parser-output > p')];
  const paragraph=candidates.find(p=>String(p.textContent||'').replace(/\s+/g,' ').trim().length>40);
  if(!paragraph)return'';
  paragraph.querySelectorAll('sup,.reference,.mw-ref,.mw-editsection,.mw-valign-text-top,.mw-valign-text-bottom').forEach(el=>el.remove());
  return cleanWikiIntro(paragraph.textContent||'');
 }catch(_e){return''}
}
function firstExtractParagraph(text){
 const first=String(text||'').replace(/\r/g,'').split(/\n\s*\n/).map(x=>x.trim()).find(x=>x.length>40)||'';
 return cleanWikiIntro(first);
}
function normalizeImage(src){
 const s=String(src||'').trim();if(!s)return'';
 if(s.startsWith('//'))return'https:'+s;
 try{return new URL(s,'https://pt.wikipedia.org').href}catch(_e){return''}
}
function firstArticleImage(html){
 try{
  const doc=new DOMParser().parseFromString(String(html||''),'text/html');
  const imgs=[...doc.querySelectorAll('.mw-parser-output img')];
  const img=imgs.find(x=>{
   const src=String(x.getAttribute('src')||''),w=Number(x.getAttribute('width')||0),alt=String(x.getAttribute('alt')||'');
   return src&&w>=120&&!/icon|logo|question_book|edit-clear|ambox|wikimedia/i.test(src+' '+alt);
  });
  return normalizeImage(img?.getAttribute('src')||'');
 }catch(_e){return''}
}
function wikiFallbackUrl(title){return`https://pt.wikipedia.org/wiki/${encodeURIComponent(String(title||'').trim().replace(/\s+/g,'_'))}`}
async function json(url){const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error('wiki request');return r.json()}
async function resolveTitle(title){
 const exact=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',prop:'info|pageprops',inprop:'url',titles:title});
 try{
  const data=await json(`${WIKI_API}?${exact}`),page=data?.query?.pages?.[0];
  if(page&&!page.missing&&!page.pageprops?.disambiguation)return page.title||title;
 }catch(_e){}
 const search=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',list:'search',srnamespace:'0',srlimit:'1',srsearch:title});
 try{return (await json(`${WIKI_API}?${search}`))?.query?.search?.[0]?.title||title}catch(_e){return title}
}
async function wikiData(title,glyph){
 if(cache.has(title))return cache.get(title);
 const promise=(async()=>{
  const requested=WIKI_ALIASES[title]||title,resolved=await resolveTitle(requested);
  const parseParams=new URLSearchParams({origin:'*',action:'parse',format:'json',formatversion:'2',redirects:'1',prop:'text',page:resolved});
  const metaParams=new URLSearchParams({origin:'*',action:'query',format:'json',formatversion:'2',redirects:'1',prop:'info|extracts|pageimages',inprop:'url',exintro:'1',explaintext:'1',piprop:'thumbnail',pithumbsize:'900',titles:resolved});
  const [parsed,meta]=await Promise.all([
   json(`${WIKI_API}?${parseParams}`).catch(()=>null),
   json(`${WIKI_API}?${metaParams}`).catch(()=>null)
  ]),page=meta?.query?.pages?.[0]||{},html=parsed?.parse?.text||'';
  return{
   title:page.title||parsed?.parse?.title||resolved,
   url:page.fullurl||wikiFallbackUrl(resolved),
   image:normalizeImage(page.thumbnail?.source)||firstArticleImage(html),
   intro:firstWikiParagraph(html)||firstExtractParagraph(page.extract)||''
  };
 })().catch(()=>({title,url:wikiFallbackUrl(WIKI_ALIASES[title]||title),image:'',intro:'',glyph}));
 cache.set(title,promise);return promise;
}

function squareify(){
 atlas.classList.add('phenomena-square-grid');
 atlas.querySelectorAll('.discovery-group').forEach(x=>x.remove());
 atlas.querySelectorAll('.discovery-card').forEach(x=>x.classList.add('phenomenon-square'));
}
let squareQueued=false;
function scheduleSquareify(){
 if(squareQueued)return;squareQueued=true;
 requestAnimationFrame(()=>{squareQueued=false;squareify()});
}
new MutationObserver(scheduleSquareify).observe(atlas,{childList:true,subtree:true});
scheduleSquareify();

let detail=$('phenomenonDiscoveryDetail'),requestSerial=0;
function ensureDetail(){
 if(detail)return detail;
 detail=document.createElement('section');
 detail.id='phenomenonDiscoveryDetail';
 detail.className='element-discovery-detail phenomenon-discovery-detail';
 detail.hidden=true;
 detail.innerHTML=`<header class="element-discovery-head"><strong data-phenomenon-detail-title></strong><button type="button" class="element-detail-back" data-phenomenon-detail-back aria-label="Voltar para fenômenos"><span aria-hidden="true">←</span></button></header><div id="phenomenonDiscoveryBody"></div>`;
 const tabs=$('discoveriesTabs');
 (tabs||heading)?.insertAdjacentElement('afterend',detail);
 detail.addEventListener('click',e=>{
  const back=e.target instanceof Element?e.target.closest('[data-phenomenon-detail-back]'):null;
  if(back){e.preventDefault();leaveDetail()}
 });
 return detail;
}
function setDetailMode(on){
 const tabs=$('discoveriesTabs');if(tabs)tabs.hidden=on;
 modal.classList.toggle('phenomenon-detail-view',on);
 modal.querySelectorAll('[data-discovery-panel]').forEach(panel=>{if(on)panel.hidden=true});
 if(!on)tabs?.querySelector('[data-discovery-tab="phenomena"]')?.click();
}
function leaveDetail(){
 requestSerial++;
 const host=ensureDetail();host.hidden=true;host.removeAttribute('aria-busy');delete host.dataset.title;setDetailMode(false);requestAnimationFrame(()=>card.scrollTo({top:0,behavior:'auto'}));
}
function loadingMarkup(glyph){return`<div class="phenomenon-wiki-loading"><div class="phenomenon-wiki-figure"><div class="phenomenon-wiki-image-placeholder">${esc(glyph||'✦')}</div></div><div class="phenomenon-wiki-copy"><p>Carregando o primeiro parágrafo do artigo…</p></div></div>`}
async function showDetail(button){
 const title=button.querySelector('strong')?.textContent?.trim()||'',glyph=button.querySelector('.discovery-glyph')?.textContent?.trim()||'✦';if(!title)return;
 const host=ensureDetail(),body=$('phenomenonDiscoveryBody'),serial=++requestSerial;if(!body)return;
 setDetailMode(true);host.hidden=false;host.dataset.title=title;host.setAttribute('aria-busy','true');host.querySelector('[data-phenomenon-detail-title]').textContent=title;body.innerHTML=loadingMarkup(glyph);card.scrollTo({top:0,behavior:'auto'});
 const wiki=await wikiData(title,glyph);if(serial!==requestSerial||host.hidden||host.dataset.title!==title)return;
 host.removeAttribute('aria-busy');
 const image=wiki.image?`<img class="phenomenon-wiki-image" src="${esc(wiki.image)}" alt="${esc(title)}" loading="eager">`:`<div class="phenomenon-wiki-image-placeholder">${esc(glyph)}</div>`;
 const intro=wiki.intro||`Consulte o artigo ${wiki.title||title} na Wikipédia para esta descoberta.`;
 body.innerHTML=`<figure class="phenomenon-wiki-figure">${image}</figure><div class="phenomenon-wiki-copy"><p>${esc(intro)}</p></div>`;
}

atlas.addEventListener('click',e=>{
 const button=e.target instanceof Element?e.target.closest('.discovery-card'):null;if(!button||!atlas.contains(button))return;
 e.preventDefault();e.stopImmediatePropagation();showDetail(button);
},true);
modal.addEventListener('click',e=>{
 const tab=e.target instanceof Element?e.target.closest('[data-discovery-tab]'):null;
 if(tab&&detail&&!detail.hidden)leaveDetail();
},true);
$('closeMenu')?.addEventListener('click',()=>{if(detail&&!detail.hidden){requestSerial++;detail.hidden=true;detail.removeAttribute('aria-busy');delete detail.dataset.title;setDetailMode(false)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail&&!detail.hidden){e.preventDefault();e.stopImmediatePropagation();leaveDetail()}},true);
})();
