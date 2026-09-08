from pathlib import Path
import json

ROOT=Path('.')

def read(path): return (ROOT/path).read_text(encoding='utf-8')
def write(path,text): (ROOT/path).write_text(text,encoding='utf-8')
def require(cond,msg):
    if not cond: raise SystemExit(msg)

def replace_once(path,old,new,label):
    s=read(path)
    if new in s: return
    require(old in s,f'{label}: anchor missing in {path}')
    write(path,s.replace(old,new,1))

def replace_between(path,start_marker,end_marker,new_block,label):
    s=read(path);a=s.find(start_marker);require(a>=0,f'{label}: start missing in {path}')
    b=s.find(end_marker,a+len(start_marker));require(b>=0,f'{label}: end missing in {path}')
    write(path,s[:a]+new_block+s[b:])

# ---------------------------------------------------------------------------
# Engine: continuity population, tutorial gates, solar-wind animation.
# ---------------------------------------------------------------------------
p='assets/js/ardua.js'; s=read(p)

# Phase metadata reflects the continuity population used by the custom fillers.
s=s.replace("id:'solar_wind',branch:'Coroa estelar · plasma e escape',title:'Vento Solar',meta:'H + e⁻ → p⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:0,ionizationSpecies:['H']",
            "id:'solar_wind',branch:'Coroa estelar · plasma e escape',title:'Vento Solar',meta:'H + e⁻ → p⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:28,pool:['H','H','H','H','H','He'],ionizationSpecies:['H']")
s=s.replace("id:'stellar_ionization',branch:'Coroa estelar · ionização',title:'Ionização Estelar',meta:'Átomo + e⁻ → Íon⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:0,ionizationSpecies:['H','He','Li']",
            "id:'stellar_ionization',branch:'Coroa estelar · ionização',title:'Ionização Estelar',meta:'Átomo + e⁻ → Íon⁺ + 2e⁻',new:'H',mode:'stellarIonization',target:3,visual:'yellowDwarf',fill:28,pool:['H','H','H','H','H','He'],ionizationSpecies:['H','He','Li']")
s=s.replace("id:'stellar_recombination',branch:'Coroa estelar · recombinação',title:'Recombinação Estelar',meta:'Íon⁺ + e⁻ → Átomo + γ',new:'H',mode:'stellarRecombination',target:3,visual:'yellowDwarf',fill:0,recombinationSpecies:['H','He','Li']",
            "id:'stellar_recombination',branch:'Coroa estelar · recombinação',title:'Recombinação Estelar',meta:'Íon⁺ + e⁻ → Átomo + γ',new:'H',mode:'stellarRecombination',target:3,visual:'yellowDwarf',fill:28,pool:['H','H','H','H','H','He'],recombinationSpecies:['H','He','Li']")
s=s.replace("id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade',title:'Barreira de Coulomb',meta:'³He + ³He → ⁴He + 2p',new:'He',mode:'fusion',target:3,visual:'redGiant',fill:10,pool:['H']",
            "id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade',title:'Barreira de Coulomb',meta:'³He + ³He → ⁴He + 2p',new:'He',mode:'fusion',target:3,visual:'redGiant',fill:28,pool:['H','H','H','H','H','He']")

# Add two tutorial texts to the same event-tooltip system used by Coulomb.
if "solarWind:{title:'VENTO SOLAR'" not in s:
    anchor=" coulomb:{title:'BARREIRA DE COULOMB',text:'Aproxime os átomos do núcleo estelar para diminuir a resistência.'},"
    require(anchor in s,'PRODUCT_LESSONS coulomb anchor missing')
    lessons=""" solarWind:{title:'VENTO SOLAR',text:'A coroa estelar é um plasma extremamente quente. Quando partículas desse plasma ganham energia suficiente, elas podem escapar continuamente para o espaço como vento solar.'},
 stellarIonization:{title:'IONIZAÇÃO',text:'Uma colisão com um elétron suficientemente energético pode remover um elétron ligado de um átomo. O átomo torna-se um íon positivo e ficam dois elétrons livres: A + e⁻ → A⁺ + 2e⁻.'},
"""
    s=s.replace(anchor,lessons+anchor,1)

# Keep particle drift restart compatible with the new tooltip lessons.
s=s.replace("if((isPrimordial()&&phase().mode!=='opening')||protonCaptureAvailable(phase()))startPrimordialDrift();",
            "if((isPrimordial()&&phase().mode!=='opening')||protonCaptureAvailable(phase())||stellarAtomicMode(phase()))startPrimordialDrift();")

# Replace the atomic phase population/transfer block.
a=s.find('function stellarAtomicSnapshot(targetId)');b=s.find('function stellarAtomicSelectedElectron()',a)
require(a>=0 and b>a,'stellar atomic block anchors missing')
atomic_block=r"""function stellarAtomicSnapshot(targetId){
 const size=starSize();return{to:targetId,particles:snapshotPrimordialParticles(),pieces:[...state.pieces.values()].filter(p=>!p.free&&p.cell!==null&&p.cell!==undefined).map(p=>({sym:p.sym,cell:p.cell,matterState:p.matterState||'nucleus',boundElectrons:Number(p.boundElectrons||0),massNumber:p.massNumber??E[p.sym]?.mass??null,lineage:normalizeMatterLineage(p.lineage)}))}
}
function stellarAtomicTransferTarget(s=phase()){return !!s&&(stellarAtomicMode(s)||s.id==='coulomb_intro')}
function stellarAtomicOpenCells(){return activeCells().filter(cell=>state.board[cell]===null).sort((a,b)=>(coords[b]?.ring||0)-(coords[a]?.ring||0)||a-b)}
function placeNeutralStellarAtom(sym){const cell=stellarAtomicOpenCells()[0];if(cell===undefined)return null;return createPiece(sym,cell,false,{matterState:'atom',boundElectrons:Number(E[sym]?.n||0),massNumber:primordialMassForSym(sym)})}
function placePositiveStellarIon(sym){const cell=stellarAtomicOpenCells()[0];if(cell===undefined)return null;return createPiece(sym,cell,false,{matterState:'atom',boundElectrons:Math.max(0,Number(E[sym]?.n||0)-1),massNumber:primordialMassForSym(sym)})}
function stellarGridPopulation(){let n=0;state.pieces.forEach(p=>{if(!p.free&&p.cell!==null&&p.cell!==undefined)n++});return n}
const STELLAR_CONTINUITY_POPULATION=28;
const STELLAR_CONTINUITY_POOL=Object.freeze(['H','H','H','H','H','He']);
function fillYellowAtomicPopulation(target=STELLAR_CONTINUITY_POPULATION,required=[]){
 for(const sym of required){if([...state.pieces.values()].some(p=>neutralStellarAtom(p)&&p.sym===sym))continue;placeNeutralStellarAtom(sym)}
 let i=0;while(stellarGridPopulation()<target){const cell=stellarAtomicOpenCells()[0];if(cell===undefined)break;placeNeutralStellarAtom(STELLAR_CONTINUITY_POOL[i++%STELLAR_CONTINUITY_POOL.length])}
}
function restoreStellarAtomicTransfer(transfer){
 if(!transfer)return false;for(const item of transfer.pieces||[]){if(!Number.isInteger(item.cell)||state.board[item.cell]!==null)continue;createPiece(item.sym,item.cell,false,{matterState:item.matterState||'atom',boundElectrons:Number(item.boundElectrons||0),massNumber:item.massNumber,lineage:item.lineage})}restorePrimordialParticles(transfer.particles||[]);return true
}
function fillStellarAtomicStage(s=phase()){
 const transfer=state.stellarAtomicTransfer?.to===s.id?state.stellarAtomicTransfer:null;state.stellarAtomicTransfer=null;
 if(transfer)restoreStellarAtomicTransfer(transfer);
 if(s.id==='solar_wind'){
  clearBoard();clearPrimordialParticles();drawCells();fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION);createPrimordialParticle('e');for(let i=0;i<3;i++)createPrimordialParticle('n');
 }else if(s.id==='stellar_ionization'){
  ensurePrimordialParticleMix({p:1,e:1,n:1});fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION,['H','He','Li']);
 }else if(s.id==='stellar_recombination'){
  ensurePrimordialParticleMix({p:2,e:4,n:1});
  if(![...state.pieces.values()].some(p=>positiveStellarIon(p)&&p.sym==='He'))placePositiveStellarIon('He');
  if(![...state.pieces.values()].some(p=>positiveStellarIon(p)&&p.sym==='Li'))placePositiveStellarIon('Li');
  fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION,['H']);
 }
 renderPieces();renderPrimordialParticles();startPrimordialDrift()
}
"""
s=s[:a]+atomic_block+s[b:]

# Ionization lesson appears before the first stellar-ionization action, using
# the exact same CONTINUAR-gated event tooltip as Coulomb.
old="const s=phase();if(state.locked||state.phaseDone||!electron||electron.kind!=='e'||electron.reacting||!stellarIonizationEligible(piece,s))return false;const sym=piece.sym,x=piece.x,y=piece.y,cell=piece.cell;state.locked=true;state.selected=[];state.primordialSelected=null;electron.reacting=true;"
new="const s=phase();if(state.locked||state.phaseDone||!electron||electron.kind!=='e'||electron.reacting||!stellarIonizationEligible(piece,s))return false;const sym=piece.sym,x=piece.x,y=piece.y,cell=piece.cell;if(s.id==='stellar_ionization'&&!state.productLessons.has('stellarIonization')){await teachProductOnce('stellarIonization',x,y);if(phase()!==s||state.phaseDone)return false}state.locked=true;state.selected=[];state.primordialSelected=null;electron.reacting=true;"
require(old in s or new in s,'ionization tutorial anchor missing')
if old in s:s=s.replace(old,new,1)

# Two complete fast orbits, then dispersal. The first animation is explicitly
# gated by the explanatory tooltip's CONTINUAR button.
a=s.find('async function triggerSolarWind()');b=s.find('function queueSolarWindCheck',a)
require(a>=0 and b>a,'triggerSolarWind anchors missing')
wind=r"""async function triggerSolarWind(){
 const s=phase(),items=solarWindEligibleParticles();if(state.solarWindRunning||items.length<10||!solarWindPhaseAllows(s)||state.phaseDone||state.popupOpen||state.tooltipOpen)return false;
 state.solarWindRunning=true;
 if(!state.productLessons.has('solarWind')){await teachProductOnce('solarWind',starSize()/2,starSize()/2);if(phase()!==s||state.phaseDone){state.solarWindRunning=false;return false}}
 const oldLock=state.locked;state.locked=true;state.selected=[];state.primordialSelected=null;cancelParticleDrag();stopPrimordialDrift();renderPrimordialParticles();dom.star.classList.add('solar-wind-active');
 const keep=solarWindKeepIds(items),size=starSize(),c=size/2,animations=[],turns=Math.PI*4,orbitShare=.72,steps=24;
 for(const p of items){
  const el=dom.primordial.querySelector(`[data-id="${p.id}"]`);if(!el)continue;el.classList.remove('particle-reserve');el.setAttribute('aria-hidden','false');el.style.pointerEvents='none';
  const dx=p.x-c,dy=p.y-c,r=Math.max(42,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),frames=[];
  for(let i=0;i<=steps;i++){const t=i/steps,ang=a+turns*t;frames.push({offset:t*orbitShare,left:`${c+Math.cos(ang)*r}px`,top:`${c+Math.sin(ang)*r}px`,opacity:1})}
  const endAngle=a+turns,endOrbit={x:c+Math.cos(endAngle)*r,y:c+Math.sin(endAngle)*r};let end={x:endOrbit.x,y:endOrbit.y,opacity:1};
  if(!keep.has(p.id)){const outA=endAngle+(Math.random()-.5)*.42,reach=size*(.84+Math.random()*.30);end={x:c+Math.cos(outA)*reach,y:c+Math.sin(outA)*reach,opacity:0}}
  frames.push({offset:.82,left:`${endOrbit.x}px`,top:`${endOrbit.y}px`,opacity:1});frames.push({left:`${end.x}px`,top:`${end.y}px`,opacity:end.opacity});
  const anim=el.animate(frames,{duration:2700,easing:'cubic-bezier(.22,.68,.2,1)',fill:'forwards'});animations.push(anim.finished.catch(()=>{}));
 }
 tone(260,.28,'sine',.025);setTimeout(()=>tone(390,.30,'triangle',.028),420);setTimeout(()=>tone(585,.38,'sine',.024),1050);vibrate([6,10,8]);await Promise.all(animations);
 for(const p of items){if(!keep.has(p.id))state.primordialParticles.delete(p.id);else{p.reacting=false;p.throwing=false;p.dragging=false;primeStellarShellParticle(p,p.kind)}}
 state.solarWindEvents++;const first=!state.rewardDiscoveries.has('phenomenon:solarWind');if(first)registerRewardDiscovery('phenomenon:solarWind',{title:'VENTO SOLAR',text:'Plasma da coroa escapou da estrela como um fluxo de partículas.',silent:true});
 dom.star.classList.remove('solar-wind-active');state.solarWindRunning=false;state.locked=oldLock;renderPrimordialParticles();startPrimordialDrift();render();checkComplete();return true
}
"""
s=s[:a]+wind+s[b:]

# Preserve the rich stellar state into Coulomb too.
a=s.find('async function advanceStellarAtomicPhase()');b=s.find('async function scatterStage()',a)
require(a>=0 and b>a,'advanceStellarAtomicPhase anchors missing')
advance=r"""async function advanceStellarAtomicPhase(){
 if(!state.phaseDone)return;const s=phase(),next=PHASES[state.phaseIndex+1];$('phaseEndBtn').classList.remove('show');state.locked=true;stopPrimordialDrift();state.stellarAtomicTransfer=next&&stellarAtomicTransferTarget(next)?stellarAtomicSnapshot(next.id):null;dom.star.classList.add('primordial-transition');tone(315,.18,'sine',.026);await wait(360);dom.star.classList.remove('primordial-transition');advancePhase()
}
"""
s=s[:a]+advance+s[b:]
s=s.replace("applyGeometry();if(!stellarAtomicMode(s)&&state.stellarAtomicTransfer)state.stellarAtomicTransfer=null;if(preserved){",
            "applyGeometry();if(!stellarAtomicTransferTarget(s)&&state.stellarAtomicTransfer)state.stellarAtomicTransfer=null;if(preserved){")

# Coulomb now receives the previous population, strips bound electrons for the
# hotter nuclear representation, guarantees its He-3 tutorial pair, and fills
# to the same 28-piece population instead of dropping to ten H nuclei.
start="if(s.id==='coulomb_intro'){"; end="if(s.mode==='stellarFormation')"
a=s.find(start);b=s.find(end,a)
require(a>=0 and b>a,'Coulomb fill block anchors missing')
coulomb=r"""if(s.id==='coulomb_intro'){
  const transfer=state.stellarAtomicTransfer?.to==='coulomb_intro'?state.stellarAtomicTransfer:null;state.stellarAtomicTransfer=null;if(transfer)restoreStellarAtomicTransfer(transfer);
  state.pieces.forEach(p=>{if(!p.free&&p.cell!==null&&p.cell!==undefined){p.matterState='nucleus';p.boundElectrons=0}});
  const outerRing=phaseRadius(s),outer=(byRing[outerRing]||[]).slice(),outerSet=new Set(outer),pairs=[];
  for(const a of outer)for(const b of (neigh[a]||[]))if(outerSet.has(b)&&a<b)pairs.push([a,b]);
  pairs.sort((A,B)=>A.reduce((n,c)=>n+(state.board[c]?1:0),0)-B.reduce((n,c)=>n+(state.board[c]?1:0),0));
  const hePair=pairs[0]||outer.slice(0,2);
  for(const cell of hePair){if(cell===undefined)continue;const id=state.board[cell];if(id){state.pieces.delete(id);state.board[cell]=null}createPiece('He3',cell,false,{matterState:'nucleus',boundElectrons:0})}
  let i=0;while(stellarGridPopulation()<STELLAR_CONTINUITY_POPULATION){const cell=activeCells().filter(c=>state.board[c]===null).sort((a,b)=>(coords[b]?.ring||0)-(coords[a]?.ring||0))[0];if(cell===undefined)break;const sym=STELLAR_CONTINUITY_POOL[i++%STELLAR_CONTINUITY_POOL.length];createPiece(sym,cell,false,{matterState:'nucleus',boundElectrons:0})}
  renderPieces();renderPrimordialParticles();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(!p.free&&p.cell!==null&&p.cell!==undefined){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces()});return;
 }
 """
s=s[:a]+coulomb+s[b:]

write(p,s)

# ---------------------------------------------------------------------------
# Map: keep the entire new block AND Convection in the rebuilt mid-mass route.
# ---------------------------------------------------------------------------
p='assets/js/campaign-giants-map.js';s=read(p)
old="moveNodes(['intermediate_mass_formation','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li',S.precursor],precursorFlow);"
new="moveNodes(['intermediate_mass_formation','he_orange','he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection','stellar_li',S.precursor],precursorFlow);"
require(old in s or new in s,'giant map precursor list missing')
if old in s:s=s.replace(old,new,1)
write(p,s)

# ---------------------------------------------------------------------------
# Campaign preview: Vento Solar intentionally has no discovery summary line.
# ---------------------------------------------------------------------------
p='assets/js/campaign-phase-modal.js';s=read(p)
old="function discoveriesFor(id){return window.ARDUA_PHASE_DISCOVERIES?.[id]||[]}"
new="function discoveriesFor(id){if(id==='solar_wind')return[];return window.ARDUA_PHASE_DISCOVERIES?.[id]||[]}"
require(old in s or new in s,'phase modal discoveries function missing')
if old in s:s=s.replace(old,new,1)
write(p,s)

# ---------------------------------------------------------------------------
# Fenômenos: Ionização gets its own square and local-source-backed detail.
# ---------------------------------------------------------------------------
p='assets/js/campaign-discoveries.js';s=read(p)
if "key:'phenomenon:stellarIonization'" not in s:
    anchor=" {key:'phenomenon:solarWind',glyph:'↗',title:'Vento Solar'"
    i=s.find(anchor);require(i>=0,'solar wind phenomenon anchor missing')
    line_end=s.find('\n',i);require(line_end>i,'solar wind phenomenon line end missing')
    entry="\n {key:'phenomenon:stellarIonization',glyph:'e⁻',title:'Ionização',group:'Processos estelares',text:'Processo em que uma colisão suficientemente energética remove um elétron ligado de um átomo, formando um íon positivo e aumentando a população de elétrons livres.',phases:['stellar_ionization'],infer:['stellar_ionization']},"
    s=s[:line_end]+entry+s[line_end:]
write(p,s)

p='assets/js/campaign-discoveries-phenomena.js';s=read(p)
if "'Ionização':'Ionização'" not in s:
    anchor=" 'Vento Solar':'Vento solar',"
    require(anchor in s,'WIKI alias Vento Solar missing')
    s=s.replace(anchor,anchor+"\n 'Ionização':'Ionização',",1)
write(p,s)

p='assets/data/phenomenon-sources.json';data=json.loads(read(p))
if 'Ionização' not in data:
    base=dict(data.get('Vento Solar') or {})
    require(bool(base),'Vento Solar source missing')
    base.update({'wikiTitle':'Ionização','slug':'ionizacao','wikiResolvedTitle':'Ionização','wikiUrl':'https://pt.wikipedia.org/wiki/Ioniza%C3%A7%C3%A3o'})
    data['Ionização']=base
write(p,json.dumps(data,ensure_ascii=False,indent=2)+'\n')

p='scripts/validate-phenomenon-sources.mjs';s=read(p)
s=s.replace('if(entries.length!==50)throw new Error(`Esperados 50 fenômenos, encontrados ${entries.length}`);','if(entries.length!==51)throw new Error(`Esperados 51 fenômenos, encontrados ${entries.length}`);')
write(p,s)

p='scripts/validate-phenomena-discoveries.mjs';s=read(p)
if "'Ionização':['stellar_ionization']" not in s:
    s=s.replace("'Vento Solar':['solar_wind'],", "'Vento Solar':['solar_wind'], 'Ionização':['stellar_ionization'],",1)
write(p,s)

# Permanent feature contract.
p='scripts/validate-stellar-plasma.js'
validator=r"""const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graph=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const discoveries=fs.readFileSync('assets/js/campaign-discoveries.js','utf8');
const phenomenaUI=fs.readFileSync('assets/js/campaign-discoveries-phenomena.js','utf8');
const phaseModal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const giantMap=fs.readFileSync('assets/js/campaign-giants-map.js','utf8');
const sources=JSON.parse(fs.readFileSync('assets/data/phenomenon-sources.json','utf8'));
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const requiredEngine=[
 "id:'solar_wind'","fill:28,pool:['H','H','H','H','H','He'],ionizationSpecies:['H']",
 "id:'stellar_ionization'","id:'stellar_recombination'","id:'coulomb_intro'",
 'const STELLAR_CONTINUITY_POPULATION=28',"const STELLAR_CONTINUITY_POOL=Object.freeze(['H','H','H','H','H','He'])",
 'fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION)',"fillYellowAtomicPopulation(STELLAR_CONTINUITY_POPULATION,['H','He','Li'])",
 "function stellarAtomicTransferTarget(s=phase())","s.id==='coulomb_intro'","stellarAtomicSnapshot(next.id)",
 'function ionizeStellarAtom(piece,electron)','function recombineStellarIon(piece,electron)',
 "solarWind:{title:'VENTO SOLAR'","stellarIonization:{title:'IONIZAÇÃO'",
 "await teachProductOnce('solarWind'","await teachProductOnce('stellarIonization'",
 'function triggerSolarWind()','solarWindEligibleParticles().length<10','turns=Math.PI*4','duration:2700','steps=24',
 "for(const kind of ['p','e','n'])","state.stellarIonizations>=s.target&&state.solarWindEvents>=1",
 'Ionize átomos de Hidrogênio ${state.stellarIonizations}/${s.target}',
 'Ionize átomos ${state.stellarIonizations}/${s.target}','Recombine íons ${state.stellarRecombinations}/${s.target}',
 "registerRewardDiscovery('phenomenon:solarWind'","if(stellarAtomicMode(s)){fillStellarAtomicStage(s);return}","if(stellarAtomicMode(s))return;"
];
for(const token of requiredEngine)if(!engine.includes(token))throw new Error(`Contrato de plasma ausente: ${token}`);
const order=['he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection'];
let last=-1;for(const id of order){const at=graph.indexOf(`\"${id}\"`);if(at<0||at<=last)throw new Error(`Ordem de campanha inválida em ${id}`);last=at}
for(const token of ['"solar_wind":{"allOf":["he_yellow"]}','"stellar_ionization":{"allOf":["solar_wind"]}','"stellar_recombination":{"allOf":["stellar_ionization"]}','"coulomb_intro":{"allOf":["stellar_recombination"]}','"stellar_convection":{"allOf":["coulomb_intro"]}'])if(!graph.includes(token))throw new Error(`Pré-requisito ausente: ${token}`);
for(const id of ['solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection'])if(!giantMap.includes(`'${id}'`))throw new Error(`Mapa intermediário perdeu ${id}`);
if(!phaseModal.includes("if(id==='solar_wind')return[]"))throw new Error('Modal de Vento Solar ainda mostra resumo de descobertas');
if(!discoveries.includes("key:'phenomenon:solarWind'")||!discoveries.includes("title:'Vento Solar'"))throw new Error('Vento Solar ausente de Fenômenos');
if(!discoveries.includes("key:'phenomenon:stellarIonization'")||!discoveries.includes("title:'Ionização'"))throw new Error('Ionização ausente de Fenômenos');
if(!phenomenaUI.includes("'Ionização':'Ionização'"))throw new Error('Ionização sem alias de detalhe em Fenômenos');
for(const title of ['Vento Solar','Ionização'])if(!sources[title]?.imagePath||!sources[title]?.wikiUrl)throw new Error(`Fonte local incompleta: ${title}`);
if(!campaign.includes('version:11')||!campaign.includes("next.activeId='solar_wind'"))throw new Error('Migração v11 da campanha ausente');
console.log('Stellar plasma follow-up OK: continuity population, map, tooltips, wind animation and Ionization discovery.');
"""
write(p,validator)
print('stellar plasma follow-up applied')
