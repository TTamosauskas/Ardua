/* Ardua — linear primordial preamble and first-generation gate. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;
if(!G?.prerequisites||!G?.sequences)return;

window.ARDUA_PREAMBLE_ORIGINALS={
 primordialLeft:[...(G.sequences.primordialLeft||[])],
 primordialRight:[...(G.sequences.primordialRight||[])],
 brown:[...(G.sequences.brown||[])]
};

G.prerequisites.primordial_t={allOf:['primordial_d']};
G.prerequisites.primordial_he3={allOf:['primordial_t']};
G.prerequisites.primordial_he3d={allOf:['primordial_he3']};
G.prerequisites.primordial_td={allOf:['primordial_he3d']};
G.prerequisites.primordial_li={allOf:['primordial_td']};

G.prerequisites.brown_formation={allOf:['first_nebulae']};
G.prerequisites.brown={allOf:['brown_formation']};
G.prerequisites.first_generation_formation={allOf:['brown']};
G.prerequisites.low_mass_formation={allOf:['first_generation_formation']};
G.prerequisites.intermediate_mass_formation={allOf:['first_generation_formation']};
G.prerequisites.high_mass_formation={allOf:['first_generation_formation']};

window.ARDUA_PREPARE_PREAMBLE_MAP=()=>{
 G.sequences.primordialLeft=[];
 G.sequences.primordialRight=[];
 G.sequences.brown=[];
};
})();
