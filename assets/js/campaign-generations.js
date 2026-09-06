/* Ardua — generation metadata layered over the canonical campaign graph. */
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
 prologue:Object.freeze({id:'prologue',title:'Universo Primordial',short:'Prólogo',description:'A matéria-prima cósmica surge antes das estrelas.',members:Object.freeze(expand(prologue))}),
 first:Object.freeze({id:'first',number:1,title:'Primeira Geração',short:'1ª geração',description:'Primeiras estrelas formadas a partir da matéria primordial.',members:Object.freeze(expand(first))}),
 second:Object.freeze({id:'second',number:2,title:'Segunda Geração',short:'2ª geração',description:'Estrelas e ambientes formados de matéria enriquecida pela primeira geração.',members:Object.freeze(expand(second))}),
 third:Object.freeze({id:'third',number:3,title:'Terceira Geração',short:'3ª geração',description:'Sistemas formados depois de múltiplos ciclos de enriquecimento químico.',members:Object.freeze(expand(third))})
});
const membership=new Map();for(const d of Object.values(defs))for(const id of d.members)if(!membership.has(id))membership.set(id,d.id);
const api=Object.freeze({defs,order:Object.freeze(['first','second','third']),generationOf:id=>membership.get(id)||null});
window.ARDUA_GENERATIONS=api;
})();
