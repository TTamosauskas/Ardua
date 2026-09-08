from pathlib import Path
import json

ROOT=Path('.')

def rep1(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old,new,1)

# --- Engine ---------------------------------------------------------------
p=ROOT/'assets/js/ardua.js'
s=p.read_text()

old="function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(handleStellarAtomicTap(p,s))return;if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;"
new="function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(s.coronalJetTutorial&&state.convectionArmed&&handleConvectionTap(p))return;if(handleStellarAtomicTap(p,s))return;if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;"
s=rep1(s,old,new,'prioridade de toque da Convecção em Jatos')

old="""function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionConfirmPending=true;state.convectionArmed=false;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);render();toast('Coluna convectiva marcada · toque novamente para iniciar.');return true;
}"""
new="""function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const s=phase(),cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionArmed=false;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);
 if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}
 state.convectionConfirmPending=true;render();toast('Coluna convectiva marcada · toque novamente para iniciar.');return true;
}"""
s=rep1(s,old,new,'execução direta da Convecção em Jatos')

old="if(s.coronalJetTutorial){const outer=phaseRadius(s),ready=[...state.pieces.values()].some(p=>!p.free&&p.cell!==null&&p.cell!==undefined&&coords[p.cell]?.ring===outer&&p.matterState==='atom'&&pieceCharge(p)>0);if(!ready)return'Átomo + e⁻ → Íon⁺ + 2e⁻';if(state.convectionCharge)return'Selecione a linha com o íon na superfície';return'Reação nuclear no núcleo → Convecção'}"
new="if(s.coronalJetTutorial){const outer=phaseRadius(s),ready=[...state.pieces.values()].some(p=>!p.free&&p.cell!==null&&p.cell!==undefined&&coords[p.cell]?.ring===outer&&p.matterState==='atom'&&pieceCharge(p)>0);if(!ready)return'Átomo + e⁻ → Íon⁺ + 2e⁻';if(state.convectionCharge)return'2º Ative a Convecção e selecione um íon na superfície.';return'1º Provoque uma reação no núcleo estelar'}"
s=rep1(s,old,new,'texto conciso de Jatos')

old="if(s.coronalJetTutorial){$('goalText').textContent=`Ejete matéria pelo campo magnético — ${state.coronalJetCount||0}/${s.target}`;const outer=phaseRadius(s),ready=[...state.pieces.values()].some(p=>!p.free&&p.cell!==null&&p.cell!==undefined&&coords[p.cell]?.ring===outer&&p.matterState==='atom'&&pieceCharge(p)>0);if(!ready)setFormula('Átomo + e⁻ → Íon⁺ + 2e⁻');else if(state.convectionCharge)setFormula('Selecione a linha com o íon na superfície');else setFormula('Reação nuclear no núcleo → carregue a Convecção');return}"
new="if(s.coronalJetTutorial){$('goalText').textContent=`Ejete matéria pelo campo magnético — ${state.coronalJetCount||0}/${s.target}`;const outer=phaseRadius(s),ready=[...state.pieces.values()].some(p=>!p.free&&p.cell!==null&&p.cell!==undefined&&coords[p.cell]?.ring===outer&&p.matterState==='atom'&&pieceCharge(p)>0);if(!ready)setFormula('Átomo + e⁻ → Íon⁺ + 2e⁻');else if(state.convectionCharge)setFormula('2º Ative a Convecção e selecione um íon na superfície.');else setFormula('1º Provoque uma reação no núcleo estelar');return}"
s=rep1(s,old,new,'texto do objetivo de Jatos')

old="const matterClass=p.matterState==='atom'?' atomic-piece':' nucleus-piece';\n  el.className='atom'+matterClass+(p.sym==='Plus'?' proton-piece':'')+"
new="const matterClass=p.matterState==='atom'?' atomic-piece':' nucleus-piece';\n  el.className='atom'+matterClass+(s.coronalJetTutorial?' coronal-uniform':'')+(p.sym==='Plus'?' proton-piece':'')+"
s=rep1(s,old,new,'classe de tamanho uniforme')

old="if(s.coronalJetTutorial){RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:'JATOS CORONAIS',text:'Você usou matéria ionizada da superfície e atividade magnética para produzir jatos coronais.',priority:3,duration:1950,kind:'completion'})}"
new="if(s.coronalJetTutorial){const fresh=registerRewardDiscovery('phenomenon:solarFlare',{kicker:'NOVA DESCOBERTA',title:'ERUPÇÕES SOLARES',text:'Nova descoberta adicionada a Descobertas > Fenômenos.',silent:false,priority:4});if(!fresh)RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:'JATOS CORONAIS',text:'Você usou matéria ionizada da superfície e atividade magnética para produzir jatos coronais.',priority:3,duration:1950,kind:'completion'})}"
s=rep1(s,old,new,'notificação de nova descoberta')

p.write_text(s)

# --- CSS: same footprint for every board piece in this phase -------------
p=ROOT/'assets/css/ardua.css'
s=p.read_text()
rule="\n/* Jatos Coronais: estado eletrônico não altera o tamanho visual das peças. */\n.atom.coronal-uniform{width:var(--cellSize)!important;height:var(--cellSize)!important}\n"
if '.atom.coronal-uniform{' not in s:
    s+=rule
p.write_text(s)

# --- Discovery catalogue --------------------------------------------------
p=ROOT/'assets/js/campaign-discoveries.js'
s=p.read_text()
anchor=" {key:'phenomenon:magneticReconnection',glyph:'⌁',title:'Reconexão Magnética',group:'Processos estelares',text:'Linhas de campo magnético podem mudar de conectividade e liberar energia, acelerando plasma ionizado na atmosfera estelar.',phases:['coronal_jets'],infer:['coronal_jets']},"
entry=" {key:'phenomenon:solarFlare',glyph:'☀',title:'Erupções Solares',group:'Processos estelares',text:'Erupções solares são explosões repentinas na superfície do Sol causadas por mudanças no seu campo magnético. Essas explosões liberam altos níveis de radiação e partículas a altas velocidades que estavam armazenados nas linhas de campo magnético. As linhas de campo magnético formam uma \"sombra\" na fotosfera do Sol, que são as manchas solares.',phases:['coronal_jets'],infer:['coronal_jets']},"
if "key:'phenomenon:solarFlare'" not in s:
    s=rep1(s,anchor,anchor+'\n'+entry,'descoberta Erupções Solares')
p.write_text(s)

# --- Phenomena detail UI: local editorial text overrides Wikipedia intro --
p=ROOT/'assets/js/campaign-discoveries-phenomena.js'
s=p.read_text()
if "'Erupções Solares':'Erupção solar'" not in s:
    s=rep1(s," 'Reconexão Magnética':'Reconexão magnética',"," 'Reconexão Magnética':'Reconexão magnética',\n 'Erupções Solares':'Erupção solar',",'alias Erupções Solares')
s=rep1(s,"intro:firstWikiParagraph(html)||firstExtractParagraph(page.extract)||''","intro:cfg.intro||firstWikiParagraph(html)||firstExtractParagraph(page.extract)||''",'intro local prioritário')
s=rep1(s,"intro:'',glyph}});","intro:cfg.intro||'',glyph}});",'intro local no fallback')
p.write_text(s)

# --- Phenomenon source record ---------------------------------------------
user_text='Erupções solares são explosões repentinas na superfície do Sol causadas por mudanças no seu campo magnético. Essas explosões liberam altos níveis de radiação e partículas a altas velocidades que estavam armazenados nas linhas de campo magnético. As linhas de campo magnético formam uma "sombra" na fotosfera do Sol, que são as manchas solares.'
p=ROOT/'assets/data/phenomenon-sources.json'
data=json.loads(p.read_text())
data['Erupções Solares']={
    'wikiTitle':'Erupção solar',
    'slug':'solar-flare',
    'imagePath':'assets/images/phenomena/solar-flare.jpg',
    'intro':user_text
}
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# --- Source validator count -----------------------------------------------
p=ROOT/'scripts/validate-phenomenon-sources.mjs'
s=p.read_text()
s=rep1(s,"if(entries.length!==53)throw new Error(`Esperados 53 fenômenos, encontrados ${entries.length}`);","if(entries.length!==54)throw new Error(`Esperados 54 fenômenos, encontrados ${entries.length}`);",'contagem de fenômenos')
p.write_text(s)

# --- Discoveries validator -------------------------------------------------
p=ROOT/'scripts/validate-phenomena-discoveries.mjs'
s=p.read_text()
s=rep1(s,"'Convecção Estelar':['stellar_convection'], 'Jatos Coronais':['coronal_jets'], 'Reconexão Magnética':['coronal_jets'], 'Barreira de Coulomb':['coulomb_intro']","'Convecção Estelar':['stellar_convection'], 'Jatos Coronais':['coronal_jets'], 'Reconexão Magnética':['coronal_jets'], 'Erupções Solares':['coronal_jets'], 'Barreira de Coulomb':['coulomb_intro']",'mapa esperado de Erupções Solares')
if "cfg.intro" not in s:
    s=rep1(s,"for(const token of ['phenomena-square-grid','phenomenonDiscoveryDetail','firstWikiParagraph','pageimages','WIKI_ALIASES']){","for(const token of ['phenomena-square-grid','phenomenonDiscoveryDetail','firstWikiParagraph','pageimages','WIKI_ALIASES','cfg.intro']){",'validação de texto editorial')
p.write_text(s)

# --- Coronal-specific regression validator --------------------------------
p=ROOT/'scripts/validate-coronal-jets.js'
s=p.read_text()
if "const css=read('assets/css/ardua.css');" not in s:
    s=rep1(s,"const campaign=read('assets/js/campaign-mode.js');","const campaign=read('assets/js/campaign-mode.js');\nconst css=read('assets/css/ardua.css');",'leitura CSS no validador')
checks="""

// Polimento da interação: em Jatos a Convecção vence a química atômica quando armada
need(engine,"s.coronalJetTutorial&&state.convectionArmed&&handleConvectionTap(p)",'Íon superficial ainda é interceptado pela química antes da Convecção');
need(engine,"if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}",'Jatos Coronais ainda exige um segundo toque para executar a Convecção');
need(engine,"1º Provoque uma reação no núcleo estelar",'Texto do primeiro passo dos Jatos incorreto');
need(engine,"2º Ative a Convecção e selecione um íon na superfície.",'Texto do segundo passo dos Jatos incorreto');
need(engine,"s.coronalJetTutorial?' coronal-uniform':''",'Peças da fase Jatos não recebem classe de tamanho uniforme');
need(css,'.atom.coronal-uniform{width:var(--cellSize)!important;height:var(--cellSize)!important}','Tamanho visual dos átomos/núcleos não foi padronizado em Jatos');

// Nova descoberta editorial com a imagem fornecida pelo jogador
need(discoveries,"key:'phenomenon:solarFlare'",'Descoberta Erupções Solares ausente');
need(discoveries,"title:'Erupções Solares'",'Título Erupções Solares ausente');
need(engine,"registerRewardDiscovery('phenomenon:solarFlare'",'Conclusão de Jatos não registra Erupções Solares');
need(engine,"kicker:'NOVA DESCOBERTA'",'Jogador não é informado da nova descoberta');
need(phenomenaUI,"'Erupções Solares':'Erupção solar'",'Alias de Erupções Solares ausente');
need(phenomenaUI,'cfg.intro||firstWikiParagraph','Texto editorial não tem prioridade sobre a Wikipédia');
need(sources,'"Erupções Solares"','Fonte de Erupções Solares ausente');
need(sources,'assets/images/phenomena/solar-flare.jpg','Imagem anexada não está vinculada a Erupções Solares');
need(sources,'Erupções solares são explosões repentinas na superfície do Sol causadas por mudanças no seu campo magnético.','Texto solicitado para Erupções Solares ausente');
if(!fs.existsSync('assets/images/phenomena/solar-flare.jpg'))fail('Imagem local de Erupções Solares ausente');
"""
marker="\nconsole.log('Coronal jets OK: química cumulativa, ejeção superficial antes da Convecção, tutorial 0/2, rota e descobertas validados.');"
if 'Polimento da interação: em Jatos' not in s:
    s=rep1(s,marker,checks+marker,'novos contratos de Jatos')
p.write_text(s)

print('Coronal jet polish patch applied.')
