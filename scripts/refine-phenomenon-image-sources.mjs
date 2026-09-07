import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'assets/data/phenomenon-sources.json');
const data=JSON.parse(await fs.readFile(file,'utf8'));

const refinements={
 'rp-process':'Binário de raio X',
 'Waiting point':'Binário de raio X',
 'Kilonova':'GW170817'
};
for(const [title,imageWikiTitle] of Object.entries(refinements)){
 if(!data[title])throw new Error(`Fenômeno ausente: ${title}`);
 data[title].imageWikiTitle=imageWikiTitle;
}
await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log('Fontes visuais refinadas: rp-process, Waiting point e Kilonova.');
