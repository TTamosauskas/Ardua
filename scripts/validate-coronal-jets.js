const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const engine=read('assets/js/ardua.js');
const graph=read('assets/js/campaign-graph.js');
const giant=read('assets/js/campaign-giants-map.js');
const discoveries=read('assets/js/campaign-discoveries.js');
const phenomenaUI=read('assets/js/campaign-discoveries-phenomena.js');
const sources=read('assets/data/phenomenon-sources.json');
const campaign=read('assets/js/campaign-mode.js');
const css=read('assets/css/ardua.css');
function fail(msg){throw new Error(msg)}
function need(hay,token,msg){if(!hay.includes(token))fail(msg||`Ausente: ${token}`)}

need(engine,"id:'coronal_jets'",'Fase Jatos Coronais ausente do motor');
need(engine,"title:'Jatos Coronais'",'Título da fase Jatos Coronais ausente');
need(engine,"coronalJetTutorial:true",'Flag pedagógica dos Jatos Coronais ausente');
need(engine,"target:2",'Jatos Coronais deve exigir duas ejeções');
need(engine,'Ejete matéria pelo campo magnético — ${state.coronalJetCount||0}/${s.target}','Objetivo 0/2 dos Jatos Coronais ausente');
need(engine,"PRODUCT_LESSONS",'Sistema de tooltip científico ausente');
need(engine,"coronalJet:{title:'JATOS CORONAIS'",'Tooltip de Jatos Coronais ausente');
need(engine,"await teachProductOnce('coronalJet'",'Primeiro Jato Coronal não passa pelo tooltip/Continuar');

need(engine,'function stellarAtomicChemistryAllowed','Gate cumulativo de química estelar ausente');
need(engine,"campaignKnowledgeReached('stellar_ionization')",'Ionização não é cumulativa após sua apresentação');
need(engine,"campaignKnowledgeReached('stellar_recombination')",'Recombinação não é cumulativa após sua apresentação');
need(engine,'function prepareCumulativeStellarAtomicMatter','Preparação de átomos nas fases posteriores ausente');
need(engine,"matterState='atom'",'Conversão de matéria periférica para átomos ausente');
need(engine,'stellarAtomicChemistryAllowed(phase())','Drift/uso cumulativo da química estelar não acompanha fases posteriores');

need(engine,'function coronalJetMechanicUnlocked','Gate permanente de Jatos Coronais ausente');
need(engine,"campaignKnowledgeReached('coronal_jets')",'Jatos Coronais não ficam cumulativos após a apresentação');
need(engine,'function coronalJetIonAtPathEdge','Detecção do íon superficial ausente');
need(engine,'phaseRadius(s)','Jato Coronal não limita a ejeção à camada mais externa');
need(engine,'pieceCharge(p)>0','Jato Coronal não exige matéria ionizada');
need(engine,"for(const kind of ['p','e'])",'Jato deve carregar somente partículas livres carregadas previstas');
if(/coronalJetChargedCompanions[\s\S]{0,900}\['p','e','n'\]/.test(engine))fail('Nêutrons estão sendo tratados como partículas guiadas pelo Jato Coronal');

const perform=engine.indexOf('async function performConvection(path)');
if(perform<0)fail('Rotina de Convecção ausente');
const block=engine.slice(perform,perform+6500);
const jetToken='await maybeEjectCoronalJet(path,s)';
const jet=block.indexOf(jetToken);
const recalc=jet<0?-1:block.indexOf('occupied=path.filter',jet+jetToken.length);
const reorder=block.indexOf('reversed=[...ids].reverse()');
if(jet<0)fail('Convecção não verifica Jato Coronal');
if(recalc<0||recalc<jet)fail('Linha convectiva não é recalculada após a ejeção');
if(reorder<0||reorder<jet)fail('Jato Coronal precisa acontecer antes da reorganização da linha');
if(block.includes('dest=occupied.map'))fail('Convecção foi alterada para rotação cíclica em vez da inversão histórica');
if(block.indexOf('maybeEjectCoronalJet',jet+jetToken.length)>=0)fail('Há uma segunda verificação de Jato depois da Convecção');
need(block,'state.convectionMoves=(state.convectionMoves||0)+1','Convecção deixou de contabilizar/reorganizar normalmente');

need(engine,"createPiece('He',jetCell,false,{matterState:'atom',boundElectrons:1})",'Fase não começa com um He+ na superfície');
need(engine,"createPiece('He',neutralCell,false,{matterState:'atom',boundElectrons:2})",'Segundo átomo neutro de Hélio na superfície ausente');
need(engine,'ensurePrimordialParticleMix({p:3,e:3,n:1})','População inicial 3p/3e/1n dos Jatos Coronais ausente');
need(engine,'if(s?.coronalJetTutorial){ensurePrimordialParticleMix({p:1,n:1,e:1})','Piso 1p/1e/1n do tutorial não é preservado');

const gi=graph.indexOf('"stellar_convection"'),gj=graph.indexOf('"coronal_jets"'),gl=graph.indexOf('"stellar_li"');
if(!(gi>=0&&gj>gi&&gl>gj))fail('Jatos Coronais não está imediatamente entre Convecção e Lítio na ordem canônica');
need(graph,'"coronal_jets":{"allOf":["stellar_convection","stellar_recombination"]}','Jatos Coronais deve exigir Convecção e Recombinação aprendidas');
need(graph,'"stellar_li":{"allOf":["coronal_jets"]}','Lítio deve vir depois de Jatos Coronais');
need(giant,"'stellar_convection','coronal_jets','stellar_li'",'Mapa intermediário não posiciona Jatos Coronais depois de Convecção');

need(discoveries,"key:'phenomenon:coronalJet'",'Descoberta Jatos Coronais ausente');
need(discoveries,"key:'phenomenon:magneticReconnection'",'Descoberta Reconexão Magnética ausente');
need(phenomenaUI,"'Jatos Coronais'",'Alias Wikipedia de Jatos Coronais ausente');
need(phenomenaUI,"'Reconexão Magnética'",'Alias Wikipedia de Reconexão Magnética ausente');
need(sources,'"Jatos Coronais"','Fonte de fenômeno Jatos Coronais ausente');
need(sources,'"Reconexão Magnética"','Fonte de fenômeno Reconexão Magnética ausente');
need(campaign,'version:15','Migração de campanha v15 ausente');
need(campaign,"'coronal_jets'",'Migração de campanha não conhece Jatos Coronais');

// Interação cumulativa: a Convecção vence a química atômica quando armada e usa a mesma confirmação em três passos
need(engine,"state.convectionArmed&&handleConvectionTap(p)",'Convecção armada não tem prioridade sobre a química atômica');
need(engine,"state.convectionConfirmPending=true",'Jatos Coronais deve primeiro marcar a linha antes de executar');
need(engine,"path.includes(p.cell)",'Jatos Coronais deve confirmar somente ao clicar em um átomo da linha vermelha');
if(engine.includes("if(s.coronalJetTutorial){state.convectionConfirmPending=false;render();performConvection([...path]);return true}"))fail('Jatos Coronais ainda executa imediatamente no primeiro átomo da linha');
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

console.log('Coronal jets OK: química cumulativa, ejeção superficial antes da Convecção, tutorial 0/2, rota e descobertas validados.');
