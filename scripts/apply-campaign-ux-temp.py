from pathlib import Path
import json,re


def must_replace(text, old, new, label, count=1):
    n=text.count(old)
    if n!=count:
        raise SystemExit(f'{label}: esperado {count}, encontrado {n}')
    return text.replace(old,new,count)

phase_ids=['solar_wind','stellar_ionization','stellar_recombination']

# --- Engine ---------------------------------------------------------------
p=Path('assets/js/ardua.js')
s=p.read_text(encoding='utf-8')
lines=s.splitlines(keepends=True)
rows={}
kept=[]
for line in lines:
    m=re.match(r"\s*\{id:'([^']+)'",line)
    if m and m.group(1) in phase_ids:
        if m.group(1) in rows: raise SystemExit('fase duplicada: '+m.group(1))
        rows[m.group(1)]=line
    else:
        kept.append(line)
if set(rows)!=set(phase_ids): raise SystemExit('não localizei as três fases de plasma no motor')
for pid in phase_ids:
    rows[pid]=rows[pid].replace("visual:'yellowDwarf'","visual:'redDwarf'").replace('fill:28','fill:15')
insert_at=None
for i,line in enumerate(kept):
    if re.match(r"\s*\{id:'stellar_movement'",line):
        insert_at=i+1
        break
if insert_at is None: raise SystemExit('stellar_movement não encontrado')
kept[insert_at:insert_at]=[rows[x] for x in phase_ids]
s=''.join(kept)

s=must_replace(s,"const STELLAR_CONTINUITY_POPULATION=28;","const STELLAR_CONTINUITY_POPULATION=15;",'população das fases de plasma')
s=must_replace(s,
    "if(s.mode==='movementTutorial')return 'Selecione o Hélio e escolha uma célula vazia vizinha até chegar ao centro.';",
    "if(s.mode==='movementTutorial')return 'Clique no átomo e avance um espaço por vez';",
    'instrução curta de movimento')

hud_anchor="function updateObjective(){\n const s=phase();\n if(s.id==='solar_wind')"
hud_new="function updateObjective(){\n const s=phase();\n if(s.mode==='movementTutorial'){const done=objectiveSatisfied(s)?1:0;$('goalText').textContent=`Leve o Hélio até o núcleo estelar. — ${done}/${s.target}`;setFormula('Clique no átomo e avance um espaço por vez');return}\n if(s.id==='solar_wind')"
s=must_replace(s,hud_anchor,hud_new,'HUD da movimentação')

move_old="state.selected=[];state.contextRecipeKey=null;tone(275,.055,'sine',.022);vibrate(5);dom.star.classList.add('pulse');render();\n await wait(210);"
move_new="state.selected=[];state.contextRecipeKey=null;tone(275,.055,'sine',.022);vibrate(5);dom.star.classList.add('pulse');render();\n await wait(300);"
s=must_replace(s,move_old,move_new,'tempo visual do passo')

know_old="""function campaignKnowledgeReached(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed);
 if(aware)return gs.activeId===id||gs.completed.includes(id);
 const i=phaseIndexById.get(id);return i!==undefined&&state.phaseIndex>=i
}"""
know_new="""function campaignKnowledgeReached(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed),i=phaseIndexById.get(id);
 // Conhecimento só atua na própria lição ou em fases cronologicamente posteriores.
 // Assim, revisitar uma fase antiga não antecipa Vento Solar, Coulomb, Convecção etc.
 if(aware)return (gs.activeId===id||gs.completed.includes(id))&&(i===undefined||state.phaseIndex>=i);
 return i!==undefined&&state.phaseIndex>=i
}"""
s=must_replace(s,know_old,know_new,'gate cronológico de conhecimento')

s=must_replace(s,
    "function coulombMechanicUnlocked(s=phase()){\n  const intro=phaseIndexById.get('coulomb_intro');return intro!==undefined&&state.phaseIndex>=intro;\n }",
    "function coulombMechanicUnlocked(s=phase()){\n  return campaignKnowledgeReached('coulomb_intro');\n }",
    'gate de Coulomb')

conv_old="""function convectionMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('stellar_convection');
 if(intro===undefined||state.phaseIndex<intro||isPrimordial(s)||s.mode==='opening')return false;"""
conv_new="""function convectionMechanicUnlocked(s=phase()){
 if(!campaignKnowledgeReached('stellar_convection')||isPrimordial(s)||s.mode==='opening')return false;"""
s=must_replace(s,conv_old,conv_new,'gate de convecção')

end_old="$('phaseEndBtn').innerHTML=s.endLabel||'ESPALHAR<br>POEIRA ESTELAR';updateObjective();"
end_new="const stellarDustEnd=!isPrimordial(s)&&s.mode!=='stellarFormation'&&s.mode!=='campaignMilestone'&&s.endEvent!=='supernova'&&s.endEvent!=='finale';$('phaseEndBtn').innerHTML=stellarDustEnd?'ESPALHAR<br>POEIRA ESTELAR':(s.endLabel||'ESPALHAR<br>POEIRA ESTELAR');updateObjective();"
s=must_replace(s,end_old,end_new,'rótulo final das fases estelares')

advance_old="function advancePhase(){const next=(state.phaseIndex+1)%PHASES.length;startPhase(next,true)}"
advance_new="function advancePhase(){const campaign=window.ARDUA_CAMPAIGN;if(campaign&&!campaign.editor){state.locked=false;window.dispatchEvent(new CustomEvent('ardua:phase-ended',{detail:{id:phase().id}}));return}const next=(state.phaseIndex+1)%PHASES.length;startPhase(next,true)}"
s=must_replace(s,advance_old,advance_new,'retorno ao mapa após fase')
p.write_text(s,encoding='utf-8')

# --- Rotation: interpolate actual left/top transition before orbit mapping. ---
p=Path('assets/js/rotation-polish.js')
r=p.read_text(encoding='utf-8')
point_old="""function point(el){
 const x=Number.parseFloat(el.style.left),y=Number.parseFloat(el.style.top);
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}"""
point_new="""function point(el){
 const x=Number.parseFloat(el.style.left),y=Number.parseFloat(el.style.top);
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
function transitionPoint(el){
 const css=getComputedStyle(el),x=Number.parseFloat(css.left),y=Number.parseFloat(css.top);
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:point(el);
}"""
r=must_replace(r,point_old,point_new,'posição interpolada da rotação')
apply_old="""function applyOrbit(el,g,promote=false){
 const base=point(el);if(!base)return;
 const target=hexOrbitPoint(base.x,base.y,g,angle);
 el.style.translate=`${(target.x-base.x).toFixed(3)}px ${(target.y-base.y).toFixed(3)}px`;
 if(promote)el.style.willChange='translate';
}"""
apply_new="""function applyOrbit(el,g,promote=false,followTransition=false){
 const base=followTransition?transitionPoint(el):point(el);if(!base)return;
 const target=hexOrbitPoint(base.x,base.y,g,angle);
 el.style.translate=`${(target.x-base.x).toFixed(3)}px ${(target.y-base.y).toFixed(3)}px`;
 if(promote)el.style.willChange='translate';
}"""
r=must_replace(r,apply_old,apply_new,'órbita durante transição')
r=must_replace(r,"for(const atom of pieces.querySelectorAll('.atom'))applyOrbit(atom,g,true);","for(const atom of pieces.querySelectorAll('.atom'))applyOrbit(atom,g,true,true);",'átomos seguindo transição')
p.write_text(r,encoding='utf-8')

# --- Campaign graph -------------------------------------------------------
p=Path('assets/js/campaign-graph.js')
g=p.read_text(encoding='utf-8')
g=must_replace(g,"const G={version:9,","const G={version:10,",'versão do grafo')
m=re.search(r'baseOrder:\[(.*?)\],atlas:',g,re.S)
if not m: raise SystemExit('baseOrder não encontrado')
order=json.loads('['+m.group(1)+']')
for pid in phase_ids:
    if pid not in order: raise SystemExit('fase ausente do baseOrder: '+pid)
    order.remove(pid)
at=order.index('stellar_movement')+1
order[at:at]=phase_ids
encoded=','.join(json.dumps(x,ensure_ascii=False) for x in order)
g=g[:m.start(1)]+encoded+g[m.end(1):]
g=must_replace(g,
    '"red":["low_mass_formation","he_red","stellar_movement"],"mid":["intermediate_mass_formation","he_orange","he_yellow","solar_wind","stellar_ionization","stellar_recombination","coulomb_intro","stellar_convection","stellar_li","giant_formation","fragile","c","n","o"]',
    '"red":["low_mass_formation","he_red","stellar_movement","solar_wind","stellar_ionization","stellar_recombination"],"mid":["intermediate_mass_formation","he_orange","he_yellow","coulomb_intro","stellar_convection","stellar_li","giant_formation","fragile","c","n","o"]',
    'sequências baixa/intermediária')
g=must_replace(g,'"solar_wind":{"allOf":["he_yellow"]}','"solar_wind":{"allOf":["stellar_movement"]}','pré-requisito Vento Solar')
g=must_replace(g,'"coulomb_intro":{"allOf":["stellar_recombination"]}','"coulomb_intro":{"allOf":["he_yellow"]}','pré-requisito Coulomb')
g=must_replace(g,'"white":{"anyOf":[["stellar_movement"],["bi"]]}','"white":{"anyOf":[["stellar_recombination"],["bi"]]}','pré-requisito Anã Branca')
p.write_text(g,encoding='utf-8')

# --- Campaign state migration --------------------------------------------
p=Path('assets/js/campaign-mode.js')
c=p.read_text(encoding='utf-8')
if c.count('version:12')!=2: raise SystemExit('schema v12 inesperado')
c=c.replace('version:12','version:13')
old_v11=""" if(previousVersion<11&&next.activeId==='coulomb_intro'&&!next.completed.includes('coulomb_intro')&&next.completed.includes('he_yellow')){
  // Novas lições de plasma entram imediatamente antes de Coulomb. Só redirecione
  // quem estava parado exatamente nessa fronteira; progresso posterior é preservado.
  next.activeId='solar_wind';
 }
"""
if old_v11 not in c: raise SystemExit('migração v11 antiga não encontrada')
c=c.replace(old_v11,'',1)
v12=""" if(previousVersion<12){
  if(next.completed.includes('white')&&!next.completed.includes('stellar_movement'))next.completed=uniq([...next.completed,'stellar_movement']);
  if(next.activeId==='white'&&!next.completed.includes('white')&&next.completed.includes('he_red'))next.activeId='stellar_movement';
 }
"""
v13=v12+""" if(previousVersion<13){
  // As três lições de plasma agora pertencem à trilha de baixa massa, depois de Movimentação.
  if(next.activeId==='white'&&!next.completed.includes('white')&&next.completed.includes('stellar_movement')&&!next.completed.includes('stellar_recombination'))next.activeId='solar_wind';
 }
"""
c=must_replace(c,v12,v13,'migração v13')
p.write_text(c,encoding='utf-8')

# --- Campaign map ---------------------------------------------------------
p=Path('assets/js/campaign-map.js')
mapp=p.read_text(encoding='utf-8')
mapp=must_replace(mapp,
    "{key:'low',label:'Baixa massa',visual:'sphere-red',content:`${flow(G.sequences.red)}${structural('Evolução de longa vida')}${flow(['white'])}`}",
    "{key:'low',label:'Baixa massa',visual:'sphere-red',content:`${flow(G.sequences.red)}${flow(['white'])}`}",
    'título Evolução de longa vida')
mapp=must_replace(mapp," addPath(from,fork,`branch-fork ${group}`,.46);"," if(group!=='neutron')addPath(from,fork,`branch-fork ${group}`,.46);",'haste neutron')
mapp=must_replace(mapp,
    "if(s==='low'){connectActiveSphere('stellar',G.sequences.red[0],'low');connectTrail(G.sequences.red,'low');addPath(byPhase(tail('he_red')),byPhase('white'),'converge',.5)}",
    "if(s==='low'){connectActiveSphere('stellar',G.sequences.red[0],'low');connectTrail(G.sequences.red,'low');addPath(byPhase(tail('stellar_recombination')),byPhase('white'),'converge',.5)}",
    'ligação final da trilha baixa')
p.write_text(mapp,encoding='utf-8')

# --- Giant map ------------------------------------------------------------
p=Path('assets/js/campaign-giants-map.js')
gm=p.read_text(encoding='utf-8')
gm=must_replace(gm,
    "moveNodes(['intermediate_mass_formation','he_orange','he_yellow','solar_wind','stellar_ionization','stellar_recombination','coulomb_intro','stellar_convection','stellar_li',S.precursor],precursorFlow);",
    "moveNodes(['intermediate_mass_formation','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li',S.precursor],precursorFlow);",
    'precursor intermediário')
p.write_text(gm,encoding='utf-8')

# --- Phase preview: discoveries remain a surprise. ------------------------
p=Path('assets/js/campaign-phase-modal.js')
pm=p.read_text(encoding='utf-8')
pm=must_replace(pm,"function discoveriesFor(id){if(id==='solar_wind')return[];return window.ARDUA_PHASE_DISCOVERIES?.[id]||[]}\n",'', 'função de descobertas no modal')
pm=must_replace(pm,'  <p class="phase-preview-discoveries" data-phase-discoveries hidden></p>\n','', 'caixa de descobertas no modal')
pm=must_replace(pm,",discoveries=preview.querySelector('[data-phase-discoveries]')",'', 'referência de descobertas no modal')
render_old=" const entries=discoveriesFor(id);if(discoveries){discoveries.hidden=!entries.length;discoveries.textContent=entries.length?`Descobertas da fase: ${entries.map(x=>x.title).join(' · ')}`:''}\n"
pm=must_replace(pm,render_old,'','render de descobertas no modal')
p.write_text(pm,encoding='utf-8')

# --- Permanent validators -------------------------------------------------
Path('scripts/validate-stellar-plasma.js').write_text(r"""const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const graphSrc=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const giant=fs.readFileSync('assets/js/campaign-giants-map.js','utf8');
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(graphSrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;
const low=['low_mass_formation','he_red','stellar_movement','solar_wind','stellar_ionization','stellar_recombination'];
if(JSON.stringify(G.sequences.red)!==JSON.stringify(low))fail('Plasma deve encerrar a trilha de baixa massa');
for(const id of ['solar_wind','stellar_ionization','stellar_recombination'])if(G.sequences.mid.includes(id))fail(id+' ainda está na trilha intermediária');
if(JSON.stringify(G.prerequisites.solar_wind)!==JSON.stringify({allOf:['stellar_movement']}))fail('Vento Solar deve vir após Movimentação');
if(JSON.stringify(G.prerequisites.stellar_ionization)!==JSON.stringify({allOf:['solar_wind']}))fail('Ionização deve vir após Vento Solar');
if(JSON.stringify(G.prerequisites.stellar_recombination)!==JSON.stringify({allOf:['stellar_ionization']}))fail('Recombinação deve vir após Ionização');
if(JSON.stringify(G.prerequisites.coulomb_intro)!==JSON.stringify({allOf:['he_yellow']}))fail('Coulomb deve permanecer na trilha intermediária');
if(!JSON.stringify(G.prerequisites.white).includes('stellar_recombination'))fail('Anã Branca deve vir depois das três lições de plasma na trilha baixa');
for(const id of ['solar_wind','stellar_ionization','stellar_recombination']){const at=engine.indexOf(`id:'${id}'`),line=engine.slice(at,engine.indexOf('\n',at));if(at<0||!line.includes("visual:'redDwarf'")||!line.includes('fill:15'))fail(id+' precisa usar núcleo + 2 camadas da Anã Vermelha')}
if(!engine.includes('const STELLAR_CONTINUITY_POPULATION=15'))fail('População de plasma deve caber no hexágono de 19 células');
if(!engine.includes("campaignKnowledgeReached('coulomb_intro')"))fail('Coulomb sem gate de conhecimento');
if(!engine.includes("campaignKnowledgeReached('stellar_convection')"))fail('Convecção sem gate de conhecimento');
if(!engine.includes("(gs.activeId===id||gs.completed.includes(id))&&(i===undefined||state.phaseIndex>=i)"))fail('Conhecimento não bloqueia efeitos futuros ao revisitar fases antigas');
if(map.includes('Evolução de longa vida'))fail('Título Evolução de longa vida ainda aparece no mapa');
if(!map.includes("if(group!=='neutron')addPath(from,fork,`branch-fork ${group}`,.46)"))fail('Haste branch-fork neutron ainda é desenhada');
for(const id of ['solar_wind','stellar_ionization','stellar_recombination'])if(giant.includes(`'${id}'`))fail('Mapa das gigantes ainda captura fase de plasma: '+id);
if(modal.includes('phase-preview-discoveries')||modal.includes('Descobertas da fase:'))fail('Modal ainda antecipa descobertas');
if(!campaign.includes('version:13')||!campaign.includes("next.activeId='solar_wind'"))fail('Migração v13 da trilha baixa ausente');
console.log('Stellar plasma routing, hidden discoveries and chronological effect gates OK.');
""",encoding='utf-8')

Path('scripts/validate-movement-chain-particles.js').write_text(r"""const fs=require('fs'),vm=require('vm');
const fail=m=>{throw new Error(m)};
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const rotation=fs.readFileSync('assets/js/rotation-polish.js','utf8');
const graphSrc=fs.readFileSync('assets/js/campaign-graph.js','utf8');
const campaign=fs.readFileSync('assets/js/campaign-mode.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(graphSrc,ctx);const G=ctx.window.ARDUA_CAMPAIGN_GRAPH;
const red=G.baseOrder.indexOf('he_red'),movement=G.baseOrder.indexOf('stellar_movement'),wind=G.baseOrder.indexOf('solar_wind');
if(red<0||movement!==red+1||wind!==movement+1)fail('Anã Vermelha → Movimentação → Vento Solar deve ser contínuo');
if(JSON.stringify(G.prerequisites.stellar_movement)!==JSON.stringify({allOf:['he_red']}))fail('Movimentação deve depender de Anã Vermelha');
if(!JSON.stringify(G.prerequisites.white).includes('stellar_recombination'))fail('Anã Branca deve esperar o trio de plasma');
if(!campaign.includes('version:13')||!campaign.includes("activeId='stellar_movement'")||!campaign.includes("activeId='solar_wind'"))fail('Migrações de Movimentação/plasma ausentes');
for(const token of ["id:'stellar_movement'","mode:'movementTutorial'","meta:'Leve o Hélio até o núcleo estelar.'","flowTarget:0","visual:'redDwarf'","if(s.mode==='movementTutorial'){const done=objectiveSatisfied(s)?1:0","Leve o Hélio até o núcleo estelar. — ${done}/${s.target}","setFormula('Clique no átomo e avance um espaço por vez')","if(s.mode==='movementTutorial')return 'Clique no átomo e avance um espaço por vez'","await wait(300);"])if(!engine.includes(token))fail('Contrato da movimentação ausente: '+token);
for(const token of ['function transitionPoint(el)','function applyOrbit(el,g,promote=false,followTransition=false)',"applyOrbit(atom,g,true,true)"])if(!rotation.includes(token))fail('Rotação não acompanha a transição real do átomo: '+token);
if(!engine.includes("const campaign=window.ARDUA_CAMPAIGN;if(campaign&&!campaign.editor){state.locked=false;window.dispatchEvent(new CustomEvent('ardua:phase-ended'"))fail('Fase ainda avança automaticamente no modo campanha');
for(const token of ['function campaignKnowledgeCompleted(id)','function fusionAutoRecipePreviouslyLearned(r)','!fusionAutoRecipePreviouslyLearned(r)','function neutronAutoTargetPreviouslyLearned(p,s=phase())','!neutronAutoTargetPreviouslyLearned(p,s)','function protonAutoRoutePreviouslyLearned(s=phase())','!protonAutoRoutePreviouslyLearned(s)'])if(!engine.includes(token))fail('Regra de cadeia estrita ausente: '+token);
const a=engine.indexOf('function campaignKnowledgeCompleted(id)'),b=engine.indexOf('function learnedPrimordialNuclearReactions',a),block=engine.slice(a,b);if(!block.includes('gs.completed.includes(id)')||block.includes('gs.activeId===id'))fail('Cadeias automáticas só podem usar fases concluídas');
for(const token of ['function boardParticleTargetAvailable(p,s=phase())','function selectBoardParticleTarget(p)','boardParticleTargetAvailable(p,s)){selectBoardParticleTarget(p);return}','protonCaptureAvailable(s)&&protonCaptureRoute(board,s)','attemptProtonCapture(board.cell,p.id)'])if(!engine.includes(token))fail('Seleção átomo→partícula perdeu simetria: '+token);
console.log('Movement animation, campaign return and strict chain knowledge OK.');
""",encoding='utf-8')

p=Path('scripts/validate-rotation-option.js')
v=p.read_text(encoding='utf-8')
v=must_replace(v,"'function applyOrbit(el,g,promote=false)',","'function applyOrbit(el,g,promote=false,followTransition=false)',",'validator assinatura applyOrbit')
v=must_replace(v,"'applyOrbit(atom,g,true)',","'applyOrbit(atom,g,true,true)',\n  'function transitionPoint(el)',",'validator átomo interpolado')
p.write_text(v,encoding='utf-8')

Path('scripts/validate-campaign-phase-flow.js').write_text(r"""const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const map=fs.readFileSync('assets/js/campaign-map.js','utf8');
const modal=fs.readFileSync('assets/js/campaign-phase-modal.js','utf8');
const must=["Leve o Hélio até o núcleo estelar. — ${done}/${s.target}","Clique no átomo e avance um espaço por vez","window.dispatchEvent(new CustomEvent('ardua:phase-ended'","const stellarDustEnd=!isPrimordial(s)"];
for(const x of must)if(!engine.includes(x))throw new Error('Contrato de fluxo ausente: '+x);
if(map.includes('Evolução de longa vida'))throw new Error('Título removido voltou ao mapa');
if(modal.includes('Descobertas da fase:')||modal.includes('phase-preview-discoveries'))throw new Error('Modal voltou a revelar descobertas');
if(!map.includes("if(group!=='neutron')addPath(from,fork,`branch-fork ${group}`,.46)"))throw new Error('Linha neutron removida voltou ao mapa');
console.log('Campaign phase flow UX OK.');
""",encoding='utf-8')

# Pages checks all touched files and the cross-file contract.
p=Path('.github/workflows/pages.yml')
y=p.read_text(encoding='utf-8')
old="""          node --check assets/js/campaign-fork-links.js
          node --check assets/js/phase-polish.js"""
new="""          node --check assets/js/campaign-fork-links.js
          node --check assets/js/campaign-map.js
          node --check assets/js/campaign-giants-map.js
          node --check assets/js/campaign-phase-modal.js
          node --check assets/js/phase-polish.js"""
y=must_replace(y,old,new,'checks de sintaxe da campanha')
anchor="""      - name: Validate menu discoveries UX
        run: node scripts/validate-menu-discoveries-ux.js
"""
addition=anchor+"""
      - name: Validate campaign phase flow
        run: node scripts/validate-campaign-phase-flow.js
"""
y=must_replace(y,anchor,addition,'validator de fluxo no Pages')
p.write_text(y,encoding='utf-8')

print('Campaign UX migration applied.')
