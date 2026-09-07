const fs=require('fs');
const path='assets/js/ardua.js';
let s=fs.readFileSync(path,'utf8');
function once(from,to,label){const i=s.indexOf(from);if(i<0)throw new Error(`Âncora ausente: ${label}`);if(s.indexOf(from,i+1)>=0)throw new Error(`Âncora duplicada: ${label}`);s=s.slice(0,i)+to+s.slice(i+from.length)}
function patchFile(file,from,to,label){let text=fs.readFileSync(file,'utf8');if(text.includes(to))return;if(!text.includes(from))throw new Error(`Âncora ausente em ${label}`);text=text.replace(from,to);fs.writeFileSync(file,text)}

once(
"function configureNeutronGameplay(phases){",
`const BETA_FORGE_BONUSES=Object.freeze({
 weak_s_ga:Object.freeze({target:'He',rounds:1}),
 weak_s_se:Object.freeze({target:'C',rounds:2}),
 nb:Object.freeze({target:'O',rounds:3}),
 la:Object.freeze({target:'Ne',rounds:3}),
 nd:Object.freeze({target:'Mg',rounds:3}),
 rb:Object.freeze({target:'Si',rounds:4}),
 rh:Object.freeze({target:'Ca',rounds:2}),
 sb:Object.freeze({target:'Fe',rounds:3})
});
function configureNeutronGameplay(phases){`,
'beta bonus map');

once(
" set(['rb','rh','sb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true});",
" set(['rb','rh','sb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true});\n for(const [id,b] of Object.entries(BETA_FORGE_BONUSES)){const p=byId.get(id);if(p)Object.assign(p,{neutronBetaRounds:b.rounds,bonusForgeTarget:b.target,bonusForgeCount:b.rounds})}",
'beta bonus phase assignment');

once(
"neutronBetaWaits:0,neutronFreezeouts:0",
"neutronBetaWaits:0,betaBonusActive:false,betaBonusOffered:false,betaBonusCompleted:false,betaBonusTarget:null,betaBonusRequired:0,betaBonusProgress:0,betaBonusPieceId:null,betaBonusExpiresRound:null,neutronFreezeouts:0",
'beta bonus state');

once(
`}\nfunction neutronSourceLabel(s=phase()){`,
`}\nfunction emitBetaForgeBonus(type,extra={}){\n try{window.dispatchEvent(new CustomEvent(\`ardua:beta-bonus-\${type}\`,{detail:{phaseId:phase()?.id||'',target:state.betaBonusTarget||'',targetName:E[state.betaBonusTarget]?.name||state.betaBonusTarget||'',required:state.betaBonusRequired||0,progress:state.betaBonusProgress||0,...extra}}))}catch(_e){}\n}\nfunction betaForgeRecipe(s=phase()){if(!s?.bonusForgeTarget)return null;return Object.values(FUSIONS).find(r=>r.out===s.bonusForgeTarget)||null}\nfunction betaBonusCellReplaceable(cell,s=phase()){\n if(cell===null||cell===undefined||state.selected.includes(cell))return false;const id=state.board[cell];if(!id)return true;const p=state.pieces.get(id);if(!p)return true;\n return !p.neutronBetaPending&&p.id!==state.betaBonusPieceId&&p.sym!==s.seed&&p.sym!==s.new&&p.sym!==state.betaBonusTarget;\n}\nfunction clearBetaBonusCell(cell){const id=state.board[cell];if(id){state.pieces.delete(id);state.board[cell]=null}}\nfunction placeBetaForgeOpportunity(r,s=phase()){\n if(!r)return false;const active=activeSet(),cells=activeCells().slice().sort((a,b)=>(coords[b]?.ring??0)-(coords[a]?.ring??0)||Math.random()-.5);\n for(const center of cells){if(!betaBonusCellReplaceable(center,s))continue;const near=(neigh[center]||[]).filter(n=>active.has(n)&&betaBonusCellReplaceable(n,s)).sort(()=>Math.random()-.5);if(near.length<r.ing.length-1)continue;const group=[center,...near.slice(0,r.ing.length-1)];group.forEach(clearBetaBonusCell);group.forEach((cell,i)=>createPiece(r.ing[i],cell,false));renderPieces();return true}\n return false;\n}\nfunction ensureBetaForgeOpportunity(s=phase()){\n if(!state.betaBonusActive||state.betaBonusProgress>=state.betaBonusRequired)return false;const r=betaForgeRecipe(s);if(!r)return false;if(hasAdjacentRecipe(r))return true;return placeBetaForgeOpportunity(r,s);\n}\nfunction finishBetaForgeBonus(completed=false){\n if(!state.betaBonusOffered)return;state.betaBonusActive=false;state.betaBonusCompleted=!!completed;emitBetaForgeBonus('end',{completed:!!completed});\n}\nfunction startBetaForgeBonus(s,p){\n if(!s?.bonusForgeTarget||state.betaBonusOffered||!p)return false;state.betaBonusOffered=true;state.betaBonusActive=true;state.betaBonusCompleted=false;state.betaBonusTarget=s.bonusForgeTarget;state.betaBonusRequired=Math.max(1,s.bonusForgeCount||neutronGameplay(s).betaRounds);state.betaBonusProgress=0;state.betaBonusPieceId=p.id;state.betaBonusExpiresRound=p.neutronBetaReadyRound;ensureBetaForgeOpportunity(s);emitBetaForgeBonus('start');return true;\n}\nfunction creditBetaForgeBonus(sym){\n if(!state.betaBonusActive||sym!==state.betaBonusTarget)return false;state.betaBonusProgress=Math.min(state.betaBonusRequired,state.betaBonusProgress+1);emitBetaForgeBonus('progress');if(state.betaBonusProgress>=state.betaBonusRequired)finishBetaForgeBonus(true);return true;\n}\nfunction neutronSourceLabel(s=phase()){`,
'beta bonus helpers');

once(
"piece.neutronBetaReadyRound=state.nuclearRound+g.betaRounds;state.neutronBetaWaits++;state.selected=[];captureTag(piece.x,piece.y,`β− em ${g.betaRounds} rodadas`);tone(590,.08,'sine',.028);renderPieces();",
"piece.neutronBetaReadyRound=state.nuclearRound+g.betaRounds+1;state.neutronBetaWaits++;state.selected=[];captureTag(piece.x,piece.y,`β− em ${g.betaRounds} rodadas`);tone(590,.08,'sine',.028);renderPieces();startBetaForgeBonus(s,piece);",
'beta timer starts after capture');

once(
" for(const p of pending){const tr=p.neutronBetaTransition;if(!tr)continue;if(neutronGameplay(s).pattern==='branch'){await teachProductOnce('branching',p.x,p.y);state.neutronBranchesObserved++}clearNeutronPending(p);await betaTransform(p,s,tr)}",
" for(const p of pending){const tr=p.neutronBetaTransition;if(!tr)continue;if(state.betaBonusActive&&state.betaBonusPieceId===p.id)finishBetaForgeBonus(false);if(neutronGameplay(s).pattern==='branch'){await teachProductOnce('branching',p.x,p.y);state.neutronBranchesObserved++}clearNeutronPending(p);await betaTransform(p,s,tr)}",
'beta bonus window end');

once(
"state.discovered.add(r.out);grantConvectionFromCells(cells,phase());",
"state.discovered.add(r.out);creditBetaForgeBonus(r.out);grantConvectionFromCells(cells,phase());",
'credit bonus forge');

once(
"await afterNuclearAction({advanceRound:true,forceBoardPulse:true,protectedPieceIds:protectedIds});const chainCtx=state.chainAutoContext",
"await afterNuclearAction({advanceRound:true,forceBoardPulse:true,protectedPieceIds:protectedIds});ensureBetaForgeOpportunity();const chainCtx=state.chainAutoContext",
'keep fusion opportunity after stellar motion');

once(
" await afterNuclearAction({advanceRound:true});\n // Se a rota exige várias capturas",
" await afterNuclearAction({advanceRound:true});ensureBetaForgeOpportunity();\n // Se a rota exige várias capturas",
'keep opportunity after neutron capture');

once(
"state.neutronBetaWaits=0;state.neutronFreezeouts=0;",
"state.neutronBetaWaits=0;state.betaBonusActive=false;state.betaBonusOffered=false;state.betaBonusCompleted=false;state.betaBonusTarget=null;state.betaBonusRequired=0;state.betaBonusProgress=0;state.betaBonusPieceId=null;state.betaBonusExpiresRound=null;emitBetaForgeBonus('reset');state.neutronFreezeouts=0;",
'reset beta bonus by phase');

fs.writeFileSync(path,s);

patchFile('index.html','<link rel="stylesheet" href="assets/css/phase-polish.css"/>','<link rel="stylesheet" href="assets/css/phase-polish.css"/>\n<link rel="stylesheet" href="assets/css/beta-bonus.css"/>','beta bonus CSS');
patchFile('index.html','<script src="assets/js/ardua.js"></script>','<script src="assets/js/ardua.js"></script>\n<script src="assets/js/beta-bonus-ui.js"></script>','beta bonus UI');
patchFile('.github/workflows/pages.yml','      - name: Validate cumulative recipe architecture\n        run: node scripts/validate-cumulative-recipes.js','      - name: Validate cumulative recipe architecture\n        run: node scripts/validate-cumulative-recipes.js\n\n      - name: Validate beta forge bonuses\n        run: node scripts/validate-beta-forge-bonus.js','beta bonus deploy validator');

console.log('Beta forge bonus mechanics applied.');
