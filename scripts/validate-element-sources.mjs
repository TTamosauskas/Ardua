import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataPath=path.join(root,'assets/data/element-sources.json');
const sources=JSON.parse(await fs.readFile(dataPath,'utf8'));

const expectedVideos=Object.freeze({
 H:'6rdmpx39PRk',He:'M6xZZiaLOV4',Li:'LfS10ArXTBA',Be:'qy8JyQShZRA',B:'JzqdHkpXuy4',C:'QuW4_bRHbUk',N:'H8XNdqA18-M',O:'WuG5WTId-IY',F:'vtWp45Eewtw',Ne:'ILkvZKSVRI4',
 Na:'7IT2I3LtlNE',Mg:'FKkWdizutxI',Al:'4AhZ8503WPs',Si:'a2aWO5cL410',P:'LSYLUat03A4',S:'mGMR72X8V-U',Cl:'BXCfBl4rmh0',Ar:'N0Gw6-xMLlo',K:'pPdevJTGAYY',Ca:'V9fuY8_ffFg',
 Sc:'gab_2a7gyLU',Ti:'MpFTQYynrc4',V:'MbCmaQzrZoc',Cr:'9NPjdDS11C4',Mn:'uTVtBuY9Q-0',Fe:'euQUgp5AY-Y',Co:'MWtL3pvGC68',Ni:'AUmoaZn9bek',Cu:'kop1sWzTK-I',Zn:'99wPiMb-k0o',
 Ga:'N6ccRvKKwZQ',Ge:'osrKWVknkgs',As:'yD8Vz-mFHgI',Se:'IHrUtKjcAFE',Br:'Slt3_5upuSs',Kr:'il4OOY7Zseg',Rb:'0XLGopBovoI',Sr:'d5ztPGrsgNQ',Y:'NxbOQ1FhqdQ',Zr:'gNJE2MPktvg',
 Nb:'2ciPAsVTq6c',Mo:'ZRQ3vBGskds',Tc:'ud5c1TVkcnU',Ru:'wl5ZYb0hDTc',Rh:'PPSO5798k2I',Pd:'4ALTGeqmNFM',Ag:'pPd5qAb4J50',Cd:'boRius1DYdQ',In:'TviX7V-ay5I',Sn:'rXZscASelkc',
 Sb:'kcc6qNT3BoU',Te:'5ChFbVu4Mpk',I:'JUBsJLRSM64',Xe:'Ejoct_6pQ74',Cs:'5aD6HwUE2c0',Ba:'9srJdQU3NOo',La:'Q21clW0s0B8',Ce:'frD3126ry8o',Pr:'IL06CzXF3ns',Nd:'PBbl-3_R3mk',
 Pm:'HplP_MY78NQ',Sm:'RBTO5f8U218',Eu:'88YOmg_FUVo',Gd:'YIxjFKBl5eg',Tb:'On5LjH9TQxY',Dy:'8TE3iRXVcmY',Ho:'HQahtzCU0BU',Er:'E-DY_RT4fJ4',Tm:'vS0vhYdOGMc',Yb:'H8XtiaWm5eY',
 Lu:'7wrDfRnRHqI',Hf:'Qb9f5uBKJhg',Ta:'51xFP1Yn3g0',W:'59ph6I0DoQE',Re:'YOmStzA2azw',Os:'AdX-T2Vv68Y',Ir:'cuovE4OQi2g',Pt:'byzaoji_9kk',Au:'7dF0QTzcuac',Hg:'oL0M_6bfzkU',
 Tl:'4SVhSZ-rfLM',Pb:'2ERfPN5JLX8',Bi:'vyIo-c7VmIM',Po:'bbr5yWwsI1o',At:'GP8jJgzEmwE',Rn:'mTuC_LrEfbU',Fr:'hpYxllgfMSg',Ra:'5_I6vj-lXNM',Ac:'rKm0ShaJNFM',Th:'2yZGcr0mpw0',Pa:'bsIMMa7iEKU',U:'B8vVZTvJNGk'
});

const expectedSymbols=Object.keys(expectedVideos),actualSymbols=Object.keys(sources);
if(actualSymbols.length!==expectedSymbols.length)throw new Error(`Catálogo com ${actualSymbols.length} elementos; esperado: ${expectedSymbols.length}`);
for(const sym of expectedSymbols){
 const cfg=sources[sym];
 if(!cfg)throw new Error(`Elemento ausente: ${sym}`);
 if(cfg.periodicVideoId!==expectedVideos[sym])throw new Error(`${sym}: Periodic Videos divergente (${cfg.periodicVideoId})`);
 if(!cfg.wikiTitle||!cfg.wikiResolvedTitle||!cfg.wikiUrl)throw new Error(`${sym}: metadados Wikipedia incompletos`);
 if(!String(cfg.wikiUrl).startsWith('https://pt.wikipedia.org/wiki/'))throw new Error(`${sym}: URL Wikipedia inválida`);
 if(!cfg.imagePath||!String(cfg.imagePath).startsWith('assets/images/elements/'))throw new Error(`${sym}: caminho de imagem local inválido`);
 await fs.access(path.join(root,cfg.imagePath));
}

const canonical={
 Hg:['Mercúrio (elemento químico)','https://pt.wikipedia.org/wiki/Merc%C3%BArio_(elemento_qu%C3%ADmico)'],
 In:['Índio (elemento químico)','https://pt.wikipedia.org/wiki/%C3%8Dndio_(elemento_qu%C3%ADmico)'],
 Ra:['Rádio (elemento químico)','https://pt.wikipedia.org/wiki/R%C3%A1dio_(elemento_qu%C3%ADmico)']
};
for(const [sym,[title,url]] of Object.entries(canonical)){
 const cfg=sources[sym];
 if(cfg.wikiTitle!==title||cfg.wikiResolvedTitle!==title||cfg.wikiUrl!==url)throw new Error(`${sym}: artigo canônico divergente`);
}

console.log(`Element sources OK: ${expectedSymbols.length} elementos, imagens locais e IDs do Periodic Videos validados.`);
