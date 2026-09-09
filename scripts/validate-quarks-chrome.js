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
expect(chrome.includes("setText('phaseTitle','Quarks')"),'visible phase title must stay Quarks');
expect(chrome.includes("document.body.classList.remove('prebang','bigbang-phase')"),'legacy Big Bang visual state must be removed while Quarks owns the board');
expect(chrome.includes("window.addEventListener('ardua:quarks-phase-start',startOwnership)"),'chrome ownership must start with the custom Quarks phase');
expect(chrome.includes("window.addEventListener('ardua:quarks-phase-stop',stopOwnership)"),'chrome ownership must stop when leaving Quarks');
expect(chrome.includes('new MutationObserver(applyQuarksChrome)'),'late native engine renders must not overwrite Quarks title/objective/recipe');
expect(css.includes('html.quarks-phase-root,body.quarks-phase-active{background:#9f0814!important'),'Quarks page background must use the primordial-H red');
expect(css.includes('rgba(255,80,40,.36)')&&css.includes('rgba(255,35,20,.15)'),'Quarks open board must use the same red primordial glow language as deuterium');
expect(!css.includes('background:linear-gradient(180deg,rgba(30,38,78,.18),rgba(12,10,32,.05))'),'old blue Quarks board theme must not return');
expect(engine.includes("primordialH:'#9f0814'"),'native deuterium primordial theme reference must remain #9f0814');
expect(before('assets/js/campaign-quarks.js','assets/js/campaign-quarks-chrome.js'),'Quarks chrome owner must load after the custom phase runtime');
expect(before('assets/js/campaign-quarks-chrome.js','assets/js/campaign-map.js'),'Quarks chrome owner must be ready before map interaction launches the phase');

console.log('Quarks chrome OK: title, baryon objective, recipe and deuterium-red theme are protected from Big Bang inheritance.');
