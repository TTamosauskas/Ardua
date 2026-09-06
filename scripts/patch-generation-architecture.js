const fs=require('fs');
const path='index.html';let html=fs.readFileSync(path,'utf8');
function once(from,to,label){const n=html.split(from).length-1;if(n!==1)throw new Error(`${label}: expected 1 anchor, got ${n}`);html=html.replace(from,to)}
once('<link rel="stylesheet" href="assets/css/campaign-quasar.css"/>','<link rel="stylesheet" href="assets/css/campaign-quasar.css"/>\n<link rel="stylesheet" href="assets/css/campaign-generations.css"/>','generation css');
once('<script src="assets/js/campaign-graph.js"></script>','<script src="assets/js/campaign-graph.js"></script>\n<script src="assets/js/campaign-generations.js"></script>','generation metadata');
once('<script src="assets/js/campaign-fork-links.js"></script>','<script src="assets/js/campaign-fork-links.js"></script>\n<script src="assets/js/campaign-generations-map.js"></script>','generation map');
fs.writeFileSync(path,html);
