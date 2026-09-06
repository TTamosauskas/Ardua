/* Ardua — generations are pedagogical enrichment chapters; phase membership marks where a production route is first taught. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;if(!G)return;
const expand=ids=>ids.flatMap(id=>G.atlas.filter(a=>a.anchor===id).map(a=>a.id).concat(id));
const uniq=xs=>[...new Set(xs.filter(Boolean))];
const seq=name=>G.sequences?.[name]||[];
const prologue=uniq(['bigbang','primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td',...seq('atomic')]);
const first=uniq([...seq('brown'),...seq('red'),...seq('mid'),...seq('high'),...seq('collapse'),'nu_f','first_enrichment']);
const second=uniq(['second_birth',...seq('interstellar'),...seq('weakS'),...seq('sprocess'),'gamma_process','second_enrichment']);
const third=uniq(['third_birth','pulsar','accretion','binary_neutron_stars','kilonova',...seq('r'),...seq('decay'),...seq('rp')]);
const remnants=new Set(['white','neutron_star','black_hole','quasar']);
const defs=Object.freeze({
 prologue:Object.freeze({id:'prologue',title:'Universo Primordial',short:'Prólogo',description:'A matéria-prima cósmica surge antes das estrelas.',birthSymbols:Object.freeze([]),productionSummary:'H, He e Li surgem antes das gerações estelares.',members:Object.freeze(expand(prologue))}),
 first:Object.freeze({id:'first',number:1,title:'Primeira Geração',short:'1ª geração',description:'Estrelas formadas de matéria primordial constroem as primeiras sementes pesadas.',birthSymbols:Object.freeze(['H','He','Li']),productionSummary:'C, N e O abrem a forja estelar; estrelas massivas avançam até o grupo do Ferro e a supernova dispersa essas sementes.',members:Object.freeze(expand(first))}),
 second:Object.freeze({id:'second',number:2,title:'Segunda Geração',short:'2ª geração',description:'Estrelas já nascem com metais e podem usar núcleos-semente produzidos anteriormente.',birthSymbols:Object.freeze(['H','He','Li','C','N','O','Ne','Na','Mg','Al','Si','S','Ca','Fe','Co','Ni']),productionSummary:'Espalação produz Be/B; weak-s percorre Cu–Kr; AGB leva o processo-s principal até Bi; supernovas enriquecidas abrem o processo γ.',members:Object.freeze(expand(second))}),
 third:Object.freeze({id:'third',number:3,title:'Terceira Geração',short:'3ª geração',description:'Um Universo já enriquecido sustenta sistemas compactos e reciclagem nuclear extrema.',birthSymbols:Object.freeze(['H','He','Li','C','N','O','Fe','Cu','Zn','Kr','Sr','Ba','Pb','Bi']),productionSummary:'Binários compactos e Kilonova abrem o processo-r até U; cadeias radioativas e o rp-process mostram novas rotas para matéria já conhecida.',members:Object.freeze(expand(third))})
});
const membership=new Map();for(const d of Object.values(defs))for(const id of d.members)if(!membership.has(id))membership.set(id,d.id);
const transitions=new Set(['first_enrichment','second_birth','second_enrichment','third_birth']);
const modelNote='As gerações representam etapas pedagógicas de enriquecimento químico; na natureza, populações estelares e processos podem se sobrepor.';
const api=Object.freeze({
 defs,
 order:Object.freeze(['first','second','third']),
 modelNote,
 generationOf:id=>membership.get(id)||null,
 birthComposition:key=>Object.freeze([...(defs[key]?.birthSymbols||[])]),
 roleOf:id=>remnants.has(id)?'remnant':transitions.has(id)?'inheritance':'production'
});
window.ARDUA_GENERATIONS=api;
})();
