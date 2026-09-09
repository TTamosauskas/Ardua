import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataPath=path.join(root,'assets/data/phenomenon-sources.json');
const discoveriesPath=path.join(root,'assets/js/campaign-discoveries.js');
const uiPath=path.join(root,'assets/js/campaign-discoveries-phenomena.js');
const sources=JSON.parse(await fs.readFile(dataPath,'utf8'));
const discoveries=await fs.readFile(discoveriesPath,'utf8');
const ui=await fs.readFile(uiPath,'utf8');
const entries=Object.entries(sources);
if(entries.length!==55)throw new Error(`Esperados 55 fenômenos, encontrados ${entries.length}`);
const slugs=new Set();
for(const [title,cfg] of entries){
 if(!cfg.wikiTitle)throw new Error(`${title}: wikiTitle ausente`);
 if(!cfg.slug)throw new Error(`${title}: slug ausente`);
 if(slugs.has(cfg.slug))throw new Error(`${title}: slug duplicado ${cfg.slug}`);slugs.add(cfg.slug);
 if(!discoveries.includes(`title:'${title}'`))throw new Error(`${title}: ausente do catálogo PHENOMENA`);
 if(cfg.wikiResolvedTitle){
  if(!cfg.wikiUrl)throw new Error(`${title}: wikiUrl ausente`);
  if(!cfg.imagePath)throw new Error(`${title}: imagePath ausente`);
  const full=path.join(root,cfg.imagePath);try{await fs.access(full)}catch{throw new Error(`${title}: imagem local ausente ${cfg.imagePath}`)}
  if(!cfg.imageSourceUrl)throw new Error(`${title}: fonte da imagem ausente`);
 }
}
if(!ui.includes("assets/data/phenomenon-sources.json"))throw new Error('UI de Fenômenos sem catálogo local de fontes');
if(!ui.includes('cfg.imagePath'))throw new Error('UI de Fenômenos sem prioridade para imagem local');
console.log(`Phenomenon sources OK: ${entries.length} fenômenos catalogados${entries.every(([,cfg])=>cfg.imagePath)?' e com imagens locais':''}.`);
