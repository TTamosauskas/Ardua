const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const chrome=read('assets/js/campaign-quarks-chrome.js');
const css=read('assets/css/campaign-quarks.css');
const engine=read('assets/js/ardua.js');
const index=read('index.html');
function expect(condition,message){if(!condition)throw new Error(`Quarks chrome validation: ${message}`)}
function before(a,b){return index.indexOf(a)>=0&&index.indexOf(b)>=0&&index.indexOf(a)<index.indexOf(b)}

expect(chrome.includes("const GOAL='Forje os primeiros bárions'"),'visible objective must be Forje os primeiros bárions');
expect(chrome.includes("const FORMULA='3 quarks → 1 próton ou nêutron'"),'visible recipe must be the three-quark baryon recipe');
expect(chrome.includes("const NEXT_LABEL='Próxima fase'"),'final circular button must say Próxima fase');
expect(chrome.includes("setText('phaseEndBtn',NEXT_LABEL)"),'Quarks must own the final button label even after native updates');
expect(chrome.includes("'formulaText','phaseEndBtn'"),'final button text must be observed with the rest of the Quarks chrome');
expect(chrome.includes("setText('phaseTitle','Quarks')"),'visible phase title must stay Quarks');
expect(chrome.includes("function setClass(el,name,enabled){if(el&&el.classList.contains(name)!==enabled)el.classList.toggle(name,enabled)}"),'class ownership must be idempotent so its MutationObserver cannot feed itself');
expect(chrome.includes("setClass(document.body,'prebang',false)")&&chrome.includes("setClass(document.body,'bigbang-phase',false)"),'legacy Big Bang visual state must be removed while Quarks owns the board');
expect(!chrome.includes("document.body.classList.add('quarks-phase-active')")&&!chrome.includes("document.body.classList.remove('prebang','bigbang-phase')"),'body class observer must not perform unconditional class writes');
expect(chrome.includes("window.addEventListener('ardua:quarks-phase-start',startOwnership)"),'chrome ownership must start with the custom Quarks phase');
expect(chrome.includes("window.addEventListener('ardua:quarks-phase-stop',stopOwnership)"),'chrome ownership must stop when leaving Quarks');
expect(chrome.includes('new MutationObserver(applyQuarksChrome)'),'late native engine renders must not overwrite Quarks title/objective/recipe');
expect(css.includes('html.quarks-phase-root,body.quarks-phase-active{background:#9f0814!important'),'Quarks page background must use the primordial-H red');
expect(css.includes('rgba(255,80,40,.36)')&&css.includes('rgba(255,35,20,.15)'),'Quarks open board must use the same red primordial glow language as deuterium');
expect(css.includes('.quarks-baryon{')&&css.includes('width:38px!important;height:38px!important;font-size:21px!important'),'formed protons and neutrons must be slightly larger only in the Quarks custom stage');
expect(css.includes('@media(max-width:390px)')&&css.includes('.quarks-baryon{width:35px!important;height:35px!important;font-size:19px!important}'),'Quarks-only baryon enlargement must remain proportional on small screens');
expect(!css.includes('background:linear-gradient(180deg,rgba(30,38,78,.18),rgba(12,10,32,.05))'),'old blue Quarks board theme must not return');
expect(engine.includes("primordialH:'#9f0814'"),'native deuterium primordial theme reference must remain #9f0814');
expect(before('assets/js/campaign-quarks.js','assets/js/campaign-quarks-chrome.js'),'Quarks chrome owner must load after the custom phase runtime');
expect(before('assets/js/campaign-quarks-chrome.js','assets/js/campaign-map.js'),'Quarks chrome owner must be ready before map interaction launches the phase');

console.log('Quarks chrome OK: Próxima fase label, Quarks-only baryon size, observer safety and red theme verified.');
