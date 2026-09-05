from pathlib import Path
import re


def load(path):
    return Path(path).read_text(encoding='utf-8')


def save(path, text):
    Path(path).write_text(text, encoding='utf-8')


def sub1(text, pattern, replacement, label, flags=re.S):
    out, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected one match, found {count}')
    return out


# ---------------------------------------------------------------------------
# Core gameplay
# ---------------------------------------------------------------------------
path = 'assets/js/ardua.js'
text = load(path)

text = sub1(
    text,
    r"function grantConvectionFromCells\(cells,s=phase\(\)\)\{.*?\n\}\nfunction nearestCellToPoint",
    """function grantConvectionFromCells(cells,s=phase()){
 if(!convectionMechanicUnlocked(s)||Number(state.convectionCharge||0)>=1||state.chainAutoContext)return false;
 const valid=[...(cells||[])].filter(c=>Number.isInteger(c)&&c>=0&&c<coords.length);
 if(!valid.some(c=>(coords[c]?.ring??99)<=1))return false;
 state.convectionCharge=1;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];
 dom.star?.classList.add('convection-charged-flash');setTimeout(()=>dom.star?.classList.remove('convection-charged-flash'),620);
 tone(520,.08,'triangle',.028);vibrate(6);renderConvectionControl();return true;
}
function nearestCellToPoint""",
    'grant convection charge'
)

text = sub1(
    text,
    r"function ensureConvectionControl\(\)\{.*?\n\}\nfunction convectionAxialPoint",
    """function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('pointerdown',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   ev.preventDefault();ev.stopPropagation();const path=[...(state.convectionPathCells||[])];state.convectionConfirmPending=false;performConvection(path);
 },true);
}
function ensureConvectionControl(){
 let b=document.getElementById('convectionBtn');if(b){ensureConvectionConfirmationListener();return b}
 b=document.createElement('button');b.type='button';b.id='convectionBtn';b.className='convection-core-trigger';b.setAttribute('aria-label','Ativar convecção estelar');
 b.innerHTML='<span class="convection-glyph" aria-hidden="true">↕</span><span class="convection-gamma-orbit" aria-hidden="true">γ</span>';
 b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();toggleConvectionArmed()});dom.star.appendChild(b);ensureConvectionConfirmationListener();return b;
}
function renderConvectionControl(){
 const b=ensureConvectionControl(),available=convectionMechanicUnlocked(),charged=Number(state.convectionCharge||0)>0,armed=!!state.convectionArmed,pending=!!state.convectionConfirmPending,show=available&&charged&&!state.phaseDone;
 b.classList.toggle('show',show);b.classList.toggle('charged',show);b.classList.toggle('armed',armed);b.classList.toggle('pending',pending);b.disabled=!show||state.locked||pending;b.setAttribute('aria-pressed',armed?'true':'false');
 dom.star.classList.toggle('convection-core-charged',show);dom.star.classList.toggle('convection-confirm-pending',pending);
}
function toggleConvectionArmed(){
 if(!convectionMechanicUnlocked()||state.locked||state.phaseDone)return;
 if(Number(state.convectionCharge||0)<1){toast('Uma ação nuclear no centro ou na camada 1 carrega a convecção.');return}
 state.convectionArmed=!state.convectionArmed;state.convectionConfirmPending=false;state.convectionPathCells=[];state.selected=[];state.primordialSelected=null;objectiveMotifCancelSelection();
 if(state.convectionArmed){[330,415,520].forEach((f,i)=>setTimeout(()=>tone(f,.08,'sine',.019+i*.003),i*70));vibrate(5)}else tone(260,.05,'sine',.02);render();
}
function convectionAxialPoint""",
    'replace floating convection control'
)

text = sub1(
    text,
    r"function emitConvectionEnergyPulse\(path,index,total\)\{.*?\n\}\nasync function performConvection\(path\)\{.*?\n\}\nfunction handleConvectionTap\(p\)\{.*?\n\}\n\nfunction fusionCandidateCells",
    """function emitConvectionEnergyPulse(path,index,total){
 if(!dom.fx||!path.length)return;const from=path[Math.min(path.length-1,Math.floor(index*path.length/Math.max(1,total)))],to=path[path.length-1],a=pos(coords[from]),b=pos(coords[to]),d=document.createElement('div');
 d.className='convection-energy light';d.textContent='✦';d.style.left=a.x+'px';d.style.top=a.y+'px';dom.fx.appendChild(d);
 requestAnimationFrame(()=>{d.style.left=b.x+'px';d.style.top=b.y+'px';d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(.58)'});setTimeout(()=>d.remove(),760);
}
function releaseConvectionGamma(path){
 if(!dom.fx||!path.length)return;const c=starSize()/2,to=pos(coords[path[path.length-1]]),d=document.createElement('div');d.className='convection-gamma-release';d.textContent='γ';d.style.left=c+'px';d.style.top=c+'px';dom.fx.appendChild(d);
 requestAnimationFrame(()=>{d.style.left=to.x+'px';d.style.top=to.y+'px';d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(.7)'});setTimeout(()=>d.remove(),900);
}
async function performConvection(path){
 if(state.locked||Number(state.convectionCharge||0)<1)return false;const occupied=path.filter(cell=>state.board[cell]);if(occupied.length<2)return false;
 const firstConvection=!state.productLessons.has('convection');releaseConvectionGamma(path);state.locked=true;state.convectionCharge=0;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];state.selected=[];objectiveMotifCancelSelection();renderConvectionControl();
 const ids=occupied.map(cell=>state.board[cell]),reversed=[...ids].reverse(),moves=[];occupied.forEach(cell=>state.board[cell]=null);
 occupied.forEach((cell,i)=>{const id=reversed[i],p=id?state.pieces.get(id):null;if(!p)return;const from=p.cell;state.board[cell]=id;p.cell=cell;p.convecting=true;if(from!==cell)moves.push({id,from,to:cell})});
 dom.star.classList.add('convection-active');renderPieces();[330,415,520,660].forEach((f,i)=>setTimeout(()=>tone(f,.11,'sine',.018+i*.004),i*85));vibrate([8,16,8]);
 requestAnimationFrame(()=>{for(const m of moves){const p=state.pieces.get(m.id);if(p){const q=pos(coords[m.to]);p.x=q.x;p.y=q.y}}renderPieces()});
 moves.forEach((m,i)=>setTimeout(()=>emitConvectionEnergyPulse(path,i,moves.length),110+i*55));await wait(720);
 for(const m of moves){const p=state.pieces.get(m.id);if(p)p.convecting=false}dom.star.classList.remove('convection-active');state.convectionMoves=(state.convectionMoves||0)+1;
 if(phase().mode==='convection')recordFlow(1,{kind:'convection',x:starSize()/2,y:starSize()/2,label:'energia transportada'});
 captureTag(starSize()/2,starSize()*.18,`ENERGIA TRANSPORTADA · ${moves.length}`);
 if(firstConvection){registerRewardDiscovery('phenomenon:stellarConvection',{title:'CONVECÇÃO ESTELAR',text:'Correntes de plasma transportam matéria e energia entre regiões da estrela.',silent:true});await teachProductOnce('convection',starSize()/2,starSize()/2)}
 ensureOpportunity();state.locked=false;render();checkComplete();return true;
}
function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionConfirmPending=true;state.convectionArmed=false;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);render();toast('Coluna convectiva marcada · toque novamente para iniciar.');return true;
}

function fusionCandidateCells""",
    'convection selection and confirmation flow'
)

old_class = "+(p.newborn?' newborn':'')+(p.convecting?' convecting':'');el.style.left=p.x+'px';"
new_class = "+(p.newborn?' newborn':'')+(p.convecting?' convecting':'')+(state.convectionArmed&&!state.convectionConfirmPending&&!p.free?' convection-choice':'')+((state.convectionPathCells||[]).includes(p.cell)?' convection-path':'');el.style.left=p.x+'px';"
if old_class not in text:
    raise SystemExit('renderPieces convection classes: target missing')
text = text.replace(old_class, new_class, 1)

text = sub1(
    text,
    r"stratification:\{title:'CAMADAS ESTELARES',text:'Produtos mais pesados tendem a ocupar regiões internas, enquanto combustíveis mais leves dominam regiões externas\.'\}",
    "stratification:{title:'CAMADAS ESTELARES',text:'Produtos mais pesados tendem a ocupar regiões internas, enquanto combustíveis mais leves dominam regiões externas.'},\n convection:{title:'CONVECÇÃO ESTELAR',text:'Uma reação nuclear aqueceu o interior. Fótons gama interagem repetidamente com o plasma, enquanto correntes convectivas transportam matéria e energia para outras regiões da estrela.'}",
    'convection explanatory tooltip'
)

text = sub1(
    text,
    r"if\(s\.mode==='convection'\)\{registerRewardDiscovery\('phenomenon:stellarConvection'.*?\}\n else if\(s\.mode==='remnant'\)",
    "if(s.mode==='convection'){RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:'CONVECÇÃO ESTELAR',text:'Você dominou o ciclo entre atividade nuclear e transporte convectivo.',priority:3,duration:1950,kind:'completion'})}\n else if(s.mode==='remnant')",
    'avoid duplicate convection discovery at phase completion'
)

old_recipe = "if(s.mode==='convection'){if(state.convectionArmed&&state.selected.length)return'Escolha um núcleo externo na coluna destacada';if(state.convectionCharge)return'Ative CONVECÇÃO → escolha uma coluna radial';return'Reação nuclear no centro ou camada 1 → Convecção'}"
new_recipe = "if(s.mode==='convection'){if(state.convectionConfirmPending)return'Coluna marcada → toque novamente para iniciar';if(state.convectionArmed)return'↕ → selecione um átomo externo';if(state.convectionCharge)return'Toque em ↕ no núcleo estelar';return'Reação nuclear no centro ou camada 1 → Convecção'}"
if old_recipe not in text:
    raise SystemExit('convection HUD guidance: target missing')
text = text.replace(old_recipe, new_recipe, 1)

old_reset = "state.convectionCharge=0;state.convectionArmed=false;state.convectionMoves=0;state.convectionLessonShown=false;"
new_reset = "state.convectionCharge=0;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];state.convectionMoves=0;state.convectionLessonShown=false;"
if old_reset not in text:
    raise SystemExit('convection phase reset: target missing')
text = text.replace(old_reset, new_reset, 1)

save(path, text)


# ---------------------------------------------------------------------------
# Discoveries: unlock only after the first observed convection.
# ---------------------------------------------------------------------------
path = 'assets/js/campaign-discoveries.js'
disc = load(path)
needle = " {key:'phenomenon:tripleAlpha',glyph:'3α',title:'Triplo-alfa',group:'Fenômenos',text:'Berílio-8 instável recebe outro Hélio e forma Carbono.',infer:['c']},"
insert = needle + "\n {key:'phenomenon:stellarConvection',glyph:'↕',title:'Convecção Estelar',group:'Fenômenos',text:'Correntes de plasma transportam matéria e energia entre diferentes regiões da estrela.'},"
if needle not in disc:
    raise SystemExit('discoveries convection entry anchor missing')
disc = disc.replace(needle, insert, 1)
old_structural = "'bigbang','brown','he_red','he_orange','he_yellow','coulomb_intro','white'"
new_structural = "'bigbang','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','white'"
if old_structural not in disc:
    raise SystemExit('discoveries structural phases anchor missing')
disc = disc.replace(old_structural, new_structural, 1)
save(path, disc)


# ---------------------------------------------------------------------------
# Visual language: the stellar core itself carries the ability.
# ---------------------------------------------------------------------------
path = 'assets/css/ardua.css'
css = load(path)
marker = '/* Stellar convection mechanic */'
if marker not in css:
    raise SystemExit('convection CSS marker missing')
css = css.split(marker, 1)[0].rstrip() + "\n\n" + r'''/* Stellar convection mechanic */
.convection-core-trigger{display:none;position:absolute;left:50%;top:50%;z-index:66;width:calc(var(--cellSize)*1.15);height:calc(var(--cellSize)*1.15);transform:translate(-50%,-50%);border-radius:50%;border:2px solid rgba(255,226,94,.92);background:radial-gradient(circle at 38% 32%,#fffbd1 0 12%,#ffd84d 36%,#ff9b2e 68%,rgba(139,55,18,.96) 100%);color:#402600;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset 0 0 18px rgba(255,255,255,.56),0 0 18px rgba(255,213,66,.72),0 0 42px rgba(255,170,40,.44);overflow:visible;pointer-events:auto}.convection-core-trigger.show{display:flex}.convection-core-trigger:disabled{cursor:default}.convection-core-trigger.charged{animation:convectionCoreReady .88s ease-in-out infinite alternate}.convection-core-trigger.armed{border-color:#78ffc0;box-shadow:inset 0 0 18px rgba(255,255,255,.52),0 0 0 4px rgba(67,242,138,.20),0 0 34px rgba(90,255,171,.58)}.convection-core-trigger.pending{border-color:#ff6e62;box-shadow:inset 0 0 18px rgba(255,255,255,.45),0 0 0 4px rgba(255,81,72,.18),0 0 35px rgba(255,72,59,.56)}
.convection-glyph{position:relative;z-index:3;font-size:calc(var(--cellSize)*.56);font-weight:950;line-height:1;text-shadow:0 1px 0 rgba(255,255,255,.42),0 0 9px rgba(255,255,255,.45)}.convection-gamma-orbit{position:absolute;left:50%;top:50%;z-index:4;font-size:calc(var(--cellSize)*.27);font-weight:950;color:#effbff;text-shadow:0 0 7px #fff,0 0 15px rgba(154,226,255,.92);animation:convectionGammaOrbit .92s linear infinite;pointer-events:none}
@keyframes convectionCoreReady{from{filter:brightness(.94);transform:translate(-50%,-50%) scale(.96)}to{filter:brightness(1.18);transform:translate(-50%,-50%) scale(1.045)}}
@keyframes convectionGammaOrbit{0%{transform:translate(-50%,-50%) rotate(0deg) translateX(calc(var(--cellSize)*.49)) rotate(0deg)}25%{transform:translate(-50%,-50%) rotate(92deg) translateX(calc(var(--cellSize)*.42)) rotate(-92deg)}50%{transform:translate(-50%,-50%) rotate(184deg) translateX(calc(var(--cellSize)*.51)) rotate(-184deg)}75%{transform:translate(-50%,-50%) rotate(276deg) translateX(calc(var(--cellSize)*.40)) rotate(-276deg)}100%{transform:translate(-50%,-50%) rotate(360deg) translateX(calc(var(--cellSize)*.49)) rotate(-360deg)}}
.star-board.convection-core-charged .star-core{filter:brightness(1.16) saturate(1.16);box-shadow:inset 0 0 88px rgba(255,229,96,.20),0 0 72px rgba(255,214,74,.62),0 0 165px var(--starGlow)}.star-board.convection-charged-flash .star-core{animation:convectionCoreFlash .62s ease-out}.star-board.convection-active .star-core{filter:brightness(1.22) saturate(1.12)}
@keyframes convectionCoreFlash{0%{filter:brightness(1)}35%{filter:brightness(1.6);box-shadow:inset 0 0 88px rgba(255,238,128,.36),0 0 86px rgba(255,218,74,.82),0 0 175px var(--starGlow)}100%{filter:brightness(1)}}
.atom.convection-choice{outline:4px solid rgba(67,242,138,.92);outline-offset:1px;box-shadow:0 0 0 2px rgba(67,242,138,.12),0 0 19px rgba(67,242,138,.34),inset 0 0 14px rgba(255,255,255,.10);animation:convectionChoicePulse .75s ease-in-out infinite alternate}.atom.convection-path{outline:4px solid rgba(255,73,63,.98)!important;outline-offset:1px!important;box-shadow:0 0 0 3px rgba(255,73,63,.18),0 0 24px rgba(255,61,51,.62),inset 0 0 14px rgba(255,255,255,.12)!important;animation:convectionPathPulse .58s ease-in-out infinite alternate}.atom.convecting{z-index:16;transition:left .58s cubic-bezier(.2,.72,.18,1),top .58s cubic-bezier(.2,.72,.18,1),transform .22s ease,box-shadow .22s ease;box-shadow:0 0 0 3px rgba(125,235,255,.22),0 0 22px rgba(99,221,255,.46),inset 0 0 14px rgba(255,255,255,.18)}
@keyframes convectionChoicePulse{from{filter:brightness(.98)}to{filter:brightness(1.13)}}@keyframes convectionPathPulse{from{filter:brightness(.98)}to{filter:brightness(1.18)}}
.convection-energy,.convection-gamma-release{position:absolute;z-index:68;pointer-events:none;transform:translate(-50%,-50%) scale(1);font-weight:950;transition:left .72s cubic-bezier(.18,.72,.22,1),top .72s cubic-bezier(.18,.72,.22,1),opacity .72s ease,transform .72s ease;text-shadow:0 0 10px currentColor,0 0 22px currentColor}.convection-energy.light{font-size:13px;color:#ffe8ae}.convection-gamma-release{font-size:22px;color:#e9fbff;text-shadow:0 0 9px #fff,0 0 22px rgba(127,219,255,.95)}
@media(max-width:430px){.convection-core-trigger{width:calc(var(--cellSize)*1.08);height:calc(var(--cellSize)*1.08)}.convection-glyph{font-size:calc(var(--cellSize)*.52)}}
''' + "\n"
save(path, css)


# ---------------------------------------------------------------------------
# Restore the normal Pages workflow and remove this one-time helper.
# ---------------------------------------------------------------------------
clean_workflow = '''name: Deploy Ardua to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7.0.1

      - name: Upload static site
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
'''
save('.github/workflows/pages.yml', clean_workflow)
Path(__file__).unlink()
print('stellar convection core interaction refinement applied')
