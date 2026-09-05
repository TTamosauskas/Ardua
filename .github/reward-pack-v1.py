from pathlib import Path


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


js_path = Path('assets/js/ardua.js')
css_path = Path('assets/css/ardua.css')
html_path = Path('index.html')
test_path = Path('tests/validate-static.js')
js = js_path.read_text()
css = css_path.read_text()
html = html_path.read_text()
tests = test_path.read_text()

# Persistent reward/discovery state.
js = once(
    js,
    "infoSelection:null,tooltipOpen:false,tooltipResolver:null,tooltipRestoreLock:false};",
    "infoSelection:null,tooltipOpen:false,tooltipResolver:null,tooltipRestoreLock:false,rewardDiscoveries:new Set(),rewardAchievements:new Set(),signatureSeen:new Set(),rewardBannerTimer:null,rewardBannerToken:0,rewardLastShownAt:0,rewardPending:null,rewardPhaseComplete:false,chainCalloutTimer:null,chainCalloutRoot:null,preparedChainRoots:{}};",
    "reward state",
)

old_save = "function save(){localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseIndex:state.phaseIndex,version:'10.77',phaseId:phase().id,discovered:[...state.discovered],ignited:state.ignited,productLessons:[...state.productLessons],protonCaptureUnlocked:state.protonCaptureUnlocked,neutronCaptureUnlocked:state.neutronCaptureUnlocked}))}"
new_save = "function save(){localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseIndex:state.phaseIndex,version:'10.80',phaseId:phase().id,discovered:[...state.discovered],ignited:state.ignited,productLessons:[...state.productLessons],protonCaptureUnlocked:state.protonCaptureUnlocked,neutronCaptureUnlocked:state.neutronCaptureUnlocked,rewardDiscoveries:[...state.rewardDiscoveries],rewardAchievements:[...state.rewardAchievements],signatureSeen:[...state.signatureSeen]}))}"
js = once(js, old_save, new_save, "persist reward state")

old_load_tail = "state.neutronCaptureUnlocked=!!d.neutronCaptureUnlocked||state.phaseIndex>=(phaseIndexById.get('primordial_t')??Infinity)}catch(e){}}"
new_load_tail = "state.neutronCaptureUnlocked=!!d.neutronCaptureUnlocked||state.phaseIndex>=(phaseIndexById.get('primordial_t')??Infinity);state.rewardDiscoveries=new Set(d.rewardDiscoveries||[]);state.rewardAchievements=new Set(d.rewardAchievements||[]);state.signatureSeen=new Set(d.signatureSeen||[])}catch(e){}}"
js = once(js, old_load_tail, new_load_tail, "load reward state")

reward_system = r'''
// Reward Director, Discovery System and adaptive procedural audio. These systems
// observe the scientific engine; they never decide whether a reaction is valid.
const REWARD_SIGNATURES=Object.freeze({
 carbon:{kicker:'MARCO ESTELAR',title:'CARBONO',text:'O triplo-alfa construiu um novo núcleo estável.',tone:392},
 iron:{kicker:'NÚCLEO ESTELAR',title:'FERRO',text:'A estrela alcançou a região em que a fusão comum deixa de sustentá-la.',tone:196},
 gold:{kicker:'PROCESSO-r',title:'OURO',text:'Uma rede extremamente rica em nêutrons alcançou o Ouro.',tone:523},
 uranium:{kicker:'NÚCLEO MUITO PESADO',title:'URÂNIO',text:'A cascata de capturas alcançou a região dos actinídeos.',tone:131},
 freezeout:{kicker:'PROCESSO-r',title:'FREEZE-OUT',text:'O fluxo de nêutrons cai e a rede passa a evoluir por decaimentos.',tone:247},
 supernova:{kicker:'EVENTO ESTELAR',title:'SUPERNOVA',text:'O núcleo libera sua matéria enriquecida para o meio interestelar.',tone:98},
 neutronStar:{kicker:'REMANESCENTE',title:'ESTRELA DE NÊUTRONS',text:'A matéria foi comprimida a um estado extremamente compacto.',tone:174},
 blackHole:{kicker:'REMANESCENTE FINAL',title:'BURACO NEGRO',text:'A matéria atravessa um horizonte do qual não retorna.',tone:65},
 rpCycle:{kicker:'rp-PROCESS',title:'CICLO Sn–Sb–Te',text:'A rede encontrou seu ciclo terminal nesta campanha.',tone:330}
});
const DISCOVERY_ATLAS=Object.freeze([
 {key:'element:C',kind:'element',sym:'C',title:'Carbono',group:'Elementos-chave',text:'Formado pelo processo triplo-alfa em estrelas evoluídas.'},
 {key:'element:Fe',kind:'element',sym:'Fe',title:'Ferro',group:'Elementos-chave',text:'Marca a transição para a evolução final de estrelas massivas.'},
 {key:'element:Au',kind:'element',sym:'Au',title:'Ouro',group:'Elementos-chave',text:'No Ardua, aparece em uma rede rica em nêutrons do processo-r.'},
 {key:'element:U',kind:'element',sym:'U',title:'Urânio',group:'Elementos-chave',text:'Um dos núcleos mais pesados alcançados pela campanha.'},
 {key:'process:s',kind:'phenomenon',glyph:'s',title:'Processo-s',group:'Processos',text:'Capturas lentas de nêutrons intercaladas com decaimentos.'},
 {key:'process:r',kind:'phenomenon',glyph:'r',title:'Processo-r',group:'Processos',text:'Capturas rápidas durante fluxos intensos de nêutrons.'},
 {key:'process:rp',kind:'phenomenon',glyph:'p',title:'rp-process',group:'Processos',text:'Capturas rápidas de prótons em uma estrela de nêutrons em acreção.'},
 {key:'phenomenon:tripleAlpha',kind:'phenomenon',glyph:'3α',title:'Triplo-alfa',group:'Fenômenos',text:'Berílio-8 instável recebe outro Hélio e forma Carbono.'},
 {key:'phenomenon:waitingPoint',kind:'phenomenon',glyph:'β⁺',title:'Waiting point',group:'Fenômenos',text:'Um núcleo proton-rich interrompe temporariamente a sequência de capturas.'},
 {key:'phenomenon:freezeout',kind:'phenomenon',glyph:'n↓',title:'Freeze-out',group:'Fenômenos',text:'O fluxo de nêutrons cai e os decaimentos passam a dominar.'},
 {key:'phenomenon:supernova',kind:'phenomenon',glyph:'✦',title:'Supernova',group:'Eventos cósmicos',text:'Uma explosão estelar dispersa matéria enriquecida.'},
 {key:'phenomenon:neutronStar',kind:'phenomenon',glyph:'NS',title:'Estrela de Nêutrons',group:'Eventos cósmicos',text:'Remanescente compacto sustentado por matéria extremamente densa.'},
 {key:'phenomenon:blackHole',kind:'phenomenon',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.'},
 {key:'phenomenon:plannedChain',kind:'phenomenon',glyph:'×',title:'Cadeia planejada',group:'Domínio',text:'Uma continuação nuclear já estava geometricamente preparada antes da reação inicial.'}
]);
const MICRO_REWARDS=Object.freeze({
 firstReaction:['PRIMEIRA REAÇÃO','A estrela respondeu à sua primeira transformação.'],
 chain3:['CADEIA ×3','Três eventos ficaram causalmente conectados.'],
 chain4:['CADEIA ×4','A rede nuclear ganhou uma sequência longa.'],
 plannedChain:['REDE PREPARADA','Os reagentes da continuação já estavam posicionados.'],
 tripleAlpha:['TRIPLO-ALFA','Berílio-8 e Hélio convergiram para Carbono.'],
 neutronSource:['FONTE DE NÊUTRONS','Uma reação fonte alimentou o fluxo de capturas.'],
 thermalPulse:['PULSO TÉRMICO','O fluxo de nêutrons entrou em um pulso mais intenso.'],
 waitingPoint:['WAITING POINT','A sequência de prótons encontrou uma espera β⁺.'],
 branching:['RAMIFICAÇÃO','A captura competiu com o decaimento β−.'],
 freezeout:['FREEZE-OUT','O fluxo rápido cedeu lugar aos decaimentos.'],
 heavyNucleus:['NÚCLEO PESADO','A rede alcançou a região de Bário ou além.'],
 phaseComplete:['PROCESSO COMPLETO','Objetivo científico e ritmo da fase foram satisfeitos.']
});
function rewardReducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function rewardDirectorClear(){
 if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;state.rewardPending=null;state.rewardPhaseComplete=false;
 const b=dom.ambient;if(b){b.classList.remove('show','reward-banner','micro','discovery','signature','completion');b.dataset.priority='0'}
 const callout=dom.fx?.querySelector('.chain-callout');if(callout)callout.remove();if(state.chainCalloutTimer)clearTimeout(state.chainCalloutTimer);state.chainCalloutTimer=null;state.chainCalloutRoot=null;
}
function rewardDirectorShow(payload={}){
 const b=dom.ambient;if(!b||state.popupOpen||state.tooltipOpen)return false;
 const p={kicker:'DESCOBERTA',title:'',text:'',priority:1,duration:1700,kind:'micro',...payload},now=performance.now(),shown=b.classList.contains('show'),current=Number(b.dataset.priority||0);
 if(shown&&(p.priority<current||(p.priority===current&&now-(state.rewardLastShownAt||0)<820))){if(p.priority>=2)state.rewardPending=p;return false}
 const token=++state.rewardBannerToken;state.rewardLastShownAt=now;if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);
 b.className=`ambient-banner show reward-banner ${p.kind}`;b.dataset.priority=String(p.priority);$('ambientKicker').textContent=p.kicker;$('ambientTitle').textContent=p.title;$('ambientText').textContent=p.text||'';
 state.rewardBannerTimer=setTimeout(()=>{if(token!==state.rewardBannerToken)return;b.classList.remove('show');b.dataset.priority='0';state.rewardBannerTimer=setTimeout(()=>{const next=state.rewardPending;state.rewardPending=null;if(next)rewardDirectorShow(next)},220)},Math.max(1200,p.duration));return true;
}
function rewardParticles(x,y,level=2){
 if(!dom.fx||level<2)return;const count=rewardReducedMotion()?Math.min(3,level):Math.min(12,3+level*2),existing=dom.fx.querySelectorAll('.reward-spark');for(let i=0;i<Math.max(0,existing.length-28);i++)existing[i]?.remove();
 const px=Number.isFinite(x)?x:starSize()/2,py=Number.isFinite(y)?y:starSize()/2;
 for(let i=0;i<count;i++){const d=document.createElement('i'),a=(Math.PI*2*i/count)+(Math.random()-.5)*.35,dist=24+Math.random()*(24+level*14);d.className='reward-spark';d.style.left=px+'px';d.style.top=py+'px';d.style.setProperty('--rx',`${Math.cos(a)*dist}px`);d.style.setProperty('--ry',`${Math.sin(a)*dist}px`);dom.fx.appendChild(d);setTimeout(()=>d.remove(),720)}
}
function ensureRewardProgressAura(){let d=dom.star?.querySelector('.reward-progress-aura');if(!d&&dom.star){d=document.createElement('div');d.className='reward-progress-aura';d.setAttribute('aria-hidden','true');dom.star.appendChild(d)}return d}
function applyRewardProgressVisuals(){
 const d=ensureRewardProgressAura();if(!d)return;const s=phase(),p=s.mode==='opening'?0:Math.max(0,Math.min(1,currentProgress()/100));d.style.setProperty('--progressAura',p.toFixed(3));d.classList.toggle('active',p>.08);dom.star.style.setProperty('--rewardProgress',p.toFixed(3));
}
function adaptiveAudioReaction(level=1,kind='reaction',step=1){
 if(level<2)return;const roots={nuclear:330,neutron:294,r:220,proton:392,energetic:494,decay:262,accretion:147,rotation:440,collapse:110,reaction:330},root=roots[kind]||330,scale=[1,1.125,1.25,1.5,1.667],ratio=scale[Math.min(scale.length-1,Math.max(0,step-1))];tone(root*ratio,.075,level>=4?'triangle':'sine',level>=4?.025:.012);if(level>=4)setTimeout(()=>tone(root*1.5,.11,'sine',.014),78)
}
function adaptiveAudioResolve(kind='completion'){const roots={supernova:82,blackHole:65,completion:330,neutronStar:174,freezeout:220},r=roots[kind]||330;setTimeout(()=>tone(r,.18,'sine',.018),70);setTimeout(()=>tone(r*1.25,.20,'sine',.016),155);setTimeout(()=>tone(r*1.5,.24,'triangle',.014),245)}
const RewardDirector=Object.freeze({show:rewardDirectorShow,clear:rewardDirectorClear,particles:rewardParticles});
function registerRewardDiscovery(key,{title='',text='',kicker='ATLAS ATUALIZADO',silent=false,priority=2}={}){
 if(!key||state.rewardDiscoveries.has(key))return false;state.rewardDiscoveries.add(key);save();if(!silent)RewardDirector.show({kicker,title:title||key,text,priority,duration:1850,kind:'discovery'});return true;
}
function unlockRewardAchievement(key,title=null,text=null){
 if(!key||state.rewardAchievements.has(key))return false;state.rewardAchievements.add(key);save();const m=MICRO_REWARDS[key]||[title||key,text||''];RewardDirector.show({kicker:'MARCO',title:title||m[0],text:text??m[1],priority:2,duration:1650,kind:'micro'});return true;
}
function signatureClass(key){return String(key||'').replace(/[^a-z0-9_-]/gi,'-')}
function playScientificSignature(key,x=starSize()/2,y=starSize()/2){
 const sig=REWARD_SIGNATURES[key];if(!sig||state.signatureSeen.has(key))return false;state.signatureSeen.add(key);registerRewardDiscovery(`phenomenon:${key}`,{title:sig.title,text:sig.text,silent:true});save();
 dom.star.classList.add('reward-signature',`signature-${signatureClass(key)}`);setTimeout(()=>dom.star?.classList.remove('reward-signature',`signature-${signatureClass(key)}`),rewardReducedMotion()?650:1900);RewardDirector.particles(x,y,4);RewardDirector.show({kicker:sig.kicker,title:sig.title,text:sig.text,priority:4,duration:2450,kind:'signature'});adaptiveAudioResolve(key);vibrate(rewardReducedMotion()?8:[10,18,14]);return true;
}
function discoveryUnlocked(entry){return entry.kind==='element'?state.discovered.has(entry.sym):state.rewardDiscoveries.has(entry.key)}
function renderDiscoveryAtlas(){
 const host=$('discoveryAtlas'),detail=$('discoveryDetail');if(!host)return;host.innerHTML='';let group='';
 for(const entry of DISCOVERY_ATLAS){if(entry.group!==group){group=entry.group;const h=document.createElement('div');h.className='discovery-group';h.textContent=group;host.appendChild(h)}const open=discoveryUnlocked(entry),b=document.createElement('button');b.type='button';b.className='discovery-card'+(open?' unlocked':' locked');const glyph=entry.kind==='element'?(E[entry.sym]?.symbol||entry.sym):(entry.glyph||'·');b.innerHTML=`<span class="discovery-glyph">${open?glyph:'?'}</span><span><strong>${open?entry.title:'Não descoberto'}</strong><small>${open?entry.group:'Continue explorando a campanha'}</small></span>`;if(open)b.addEventListener('click',()=>{if(detail)detail.innerHTML=`<strong>${entry.title}</strong><span>${entry.group}</span><p>${entry.text}</p>`});host.appendChild(b)}
}
const DiscoverySystem=Object.freeze({register:registerRewardDiscovery,achievement:unlockRewardAchievement,render:renderDiscoveryAtlas});
const AdaptiveAudio=Object.freeze({reaction:adaptiveAudioReaction,resolve:adaptiveAudioResolve});
function showChainCallout(rootId,kind,step,x,y){
 if(!dom.fx||step<2)return;let d=dom.fx.querySelector('.chain-callout');if(!d){d=document.createElement('div');d.className='chain-callout';dom.fx.appendChild(d)}state.chainCalloutRoot=rootId;const px=Number.isFinite(x)?Math.max(78,Math.min(starSize()-78,x)):starSize()/2,py=Number.isFinite(y)?Math.max(62,Math.min(starSize()-62,y-42)):starSize()*.34;d.style.left=px+'px';d.style.top=py+'px';d.innerHTML=`<small>${chainEventTitle(kind)}</small><strong>×${step}</strong>`;d.classList.remove('visible');void d.offsetWidth;d.classList.add('visible');if(state.chainCalloutTimer)clearTimeout(state.chainCalloutTimer);state.chainCalloutTimer=setTimeout(()=>{d.classList.remove('visible');setTimeout(()=>{if(!d.classList.contains('visible'))d.remove()},300)},1850);
}
function preparedContinuationForFusion(r,cells,target,s=phase()){
 if(state.chainAutoContext||!r||target===null||target===undefined||!fusionSandboxAllowed(s))return false;for(const n of neigh[target]||[]){if(cells.includes(n))continue;const id=state.board[n],p=id?state.pieces.get(id):null;if(!p)continue;if(exactRecipe([r.out,p.sym]))return true}return false;
}
function maybeScientificMoment(s=phase()){
 const sym=s?.new;if(sym&&E[sym]&&(state.created[sym]||0)>0){const key=`element:${sym}`,major={C:'carbon',Fe:'iron',Au:'gold',U:'uranium'}[sym];if(registerRewardDiscovery(key,{title:E[sym].name.toUpperCase(),text:E[sym].origin||'Novo elemento registrado no Atlas.',silent:!!major,priority:2})&&major)playScientificSignature(major);if((E[sym]?.n||0)>=56)unlockRewardAchievement('heavyNucleus');if(sym==='C'&&(s.id==='c'||s.mode==='whiteCompact')){registerRewardDiscovery('phenomenon:tripleAlpha',{title:'TRIPLO-ALFA',text:'Berílio-8 e Hélio formaram Carbono.',silent:true});unlockRewardAchievement('tripleAlpha')}}
}
function evaluateRewardAchievements(s=phase()){
 unlockRewardAchievement('firstReaction');
 if(s.mode==='neutron'&&(state.created[s.new]||0)>0)registerRewardDiscovery(s.rprocess?'process:r':'process:s',{title:s.rprocess?'PROCESSO-r':'PROCESSO-s',text:s.rprocess?'Capturas rápidas em fluxo intenso de nêutrons.':'Capturas lentas intercaladas com decaimentos.',silent:true});
 if(s.mode==='rpProcess'&&state.protonCaptures>0)registerRewardDiscovery('process:rp',{title:'rp-PROCESS',text:'Capturas rápidas de prótons.',silent:true});
 if(state.neutronSourceActivations>0)unlockRewardAchievement('neutronSource');
 const ng=s.mode==='neutron'?neutronGameplay(s):null;if(ng&&['pulse','pulseStrong','source22','source13'].includes(ng.pattern)&&state.neutronPulsesObserved>0)unlockRewardAchievement('thermalPulse');
 if(state.neutronBranchesObserved>0)unlockRewardAchievement('branching');
 if(state.neutronFreezeouts>0){registerRewardDiscovery('phenomenon:freezeout',{title:'FREEZE-OUT',text:'O fluxo de nêutrons caiu e a rede mudou de regime.',silent:true});unlockRewardAchievement('freezeout');playScientificSignature('freezeout')}
 if(s.mode==='rpProcess'&&[...state.pieces.values()].some(p=>p.unstableMode==='betaPlus')){registerRewardDiscovery('phenomenon:waitingPoint',{title:'WAITING POINT',text:'Um núcleo proton-rich entrou em espera β⁺.',silent:true});unlockRewardAchievement('waitingPoint')}
 maybeScientificMoment(s);
}
function phaseCompletionReward(s=phase()){
 if(state.rewardPhaseComplete)return;state.rewardPhaseComplete=true;unlockRewardAchievement('phaseComplete');dom.star.classList.add('completion-settle');setTimeout(()=>dom.star?.classList.remove('completion-settle'),1050);adaptiveAudioResolve('completion');
 if(s.mode==='remnant'){registerRewardDiscovery('phenomenon:neutronStar',{title:'ESTRELA DE NÊUTRONS',text:'Remanescente compacto formado.',silent:true});playScientificSignature('neutronStar')}
 else if(s.mode==='blackhole'){registerRewardDiscovery('phenomenon:blackHole',{title:'BURACO NEGRO',text:'Horizonte de eventos alcançado.',silent:true});playScientificSignature('blackHole')}
 else if(s.id==='rp_te'||state.rpCyclesObserved>0)playScientificSignature('rpCycle');
 else RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:String(s.title||'FASE').toUpperCase(),text:'A estrela estabiliza enquanto a fase fica pronta para prosseguir.',priority:3,duration:1950,kind:'completion'});
}
'''
js = once(js, "function announce(kicker,title,text=''){return false}\n", "function announce(kicker,title,text=''){return false}\n" + reward_system + "\n", "insert reward systems")

# Extend phase reset without touching persistent discoveries.
old_reset = """function resetChainFeedback(){
 state.chainEvent={id:0,kind:'',step:0,lastAt:0};state.chainAutoContext=null;state.chainBonusFlowByRoot={};state.resonance=0;
 if(chainResonanceTimer){clearInterval(chainResonanceTimer);chainResonanceTimer=null}
 document.documentElement.style.setProperty('--resonanceGlow','0');dom.star?.classList.remove('chain-resonance','reaction-reward','reaction-reward-strong');
}"""
new_reset = """function resetChainFeedback(){
 state.chainEvent={id:0,kind:'',step:0,lastAt:0};state.chainAutoContext=null;state.chainBonusFlowByRoot={};state.preparedChainRoots={};state.resonance=0;
 if(chainResonanceTimer){clearInterval(chainResonanceTimer);chainResonanceTimer=null}
 rewardDirectorClear();document.documentElement.style.setProperty('--resonanceGlow','0');dom.star?.classList.remove('chain-resonance','reaction-reward','reaction-reward-strong','reward-signature','completion-settle');applyRewardProgressVisuals();
}"""
js = once(js, old_reset, new_reset, "reset reward phase state")

old_feedback = """function reactionFeedback({kind=null,x=null,y=null,step=1,automatic=false,label=null}={}){
 const k=kind||chainKindForPhase(),n=Math.max(1,Number(step)||1);bumpReactionResonance(.10+Math.min(.30,(n-1)*.065));flashReactionReward(n);
 if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);
 if(n>1){if(Number.isFinite(x)&&Number.isFinite(y))captureTag(x,y,`${chainEventTitle(k)} ×${n}`);const notes=[720,840,960,1080,1200],freq=notes[Math.min(notes.length-1,n-2)];tone(freq,.075,n>=4?'triangle':'sine',Math.min(.038,.018+n*.004));if(n>=4)vibrate(n>=6?[8,16,12,20,14]:[7,12,9]);if(n===4)announce(chainEventTitle(k),'REAÇÕES ENCADEADAS',automatic?'Um produto encontrou uma nova rota compatível.':'Sequência física reconhecida.')}
}"""
new_feedback = """function reactionFeedback({kind=null,x=null,y=null,step=1,automatic=false,label=null,strength=1,rootId=null}={}){
 const k=kind||chainKindForPhase(),n=Math.max(1,Number(step)||1),level=n>=4?4:n>1?3:Math.max(1,Math.min(2,Number(strength)||1));bumpReactionResonance(.09+level*.035+Math.min(.18,(n-1)*.05));flashReactionReward(level);applyRewardProgressVisuals();
 if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);if(level>=2)rewardParticles(x,y,level);AdaptiveAudio.reaction(level,k,n);
 if(n>1){showChainCallout(rootId,k,n,x,y);if(n===3)unlockRewardAchievement('chain3');if(n>=4)unlockRewardAchievement('chain4');if(n>=4)vibrate([7,12,9])}
}"""
js = once(js, old_feedback, new_feedback, "reaction feedback director")

old_start_chain = "function startChainEvent(kind=chainKindForPhase(),x=null,y=null){const id=++chainEventSeq;state.chainEvent={id,kind,step:1,lastAt:performance.now(),x,y};state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.chainBonusFlowByRoot[id]=0;return id}"
new_start_chain = "function startChainEvent(kind=chainKindForPhase(),x=null,y=null){const id=++chainEventSeq;state.chainEvent={id,kind,step:1,lastAt:performance.now(),x,y};state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.preparedChainRoots=state.preparedChainRoots||{};state.chainBonusFlowByRoot[id]=0;return id}"
js = once(js, old_start_chain, new_start_chain, "chain root reward provenance")

old_extend = """function extendChainEvent(rootId,kind,x=null,y=null){
 const now=performance.now(),k=kind||chainKindForPhase();let ev=state.chainEvent;
 if(!ev||ev.id!==rootId||now-(ev.lastAt||0)>CHAIN_EVENT_WINDOW_MS)ev={id:rootId||++chainEventSeq,kind:k,step:1,lastAt:now};
 ev.kind=k;ev.step=Math.min(99,Math.max(1,ev.step||1)+1);ev.lastAt=now;state.chainEvent=ev;reactionFeedback({kind:k,x,y,step:ev.step,automatic:true});return ev.step;
}"""
new_extend = """function extendChainEvent(rootId,kind,x=null,y=null){
 const now=performance.now(),k=kind||chainKindForPhase();let ev=state.chainEvent;
 if(!ev||ev.id!==rootId||now-(ev.lastAt||0)>CHAIN_EVENT_WINDOW_MS)ev={id:rootId||++chainEventSeq,kind:k,step:1,lastAt:now};
 ev.kind=k;ev.step=Math.min(99,Math.max(1,ev.step||1)+1);ev.lastAt=now;state.chainEvent=ev;reactionFeedback({kind:k,x,y,step:ev.step,automatic:true,rootId});if(ev.step===2&&state.preparedChainRoots?.[rootId]){registerRewardDiscovery('phenomenon:plannedChain',{title:'CADEIA PLANEJADA',text:'A continuação já estava preparada no tabuleiro.',silent:true});unlockRewardAchievement('plannedChain')}return ev.step;
}"""
js = once(js, old_extend, new_extend, "chain callout and planned recognition")

old_record = """function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;const fx=feedback||{};
 if(ctx&&!ctx.feedbackUsed){extendChainEvent(ctx.rootId,ctx.kind||fx.kind||chainKindForPhase(s),ctx.x??fx.x,ctx.y??fx.y);ctx.feedbackUsed=true}else if(!ctx)reactionFeedback({kind:fx.kind||chainKindForPhase(s),x:fx.x,y:fx.y,step:1,label:fx.label||null});
 if(s.id==='brown')return;
 const target=Math.max(1,s.flowTarget||1),marks=[[.25,'25'],[.5,'50'],[.75,'75']];
 for(const [ratio,key] of marks){if(before<target*ratio&&state.flow>=target*ratio&&!state.flowMilestones.has(key)){state.flowMilestones.add(key);setTimeout(()=>{if(phase()!==s||state.phaseDone)return;announce('PROGRESSO DA FASE',`${key}% DO PROGRESSO`,key==='50'?'Você já domina o gesto desta fase. Continue no seu ritmo.':'Reações compatíveis também contam para este progresso.');},240)}}
}"""
new_record = """function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;const fx=feedback||{};
 if(ctx&&!ctx.feedbackUsed){extendChainEvent(ctx.rootId,ctx.kind||fx.kind||chainKindForPhase(s),ctx.x??fx.x,ctx.y??fx.y);ctx.feedbackUsed=true}else if(!ctx)reactionFeedback({kind:fx.kind||chainKindForPhase(s),x:fx.x,y:fx.y,step:1,label:fx.label||null,strength:Math.max(1,Math.min(2,Math.ceil((Number(points)||1)/2)))});
 evaluateRewardAchievements(s);applyRewardProgressVisuals();if(s.id==='brown')return;
 const target=Math.max(1,s.flowTarget||1),marks=[[.25,'25'],[.5,'50'],[.75,'75']];
 for(const [ratio,key] of marks){if(before<target*ratio&&state.flow>=target*ratio&&!state.flowMilestones.has(key)){state.flowMilestones.add(key);setTimeout(()=>{if(phase()!==s||state.phaseDone)return;announce('PROGRESSO DA FASE',`${key}% DO PROGRESSO`,key==='50'?'Você já domina o gesto desta fase. Continue no seu ritmo.':'Reações compatíveis também contam para este progresso.');},240)}}
}"""
js = once(js, old_record, new_record, "global reward flow hook")

# Give fusion feedback a precise spatial origin and recognize pre-positioned continuations.
old_fuse_head = "async function fuse(r){if(state.locked)return;state.locked=true;state.fusionInProgress=true;try{const cells=[...state.selected],target=[...cells].sort((a,b)=>coords[a].ring-coords[b].ring)[0],ids=cells.map(c=>state.board[c]),t=pos(coords[target]);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;"
new_fuse_head = "async function fuse(r){if(state.locked)return;state.locked=true;state.fusionInProgress=true;try{const cells=[...state.selected],target=[...cells].sort((a,b)=>coords[a].ring-coords[b].ring)[0],ids=cells.map(c=>state.board[c]),t=pos(coords[target]),preparedChain=preparedContinuationForFusion(r,cells,target);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;"
js = once(js, old_fuse_head, new_fuse_head, "fusion prepared-chain probe")

old_fuse_flow = "state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new?3:1);state.selected=[];burst(t.x,t.y);"
new_fuse_flow = "state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new?3:1,{kind:'nuclear',x:t.x,y:t.y,label:r.out===phase().new?E[r.out].name:null});state.selected=[];burst(t.x,t.y);"
js = once(js, old_fuse_flow, new_fuse_flow, "fusion spatial reward")

old_fuse_tail = "const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('nuclear',np.x,np.y),chainDepth=chainCtx?.depth||1;scheduleAutoFusionCascade(np.id,chainRoot,chainDepth,'nuclear')"
new_fuse_tail = "const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('nuclear',np.x,np.y),chainDepth=chainCtx?.depth||1;if(preparedChain&&!chainCtx){state.preparedChainRoots=state.preparedChainRoots||{};state.preparedChainRoots[chainRoot]=true}scheduleAutoFusionCascade(np.id,chainRoot,chainDepth,'nuclear')"
js = once(js, old_fuse_tail, new_fuse_tail, "fusion planned chain provenance")

# Progress-driven persistent visual state.
old_hud_tail = "$('phaseEndBtn').innerHTML=s.endLabel||'ESPALHAR<br>POEIRA ESTELAR';updateObjective();applyVisual();renderInfoPanel()"
new_hud_tail = "$('phaseEndBtn').innerHTML=s.endLabel||'ESPALHAR<br>POEIRA ESTELAR';updateObjective();applyVisual();applyRewardProgressVisuals();renderInfoPanel()"
js = once(js, old_hud_tail, new_hud_tail, "persistent reward progress visual")

# Completion gets a short reward beat before the advance control takes focus.
old_complete = "state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;save();$('phaseEndBtn').classList.add('show');dom.star.classList.add('critical');"
new_complete = "state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);"
js = once(js, old_complete, new_complete, "phase completion reward beat")

# Signature moments tied to the actual cosmic event, not merely the objective counter.
old_scatter = "async function scatterStage(){if(!state.phaseDone)return;const s=phase(),supernova=s.endEvent==='supernova';$('phaseEndBtn').classList.remove('show');"
new_scatter = "async function scatterStage(){if(!state.phaseDone)return;const s=phase(),supernova=s.endEvent==='supernova';$('phaseEndBtn').classList.remove('show');if(supernova){await wait(rewardReducedMotion()?60:240);registerRewardDiscovery('phenomenon:supernova',{title:'SUPERNOVA',text:'Matéria enriquecida foi dispersa.',silent:true});playScientificSignature('supernova')}"
js = once(js, old_scatter, new_scatter, "supernova signature anticipation")

old_finish = "if(!state.phaseDone)return;$('phaseEndBtn').classList.remove('show');state.locked=true;dom.star.classList.add('phase-active');announce('CICLO CÓSMICO','CONCLUÍDO','O Buraco Negro permanece como remanescente final desta jornada.');"
new_finish = "if(!state.phaseDone)return;$('phaseEndBtn').classList.remove('show');state.locked=true;dom.star.classList.add('phase-active');registerRewardDiscovery('phenomenon:blackHole',{title:'BURACO NEGRO',text:'O ciclo cósmico terminou em um remanescente extremo.',silent:true});playScientificSignature('blackHole');announce('CICLO CÓSMICO','CONCLUÍDO','O Buraco Negro permanece como remanescente final desta jornada.');"
js = once(js, old_finish, new_finish, "final black hole signature")

# Atlas renderer is global and updates whenever the menu opens.
js = once(js, "function renderMenu(){const pm=$('phaseMenu');", "function renderMenu(){renderDiscoveryAtlas();const pm=$('phaseMenu');", "render discovery atlas in menu")

# Menu surface for the scientific discovery atlas.
old_menu = """  <div class="menu-sep"></div>
  <div class="menu-section"><h3>Elementos</h3><div class="catalog" id="catalog"></div><div class="catalog-detail" id="catalogDetail"><strong>Catálogo</strong><span>Toque em um elemento.</span><p>Origem e processo aparecem aqui sem interromper a partida.</p></div></div>"""
new_menu = """  <div class="menu-sep"></div>
  <div class="menu-section"><h3>Atlas de descobertas</h3><div class="discovery-atlas" id="discoveryAtlas"></div><div class="catalog-detail discovery-detail" id="discoveryDetail"><strong>Mapa da matéria</strong><span>Descobertas aparecem sem porcentagem, moeda ou recompensa externa.</span><p>Toque em uma entrada revelada para rever o fenômeno.</p></div></div>
  <div class="menu-sep"></div>
  <div class="menu-section"><h3>Elementos</h3><div class="catalog" id="catalog"></div><div class="catalog-detail" id="catalogDetail"><strong>Catálogo</strong><span>Toque em um elemento.</span><p>Origem e processo aparecem aqui sem interromper a partida.</p></div></div>"""
html = once(html, old_menu, new_menu, "discovery atlas menu")

# A restrained visual language: one focal callout, sparse physical particles and a persistent aura.
css_add = r'''

/* Reward, discovery and adaptive game-feel pack */
.reward-progress-aura{position:absolute;inset:-3.5%;z-index:2;border-radius:50%;pointer-events:none;opacity:calc(var(--progressAura,0)*.42);background:radial-gradient(circle,transparent 57%,rgba(176,222,255,.08) 68%,rgba(255,238,178,.20) 79%,transparent 91%);box-shadow:0 0 46px rgba(147,207,255,.12);mix-blend-mode:screen;transition:opacity .7s ease,filter .7s ease}.reward-progress-aura.active{filter:saturate(1.08)}
.reward-spark{position:absolute;z-index:39;width:5px;height:5px;border-radius:50%;pointer-events:none;background:#f9fdff;box-shadow:0 0 10px rgba(193,231,255,.82);transform:translate(-50%,-50%);animation:rewardSpark .7s cubic-bezier(.18,.7,.24,1) forwards}@keyframes rewardSpark{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}18%{opacity:.95}100%{opacity:0;transform:translate(calc(-50% + var(--rx)),calc(-50% + var(--ry))) scale(.18)}}
.chain-callout{position:absolute;z-index:54;min-width:136px;pointer-events:none;transform:translate(-50%,-50%) scale(.96);opacity:0;text-align:center;padding:7px 12px;border-radius:16px;background:radial-gradient(circle at 50% 20%,rgba(24,39,68,.78),rgba(6,12,27,.58) 72%);border:1px solid rgba(210,235,255,.24);box-shadow:0 10px 32px rgba(0,0,0,.28),0 0 26px rgba(151,215,255,.14);backdrop-filter:blur(7px);transition:opacity .28s ease,transform .32s cubic-bezier(.2,.7,.2,1)}.chain-callout.visible{opacity:1;transform:translate(-50%,-50%) scale(1)}.chain-callout small{display:block;color:#c8eaff;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}.chain-callout strong{display:block;margin-top:1px;color:#fff;font-size:21px;line-height:1;text-shadow:0 0 14px rgba(181,226,255,.5)}
.ambient-banner.reward-banner{background:linear-gradient(180deg,rgba(11,19,37,.88),rgba(5,10,23,.76));border-color:rgba(186,222,255,.22);box-shadow:0 14px 42px rgba(0,0,0,.28),0 0 28px rgba(116,188,255,.08)}.ambient-banner.reward-banner.micro strong{font-size:16px}.ambient-banner.reward-banner.discovery{border-color:rgba(255,221,136,.28)}.ambient-banner.reward-banner.signature{background:linear-gradient(180deg,rgba(19,24,40,.94),rgba(6,9,19,.86));border-color:rgba(255,241,192,.34);box-shadow:0 18px 52px rgba(0,0,0,.42),0 0 42px rgba(255,225,151,.12)}.ambient-banner.reward-banner.signature strong{font-size:21px;letter-spacing:.015em}.ambient-banner.reward-banner.completion{border-color:rgba(151,235,195,.30)}
.star-board.reward-signature{animation:rewardSignature 1.8s cubic-bezier(.18,.72,.22,1)}@keyframes rewardSignature{0%{filter:brightness(1)}16%{filter:brightness(.88)}38%{filter:brightness(1.55) drop-shadow(0 0 52px rgba(255,239,183,.68))}70%{filter:brightness(1.14)}100%{filter:brightness(1)}}
.star-board.completion-settle .reward-progress-aura{opacity:.58;filter:brightness(1.18)}
.discovery-atlas{display:grid;grid-template-columns:1fr 1fr;gap:7px}.discovery-group{grid-column:1/-1;margin:7px 2px 0;color:#8fa6ce;font-size:9px;font-weight:950;letter-spacing:.10em;text-transform:uppercase}.discovery-card{min-width:0;display:grid;grid-template-columns:34px 1fr;gap:8px;align-items:center;border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.035);padding:8px;color:var(--text);text-align:left}.discovery-card.unlocked{cursor:pointer;border-color:rgba(145,210,255,.18)}.discovery-card.locked{opacity:.48}.discovery-glyph{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.18),rgba(121,169,223,.07));border:1px solid rgba(255,255,255,.10);font-weight:950;font-size:13px}.discovery-card strong{display:block;font-size:10px;line-height:1.1}.discovery-card small{display:block;margin-top:3px;color:var(--muted);font-size:8px;line-height:1.2}.discovery-detail{margin-top:8px}
@media(max-width:390px){.discovery-atlas{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.reward-spark{animation-duration:.22s}.star-board.reward-signature,.star-board.reaction-reward,.star-board.reaction-reward-strong{animation:none!important}.chain-callout,.ambient-banner.reward-banner,.reward-progress-aura{transition-duration:.08s!important}}
'''
if '/* Reward, discovery and adaptive game-feel pack */' in css:
    raise SystemExit('reward CSS already present')
css = css.rstrip() + css_add + '\n'

# Permanent regression checks for the pack.
test_insert = r'''
ok(engine.includes('const RewardDirector=Object.freeze')&&engine.includes('const DiscoverySystem=Object.freeze')&&engine.includes('const AdaptiveAudio=Object.freeze'),'diretor de recompensas, descobertas e áudio adaptativo são globais');
ok(engine.includes("state.rewardDiscoveries")&&engine.includes("rewardAchievements")&&engine.includes("signatureSeen"),'Atlas e marcos audiovisuais persistem no save');
ok(engine.includes("state.chainCalloutTimer=setTimeout")&&engine.includes("},1850)"),'texto de cascata permanece legível por aproximadamente 1,85 s após a última atualização');
ok(engine.includes("CHAIN_AUTO_FLOW_FACTORS=Object.freeze([.25,.10,0])")&&engine.includes('CHAIN_MAX_PROGRESS_BONUS=.10'),'cascatas preservam crédito decrescente e teto de 10% do flowTarget');
ok(engine.includes('CHAIN_OBJECTIVE_PROGRESS_FLOOR=.75'),'objetivo científico preserva piso de 75% sem encerrar a fase sozinho');
ok(engine.includes("preparedContinuationForFusion")&&engine.includes("phenomenon:plannedChain"),'cadeias previamente posicionadas podem ser reconhecidas como rede preparada');
ok(engine.includes("playScientificSignature('supernova')")&&engine.includes("playScientificSignature('neutronStar')")&&engine.includes("playScientificSignature('blackHole')"),'Supernova, Estrela de Nêutrons e Buraco Negro possuem momentos de assinatura');
ok(engine.includes("C:'carbon'")&&engine.includes("Fe:'iron'")&&engine.includes("Au:'gold'")&&engine.includes("U:'uranium'"),'Carbono, Ferro, Ouro e Urânio possuem assinaturas científicas');
ok(engine.includes("setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720)"),'avanço da fase espera o beat audiovisual de conclusão');
ok(html.includes('id="discoveryAtlas"')&&html.includes('Atlas de descobertas'),'menu contém Atlas de descobertas persistente');
const css=fs.readFileSync(path.join(root,'assets/css/ardua.css'),'utf8');
ok(css.includes('.chain-callout')&&css.includes('.reward-progress-aura')&&css.includes('.reward-spark'),'hierarquia visual inclui callout, aura persistente e partículas contidas');
ok(css.includes('@media(prefers-reduced-motion:reduce)'),'efeitos respeitam preferência de redução de movimento');
'''
tests = once(tests, "console.log('\\nValidação estática do Ardua concluída.');", test_insert + "console.log('\\nValidação estática do Ardua concluída.');", "reward pack permanent tests")

js_path.write_text(js)
css_path.write_text(css)
html_path.write_text(html)
test_path.write_text(tests)
print('reward pack migration applied')
