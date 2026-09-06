/* Ardua — generations describe inherited birth composition; phase membership describes where a production route is first taught. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;if(!G)return;
const expand=ids=>ids.flatMap(id=>G.atlas.filter(a=>a.anchor===id).map(a=>a.id).concat(id));
const uniq=xs=>[...new Set(xs.filter(Boolean))];
const seq=name=>G.sequences?.[name]||[];
const prologue=uniq(['bigbang','primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td',...seq('atomic')]);
const first=uniq([...seq('brown'),...seq('red'),...seq('mid'),...seq('high'),...seq('weakS'),...seq('collapse'),...seq('supernovaSide'),'white','neutron_star','first_enrichment']);
const second=uniq(['second_birth',...seq('interstellar'),...seq('sprocess'),'binary_neutron_stars','kilonova',...seq('r'),...seq('decay'),'second_enrichment']);
const third=uniq(['third_birth','pulsar','accretion',...seq('rp'),'black_hole','quasar']);
const defs=Object.freeze({
 prologue:Object.freeze({id:'prologue',title:'Universo Primordial',short:'Prólogo',description:'A matéria-prima cósmica surge antes das estrelas.',birthSymbols:Object.freeze([]),productionSummary:'H, He e Li surgem antes das gerações estelares.',members:Object.freeze(expand(prologue))}),
 first:Object.freeze({id:'first',number:1,title:'Primeira Geração',short:'1ª geração',description:'Primeiras estrelas: a geração é definida pelo material com que nasce, enquanto as fases mostram o que ela passa a fabricar.',birthSymbols:Object.freeze(['H','He','Li']),productionSummary:'Primeiras rotas para C, N e O; forja até o grupo do Ferro; processo-s fraco alcançando Cu–Kr.',members:Object.freeze(expand(first))}),
 second:Object.freeze({id:'second',number:2,title:'Segunda Geração',short:'2ª geração',description:'Nasce de gás já enriquecido pelos produtos da Primeira Geração.',birthSymbols:Object.freeze(['H','He','Li','C','N','O','Ne','Na','Mg','Al','Si','S','Ca','Fe','Cu','Zn','Kr']),productionSummary:'Espalação produz Be/B; estrelas AGB ampliam o processo-s; Kilonova abre o processo-r até os actinídeos.',members:Object.freeze(expand(second))}),
 third:Object.freeze({id:'third',number:3,title:'Terceira Geração',short:'3ª geração',description:'Nasce depois de múltiplos ciclos, já incorporando produtos das gerações anteriores.',birthSymbols:Object.freeze(['H','He','Li','C','N','O','Ne','Mg','Si','Fe','Sr','Ba','Pb','Eu','Pt','Au','Th','U']),productionSummary:'Ambientes compactos exploram novas rotas, como o rp-process; vários elementos conhecidos passam a ter outra origem possível.',members:Object.freeze(expand(third))})
});
const membership=new Map();for(const d of Object.values(defs))for(const id of d.members)if(!membership.has(id))membership.set(id,d.id);
const transitions=new Set(['first_enrichment','second_birth','second_enrichment','third_birth']);
const api=Object.freeze({
 defs,
 order:Object.freeze(['first','second','third']),
 generationOf:id=>membership.get(id)||null,
 birthComposition:key=>Object.freeze([...(defs[key]?.birthSymbols||[])]),
 roleOf:id=>transitions.has(id)?'inheritance':'production'
});
window.ARDUA_GENERATIONS=api;
})();
