import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataPath=path.join(root,'assets/data/element-sources.json');
const api='https://pt.wikipedia.org/w/api.php';
const headers={'User-Agent':'Ardua/1.0 educational GitHub Pages project (TTamosauskas/Ardua)'};
const shard=Number(process.argv[2]||0),shards=Number(process.argv[3]||1),outDir=path.resolve(root,process.argv[4]||'.element-shard');
if(!Number.isInteger(shard)||!Number.isInteger(shards)||shard<0||shards<1||shard>=shards)throw new Error('Shard inválido');
const sources=JSON.parse(await fs.readFile(dataPath,'utf8'));
const entries=Object.entries(sources).filter((_,i)=>i%shards===shard);
const imageDir=path.join(outDir,'images');await fs.rm(outDir,{recursive:true,force:true});await fs.mkdir(imageDir,{recursive:true});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function params(obj){return new URLSearchParams({origin:'*',format:'json',formatversion:'2',...obj}).toString()}
async function request(url,{binary=false}={}){
 for(let attempt=0;attempt<7;attempt++){
  const r=await fetch(url,{headers});
  if(r.ok)return binary?r:await r.json();
  if((r.status===429||r.status>=500)&&attempt<6){const retry=Number(r.headers.get('retry-after')||0)*1000;await sleep(Math.max(retry,1000*(attempt+1)));continue}
  throw new Error(`${r.status} ${url}`);
 }
}
function resolveTitle(input,result){let title=input;for(let i=0;i<6;i++){const n=result?.query?.normalized?.find(x=>x.from===title);if(n)title=n.to;const r=result?.query?.redirects?.find(x=>x.from===title);if(r){title=r.to;continue}break}return title}
function pageFor(input,result){const title=resolveTitle(input,result);return result?.query?.pages?.find(p=>p.title===title)||null}
function stripHtml(value=''){return String(value).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function extFor(type,url){const t=String(type||'').toLowerCase();if(t.includes('jpeg'))return'jpg';if(t.includes('png'))return'png';if(t.includes('webp'))return'webp';if(t.includes('gif'))return'gif';if(t.includes('svg'))return'svg';const m=new URL(url).pathname.match(/\.([a-z0-9]{2,5})(?:\/|$)/i);return(m?.[1]||'img').toLowerCase().replace('jpeg','jpg')}
function editorialImage(name=''){const n=String(name).toLowerCase();if(!/\.(?:jpe?g|png|webp|gif|svg|tiff?)$/i.test(n))return false;return !/(commons-logo|wiktionary|wikidata|wikipedia-logo|nuvola|crystal.clear|question.book|question.mark|ambox|portal|edit-|merge|redirect|disambig|flag.of|symbol|icon|pictogram|padlock|semi-protection|protection-shackle|featured.article|star.of.life|increase2|decrease2|replace.this.image|magnify-clip)/i.test(n)}
async function fallbackPageImage(title){const parsed=await request(`${api}?${params({action:'parse',redirects:'1',prop:'images',page:title})}`),images=parsed?.parse?.images||[];return images.find(editorialImage)||images.find(x=>/\.(?:jpe?g|png|webp|gif|svg)$/i.test(String(x)))||''}

const titles=entries.map(([,cfg])=>cfg.wikiTitle).join('|');
const pageResult=await request(`${api}?${params({action:'query',redirects:'1',prop:'info|pageprops|pageimages',inprop:'url',piprop:'name',titles})}`);
const pages=new Map();
for(const [sym,cfg] of entries){const page=pageFor(cfg.wikiTitle,pageResult);if(!page||page.missing)throw new Error(`${sym}: artigo ausente (${cfg.wikiTitle})`);if(page.pageprops?.disambiguation!==undefined)throw new Error(`${sym}: título resolve para desambiguação (${page.title})`);if(!page.pageimage){page.pageimage=await fallbackPageImage(page.title||cfg.wikiTitle);if(!page.pageimage)throw new Error(`${sym}: artigo sem imagem editorial utilizável (${page.title})`);console.log(`${sym}: fallback ${page.pageimage}`)}pages.set(sym,page);await sleep(120)}

const fileTitles=entries.map(([sym])=>`File:${pages.get(sym).pageimage}`).join('|');
const fileResult=await request(`${api}?${params({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'600',titles:fileTitles})}`);
const metadata={};
for(const [sym,cfg] of entries){
 const page=pages.get(sym),fileTitle=`File:${page.pageimage}`,filePage=pageFor(fileTitle,fileResult),ii=filePage?.imageinfo?.[0];if(!ii)throw new Error(`${sym}: metadados da imagem ausentes (${fileTitle})`);
 const imageUrl=ii.thumburl||ii.url,response=await request(imageUrl,{binary:true}),ext=extFor(response.headers.get('content-type'),imageUrl),filename=`${sym}.${ext}`;
 await fs.writeFile(path.join(imageDir,filename),Buffer.from(await response.arrayBuffer()));
 const meta=ii.extmetadata||{};
 metadata[sym]={wikiResolvedTitle:page.title,wikiUrl:page.fullurl,imagePath:`assets/images/elements/${filename}`,filename,imageSourceUrl:ii.descriptionurl||ii.url,imageLicense:stripHtml(meta.LicenseShortName?.value||meta.License?.value||''),imageLicenseUrl:meta.LicenseUrl?.value||'',imageArtist:stripHtml(meta.Artist?.value||meta.Credit?.value||'')};
 console.log(`[${shard}/${shards}] ${sym}: ${page.title} -> ${filename}`);await sleep(650);
}
await fs.writeFile(path.join(outDir,'metadata.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(`Shard ${shard}: ${entries.length} elementos concluídos.`);
