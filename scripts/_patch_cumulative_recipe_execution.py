from pathlib import Path

engine_path=Path('assets/js/ardua.js')
engine=engine_path.read_text()
old="""function handleStellarAtomicTap(piece,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!piece||piece.free)return false;const electron=stellarAtomicSelectedElectron();
 if(stellarIonizationEligible(piece,s)){if(electron){ionizeStellarAtom(piece,electron);return true}state.selected=[piece.cell];state.primordialSelected=null;tone(350,.04,'sine',.022);render();return true}
"""
new="""function handleStellarAtomicTap(piece,s=phase()){
 if(!stellarAtomicChemistryAllowed(s)||!piece||piece.free)return false;const electron=stellarAtomicSelectedElectron();
 // Quimica atomica herdada e passiva nunca pode roubar um toque que a camada cumulativa
 // ja prometeu como fusao valida. Fases atomicas dedicadas ou um eletron explicitamente
 // selecionado continuam tendo prioridade sobre a fusao.
 if(!stellarAtomicMode(s)&&!electron&&cumulativeFusionTapAvailable(piece,s))return false;
 if(stellarIonizationEligible(piece,s)){if(electron){ionizeStellarAtom(piece,electron);return true}state.selected=[piece.cell];state.primordialSelected=null;tone(350,.04,'sine',.022);render();return true}
"""
if old in engine:
    engine=engine.replace(old,new,1)
elif "if(!stellarAtomicMode(s)&&!electron&&cumulativeFusionTapAvailable(piece,s))return false;" not in engine:
    raise SystemExit('handleStellarAtomicTap anchor not found')
engine_path.write_text(engine)

validator_path=Path('scripts/validate-cumulative-recipes.js')
validator=validator_path.read_text()
marker="console.log('Cumulative recipe contract validation passed.');"
addition=r"""
// Uma borda verde e uma receita reconhecida precisam compartilhar o mesmo executor.
// Em fases estelares posteriores, a quimica atomica aprendida e passiva nao pode consumir
// o toque antes da fusao cumulativa; somente uma fase atomica dedicada ou um eletron
// explicitamente selecionado pode ter prioridade.
const atomicTapStart=s.indexOf('function handleStellarAtomicTap');
const atomicTapEnd=s.indexOf('\nfunction ',atomicTapStart+10);
const atomicTap=s.slice(atomicTapStart,atomicTapEnd);
if(atomicTapStart<0||atomicTapEnd<0)fail('Handler de quimica atomica perdeu a ancora');
const passiveYield="if(!stellarAtomicMode(s)&&!electron&&cumulativeFusionTapAvailable(piece,s))return false;";
if(!atomicTap.includes(passiveYield))fail('Quimica atomica passiva pode roubar um toque de fusao cumulativa');

// O caso que revelou a regressao: C + He -> O foi aprendido em Forjar Oxigenio e deve
// continuar executavel em Forjar Fosforo e em qualquer fase posterior compativel.
const oxygenRecipe=s.indexOf("O:{ing:['C','He'],out:'O',emissions:['gamma']}");
const oxygenPhase=s.indexOf("{id:'o',branch:'Formação de Oxigênio'");
const phosphorusPhase=s.indexOf("{id:'p',branch:'Microfase · rede de estrela massiva'");
if(oxygenRecipe<0)fail('Receita C + He -> O ausente do catalogo de fusoes');
if(oxygenPhase<0||phosphorusPhase<0||oxygenPhase>=phosphorusPhase)fail('Oxigenio precisa ser aprendido antes de Fosforo');

// A memoria de fusao deve percorrer TODAS as fases realmente alcancadas e acumular cada
// phaseFusionRecipes, em vez de substituir a memoria pela receita da fase atual.
const learnedFusionStart=s.indexOf('function learnedFusionRecipes(){');
const learnedFusionEnd=s.indexOf('const STELLAR_SANDBOX_VISUALS',learnedFusionStart);
const learnedFusion=s.slice(learnedFusionStart,learnedFusionEnd);
if(learnedFusionStart<0||learnedFusionEnd<0)fail('Memoria cumulativa de fusao perdeu a ancora');
for(const token of [
 'for(let i=0;i<PHASES.length;i++)',
 "if(!reached(p,i)||p.mode!=='fusion')continue",
 'phaseFusionRecipes(p).forEach',
 'done.has(p.id)||p.id===currentId'
])if(!learnedFusion.includes(token))fail('Memoria de fusao deixou de acumular fases anteriores: '+token);
if(!s.includes("const r=FUSIONS[s.new];\n  return r?[r]:[];"))fail('Fases de fusao precisam registrar sua receita no catalogo cumulativo');

// Se o primeiro reagente mostra parceiros validos, o segundo toque deve chegar a fuse().
const tapStart=s.indexOf('function handleFusionTap(p){');
const tapEnd=s.indexOf('\nfunction cumulativeFusionTapAvailable',tapStart);
const tapBlock=s.slice(tapStart,tapEnd);
for(const token of ['const test=[...selectedSyms(),p.sym],ex=exactRecipe(test)','setTimeout(()=>fuse(ex),95)'])
 if(!tapBlock.includes(token))fail('Selecao cumulativa perdeu caminho de execucao: '+token);
"""
if addition.strip() not in validator:
    if marker not in validator: raise SystemExit('validator marker missing')
    validator=validator.replace(marker,addition+'\n'+marker,1)
validator_path.write_text(validator)

contract_path=Path('CUMULATIVE_RECIPE_CONTRACT.md')
contract=contract_path.read_text()
contract_add="""
\n### Prioridade entre mecânicas aprendidas\n\nUma indicação visual de candidato válido é uma promessa de execução. Se `cumulativeFusionTapAvailable(...)` reconhecer o toque como parte de uma fusão aprendida, nenhum handler **passivo** de uma mecânica antiga pode consumir esse toque antes do executor da fusão. Mecânicas explicitamente armadas (por exemplo, um elétron já selecionado) e fases dedicadas àquela mecânica conservam prioridade. Fora desses casos, a receita cumulativa tem precedência.\n\nEste contrato vale para todas as fases posteriores: por exemplo, depois de aprender `C + He → O`, essa transformação deve continuar executável em **Forjar Fósforo** e em toda superfície posterior compatível sempre que Carbono e Hélio estiverem disponíveis.\n"""
if '### Prioridade entre mecânicas aprendidas' not in contract:
    contract += contract_add
contract_path.write_text(contract)
