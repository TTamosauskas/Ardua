from pathlib import Path


def once(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old,new,1)


def replace_between(text,start,end,replacement,label):
    a=text.find(start)
    if a<0: raise SystemExit(f"{label}: start not found")
    b=text.find(end,a+len(start))
    if b<0: raise SystemExit(f"{label}: end not found")
    return text[:a]+replacement.rstrip()+"\n"+text[b:]

js_path=Path('assets/js/ardua.js')
css_path=Path('assets/css/ardua.css')
html_path=Path('index.html')
tests_path=Path('tests/validate-static.js')
js=js_path.read_text()
css=css_path.read_text()
html=html_path.read_text()
tests=tests_path.read_text()

# Copy edits requested by the user.
js=once(js,
"proton:{title:'PRÓTON LIBERADO',text:'Algumas transformações devolvem prótons ao plasma, onde podem participar de novas reações.'}",
"proton:{title:'PRÓTON LIBERADO',text:'Algumas transformações devolvem prótons que podem participar de novas reações.'}",
'proton tooltip copy')
js=once(js,
"gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia precisa ser liberado.'}",
"gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'}",
'gamma tooltip copy')
js=once(js,
"if(sp.category==='competing')return{title:'CANAIS CONCORRENTES',text:`A colisão entre ${a} e ${b} pode seguir mais de um caminho energeticamente aberto. Nesta fase acompanhamos o canal que produz ${main}; as taxas relativas mudam com a energia e com a estrutura dos núcleos.`};",
"if(sp.category==='competing')return{title:'CANAIS CONCORRENTES',text:`A colisão entre ${a} e ${b} pode seguir mais de um caminho e produzir diferentes elementos.`};",
'competing channels tooltip')
js=once(js,
"function objectiveInteractionParticleGlyph(kind){return kind==='p'?'p':kind==='n'?'n':kind==='e'?'e⁻':kind==='nu'?'ν':kind==='gamma'?'γ':kind==='cosmic'?'✦':'•'}",
"function objectiveInteractionParticleGlyph(kind){return kind==='p'?'+':kind==='n'?'n':kind==='e'?'e⁻':kind==='nu'?'ν':kind==='gamma'?'γ':kind==='cosmic'?'✦':'•'}",
'proton highlight glyph')

# Persistent reward notices with an explicit Continue acknowledgement.
reward_block=r'''function rewardDirectorNeedsContinue(p){return['OBJETIVO CIENTÍFICO','MARCO','ATLAS ATUALIZADO'].includes(String(p?.kicker||'').toUpperCase())}
function rewardDirectorDismiss(){
 const b=dom.ambient;if(!b)return false;if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;state.rewardBannerToken++;b.classList.remove('show','awaiting-continue');b.dataset.priority='0';const btn=$('ambientContinueBtn');if(btn)btn.hidden=true;
 setTimeout(()=>{const next=state.rewardPending;state.rewardPending=null;if(next)rewardDirectorShow(next)},160);return true;
}
function rewardDirectorClear(){
 if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;state.rewardPending=null;state.rewardPhaseComplete=false;state.rewardBannerToken++;
 const b=dom.ambient;if(b){b.classList.remove('show','reward-banner','micro','discovery','signature','completion','awaiting-continue');b.dataset.priority='0'}const btn=$('ambientContinueBtn');if(btn)btn.hidden=true;
 const callout=dom.fx?.querySelector('.chain-callout');if(callout)callout.remove();if(state.chainCalloutTimer)clearTimeout(state.chainCalloutTimer);state.chainCalloutTimer=null;state.chainCalloutRoot=null;
}
function rewardDirectorShow(payload={}){
 const b=dom.ambient;if(!b||state.popupOpen||state.tooltipOpen)return false;
 const p={kicker:'DESCOBERTA',title:'',text:'',priority:1,duration:1700,kind:'micro',...payload};if(state.objectiveMotifActive){if(p.priority>=2)state.rewardPending=p;return false}const now=performance.now(),shown=b.classList.contains('show'),current=Number(b.dataset.priority||0),awaiting=b.classList.contains('awaiting-continue');
 if(shown&&awaiting){if(p.priority>=2)state.rewardPending=p;return false}
 if(shown&&(p.priority<current||(p.priority===current&&now-(state.rewardLastShownAt||0)<820))){if(p.priority>=2)state.rewardPending=p;return false}
 const token=++state.rewardBannerToken,needsContinue=rewardDirectorNeedsContinue(p);state.rewardLastShownAt=now;if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;
 b.className=`ambient-banner show reward-banner ${p.kind}${needsContinue?' awaiting-continue':''}`;b.dataset.priority=String(p.priority);$('ambientKicker').textContent=p.kicker;$('ambientTitle').textContent=p.title;$('ambientText').textContent=p.text||'';const btn=$('ambientContinueBtn');if(btn)btn.hidden=!needsContinue;
 if(needsContinue)return true;
 state.rewardBannerTimer=setTimeout(()=>{if(token!==state.rewardBannerToken)return;rewardDirectorDismiss()},Math.max(1200,p.duration));return true;
}'''
js=replace_between(js,'function rewardDirectorClear(){','function rewardParticles(',reward_block,'reward notice persistence')

# Big Bang musical overture: sub impact -> rising phrases -> broad resolving chord.
bigbang_music=r'''function bigBangOvertureNote(delay,freq,duration=.28,gain=.022,type='sine'){setTimeout(()=>{if(phase().mode==='opening')tone(freq,duration,type,gain)},delay)}
function playBigBangOverture(){
 const phrase=(start,root)=>{[1,1.25,1.5].forEach((ratio,i)=>bigBangOvertureNote(start+i*145,root*ratio,.30,i===2?.028:.022,i===2?'triangle':'sine'))};
 bigBangOvertureNote(0,55,.82,.052,'sine');bigBangOvertureNote(0,82.5,.62,.024,'triangle');
 phrase(170,110);phrase(760,146.83);phrase(1360,164.81);
 setTimeout(()=>{if(phase().mode!=='opening')return;for(const f of [220,275,330]){tone(f,.70,'triangle',.027);tone(f*2,.48,'sine',.010)}},2240);
 setTimeout(()=>{if(phase().mode!=='opening')return;for(const f of [330,440,550])tone(f,.54,'sine',.016);tone(660,.42,'triangle',.014)},3030);
 setTimeout(()=>{if(phase().mode==='opening'){tone(440,.46,'sine',.014);tone(660,.38,'sine',.012);tone(880,.30,'sine',.009)}},3580);
}
'''
js=once(js,'async function launchBigBang(){',bigbang_music+'async function launchBigBang(){','Big Bang overture functions')
js=once(js,"tone(55,.8,'sawtooth',.07);vibrate([25,20,45,25,65]);announce('BIG BANG'","playBigBangOverture();vibrate([25,20,45,25,65]);announce('BIG BANG'",'Big Bang overture trigger')

# Hook persistent reward acknowledgement.
js=once(js,"$('phaseEndBtn').addEventListener('click',endPhaseAction);$('eventTooltipBtn').addEventListener('click',closeEventTooltip);",
"$('phaseEndBtn').addEventListener('click',endPhaseAction);$('eventTooltipBtn').addEventListener('click',closeEventTooltip);$('ambientContinueBtn').addEventListener('click',rewardDirectorDismiss);",
'reward Continue listener')

html=once(html,
'<div class="ambient-banner" id="ambientBanner"><span class="ak" id="ambientKicker"></span><strong id="ambientTitle"></strong><small id="ambientText"></small></div>',
'<div class="ambient-banner" id="ambientBanner" role="status"><span class="ak" id="ambientKicker"></span><strong id="ambientTitle"></strong><small id="ambientText"></small><button type="button" class="ambient-continue" id="ambientContinueBtn" hidden>CONTINUAR</button></div>',
'ambient Continue button')

css_marker='/* Persistent reward acknowledgement */'
if css_marker in css: raise SystemExit('reward acknowledgement CSS already present')
css += r'''

/* Persistent reward acknowledgement */
.ambient-banner.awaiting-continue{pointer-events:auto}
.ambient-banner .ambient-continue{width:100%;margin-top:9px;border:0;border-radius:10px;padding:8px 10px;background:linear-gradient(135deg,#8bdcff,#bba8ff);color:#07111f;font-size:10px;font-weight:950;cursor:pointer}
.ambient-banner .ambient-continue[hidden]{display:none!important}
'''

# Permanent regression coverage.
insert="""
ok(engine.includes("proton:{title:'PRÓTON LIBERADO',text:'Algumas transformações devolvem prótons que podem participar de novas reações.'}"),'tooltip de próton usa o texto simplificado');
ok(engine.includes("gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'}"),'tooltip de raio gama usa o texto revisado');
ok(engine.includes("kind==='p'?'+'"),'próton aparece como + no Objective Interaction Motif');
ok(engine.includes('function playBigBangOverture()')&&engine.includes('phrase(170,110)')&&engine.includes('playBigBangOverture();vibrate'),'Big Bang possui abertura musical em frases e acorde de resolução');
ok(engine.includes('function rewardDirectorNeedsContinue')&&engine.includes("'OBJETIVO CIENTÍFICO','MARCO','ATLAS ATUALIZADO'"),'notificações científicas exigem confirmação explícita');
ok(engine.includes("$('ambientContinueBtn').addEventListener('click',rewardDirectorDismiss)")&&html.includes('id=\"ambientContinueBtn\"'),'banner persistente possui botão CONTINUAR funcional');
ok(css.includes('.ambient-banner.awaiting-continue')&&css.includes('.ambient-continue[hidden]'),'CSS permite interação somente quando a notificação aguarda confirmação');
ok(engine.includes('A colisão entre ${a} e ${b} pode seguir mais de um caminho e produzir diferentes elementos.'),'tooltip de canais concorrentes foi simplificado');
"""
anchor="console.log('\\nValidação estática do Ardua concluída.');"
tests=once(tests,anchor,insert+anchor,'regression assertions')

js_path.write_text(js)
css_path.write_text(css)
html_path.write_text(html)
tests_path.write_text(tests)
print('Big Bang music, copy and persistent notification UX migrated')
