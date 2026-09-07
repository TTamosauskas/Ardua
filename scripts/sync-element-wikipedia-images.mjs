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

function params(obj){return new URLSearchParams({origin:'*',format:'json',formatversion:'2',...obj}).toString()}
async function json(url){const r=await fetch(url,{headers});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json()}
function stripHtml(value=''){return String(value).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function extFor(type,url){
 const t=String(type||'').toLowerCase();
 if(t.includes('jpeg'))return'jpg';if(t.includes('png'))return'png';if(t.includes('webp'))return'webp';if(t.includes('gif'))return'gif';if(t.includes('svg'))return'svg';
 const m=new URL(url).pathname.match(/\.([a-z0-9]{2,5})(?:\/|$)/i);return(m?.[1]||'img').toLowerCase().replace('jpeg','jpg');
}
async function removeOld(sym){for(const name of await fs.readdir(imageDir))if(name.startsWith(`${sym}.`))await fs.rm(path.join(imageDir,name),{force:true})}

async function syncOne(sym,cfg){
 const pageQuery=await json(`${api}?${params({action:'query',redirects:'1',prop:'info|pageprops|pageimages',inprop:'url',piprop:'name|thumbnail',pithumbsize:'1000',titles:cfg.wikiTitle})}`);
 const page=pageQuery?.query?.pages?.[0];
 if(!page||page.missing)throw new Error(`${sym}: artigo ausente (${cfg.wikiTitle})`);
 if(page.pageprops?.disambiguation!==undefined)throw new Error(`${sym}: título resolve para desambiguação (${page.title})`);
 if(!page.pageimage)throw new Error(`${sym}: artigo sem imagem principal (${page.title})`);
 const fileTitle=`File:${page.pageimage}`;
 const fileQuery=await json(`${api}?${params({action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1000',titles:fileTitle})}`);
 const filePage=fileQuery?.query?.pages?.[0],ii=filePage?.imageinfo?.[0];
 if(!ii)throw new Error(`${sym}: metadados da imagem ausentes (${fileTitle})`);
 const imageUrl=ii.thumburl||ii.url;
 const response=await fetch(imageUrl,{headers});if(!response.ok)throw new Error(`${sym}: imagem HTTP ${response.status}`);
 const ext=extFor(response.headers.get('content-type'),imageUrl),filename=`${sym}.${ext}`;
 await removeOld(sym);await fs.writeFile(path.join(imageDir,filename),Buffer.from(await response.arrayBuffer()));
 const meta=ii.extmetadata||{};
 Object.assign(cfg,{
  wikiResolvedTitle:page.title,
  wikiUrl:page.fullurl,
  imagePath:`assets/images/elements/${filename}`,
  imageSourceUrl:ii.descriptionurl||ii.url,
  imageLicense:stripHtml(meta.LicenseShortName?.value||meta.License?.value||''),
  imageLicenseUrl:meta.LicenseUrl?.value||'',
  imageArtist:stripHtml(meta.Artist?.value||meta.Credit?.value||'')
 });
 console.log(`${sym}: ${page.title} -> ${filename}`);
}

const entries=Object.entries(sources),failures=[];
let cursor=0;
async function worker(){while(cursor<entries.length){const [sym,cfg]=entries[cursor++];try{await syncOne(sym,cfg)}catch(error){failures.push(String(error?.message||error));console.error(error)}}}
await Promise.all(Array.from({length:6},worker));
if(failures.length)throw new Error(`Falhas na sincronização:\n${failures.join('\n')}`);

await fs.writeFile(dataPath,JSON.stringify(sources,null,2)+'\n');
const attribution=['# Imagens dos elementos — créditos','', 'As imagens desta pasta são cópias locais das imagens principais dos artigos correspondentes da Wikipédia/Wikimedia. Licenças e créditos abaixo foram obtidos dos metadados do arquivo no momento da sincronização.','', '| Símbolo | Artigo | Fonte da imagem | Licença | Crédito |','|---|---|---|---|---|'];
for(const [sym,cfg] of entries){
 const esc=s=>String(s||'').replace(/\|/g,'\\|').replace(/\n/g,' ');
 attribution.push(`| ${sym} | [${esc(cfg.wikiResolvedTitle)}](${cfg.wikiUrl}) | [arquivo](${cfg.imageSourceUrl}) | ${cfg.imageLicenseUrl?`[${esc(cfg.imageLicense||'licença')}](${cfg.imageLicenseUrl})`:esc(cfg.imageLicense)} | ${esc(cfg.imageArtist)} |`);
}
await fs.writeFile(path.join(imageDir,'ATTRIBUTION.md'),attribution.join('\n')+'\n');
