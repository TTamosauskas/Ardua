const fs=require('fs');
const engine=fs.readFileSync('assets/js/ardua.js','utf8');
const ui=fs.readFileSync('assets/js/beta-bonus-ui.js','utf8');
const css=fs.readFileSync('assets/css/beta-bonus.css','utf8');
const html=fs.readFileSync('index.html','utf8');
function fail(msg){console.error(`beta bonus validation: ${msg}`);process.exit(1)}
function need(src,text,msg){if(!src.includes(text))fail(msg)}
const expected={
 weak_s_ga:{target:'He',rounds:1},
 weak_s_se:{target:'C',rounds:2},
 nb:{target:'O',rounds:3},
 la:{target:'Ne',rounds:3},
 nd:{target:'Mg',rounds:3},
 rb:{target:'Si',rounds:4},
 rh:{target:'Ca',rounds:2},
 sb:{target:'Fe',rounds:3}
};
for(const [id,b] of Object.entries(expected))need(engine,`${id}:Object.freeze({target:'${b.target}',rounds:${b.rounds}})`,`${id} sem bônus fixo esperado`);
const targets=Object.values(expected).map(x=>x.target);if(new Set(targets).size!==targets.length)fail('os oito primeiros alvos precisam ser únicos');
if(Object.values(expected).some(x=>x.rounds<1||x.rounds>4))fail('rodadas fora da escala 1–4');
need(engine,"bonusForgeCount:b.rounds",'quantidade do bônus precisa seguir a duração beta');
need(engine,"state.nuclearRound+g.betaRounds+1",'relógio beta precisa iniciar depois da captura');
need(engine,"startBetaForgeBonus(s,piece)",'espera beta precisa iniciar o objetivo bônus');
need(engine,"creditBetaForgeBonus(r.out)",'forja precisa creditar o objetivo bônus');
need(engine,"ensureBetaForgeOpportunity();",'grade precisa recompor oportunidade adjacente');
need(engine,"hasAdjacentRecipe(r)",'oportunidade bônus precisa priorizar receita adjacente');
need(engine,"finishBetaForgeBonus(false)",'fim da espera precisa encerrar a janela bônus');
const recipeAnchors={He:"He:{ing:['He3','He3'],out:'He'",C:"C:{ing:['Be8','He'],out:'C'",O:"O:{ing:['C','He'],out:'O'",Ne:"Ne:{ing:['O','He'],out:'Ne'",Mg:"Mg:{ing:['Ne','He'],out:'Mg'",Si:"Si:{ing:['Mg','He'],out:'Si'",Ca:"Ca:{ing:['Ar','He'],out:'Ca'",Fe:"Fe:{ing:['Mn','H'],out:'Fe'"};
for(const t of targets)need(engine,recipeAnchors[t],`receita de ${t} ausente`);
need(ui,'Enquanto o núcleo decai...','texto fixo do bônus ausente');
need(ui,'BÔNUS CONCLUÍDO','feedback de conclusão ausente');
need(css,'.beta-bonus-modal','estilo do modal ausente');
need(css,'.beta-bonus-hud','estilo do HUD ausente');
need(html,'assets/css/beta-bonus.css','CSS do bônus fora do HTML');
need(html,'assets/js/beta-bonus-ui.js','JS do bônus fora do HTML');
console.log('Beta forge bonus architecture validated.');
