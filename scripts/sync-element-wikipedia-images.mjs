import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataPath=path.join(root,'assets/data/element-sources.json');
const imageDir=path.join(root,'assets/images/elements');
const api='https://pt.wikipedia.org/w/api.php';
const headers={'User-Agent':'Ardua/1.0 educational GitHub Pages project (TTamosauskas/Ardua)'};
const sources=JSON.parse(await fs.readFile(dataPath,'utf8'));
await fs.mkdir(imageDir,{recursive:true});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function params(obj){return new URLSearchParams({origin:'*',format:'json',formatversion:'2',...obj}).toString()}
async function request(url,{binary=false}={}){
 for(let attempt=0;attempt<7;attempt++){
  const r=await fetch(url,{headers});
  if(r.ok)return binary?r:await r.json();
  if((r.status===429||r.status>=500)&&attempt<6){const retry=Number(r.headers.get('retry-after')||0)*1000;await sleep(Math.max(retry,700*(attempt+1)));continue}
  throw new Error(`${r.status} ${url}`);
 }
}
function chunks(items,size=45){const out=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out}
function resolveTitle(input,result){
 let title=input;
 for(let i=0;i<6;i++){
  const normalized=result?.query?.normalized?.find(x=>x.from===title);if(normalized)title=normalized.to;
  const redirect=result?.query?.redirects?.find(x=>x.from===title);if(redirect){title=redirect.to;continue}
  break;
 }
 return title;
}
function pageFor(input,result){const title=resolveTitle(input,result);return result?.query?.pages?.find(p=>p.title===title)||null}
function stripHtml(value=''){return String(value).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function extFor(type,url){
 const t=String(type||'').toLowerCase();
 if(t.includes('jpeg'))return'jpg';if(t.includes('png'))return'png';if(t.includes('webp'))return'webp';if(t.includes('gif'))return'gif';if(t.includes('svg'))return'svg';
 const m=new URL(url).pathname.match(/\.([a-z0-9]{2,5})(?:\/|$)/i);return(m?.[1]||'img').toLowerCase().replace('jpeg','jpg');
}
async function removeOld(sym){for(const name of await fs.readdir(imageDir))if(name.startsWith(`${sym}.`))await fs.rm(path.join(imageDir,name),{force:true})}

const entries=Object.entries(sources),pages=new Map();
for(const batch of chunks(entries)){
 const titles=batch.map(([,cfg])=>cfg.wikiTitle).join('|');
 const result=await request(`${api}?${params({action:'query',redirects:'1',prop:'info|pageprops|pageimages',inprop:'url',piprop:'name',titles})}`);
 for(const [sym,cfg] of batch){
  const page=pageFor(cfg.wikiTitle,result);
  if(!page||page.missing)throw new Error(`${sym}: artigo ausente (${cfg.wikiTitle})`);
  if(page.pageprops?.disambiguation!==undefined)throw new Error(`${sym}: título resolve para desambiguação (${page.title})`);
  if(!page.pageimage)throw new Error(`${sym}: artigo sem imagem principal (${page.title})`);
  pages.set(sym,page);cfg.wikiResolvedTitle=page.title;cfg.wikiUrl=page.fullurl;
 }
}

const imageInfo=new Map();
for(const batch of chunks(entries)){
 const titles=batch.map(([sym])=>`File:${pages.get(sym).pageimage}`).join('|');
 const result=await request(`${api}?${params({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1000',titles})}`);
 for(const [sym] of batch){
  const fileTitle=`File:${pages.get(sym).pageimage}`,filePage=pageFor(fileTitle,result),ii=filePage?.imageinfo?.[0];
  if(!ii)throw new Error(`${sym}: metadados da imagem ausentes (${fileTitle})`);
  imageInfo.set(sym,ii);
 }
}

let cursor=0;const failures=[];
async function worker(){
 while(cursor<entries.length){
  const [sym,cfg]=entries[cursor++],ii=imageInfo.get(sym),imageUrl=ii.thumburl||ii.url;
  try{
   const response=await request(imageUrl,{binary:true}),ext=extFor(response.headers.get('content-type'),imageUrl),filename=`${sym}.${ext}`;
   await removeOld(sym);await fs.writeFile(path.join(imageDir,filename),Buffer.from(await response.arrayBuffer()));
   const meta=ii.extmetadata||{};
   Object.assign(cfg,{
    imagePath:`assets/images/elements/${filename}`,
    imageSourceUrl:ii.descriptionurl||ii.url,
    imageLicense:stripHtml(meta.LicenseShortName?.value||meta.License?.value||''),
    imageLicenseUrl:meta.LicenseUrl?.value||'',
    imageArtist:stripHtml(meta.Artist?.value||meta.Credit?.value||'')
   });
   console.log(`${sym}: ${cfg.wikiResolvedTitle} -> ${filename}`);
  }catch(error){failures.push(`${sym}: ${error?.message||error}`);console.error(error)}
 }
}
await Promise.all(Array.from({length:3},worker));
if(failures.length)throw new Error(`Falhas na sincronização:\n${failures.join('\n')}`);

await fs.writeFile(dataPath,JSON.stringify(sources,null,2)+'\n');
const attribution=['# Imagens dos elementos — créditos','', 'As imagens desta pasta são cópias locais das imagens principais dos artigos correspondentes da Wikipédia/Wikimedia. Licenças e créditos abaixo foram obtidos dos metadados do arquivo no momento da sincronização.','', '| Símbolo | Artigo | Fonte da imagem | Licença | Crédito |','|---|---|---|---|---|'];
for(const [sym,cfg] of entries){
 const esc=s=>String(s||'').replace(/\|/g,'\\|').replace(/\n/g,' ');
 attribution.push(`| ${sym} | [${esc(cfg.wikiResolvedTitle)}](${cfg.wikiUrl}) | [arquivo](${cfg.imageSourceUrl}) | ${cfg.imageLicenseUrl?`[${esc(cfg.imageLicense||'licença')}](${cfg.imageLicenseUrl})`:esc(cfg.imageLicense)} | ${esc(cfg.imageArtist)} |`);
}
await fs.writeFile(path.join(imageDir,'ATTRIBUTION.md'),attribution.join('\n')+'\n');
