import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'assets/js/campaign-discoveries-phenomena.js');
let text=await fs.readFile(file,'utf8');

if(!text.includes("const PHENOMENON_SOURCES_URL=")){
 const anchor="const WIKI_API='https://pt.wikipedia.org/w/api.php';\nconst cache=new Map();";
 const replacement="const WIKI_API='https://pt.wikipedia.org/w/api.php';\nconst PHENOMENON_SOURCES_URL=new URL('assets/data/phenomenon-sources.json',document.baseURI).href;\nlet phenomenonSourcesPromise=null;\nfunction phenomenonSources(){\n if(phenomenonSourcesPromise)return phenomenonSourcesPromise;\n phenomenonSourcesPromise=fetch(PHENOMENON_SOURCES_URL,{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('phenomenon sources unavailable'))).catch(()=>({}));\n return phenomenonSourcesPromise;\n}\nconst cache=new Map();";
 if(!text.includes(anchor))throw new Error('Âncora de catálogo de fenômenos ausente');
 text=text.replace(anchor,replacement);
}
const oldRequest="const requested=WIKI_ALIASES[title]||title,resolved=await resolveTitle(requested);";
const newRequest="const sources=await phenomenonSources(),cfg=sources[title]||{},requested=cfg.wikiTitle||WIKI_ALIASES[title]||title,resolved=await resolveTitle(requested);";
if(text.includes(oldRequest))text=text.replace(oldRequest,newRequest);
if(!text.includes(newRequest))throw new Error('Falha ao ligar catálogo local em wikiData');

const oldReturn="url:page.fullurl||wikiFallbackUrl(resolved),\n   image:normalizeImage(page.thumbnail?.source)||firstArticleImage(html),";
const newReturn="url:cfg.wikiUrl||page.fullurl||wikiFallbackUrl(resolved),\n   image:cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:(normalizeImage(page.thumbnail?.source)||firstArticleImage(html)),";
if(text.includes(oldReturn))text=text.replace(oldReturn,newReturn);
if(!text.includes(newReturn))throw new Error('Falha ao priorizar imagem local');

const oldCatch="})().catch(()=>({title,url:wikiFallbackUrl(WIKI_ALIASES[title]||title),image:'',intro:'',glyph}));";
const newCatch="})().catch(async()=>{const sources=await phenomenonSources(),cfg=sources[title]||{};return{title,url:cfg.wikiUrl||wikiFallbackUrl(cfg.wikiTitle||WIKI_ALIASES[title]||title),image:cfg.imagePath?new URL(cfg.imagePath,document.baseURI).href:'',intro:'',glyph}});";
if(text.includes(oldCatch))text=text.replace(oldCatch,newCatch);
if(!text.includes(newCatch))throw new Error('Falha ao criar fallback local');

await fs.writeFile(file,text);
console.log('Interface de Fenômenos ligada ao catálogo local.');
