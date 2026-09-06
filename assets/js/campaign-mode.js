/* Ardua — graph-aware campaign/editor access layer. Loaded before the engine. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH,GEN=window.ARDUA_GENERATIONS;
const SAVE_KEY='stellarForgeV1013';
const MAP_KEY='arduaCampaignGraphV1';
const EDITOR_MODE=window.location.hash.slice(1).toLowerCase()==='editor';
const nativeGet=Storage.prototype.getItem;
const nativeSet=Storage.prototype.setItem;
const FIRST_GENERATION_PRODUCTS=['C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni'];
const SECOND_GENERATION_PRODUCTS=['Be','B','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Pb','Bi'];
const FIRST_SEEDS=FIRST_GENERATION_PRODUCTS;
const SECOND_SEEDS=[...FIRST_GENERATION_PRODUCTS,...SECOND_GENERATION_PRODUCTS];
const R_PROCESS_EVIDENCE=['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir','pt','au','hg','tl','th','u','decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at'];
const SECOND_CHAPTER_EVIDENCE=['spallation_be','spallation','weak_s_cu','weak_s_zn','weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br','weak_s_kr','rb','sr','y','zr','nb','gamma_mo','tc','gamma_ru','gamma_process','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm','pb','bi'];
const THIRD_CHAPTER_EVIDENCE=['binary_neutron_stars','kilonova',...R_PROCESS_EVIDENCE,'pulsar','accretion','rp_cu','rp_zn','rp_ga','rp_ge','rp_as','rp_se','rp_br','rp_kr','rp_rb','rp_sr','rp_y','rp_zr','rp_nb','rp_mo','rp_tc','rp_ru','rp_rh','rp_pd','rp_ag','rp_cd','rp_in','rp_sn','rp_sb','rp_te','stability'];
function parse(raw){try{return raw?JSON.parse(raw):null}catch(e){return null}}
function uniq(xs){return [...new Set((xs||[]).filter(Boolean))]}
function heritageDefaults(){return{level:0,seeds:[],sourceGeneration:0}}
function defaults(){return{version:7,introduced:false,activeId:'bigbang',completed:[],generation:0,heritage:heritageDefaults()}}
function evidenceSet(completed,activeId){return new Set([...completed,activeId].filter(Boolean))}
function expectedSeeds(level){return level>=2?SECOND_SEEDS:level>=1?FIRST_SEEDS:[]}
function applyHeritage(next,level){
 const target=Math.max(Number(next.heritage?.level||0),level),seeds=expectedSeeds(target);
 next.heritage={...heritageDefaults(),...(next.heritage||{}),level:target,sourceGeneration:Math.max(Number(next.heritage?.sourceGeneration||0),target),seeds:uniq([...(next.heritage?.seeds||[]),...seeds])};
}
function normalizeState(rawState,inferHistorical=false){
 const x=rawState||{},completed=uniq(x.completed||[]),previousVersion=Number(x.version||0),next={...defaults(),...x,version:7,completed,generation:Number(x.generation||0),heritage:{...heritageDefaults(),...(x.heritage||{}),seeds:uniq(x.heritage?.seeds||[])}};
 const seen=evidenceSet(next.completed,next.activeId);
 if(previousVersion<7&&['brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o','carbon_burn','ne','fe','final_collapse','first_enrichment','second_birth','second_enrichment','third_birth','neutron_star','black_hole'].some(id=>seen.has(id)))next.completed=uniq([...next.completed,'first_generation_formation']);
 if(inferHistorical||previousVersion<3){
   const secondEvidence=['final_collapse','nu_f','gamma_process','neutron_star','rb','sr','bi','spallation_be','spallation','eu','u','decay_at','pulsar','accretion','rp_cu','rp_te','stability','black_hole','quasar'].some(id=>seen.has(id));
   const thirdEvidence=['bi','u','decay_at','pulsar','accretion','rp_cu','rp_te','stability','black_hole','quasar'].some(id=>seen.has(id));
   if(secondEvidence){next.completed=uniq([...next.completed,'first_enrichment','second_birth']);next.generation=Math.max(next.generation,2);applyHeritage(next,1)}
   if(thirdEvidence){next.completed=uniq([...next.completed,'second_enrichment','third_birth']);next.generation=Math.max(next.generation,3);applyHeritage(next,2)}
 }
 // Version 4 promoted the former structural labels "binary system" and "kilonova"
 // to real phases. Any save that already reached the r-process passes them automatically.
 if(previousVersion<4&&R_PROCESS_EVIDENCE.some(id=>seen.has(id))){
   next.completed=uniq([...next.completed,'binary_neutron_stars','kilonova']);
 }
 // Version 6 moves weak-s/gamma to the second enrichment chapter and Kilonova/r-process
 // to the third. Preserve players already inside those routes by backfilling the new gates.
 if(previousVersion<6&&SECOND_CHAPTER_EVIDENCE.some(id=>seen.has(id))){
   next.completed=uniq([...next.completed,'first_enrichment','second_birth']);next.generation=Math.max(next.generation,2);applyHeritage(next,1);
 }
 if(previousVersion<6&&THIRD_CHAPTER_EVIDENCE.some(id=>seen.has(id))){
   next.completed=uniq([...next.completed,'first_enrichment','second_birth','second_enrichment','third_birth']);next.generation=Math.max(next.generation,3);applyHeritage(next,2);
 }
 if(next.completed.includes('first_enrichment'))applyHeritage(next,1);
 if(next.completed.includes('second_birth'))next.generation=Math.max(next.generation,2);
 if(next.completed.includes('second_enrichment'))applyHeritage(next,2);
 if(next.completed.includes('third_birth'))next.generation=Math.max(next.generation,3);
 // v5 included r-process products in the inherited third-generation seed list. Rebuild
 // that metadata so Third Generation starts with first+second chapter products only.
 if(previousVersion<6){const level=Number(next.heritage?.level||0);next.heritage={...next.heritage,seeds:uniq(expectedSeeds(level)),sourceGeneration:Math.max(Number(next.heritage?.sourceGeneration||0),level)}}
 return next;
}
function legacyMigration(){
 const raw=nativeGet.call(localStorage,MAP_KEY);if(raw){const parsed=parse(raw)||defaults(),next=normalizeState(parsed,Number(parsed.version||0)<3);if(!EDITOR_MODE)nativeSet.call(localStorage,MAP_KEY,JSON.stringify(next));return next}
 const legacy=parse(nativeGet.call(localStorage,SAVE_KEY));if(!legacy)return defaults();
 const max=Number.isInteger(legacy.maxUnlockedPhaseIndex)?legacy.maxUnlockedPhaseIndex:(Number.isInteger(legacy.campaignPhaseIndex)?legacy.campaignPhaseIndex:(legacy.phaseIndex||0));
 const completed=G?G.runtimeOrder.slice(0,Math.max(0,max)).filter(id=>G.baseIndex[id]!==undefined):[];
 const active=(G&&G.runtimeOrder[Math.max(0,Math.min(G.runtimeOrder.length-1,max))])||'bigbang';
 const next=normalizeState({...defaults(),version:0,introduced:max>0,activeId:active,completed},true);
 if(!EDITOR_MODE)nativeSet.call(localStorage,MAP_KEY,JSON.stringify(next));return next;
}
let graphState=legacyMigration();
function saveGraph(){if(!EDITOR_MODE)nativeSet.call(localStorage,MAP_KEY,JSON.stringify(graphState))}
function state(){return{...graphState,completed:[...graphState.completed],heritage:{...graphState.heritage,seeds:[...(graphState.heritage?.seeds||[])]}}}
function completedSet(){return new Set(graphState.completed)}
function isUnlocked(id){
 if(EDITOR_MODE)return true;if(id==='bigbang')return true;
 const done=completedSet(),rule=G?.prerequisites?.[id];if(!rule)return false;
 if(rule.allOf&&rule.allOf.some(x=>!done.has(x)))return false;
 if(rule.anyOf&&rule.anyOf.length&&!rule.anyOf.some(group=>group.every(x=>done.has(x))))return false;
 return true;
}
function applyMilestone(id){
 if(id==='first_enrichment')applyHeritage(graphState,1);
 if(id==='second_birth')graphState.generation=Math.max(graphState.generation,2);
 if(id==='second_enrichment')applyHeritage(graphState,2);
 if(id==='third_birth')graphState.generation=Math.max(graphState.generation,3);
}
function markCompleted(id){if(!id)return;graphState.completed=uniq([...graphState.completed,id]);if(id==='bigbang')graphState.introduced=true;applyMilestone(id);saveGraph();window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:state()}}))}
function setActive(id){if(!id)return;graphState.activeId=id;const key=GEN?.generationOf?.(id),n=key==='first'?1:key==='second'?2:key==='third'?3:0;if(n)graphState.generation=Math.max(graphState.generation,n);saveGraph()}
function setIntroduced(v=true){graphState.introduced=!!v;saveGraph()}
window.ARDUA_CAMPAIGN={editor:EDITOR_MODE,getState:state,isUnlocked,markCompleted,setActive,setIntroduced,runtimeIndex:id=>G?.runtimeIndex?.[id]??-1};

Storage.prototype.getItem=function(key){
 const raw=nativeGet.call(this,key);if(this!==localStorage||key!==SAVE_KEY||!raw)return raw;const data=parse(raw);if(!data)return raw;
 const idx=G?.runtimeIndex?.[graphState.activeId];return JSON.stringify({...data,phaseIndex:Number.isInteger(idx)?idx:(data.phaseIndex||0)});
};
Storage.prototype.setItem=function(key,value){
 if(this!==localStorage||key!==SAVE_KEY)return nativeSet.call(this,key,value);const incoming=parse(value);if(!incoming)return nativeSet.call(this,key,value);if(EDITOR_MODE)return;
 const activeIndex=G?.runtimeIndex?.[graphState.activeId],previous=parse(nativeGet.call(localStorage,SAVE_KEY))||{};
 nativeSet.call(this,key,JSON.stringify({...incoming,campaignPhaseIndex:Number.isInteger(activeIndex)?activeIndex:(previous.campaignPhaseIndex||0),maxUnlockedPhaseIndex:previous.maxUnlockedPhaseIndex||0}));
};
window.addEventListener('hashchange',()=>window.location.reload());
})();
