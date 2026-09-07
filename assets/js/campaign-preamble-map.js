/* Ardua — rebuild the campaign preamble as one linear cosmic chronology. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN,A=window.ARDUA_REQUIRED_ATLAS;
const map=document.getElementById('campaignMap'),baseLinks=document.getElementById('campaignLinks'),content=document.getElementById('campaignContent');
if(!G||!C||!A||!map||!baseLinks||!content)return;

const originals=window.ARDUA_PREAMBLE_ORIGINALS;
if(originals){
 G.sequences.primordialLeft=[...originals.primordialLeft];
 G.sequences.primordialRight=[...originals.primordialRight];
 G.sequences.brown=[...originals.brown];
}

const zone=map.querySelector('.primordial-zone');
if(!zone)return;
const phaseMenu=document.getElementById('phaseMenu');
const PREAMBLE_TITLES=Object.freeze({
 primordial_d:'Forme Deutério',
 primordial_t:'Forme Trítio',
 primordial_he3:'Forme Hélio-3',
 primordial_he3d:'Hélio-4 via Hélio-3',
 primordial_td:'Hélio-4 via Trítio',
 primordial_li:'Forme Lítio-7',
 atomic_he:'Forme átomos de Hélio',
 atomic_h:'Forme átomos de Hidrogênio',
 atomic_li:'Forme átomos de Lítio',
 first_atomic_bonds:'Primeiras Ligações Atômicas',
 first_nebulae:'Primeiras Nebulosas',
 brown_formation:'Protoestrelas',
 brown:'Anã Marrom'
});
const primordialIds=['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li'];
const atomicIds=['atomic_he','atomic_h','atomic_li'];
const gasIds=['first_atomic_bonds','first_nebulae','brown_formation','brown'];
const linearIds=[...primordialIds,...atomicIds,...gasIds];
const titleFor=id=>PREAMBLE_TITLES[id]||window.ARDUA_PHASE_NAMES?.[id]||phaseMenu?.querySelector(`.phase-jump[data-phase-id="${id}"] strong`)?.textContent?.trim()||id;
const existing=new Map([...map.querySelectorAll('.phase-node[data-phase]')].map(el=>[el.dataset.phase,el]));
function phaseNode(id){
 let el=existing.get(id);
 if(!el){el=document.createElement('button');el.type='button';el.className='phase-node locked';el.dataset.phase=id;existing.set(id,el)}
 let strong=el.querySelector(':scope > strong');if(!strong){strong=document.createElement('strong');el.appendChild(strong)}
 strong.textContent=titleFor(id);
 return el;
}
function flow(ids,cls=''){
 const el=document.createElement('div');el.className=`cosmos-flow ${cls}`.trim();el.dataset.phaseGroup=ids.join(',');
 ids.forEach(id=>el.appendChild(phaseNode(id)));return el;
}
function chapter(title,ids){const el=document.createElement('div');el.className='epoch-label preamble-chapter';el.dataset.phaseGroup=ids.join(',');el.innerHTML=`<strong>${title}</strong>`;return el}
function universeBanner(){
 const el=document.createElement('section');el.className='generation-banner generation-primordial primordial-generation-banner';el.dataset.generationBanner='primordial';
 el.innerHTML='<strong>Universo Primordial</strong><small>Do plasma quente aos primeiros átomos, gases e objetos subestelares.</small>';return el;
}

const stellar=zone.querySelector('.branch-cluster[data-branch-group="stellar"]');
const stellarAfter=zone.querySelector('.branch-after[data-after-group="stellar"]');
const birth=zone.querySelector('[data-junction="stellar-birth"]');
const birthImage=zone.querySelector('.birth-bg');
if(!stellar||!stellarAfter||!birth)return;

stellar.querySelector('.branch-choice[data-branch-open="sub"]')?.remove();
stellar.querySelector('.branch-panel[data-branch-panel="sub"]')?.remove();

const firstGeneration=phaseNode('first_generation_formation');
firstGeneration.classList.add('generation-banner','generation-first','generation-phase-banner');
firstGeneration.dataset.generationBanner='first';
firstGeneration.innerHTML='<span>1ª GERAÇÃO</span><strong>Primeira Geração Estelar</strong><small>As primeiras estrelas verdadeiras passam a nascer em diferentes faixas de massa.</small>';

zone.replaceChildren(
 universeBanner(),
 chapter('PRIMEIROS MINUTOS',primordialIds),
 flow(primordialIds,'primordial-linear-flow'),
 chapter('PRIMEIROS ÁTOMOS',atomicIds),
 flow(atomicIds,'atomic-linear-flow'),
 chapter('PRIMEIROS GASES',gasIds),
 flow(gasIds,'primordial-gas-flow'),
 firstGeneration,
 birth,
 ...(birthImage?[birthImage]:[]),
 stellar,
 stellarAfter
);

const layer=document.createElementNS('http://www.w3.org/2000/svg','svg');
layer.id='campaignPreambleLinks';layer.classList.add('campaign-links','campaign-preamble-links');layer.setAttribute('aria-hidden','true');layer.dataset.guideLayer='preamble';
content.appendChild(layer);
function visible(el){return !!el&&el.getClientRects().length>0}
function center(el,edge='center'){
 if(!visible(el))return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x:r.left-c.left+r.width/2,y};
}
function add(from,to,cls='primordial',bend=.5){
 const a=center(from,'bottom'),b=center(to,'top');if(!a||!b)return;const dy=b.y-a.y,mid=a.y+dy*bend,p=document.createElementNS('http://www.w3.org/2000/svg','path');
 p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);p.setAttribute('class',`campaign-link preamble-link ${cls}`);layer.appendChild(p);
}
function node(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(visible)||null}
let frame=0;
function drawPreambleLinks(){
 frame=0;layer.innerHTML='';
 const w=content.clientWidth,h=content.scrollHeight;layer.setAttribute('viewBox',`0 0 ${w} ${h}`);layer.setAttribute('width',w);layer.setAttribute('height',h);
 if(!map.classList.contains('show')||!map.classList.contains('trail-revealed'))return;
 const banner=map.querySelector('.primordial-generation-banner');
 add(map.querySelector('.singularity-map'),banner,'preamble-red',.48);
 add(banner,node(linearIds[0]),'preamble-red',.45);
 for(let i=1;i<linearIds.length;i++){
  const cls=i<=primordialIds.length-1?'preamble-red':'preamble-orange';
  add(node(linearIds[i-1]),node(linearIds[i]),cls);
 }
 add(node('brown'),firstGeneration,'preamble-orange',.52);
 add(firstGeneration,birth,'birth',.48);
}
function schedule(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>requestAnimationFrame(drawPreambleLinks))}
new MutationObserver(schedule).observe(baseLinks,{childList:true});
new MutationObserver(schedule).observe(map,{attributes:true,attributeFilter:['class']});
new MutationObserver(schedule).observe(zone,{childList:true,subtree:true});
if(window.ResizeObserver)new ResizeObserver(schedule).observe(content);
window.addEventListener('resize',schedule);
window.addEventListener('load',schedule);
window.addEventListener('ardua:campaign-progress',schedule);
map.addEventListener('transitionend',schedule);
schedule();
})();
