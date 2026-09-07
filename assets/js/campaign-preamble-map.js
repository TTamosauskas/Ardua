/* Ardua — rebuild the campaign preamble as one linear cosmic chronology. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,C=window.ARDUA_CAMPAIGN,A=window.ARDUA_REQUIRED_ATLAS;
const map=document.getElementById('campaignMap'),links=document.getElementById('campaignLinks'),content=document.getElementById('campaignContent');
if(!G||!C||!A||!map||!links||!content)return;

const originals=window.ARDUA_PREAMBLE_ORIGINALS;
if(originals){
 G.sequences.primordialLeft=[...originals.primordialLeft];
 G.sequences.primordialRight=[...originals.primordialRight];
 G.sequences.brown=[...originals.brown];
}

const zone=map.querySelector('.primordial-zone');
if(!zone)return;
const phaseMenu=document.getElementById('phaseMenu');
const titleFor=id=>window.ARDUA_PHASE_NAMES?.[id]||phaseMenu?.querySelector(`.phase-jump[data-phase-id="${id}"] strong`)?.textContent?.trim()||id;
const stateClasses=['locked','revealed','available','completed','current'];
const existing=new Map([...map.querySelectorAll('.phase-node[data-phase]')].map(el=>[el.dataset.phase,el]));
function phaseNode(id){
 let el=existing.get(id);
 if(el)return el;
 el=document.createElement('button');el.type='button';el.className='phase-node locked';el.dataset.phase=id;el.innerHTML=`<strong>${titleFor(id)}</strong>`;existing.set(id,el);return el;
}
function flow(ids,cls=''){
 const el=document.createElement('div');el.className=`cosmos-flow ${cls}`.trim();
 ids.forEach(id=>el.appendChild(phaseNode(id)));return el;
}
function chapter(title){const el=document.createElement('div');el.className='epoch-label preamble-chapter';el.innerHTML=`<strong>${title}</strong>`;return el}
function universeBanner(){
 const el=document.createElement('section');el.className='generation-banner generation-primordial primordial-generation-banner';el.dataset.generationBanner='primordial';
 el.innerHTML='<span>UNIVERSO PRIMORDIAL</span><strong>Universo Primordial</strong><small>Do plasma quente aos primeiros átomos, gases e objetos subestelares.</small>';return el;
}

const stellar=zone.querySelector('.branch-cluster[data-branch-group="stellar"]');
const stellarAfter=zone.querySelector('.branch-after[data-after-group="stellar"]');
const birth=zone.querySelector('[data-junction="stellar-birth"]');
const birthImage=zone.querySelector('.birth-bg');
if(!stellar||!stellarAfter||!birth)return;

// Brown dwarf leaves the mass fork and becomes part of the linear prologue.
stellar.querySelector('.branch-choice[data-branch-open="sub"]')?.remove();
stellar.querySelector('.branch-panel[data-branch-panel="sub"]')?.remove();

const firstGeneration=phaseNode('first_generation_formation');
firstGeneration.classList.add('generation-banner','generation-first','generation-phase-banner');
firstGeneration.dataset.generationBanner='first';
firstGeneration.innerHTML='<span>1ª GERAÇÃO</span><strong>Primeira Geração Estelar</strong><small>As primeiras estrelas verdadeiras passam a nascer em diferentes faixas de massa.</small>';

const primordialIds=['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li'];
const atomicIds=['atomic_he','atomic_h','atomic_li'];
const gasIds=['first_atomic_bonds','first_nebulae','brown_formation','brown'];

zone.replaceChildren(
 universeBanner(),
 chapter('PLASMA PRIMORDIAL'),
 flow(primordialIds,'primordial-linear-flow'),
 chapter('PRIMEIROS ÁTOMOS'),
 flow(atomicIds,'atomic-linear-flow'),
 chapter('PRIMEIROS GASES'),
 flow(gasIds,'primordial-gas-flow'),
 firstGeneration,
 birth,
 ...(birthImage?[birthImage]:[]),
 stellar,
 stellarAfter
);

// Keep the requested display label independent from the engine's internal phase title.
const proto=phaseNode('brown_formation')?.querySelector('strong');if(proto)proto.textContent='Protoestrelas';

function visible(el){return !!el&&el.getClientRects().length>0}
function center(el,edge='center'){
 if(!visible(el))return null;const r=el.getBoundingClientRect(),c=content.getBoundingClientRect();let y=r.top-c.top+r.height/2;if(edge==='top')y=r.top-c.top;if(edge==='bottom')y=r.bottom-c.top;return{x:r.left-c.left+r.width/2,y};
}
function add(from,to,cls='primordial',bend=.5){
 const a=center(from,'bottom'),b=center(to,'top');if(!a||!b)return;const dy=b.y-a.y,mid=a.y+dy*bend,p=document.createElementNS('http://www.w3.org/2000/svg','path');
 p.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);p.setAttribute('class',`campaign-link preamble-link ${cls}`);links.appendChild(p);
}
function node(id){return [...map.querySelectorAll(`.phase-node[data-phase="${id}"]`)].find(visible)||null}
let drawing=false,timer=0;
function drawPreambleLinks(){
 if(drawing)return;drawing=true;clearTimeout(timer);timer=0;
 links.querySelectorAll('.preamble-link').forEach(p=>p.remove());
 if(map.classList.contains('show')&&map.classList.contains('trail-revealed')){
  // Replace legacy shortcuts with the new chronology.
  links.querySelectorAll('.campaign-link.root,.campaign-link.birth').forEach(p=>p.remove());
  const banner=map.querySelector('.primordial-generation-banner');
  add(map.querySelector('.singularity-map'),banner,'root',.48);add(banner,node('primordial_d'),'primordial',.45);
  for(let i=1;i<primordialIds.length;i++)add(node(primordialIds[i-1]),node(primordialIds[i]),'primordial');
  add(node('first_nebulae'),node('brown_formation'),'primordial');
  add(node('brown_formation'),node('brown'),'sub');
  add(node('brown'),firstGeneration,'birth',.52);add(firstGeneration,birth,'birth',.48);
 }
 drawing=false;
}
function schedule(){clearTimeout(timer);timer=setTimeout(drawPreambleLinks,35)}
new MutationObserver(muts=>{
 if(drawing)return;
 const baseChange=muts.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&!n.classList?.contains('preamble-link')));
 if(baseChange)schedule();
}).observe(links,{childList:true});
new MutationObserver(schedule).observe(map,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
window.addEventListener('resize',schedule);
window.addEventListener('ardua:campaign-progress',schedule);
schedule();
})();
