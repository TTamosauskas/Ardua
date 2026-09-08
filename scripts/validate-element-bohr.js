const fs=require('fs');
function fail(message){console.error(`element-bohr validation failed: ${message}`);process.exit(1)}
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/campaign-element-bohr.js','utf8');
const css=fs.readFileSync('assets/css/campaign-element-bohr.css','utf8');
const cssRef='assets/css/campaign-element-bohr.css',jsRef='assets/js/campaign-element-bohr.js',discoveriesRef='assets/js/campaign-discoveries-elements.js';
if(!js.includes(cssRef))fail('runtime must load the Bohr stylesheet');
if(!html.includes(jsRef))fail('script must be loaded by index.html');
if(html.indexOf(jsRef)<html.indexOf(discoveriesRef))fail('Bohr enhancer must load after element discoveries');
for(const token of ['class BohrView','shellsFor','SHELL_EXCEPTIONS','ARDUA_ROTATION','pointerdown','pointermove','element-bohr-restore','figureState'])if(!js.includes(token))fail(`missing runtime contract: ${token}`);
for(const token of ['[24,[2,8,13,1]]','[29,[2,8,18,1]]','[79,[2,8,18,32,18,1]]','[92,[2,8,18,32,21,9,2]]'])if(!js.includes(token))fail(`missing shell-distribution regression: ${token}`);
for(const token of ['.element-bohr-preview','.element-bohr-stage','.element-bohr-canvas-stage','touch-action:none','@media(max-width:420px)'])if(!css.includes(token))fail(`missing presentation contract: ${token}`);
console.log('element Bohr model validation passed');
