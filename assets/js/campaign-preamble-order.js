/* Ardua — linear primordial preamble and first-generation gate. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;
if(!G?.prerequisites||!G?.sequences)return;

// Preserve the original map-oriented branch sequences so later modules can still inspect them.
window.ARDUA_PREAMBLE_ORIGINALS={
 primordialLeft:[...(G.sequences.primordialLeft||[])],
 primordialRight:[...(G.sequences.primordialRight||[])],
 brown:[...(G.sequences.brown||[])]
};

// Campaign progression becomes linear through the primordial chapter.
G.prerequisites.primordial_t={allOf:['primordial_d']};
G.prerequisites.primordial_he3={allOf:['primordial_t']};
G.prerequisites.primordial_he3d={allOf:['primordial_he3']};
G.prerequisites.primordial_td={allOf:['primordial_he3d']};
G.prerequisites.primordial_li={allOf:['primordial_td']};

// Brown-dwarf material is now the final part of the primordial-gas prologue.
G.prerequisites.brown_formation={allOf:['first_nebulae']};
G.prerequisites.brown={allOf:['brown_formation']};
G.prerequisites.first_generation_formation={allOf:['brown']};
G.prerequisites.low_mass_formation={allOf:['first_generation_formation']};
G.prerequisites.intermediate_mass_formation={allOf:['first_generation_formation']};
G.prerequisites.high_mass_formation={allOf:['first_generation_formation']};

// During campaign-map construction these empty sequences suppress the two obsolete forks.
// The visual re-layout module restores the canonical arrays immediately after map creation.
G.sequences.primordialLeft=[];
G.sequences.primordialRight=[];
G.sequences.brown=[];
})();
