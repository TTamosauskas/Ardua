const fs=require('fs');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const index=fs.readFileSync('index.html','utf8');
const labels=fs.readFileSync('assets/js/campaign-phase-labels.js','utf8');
const css=fs.readFileSync('assets/css/phase-goal-layout.css','utf8');
const names=fs.readFileSync('assets/js/campaign-phase-names.js','utf8');
const forge=fs.readFileSync('assets/js/campaign-forge-names.js','utf8');
const quarks=fs.readFileSync('assets/js/campaign-quarks-chrome.js','utf8');

assert(index.includes('phase-goal-layout.css?v=20260911-phase-goals-1'),'CSS da nova hierarquia não está versionado no index');
assert(index.includes('campaign-phase-labels.js?v=20260911-scatter-appreciation-1'),'Módulo de títulos/objetivos não está versionado no index');
assert(index.indexOf('campaign-phase-labels.js')<index.indexOf('campaign-phase-names.js'),'Sistema de labels precisa carregar antes dos nomes científicos');
assert(index.indexOf('campaign-phase-labels.js')<index.indexOf('campaign-forge-names.js'),'Sistema de labels precisa carregar antes dos nomes de formação');

assert(css.includes('.objective .goal-line{display:none!important}'),'Objetivo antigo ainda pode aparecer na caixa inferior');
assert(css.includes('.objective .formula-line')&&css.includes('font-weight:950'),'Receita/instrução não recebeu o peso visual do objetivo atual');
assert(css.includes('strong#phaseTitle')&&css.includes('white-space:nowrap'),'Título operacional não está protegido contra quebra de linha');

for(const token of [
 "quarks:'QUARKS'","first_nebulae:'PRIMEIRAS NEBULOSAS'","he_orange:'ANÃ LARANJA'","c:'TRIPLO-ALFA'",
 "white:'ANÃ BRANCA'","binary_neutron_stars:'Sistema binário de estrelas de nêutrons'",
 "WAITING POINT · rp-PROCESS","FREEZE-OUT DO PROCESSO-R","CADEIA RADIOATIVA"
])assert(labels.includes(token),`Identidade contextual ausente: ${token}`);
for(const token of [
 "base='Forme Prótons e Nêutrons'","base='Reúna Hidrogênio'","base='Forme Hélio-4'","base='Forme Hélio-3'","base='Produza Lítio-7'",
 "base='Comprima matéria'","base='Incorpore matéria'","base='Atraia matéria'"
])assert(labels.includes(token),`Objetivo compacto ausente: ${token}`);
assert(labels.includes("primordial_li:'Forme Lítio-7'"),'Lítio primordial perdeu a identificação isotópica no mapa/menu');
assert(labels.includes("return`Processo-s fraco: ${el}`"),'Mapa não preserva identidade do processo-s fraco');
assert(labels.includes("return`Processo-s: ${el}`"),'Mapa não preserva identidade do processo-s');
assert(labels.includes("return`Processo-r: ${el}`"),'Mapa não preserva identidade do processo-r');
assert(labels.includes("return`rp-process: ${el}"),'Mapa não preserva identidade do rp-process');
assert(labels.includes("return`${el} · cadeia radioativa`"),'Mapa não preserva identidade das cadeias radioativas');
assert(labels.includes("G.runtimeOrder?.[index]")&&labels.includes("button.dataset.phaseId=id"),'Menu reconstruído não recebe identificação canônica por índice');
assert(labels.includes('ensureMapObserver()')&&labels.includes("node.id==='campaignMap'"),'Mapa criado depois do módulo não é observado');
assert(labels.includes('fitOneLine(title)'),'Cabeçalho não aplica ajuste de uma linha');

assert(forge.includes('forge[id]=`Forme ${elementName}`'),'Primeira formação ainda não usa “Forme”');
assert(!forge.includes('forge[id]=`Forjar ${elementName}`'),'“Forjar” ainda está ativo na nomenclatura de formação');
assert(forge.includes('L.registerForgeNames?.(names)'),'Forge Names não delega ao modelo unificado');
assert(names.includes('L.registerScientificNames?.(NAMES)'),'Nomes científicos não alimentam o modelo unificado');
assert(names.includes("brown_formation:'Formação da Anã Marrom'"),'Mapa ainda usa Protoestrelas para a formação da Anã Marrom');
assert(names.includes("coronal_jets:'Jatos Coronais'"),'Jatos Coronais não preserva a identidade aprovada');
assert(names.includes("accretion:'Acreção extrema'"),'Acreção extrema não preserva a identidade aprovada');
assert(quarks.includes("const GOAL='Forme Prótons e Nêutrons'")&&quarks.includes("setText('phaseTitle',goal)"),'Quarks não segue a mesma hierarquia de objetivo no título');

console.log('Phase goal hierarchy OK: compact one-line objective, contextual identity, recipe-only box, rebuilt menu/map naming and Quarks parity.');
