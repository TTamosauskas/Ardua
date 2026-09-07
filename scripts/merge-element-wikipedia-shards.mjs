import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const shardsDir=path.resolve(root,process.argv[2]||'.element-shards');
const dataPath=path.join(root,'assets/data/element-sources.json'),imageDir=path.join(root,'assets/images/elements');
const sources=JSON.parse(await fs.readFile(dataPath,'utf8')),updates={};
await fs.rm(imageDir,{recursive:true,force:true});await fs.mkdir(imageDir,{recursive:true});

const dirs=(await fs.readdir(shardsDir,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>path.join(shardsDir,x.name));
for(const dir of dirs){
 const metaPath=path.join(dir,'metadata.json');
 let meta={};try{meta=JSON.parse(await fs.readFile(metaPath,'utf8'))}catch{continue}
 for(const [sym,row] of Object.entries(meta)){
  if(updates[sym])throw new Error(`Elemento duplicado nos shards: ${sym}`);
  updates[sym]=row;
  await fs.copyFile(path.join(dir,'images',row.filename),path.join(imageDir,row.filename));
 }
}
const expected=Object.keys(sources),received=Object.keys(updates),missing=expected.filter(x=>!updates[x]);
if(received.length!==expected.length||missing.length)throw new Error(`Coleção incompleta: ${received.length}/${expected.length}; faltando ${missing.join(', ')}`);
for(const [sym,row] of Object.entries(updates)){const {filename,...persist}=row;Object.assign(sources[sym],persist)}
await fs.writeFile(dataPath,JSON.stringify(sources,null,2)+'\n');

const attribution=['# Imagens dos elementos — créditos','', 'As imagens desta pasta são cópias locais das imagens principais ou, quando o artigo carece de `pageimage`, da primeira imagem editorial útil do artigo correspondente da Wikipédia/Wikimedia. Licenças e créditos abaixo foram obtidos dos metadados do arquivo no momento da sincronização.','', '| Símbolo | Artigo | Fonte da imagem | Licença | Crédito |','|---|---|---|---|---|'];
const esc=s=>String(s||'').replace(/\|/g,'\\|').replace(/\n/g,' ');
for(const [sym,cfg] of Object.entries(sources))attribution.push(`| ${sym} | [${esc(cfg.wikiResolvedTitle)}](${cfg.wikiUrl}) | [arquivo](${cfg.imageSourceUrl}) | ${cfg.imageLicenseUrl?`[${esc(cfg.imageLicense||'licença')}](${cfg.imageLicenseUrl})`:esc(cfg.imageLicense)} | ${esc(cfg.imageArtist)} |`);
await fs.writeFile(path.join(imageDir,'ATTRIBUTION.md'),attribution.join('\n')+'\n');
console.log(`Coleção reunida: ${received.length} imagens + atribuições.`);
