const fs=require('fs');
const recipe=fs.readFileSync('assets/js/recipe-audio-sync.js','utf8');

const required=[
  'const cadence=new Map([[105,210],[75,150],[28,56],[32,64],[285,570],[115,230],[70,140],[42,84]])',
  "cadence:Object.freeze({note2To3:'2x',note3ToChord:'2x'})",
  'third and the pause from the third note to the union/chord use the same 2x cadence'
];
for(const token of required){
  if(!recipe.includes(token))throw new Error(`Contrato de cadência alvo ausente: ${token}`);
}
for(const legacy of ['[285,855]','[115,345]','[70,210],[42,126]',"note3ToChord:'3x'"]){
  if(recipe.includes(legacy))throw new Error(`Regressão: intervalo 3ª nota → acorde voltou a ser mais longo (${legacy})`);
}
console.log('Target recipe audio cadence OK: note 2→3 equals note 3→chord (2x).');
