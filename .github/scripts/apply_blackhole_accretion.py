from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)

js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
discoveries_path = Path('assets/js/campaign-discoveries.js')

js = js_path.read_text(encoding='utf-8')

js = replace_once(
    js,
    "{id:'black_hole',branch:'Colapso gravitacional',title:'Buraco negro',meta:'Engula toda a matéria que restou ao redor',new:'Fe',mode:'blackhole',target:6,visual:'blackHole',fill:6,endEvent:'finale',endLabel:'CONCLUIR<br>CICLO CÓSMICO',menuTag:'HORIZONTE'}];",
    "{id:'black_hole',branch:'Colapso gravitacional',title:'Buraco negro',meta:'Buraco Negro + Átomo → Acreção',new:'Fe',mode:'blackhole',target:6,visual:'blackHole',fill:6,endEvent:'finale',endLabel:'CONCLUIR<br>CICLO CÓSMICO',menuTag:'HORIZONTE'}];",
    'black hole phase metadata'
)

js = replace_once(
    js,
    "decayFound:new Set(),postHoldLearned:false,radioactiveProofDone:false",
    "decayFound:new Set(),postHoldLearned:false,blackHoleSelected:false,radioactiveProofDone:false",
    'black hole selection state'
)

js = replace_once(
    js,
    " gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'},\n coulomb:{title:'BARREIRA DE COULOMB'",
    " gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'},\n hawking:{title:'RADIAÇÃO HAWKING',text:'O γ visto durante a acreção representa radiação produzida pela matéria aquecida antes do horizonte. A Radiação Hawking é um efeito quântico distinto, emitido pelo horizonte em intensidade extremamente pequena para buracos negros astrofísicos.'},\n coulomb:{title:'BARREIRA DE COULOMB'",
    'Hawking lesson'
)

js = replace_once(
    js,
    " {key:'phenomenon:blackHole',kind:'phenomenon',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.'},\n {key:'phenomenon:plannedChain'",
    " {key:'phenomenon:blackHole',kind:'phenomenon',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.'},\n {key:'phenomenon:hawkingRadiation',kind:'phenomenon',glyph:'hν',title:'Radiação Hawking',group:'Fenômenos',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos de um buraco negro.'},\n {key:'phenomenon:plannedChain'",
    'engine Hawking discovery'
)

js = replace_once(js, " if(s.mode==='blackhole')return 'matéria → horizonte';", " if(s.mode==='blackhole')return 'Buraco Negro + Átomo → Acreção';", 'black hole recipe line')
js = replace_once(js, " if(s.mode==='blackhole'){$('goalText').textContent=`Matéria restante — ${state.pieces.size}`;setFormula(conciseRecipeLine(s));return}", " if(s.mode==='blackhole'){$('goalText').textContent=`Atraia ${s.target} átomos ao Buraco Negro — ${state.absorbed}/${s.target}`;setFormula(conciseRecipeLine(s));return}", 'black hole HUD')
js = replace_once(js, " if(s.mode==='blackhole'){const initial=Math.max(1,state.postInitialMatter||state.pieces.size||1);return ratio(Math.max(0,initial-state.pieces.size),initial)}", " if(s.mode==='blackhole')return ratio(state.absorbed,s.target);", 'black hole progress')
js = replace_once(js, " if(s.mode==='blackhole')return state.postInitialMatter>0&&state.pieces.size===0;", " if(s.mode==='blackhole')return state.absorbed>=s.target;", 'black hole completion')
js = replace_once(js, " else if(s.mode==='blackhole')announce('OBJETIVO CONCLUÍDO','HORIZONTE ALIMENTADO','O espaço local foi limpo; conclua o ciclo quando quiser.');", " else if(s.mode==='blackhole')announce('OBJETIVO CONCLUÍDO','BURACO NEGRO ALIMENTADO',`${state.absorbed} átomos completaram a acreção; conclua o ciclo quando quiser.`);", 'black hole completion message')
js = replace_once(js, " if(s.mode==='blackhole')return 'Colapso extremo → Buraco Negro';", " if(s.mode==='blackhole')return 'Buraco Negro + Átomo → Acreção';", 'black hole modal primary')
js = replace_once(js, " if(s.mode==='blackhole')return 'Faça a matéria atravessar o horizonte';", " if(s.mode==='blackhole')return 'Selecione o Buraco Negro e depois selecione um átomo';", 'black hole modal objective')
js = replace_once(
    js,
    " blackHole:{kicker:'Colapso gravitacional',title:'BURACO NEGRO',sub:'A gravidade cria um horizonte de eventos',line:'O centro permanece escuro; a matéria ao redor pode formar um disco de acreção extremamente quente e luminoso antes de cruzar o horizonte.'}",
    " blackHole:{kicker:'Colapso gravitacional',title:'BURACO NEGRO',sub:'Buraco Negro + Átomo → Acreção',line:'Selecione o Buraco Negro e um átomo. A matéria espirala para dentro, aquece e pode emitir radiação de alta energia antes de atravessar o horizonte.'}",
    'black hole intro'
)

# Buraco Negro deixa de usar o gesto de hold herdado dos remanescentes.
js = js.replace("||isPostAtomMode()){ev.stopPropagation();beginCrushHold(id,el,ev)}", "||(isPostAtomMode()&&phase().mode!=='blackhole')){ev.stopPropagation();beginCrushHold(id,el,ev)}", 1)
js = js.replace("||isPostAtomMode()){touchHeld=true;beginCrushHold(id,el,ev)}", "||(isPostAtomMode()&&phase().mode!=='blackhole')){touchHeld=true;beginCrushHold(id,el,ev)}", 1)

js = replace_once(
    js,
    "  if((!['neutronize','neutron','guidedDecay','decayGarden'].includes(s.mode)&&!isPostAtomMode(s))||state.locked||state.phaseDone||!p)return;",
    "  const postHoldMode=isPostAtomMode(s)&&s.mode!=='blackhole';\n  if((!['neutronize','neutron','guidedDecay','decayGarden'].includes(s.mode)&&!postHoldMode)||state.locked||state.phaseDone||!p)return;",
    'exclude black hole from hold'
)
js = replace_once(js, "  if(state.crushTimer)return;if(isPostAtomMode(s)&&state.postHoldLearned)return;", "  if(state.crushTimer)return;if(postHoldMode&&state.postHoldLearned)return;", 'hold learned guard')
js = replace_once(js, "  state.crushTimer=setTimeout(()=>s.mode==='decayGarden'?completeGardenDecayHold(id):s.mode==='guidedDecay'||(s.id==='co'&&p.radioactiveReady)?completeGuidedDecay(id):isPostAtomMode()?completePostAbsorb(id):completeCrush(id),1000);", "  state.crushTimer=setTimeout(()=>s.mode==='decayGarden'?completeGardenDecayHold(id):s.mode==='guidedDecay'||(s.id==='co'&&p.radioactiveReady)?completeGuidedDecay(id):postHoldMode?completePostAbsorb(id):completeCrush(id),1000);", 'hold completion routing')
js = replace_once(js, " if(!isPostAtomMode(s)||state.locked||state.phaseDone||!p)return;", " if(!isPostAtomMode(s)||s.mode==='blackhole'||state.locked||state.phaseDone||!p)return;", 'legacy black hole absorb guard')

# Renderização: núcleo selecionável e átomos candidatos à acreção.
js = replace_once(
    js,
    " if(s.mode==='blackhole')layer.classList.add('black-hole');\n const progress=Math.max(0,Math.min(1,state.absorbed/Math.max(1,s.target||1)));",
    " if(s.mode==='blackhole')layer.classList.add('black-hole');\n dom.remnantCore?.classList.toggle('blackhole-selected',s.mode==='blackhole'&&state.blackHoleSelected);\n if(s.mode==='blackhole')dom.remnantCore?.setAttribute('aria-label',state.blackHoleSelected?'Buraco Negro selecionado; escolha um átomo':'Selecionar Buraco Negro');\n const progress=Math.max(0,Math.min(1,state.absorbed/Math.max(1,s.target||1)));",
    'black hole remnant selection render'
)

js = replace_once(
    js,
    "stellarProtonTarget=!primordial&&selectedPrimordialParticle?.kind==='p'&&((stellarProtonRecipe(s)&&p.sym==='H')||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))),decayReady=",
    "stellarProtonTarget=!primordial&&selectedPrimordialParticle?.kind==='p'&&((stellarProtonRecipe(s)&&p.sym==='H')||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))),blackHoleTarget=s.mode==='blackhole'&&state.blackHoleSelected&&!selected,decayReady=",
    'black hole atom target state'
)
js = replace_once(
    js,
    "const partner=(!primordial&&candidates.has(p.cell))||primordialParticleTarget||primordialPieceTarget||neutronPartner||particleTarget||stellarProtonTarget;",
    "const partner=(!primordial&&candidates.has(p.cell))||primordialParticleTarget||primordialPieceTarget||neutronPartner||particleTarget||stellarProtonTarget||blackHoleTarget;",
    'black hole atom candidate class'
)

# Interação em qualquer ordem: átomo -> buraco negro ou buraco negro -> átomo.
old_tap = "if(s.mode==='whiteCompact'){if(handleFusionTap(p))return;invalid(p.cell);return}if(isPrimordial(s)&&s.mode!=='opening')return tapFreeAtom(id);const cell=p.cell;if(s.mode==='collapseFinal'){toast('A matéria já está em órbita extrema. Segure o núcleo central.');return}if(isPostAtomMode(s)){if(state.postHoldLearned)return completePostAbsorb(id);toast(s.mode==='blackhole'?'Segure a primeira matéria por 1 s; depois, toques simples atravessam o horizonte.':'Segure o primeiro núcleo por 1 s; depois, use toques simples.');return}if(s.mode==='neutronize'){toast('Mantenha o átomo pressionado por 1 segundo.');return}"
new_tap = "if(s.mode==='whiteCompact'){if(handleFusionTap(p))return;invalid(p.cell);return}if(isPrimordial(s)&&s.mode!=='opening')return tapFreeAtom(id);const cell=p.cell;if(s.mode==='collapseFinal'){toast('A matéria já está em órbita extrema. Segure o núcleo central.');return}if(s.mode==='blackhole'){if(state.selected.includes(cell)){state.selected=[];render();return}if(!state.blackHoleSelected){state.selected=[cell];tone(248,.05,'sine',.025);toast('Átomo selecionado · toque no Buraco Negro.');render();return}return completeBlackHoleAccretion(id)}if(isPostAtomMode(s)){if(state.postHoldLearned)return completePostAbsorb(id);toast('Segure o primeiro núcleo por 1 s; depois, use toques simples.');return}if(s.mode==='neutronize'){toast('Mantenha o átomo pressionado por 1 segundo.');return}"
js = replace_once(js, old_tap, new_tap, 'black hole tap interaction')

insert_anchor = "function beginCoreHold(ev){\n const s=phase();if(s.mode!=='collapseFinal'||state.locked||state.phaseDone||state.coreHoldTimer)return;"
insert_code = r'''function emitHawkingQuantum(x,y){
 const d=document.createElement('div');d.className='hawking-quantum';d.textContent='hν';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);const a=Math.random()*Math.PI*2,dist=starSize()*.34,anim=d.animate([{transform:'translate(-50%,-50%) scale(.45)',opacity:0},{offset:.18,transform:'translate(-50%,-50%) scale(1)',opacity:.88},{transform:`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.55)`,opacity:0}],{duration:1050,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});setTimeout(()=>d.remove(),1150);return anim
}
function blackHoleSpiral(el,x,y,c){
 if(!el?.animate)return Promise.resolve();const dx=x-c,dy=y-c,startR=Math.max(18,Math.hypot(dx,dy)),base=Math.atan2(dy,dx),frames=[];
 for(let i=0;i<=10;i++){const t=i/10,a=base+t*Math.PI*3.2,r=startR*Math.pow(1-t,1.18),px=c+Math.cos(a)*r,py=c+Math.sin(a)*r;frames.push({left:`${px}px`,top:`${py}px`,transform:`translate(-50%,-50%) scale(${Math.max(.06,1-t*.94)})`,opacity:Math.max(.04,1-t*.82),filter:`brightness(${1+t*.7})`})}
 const anim=el.animate(frames,{duration:920,easing:'cubic-bezier(.12,.72,.18,1)',fill:'forwards'});return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve()};anim.onfinish=finish;setTimeout(finish,1040)})
}
function selectBlackHoleCore(){
 const s=phase();if(s.mode!=='blackhole'||state.locked||state.phaseDone)return;state.blackHoleSelected=!state.blackHoleSelected;tone(state.blackHoleSelected?118:92,.08,'sine',.025);vibrate(7);
 if(state.blackHoleSelected&&state.selected.length){const cell=state.selected[0],id=state.board[cell];if(id&&state.pieces.has(id)){state.selected=[];render();setTimeout(()=>completeBlackHoleAccretion(id),60);return}}
 toast(state.blackHoleSelected?'Buraco Negro selecionado · escolha um átomo.':'Seleção do Buraco Negro liberada.');render()
}
async function completeBlackHoleAccretion(id){
 const s=phase(),p=state.pieces.get(id),el=dom.pieces.querySelector(`[data-id="${id}"]`);if(s.mode!=='blackhole'||state.locked||state.phaseDone||!p)return;
 state.locked=true;state.blackHoleSelected=false;state.selected=[];const {x,y,cell}=p,c=starSize()/2;el?.classList.add('blackhole-accreting');captureTag(x,y,'ACREÇÃO');tone(146,.09,'sine',.026);setTimeout(()=>tone(196,.09,'sine',.025),150);setTimeout(()=>tone(247,.10,'triangle',.024),300);setTimeout(()=>tone(330,.12,'triangle',.022),455);vibrate([8,12,10]);
 const gammaPromise=(async()=>{await wait(430);return emitGamma(c,c,true)})();await blackHoleSpiral(el,x,y,c);
 if(cell!==null&&cell!==undefined&&state.board[cell]===id)state.board[cell]=null;state.pieces.delete(id);state.absorbed++;recordFlow(1);burst(c,c);captureTag(c,c,'HORIZONTE');announce('ACREÇÃO','MATÉRIA CAPTURADA',`${state.absorbed}/${s.target} átomos atraídos`);save();render();await gammaPromise;
 const firstHawking=!state.rewardDiscoveries.has('phenomenon:hawkingRadiation');if(firstHawking){registerRewardDiscovery('phenomenon:hawkingRadiation',{title:'RADIAÇÃO HAWKING',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos.',silent:true});emitHawkingQuantum(c,c);await wait(220);await teachProductOnce('hawking',c,c)}
 state.locked=false;render();checkComplete()
}

function beginCoreHold(ev){
 const s=phase();if(s.mode==='blackhole'){ev.preventDefault?.();ev.stopPropagation?.();selectBlackHoleCore();return}if(s.mode!=='collapseFinal'||state.locked||state.phaseDone||state.coreHoldTimer)return;'''
js = replace_once(js, insert_anchor, insert_code, 'black hole core interaction functions')

js = replace_once(js, "state.decayFound=new Set();state.postHoldLearned=false;state.radioactiveProofDone=false;state.selected=[];", "state.decayFound=new Set();state.postHoldLearned=false;state.blackHoleSelected=false;state.radioactiveProofDone=false;state.selected=[];", 'reset black hole selection')

js_path.write_text(js, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
marker = '/* Black-hole selection accretion */'
if marker not in css:
    css += r'''

/* Black-hole selection accretion */
.remnant-layer.black-hole{z-index:16}
.remnant-layer.black-hole .remnant-core{pointer-events:auto;cursor:pointer;touch-action:manipulation;z-index:18}
.remnant-layer.black-hole .remnant-core.blackhole-selected{border-color:rgba(121,237,255,.92);box-shadow:0 0 0 12px rgba(0,0,0,.62),0 0 0 19px rgba(106,232,255,.20),0 0 34px rgba(123,235,255,.88),0 0 82px rgba(85,160,255,.55),0 0 128px rgba(255,173,68,.20);animation:blackHoleSelectedPulse .78s ease-in-out infinite alternate}
@keyframes blackHoleSelectedPulse{from{transform:translate(-50%,-50%) scale(.96);filter:brightness(.92)}to{transform:translate(-50%,-50%) scale(1.045);filter:brightness(1.18)}}
.atom.blackhole-accreting{z-index:34;pointer-events:none!important;will-change:left,top,transform,opacity,filter;transition:none!important;outline-color:rgba(255,214,102,.75);box-shadow:0 0 26px rgba(255,188,70,.72),0 0 52px rgba(129,180,255,.32)}
.hawking-quantum{position:absolute;z-index:72;pointer-events:none;transform:translate(-50%,-50%);font-size:10px;font-weight:900;color:#dff9ff;text-shadow:0 0 8px #fff,0 0 18px rgba(111,221,255,.92);will-change:transform,opacity}
'''
css_path.write_text(css, encoding='utf-8')

discoveries = discoveries_path.read_text(encoding='utf-8')
discoveries = replace_once(
    discoveries,
    " {key:'phenomenon:blackHole',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.',infer:['black_hole']},\n {key:'phenomenon:plannedChain'",
    " {key:'phenomenon:blackHole',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.',infer:['black_hole']},\n {key:'phenomenon:hawkingRadiation',glyph:'hν',title:'Radiação Hawking',group:'Fenômenos',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos de um buraco negro.'},\n {key:'phenomenon:plannedChain'",
    'campaign Hawking discovery'
)
discoveries_path.write_text(discoveries, encoding='utf-8')

print('black hole selection accretion applied')
